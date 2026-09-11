# Viva Writers – website

Static, mobile-first marketing site for Viva Writers, built to convert clients in
Kenya and Uganda. No build step: plain HTML, CSS and JavaScript.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home: hero with 10-second estimator, services, how it works, why us, prices, testimonials, FAQ |
| `order.html` | **Instant quote & order**: upload files, word count in the browser, fixed price, send on WhatsApp / e-mail |
| `services.html` | Detailed service descriptions with starting prices |
| `pricing.html` | KES / UGX price table, instant quote calculator, payment methods |
| `about.html` | Story, team, promises, coverage of Kenyan and Ugandan cities |
| `contact.html` | Order form that sends via WhatsApp or e-mail, contact lines |
| `404.html` | Not-found page |

## How the instant quote works

1. The client picks a service, subject area and quality level on `order.html`.
2. They drop in their files. Word counts are read in the browser (no upload to any
   server): `.docx` via JSZip, `.pdf` via pdf.js, `.txt/.md/.rtf` directly. Other
   types (images, scans, old `.doc`) are accepted but the client types the length.
3. If the files are the document to edit, the counted words set the length. If they
   are instructions, the client enters the required pages or words.
4. `assets/js/quote.js` prices it: base rate × pages, plus technical subject,
   premium quality, deadline tier (worked out from the deadline they set) and
   optional slides. It shows the total, deposit and delivery time in KES or UGX,
   with an order reference like `VW-260911-K7Q2`.
5. "Send order on WhatsApp" opens your Kenya or Uganda line with the full order
   summary. On Android phones the files go with it through the share sheet; elsewhere
   the client attaches them in the chat. "Send by e-mail" posts everything, files
   included, to `formEndpoint` if set, otherwise opens their e-mail app.

All rates, multipliers, deposit rules and file limits are in `assets/js/config.js`.
The site is for clients only; there is no writer-recruitment content, and the FAQ
says so.

## Before going live: edit `assets/js/config.js`

Everything business-specific is in one file. Update:

- `whatsapp.ke` / `whatsapp.ug` – WhatsApp numbers (digits only, e.g. `254712345678`)
- `phoneDisplay` – how the numbers appear on the page
- `email`, `hours`, `responseTime`
- `formEndpoint` – optional Formspree / Getform URL so the contact form posts to your
  inbox. Left empty, the form falls back to WhatsApp or the visitor's e-mail app.
- `kesToUgx` – exchange rate used to show UGX prices
- `rates`, `urgency`, `quality`, `subjects`, `extras`, `depositPercent`,
  `fullPaymentBelowKes`, `minOrderKes`, `maxFileMb` – the pricing rules used by
  every page and by the order system

Also replace `https://vivawriters.africa/` in the `<head>` of each page, `sitemap.xml`
and `robots.txt` with your real domain, and swap the placeholder stats and
testimonials on `index.html` / `about.html` for real ones.

## Running locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploying

The site is static, so it works on GitHub Pages, Netlify, Cloudflare Pages, Vercel,
or any cPanel host: upload the folder as-is. `.nojekyll` is included for GitHub Pages.

## Features aimed at Kenyan and Ugandan clients

- Separate Kenya and Uganda WhatsApp lines, click-to-chat with a pre-filled message
- Floating WhatsApp button on every page
- KES / UGX currency toggle, remembered per visitor; selecting Uganda in the form
  switches to UGX automatically
- Order page that counts the words in uploaded files and quotes a fixed price instantly
- Home-page estimator and pricing calculator that hand off to the order page
- Mobile money messaging throughout: M-Pesa, Airtel Money, MTN MoMo
- Deadlines quoted in East Africa Time; local context (KRA, URA, county / district
  tenders, UoN, Makerere, and so on)
- Lightweight (no images beyond an SVG favicon), fast on 3G and low-end phones
- SEO: titles, descriptions, Open Graph image, `ProfessionalService` structured data
  with `areaServed` Kenya and Uganda, sitemap and robots
