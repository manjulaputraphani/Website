/* Signing, hashing and Turnstile verification. */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function signingSecret(env) {
  const configured = env && env.CHAT_SESSION_SECRET ? String(env.CHAT_SESSION_SECRET) : "";
  if (configured.length >= 24) return configured;
  if (env && env.ALLOW_UNVERIFIED_CHAT === "true") {
    return "chamundi-local-development-secret-do-not-use-in-production-2026";
  }
  return null;
}

export function requireSigningSecret(env) {
  const secret = signingSecret(env);
  if (!secret) {
    throw new Error("CHAT_SESSION_SECRET is not configured");
  }
  return secret;
}

export function base64UrlEncodeBytes(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64UrlEncodeString(value) {
  return base64UrlEncodeBytes(encoder.encode(value));
}

export function base64UrlDecodeToString(value) {
  let input = String(value).replace(/-/g, "+").replace(/_/g, "/");
  while (input.length % 4) input += "=";
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return decoder.decode(bytes);
}

export function timingSafeEqual(left, right) {
  const a = String(left);
  const b = String(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return difference === 0;
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return new Uint8Array(signature);
}

export async function signPayload(payload, env) {
  const secret = requireSigningSecret(env);
  const body = base64UrlEncodeString(JSON.stringify(payload));
  const signature = base64UrlEncodeBytes(await hmac(secret, body));
  return `${body}.${signature}`;
}

export async function verifyPayload(token, env) {
  const secret = signingSecret(env);
  if (!secret || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  if (!body || !signature) return null;
  const expected = base64UrlEncodeBytes(await hmac(secret, body));
  if (!timingSafeEqual(signature, expected)) return null;
  try {
    const payload = JSON.parse(base64UrlDecodeToString(body));
    if (!payload || typeof payload !== "object") return null;
    if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function signSessionPass(sessionId, env, ttlSeconds = 60 * 60 * 12) {
  return signPayload(
    {
      v: 1,
      sid: sessionId,
      exp: Math.floor(Date.now() / 1000) + ttlSeconds
    },
    env
  );
}

export async function verifySessionPass(pass, sessionId, env) {
  const payload = await verifyPayload(pass, env);
  if (!payload || payload.v !== 1 || payload.sid !== sessionId) return null;
  return payload;
}

export async function signLeadToken(payload, env, ttlSeconds = 60 * 60 * 2) {
  return signPayload(
    {
      ...payload,
      v: 1,
      exp: Math.floor(Date.now() / 1000) + ttlSeconds
    },
    env
  );
}

export async function verifyLeadToken(token, env) {
  const payload = await verifyPayload(token, env);
  if (!payload || payload.v !== 1) return null;
  if (typeof payload.sid !== "string" || !payload.sid) return null;
  if (!payload.lead || typeof payload.lead !== "object") return null;
  if (typeof payload.id !== "string" || !payload.id) return null;
  return payload;
}

export async function hashIp(ip, env) {
  const secret = (env && env.CHAT_SESSION_SECRET) || "chamundi-rate-limit";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`${ip}|${secret}`)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function verifyTurnstile(token, ip, env) {
  if (!env || !env.TURNSTILE_SECRET_KEY) return false;
  if (!token || typeof token !== "string") return false;

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
    remoteip: ip
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: controller.signal
    });
    if (!response.ok) {
      console.error("Turnstile siteverify HTTP error", response.status);
      return false;
    }
    const result = await response.json();
    if (result.success !== true) {
      console.warn("Turnstile rejected a token", Array.isArray(result["error-codes"]) ? result["error-codes"] : []);
      return false;
    }
    const expectedAction = env.TURNSTILE_EXPECTED_ACTION || "chamundi";
    if (result.action && result.action !== expectedAction) return false;
    if (env.TURNSTILE_EXPECTED_HOSTNAME && result.hostname && result.hostname !== env.TURNSTILE_EXPECTED_HOSTNAME) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Turnstile verification failed", error && error.message ? error.message : error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
