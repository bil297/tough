/* ==========================================================================
   Viva Writers – site configuration
   --------------------------------------------------------------------------
   Everything business-specific lives here. Edit this file and every page
   updates automatically (phone numbers, WhatsApp links, e-mail, prices).
   Prices below follow the Viva Writing Assistance rate card (KES).
   ========================================================================== */
window.VIVA = {
  brand: "Viva Writers",
  tagline: "Reliable, affordable, trusted research support",

  /* WhatsApp numbers in international format WITHOUT "+" or spaces.
     Kenya 254…, Uganda 256…, South Sudan 211…
     Uganda and South Sudan currently point to the Kenya line; replace
     them when you have local numbers.                                    */
  whatsapp: {
    ke: "254739201316",
    ug: "254739201316",
    ss: "254739201316"
  },
  phoneDisplay: {
    ke: "+254 739 201316",
    ug: "+254 739 201316",
    ss: "+254 739 201316"
  },

  email: "hello@vivawriters.co.ke",

  /* Optional: paste a Formspree / Getform endpoint and the order and
     contact forms will POST to it (files included). Leave empty to fall
     back to WhatsApp / e-mail, which needs no setup.                     */
  formEndpoint: "",

  hours: "Mon – Sun · 7:00 am – 11:00 pm EAT",
  responseTime: "Under 15 minutes on WhatsApp",

  /* Currencies: prices are stored in KES and converted for display.
     USD is used for South Sudan (SSP is too volatile to publish).        */
  defaultCurrency: "KES",
  kesToUgx: 28,
  kesToUsd: 1 / 129,

  /* Maps the country picked in forms to the currency quoted */
  countryCurrency: { Kenya: "KES", Uganda: "UGX", "South Sudan": "USD", Other: "USD" },

  levels: {
    phd:         "PhD / Doctorate",
    masters:     "Master's",
    undergrad:   "Undergraduate (Bachelor's)",
    diploma:     "Diploma",
    certificate: "Certificate"
  },

  /* Services and rates, in KES.
     unit: "chapter" | "page" | "flat" | "quote"
     byLevel: price per level; levels: restrict which levels apply.         */
  rates: {
    thesis: {
      label: "Dissertation, thesis or research proposal", unit: "chapter",
      byLevel: { phd: 40000, masters: 20000, undergrad: 10000, diploma: 8000, certificate: 10000 },
      note: "Per chapter. A proposal is usually chapters 1–3; a full thesis chapters 1–5."
    },
    assignment: {
      label: "Assignment, essay or coursework", unit: "page",
      byLevel: { phd: 500, masters: 400, undergrad: 350, diploma: 350, certificate: 350 },
      note: "Per page of 275 words."
    },
    concept: {
      label: "Concept note", unit: "flat",
      byLevel: { phd: 15000, masters: 10000 }, levels: ["phd", "masters"]
    },
    spss:       { label: "Data analysis – SPSS (quantitative)", unit: "flat", kes: 10000 },
    nvivo:      { label: "Data analysis – NVivo (qualitative)", unit: "flat", kes: 10000 },
    rjava:      { label: "Data analysis – R, Python or Java", unit: "flat", kes: 30000 },
    manuscript: { label: "Journal manuscript preparation (open-access)", unit: "flat", kes: 30000 },
    publication:{ label: "Publication support (paid journal, fees excluded)", unit: "flat", kes: 15000 },
    plagcheck:  { label: "Plagiarism & AI check with report", unit: "flat", kes: 500 },
    plagreduce: { label: "Plagiarism & AI similarity reduction", unit: "quote" }
  },

  /* Turnaround tiers, chosen from the client's deadline (first tier whose
     maxHours >= hours left). Set every factor to 1.0 for flat pricing.  */
  urgency: {
    urgent:   { label: "Under 24 hours", maxHours: 24,       factor: 1.5 },
    rush:     { label: "1 – 3 days",     maxHours: 72,       factor: 1.25 },
    fast:     { label: "3 – 7 days",     maxHours: 168,      factor: 1.1 },
    standard: { label: "7+ days",        maxHours: Infinity, factor: 1.0 }
  },

  /* Optional add-ons priced per unit */
  extras: {
    plagreport: { label: "Plagiarism & AI report", unit: "report", kes: 500 },
    slides:     { label: "Defence / presentation slides", unit: "slide", kes: 300 }
  },

  wordsPerPage: 275,
  minOrderKes: 350,
  depositPercent: 50,
  fullPaymentBelowKes: 3000,
  maxFileMb: 25
};
