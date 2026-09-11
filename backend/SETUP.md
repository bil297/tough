# Getting orders and files into awerebildad@gmail.com

The website is static, so it cannot e-mail files by itself. This 10-minute setup
gives it a free backend that runs inside your own Google account. After it, every
order placed on the site (including every uploaded document) arrives in
**awerebildad@gmail.com** with the files attached, is saved to a **Google Drive**
folder, and is logged in a **Google Sheet**. This happens whether the client presses
"Send order on WhatsApp" or "Send order by e-mail".

## 1. Create the script

1. Sign in to Google as **awerebildad@gmail.com**.
2. Open https://script.google.com and click **New project**.
3. Delete the sample code, paste the whole of `backend/google-apps-script/Code.gs`,
   and press **Save** (name the project "Viva Writers intake").

## 2. Authorise it and send a test e-mail

1. In the function dropdown at the top choose **testSetup** and click **Run**.
2. Google asks for permission (Gmail send, Drive, Sheets). Click **Review permissions**
   → choose the account → **Advanced** → **Go to Viva Writers intake (unsafe)** → **Allow**.
   ("Unsafe" only means the script is your own and not verified by Google.)
3. Check the inbox: you should have an e-mail "NEW ORDER VW-TEST-0001" with `hello.txt`
   attached, a new Drive folder "Viva Writers Orders", and a sheet inside it.

## 3. Deploy as a web app

1. Click **Deploy** → **New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Description: "v1". **Execute as: Me**. **Who has access: Anyone**. Click **Deploy**.
4. Copy the **Web app URL** (it ends in `/exec`). Opening it in a browser should show
   "OK – Viva Writers intake is running".

## 4. Connect the website

Open `assets/js/config.js` and paste the URL:

```js
formEndpoint: "https://script.google.com/macros/s/AKfycb.../exec",
```

Upload the site again. Test by placing an order on the live site with a file.

## Changing things later

- To change the destination address, edit `TO_EMAIL` at the top of `Code.gs`.
- After any edit to `Code.gs`: **Deploy** → **Manage deployments** → pencil icon →
  Version: **New version** → **Deploy**. The URL stays the same.
- Limits on a free Gmail account: about 100 e-mails per day from the script, 25 MB
  of attachments per e-mail. Larger files are still saved to Drive and linked in
  the e-mail.

## If you would rather not use Google

Any form service that accepts file uploads works in the same `formEndpoint` field,
for example Getform (https://getform.io) or Formspree (https://formspree.io, files
need a paid plan). Set the service to forward submissions to awerebildad@gmail.com.
