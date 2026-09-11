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
    if (cur === "USD") return Math.max(1, Math.round(kes * (C.kesToUsd || 1 / 129)));
    return Math.round(kes / 50) * 50;
  }
  function format(kes, cur) {
    return cur + " " + round(kes, cur).toLocaleString("en-KE");
  }
  function currencyFor(country) {
    return (C.countryCurrency && C.countryCurrency[country]) || C.defaultCurrency || "KES";
  }
  function levelsFor(serviceKey) {
    var r = C.rates[serviceKey];
    if (!r) return Object.keys(C.levels);
    if (r.levels) return r.levels;
    if (r.byLevel) return Object.keys(C.levels).filter(function (k) { return r.byLevel[k] != null; });
    return [];
  }
  function unitPrice(rate, level) {
    if (rate.byLevel) {
      if (rate.byLevel[level] != null) return rate.byLevel[level];
      var first = levelsFor_rate(rate)[0];
      return rate.byLevel[first];
    }
    return rate.kes || 0;
  }
  function levelsFor_rate(rate) {
    if (rate.levels) return rate.levels;
    return Object.keys(C.levels).filter(function (k) { return rate.byLevel && rate.byLevel[k] != null; });
  }

  function tierForHours(hours) {
    var keys = Object.keys(C.urgency || {});
    for (var i = 0; i < keys.length; i++) {
      var t = C.urgency[keys[i]];
      if (hours <= t.maxHours) return Object.assign({ key: keys[i] }, t);
    }
    var last = keys[keys.length - 1];
    return Object.assign({ key: last }, C.urgency[last]);
  }
  function deliveryFor(deadline, tier) {
    var d = new Date(deadline.getTime());
    if (tier.key === "standard") d.setHours(d.getHours() - 24);
    return d;
  }

  /*
    opts = { service, level, chapters, words, pages, urgencyKey | deadline (Date),
             extras: { plagreport: n, slides: n }, currency }
  */
  function compute(opts) {
    var rate = C.rates[opts.service];
    if (!rate) return null;
    var cur = opts.currency || C.defaultCurrency || "KES";
    var wpp = C.wordsPerPage || 275;
    var allowed = levelsFor(opts.service);
    var level = allowed.indexOf(opts.level) >= 0 ? opts.level : allowed[0];
    var levelLabel = C.levels[level] || "";

    var tier;
    if (opts.deadline instanceof Date && !isNaN(opts.deadline)) {
      tier = tierForHours(Math.max(0, (opts.deadline.getTime() - Date.now()) / 36e5));
    } else {
      tier = Object.assign({ key: opts.urgencyKey }, C.urgency[opts.urgencyKey] || C.urgency.standard);
    }

    var result = { rate: rate, level: level, levelLabel: levelLabel, tier: tier, currency: cur, lines: [], onQuote: rate.unit === "quote",
                   deliveryBy: opts.deadline instanceof Date && !isNaN(opts.deadline) ? deliveryFor(opts.deadline, tier) : null };
    if (result.onQuote) {
      result.totalKes = 0; result.depositKes = 0; result.depositPct = 0;
      result.totalText = "On quote"; result.depositText = "—";
      return result;
    }

    var price = unitPrice(rate, level);
    var qty = 1, qtyLabel = "";
    if (rate.unit === "chapter") {
      qty = Math.max(1, parseInt(opts.chapters, 10) || 1);
      qtyLabel = " × " + qty + " chapter" + (qty > 1 ? "s" : "");
      result.chapters = qty;
    } else if (rate.unit === "page") {
      var pages = opts.pages;
      if (!pages && opts.words) pages = opts.words / wpp;
      qty = Math.max(1, Math.ceil(pages || 1));
      qtyLabel = " × " + qty + " page" + (qty > 1 ? "s" : "");
      result.pages = qty; result.words = Math.round(opts.words || qty * wpp);
    }
    var base = price * qty;
    result.lines.push({ label: rate.label + (rate.byLevel ? " (" + levelLabel + ")" : "") + qtyLabel, kes: base });
    var running = base;
    if (tier.factor !== 1) {
      var uAdd = running * (tier.factor - 1);
      result.lines.push({ label: "Deadline " + tier.label + " (+" + Math.round((tier.factor - 1) * 100) + "%)", kes: uAdd });
      running += uAdd;
    }
    var ex = opts.extras || {};
    Object.keys(ex).forEach(function (k) {
      var n = parseInt(ex[k], 10) || 0, def = C.extras && C.extras[k];
      if (n > 0 && def) { result.lines.push({ label: def.label + " × " + n, kes: def.kes * n }); running += def.kes * n; }
    });
    var total = Math.max(C.minOrderKes || 0, running);
    var depositPct = total < (C.fullPaymentBelowKes || 0) ? 100 : (C.depositPercent || 50);
    result.totalKes = total; result.depositKes = total * depositPct / 100; result.depositPct = depositPct;
    result.totalText = format(total, cur); result.depositText = format(total * depositPct / 100, cur);
    return result;
  }

  function countWords(text) {
    var m = (text || "").match(/[\p{L}\p{N}]+(?:['’\-.][\p{L}\p{N}]+)*/gu);
    return m ? m.length : 0;
  }
  function reference() {
    var d = new Date(), pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", tail = "";
    for (var i = 0; i < 4; i++) tail += alphabet[Math.floor(Math.random() * alphabet.length)];
    return "VW-" + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + tail;
  }

  window.VivaQuote = { compute: compute, format: format, round: round, currencyFor: currencyFor, levelsFor: levelsFor,
                       unitPrice: unitPrice, tierForHours: tierForHours, countWords: countWords, reference: reference };
})();
