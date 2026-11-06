# SDHHE

**Sri Durga HariHara Enterprises**  
Wholesale, import and export of coffee  
Bengaluru, Karnataka, India

> Express · Explore · Taste

- **Live website:** <https://sdhhe.pages.dev/>
- **GitHub repository:** <https://github.com/manjulaputraphani/Website>
- **Cloudflare Pages project:** `sdhhe`
- **Primary branch:** `main`

---

## 1. About the website

This is a complete, responsive one-page website for Sri Durga HariHara Enterprises,
a coffee wholesale, import and export business. The site presents Indian green
coffee and roasted coffee to roasters, distributors, cafés, retailers and
importers in India and overseas.

The design follows a formal trade-house style: deep roasted colours, gold and
leaf accents, generous spacing, ruled lines, editorial serif headings and clear
mono labels. It celebrates India's coffee heritage — Baba Budan, Chikmagalur,
shade-grown estates, South Indian filter kaapi and the seven seeds.

The page is a static website. It has no framework, no build step, no database,
no third-party scripts and no tracking. Fonts and images are self-hosted.

---

## 2. What is included

### Brand and presentation

- Company name consistently written as **Sri Durga HariHara Enterprises**
- Tagline: **Express · Explore · Taste**
- Company monogram logo in the header and footer
- Editorial layout built around the supplied brand story and trade copy
- Original copy covering heritage, trade services, origins, tasting, brewing,
  health and the company pledge
- Self-hosted Libre Caslon Text, IBM Plex Sans and IBM Plex Mono fonts

### Theme system

Three complete colour themes:

1. **Espresso** — deep roasted brown, gold and warm off-white
2. **Cherry** — roasted brown with leaf-green and ripe-cherry accents
3. **Estate** — deep estate green, gold and off-white

Each theme has a light and a dark mode. The selected theme and mode are saved
in `localStorage` and restored on the next visit.

### Page sections

1. Announcement bar with theme switcher and light/dark toggle
2. Sticky navigation with company name, section links and gold trade-enquiry CTA
3. Opening section with hero image, heritage message, primary calls to action and
   a “trade at a glance” facts panel
4. Our roots — four heritage cards and the “welcome, conversation and blessing” quote
5. Trade services — green coffee and roasted coffee panels, three service areas,
   five-step trade process and trade terms
6. Origins — Indian and international origin table, Arabica vs Robusta comparison
   with Indian grades, and washed/natural/monsooned process explanations
7. Coffee knowledge — tasting attributes, interactive flavour finder, six cupping
   steps, live brew-ratio calculator, brewing methods table and “why coffee” section
8. Commitment — five promises and the highlighted trust pledge
9. Trade enquiry — contact details, GSTIN, IEC, WhatsApp link and full enquiry form
10. Footer with navigation, trade desk details and copyright line

### Interactions

- Sticky navigation with active-section tracking
- Responsive mobile menu with keyboard support and Escape-to-close
- Theme switcher with persisted Espresso/Cherry/Estate choice
- Persisted light/dark mode toggle
- Accessible flavour-finder tabs with arrow-key, Home and End navigation
- Brew-ratio calculator that syncs a method selector, number input, range slider
  and highlighted reference-table row
- Product links that prefill the enquiry form
- Inquiry form with native validation, honeypot spam field, AJAX submission,
  success/error states and a prepared mailto fallback
- Scroll reveal animations with `prefers-reduced-motion` support

### Accessibility

- Skip-to-content link
- Semantic landmarks and heading hierarchy
- Visible keyboard focus styles
- Mobile menu button with `aria-expanded`, `aria-controls` and accessible labels
- Tabs with correct roles, `aria-selected`, `aria-controls` and `tabindex`
- Form labels, required fields, status announcements via `aria-live`
- Reduced-motion support
- No horizontal page scrolling from 320px upwards
- Verified with axe WCAG 2.0/2.1 checks in all six theme/mode combinations
- Lighthouse accessibility score: 100

### SEO and social previews

- Descriptive page title and meta description
- Canonical URL
- Open Graph title, description, URL, image metadata, dimensions and locale
- Twitter/X summary card metadata
- LocalBusiness JSON-LD structured data
- `robots.txt`
- `sitemap.xml`
- Custom 1200 × 630 social preview image
- Favicon and Apple touch icon
- Lighthouse SEO score: 100

### Performance

- Self-hosted font files with `font-display: swap`
- WebP photography with responsive `srcset` variants
- Hero image priority loading
- Lazy loading for below-the-fold images
- No third-party JavaScript or tracking cookies; privacy-first Cloudflare Web
  Analytics (cookieless) for aggregate visitor counts
- Long-lived Cloudflare caching for fonts and images; shorter revalidation for
  stylesheets and scripts
- Lighthouse on the live site: **93 performance, 100 accessibility,
  100 best practices, 100 SEO** (mobile emulation at the time of launch)

---

## 3. Technology

- Static HTML5
- Modern CSS with custom properties, grid, flexbox and responsive media queries
- Vanilla JavaScript ES2017+
- Self-hosted WOFF2 fonts
- Cloudflare Pages hosting
- FormSubmit for enquiry delivery
- Chamundi chat desk: vanilla JavaScript widget, Cloudflare Pages Functions,
  Anthropic Claude Haiku or Ollama cloud streaming, Cloudflare D1, Cloudflare
  Turnstile and Resend email alerts

