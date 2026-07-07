# Guest Admin Portal — Setup Guide

This wedding site now has a private admin page (`admin.html`) where you can add guests
(name + phone number) and send each of them a personalized WhatsApp invitation with a
link to `invitation.html?to=<their name>` — which renders the invitation card with
their name filled into the "MR / MRS / MISS ....." line.

The admin page and guest list are powered by **Firebase** (Authentication + Firestore),
which is free for this scale of usage. You need to do a short one-time setup in the
Firebase console before the admin page will work. It takes about 10 minutes.

## 1. Create a Firebase project

1. Go to <https://console.firebase.google.com/> and sign in with your Google account.
2. Click **Add project**, give it a name (e.g. `nisila-yashmi-wedding`), and finish the
   wizard (you can disable Google Analytics — not needed here).

## 2. Enable Email/Password sign-in (this is your admin login)

1. In the Firebase console, go to **Build → Authentication → Get started**.
2. Under the **Sign-in method** tab, enable **Email/Password**.
3. Go to the **Users** tab → **Add user**. Enter the email and password you (only you)
   will use to log into `admin.html`. This is the only account that will exist — there
   is no public sign-up form, so nobody else can create an account.

## 3. Create a Firestore database

1. Go to **Build → Firestore Database → Create database**.
2. Choose a location close to you, and start in **Production mode**.
3. Once created, go to the **Rules** tab and replace the contents with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /guests/{guestId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   This means: only a signed-in user (i.e. you, once logged into `admin.html`) can
   read or write guest data. Click **Publish**.

## 4. Register a Web App and get your config

1. In the Firebase console, go to **Project settings** (gear icon) → **General**.
2. Under **Your apps**, click the **Web** icon (`</>`) to register a new web app
   (any nickname is fine, e.g. "Wedding Site"). You don't need Firebase Hosting.
3. Firebase will show you a config object like this:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "nisila-yashmi-wedding.firebaseapp.com",
     projectId: "nisila-yashmi-wedding",
     storageBucket: "nisila-yashmi-wedding.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef123456"
   };
   ```

4. Open **`firebase-config.js`** in this project and paste your real values in place
   of the `YOUR_...` placeholders.

   > These values are safe to be public/committed — they only identify your Firebase
   > project. The actual security is enforced by the Firestore rule from step 3
   > (`request.auth != null`), not by keeping this config secret.

## 5. Deploy and use it

1. Commit and push/deploy as usual (Vercel will pick up the static files — no build
   step is required, Firebase is loaded from Google's CDN directly in the browser).
2. Visit `https://<your-site>/admin.html`, sign in with the email/password from step 2.
3. Add a guest (name + phone number, e.g. `0771234567` — Sri Lankan numbers without
   the leading `0` or with a `+94` prefix are also handled automatically).
4. Click **📲 Send via WhatsApp** — this opens WhatsApp Web/App with a pre-filled
   message (wedding details + their personal invitation link) addressed to that
   guest's number. Review it and hit **Send** yourself (there's no way to send
   WhatsApp messages fully automatically without the paid, business-verified
   WhatsApp Business API).
5. When the guest opens their link, `invitation.html` reads the `?to=` name from the
   URL and fills it into the invitation card in place of "MR / MRS / MISS .....".

## Notes

- `admin.html` is intentionally **not linked** from the main site navigation, but it
  is not truly hidden — the real protection is the Firebase Auth login gate, not the
  URL being secret.
- To change the invitation message template or the default country code for phone
  numbers, edit the `WEDDING` object near the top of `admin.js`.
- Guests are stored in a Firestore collection called `guests`, each with `name`,
  `phone`, `invited` (boolean), `createdAt`, and `invitedAt` fields.
