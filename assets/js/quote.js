/* ==========================================================================
   Viva Writers – quote engine
   Pure functions shared by the home-page estimator, the pricing calculator
   and the order page. Reads rates from window.VIVA (config.js).
   ========================================================================== */
(function () {
  "use strict";
  var C = window.VIVA || {};

  function round(kes, cur) {
    if (cur === "UGX") return Math.round((kes * (C.kesToUgx || 28)) / 500) * 500;
    return Math.round(kes / 50) * 50;
  }
  function format(kes, cur) {
    return cur + " " + round(kes, cur).toLocaleString("en-KE");
  }

  /* Pick the urgency tier from hours remaining until the deadline */
  function tierForHours(hours) {
    var keys = Object.keys(C.urgency || {});
    for (var i = 0; i < keys.length; i++) {
      var t = C.urgency[keys[i]];
      if (hours <= t.maxHours) return Object.assign({ key: keys[i] }, t);
    }
    var last = keys[keys.length - 1];
    return Object.assign({ key: last }, C.urgency[last]);
  }

  /* Suggested delivery date: never later than the deadline, and for
     standard jobs we promise a day early.                                  */
  function deliveryFor(deadline, tier) {
    var d = new Date(deadline.getTime());
    if (tier.key === "standard") d.setHours(d.getHours() - 24);
    return d;
  }

  /*
    opts = {
      service:  key in C.rates          (required)
      words:    number                  (for per-page services; pages derived)
      pages:    number                  (alternative to words)
      urgencyKey: key in C.urgency      (either this...)
      deadline: Date                    (...or this)
      quality:  key in C.quality        (default "standard")
      subject:  key in C.subjects       (default "general")
      slides:   number                  (optional extra)
      currency: "KES" | "UGX"
    }
  */
  function compute(opts) {
    var rate = C.rates[opts.service];
    if (!rate) return null;
    var wpp = C.wordsPerPage || 275;
    var pages = opts.pages;
    if (!pages && opts.words) pages = opts.words / wpp;
    pages = Math.max(1, Math.ceil(pages || 1));
    var words = opts.words || pages * wpp;

    var tier;
    if (opts.deadline instanceof Date && !isNaN(opts.deadline)) {
      var hours = (opts.deadline.getTime() - Date.now()) / 36e5;
      tier = tierForHours(Math.max(0, hours));
    } else {
      tier = Object.assign({ key: opts.urgencyKey }, C.urgency[opts.urgencyKey] || C.urgency.standard);
    }
    var quality = C.quality[opts.quality] || C.quality.standard;
    var subject = C.subjects[opts.subject] || C.subjects.general;

    var lines = [];
    var base = rate.unit === "page" ? rate.kes * pages : rate.kes;
    lines.push({
      label: rate.label + (rate.unit === "page" ? " × " + pages + " page" + (pages > 1 ? "s" : "") : ""),
      kes: base
    });
    var running = base;
    if (subject.factor !== 1) {
      var sAdd = running * (subject.factor - 1);
      lines.push({ label: "Technical subject (+" + Math.round((subject.factor - 1) * 100) + "%)", kes: sAdd });
      running += sAdd;
    }
    if (quality.factor !== 1) {
      var qAdd = running * (quality.factor - 1);
      lines.push({ label: "Premium quality (+" + Math.round((quality.factor - 1) * 100) + "%)", kes: qAdd });
      running += qAdd;
    }
    if (tier.factor !== 1) {
      var uAdd = running * (tier.factor - 1);
      lines.push({ label: "Deadline " + tier.label + " (+" + Math.round((tier.factor - 1) * 100) + "%)", kes: uAdd });
      running += uAdd;
    }
    var slides = parseInt(opts.slides, 10) || 0;
    if (slides > 0 && C.extras && C.extras.slides) {
      var slAdd = C.extras.slides.kes * slides;
      lines.push({ label: "Presentation slides × " + slides, kes: slAdd });
      running += slAdd;
    }
    var total = Math.max(C.minOrderKes || 0, running);
    var depositPct = total < (C.fullPaymentBelowKes || 0) ? 100 : (C.depositPercent || 50);
    var cur = opts.currency || C.defaultCurrency || "KES";

    return {
      rate: rate, pages: pages, words: Math.round(words), tier: tier, quality: quality, subject: subject,
      lines: lines, totalKes: total, depositKes: total * depositPct / 100, depositPct: depositPct,
      currency: cur,
      totalText: format(total, cur),
      depositText: format(total * depositPct / 100, cur),
      deliveryBy: opts.deadline instanceof Date && !isNaN(opts.deadline) ? deliveryFor(opts.deadline, tier) : null
    };
  }

  /* Count words in plain text */
  function countWords(text) {
    var m = (text || "").match(/[\p{L}\p{N}]+(?:['’\-.][\p{L}\p{N}]+)*/gu);
    return m ? m.length : 0;
  }

  /* Generate a short order reference, e.g. VW-240911-K7Q2 */
  function reference() {
    var d = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var tail = "";
    for (var i = 0; i < 4; i++) tail += alphabet[Math.floor(Math.random() * alphabet.length)];
    return "VW-" + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + tail;
  }

  window.VivaQuote = { compute: compute, format: format, round: round, tierForHours: tierForHours, countWords: countWords, reference: reference };
})();
