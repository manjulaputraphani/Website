/* POST /api/chat — authenticated, rate-limited Claude streaming with save_lead tool use. */

import {
  HttpError,
  clientIp,
  corsHeaders,
  errorResponse,
  jsonResponse,
  originIsAllowed,
  preflight,
  readJson
} from "../_lib/http.js";
import {
  hashIp,
  signLeadToken,
  signSessionPass,
  signingSecret,
  verifySessionPass,
  verifyTurnstile
} from "../_lib/security.js";
import { checkChatRateLimit } from "../_lib/rate-limit.js";
import { leadIdFor, mergeDraft, missingFields, sanitizeDraft, validateLead } from "../_lib/leads.js";
import { LEAD_TOOL, buildSystemPrompt } from "../_lib/knowledge.js";
import { isValidSessionId } from "../_lib/validate.js";

const encoder = new TextEncoder();

class ClaudeServiceError extends Error {
  constructor(code, message, status = 503) {
    super(message);
    this.name = "ClaudeServiceError";
    this.code = code;
    this.status = status;
  }
}

export async function onRequestOptions(context) {
  return preflight(context.request, context.env);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!originIsAllowed(request, env)) {
    return jsonResponse(
      { ok: false, error: "origin_not_allowed", message: "This origin is not allowed to use the chat." },
      403,
      request,
      env
    );
  }

  try {
    if (!signingSecret(env)) {
      return jsonResponse(
        { ok: false, error: "not_configured", message: "Chat signing is not configured." },
        503,
        request,
        env
      );
    }

    const body = await readJson(request, 64 * 1024);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new HttpError("invalid_request", "Request body must be a JSON object.", 400);
    }

    if (!isValidSessionId(body.sessionId)) {
      throw new HttpError("invalid_session", "A valid chat session is required.", 400);
    }

    const sessionId = body.sessionId;
    const messages = sanitizeMessages(body.messages);
    const ip = clientIp(request);
    const ipHash = await hashIp(ip, env);

    let verification = null;
    if (typeof body.sessionPass === "string" && body.sessionPass) {
      verification = await verifySessionPass(body.sessionPass, sessionId, env);
    }

    if (!verification) {
      const turnstileToken = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
      if (!turnstileToken) {
        if (env.ALLOW_UNVERIFIED_CHAT === "true" && !env.TURNSTILE_SECRET_KEY) {
          verification = { sid: sessionId };
        } else {
          return jsonResponse(
            {
              ok: false,
              error: "verification_required",
              message: "Please complete the verification before sending a message."
            },
            403,
            request,
            env
          );
        }
      } else {
        if (!env.TURNSTILE_SECRET_KEY) {
          return jsonResponse(
            {
              ok: false,
              error: "verification_not_configured",
              message: "Chat verification is not configured yet."
            },
            503,
            request,
            env
          );
        }
        const passed = await verifyTurnstile(turnstileToken, ip, env);
        if (!passed) {
          return jsonResponse(
            {
              ok: false,
              error: "verification_failed",
              message: "Verification did not pass. Please try again."
            },
            403,
            request,
            env
          );
        }
        verification = { sid: sessionId };
      }
    }

    try {
      const limit = await checkChatRateLimit(env, sessionId, ipHash);
      if (!limit.ok) {
        return jsonResponse(
          { ok: false, error: limit.code, message: limit.message },
          429,
          request,
          env,
          { "Retry-After": "3600" }
        );
      }
    } catch (error) {
      console.error("Chat rate limit unavailable", error && error.message ? error.message : error);
      return jsonResponse(
        {
          ok: false,
          error: "rate_limit_unavailable",
          message: "Chat is temporarily unavailable. Please use the enquiry form."
        },
        503,
        request,
        env
      );
    }

    const draft = await loadDraft(env, sessionId);
    const sessionPass = await signSessionPass(sessionId, env);

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const sse = createSseWriter(writer);

    const task = runChatStream({
      env,
      sse,
      sessionId,
      messages,
      draft,
      sessionPass
    });

    if (typeof context.waitUntil === "function") {
      context.waitUntil(task.catch((error) => console.error("Chat stream task failed", error)));
    } else {
      task.catch((error) => console.error("Chat stream task failed", error));
    }

    return new Response(readable, {
      status: 200,
      headers: {
        ...corsHeaders(request, env),
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no"
      }
    });
  } catch (error) {
    return errorResponse(error, request, env);
  }
}

function sanitizeMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new HttpError("invalid_messages", "At least one message is required.", 400);
  }

  const cleaned = [];
  raw.slice(-12).forEach((item) => {
    if (!item || typeof item !== "object") {
      throw new HttpError("invalid_messages", "Each message must be an object.", 400);
    }
    if (item.role !== "user" && item.role !== "assistant") {
      throw new HttpError("invalid_messages", "Only user and assistant messages are accepted.", 400);
    }
    if (typeof item.content !== "string") {
      throw new HttpError("invalid_messages", "Message content must be text.", 400);
    }
    const content = item.content.trim();
    if (!content) return;
    if (content.length > 4000) {
      throw new HttpError("message_too_long", "A message is too long.", 413);
    }
    if (cleaned.length && cleaned[cleaned.length - 1].role === item.role) {
      const previous = cleaned[cleaned.length - 1];
      previous.content = `${previous.content}\n\n${content}`.slice(0, 6000);
    } else {
      cleaned.push({ role: item.role, content });
    }
  });

  while (cleaned.length && cleaned[0].role !== "user") {
    cleaned.shift();
  }

  if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") {
    throw new HttpError("invalid_messages", "The last message must be from the visitor.", 400);
  }

  const total = cleaned.reduce((sum, message) => sum + message.content.length, 0);
  if (total > 24000) {
    throw new HttpError("conversation_too_long", "Conversation is too long for one request.", 413);
  }

  return cleaned;
}

async function loadDraft(env, sessionId) {
  let row;
  try {
    row = await env.DB.prepare(
      "SELECT lead_json FROM chat_sessions WHERE session_id = ?"
    )
      .bind(sessionId)
      .first();
  } catch (error) {
    console.error("Could not load chat draft", error && error.message ? error.message : error);
    throw new HttpError("session_unavailable", "The chat session could not be loaded.", 503);
  }
  if (!row || !row.lead_json) return {};
  try {
    return sanitizeDraft(JSON.parse(row.lead_json));
  } catch (error) {
    console.warn("Ignoring corrupt chat draft", error && error.message ? error.message : error);
    return {};
  }
}