No package manager, framework or build command is required to run the site.
`npx wrangler` is used for local chat development, D1 schema setup and
deployment. The chat and lead APIs live in `functions/api/`.

---

## 4. File structure

```text
.
├── index.html                  Page content, SEO tags, JSON-LD, Chamundi loader
├── chamundi.js                 Theme-aware chat widget (vanilla JS)
├── chamundi.css                Chat widget styles, uses existing site tokens
├── assets/
│   ├── css/
│   │   └── styles.css          Layout, themes, responsive design
│   ├── js/
│   │   ├── site-config.js      Business contact details and form endpoints
│   │   └── main.js             Themes, navigation, tabs, calculator, form
│   ├── fonts/                  Self-hosted WOFF2 font files
│   └── images/                 Optimised photography, contours and OG image
├── functions/
│   ├── api/
│   │   ├── chat.js             POST /api/chat · Turnstile, rate limit, Claude stream
│   │   └── lead.js             POST /api/lead · validated D1 lead + Resend alert
│   └── _lib/
│       ├── http.js             CORS, JSON and error helpers
│       ├── knowledge.js        System prompt, coffee knowledge, save_lead tool
│       ├── leads.js            Lead validation, D1 insert, Resend email
│       ├── rate-limit.js       D1 session/IP/lead counters
│       ├── security.js         HMAC passes, Turnstile, IP hashing
│       └── validate.js         Email and session validators
├── schema.sql                  D1 tables: leads, chat_sessions, rate limits
├── wrangler.toml               Local/CLI D1 binding and non-secret variables
├── .dev.vars.example           Local secrets template (copy to .dev.vars)
├── tests/
│   ├── chamundi-screenshots.mjs  Mobile dark-mode capture script
│   ├── package.json             Playwright dev dependency for screenshots
│   └── screenshots/             Mobile dark-mode views for all three themes
├── TESTING.md                  Chamundi test conversations and checks
├── favicon.svg                 Browser favicon
├── assets/images/apple-touch-icon.png  Mobile home-screen icon
├── _headers                    Cloudflare Pages security and cache headers
├── scripts/
│   └── deploy.sh               Deploys the site, widget and Functions
├── robots.txt                  Search-engine instructions
├── sitemap.xml                 One-page XML sitemap
├── README.md                   This documentation
└── .gitignore                  Local/system-file exclusions
```

The `.wrangler/` directory is local deployment state and is ignored by Git.
`.dev.vars` contains local secrets and is also ignored by Git.

---

## 5. Previewing locally

From the project directory:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

The site can also be opened by double-clicking `index.html`, but a local server
is recommended so that fonts, images and form behaviour match production.
The Chamundi chat needs the Pages Functions runtime; use `npx wrangler pages
dev .` as described in section 17.9 rather than a plain static server.

---

## 6. Editing contact and business details

The single source for contact details used by the page is:

```text
assets/js/site-config.js
```

Current values:

| Field | Current value |
| --- | --- |
| Business name | Sri Durga HariHara Enterprises |
| Email | sridurgahariharaenterprises@gmail.com |
| Phone | +91 75692 08757 |
| WhatsApp | 917569208757 |
| Address | Bengaluru, Karnataka, India |
| GSTIN | 37JAGPM1479E1ZE |
| IEC | Available on request |

The contact panel, footer email links, phone links, WhatsApp link, hidden form
subject and fallback form action are populated from this file.

If you change the email or WhatsApp number, also update the corresponding
FormSubmit endpoint URLs in the same file.

For the details to appear before JavaScript loads, and for search engines and
social previews, update the matching fallback values in `index.html`:

- brand text in the header and footer
- contact panel values
- JSON-LD block
- page title, meta description and Open Graph/Twitter metadata
- hidden form subject

The current GSTIN, email and phone were taken from available business records.
Confirm them with the owner before public launch. The full street address and
PIN code, and the actual IEC number, were not supplied and should be added.

---

## 7. Editing page content

All page copy is in `index.html`, grouped in clear sections:

| Section | HTML comment / element |
| --- | --- |
| Announcement bar | `<!-- Announcement bar -->` |
| Sticky navigation | `<!-- Sticky navigation -->` |
| Opening / hero | `<!-- 01 · Opening -->` |
| Our roots | `<!-- 02 · Our roots -->` |
| Trade services | `<!-- 03 · Trade -->` |
| Origins | `<!-- 04 · Origins -->` |
| Coffee knowledge | `<!-- 05 · Coffee knowledge -->` |
| Commitment | `<!-- 06 · Commitment -->` |
| Trade enquiry | `<!-- 07 · Enquiry -->` |
| Footer | `<footer class="site-footer">` |

Common edits:

- **Origin table:** edit rows inside `<table class="origins-table">`.
- **Arabica/Robusta details:** edit `.species-card` content.
- **Process explanations:** edit `.process-card` content.
- **Five promises:** edit `.promise` articles.
- **Pledge wording:** edit `.pledge__text`.
- **Contact form options:** edit the `<select id="enquiry-type">` options.
- **Trade terms:** edit `.terms-grid`.
- **Footer copyright:** edit `.footer-bottom`.

Keep heading levels intact for accessibility and SEO.

### Flavour finder

