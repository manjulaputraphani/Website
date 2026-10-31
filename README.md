# Sri Durga Hari Hara Enterprises — website

A fast, single-page website for the coffee wholesale, import and export business.
No build step and no frameworks.

**Live site:** <https://sdhhe.pages.dev/>  
**Source:** <https://github.com/manjulaputraphani/SDHHE>

## Preview locally

From this folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Files

```text
index.html                  All page content and SEO metadata
assets/css/styles.css       Layout, three colour themes, light/dark modes
assets/js/site-config.js    Contact details and form endpoints
assets/js/main.js           Theme switcher, menu, flavour finder, calculator, form
assets/fonts/               Self-hosted Libre Caslon Text, IBM Plex Sans and Plex Mono
assets/images/              Optimised photography, logo art, OG image
favicon.svg                 Browser icon
robots.txt                  Search-engine instructions
README.md                   This file
```

## Contact details and the enquiry form

Edit `assets/js/site-config.js` to change:

- email address
- phone number and WhatsApp number
- address
- GSTIN
- IEC code
- form delivery endpoint

The contact panel and footer update automatically from that file. The page also
contains fallback values in `index.html`; update those too if you want the site
to show the new details before JavaScript loads.

### Form delivery

The form uses [FormSubmit](https://formsubmit.co) and delivers to the email in
`site-config.js`. It works without JavaScript through the standard endpoint, and
in-page through the AJAX endpoint.

**Important:** FormSubmit sends a one-time activation link to the trade-desk inbox
on the first submission. Open that email and activate the form before testing it
with buyers. After activation, enquiries arrive by email.

To use Formspree instead, create a form at Formspree and replace both URLs in
`site-config.js` with your Formspree endpoint. The site's JavaScript posts to
`ajaxEndpoint`, so an endpoint ending in `/f/your-form-id` is the only change
needed. Remove the FormSubmit-specific hidden fields if your service requires it.

The form includes a honeypot field and a mailto fallback if delivery fails.

## Before launch — quick checklist

1. **Confirm the trade-desk details.** The current email, phone and GSTIN came
   from the available business invoice. Confirm them and replace the IEC text
   with the actual IEC number in `assets/js/site-config.js`.
2. **Add the full address.** The current location is “Bengaluru, Karnataka, India”.
3. **Activate FormSubmit** from the trade-desk inbox, then send a live test.
4. **If you add a custom domain**, replace `https://sdhhe.pages.dev/` in the
   canonical URL, OG metadata, JSON-LD, `robots.txt` and `sitemap.xml`.
5. Update the JSON-LD block in `index.html` if the contact details differ from
   what is currently in `site-config.js`.
6. Test the page at 400px and on desktop in all three themes, in light and dark mode.

## Hosting on Cloudflare Pages

The site is live on Cloudflare Pages at <https://sdhhe.pages.dev/>.
To publish an update from this folder, after signing in to Cloudflare with
`npx wrangler@4.86.0 login`:

```bash
npx --yes wrangler@4.86.0 pages deploy . --project-name sdhhe --branch main --commit-dirty=true
```

The repository can also be connected to Cloudflare Pages from the Cloudflare
dashboard for automatic deployments on every push. The included `_headers` file
sets security headers and sensible cache lifetimes on Cloudflare.


## Updating content

- **Page copy** — `index.html`, grouped under comments such as `Our roots`,
  `Trade`, `Origins`, `Coffee knowledge`, `Commitment` and `Enquiry`.
- **Origins table** — rows inside `.origins-table` in `index.html`.
- **Flavour finder results** — the `flavourData` object in `assets/js/main.js`.
- **Brew ratios** — the `<select>` options and `.brew-table` rows in
  `index.html`; the calculator reads the `data-ratio` values.
- **Contact details** — `assets/js/site-config.js`.
- **Logo** — the inline SVG with class `brand__mark` appears in the header and
  footer. Replace both with your supplied logo, preserving its aspect ratio.
- **Theme colours** — the six theme blocks at the top of `assets/css/styles.css`.

## What is included

- Three colour themes: Espresso, Cherry and Estate.
- Light and dark mode for each theme; both choices are remembered in `localStorage`.
- Responsive layouts from 320px upwards, with no horizontal page scrolling.
- Sticky, keyboard-accessible navigation and a mobile disclosure menu.
- A keyboard-operable flavour finder.
- A live brew-ratio calculator synced to the brew table.
- SEO title, description, Open Graph and Twitter metadata, and LocalBusiness JSON-LD.
- Self-hosted fonts and optimised local images. No third-party scripts or trackers.

## Credits

Photography:

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

Images are used under the Unsplash and Pexels licences. They are for atmosphere
and reference and are not photographs of the company’s own products.

Fonts: Libre Caslon Text and IBM Plex Sans/Mono, used under the SIL Open Font
License. The font files are self-hosted in `assets/fonts/`.
# SDHHE
