/* ==========================================================================
   Viva Writers – site behaviour
   Reads window.VIVA (assets/js/config.js) and wires up:
   - contact details & WhatsApp click-to-chat links
   - mobile navigation
   - KES / UGX currency switching (remembered per visitor)
   - instant quote calculator
   - contact / order form (Formspree endpoint, WhatsApp or e-mail fallback)
   ========================================================================== */
(function () {
  "use strict";
  var C = window.VIVA || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---- WhatsApp helpers ------------------------------------------------ */
  function waLink(country, message) {
    var number = (C.whatsapp && C.whatsapp[country]) || (C.whatsapp && C.whatsapp.ke) || "";
    var text = message || ("Hello " + (C.brand || "Viva Writers") + ", I'd like a quote for a writing project.");
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
  }

  function fillContactDetails() {
    $$("[data-wa]").forEach(function (a) {
      var country = a.getAttribute("data-wa") || "ke";
      a.href = waLink(country, a.getAttribute("data-wa-text"));
      a.target = "_blank";
      a.rel = "noopener";
    });
    $$("[data-phone]").forEach(function (el) {
      var country = el.getAttribute("data-phone");
      var display = C.phoneDisplay && C.phoneDisplay[country];
      if (!display) return;
      el.textContent = display;
      if (el.tagName === "A") el.href = "tel:+" + C.whatsapp[country];
    });
    $$("[data-email]").forEach(function (el) {
      el.textContent = C.email;
      if (el.tagName === "A") el.href = "mailto:" + C.email;
    });
    $$("[data-hours]").forEach(function (el) { el.textContent = C.hours; });
    $$("[data-response]").forEach(function (el) { el.textContent = C.responseTime; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---- Mobile nav ------------------------------------------------------ */
  function initNav() {
    var toggle = $(".nav-toggle");
    var menu = $(".mobile-nav");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });
  }

  /* ---- Currency -------------------------------------------------------- */
  var currency = C.defaultCurrency || "KES";
  try { currency = localStorage.getItem("viva-currency") || currency; } catch (e) {}

  function fmt(kes, cur) {
    cur = cur || currency;
    if (window.VivaQuote) return window.VivaQuote.format(kes, cur);
    var value = kes;
    if (cur === "UGX") {
      value = Math.round((kes * (C.kesToUgx || 28)) / 500) * 500;
    } else {
      value = Math.round(kes / 50) * 50;
    }
    return cur + " " + value.toLocaleString("en-KE");
  }

  function renderPrices() {
    $$("[data-kes]").forEach(function (el) {
      var kes = parseFloat(el.getAttribute("data-kes"));
      if (isNaN(kes)) return;
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      el.textContent = prefix + fmt(kes) + suffix;
    });
    $$("[data-currency-label]").forEach(function (el) { el.textContent = currency; });
    $$(".currency-toggle button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-currency") === currency));
    });
    calculate();
  }

  function initCurrency() {
    $$(".currency-toggle button").forEach(function (b) {
      b.addEventListener("click", function () {
        currency = b.getAttribute("data-set-currency");
        try { localStorage.setItem("viva-currency", currency); } catch (e) {}
        renderPrices();
      });
    });
    // If the visitor picked Uganda in a form, prefer UGX unless they've chosen already.
    $$("select[name=country]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var saved = null;
        try { saved = localStorage.getItem("viva-currency"); } catch (e) {}
        if (saved) return;
        if (sel.value === "Uganda") { currency = "UGX"; renderPrices(); }
        if (sel.value === "Kenya") { currency = "KES"; renderPrices(); }
      });
    });
  }

  /* ---- Pricing-page calculator ---------------------------------------- */
  function initCalculator() {
    var form = $("#calc-form");
    if (!form || !C.rates || !window.VivaQuote) return;
    var service = $("#calc-service", form);
    var urgency = $("#calc-urgency", form);
    Object.keys(C.rates).forEach(function (key) {
      var o = document.createElement("option");
      o.value = key; o.textContent = C.rates[key].label; service.appendChild(o);
    });
    Object.keys(C.urgency).reverse().forEach(function (key) {
      var o = document.createElement("option");
      o.value = key; o.textContent = C.urgency[key].label; urgency.appendChild(o);
    });
    form.addEventListener("input", calculate);
    form.addEventListener("change", calculate);
    calculate();
  }

  function calculate() {
    var form = $("#calc-form");
    if (!form || !window.VivaQuote) return;
    var key = $("#calc-service", form).value;
    var pages = Math.max(1, parseInt($("#calc-pages", form).value, 10) || 1);
    var q = window.VivaQuote.compute({ service: key, pages: pages, urgencyKey: $("#calc-urgency", form).value, currency: currency });
    if (!q) return;
    $("#calc-pages-wrap", form).classList.toggle("hide", q.rate.unit !== "page");
    $("#calc-amount").textContent = q.totalText;
    $("#calc-summary").textContent = q.rate.label +
      (q.rate.unit === "page" ? " · " + q.pages + " page" + (q.pages > 1 ? "s" : "") + " (≈" + q.words.toLocaleString() + " words)" : "") +
      " · " + q.tier.label;
    var msg = "Hello Viva Writers! I'd like a quote.\nService: " + q.rate.label + "\n" +
      (q.rate.unit === "page" ? "Length: " + q.pages + " page(s)\n" : "") +
      "Deadline: " + q.tier.label + "\nEstimate shown on site: " + q.totalText;
    var link = $("#calc-wa");
    if (link) link.href = waLink(currency === "UGX" ? "ug" : "ke", msg);
    var go = $("#calc-go");
    if (go) go.href = "order.html?service=" + encodeURIComponent(key) + "&pages=" + q.pages + "&country=" + (currency === "UGX" ? "Uganda" : "Kenya");
  }

  /* ---- Home-page estimator ------------------------------------------- */
  function initEstimator() {
    var form = $("#estimator");
    if (!form || !window.VivaQuote) return;
    var service = $("#e-service", form);
    Object.keys(C.rates).forEach(function (key) {
      var o = document.createElement("option");
      o.value = key; o.textContent = C.rates[key].label; service.appendChild(o);
    });
    var dl = $("#e-deadline", form);
    var d = new Date(); d.setDate(d.getDate() + 5);
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    dl.value = d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
    dl.min = new Date().toISOString().slice(0, 10);
    var ctry = $("#e-country", form);
    ctry.value = currency === "UGX" ? "Uganda" : "Kenya";
    function run() {
      var pages = Math.max(1, parseInt($("#e-pages", form).value, 10) || 1);
      var cur = ctry.value === "Uganda" ? "UGX" : "KES";
      var deadline = dl.value ? new Date(dl.value + "T17:00") : null;
      var q = window.VivaQuote.compute({ service: service.value, pages: pages, deadline: deadline, currency: cur });
      if (!q) return;
      $("#e-pages-wrap", form).classList.toggle("hide", q.rate.unit !== "page");
      $("#e-total").textContent = q.totalText;
      $("#e-note").textContent = q.tier.label + " · deposit " + q.depositText;
      $("#e-go").href = "order.html?service=" + encodeURIComponent(service.value) + "&pages=" + q.pages +
        "&country=" + encodeURIComponent(ctry.value) + (dl.value ? "&deadline=" + dl.value + "T17:00" : "");
    }
    form.addEventListener("input", run);
    form.addEventListener("change", run);
    run();
  }

  /* ---- Contact / order form ------------------------------------------- */
  function initForm() {
    var form = $("#order-form");
    if (!form) return;
    var status = $(".form__status", form);

    function collect() {
      var d = {};
      $$("input, select, textarea", form).forEach(function (f) {
        if (f.name && f.name !== "_gotcha") d[f.name] = f.value.trim();
      });
      return d;
    }

    function message(d) {
      return "Hello Viva Writers! New request from the website.\n" +
        "Name: " + d.name + "\n" +
        "Phone / WhatsApp: " + d.phone + "\n" +
        "Country: " + d.country + "\n" +
        "Service: " + d.service + "\n" +
        "Deadline: " + d.deadline + "\n" +
        "Length: " + (d.length || "not specified") + "\n" +
        "Details: " + d.details;
    }

    function show(kind, text) {
      status.className = "form__status " + (kind === "ok" ? "is-ok" : "is-err");
      status.textContent = text;
    }

    // Primary: WhatsApp button composes the message from the form.
    var waBtn = $("#form-wa");
    if (waBtn) {
      waBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        var d = collect();
        var country = d.country === "Uganda" ? "ug" : "ke";
        window.open(waLink(country, message(d)), "_blank", "noopener");
        show("ok", "WhatsApp is opening with your request. If nothing happened, tap the green WhatsApp button at the bottom of the page.");
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if ($("[name=_gotcha]", form) && $("[name=_gotcha]", form).value) return; // bot
      var d = collect();
      var btn = $("button[type=submit]", form);

      if (C.formEndpoint) {
        btn.disabled = true;
        fetch(C.formEndpoint, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(d)
        }).then(function (r) {
          if (!r.ok) throw new Error("Request failed");
          form.reset();
          show("ok", "Thank you! Your request has been received. We'll reply on WhatsApp or e-mail within " + (C.responseTime || "a few minutes").toLowerCase() + ".");
        }).catch(function () {
          show("err", "We couldn't send the form. Please use the WhatsApp button instead, or e-mail " + C.email + ".");
        }).then(function () { btn.disabled = false; });
      } else {
        // No endpoint configured: open the visitor's e-mail app with everything filled in.
        var subject = "Writing request from " + d.name + " (" + d.service + ")";
        window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message(d));
        show("ok", "Your e-mail app should open with the request filled in. Prefer WhatsApp? Use the green button.");
      }
    });
  }

  /* ---- Active nav link ------------------------------------------------- */
  function markActiveLink() {
    var path = location.pathname.split("/").pop() || "index.html";
    $$(".nav a, .mobile-nav a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) a.setAttribute("aria-current", "page");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillContactDetails();
    initNav();
    initCalculator();
    initEstimator();
    initCurrency();
    renderPrices();
    initForm();
    markActiveLink();
  });
})();
