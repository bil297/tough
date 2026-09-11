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

  /* Primary WhatsApp line: clients text 0739 201316. Used for Kenya,
     Uganda and South Sudan. International format, digits only.          */
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
  /* Second line */
  whatsapp2: "254798434285",
  phoneDisplay2: "+254 798 434285",

  /* All orders, files and contact-form messages are e-mailed here. */
  email: "awerebildad@gmail.com",

  /* Where the website sends orders and uploaded files.
     Deploy backend/google-apps-script/Code.gs as a web app from the
     awerebildad@gmail.com Google account (see backend/SETUP.md) and paste
     the web-app URL here. Every order then arrives in that inbox with
     the files attached and saved to Google Drive.
     A Formspree / Getform endpoint also works here.
     Leave empty and the site falls back to WhatsApp / the mail app.    */
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
    spss:       { label: "Quantitative analysis – SPSS", unit: "flat", kes: 20000 },
    rstata:     { label: "Advanced quantitative – R or Stata", unit: "flat", kes: 35000 },
    nvivo:      { label: "Qualitative analysis – NVivo", unit: "flat", kes: 30000 },
    journalfast:{ label: "Journal publication – fast-track journal", unit: "flat", kes: 15000 },
    journaluni: { label: "Journal publication – university journal", unit: "flat", kes: 30000 },
    journaloa:  { label: "Journal publication – open-access international journal", unit: "flat", kes: 100000 },
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
