/* ==========================================================================
   Viva Writers – publications & e-books data
   Add a paper: copy one object in `papers`. Add a book: copy one in `ebooks`.
   Prices in `ebooks` are optional; leave out `price` to show "See price on Selar".
   ========================================================================== */
window.VIVA_PUBS = {
  scholarUrl: "https://scholar.google.com/citations?user=Vu-ZvskAAAAJ&hl=en",
  selarUrl: "https://selar.com/m/Viva_writers",
  author: "Bildad Awere",
  authorBlurb: "Researcher and founder of Viva Writers. Publishes on monitoring and evaluation, governance and anti-corruption, and gender and livelihoods in East Africa.",
  papers: [
    { title: "AI-driven monitoring and evaluation: The future of transparent and accountable governance in public project implementation",
      authors: "B. Awere, D. M. Masetu", journal: "International Journal of Research and Innovation in Applied Science", volume: "10 (10)", year: 2025, cited: 5,
      topics: ["Monitoring & evaluation", "Governance", "AI"] },
    { title: "Innovations in Monitoring and Evaluation Systems for Project Tracking: Applying Global Best Practices in Nairobi",
      authors: "B. Awere, D. M. Masetu", journal: "International Journal of Research and Scientific Innovation", volume: "12 (10), 955–971", year: 2025,
      topics: ["Monitoring & evaluation", "Project management"] },
    { title: "Big Data and Citizen Feedback Analytics in Monitoring Public Service Performance",
      authors: "B. Awere, D. M. Masetu", journal: "International Journal of Research and Scientific Innovation", volume: "12 (10), 1273–1288", year: 2025,
      topics: ["Monitoring & evaluation", "Big data", "Public service"] },
    { title: "Developmental Evaluation in Complex Governance Systems: Learning and Adaptation in Policy Implementation",
      authors: "B. Awere, D. M. Masetu", journal: "International Journal of Research and Scientific Innovation", volume: "", year: 2025,
      topics: ["Evaluation", "Governance", "Policy"] },
    { title: "Monitoring and Evaluating the Independence of Anti-Corruption Agencies: Political Interference and Institutional Capture in Third World States — Malawi, Nigeria and Kenya",
      authors: "D. M. Masetu, B. Awere", journal: "International Journal of Research and Scientific Innovation", volume: "13 (5), 323–337", year: 2026,
      topics: ["Anti-corruption", "Governance"] },
    { title: "Whistleblowing, Professional Ethics, and Fear of Retaliation: Barriers to Exposing Corruption in the Civil Service of Third World Countries",
      authors: "D. M. Masetu, B. Awere", journal: "International Journal of Research and Scientific Innovation", volume: "13 (5), 338–352", year: 2026,
      topics: ["Anti-corruption", "Ethics", "Civil service"] },
    { title: "Unpaid Care Work and Adolescent Girls: Gendered Labour Systems and Early Economic Pathways",
      authors: "E. L. Anguzuzu, B. Awere", journal: "International Journal of Research and Scientific Innovation", volume: "13 (7), 1645–1657", year: 2026,
      topics: ["Gender", "Labour", "Youth"] },
    { title: "Climate-Resilient Livelihoods among Young Women: Feminist Assessment of Adaptive Strategy and Economic Resilience to the Climate Crisis",
      authors: "E. L. Anguzuzu, B. Awere", journal: "International Journal of Research and Scientific Innovation", volume: "13 (7), 1846–1860", year: 2026,
      topics: ["Gender", "Climate", "Livelihoods"] }
  ],
  /* E-books sold on Selar. Replace these placeholders with your real titles,
     one-line descriptions and the direct product URL from your Selar dashboard. */
  ebooks: [
    { title: "How to Write a Winning Research Proposal", blurb: "Chapters 1–3 step by step, with templates used by East African universities.", url: "https://selar.com/m/Viva_writers", tag: "Guide" },
    { title: "SPSS for Thesis Data Analysis", blurb: "From data entry to chapter 4 tables, with worked examples and interpretation.", url: "https://selar.com/m/Viva_writers", tag: "Data analysis" },
    { title: "Monitoring & Evaluation Essentials", blurb: "Logframes, indicators and results-based M&E for public projects and NGOs.", url: "https://selar.com/m/Viva_writers", tag: "M&E" }
  ]
};
