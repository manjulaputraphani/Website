/* Lead validation, D1 persistence and Resend notification. */

import { isValidEmailAddress } from "./validate.js";

export const BUYER_TYPES = ["roaster", "distributor", "cafe", "retailer", "importer", "other"];
export const PRODUCT_FORMS = ["green", "roasted", "ground", "mixed"];

export const REQUIRED_FIELDS = [
  "name",
  "company",
  "email",
  "whatsapp",
  "country",
  "buyer_type",
  "product_form",
  "origin_grade",
  "volume",
  "incoterm_port",
  "timeline"
];

export const ALL_FIELDS = [...REQUIRED_FIELDS, "notes"];

const LIMITS = {
  name: 120,
  company: 160,
  country: 80,
  buyer_type: 40,
  product_form: 40,
  origin_grade: 160,
  volume: 80,
  incoterm_port: 140,
  timeline: 100,
  email: 254,
  whatsapp: 40,
  notes: 2000
};

const BUYER_ALIASES = {
  roaster: "roaster",
  roasters: "roaster",
  "coffee roaster": "roaster",
  distributor: "distributor",
  distributors: "distributor",
  importer: "importer",
  importers: "importer",
  cafe: "cafe",
  "café": "cafe",
  "cafés": "cafe",
  cafes: "cafe",
  "coffee shop": "cafe",
  "coffee bar": "cafe",
  "cafe / coffee bar": "cafe",
  retailer: "retailer",
  retailers: "retailer",
  other: "other"
};

const PRODUCT_ALIASES = {
  green: "green",
  "green coffee": "green",
  "green beans": "green",
  "green bean": "green",
  roasted: "roasted",
  "roasted coffee": "roasted",
  "roasted beans": "roasted",
  "roasted bean": "roasted",
  ground: "ground",
  "ground coffee": "ground",
  mixed: "mixed",
  "green and roasted": "mixed",
  "roasted and green": "mixed"
};

function clean(value, maxLength) {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value)
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeBuyerType(value) {
  const key = clean(value, LIMITS.buyer_type).toLowerCase();
  return BUYER_ALIASES[key] || "";
}

function normalizeProductForm(value) {
  const key = clean(value, LIMITS.product_form).toLowerCase();
  return PRODUCT_ALIASES[key] || "";
}

function normalizeWhatsapp(value) {
  const text = clean(value, LIMITS.whatsapp);
  if (/^(none|no|n\/a|na|not provided|not available|skip|declined|no whatsapp)$/i.test(text)) return "";
  const digits = text.replace(/\D/g, "");
  if (digits.length < 5) return "";
  return text;
}

export function sanitizeDraft(input, options) {
  const source = input && typeof input === "object" ? input : {};
  const keepEmpty = Boolean(options && options.keepEmpty);
  const draft = {};
  ALL_FIELDS.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(source, field)) return;
    if (source[field] === null || source[field] === undefined || source[field] === "") {
      if (keepEmpty) draft[field] = "";
      return;
    }
    let value;
    if (field === "buyer_type") value = normalizeBuyerType(source[field]);
    else if (field === "product_form") value = normalizeProductForm(source[field]);
    else if (field === "whatsapp") value = normalizeWhatsapp(source[field]);
    else if (field === "email") value = clean(source[field], LIMITS.email).toLowerCase();
    else value = clean(source[field], LIMITS[field]);
    if (value) draft[field] = value;
    else if (keepEmpty) draft[field] = "";
  });
  return draft;
}

export function mergeDraft(existing, incoming) {
  const merged = { ...(existing || {}) };
  ALL_FIELDS.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(incoming, field)) return;
    if (incoming[field]) merged[field] = incoming[field];
    else delete merged[field];
  });
  return merged;
}

export function isFieldComplete(field, lead) {
  const value = lead[field];
  if (!value) return false;
  if (field === "email") return isValidEmailAddress(value);
  if (field === "buyer_type") return BUYER_TYPES.includes(value);
  if (field === "product_form") return PRODUCT_FORMS.includes(value);
  return true;
}

export function missingFields(lead) {
  return REQUIRED_FIELDS.filter((field) => !isFieldComplete(field, lead));
}

export function validateLead(input) {
  const lead = sanitizeDraft(input);
  const errors = {};

  REQUIRED_FIELDS.forEach((field) => {
    if (!isFieldComplete(field, lead)) {
      errors[field] =
        field === "email"
          ? "Enter a valid business email address."
          : field === "whatsapp"
            ? "Enter a phone number with country code."
            : "This field is required.";
    }
  });

  if (lead.buyer_type && !BUYER_TYPES.includes(lead.buyer_type)) {
    errors.buyer_type = "Choose a valid buyer type.";
  }
  if (lead.product_form && !PRODUCT_FORMS.includes(lead.product_form)) {
    errors.product_form = "Choose green, roasted, ground or mixed.";
  }
  if (lead.email && !isValidEmailAddress(lead.email)) {
    errors.email = "Enter a valid business email address.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    lead,
    errors,
    missing: missingFields(lead)
  };
}

