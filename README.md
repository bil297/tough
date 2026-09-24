# Viva Writers – website

Static, mobile-first site for Viva Writers (Viva Writing Assistance): research
support and academic writing assistance for students in Kenya, Uganda and South
Sudan. Built to convert clients only; no writer-recruitment content. No build
step: plain HTML, CSS and JavaScript.

## Brand

Colours and logo come from the real Viva Writers mark (the tie-and-star badge).
`--green-*` custom properties in `assets/css/style.css` hold the navy shades and
`--gold-*` hold the sky-blue accent (names are historical — both are shades of
blue now, kept so the many `var(--green-800)` etc. references across the CSS
didn't need renaming). Edit the hex values in the `:root` block to re-theme the
whole site at once.

The logo icon lives at `assets/img/logo-icon.png` (full-res, transparent
background) plus pre-sized `logo-icon-{32,64,180,512}.png`, used for the
favicon, the header/footer mark (`<img class="logo__mark">`) and embedded
(base64) in the Open Graph share image. To swap in an updated logo: replace
`logo-icon.png` with a transparent-background PNG, re-export the same sizes,
and re-render `assets/img/og-image.png` (a headless-browser screenshot of an
HTML template with the logo and brand colours — any tool that can screenshot
HTML to PNG at 1200×630 will do).

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home: hero with 10-second estimator, services, how it works, why us, prices, testimonials, FAQ |
| `order.html` | **Instant quote & order**: upload files, word count in the browser, fixed price, send on WhatsApp / e-mail |
| `services.html` | Detailed service descriptions with starting prices |
| `pricing.html` | Full rate card by academic level in KES / UGX / USD, quick calculator, payment methods |
| `about.html` | Story, team, promises, coverage of Kenya, Uganda and South Sudan |
| `contact.html` | Order form that sends via WhatsApp or e-mail, contact lines |
| `publications.html` | Peer-reviewed papers (Google Scholar) and e-books/study guides (Selar) |
| `404.html` | Not-found page |

## How the instant quote works

1. The client picks a service and academic level (PhD, Master's, Undergraduate,
   Diploma, Certificate) on `order.html`. Chapter-priced services show a chapter
   count; per-page services show a length; "on quote" services (similarity
   reduction) show no price and are confirmed after review.
2. They drop in instructions, rubric, template, drafts or data. Word counts are read
   in the browser for `.docx` (JSZip), `.pdf` (pdf.js) and text files, used when the
   upload is the client's own document to check or edit.
3. `assets/js/quote.js` prices it from the rate card: unit price for the level ×
   chapters or pages, plus a deadline tier worked out from the deadline they set,
   plus optional slides. Total, deposit and delivery time are shown in KES, UGX or
   USD (South Sudan is quoted in USD) with an order reference like `VW-260911-K7Q2`.
4. "Send order on WhatsApp" opens the Kenya, Uganda or South Sudan line with the
   full summary; on Android the files go along through the share sheet. "Send by
   e-mail" posts everything to `formEndpoint` if set, otherwise opens their mail app.

## Publications & e-books: edit `assets/js/publications.js`

`publications.html` lists peer-reviewed papers and e-books, rendered by
`assets/js/pubs-render.js`. Everything lives in `assets/js/publications.js`:

- `scholarUrl` / `selarUrl` – your Google Scholar profile and Selar store links.
  Every `[data-scholar]` / `[data-selar]` link on the site (header, footer, home
  teaser, publications page) points here automatically.
- `papers` – one object per paper: `title`, `authors`, `journal`, `volume`, `year`,
  optional `cited` (citation count) and `topics` (tag chips). Add a new paper by
  copying an existing object. The page sorts by year then citations automatically,
  shows a running paper/citation count, and each title links to a Google Scholar
  search for that exact title (Scholar has no public API for a direct per-paper
  link, so this is the reliable way to land on the right result).
- `ebooks` – one object per Selar product: `title`, `blurb`, `url` (the direct
  product link from your Selar dashboard — falls back to `selarUrl` if omitted),
  optional `tag` and `price`. Replace the three placeholder titles with your real
  ones and paste each book's own Selar URL so "Buy on Selar" opens the right product.
- The home page shows the 3 most-cited papers and the first 3 e-books as a teaser
  (`#pub-featured`, `#ebook-featured`); `publications.html` lists everything.

## Before going live: edit `assets/js/config.js`

Everything business-specific is in one file. Update:

- `whatsapp` / `phoneDisplay` – primary WhatsApp line (+254 739 201316) used for all
  countries; `whatsapp2` / `phoneDisplay2` – second line (+254 798 434285).
- `email` – awerebildad@gmail.com; all orders and files are delivered here.
- `phoneDisplay` – how the numbers appear on the page
- `email`, `hours`, `responseTime`
- `formEndpoint` – the Google Apps Script web-app URL from `backend/SETUP.md`. This
  is what makes uploaded files land in the inbox. Left empty, the site falls back to
  WhatsApp or the visitor's e-mail app.
- `kesToUgx`, `kesToUsd` – exchange rates used to show UGX and USD prices
- `levels`, `rates` (per level, per chapter / page / flat / on quote), `urgency`
  (set every factor to 1.0 for flat pricing), `extras`, `depositPercent`,
  `fullPaymentBelowKes`, `minOrderKes`, `maxFileMb` – the pricing rules used by
  every page and by the order system

The pages, `sitemap.xml` and `robots.txt` use `https://vivawriters.co.ke/`; change it
if the site moves. Swap the placeholder stats and
testimonials on `index.html` / `about.html` for real ones.

## Backend: files into the inbox

`backend/google-apps-script/Code.gs` is a small Google Apps Script that receives
orders from the site, saves the files to Google Drive, logs them in a Google Sheet
and e-mails everything to `TO_EMAIL` with attachments. `backend/SETUP.md` walks
through deploying it from the Gmail account in about ten minutes; no server needed.

## Running locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploying

The site is static, so it works on GitHub Pages, Netlify, Cloudflare Pages, Vercel,
or any cPanel host: upload the folder as-is. `.nojekyll` is included for GitHub Pages.

## Features aimed at Kenyan and Ugandan clients

- Kenya, Uganda and South Sudan WhatsApp lines, click-to-chat with a pre-filled message
- Floating WhatsApp button on every page
- KES / UGX / USD currency toggle, remembered per visitor; the country picked in a
  form sets the currency automatically
- Order page that counts the words in uploaded files and quotes a fixed price instantly
- Home-page estimator and pricing calculator that hand off to the order page
- Mobile money messaging throughout: M-Pesa, Airtel Money, MTN MoMo, m-Gurush, USD
- Deadlines in East Africa Time; local university context (UoN, Kenyatta, Makerere,
  MUST, University of Juba, Upper Nile and more)
- Lightweight (no images beyond an SVG favicon), fast on 3G and low-end phones
- SEO: titles, descriptions, Open Graph image, `ProfessionalService` structured data
  with `areaServed` Kenya, Uganda and South Sudan, sitemap and robots
