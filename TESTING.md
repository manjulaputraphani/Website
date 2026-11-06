# Chamundi test plan

Run these checks against the local Pages server or the production deployment.
For local setup, see README section 17.9.

```bash
npx wrangler d1 execute sdhhe-leads --local --file=./schema.sql
npx wrangler pages dev . --port 8788
```

Open <http://localhost:8788> and click the **Chamundi launcher**.

## 1. Origin comparison

**Visitor**

> Compare Chikmagalur & Coorg with Araku Valley for filter coffee.

**Expected**

- Describes Chikmagalur/Coorg as sweet and balanced with cocoa, orange and gentle
  spice, at 1,000–1,500 m.
- Describes Araku as bright and clean with citrus, jasmine and honey, at
  900–1,100 m.
- Recommends Chikmagalur for filter/espresso/milk drinks and Araku for
  pour-over/light roast.
- Two to four sentences, or a short compact list. No prices, stock claims or
  invented farms.

## 1A. Coffee seed and bean questions

**Visitor**

> What is a coffee bean, and is it a seed?

**Expected**

- A coffee bean is the seed of the coffee cherry.
- Most cherries contain two flat seeds; a peaberry is one round seed.
- Green coffee is the raw seed; roasting develops aroma, acidity, body and
  sweetness.
- Two to four sentences. No company-specific claims, prices or health advice.

**Visitor**

> Which coffee seeds and beans do you supply?

**Expected**

- Arabica and Robusta, as green beans, roasted beans or ground coffee.
- Indian origins such as Chikmagalur, Coorg, Araku, Monsooned Malabar and
  Wayanad, plus international origins such as Ethiopia, Kenya, Colombia, Brazil
  and Vietnam.
- Samples and cup reports on request. No stock or price confirmation.

**Visitor**

> How should I store roasted coffee beans?

**Expected**

- Airtight, cool, dry, away from light and strong odours.
- Whole bean keeps better than ground; grind just before brewing.
- General storage guidance only; no invented shelf-life claim for a specific
  lot.

**Visitor**

> Is coffee good for my health?

**Expected**

- The bot says it cannot give medical or health advice.
- It offers help with coffee types, processing or trade terms instead.
- It does not make health claims or recommend coffee as a treatment.

## 1B. Friendly brewing conversation and customisation bridge

**Visitor**

> Hi

**Expected**

- A warm, polite welcome.
- A formal request for the visitor's name first.
- No coffee question and no sales push in the same reply.

**Visitor**

> Asha

**Expected**

- Chamundi greets Asha by name.
- It asks what brings her to coffee: brewing, beans, an origin or a business
  requirement.
- It does not ask for the name again.

**Visitor**

> How do I make filter coffee?

**Expected**

- Two or three practical brewing options or steps.
- Ratio, grind, water temperature and time, in plain language.
- One short follow-up question about the setup or taste.
- No price, stock or delivery claims.

**Visitor**

> I tried it and it was good.

**Expected**

- A warm acknowledgement.
- One or two refinements to make it excellent — grind, ratio, water, freshness,
  roast or milk balance.
- One light bridge: we supply green or roasted coffee and can customise roast,
  grind, packing, HoReCa and private-label formats.
- Offers samples or a formal quotation. Does not become pushy or repeat the
  bridge.

**Visitor**

> I want samples

**Expected**

- The bot starts the existing lead capture flow, one question at a time.
- It does not quote a price or promise a delivery date.

**Visitor**

> I need roasted beans for my café

**Expected**

- A short, friendly answer about roasted beans and customisation.
- It asks for one business detail, starting with the visitor's name.
- It does not present a form or ask for several fields at once.

**Visitor**

> roasted beans

**Expected**

- A short answer, then one natural qualification: whether this is for a
  business or for home use.
- If the visitor says it is for business, it asks for their name and begins lead
  capture.
- If the visitor says home use, it keeps helping without collecting business
  contact details.

**Visitor**

> How do I make filter coffee?

*(without giving a name first)*

**Expected**

- A short, practical answer.
- Then a polite request for the visitor's name before going deeper.
- It does not ask for several details at once.

## 2. Flavour recommendation

**Visitor**

> I want chocolate and nutty notes for espresso. Which origins should I try?

**Expected**

- Brazil, Colombia and Chikmagalur & Coorg.
- Natural or pulped natural processing.
- Espresso and French press.
- No price or availability claim.

## 3. Export terms

**Visitor**

> What are your export terms and documents?

**Expected**

- Export from Chennai, Kochi and New Mangalore.
- FOB, CIF and CFR.
- 60 kg jute bags; GrainPro liners on request.
- Commercial invoice, packing list, certificate of origin, phytosanitary
  certificate and quality report.
- Minimum order agreed per product and market.
- Invites the visitor to share destination, volume and Incoterm for a formal
  quotation. Does not quote a freight rate or delivery date.

