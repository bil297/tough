/* ==========================================================================
   Viva Writers – order & instant-quote page
   - populates the selects from config
   - accepts files by tap or drag-and-drop, counts words in the browser
     (.docx via JSZip, .pdf via pdf.js, text files directly)
   - recalculates the quote on every change (window.VivaQuote)
   - sends the order on WhatsApp (with the files through the phone's share
     sheet when the browser allows it) or by e-mail / form endpoint
   ========================================================================== */
(function () {
  "use strict";
  var C = window.VIVA || {}, Q = window.VivaQuote;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var form = $("#order");
  if (!form || !Q) return;

  var files = [];            // { file, words, status }
  var ref = Q.reference();
  var lastQuote = null;

  /* ---- populate selects ------------------------------------------------ */
  function fill(sel, obj) {
    Object.keys(obj).forEach(function (k) {
      var o = document.createElement("option"); o.value = k; o.textContent = obj[k].label; sel.appendChild(o);
    });
  }
  fill($("#o-service"), C.rates);
  fill($("#o-subject"), C.subjects);
  fill($("#o-quality"), C.quality);
  $$("[data-maxfile]").forEach(function (el) { el.textContent = C.maxFileMb || 25; });
  $("#q-ref").textContent = ref;

  /* default deadline: 5 days from now at 5 pm, and a minimum of +6 hours */
  var dl = $("#o-deadline");
  var d = new Date(); d.setDate(d.getDate() + 5); d.setHours(17, 0, 0, 0);
  dl.value = toLocalInput(d);
  var minD = new Date(Date.now() + 6 * 36e5);
  dl.min = toLocalInput(minD);

  function toLocalInput(date) {
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return date.getFullYear() + "-" + p(date.getMonth() + 1) + "-" + p(date.getDate()) + "T" + p(date.getHours()) + ":" + p(date.getMinutes());
  }

  /* prefill from query string (home-page estimator) */
  var qs = new URLSearchParams(location.search);
  if (qs.get("service") && C.rates[qs.get("service")]) $("#o-service").value = qs.get("service");
  if (qs.get("pages")) { $("#o-pages").value = qs.get("pages"); $("input[name=filerole][value=brief]").checked = true; }
  if (qs.get("deadline")) dl.value = qs.get("deadline");
  if (qs.get("country")) $("#o-country").value = qs.get("country");

  /* ---- file handling --------------------------------------------------- */
  var zone = $("#dropzone"), input = $("#o-files"), list = $("#filelist");
  zone.addEventListener("click", function () { input.click(); });
  zone.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  input.addEventListener("change", function () { addFiles(input.files); input.value = ""; });
  ["dragenter", "dragover"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add("is-over"); }); });
  ["dragleave", "drop"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove("is-over"); }); });
  zone.addEventListener("drop", function (e) { addFiles(e.dataTransfer.files); });

  function addFiles(fileList) {
    Array.prototype.forEach.call(fileList, function (f) {
      if (files.some(function (x) { return x.file.name === f.name && x.file.size === f.size; })) return;
      var entry = { file: f, words: null, status: "counting" };
      if (f.size > (C.maxFileMb || 25) * 1048576) { entry.status = "too large"; }
      files.push(entry);
      if (entry.status === "counting") countFile(entry);
    });
    renderFiles();
  }

  function removeFile(i) { files.splice(i, 1); renderFiles(); applyDetectedWords(); }

  function renderFiles() {
    list.innerHTML = "";
    files.forEach(function (e, i) {
      var li = document.createElement("li");
      var kb = e.file.size > 1048576 ? (e.file.size / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(e.file.size / 1024)) + " KB";
      var note = e.status === "counting" ? "counting words…" :
                 e.status === "too large" ? "too large – send it on WhatsApp instead" :
                 e.status === "unreadable" ? "can't count this type – type the length below" :
                 e.words != null ? e.words.toLocaleString() + " words" : "";
      li.innerHTML = '<span class="filelist__name"></span><span class="filelist__meta"></span><button type="button" class="filelist__rm" aria-label="Remove file">×</button>';
      $(".filelist__name", li).textContent = e.file.name;
      $(".filelist__meta", li).textContent = kb + (note ? " · " + note : "");
      $(".filelist__rm", li).addEventListener("click", function () { removeFile(i); });
      list.appendChild(li);
    });
    $("#q-files").textContent = files.length ? files.length + " file" + (files.length > 1 ? "s" : "") : "none yet";
  }

  /* lazy-load a vendored script once */
  var loaded = {};
  function load(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    return loaded[src];
  }

  function countFile(entry) {
    var f = entry.file, name = f.name.toLowerCase();
    var p;
    if (/\.docx$/.test(name)) p = countDocx(f);
    else if (/\.pdf$/.test(name)) p = countPdf(f);
    else if (/\.(txt|md|rtf|csv)$/.test(name)) p = countText(f);
    else p = Promise.reject(new Error("unsupported"));
    p.then(function (n) { entry.words = n; entry.status = "ok"; })
     .catch(function () { entry.status = "unreadable"; })
     .then(function () { renderFiles(); applyDetectedWords(); });
  }

  function countText(f) {
    return f.text().then(function (t) {
      if (/\.rtf$/i.test(f.name)) t = t.replace(/\\[a-z]+-?\d* ?|[{}]/g, " ");
      return Q.countWords(t);
    });
  }

  function countDocx(f) {
    return load("assets/vendor/jszip.min.js").then(function () {
      return window.JSZip.loadAsync(f);
    }).then(function (zip) {
      var app = zip.file("docProps/app.xml");
      var doc = zip.file("word/document.xml");
      if (!doc) throw new Error("no document.xml");
      return Promise.all([doc.async("string"), app ? app.async("string") : Promise.resolve("")]);
    }).then(function (parts) {
      var m = parts[1].match(/<Words>(\d+)<\/Words>/);
      if (m && parseInt(m[1], 10) > 0) return parseInt(m[1], 10);
      var text = parts[0].replace(/<\/w:p>/g, "\n").replace(/<w:tab\/>/g, " ").replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
      return Q.countWords(text);
    });
  }

  function countPdf(f) {
    return load("assets/vendor/pdf.min.js").then(function () {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "assets/vendor/pdf.worker.min.js";
      return f.arrayBuffer();
    }).then(function (buf) {
      return window.pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var total = 0, chain = Promise.resolve();
      for (var i = 1; i <= pdf.numPages; i++) {
        (function (n) {
          chain = chain.then(function () { return pdf.getPage(n); })
            .then(function (page) { return page.getTextContent(); })
            .then(function (tc) { total += Q.countWords(tc.items.map(function (it) { return it.str; }).join(" ")); });
        })(i);
      }
      return chain.then(function () { return total; });
    });
  }

  /* When the files are the document to edit, sum their words into the length box */
  function applyDetectedWords() {
    var role = $("input[name=filerole]:checked").value;
    var sum = files.reduce(function (a, e) { return a + (e.words || 0); }, 0);
    var wordsEl = $("#o-words");
    if (role === "edit" && sum > 0) {
      wordsEl.value = sum;
      $("#o-pages").value = "";
      wordsEl.dataset.auto = "1";
    } else if (wordsEl.dataset.auto === "1" && sum === 0) {
      wordsEl.value = ""; delete wordsEl.dataset.auto;
    }
    recalc();
  }

  /* ---- recalculation --------------------------------------------------- */
  function currentCurrency() {
    return $("#o-country").value === "Uganda" ? "UGX" : "KES";
  }

  function recalc() {
    var words = parseInt($("#o-words").value, 10) || 0;
    var pages = parseInt($("#o-pages").value, 10) || 0;
    var deadline = dl.value ? new Date(dl.value) : null;
    var q = Q.compute({
      service: $("#o-service").value,
      words: words || undefined,
      pages: !words ? pages : undefined,
      deadline: deadline,
      quality: $("#o-quality").value,
      subject: $("#o-subject").value,
      slides: $("#o-slides").value,
      currency: currentCurrency()
    });
    lastQuote = q;
    if (!q) return;
    var perPage = q.rate.unit === "page";
    var noLength = perPage && !words && !pages;

    $("#q-total").textContent = noLength ? q.currency + " —" : q.totalText;
    $("#q-meta").textContent = noLength
      ? "Add your file or type the length to see the price."
      : q.rate.label + (perPage ? " · " + q.pages + " page" + (q.pages > 1 ? "s" : "") + " (≈" + q.words.toLocaleString() + " words)" : "") + " · " + q.tier.label;
    var ul = $("#q-lines"); ul.innerHTML = "";
    if (!noLength) q.lines.forEach(function (l) {
      var li = document.createElement("li");
      li.innerHTML = "<span></span><span></span>";
      li.firstChild.textContent = l.label; li.lastChild.textContent = Q.format(l.kes, q.currency);
      ul.appendChild(li);
    });
    $("#q-deposit").textContent = noLength ? "—" : q.depositText + " (" + q.depositPct + "%)";
    $("#q-delivery").textContent = q.deliveryBy ? q.deliveryBy.toLocaleString("en-KE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " EAT" : "—";
    $("#slides-row").classList.toggle("hide", !(C.extras && C.extras.slides));
  }

  form.addEventListener("input", recalc);
  form.addEventListener("change", function (e) {
    if (e.target.name === "filerole") applyDetectedWords(); else recalc();
    if (e.target.id === "o-words" && e.target.value) { $("#o-pages").value = ""; delete e.target.dataset.auto; }
    if (e.target.id === "o-pages" && e.target.value) { $("#o-words").value = ""; delete $("#o-words").dataset.auto; }
  });
  $("#o-words").addEventListener("input", function () { if (this.value) { $("#o-pages").value = ""; delete this.dataset.auto; } });
  $("#o-pages").addEventListener("input", function () { if (this.value) { $("#o-words").value = ""; delete $("#o-words").dataset.auto; } });

  /* ---- sending --------------------------------------------------------- */
  function status(kind, text) {
    var s = $("#q-status"); s.className = "form__status " + (kind === "ok" ? "is-ok" : "is-err"); s.textContent = text;
  }
  function data() {
    var d = {};
    $$("input, select, textarea", form).forEach(function (f) {
      if (!f.name || f.name === "_gotcha" || f.type === "file") return;
      if (f.type === "radio") { if (f.checked) d[f.name] = f.value; return; }
      d[f.name] = f.value.trim();
    });
    return d;
  }
  function validate() {
    if (!form.reportValidity()) return false;
    var q = lastQuote;
    if (!q || (q.rate.unit === "page" && !parseInt($("#o-words").value, 10) && !parseInt($("#o-pages").value, 10))) {
      status("err", "Add your file or type the length so we can price the order."); $("#o-words").focus(); return false;
    }
    if ($("[name=_gotcha]").value) return false;
    return true;
  }
  function summary(d) {
    var q = lastQuote;
    var lines = [
      "NEW ORDER " + ref,
      "Name: " + d.name,
      "WhatsApp: " + d.phone,
      (d.email ? "E-mail: " + d.email : null),
      "Country: " + d.country,
      "Service: " + q.rate.label,
      "Topic: " + d.topic,
      "Subject: " + q.subject.label,
      "Quality: " + q.quality.label,
      (q.rate.unit === "page" ? "Length: " + q.pages + " page(s) / ~" + q.words.toLocaleString() + " words" : null),
      (parseInt(d.slides, 10) > 0 ? "Slides: " + d.slides : null),
      "Deadline: " + (dl.value ? new Date(dl.value).toLocaleString("en-KE") + " EAT" : "not set") + " (" + q.tier.label + ")",
      "Files: " + (files.length ? files.map(function (e) { return e.file.name; }).join(", ") : "none") + (d.filerole === "edit" ? " (document to edit)" : " (instructions/reference)"),
      "QUOTE: " + q.totalText + " · deposit " + q.depositText,
      "Instructions: " + d.instructions
    ];
    return lines.filter(Boolean).join("\n");
  }
  function remember() {
    try { localStorage.setItem("viva-last-order", JSON.stringify({ ref: ref, total: lastQuote.totalText, at: Date.now() })); } catch (e) {}
  }

  $("#q-wa").addEventListener("click", function () {
    if (!validate()) return;
    var d = data(); var text = summary(d);
    var country = d.country === "Uganda" ? "ug" : "ke";
    var link = "https://wa.me/" + C.whatsapp[country] + "?text=" + encodeURIComponent(text);
    var shareFiles = files.filter(function (e) { return e.status !== "too large"; }).map(function (e) { return e.file; });
    remember();
    // On phones the share sheet can hand the files straight to WhatsApp.
    if (shareFiles.length && navigator.canShare && navigator.canShare({ files: shareFiles })) {
      navigator.share({ title: "Order " + ref, text: text, files: shareFiles })
        .then(function () { status("ok", "Order " + ref + " shared. If WhatsApp didn't get the files, send them in the chat and quote " + ref + "."); })
        .catch(function () { window.open(link, "_blank", "noopener"); status("ok", "WhatsApp is opening with your order " + ref + ". Attach your files in the chat."); });
    } else {
      window.open(link, "_blank", "noopener");
      status("ok", "WhatsApp is opening with your order " + ref + ". " + (files.length ? "Please attach your file" + (files.length > 1 ? "s" : "") + " in the chat." : ""));
    }
  });

  $("#q-email").addEventListener("click", function () {
    if (!validate()) return;
    var d = data(); var text = summary(d);
    remember();
    if (C.formEndpoint) {
      var fd = new FormData();
      Object.keys(d).forEach(function (k) { fd.append(k, d[k]); });
      fd.append("reference", ref); fd.append("quote", lastQuote.totalText); fd.append("summary", text);
      files.forEach(function (e) { if (e.status !== "too large") fd.append("files", e.file, e.file.name); });
      var btn = $("#q-email"); btn.disabled = true;
      fetch(C.formEndpoint, { method: "POST", headers: { "Accept": "application/json" }, body: fd })
        .then(function (r) { if (!r.ok) throw new Error(); status("ok", "Order " + ref + " received with your files. We'll confirm on WhatsApp shortly."); })
        .catch(function () { status("err", "We couldn't send the order. Please use the WhatsApp button, or e-mail " + C.email + " quoting " + ref + "."); })
        .then(function () { btn.disabled = false; });
    } else {
      location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent("Order " + ref + " – " + lastQuote.rate.label) + "&body=" + encodeURIComponent(text + "\n\n(Please attach your files to this e-mail.)");
      status("ok", "Your e-mail app is opening with order " + ref + ". Attach your files before sending.");
    }
  });

  $("#q-print").addEventListener("click", function () { window.print(); });

  recalc();
})();
