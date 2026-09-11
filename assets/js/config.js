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

  /* Turnaround tiers. The order system works out the tier from the
     client's deadline: the first tier whose maxHours is >= hours left.  */
  urgency: {
    urgent:   { label: "Under 24 hours", maxHours: 24,       factor: 2.0 },
    rush:     { label: "1 – 3 days",     maxHours: 72,       factor: 1.5 },
    fast:     { label: "3 – 7 days",     maxHours: 168,      factor: 1.2 },
    standard: { label: "7+ days",        maxHours: Infinity, factor: 1.0 }
  },

  /* Quality level chosen by the client */
  quality: {
    standard: { label: "Standard – vetted writer + proofread",            factor: 1.0 },
    premium:  { label: "Premium – senior writer + full editor review",    factor: 1.35 }
  },

  /* Subject complexity */
  subjects: {
    general:   { label: "General, business or social sciences",              factor: 1.0 },
    technical: { label: "Technical: law, medicine, engineering, IT, finance", factor: 1.2 }
  },

  /* Optional extras */
  extras: {
    slides: { label: "Presentation slides", unit: "slide", kes: 300 }
  },

  wordsPerPage: 275,
  minOrderKes: 500,
  depositPercent: 50,
  fullPaymentBelowKes: 3000,

  /* Maximum upload size per file, in MB (files are sent to you on
     WhatsApp or through the form endpoint, never stored on the site).  */
  maxFileMb: 25
};
