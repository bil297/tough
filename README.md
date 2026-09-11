# Viva Writers – website

Static, mobile-first marketing site for Viva Writers, built to convert clients in
Kenya and Uganda. No build step: plain HTML, CSS and JavaScript.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home: hero, services, how it works, why us, prices, testimonials, FAQ |
| `services.html` | Detailed service descriptions with starting prices |
| `pricing.html` | KES / UGX price table, instant quote calculator, payment methods |
| `about.html` | Story, team, promises, coverage of Kenyan and Ugandan cities |
| `contact.html` | Order form that sends via WhatsApp or e-mail, contact lines |
| `404.html` | Not-found page |

## Before going live: edit `assets/js/config.js`

Everything business-specific is in one file. Update:

- `whatsapp.ke` / `whatsapp.ug` – WhatsApp numbers (digits only, e.g. `254712345678`)
- `phoneDisplay` – how the numbers appear on the page
- `email`, `hours`, `responseTime`
- `formEndpoint` – optional Formspree / Getform URL so the contact form posts to your
  inbox. Left empty, the form falls back to WhatsApp or the visitor's e-mail app.
- `kesToUgx` – exchange rate used to show UGX prices
- `rates` and `urgency` – the price list and rush multipliers used by every page and
  by the calculator

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
- Instant quote calculator whose result opens WhatsApp with the estimate included
- Mobile money messaging throughout: M-Pesa, Airtel Money, MTN MoMo
- Deadlines quoted in East Africa Time; local context (KRA, URA, county / district
  tenders, UoN, Makerere, and so on)
- Lightweight (no images beyond an SVG favicon), fast on 3G and low-end phones
- SEO: titles, descriptions, Open Graph image, `ProfessionalService` structured data
  with `areaServed` Kenya and Uganda, sitemap and robots
