/* Small validators shared by the chat and lead endpoints. */

export function isValidEmailAddress(value) {
  const email = String(value || "").trim();
  if (!email || email.length > 254) return false;
  if (/[\r\n]/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isValidSessionId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(value);
}
