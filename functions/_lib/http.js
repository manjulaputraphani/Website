/* Shared HTTP helpers for Chamundi Pages Functions. */

const DEFAULT_ORIGIN = "https://sdhhe.pages.dev";

export class HttpError extends Error {
  constructor(code, message, status = 400, details = null) {
    super(message);
    this.name = "HttpError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function configuredOrigins(env) {
  const raw = (env && env.ALLOWED_ORIGINS) || DEFAULT_ORIGIN;
  return String(raw)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function originIsAllowed(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return configuredOrigins(env).includes(origin);
}

export function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store"
  };
  if (origin && configuredOrigins(env).includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export function preflight(request, env) {
  if (!originIsAllowed(request, env)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

export function jsonResponse(data, status, request, env, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(request, env),
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}

export function errorResponse(error, request, env) {
  if (error instanceof HttpError) {
    return jsonResponse(
      {
        ok: false,
        error: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {})
      },
      error.status,
      request,
      env
    );
  }
  console.error("Unhandled Chamundi API error", error && error.message ? error.message : error);
  return jsonResponse(
    {
      ok: false,
      error: "server_error",
      message: "The service is temporarily unavailable."
    },
    500,
    request,
    env
  );
}

export async function readJson(request, maxBytes = 64 * 1024) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength && contentLength > maxBytes) {
    throw new HttpError("payload_too_large", "Request is too large.", 413);
  }
  const text = await request.text();
  if (!text) throw new HttpError("invalid_json", "Request body is required.", 400);
  if (new TextEncoder().encode(text).length > maxBytes) {
    throw new HttpError("payload_too_large", "Request is too large.", 413);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new HttpError("invalid_json", "Request body must be valid JSON.", 400);
  }
}

export function clientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
