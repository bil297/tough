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

  /* ---- Quote calculator ------------------------------------------------ */
  function initCalculator() {
    var form = $("#calc-form");
    if (!form || !C.rates) return;
    var service = $("#calc-service", form);
    var urgency = $("#calc-urgency", form);
    Object.keys(C.rates).forEach(function (key) {
      var o = document.createElement("option");
      o.value = key; o.textContent = C.rates[key].label; service.appendChild(o);
    });
    Object.keys(C.urgency).forEach(function (key) {
      var o = document.createElement("option");
      o.value = key; o.textContent = C.urgency[key].label; urgency.appendChild(o);
    });
    form.addEventListener("input", calculate);
    form.addEventListener("change", calculate);
    calculate();
  }

  function calculate() {
    var form = $("#calc-form");
    if (!form || !C.rates) return;
    var key = $("#calc-service", form).value;
    var rate = C.rates[key];
    if (!rate) return;
    var pagesWrap = $("#calc-pages-wrap", form);
    var pages = Math.max(1, parseInt($("#calc-pages", form).value, 10) || 1);
    var urg = C.urgency[$("#calc-urgency", form).value] || { factor: 1 };
    var base = rate.unit === "page" ? rate.kes * pages : rate.kes;
    var total = base * urg.factor;
    pagesWrap.classList.toggle("hide", rate.unit !== "page");

    $("#calc-amount").textContent = fmt(total);
    $("#calc-summary").textContent =
      rate.label + (rate.unit === "page" ? " · " + pages + " page" + (pages > 1 ? "s" : "") + " (≈" + (pages * 275).toLocaleString() + " words)" : "") +
      " · " + urg.label;
    var msg = "Hello Viva Writers! I'd like a quote.\n" +
      "Service: " + rate.label + "\n" +
      (rate.unit === "page" ? "Length: " + pages + " page(s)\n" : "") +
      "Deadline: " + urg.label + "\n" +
      "Estimate shown on site: " + fmt(total);
    var link = $("#calc-wa");
    if (link) link.href = waLink(currency === "UGX" ? "ug" : "ke", msg);
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
    initCurrency();
    renderPrices();
    initForm();
    markActiveLink();
  });
})();
