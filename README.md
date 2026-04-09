# Ignite-100

Vite + React landing page for the Ignite-100 application form.

## Local development

```bash
npm install
npm run dev
```

## Firebase setup

This project uses Firebase Firestore for form submissions.

- Firebase config is initialized in [src/lib/firebase.js](./src/lib/firebase.js)
- Registration writes go to the `registrations` collection
- Firestore rules live in [firestore.rules](./firestore.rules)
- Firebase CLI config lives in [firebase.json](./firebase.json)
- Admin dashboard is available at `/?admin=1`
- Admin access is limited to the Firebase auth account with email `admin@techtan.ng`

Before deploying, make sure:

1. Firestore is enabled in your Firebase project.
2. The rules file is deployed.
3. The `registrations` collection is writable for creates only.
4. You have created the admin Firebase Auth user for `admin@techtan.ng`.

## Build

```bash
npm run build
```