export async function leadIdFor(sessionId, lead) {
  const canonical = ALL_FIELDS.map((field) => `${field}=${lead[field] || ""}`).join("&");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${sessionId}|${canonical}`)
  );
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `ld_${hex.slice(0, 32)}`;
}

export async function saveLead(env, lead, meta) {
  if (!env || !env.DB) throw new Error("D1 binding DB is not configured");

  const id = meta.id || (await leadIdFor(meta.sessionId || "direct", lead));
  const createdAt = new Date().toISOString();
  const sessionId = meta.sessionId || "";
  const ipHash = meta.ipHash || "";
  const userAgent = (meta.userAgent || "").slice(0, 300).replace(/[\r\n]/g, " ");

  const result = await env.DB.prepare(
    `INSERT OR IGNORE INTO leads
      (id, created_at, name, company, country, buyer_type, product_form,
       origin_grade, volume, incoterm_port, timeline, email, whatsapp, notes,
       consent, source, session_id, ip_hash, user_agent, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      createdAt,
      lead.name,
      lead.company,
      lead.country,
      lead.buyer_type,
      lead.product_form,
      lead.origin_grade,
      lead.volume,
      lead.incoterm_port,
      lead.timeline,
      lead.email,
      lead.whatsapp || "",
      lead.notes || "",
      1,
      "chamundi",
      sessionId,
      ipHash,
      userAgent,
      "new"
    )
    .run();

  const inserted = Number(result.meta && result.meta.changes ? result.meta.changes : 0) > 0;

  let emailSent = false;
  let emailError = null;
  if (inserted) {
    const emailResult = await sendLeadEmail(env, lead, {
      id,
      createdAt,
      sessionId
    });
    emailSent = emailResult.sent;
    emailError = emailResult.error || null;
  }

  if (inserted && sessionId) {
    try {
      await env.DB.prepare("DELETE FROM chat_sessions WHERE session_id = ?").bind(sessionId).run();
    } catch (error) {
      console.warn("Could not clear chat session after lead submission", error && error.message);
    }
  }

  return { id, inserted, emailSent, emailError };
}

function escapeHtml(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emailRecipients(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => isValidEmailAddress(item));
}

function buildEmail(lead, meta) {
  const rows = [
    ["Name", lead.name],
    ["Company", lead.company],
    ["Email", lead.email],
    ["Phone / WhatsApp", lead.whatsapp || "Not provided"],
    ["Country", lead.country],
    ["Buyer type", lead.buyer_type],
    ["Product form", lead.product_form],
    ["Origin / grade", lead.origin_grade],
    ["Volume", lead.volume],
    ["Incoterm / port", lead.incoterm_port],
    ["Timeline", lead.timeline],
    ["Notes", lead.notes || "None"],
    ["Consent", "Yes, consent recorded"],
    ["Lead ID", meta.id],
    ["Source", "Chamundi chat"],
    ["Received", meta.createdAt]
  ];

  const text = [
    "New Chamundi coffee trade lead",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Reply directly to this email to contact the buyer."
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 14px 6px 0;border-bottom:1px solid #ded5c8;font:11px/1.5 'Courier New',monospace;letter-spacing:.06em;text-transform:uppercase;color:#6e5d50;vertical-align:top;white-space:nowrap">${escapeHtml(
          label
        )}</th><td style="padding:6px 0;border-bottom:1px solid #ded5c8;font:14px/1.5 Arial,sans-serif;color:#241710">${escapeHtml(
          value
        )}</td></tr>`
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;background:#f4efe8;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#fffdfa;border:1px solid #cfbca8">
    <div style="background:#2b1a12;color:#f7efe4;padding:20px 24px">
      <div style="font:11px/1.4 'Courier New',monospace;letter-spacing:.12em;text-transform:uppercase;color:#c49a54">Sri Durga HariHara Enterprises</div>
      <h1 style="margin:6px 0 0;font:24px/1.2 Georgia,serif">New Chamundi lead</h1>
    </div>
    <div style="padding:20px 24px">
      <p style="margin:0 0 16px;font:14px/1.6 Arial,sans-serif;color:#49382d">A buyer has confirmed a trade enquiry in the Chamundi website chat. Reply directly to this email to contact them.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">${htmlRows}</table>
    </div>
    <div style="border-top:1px solid #ded5c8;padding:14px 24px;font:11px/1.5 'Courier New',monospace;color:#6e5d50">Chamundi · Coffee trade desk · Bengaluru</div>
  </div>
</body></html>`;

  return { text, html };
}

async function sendLeadEmail(env, lead, meta) {
  if (!env.RESEND_API_KEY || !env.LEAD_EMAIL) {
    return { sent: false, error: "not_configured" };
  }

  const recipients = emailRecipients(env.LEAD_EMAIL);
  if (!recipients.length) {
    return { sent: false, error: "invalid_recipient" };
  }

  const from = env.LEAD_FROM_EMAIL || "Chamundi <onboarding@resend.dev>";
  const subject = `New Chamundi lead — ${lead.company} · ${lead.country}`.replace(/[\r\n]+/g, " ");
  const message = buildEmail(lead, meta);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `lead-${meta.id}`
      },
      body: JSON.stringify({
        from,
        to: recipients,
        reply_to: lead.email,
        subject,
        text: message.text,
        html: message.html
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend lead email failed", response.status, detail.slice(0, 500));
      return { sent: false, error: `resend_${response.status}` };
    }
    return { sent: true };
  } catch (error) {
    console.error("Resend lead email error", error && error.message ? error.message : error);
    return { sent: false, error: "resend_unavailable" };
  } finally {
    clearTimeout(timer);
  }
}
