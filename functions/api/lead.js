/* POST /api/lead — verify a signed lead draft, save to D1, send Resend alert. */

import {
  HttpError,
  clientIp,
  errorResponse,
  jsonResponse,
  originIsAllowed,
  preflight,
  readJson
} from "../_lib/http.js";
import { hashIp, signingSecret, verifyLeadToken } from "../_lib/security.js";
import { checkLeadRateLimit } from "../_lib/rate-limit.js";
import { saveLead, validateLead } from "../_lib/leads.js";

export async function onRequestOptions(context) {
  return preflight(context.request, context.env);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!originIsAllowed(request, env)) {
    return jsonResponse(
      { ok: false, error: "origin_not_allowed", message: "This origin is not allowed to submit leads." },
      403,
      request,
      env
    );
  }

  try {
    if (!signingSecret(env)) {
      return jsonResponse(
        { ok: false, error: "not_configured", message: "Lead signing is not configured." },
        503,
        request,
        env
      );
    }

    const body = await readJson(request, 16 * 1024);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new HttpError("invalid_request", "Request body must be a JSON object.", 400);
    }

    if (body.consent !== true) {
      throw new HttpError(
        "consent_required",
        "Please confirm consent before sending the enquiry.",
        400
      );
    }

    if (typeof body.token !== "string" || !body.token) {
      throw new HttpError("lead_token_missing", "A lead summary is required.", 400);
    }

    const payload = await verifyLeadToken(body.token, env);
    if (!payload) {
      throw new HttpError(
        "lead_token_invalid",
        "This summary has expired or is invalid. Please ask Chamundi to prepare it again.",
        401
      );
    }

    const validation = validateLead(payload.lead);
    if (!validation.ok) {
      throw new HttpError(
        "invalid_lead",
        "Some enquiry details need correction.",
        400,
        { fields: validation.errors }
      );
    }

    const ip = clientIp(request);
    const ipHash = await hashIp(ip, env);

    try {
      const limit = await checkLeadRateLimit(env, ipHash);
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
      console.error("Lead rate limit unavailable", error && error.message ? error.message : error);
      return jsonResponse(
        {
          ok: false,
          error: "rate_limit_unavailable",
          message: "The enquiry service is temporarily unavailable."
        },
        503,
        request,
        env
      );
    }

    const result = await saveLead(env, validation.lead, {
      id: payload.id,
      sessionId: payload.sid,
      ipHash,
      userAgent: request.headers.get("User-Agent") || ""
    });

    return jsonResponse(
      {
        ok: true,
        id: result.id,
        duplicate: !result.inserted,
        emailSent: result.emailSent
      },
      200,
      request,
      env
    );
  } catch (error) {
    return errorResponse(error, request, env);
  }
}