async function saveDraft(env, sessionId, draft) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO chat_sessions (session_id, lead_json, created_at, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(session_id) DO UPDATE SET
       lead_json = excluded.lead_json,
       updated_at = excluded.updated_at`
  )
    .bind(sessionId, JSON.stringify(draft), now, now)
    .run();
}

function createSseWriter(writer) {
  let closed = false;
  return {
    async send(event, data) {
      if (closed) return;
      try {
        await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      } catch (error) {
        closed = true;
        throw error;
      }
    },
    async close() {
      if (closed) return;
      closed = true;
      try {
        await writer.close();
      } catch (error) {
        /* The client may have disconnected. */
      }
    }
  };
}

async function runChatStream({ env, sse, sessionId, messages, draft, sessionPass }) {
  let currentDraft = draft;
  let summaryReady = false;

  try {
    await sse.send("meta", { sessionPass });

    const result = await callClaude({
      env,
      messages,
      draft: currentDraft,
      sessionId,
      sse,
      onDraftChange: (nextDraft) => {
        currentDraft = nextDraft;
      },
      onSummary: () => {
        summaryReady = true;
      }
    });

    if (summaryReady && !result.lastRoundHadText) {
      await sse.send("text", {
        delta: "Please review the summary below, tick consent and press Confirm and send."
      });
    }

    if (!result.anyText && !summaryReady) {
      await sse.send("text", {
        delta: "I could not complete that reply. Please try again, or use the enquiry form to reach the trade desk."
      });
    }

    await sse.send("done", { ok: true });
  } catch (error) {
    const code = error && error.code ? error.code : "chat_error";
    console.error("Chamundi chat error", code, error && error.message ? error.message : error);
    const message =
      error instanceof ClaudeServiceError
        ? "The assistant is temporarily unavailable. Please try again or use the enquiry form."
        : "The reply was interrupted. Please try again or use the enquiry form.";
    try {
      await sse.send("error", { code, message });
    } catch (sendError) {
      /* Client disconnected. */
    }
  } finally {
    await sse.close();
  }
}

async function callClaude({
  env,
  messages,
  draft,
  sessionId,
  sse,
  onDraftChange,
  onSummary
}) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new ClaudeServiceError("ai_not_configured", "ANTHROPIC_API_KEY is not configured.");
  }

  const model = env.ANTHROPIC_MODEL || "claude-haiku-4-5";
  let currentDraft = draft;
  let claudeMessages = messages;
  let system = buildSystemPrompt(currentDraft, missingFields(currentDraft));
  let anyText = false;
  let lastRoundHadText = false;

  for (let round = 0; round < 2; round += 1) {
    let roundHadText = false;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        temperature: 0.3,
        system,
        messages: claudeMessages,
        stream: true,
        ...(round === 0 ? { tools: [LEAD_TOOL] } : {})
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Anthropic API error", response.status, detail.slice(0, 700));
      if (response.status === 401 || response.status === 403) {
        throw new ClaudeServiceError("ai_auth_error", "The assistant credentials were rejected.", 502);
      }
      if (response.status === 429) {
        throw new ClaudeServiceError("ai_rate_limited", "The assistant is busy.", 503);
      }
      throw new ClaudeServiceError("ai_unavailable", "The assistant is unavailable.", 503);
    }

    const parsed = await parseClaudeStream(response, async (delta) => {
      anyText = true;
      roundHadText = true;
      await sse.send("text", { delta });
    });

    lastRoundHadText = roundHadText;

    const toolUses = parsed.toolUses;
    if (!toolUses.length) break;

    claudeMessages = claudeMessages.concat([
      { role: "assistant", content: parsed.assistantContent }
    ]);

    const toolResults = [];

    for (const tool of toolUses) {
      if (!tool || tool.name !== "save_lead") {
        toolResults.push({
          type: "tool_result",
          tool_use_id: tool && tool.id ? tool.id : "unknown",
          content: JSON.stringify({ status: "error", message: "Unknown tool." }),
          is_error: true
        });
        continue;
      }

      const incoming = sanitizeDraft(tool.input || {}, { keepEmpty: true });
      const merged = mergeDraft(currentDraft, incoming);
      const missing = missingFields(merged);
      const validation = validateLead(merged);

      try {
        await saveDraft(env, sessionId, merged);
      } catch (error) {
        console.error("Could not save lead draft", error && error.message ? error.message : error);
        toolResults.push({
          type: "tool_result",
          tool_use_id: tool.id,
          content: JSON.stringify({
            status: "storage_error",
            message: "The draft could not be stored. Continue the conversation and ask the visitor to try again."
          }),
          is_error: true
        });
        continue;
      }

      currentDraft = merged;
      onDraftChange(currentDraft);

      if (!missing.length) {
        if (!validation.ok) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: tool.id,
            content: JSON.stringify({
              status: "validation_error",
              errors: validation.errors,
              missing_fields: validation.missing,
              message: "Ask the visitor to correct the highlighted fields."
            }),
            is_error: true
          });
        } else {
          const id = await leadIdFor(sessionId, currentDraft);
          const token = await signLeadToken(
            { sid: sessionId, lead: currentDraft, id },
            env
          );
          await sse.send("lead_draft", {
            draft: currentDraft,
            token,
            leadId: id
          });
          onSummary();
          toolResults.push({
            type: "tool_result",
            tool_use_id: tool.id,
            content: JSON.stringify({
              status: "summary_ready",
              missing_fields: [],
              next_field: null,
              message:
                "The summary card is now visible in the website. Ask the visitor to review it, tick consent and press Confirm and send. Do not claim it is submitted."
            })
          });
        }
      } else {
        toolResults.push({
          type: "tool_result",
          tool_use_id: tool.id,
          content: JSON.stringify({
            status: "draft_saved",
            draft: currentDraft,
            missing_fields: missing,
            next_field: missing[0],
            message: "Ask only for the next missing field. Do not re-ask known fields."
          })
        });
      }
    }

    claudeMessages = claudeMessages.concat([{ role: "user", content: toolResults }]);
    system = buildSystemPrompt(currentDraft, missingFields(currentDraft));

    if (round === 1) break;
  }

  return { anyText, lastRoundHadText };
}

async function parseClaudeStream(response, onText) {
  if (!response.body) throw new ClaudeServiceError("ai_stream_missing", "No response stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "";
  let dataLines = [];
  let stopReason = "end_turn";
  const blocks = [];

  async function handleData(data) {
    let event;
    try {
      event = JSON.parse(data);
    } catch (error) {
      return;
    }

    if (!event || typeof event.type !== "string") return;

    if (event.type === "content_block_start") {
      const block = event.content_block || {};
      if (block.type === "text") {
        blocks[event.index] = { type: "text", text: block.text || "" };
        if (block.text) await onText(block.text);
      } else if (block.type === "tool_use") {
        blocks[event.index] = {
          type: "tool_use",
          id: block.id,
          name: block.name,
          inputJson: "",
          initialInput: block.input && typeof block.input === "object" ? block.input : {}
        };
      }
      return;
    }

    if (event.type === "content_block_delta") {
      const block = blocks[event.index];
      if (!block || !event.delta) return;
      if (event.delta.type === "text_delta") {
        block.text = (block.text || "") + (event.delta.text || "");
        if (event.delta.text) await onText(event.delta.text);
      } else if (event.delta.type === "input_json_delta") {
        block.inputJson = (block.inputJson || "") + (event.delta.partial_json || "");
      }
      return;
    }

    if (event.type === "message_delta" && event.delta && event.delta.stop_reason) {
      stopReason = event.delta.stop_reason;
      return;
    }

    if (event.type === "error") {
      const detail = event.error && event.error.message ? event.error.message : "Anthropic stream error";
      throw new ClaudeServiceError("ai_stream_error", detail, 502);
    }
  }

  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      buffer += decoder.decode(result.value, { stream: true });
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.charAt(line.length - 1) === "\r") line = line.slice(0, -1);
        if (line === "") {
          if (dataLines.length) {
            await handleData(dataLines.join("\n"));
            dataLines = [];
          }
          eventName = "";
          continue;
        }
        if (line.indexOf("event:") === 0) {
          eventName = line.slice(6).trim();
        } else if (line.indexOf("data:") === 0) {
          dataLines.push(line.slice(5).replace(/^ /, ""));
        }
      }
    }
    if (dataLines.length) await handleData(dataLines.join("\n"));
  } finally {
    try {
      await reader.cancel();
    } catch (error) {
      /* Ignore. */
    }
  }

  const ordered = blocks.filter(Boolean);
  const assistantContent = [];
  const toolUses = [];

  ordered.forEach((block) => {
    if (block.type === "text") {
      if (block.text) assistantContent.push({ type: "text", text: block.text });
    } else if (block.type === "tool_use") {
      let input = {};
      try {
        input = block.inputJson ? JSON.parse(block.inputJson) : block.initialInput || {};
      } catch (error) {
        input = block.initialInput || {};
      }
      assistantContent.push({
        type: "tool_use",
        id: block.id,
        name: block.name,
        input
      });
      toolUses.push({ id: block.id, name: block.name, input });
    }
  });

  return { assistantContent, toolUses, stopReason };
}