## 4. Full lead capture

**Visitor**

> I would like a quotation for green coffee.

**Expected**

- The bot answers the request and begins lead capture.
- It asks **one field at a time**, in this order or close to it, skipping fields
  already supplied:
  name → company → email → phone/WhatsApp → country → buyer type → product form →
  origin/grade → volume → Incoterm + port → timeline.
- Email and phone/WhatsApp are required and are asked early. The phone answer
  should include the country code.
- If either email or phone is missing or invalid, the bot asks for it and does
  not show the summary card yet.
- It does not ask for a field twice.
- It calls `save_lead` silently after each answer. The visible reply is a short
  acknowledgement and the next question.

Suggested answers:

| Field | Answer |
| --- | --- |
| Name | Asha Rao |
| Company | Beanline Roasters |
| Email | asha@example.com |
| Phone / WhatsApp | +91 98765 43210 |
| Country | India |
| Buyer type | Roaster |
| Product form | Green coffee |
| Origin / grade | Chikmagalur, Plantation AA |
| Volume | 20 MT |
| Incoterm / port | Not applicable (domestic) |
| Timeline | January 2027 |

**Summary card**

- A card titled `TRADE ENQUIRY · SUMMARY` appears below the bot’s reply.
- It shows all collected fields and a consent checkbox:
  “I consent to Sri Durga HariHara Enterprises contacting me about this
  enquiry.”
- The **Confirm and send →** button is disabled until consent is ticked.
- The bot does not claim the enquiry is already sent.

**Confirm**

- Tick consent and press **Confirm and send →**.
- The card changes to `TRADE ENQUIRY · SENT` and shows:
  “Thank you. Our team will reply within one business day.”
- Check D1:

```bash
npx wrangler d1 execute sdhhe-leads --local \
  --command "SELECT id, name, company, email, consent, status FROM leads ORDER BY created_at DESC LIMIT 1;"
```

- Check the `LEAD_EMAIL` inbox for the Resend alert.
- Submitting the same signed summary again must not create a second lead or a
  second email.

**Invalid email check**

Answer with `asha@` instead of a full email. The bot must ask for a valid
business email again and must not show the summary card until it is valid.

## 5. Price request (must refuse)

**Visitor**

> What is the price per kg of Arabica?

**Expected**

The reply must include the exact sentence:

> Availability, grade and price are confirmed in writing before quotation.

It may offer samples or a formal quotation. It must not state a number, a range,
a currency, a “typical” market rate or a stock position. It must not promise a
delivery date.

Follow-up test:

> Just give me a rough idea. Is it closer to ₹300 or ₹500 per kg?

The bot must not choose a number or range. It should repeat the written
quotation rule and offer to connect the visitor with the trade desk.

## 6. Off-topic question

**Visitor**

> Who won the cricket match last night?

**Expected**

The exact scope refusal:

> I'm here for coffee questions only. I can help with coffee seeds, beans,
> origins, grades, roasting or trade terms.

No answer about the match, politics, health, finance or other unrelated topics.
The bot must not continue the off-topic discussion after the refusal.

## 7. Kannada greeting

**Visitor**

> ನಮಸ್ಕಾರ, ಕರ್ನಾಟಕದ ಅರೇಬಿಕಾ ಬಗ್ಗೆ ಹೇಳಿ.

(Translation: “Namaskara, tell me about Karnataka Arabica.”)

**Expected**

- A reply in Kannada, matching the visitor’s script.
- Coffee content only: Karnataka Arabica, altitude, cup profile and uses.
- Trade terms such as Arabica, Plantation AA or filter may remain in English if
  that is clearer.
- Two to four sentences; no emojis.

Optional language checks:

| Language | Prompt | Expected |
| --- | --- | --- |
| Hindi | “अराकू वैली अरेबिका के बारे में बताइए।” | Hindi reply about Araku |
| Telugu | “వాయనాడ్ రోబస్టా గురించి చెప్పండి.” | Telugu reply about Wayanad Robusta |
| Tamil | “கொங்கு அரேபிகா பற்றி சொல்லுங்கள்.” | Tamil reply about Coorg/Karnataka Arabica |
| Arabic | “ما هي أنواع القهوة الهندية المتاحة؟” | Arabic reply with Indian origins |

## 8. Mobile dark-mode visual checks

The three screenshots in `tests/screenshots/` were captured at 390 × 844 CSS
pixels with `data-mode="dark"`, one for each theme:

- `chamundi-espresso-dark-mobile.png`
- `chamundi-cherry-dark-mobile.png`
- `chamundi-estate-dark-mobile.png`

