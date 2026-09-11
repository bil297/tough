/**
 * Viva Writers – order & file intake backend (Google Apps Script)
 * ------------------------------------------------------------------
 * Receives orders and contact-form messages from the website, saves
 * every uploaded file to Google Drive, logs the order in a Google Sheet,
 * and e-mails everything (files attached) to TO_EMAIL.
 *
 * Deploy this from the Google account that owns TO_EMAIL as a Web App
 * ("Execute as: Me", "Who has access: Anyone") and paste the web-app URL
 * into assets/js/config.js → formEndpoint. See backend/SETUP.md.
 */

var TO_EMAIL = "awerebildad@gmail.com";     // where orders and files land
var SENDER_NAME = "Viva Writers website";
var ROOT_FOLDER = "Viva Writers Orders";    // created in Google Drive on first order
var LOG_SHEET = "Viva Writers Orders Log";  // created in the folder on first order
var MAX_ATTACH_BYTES = 20 * 1024 * 1024;     // Gmail allows 25 MB per message; keep a margin

/** Health check: open the web-app URL in a browser and you should see OK. */
function doGet() {
  return ContentService.createTextOutput("OK – Viva Writers intake is running")
    .setMimeType(ContentService.MimeType.TEXT);
}

/** Receives POSTed JSON from the website. */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    var type = body.type === "contact" ? "contact" : "order";
    var ref = body.reference || ("VW-" + Utilities.formatDate(new Date(), "Africa/Nairobi", "yyMMdd-HHmm"));
    var now = Utilities.formatDate(new Date(), "Africa/Nairobi", "EEE d MMM yyyy, HH:mm") + " EAT";

    var root = getOrCreateFolder_(DriveApp.getRootFolder(), ROOT_FOLDER);
    var folder = null, links = [], attachments = [], attached = 0, skipped = [];

    var files = Array.isArray(body.files) ? body.files : [];
    if (files.length) {
      folder = getOrCreateFolder_(root, ref + " – " + (body.name || "client"));
      files.forEach(function (f) {
        if (!f || !f.data) return;
        var bytes = Utilities.base64Decode(f.data);
        var blob = Utilities.newBlob(bytes, f.type || "application/octet-stream", f.name || "file");
        var saved = folder.createFile(blob);
        links.push(f.name + " (" + Math.round(bytes.length / 1024) + " KB): " + saved.getUrl());
        if (attached + bytes.length <= MAX_ATTACH_BYTES) { attachments.push(blob); attached += bytes.length; }
        else skipped.push(f.name);
      });
    }

    var subject = type === "contact"
      ? "Website enquiry – " + (body.name || "client") + " – " + (body.service || "")
      : "NEW ORDER " + ref + " – " + (body.service ? labelFor_(body.service) : "") + " – " + (body.quote || "");

    var text = (body.summary || plainSummary_(body)) +
      "\n\nReceived: " + now +
      (body.page ? "\nFrom page: " + body.page : "") +
      (links.length ? "\n\nFiles saved to Google Drive:\n" + links.join("\n") + "\nFolder: " + folder.getUrl() : "\n\nFiles: none uploaded") +
      (skipped.length ? "\n\nToo large to attach (open from Drive): " + skipped.join(", ") : "") +
      (body.phone ? "\n\nReply on WhatsApp: https://wa.me/" + String(body.phone).replace(/[^0-9]/g, "").replace(/^0/, "254") : "");

    var mail = { to: TO_EMAIL, subject: subject, body: text, name: SENDER_NAME };
    if (attachments.length) mail.attachments = attachments;
    if (body.email && /@/.test(body.email)) mail.replyTo = body.email;
    MailApp.sendEmail(mail);

    logRow_(root, [now, ref, type, body.name || "", body.phone || "", body.email || "", body.country || "",
      body.service || "", body.level || "", body.topic || "", body.deadline || "", body.quote || "",
      files.length, folder ? folder.getUrl() : ""]);

    return json_({ ok: true, reference: ref, files: files.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ---------------------------------------------------------------- helpers */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function getOrCreateFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}
function labelFor_(key) {
  var labels = {
    thesis: "Thesis / proposal chapters", assignment: "Assignment", concept: "Concept note",
    spss: "SPSS analysis", rstata: "R / Stata analysis", nvivo: "NVivo analysis",
    journalfast: "Fast-track journal", journaluni: "University journal", journaloa: "Open-access journal",
    plagcheck: "Plagiarism & AI check", plagreduce: "Similarity reduction"
  };
  return labels[key] || key;
}
function plainSummary_(b) {
  var skip = { files: 1, summary: 1, type: 1, page: 1, _gotcha: 1 };
  return Object.keys(b).filter(function (k) { return !skip[k]; })
    .map(function (k) { return k + ": " + b[k]; }).join("\n");
}
function logRow_(root, row) {
  var it = root.getFilesByName(LOG_SHEET), ss;
  if (it.hasNext()) ss = SpreadsheetApp.open(it.next());
  else {
    ss = SpreadsheetApp.create(LOG_SHEET);
    DriveApp.getFileById(ss.getId()).moveTo(root);
    ss.getActiveSheet().appendRow(["Received", "Reference", "Type", "Name", "Phone", "E-mail", "Country",
      "Service", "Level", "Topic", "Deadline", "Quote", "Files", "Drive folder"]);
  }
  ss.getActiveSheet().appendRow(row);
}

/** Run this once from the editor to grant permissions and send a test e-mail. */
function testSetup() {
  var out = doPost({ postData: { contents: JSON.stringify({
    type: "order", reference: "VW-TEST-0001", name: "Test Client", phone: "0712345678",
    country: "Kenya", service: "thesis", level: "masters", topic: "Test order", quote: "KES 60,000",
    summary: "This is a test order from the Apps Script editor.",
    files: [{ name: "hello.txt", type: "text/plain", data: Utilities.base64Encode("Hello from Viva Writers") }]
  }) } });
  Logger.log(out.getContent());
}
