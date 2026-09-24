/* Renders publications and e-books from window.VIVA_PUBS into any page that has
   #pub-list, #ebook-list, #pub-featured or #ebook-featured containers. */
(function () {
  "use strict";
  var D = window.VIVA_PUBS; if (!D) return;
  var $ = function (s) { return document.querySelector(s); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function scholarSearch(title) { return "https://scholar.google.com/scholar?q=" + encodeURIComponent('"' + title + '"'); }

  function paperCard(p, i) {
    var art = el("article", "pub");
    var num = el("span", "pub__num", String(i + 1)); art.appendChild(num);
    var body = el("div", "pub__body");
    var h = el("h3"); var a = el("a", null, p.title); a.href = scholarSearch(p.title); a.target = "_blank"; a.rel = "noopener"; h.appendChild(a); body.appendChild(h);
    body.appendChild(el("p", "pub__meta", p.authors + " · " + p.journal + (p.volume ? " " + p.volume : "") + " · " + p.year));
    var tags = el("div", "pub__tags");
    (p.topics || []).forEach(function (t) { tags.appendChild(el("span", "pub__tag", t)); });
    if (p.cited) tags.appendChild(el("span", "pub__tag pub__tag--cited", "Cited by " + p.cited));
    body.appendChild(tags);
    art.appendChild(body);
    return art;
  }
  function bookCard(b) {
    var art = el("article", "card book");
    var cover = el("div", "book__cover"); cover.appendChild(el("span", null, b.title)); art.appendChild(cover);
    if (b.tag) art.appendChild(el("span", "eyebrow", b.tag));
    art.appendChild(el("h3", null, b.title));
    art.appendChild(el("p", null, b.blurb || ""));
    var price = el("div", "price");
    price.appendChild(el("span", null, b.price || "See price on Selar"));
    var a = el("a", "btn btn--gold btn--sm", "Buy on Selar"); a.href = b.url || D.selarUrl; a.target = "_blank"; a.rel = "noopener";
    price.appendChild(a); art.appendChild(price);
    return art;
  }

  var list = $("#pub-list");
  if (list) {
    var sorted = D.papers.slice().sort(function (a, b) { return b.year - a.year || (b.cited || 0) - (a.cited || 0); });
    sorted.forEach(function (p, i) { list.appendChild(paperCard(p, i)); });
    var count = $("#pub-count"); if (count) count.textContent = D.papers.length;
    var cites = $("#pub-cites"); if (cites) cites.textContent = D.papers.reduce(function (s, p) { return s + (p.cited || 0); }, 0);
    var yrs = D.papers.map(function (p) { return p.year; });
    var span = $("#pub-years"); if (span) span.textContent = Math.min.apply(null, yrs) + "–" + Math.max.apply(null, yrs);
  }
  var feat = $("#pub-featured");
  if (feat) D.papers.slice().sort(function (a, b) { return (b.cited || 0) - (a.cited || 0) || b.year - a.year; }).slice(0, 3).forEach(function (p, i) { feat.appendChild(paperCard(p, i)); });
  var books = $("#ebook-list"); if (books) D.ebooks.forEach(function (b) { books.appendChild(bookCard(b)); });
  var bf = $("#ebook-featured"); if (bf) D.ebooks.slice(0, 3).forEach(function (b) { bf.appendChild(bookCard(b)); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-scholar]"), function (a) { a.href = D.scholarUrl; a.target = "_blank"; a.rel = "noopener"; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-selar]"), function (a) { a.href = D.selarUrl; a.target = "_blank"; a.rel = "noopener"; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-author]"), function (e) { e.textContent = D.author; });
})();
