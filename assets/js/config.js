/* ==========================================================================
   Viva Writers – site configuration
   --------------------------------------------------------------------------
   Everything business-specific lives here. Edit this file and every page
   updates automatically (phone numbers, WhatsApp links, e-mail, prices).
   ========================================================================== */
window.VIVA = {
  brand: "Viva Writers",
  tagline: "Professional writing services for Kenya & Uganda",

  /* WhatsApp numbers in international format WITHOUT "+" or spaces.
     Kenya numbers start with 254, Uganda numbers with 256.               */
  whatsapp: {
    ke: "254700000000",
    ug: "256700000000"
  },

  /* How the numbers should be displayed on the page */
  phoneDisplay: {
    ke: "+254 700 000 000",
    ug: "+256 700 000 000"
  },

  email: "hello@vivawriters.africa",

  /* Optional: paste a Formspree / Getform / Basin endpoint here and the
     contact form will POST to it. Leave empty to fall back to WhatsApp /
     e-mail (which works with zero setup).                                */
  formEndpoint: "",

  hours: "Mon – Sat · 7:00 am – 10:00 pm EAT",
  responseTime: "Under 15 minutes on WhatsApp",

  /* Default currency shown to visitors: "KES" or "UGX" */
  defaultCurrency: "KES",

  /* Exchange rate used to convert KES prices to UGX (1 KES = x UGX).
     Update occasionally to keep UGX prices sensible.                     */
  kesToUgx: 28,

  /* Prices are in KES. A "page" is 275 words (double-spaced standard).
     unit: "page" | "flat" | "word"                                       */
  rates: {
    proofreading:   { label: "Editing & proofreading",         unit: "page", kes: 250  },
    content:        { label: "Blog, web & SEO content",        unit: "page", kes: 800  },
    research:       { label: "Research, reports & case studies", unit: "page", kes: 700  },
    thesis:         { label: "Thesis & dissertation editing",  unit: "page", kes: 400  },
    cv:             { label: "CV / résumé + cover letter",     unit: "flat", kes: 1500 },
    proposal:       { label: "Business plan or proposal",      unit: "flat", kes: 8000 },
    grant:          { label: "Grant / tender / NGO proposal",  unit: "flat", kes: 12000 },
    speech:         { label: "Speech or presentation script",  unit: "flat", kes: 3500 }
  },

  /* Turnaround multipliers applied to the base price */
  urgency: {
    standard: { label: "7+ days",     factor: 1.0 },
    fast:     { label: "3 – 6 days",  factor: 1.2 },
    rush:     { label: "24 – 48 hrs", factor: 1.5 },
    urgent:   { label: "Under 24 hrs", factor: 2.0 }
  }
};