The five tasting profiles and their suggested origins, process and brew method
are stored in the `flavourData` object near the top of:

```text
assets/js/main.js
```

Each entry has:

```js
{
  title: "Cocoa, hazelnut, brown sugar",
  note: "...",
  origins: "Brazil, Colombia, Chikmagalur",
  process: "Natural or pulped natural",
  brew: "Espresso, French press"
}
```

The tab labels themselves are in `index.html` inside `.flavour-tabs`.

### Brew-ratio calculator

The calculator reads:

- method options and `data-ratio` values from `<select id="brew-method">`
- default grams from `<input id="coffee-grams">`
- the matching reference row via `data-brew-row` in `.brew-table`

If you add or remove a brewing method, update all three places: the selector,
the table row and the option's `data-ratio`.

### Theme colours

All six theme blocks are at the top of `assets/css/styles.css`:

```css
html[data-theme="espresso"][data-mode="light"] { ... }
html[data-theme="espresso"][data-mode="dark"]  { ... }
html[data-theme="cherry"][data-mode="light"]   { ... }
html[data-theme="cherry"][data-mode="dark"]    { ... }
html[data-theme="estate"][data-mode="light"]   { ... }
html[data-theme="estate"][data-mode="dark"]    { ... }
```

Each block defines page, ink, line, deep-panel, accent, button, field and focus
colours. Keep small label colours at `--accent-text` on light surfaces and
`--accent-dark` on dark surfaces to preserve readable contrast.

### Logo

The custom “SDH” monogram is inline SVG in the header and footer. Replace both
instances of the `brand__mark` SVG with an official logo when one is supplied.
Keep the company name and `COFFEE TRADE` subtitle, or adjust them in the adjacent
`brand__text` element.

### Images

Images are in `assets/images/` and use WebP except for the OG image and icons.
When replacing a photo:

- keep a similar aspect ratio
- generate a narrower mobile variant
- update `srcset`, `sizes`, `width`, `height` and `alt` in `index.html`
- optimise the final file before committing

Photography is atmospheric and does not depict the company’s own stock unless
explicitly replaced with real company photographs.

---

## 8. Enquiry form and email delivery

The form is configured to deliver to:

```text
sridurgahariharaenterprises@gmail.com
```