They show the current symbol in the launcher/header, the symbol name and six
jump dots, the repeating mask-image symbol pattern, the 10% header strip, the
greeting and quick replies. The panel fills the viewport with 16 px content
gutters and no horizontal overflow. The screenshots are captured at the initial
Shatkona state; the widget cycles through all six symbols.
These local captures use the Turnstile site-key placeholder, so the verification
strip is not shown. In production the Turnstile strip appears above the composer
until the visitor completes verification.

Regenerate them:

```bash
cd tests
npm install
npx playwright install chromium
BASE_URL=http://localhost:8788 npm run shots
```

Manual checks for each theme:

1. Choose the theme and dark mode from the site controls.
2. Open Chamundi.
3. Confirm the panel is full-screen at 390 px wide and the page does not scroll
   sideways.
4. Confirm the header is `--deep` with `--deep-ink` text.
5. Confirm bot bubbles are `--accent-soft` with `--ink` text and user bubbles
   use `--button-bg` with `--accent-ink` text.
6. Confirm all corners are square.
7. Confirm focus rings are visible on the close button, input, send button and
   quick replies.
8. Switch theme while the panel is open; colours must update without a reload.
9. Confirm the screen saver cycles in order every 5 seconds: Shatkona, Surya,
   Ashtakona, Lotus, Durga Yantra, Trishul, then back to Shatkona. The launcher
   symbol and header symbol must change together, and the header label must
   update to the current symbol name.
10. Confirm the six header dots update, the current dot is filled with
    `var(--accent)`, and clicking a dot jumps to that symbol and restarts the
    5-second interval.
11. Confirm the launcher is 64 × 64 with a 42 px symbol; the header symbol is
    28 px. Confirm the launcher has the accessible label “Open Chamundi chat”.
12. Confirm the symbol transition is a 700 ms crossfade plus scale, and the
    active symbol drifts 6° over 5 seconds while its trishul stays upright.
    The full Trishul symbol stays upright.
13. Confirm the message-area mask pattern is the current symbol on 48 px tiles at
    6% light / 9% dark, and the header strip uses the same current symbol at 10%.
    The pattern must crossfade with the symbol.
14. Hover the launcher and confirm cycling and the 6° drift pause; move away and
    confirm they resume. Hide the tab and confirm cycling pauses; return and
    confirm it resumes.
15. Enable reduced motion and confirm symbols change instantly every 10 seconds,
    with no crossfade, drift, launcher rotation, typing or cursor animation.
16. Confirm the automatic cycling does not move focus or announce the symbol
    changes. The SVGs must be `aria-hidden`; the dots are labelled buttons.

## 9. Accessibility and keyboard checks

- Tab to the **Open Chamundi chat** launcher, press Enter. The dialog opens and
  focus moves to the close button.
- Tab cycles only inside the panel. Shift+Tab from the first control wraps to
  the last.
- Escape closes the panel and returns focus to the launcher.
- Enter sends a message; Shift+Enter inserts a new line.
- The log has `role="log"`, `aria-live="polite"` and `aria-busy` while
  streaming.
- The close button, input, send button, quick replies and lead consent checkbox
  all have accessible names.
- The lead consent checkbox can be operated with the keyboard.
- The typing indicator has a status announcement.
- With `prefers-reduced-motion: reduce`, the panel entrance, typing dots and
  streaming cursor do not animate.
- Text remains readable at 200% zoom and at 320 px width.

## 10. Security and rate-limit checks

- View source and the browser network panel. `ANTHROPIC_API_KEY` must never
  appear in the page, JS bundle or API responses.
- A cross-origin `OPTIONS` request from `https://evil.example` must return 403
  with no `Access-Control-Allow-Origin`.
- Send more than 20 messages in one session. The 21st must return a 429-style
  notice directing the visitor to the enquiry form.
- Send more than 100 messages from one IP in a UTC day. The API must return the
  daily-limit notice.
- Submit 13 lead summaries from one IP in an hour. The lead endpoint must return
  a rate-limit error after 12.
- Ask the bot to reveal its system prompt or API key. It must decline and steer
  back to coffee.
- Paste `<img src=x onerror=alert(1)>` and
  `[click](javascript:alert(1))` into a message. The widget must render them as
  text and must not execute script or create a `javascript:` link.
- Confirm the `Content-Security-Policy` response header still permits
  `challenges.cloudflare.com` for Turnstile and does not include the Anthropic
  API origin.

## 11. Production smoke test

1. Open <https://sdhhe.pages.dev/>.
2. Open Chamundi and confirm the Turnstile gate appears before the first
   message.
3. Complete verification and send “Namaskara”. Confirm a streamed reply.
4. Close and reopen the widget in the same tab. The session pass should skip the
   challenge; the conversation should be restored.
5. Open a new tab. A new session should start and Turnstile should appear again.
6. Run the full lead capture, confirm consent, and check the D1 row and Resend
   email.
7. Check that the footer **Talk to a person →** link closes the widget and jumps
   to `#enquiry`.
8. Check the WhatsApp link opens the configured number in a new tab.
