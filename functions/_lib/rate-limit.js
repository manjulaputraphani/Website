/* D1-backed counters. One D1 row per session/day bucket. */

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}

function utcHour() {
  return new Date().toISOString().slice(0, 13);
}

async function bumpCounter(env, bucket, ttlMs, limit) {
  if (!env || !env.DB) {
    throw new Error("D1 binding DB is not configured");
  }
  const now = Date.now();
  const expiresAt = now + ttlMs;
  const row = await env.DB.prepare(
    `INSERT INTO chat_rate_limits (bucket, count, expires_at)
     VALUES (?, 1, ?)
     ON CONFLICT(bucket) DO UPDATE SET
       count = CASE WHEN chat_rate_limits.expires_at <= ? THEN 1 ELSE chat_rate_limits.count + 1 END,
       expires_at = CASE WHEN chat_rate_limits.expires_at <= ? THEN excluded.expires_at ELSE chat_rate_limits.expires_at END
     RETURNING count`
  )
    .bind(bucket, expiresAt, now, now)
    .first();

  const count = Number(row && row.count ? row.count : 1);
  return { ok: count <= limit, count, limit };
}

export async function checkChatRateLimit(env, sessionId, ipHash) {
  const ipResult = await bumpCounter(
    env,
    `ip:${ipHash}:${utcDay()}`,
    2 * DAY_MS,
    100
  );
  if (!ipResult.ok) {
    return {
      ok: false,
      code: "ip_limit",
      message: "This chat has reached today's message limit. Please use the enquiry form or WhatsApp."
    };
  }

  const sessionResult = await bumpCounter(
    env,
    `session:${sessionId}`,
    7 * DAY_MS,
    20
  );
  if (!sessionResult.ok) {
    return {
      ok: false,
      code: "session_limit",
      message: "This chat has reached its 20-message limit. Please use the enquiry form or WhatsApp."
    };
  }

  return {
    ok: true,
    remainingSession: Math.max(0, 20 - sessionResult.count),
    remainingIp: Math.max(0, 100 - ipResult.count)
  };
}

export async function checkLeadRateLimit(env, ipHash) {
  const result = await bumpCounter(
    env,
    `lead:${ipHash}:${utcHour()}`,
    2 * 60 * 60 * 1000,
    12
  );
  if (!result.ok) {
    return {
      ok: false,
      code: "rate_limited",
      message: "Too many enquiries from this connection. Please try again later."
    };
  }
  return { ok: true };
}