Delivery uses [FormSubmit](https://formsubmit.co), configured in
`assets/js/site-config.js`:

```js
form: {
  ajaxEndpoint: "https://formsubmit.co/ajax/sridurgahariharaenterprises@gmail.com",
  fallbackEndpoint: "https://formsubmit.co/sridurgahariharaenterprises@gmail.com",
  subject: "New trade enquiry — Sri Durga HariHara Enterprises"
}
```

### First-time activation — required

On the first submission, FormSubmit sends a one-time activation email to the
trade-desk inbox. Open that email and click the activation link. After activation,
enquiries are delivered to that inbox.

If the form appears to submit successfully but no activation email arrives, check
the Gmail spam folder and confirm that the endpoint email in `site-config.js` is
correct.

### Form behaviour

- The visible form uses AJAX, so visitors stay on the page.
- Native HTML validation runs before submission.
- A hidden honeypot field blocks basic spam.
- On success, a confirmation message is announced accessibly.
- If delivery fails, the visitor sees an error and a prepared direct-email link.
- Without JavaScript, the form falls back to a normal FormSubmit POST using the
  endpoint in the HTML `action` attribute.
- The reply-to field is the visitor's email because the form uses `name="email"`.
- The form note states that details are used only to respond to the enquiry.

### Using Formspree instead

1. Create a form at Formspree.
2. Replace both URLs in `assets/js/site-config.js` with your Formspree endpoint.
3. Keep the form field names.
4. Remove FormSubmit-specific hidden fields and the `_honey` honeypot if they
   conflict with the new service.
5. Test a live submission.

### Changing the receiving email

Update the FormSubmit URLs, the hidden subject, the contact panel links, the
footer links, the JSON-LD email and any matching fallback text in `index.html`.

---

## 9. SEO, social sharing and domain changes

Included SEO:

- Page title: `Sri Durga HariHara Enterprises | Coffee Wholesale & Export`
- Descriptive meta description
- Canonical URL: `https://sdhhe.pages.dev/`
- Open Graph and Twitter metadata
- LocalBusiness JSON-LD
- Sitemap and robots instructions
- 1200 × 630 social preview at `assets/images/og-image.jpg`

### If you add a custom domain

Replace `https://sdhhe.pages.dev/` in:

- `index.html` canonical link
- `og:url`
- `og:image` and `twitter:image`
- JSON-LD `url` and `image`
- `robots.txt` sitemap URL
- `sitemap.xml`
- README links

Then add the domain in the Cloudflare Pages project settings and redeploy.

### Social preview testing

After deploying, test the page with:

- Facebook Sharing Debugger
- LinkedIn Post Inspector
- X/Twitter Card Validator

Social platforms cache preview images. Re-scrape after replacing the OG image.

---

## 10. Cloudflare Pages hosting

The live site is hosted on Cloudflare Pages:

**Project:** `sdhhe`  
**URL:** <https://sdhhe.pages.dev/>

### Deploying an update

Authenticate once (Node.js 22+ required by current Wrangler):

```bash
npx --yes wrangler@latest login
```

Deploy with the included script:

```bash
./scripts/deploy.sh
```

The script copies the site, the Chamundi widget and the Pages Functions into a
temporary staging directory, so `.git`, `.wrangler`, `.dev.vars`, `README.md`
and other working files are never uploaded. It then deploys to the Cloudflare
Pages project `sdhhe` on the `main` branch.

The chat API also needs the production `DB` D1 binding and the secrets described
in section 17.7. Configure those in the Pages dashboard before testing the chat
on the live site.

Wrangler prints a deployment URL. The production alias remains
<https://sdhhe.pages.dev/> when deploying to the `main` branch.

### Security and caching headers

The root `_headers` file configures:

- Content Security Policy, including Cloudflare Turnstile origins
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- strict referrer policy
- restrictive permissions policy
- one-year immutable cache for fonts
- one-week cache for images
- one-hour revalidation for CSS and JavaScript
- no-cache/revalidation for HTML

The CSP allows the inline theme bootstrap, inline JSON-LD, self-hosted assets and
FormSubmit. If you switch form providers or add new third-party resources, update
the CSP in `_headers` and redeploy.

### Automatic deployments with Git

The Pages project is connected to the GitHub repository
`manjulaputraphani/Website`. A push to `main` triggers a production deployment.

1. Pages → project `sdhhe` → Settings → Builds & deployments.
2. Repository: `manjulaputraphani/Website`.
3. Branch: `main`.
4. Framework preset: “None”.
5. Build command: empty. Output directory: `/` (the repository root).

The direct-upload script remains available for a staged deployment when needed.

---

## 11. GitHub workflow

Repository: <https://github.com/manjulaputraphani/Website>

```bash
git add .
git commit -m "Describe the change"
git push
```

The repository’s initial commit is `e55f29a first commit`.

If GitHub rejects a push, confirm that the account signed in on this machine has
write access to the repository. The current repository owner and the local GitHub
credential are different accounts.

---

## 12. Responsive and accessibility testing

Recommended checks after changes:

- widths: 320, 360, 400, 540, 768, 1024, 1440 and 1920px
- all three themes in both light and dark mode
- mobile menu open/close with mouse and keyboard
- Escape closes the mobile menu and returns focus to the menu button
- flavour tabs via click, Tab and arrow keys
- brew calculator updates when method or grams change
- form success and failure states
- reduced-motion preference
- zoom to 200%
- no console errors
- no horizontal page scroll at 400px

The site was checked with axe WCAG 2.0/2.1 rules across all six theme/mode
combinations, and with Lighthouse on the live Cloudflare URL.

---

## 13. Before public launch — final checklist

1. Confirm the official spelling **Sri Durga HariHara Enterprises** everywhere.
2. Confirm the trade-desk email, phone and WhatsApp number.
3. Confirm the GSTIN and add the full Bengaluru street address and PIN code.
4. Replace “Available on request” with the actual IEC code.
5. Activate FormSubmit from the trade-desk inbox.
6. Send a live test enquiry and confirm it arrives.
7. Check the three themes and both modes on a real phone.
8. Replace atmospheric photography with real company/product photos when available.
9. Add a custom domain if desired, then update canonical, OG, JSON-LD, sitemap and
   robots URLs.
10. Review whether a privacy policy page is required for your jurisdiction and
    business structure.
11. Re-run Lighthouse and a final accessibility check.
12. Commit and push the final changes.

### Known placeholders

- Full street address and PIN code
- IEC number
- Final confirmation of GSTIN, email and phone
- Trade-desk form activation

---

## 14. Troubleshooting

### Form submits but no email arrives

- Activate FormSubmit using the first activation email.
- Check the spam/junk folder.
- Confirm the endpoint email in `site-config.js`.
- Test the endpoint in an incognito window.
- Check the browser console for a network or CSP error.

### Form shows a failure message

The page will provide a prepared direct-email link. The error can come from the
FormSubmit activation requirement, a network interruption or a provider outage.
Check the browser network panel and the FormSubmit dashboard.

### Updated files do not appear

HTML is served with revalidation, but browsers and Cloudflare can cache CSS, JS
and images for a short time. Hard-refresh, wait for the cache lifetime, or
invalidate the Cloudflare cache. Incrementing an asset filename is another option.

### Theme choice is not remembered

Check that the browser allows `localStorage` for the site. Theme persistence is
wrapped in `try/catch`, so private browsing or strict privacy settings may reset
the choice.

### Fonts look different

Verify that files in `assets/fonts/` are present and served with the correct
`font/woff2` MIME type. The CSP must allow `font-src 'self'`.

### Mobile menu is not visible

The menu button only appears under 1080px. Without JavaScript, a small
`<noscript>` fallback shows the mobile links and hides the non-functional theme
controls.

---

## 15. Credits

### Photography

- Coffee cherries on the branch — Raghavendra Prasad, Unsplash:
  <https://unsplash.com/photos/green-and-red-round-fruits-53N0w0Mlx_I>
- Green coffee cherries in Karnataka — The Manh, Unsplash:
  <https://unsplash.com/photos/green-coffee-beans-growing-on-a-tree-branch--IHLVvT7YcY>
- Roasted coffee in a burlap sack — Unsplash:
  <https://images.unsplash.com/photo-1524350876685-274059332603>
- Pour-over brewing — Unsplash:
  <https://images.unsplash.com/photo-1442512595331-e89e73853f31>
- Unroasted green coffee beans — Michael Burrows, Pexels:
  <https://www.pexels.com/photo/7125601/>

Used under the Unsplash and Pexels licences.

### Fonts

- Libre Caslon Text
- IBM Plex Sans
- IBM Plex Mono

Used under the SIL Open Font License.

### Form service

- FormSubmit — <https://formsubmit.co>

---

## 16. Ownership

© Sri Durga HariHara Enterprises · Wholesale, import and export of coffee.

The website design and source are maintained for Sri Durga HariHara Enterprises.
Third-party photography and fonts remain subject to their respective licences.

---

---

## 17. Chamundi · coffee trade desk chat

> **Current deployment status:** the site, Chamundi widget, Pages Functions,
> `sdhhe-leads` D1 database and Ollama free-model path are deployed.
> `CHAT_SESSION_SECRET`, `LEAD_EMAIL` and `OLLAMA_API_KEY` are configured.
> Turnstile site/secret keys and `RESEND_API_KEY` still need to be added before
> public chat and email alerts are fully enabled. Until Turnstile is configured,
> the widget shows a clear setup notice and links to the enquiry form.

Chamundi is the AI trade-desk assistant for Sri Durga HariHara Enterprises. It
is a theme-aware, accessible chat widget backed by Cloudflare Pages Functions,
Anthropic Claude Haiku or Ollama cloud, Cloudflare D1, Cloudflare Turnstile and
Resend.

The widget is added with one script tag. It injects its own stylesheet:

```html
<script
  src="chamundi.js"
  data-turnstile-key="YOUR_TURNSTILE_SITE_KEY"
  data-whatsapp="917569208757"
  defer></script>
```

The loader is already at the bottom of `index.html`. Replace
`REPLACE_WITH_TURNSTILE_SITE_KEY` with the real public site key before
production. The public site key is safe to expose; the Turnstile secret stays on
the server.

### 17.1 What is included

| File | Purpose |
| --- | --- |
| `chamundi.js` | Self-contained widget: greeting, quick replies, streaming, safe Markdown, session history, Turnstile gate, lead summary card, focus trap, Esc, theme observation |
| `chamundi.css` | Square, editorial chat UI using the site's existing theme variables and fonts |
| `functions/api/chat.js` | `POST /api/chat`: origin check, Turnstile or signed session pass, D1 rate limit, last-12-message validation, Claude streaming, `save_lead` tool use |
| `functions/api/lead.js` | `POST /api/lead`: verifies the signed lead summary, validates every field, writes D1, sends Resend alert |
| `functions/_lib/*` | Shared HTTP, prompt, validation, rate-limit and signing helpers |
| `schema.sql` | D1 tables for `leads`, chat drafts and rate-limit counters |
| `wrangler.toml` | Local/CLI D1 binding and non-secret defaults |
| `.dev.vars.example` | Template for local secrets |
| `TESTING.md` | Test conversations, expected answers and mobile dark-mode screenshots |
| `tests/screenshots/` | Espresso, Cherry and Estate dark-mode mobile views |

The chat is intentionally not a generic assistant. It answers only coffee and
trade questions for this business. It never quotes prices, confirms stock or
promises delivery dates. When a visitor asks for a price, it says:

> Availability, grade and price are confirmed in writing before quotation.

### 17.2 Request flow

1. The visitor opens the launcher and completes Cloudflare Turnstile before the
   first message.
2. `/api/chat` verifies the Turnstile token, issues a short-lived HMAC-signed
   session pass, and rate-limits the request.
3. The API sends the last 12 messages to the configured model provider. Anthropic
   is capped at 400 output tokens; Ollama Beam is capped at 1200 because its
   internal thinking tokens count toward the output budget. The live lead draft
   is stored in D1 so early answers survive the 12-message window.
4. Claude calls the `save_lead` tool after each new lead field. The tool merges
   fields into the draft and returns `missing_fields` and `next_field`.
5. When every required field is valid, the server emits a signed summary. The
   widget renders a summary card with a consent checkbox. It does not save the
   lead yet.
6. The visitor ticks consent and presses **Confirm and send**. The widget POSTs
   the signed summary to `/api/lead`.
7. `/api/lead` re-validates all fields, inserts the row into `leads` and sends a
   Resend alert. The visitor sees: “Thank you. Our team will reply within one
   business day.”

The `save_lead` tool creates a draft, not a submitted lead. Consent and final
submission happen through the summary card and `/api/lead`.

### 17.3 Prerequisites

- Cloudflare account and the existing `sdhhe` Pages project
- Anthropic API key with access to Claude Haiku, or an Ollama API key with
  access to a cloud model (the free `beam` model is currently configured)
- Cloudflare Turnstile widget and secret
- Resend account with a verified sending domain (or the Resend onboarding sender
  for a private test)
- Node.js 22+ and Wrangler 4+ for the recommended local workflow
- `openssl` or another way to generate a random 32-byte secret

### 17.4 Create the D1 database

```bash
cd /path/to/SDHHE/Website
npx wrangler d1 create sdhhe-leads
```

Wrangler prints a `database_id`. Either:

- paste it into `wrangler.toml` for local/CLI work, and
- add the same database as a D1 binding named `DB` in the Pages dashboard for
  production; or
- keep `wrangler.toml` in sync and deploy with Wrangler.

Apply the schema to production and local:

```bash
npx wrangler d1 execute sdhhe-leads --remote --file=./schema.sql
npx wrangler d1 execute sdhhe-leads --local  --file=./schema.sql
```

Check the tables:

```bash
npx wrangler d1 execute sdhhe-leads --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table';"
```

You should see `leads`, `chat_sessions` and `chat_rate_limits`.

### 17.5 Create the Turnstile widget

1. Cloudflare dashboard → Turnstile → **Add widget**.
2. Name it `Chamundi`.
3. Add hostname `sdhhe.pages.dev`. Add any preview or custom hostnames you
   actually use.
4. Widget mode: **Managed**.
5. Copy the **site key** into `index.html`:

```html
data-turnstile-key="0x4AAAAAAA..."
```

6. Copy the **secret key** into the Pages secret `TURNSTILE_SECRET_KEY`.

The widget renders in `chamundi.js` with action `chamundi`. The API checks the
action when Turnstile returns one. If you set `TURNSTILE_EXPECTED_HOSTNAME`,
it must exactly match the hostname in the Turnstile response. Leave it unset if
you use multiple hostnames.

### 17.6 Create the Resend sender

1. Verify your sending domain in Resend.
2. Create an API key with permission to send email.
3. Set `RESEND_API_KEY` as a Pages secret.
4. Set `LEAD_EMAIL` to the trade-desk inbox. Multiple recipients can be
   comma-separated.
5. Set `LEAD_FROM_EMAIL` to a verified sender, for example:

```text
Chamundi <leads@your-verified-domain.example>
```

For a private test, Resend's `onboarding@resend.dev` sender only delivers to the
Resend account owner's address. Use a verified domain for production.

If Resend is temporarily unavailable, the lead is still saved in D1 and the
visitor still sees the thank-you. Check the Pages logs and resend manually.

### 17.7 Environment variables and secrets

In the Pages dashboard: **Workers & Pages → sdhhe → Settings → Variables and
Secrets**. Add encrypted values for production and preview as needed.

Required in production:

| Name | Type | Value |
| --- | --- | --- |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile secret key |
| `CHAT_SESSION_SECRET` | Secret | `openssl rand -hex 32` |
| `RESEND_API_KEY` | Secret | Resend API key |
| `LEAD_EMAIL` | Variable | Trade-desk inbox |
| `LEAD_FROM_EMAIL` | Variable | Verified Resend sender |
| One AI provider | Secret | `ANTHROPIC_API_KEY` **or** `OLLAMA_API_KEY` |

Recommended or optional:

| Name | Type | Value |
| --- | --- | --- |
| `CHAT_PROVIDER` | Variable | `anthropic` or `ollama`; auto-detects when omitted |
| `ANTHROPIC_MODEL` | Variable | `claude-haiku-4-5` (default for Anthropic) |
| `OLLAMA_MODEL` | Variable | `beam` (free promo) or `deepseek-v4.1-flash` with credits |
| `OLLAMA_MAX_TOKENS` | Variable | `1200` (default for Ollama thinking models; Anthropic stays at 400) |
| `OLLAMA_BASE_URL` | Variable | `https://ollama.com` (or a local Ollama URL) |
| `ALLOWED_ORIGINS` | Variable | `https://sdhhe.pages.dev` (default) |
| `TURNSTILE_EXPECTED_ACTION` | Variable | `chamundi` |
| `TURNSTILE_EXPECTED_HOSTNAME` | Variable | Optional exact hostname |

Do **not** set `ALLOW_UNVERIFIED_CHAT` in production. It exists only for local
development and disables the verification requirement when no Turnstile secret
is present.

`ALLOWED_ORIGINS` is an exact, comma-separated allowlist. Add a custom domain or
a preview hostname only if you actually use it:

```text
https://sdhhe.pages.dev,https://www.your-domain.example
```

The API never returns an `Access-Control-Allow-Origin` header for any other
origin.

### 17.8 Deploy

#### Git-connected Pages project (recommended)

```bash
git add chamundi.js chamundi.css functions schema.sql wrangler.toml \
  .dev.vars.example .gitignore _headers index.html README.md TESTING.md \
  scripts/deploy.sh tests
git commit -m "Add Chamundi coffee trade desk chat"
git push origin main
```

Cloudflare Pages will deploy the static files, `/functions` and `_headers`.
Then:

1. Add the production `DB` D1 binding in **Settings → Functions → D1 database
   bindings**.
2. Add the environment variables and secrets from section 17.7.
3. Confirm `index.html` contains the real Turnstile site key.
4. Redeploy if you changed environment bindings.

#### Wrangler CLI deploy (staged)

The included script stages the site, widget and Functions in a temporary
directory, so `.dev.vars`, `.wrangler`, `README.md` and other working files are
never uploaded:

```bash
./scripts/deploy.sh
```

The staged deployment uses the `DB` binding and secrets configured in the Pages
project. If you prefer to deploy a directory manually, deploy a clean staging
directory rather than the repository root, and never include `.dev.vars`.

Secrets can be set with:

```bash
npx wrangler pages secret put ANTHROPIC_API_KEY --project-name=sdhhe
npx wrangler pages secret put OLLAMA_API_KEY --project-name=sdhhe
npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name=sdhhe
npx wrangler pages secret put CHAT_SESSION_SECRET --project-name=sdhhe
npx wrangler pages secret put RESEND_API_KEY --project-name=sdhhe
```

#### Post-deploy checks

```bash
curl -I https://sdhhe.pages.dev/chamundi.js
curl -I https://sdhhe.pages.dev/chamundi.css
curl -i -X OPTIONS https://sdhhe.pages.dev/api/chat \
  -H "Origin: https://sdhhe.pages.dev" \
  -H "Access-Control-Request-Method: POST"
```

Open the site, complete Turnstile, send “Namaskara”, and confirm a streamed
reply. Then run the lead-capture test in `TESTING.md` and check the `leads` row:

```bash
npx wrangler d1 execute sdhhe-leads --remote \
  --command "SELECT id, created_at, name, company, email, status FROM leads ORDER BY created_at DESC LIMIT 5;"
```

### 17.9 Local development

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:

```text
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-4-5
# Or use Ollama instead of Anthropic:
# OLLAMA_API_KEY=...
# OLLAMA_MODEL=beam
# OLLAMA_MAX_TOKENS=1200
# CHAT_PROVIDER=ollama
CHAT_SESSION_SECRET=<openssl rand -hex 32>
ALLOW_UNVERIFIED_CHAT=true
ALLOWED_ORIGINS=http://localhost:8788
LEAD_EMAIL=you@example.com
# RESEND_API_KEY=re_...
# LEAD_FROM_EMAIL="Chamundi <leads@your-verified-domain.example>"
```

For local testing without Turnstile, leave the site key placeholder in
`index.html` and omit `TURNSTILE_SECRET_KEY`. The API allows unverified local
requests because `ALLOW_UNVERIFIED_CHAT=true`.

To test the real Turnstile gate locally, use Cloudflare's test credentials:

```text
Site key:   1x00000000000000000000AA
Secret key: 1x0000000000000000000000000000000AA
```

Put the test site key in `index.html` temporarily and add the test secret to
`.dev.vars`. Revert the site key before committing production changes.

Apply the local schema, then run Pages with the D1 binding from `wrangler.toml`:

```bash
npx wrangler d1 execute sdhhe-leads --local --file=./schema.sql
npx wrangler pages dev . --port 8788
```

Open <http://localhost:8788>. Do not pass `--d1 DB=...` if the binding is
already in `wrangler.toml`; doing so can create a second local database and the
tables will appear missing.

If you are on Node.js 20, Wrangler 4 will not start. Use Node.js 22 or, for a
temporary local check, `npx wrangler@3 pages dev . --port 8788`. Upgrade before
deploying.

### 17.10 Configuration notes

- **Knowledge and rules:** edit `functions/_lib/knowledge.js`. The static system
  prompt contains the business facts, origin table, tone, language support and
  non-negotiable rules. The `save_lead` schema is in the same file.
- **Scope:** the prompt is coffee-only. It allows general coffee knowledge
  (seeds and beans, origins, processing, roasting, brewing, storage) and the
  business's own services. Off-topic questions get one fixed refusal line and no
  answer. Medical/health advice, prices, stock claims and delivery-date promises
  are explicitly blocked.
- **Model:** `ANTHROPIC_MODEL` defaults to `claude-haiku-4-5`. Any Claude model
  can be used without changing code. The production Ollama option defaults to
  `beam`, which is free until 9 November 2026; DeepSeek cloud models require
  usage credits on the Ollama account. The Ollama cap is 1200 tokens because
  Beam spends part of the output budget on internal thinking. Anthropic stays
  at 400.
- **WhatsApp:** change `data-whatsapp` on the script tag, or set
  `window.SITE_CONFIG.whatsapp` before the widget loads. Leave it blank to hide
  the footer link.
- **Enquiry anchor:** change `data-enquiry` on the script tag if the form anchor
  changes from `#enquiry`.
- **Endpoints:** `data-chat-endpoint` and `data-lead-endpoint` exist for testing
  or a different deployment path.
- **CSS:** `chamundi.js` injects `chamundi.css` automatically. You can also add
  a normal stylesheet link and set `data-css` to its URL.
- **Brand screen saver:** six inline SVG symbols — Shatkona, Surya,
  Ashtakona, Lotus, Durga Yantra and Trishul — cycle every 5 seconds from one
  shared timer. The launcher uses a 64 × 64 box with a 42 px symbol; the header
  uses a 28 px symbol with the current symbol name and six jump dots. The message
  area uses a 48 px mask-image tile of the current symbol at 6% (light) / 9%
  (dark), and the header strip uses the same tile at 10%. The symbols use
  `currentColor` / `var(--accent)`, so they recolour with the theme. Crossfade
  and scale run for 700 ms, the symbol body drifts 6° over 5 s while the trishul
  stays upright, and cycling pauses on launcher hover and when the tab is hidden.
  Reduced motion changes symbols instantly every 10 seconds. The trishul is
  defined once as `#cm-trishul` and reused with `<use>`.
- **Avatars and typing:** the per-message 20 px avatar and the three typing
  marks remain the fixed Shatkona brand mark; the screen saver applies to the
  launcher, header, message-area pattern and header strip.
- **Colours:** the widget uses `--deep`, `--deep-ink`, `--panel`, `--page-alt`,
  `--accent-soft`, `--ink`, `--button-bg`, `--button-bg-hover`, `--line`,
  `--line-strong`, `--muted`, `--accent-text`, `--accent-ink`, `--focus`,
  `--success`, `--error`, `--shadow`, `--ease` and `--speed`. All six
  theme/mode combinations switch automatically.
- **User bubble text:** the widget uses `var(--accent-ink)`, which is warm white
  in the light themes and deep ink in the dark themes. Literal white would fail
  WCAG AA against the light gold and light green dark-mode button colours. This
  is the one deliberate deviation from “white text” in the brief, made to keep
  the interface accessible.
- **Square corners:** `border-radius: 0` throughout, matching the site buttons.
- **Motion:** the panel, typing dots and cursor respect
  `prefers-reduced-motion: reduce`.

### 17.11 Security and cost controls

- The provider key (`ANTHROPIC_API_KEY` or `OLLAMA_API_KEY`) is only read
  inside the Pages Function. It is never sent to the browser.
- Turnstile is required before the first message in production. After
  verification, the API issues an HMAC-signed, 12-hour session pass so the
  visitor does not have to solve a challenge on every message.
- Chat limits: 20 messages per chat session and 100 messages per IP per UTC day.
  Lead submissions are additionally limited to 12 per IP per hour. Counters are
  stored in D1 and fail closed if D1 is unavailable.
- Only the last 12 messages are sent to the model. Each message is capped at
  4,000 characters and the total request at 24,000 characters.
- `max_tokens` is 400 for Anthropic. Ollama defaults to 1200 because Beam's
  internal thinking tokens count against the output budget; `OLLAMA_MAX_TOKENS`
  can lower or raise it between 200 and 2000.
- CORS is restricted by `ALLOWED_ORIGINS`, which defaults to
  `https://sdhhe.pages.dev`.
- Lead summaries are HMAC-signed and expire after two hours. `/api/lead`
  re-validates email, enums, required fields, lengths and consent; it uses the
  signed payload rather than trusting arbitrary client fields.
- Model output is rendered with DOM text nodes. The Markdown renderer supports
  paragraphs, bold, italic, inline code, simple lists and safe `http`, `https`
  and `mailto` links. There is no `innerHTML` from model output.
- Chat history is kept in `sessionStorage` inside `try/catch`; if storage is
  blocked, the chat still works for the current page.
- The `_headers` CSP now allows Cloudflare Turnstile's script, frame, image and
  connect origins. Do not remove those entries or the verification widget will
  be blocked.

During lead capture, the model may make a second provider request in the same
visitor turn to continue after `save_lead`. The rate limit counts visitor
messages, not internal model calls. The model cap and turn limits keep normal
usage inexpensive.

### 17.12 Data and privacy

- `leads` stores the submitted trade enquiry, consent flag, timestamp, source,
  hashed IP and user agent. Do not add sensitive personal data to the notes
  field.
- `chat_sessions` stores the in-progress lead draft so early answers are not
  lost when the 12-message context window moves. It is deleted after a
  successful lead submission. Consider a scheduled cleanup for abandoned
  drafts:
  `DELETE FROM chat_sessions WHERE julianday(updated_at) < julianday('now', '-30 days');`
- `chat_rate_limits` stores counters and expiry timestamps, not raw IP
  addresses.
- Resend receives the lead details to send the alert. Use a verified sending
  domain and restrict API-key permissions.
- The widget stores conversation history, the session ID and the signed lead
  summary in `sessionStorage`, which is cleared when the browser tab closes.
- Update the site's privacy wording if you need to mention AI-assisted chat,
  D1 storage or Resend processing explicitly.

### 17.13 Troubleshooting

| Symptom | Check |
| --- | --- |
| “Chat verification is not configured yet” | The site key in `index.html` is still the placeholder, or `TURNSTILE_SECRET_KEY` is missing |
| “Chat signing is not configured” / 503 | `CHAT_SESSION_SECRET` is missing or shorter than 24 characters |
| Turnstile token rejected | Site key and secret belong to the same widget; hostname matches; `TURNSTILE_EXPECTED_HOSTNAME` is not over-restrictive; CSP includes `challenges.cloudflare.com` |
| “Chat is temporarily unavailable” | D1 binding `DB` is missing, schema was not applied, or D1 is down |
| “The assistant is temporarily unavailable” | Provider key invalid, model id unavailable, Ollama account out of credits, or provider rate limited |
| Lead saved but no email | `RESEND_API_KEY`, `LEAD_EMAIL`, `LEAD_FROM_EMAIL`; domain verification; Resend logs |
| “This summary has expired” | The two-hour lead token expired; ask Chamundi to prepare it again |
| 429 from `/api/chat` | 20-message session limit or 100-message daily IP limit reached |
| CORS error in the browser | Add the exact origin to `ALLOWED_ORIGINS` |
| Local “no such table” | Apply `schema.sql` to the same local database; remove `--d1` override when using `wrangler.toml` |
| Styles missing | `chamundi.css` must be deployed next to `chamundi.js`; CSP `style-src 'self'` must remain |
| History disappears | `sessionStorage` is blocked or the tab was closed; this is expected |

For test conversations, expected refusals, lead-capture script and the three
mobile dark-mode screenshots, see [`TESTING.md`](TESTING.md).
