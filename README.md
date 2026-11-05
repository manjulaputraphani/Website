# SDHHE

**Sri Durga HariHara Enterprises**  
Wholesale, import and export of coffee  
Bengaluru, Karnataka, India

> Express · Explore · Taste

- **Live website:** <https://sdhhe.pages.dev/>
- **GitHub repository:** <https://github.com/manjulaputraphani/SDHHE>
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

No package manager, framework or build command is required to run the site.
`npx wrangler` is only used for deployment.

---

## 4. File structure

```text
.
├── index.html                  Page content, SEO tags, JSON-LD
├── assets/
│   ├── css/
│   │   └── styles.css          Layout, themes, responsive design
│   ├── js/
│   │   ├── site-config.js      Business contact details and form endpoints
│   │   └── main.js             Themes, navigation, tabs, calculator, form
│   ├── fonts/                  Self-hosted WOFF2 font files
│   └── images/                Optimised photography, contours and OG image
├── favicon.svg                 Browser favicon
├── apple-touch-icon.png        Mobile home-screen icon
├── _headers                    Cloudflare Pages security and cache headers
├── scripts/
│   └── deploy.sh               Deploys only the public website files
├── robots.txt                  Search-engine instructions
├── sitemap.xml                 One-page XML sitemap
├── README.md                   This documentation
└── .gitignore                  Local/system-file exclusions
```

The `.wrangler/` directory is local deployment state and is ignored by Git.

---

## 5. Previewing locally

From the project directory:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

The site can also be opened by double-clicking `index.html`, but a local server
is recommended so that fonts, images and form behaviour match production.

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

Authenticate once:

```bash
npx --yes wrangler@4.86.0 login
```

Deploy with the included script:

```bash
./scripts/deploy.sh
```

The script copies only the public website files into a temporary staging
directory, so `.git`, `.wrangler`, `README.md` and other working files are never
uploaded. It then deploys to the Cloudflare Pages project `sdhhe` on the `main`
branch.

Wrangler prints a deployment URL. The production alias remains
<https://sdhhe.pages.dev/> when deploying to the `main` branch.

### Security and caching headers

The root `_headers` file configures:

- Content Security Policy
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

Cloudflare Pages can be connected to the GitHub repository from the Cloudflare
dashboard:

1. Pages → project `sdhhe` → Settings → Builds & deployments.
2. Connect the repository `manjulaputraphani/SDHHE`.
3. Use branch `main`.
4. Set framework preset to “None”.
5. Leave the build command empty and set the output directory to `/` (or the
   repository root).

The current deployment is a direct upload. Connecting Git integration is optional
and would deploy automatically after each push.

---

## 11. GitHub workflow

Repository: <https://github.com/manjulaputraphani/SDHHE>

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
