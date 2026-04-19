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





rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'victortamunoibuomi07@gmail.com';
    }

    function isValidRegistration(data) {
      return data.keys().hasOnly([
        'fullName', 'email', 'phone', 'gender', 'ageRange',
        'educationLevel', 'institution', 'stack', 'motivation',
        'heardFrom', 'referralCode', 'createdAt'
      ])
      && data.keys().hasAll([
        'fullName', 'email', 'phone', 'gender', 'ageRange',
        'educationLevel', 'institution', 'stack', 'motivation',
        'heardFrom', 'referralCode', 'createdAt'
      ])
      && data.fullName is string
      && data.fullName.size() >= 2
      && data.fullName.size() <= 100
      && data.email is string
      && data.email.matches('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
      && data.phone is string
      && data.phone.size() >= 10
      && data.phone.size() <= 15
      && data.phone.matches('^[0-9+\\-\\s()]+$')
      && data.gender in ['male', 'female', 'prefer_not_to_say']
      && data.ageRange in ['under_18', '18_25', '26_30', '31_35', '36_plus']
      && data.educationLevel in ['secondary', 'undergraduate', 'graduate', 'postgraduate', 'other']
      && data.institution is string
      && data.institution.size() >= 2
      && data.institution.size() <= 200
      && data.stack in ['data_analytics', 'digital_marketing', 'web_development', 'product_design', 'ai_automation']
      && data.motivation is string
      && data.motivation.size() >= 50
      && data.motivation.size() <= 1000
      && data.heardFrom in ['Instagram', 'Facebook', 'Twitter', 'WhatsApp', 'Friend or Colleague', 'School/University', 'Google Search', 'Email Newsletter', 'Event or Conference', 'Other']
      && data.referralCode is string
      && data.referralCode.size() <= 100
      && data.createdAt is timestamp;
    }

    function isValidLock(data) {
      return data.keys().hasOnly(['registrationId', 'createdAt'])
      && data.keys().hasAll(['registrationId', 'createdAt'])
      && data.registrationId is string
      && data.registrationId.size() > 0
      && data.createdAt is timestamp;
    }

    match /registrations/{registrationId} {
      allow create: if isValidRegistration(request.resource.data);
      allow read, list: if isAdmin();
      allow update, delete: if false;
    }

    match /registrationEmails/{emailKey} {
      allow create: if isValidLock(request.resource.data);
      allow read, list, update, delete: if false;
    }

    match /registrationPhones/{phoneKey} {
      allow create: if isValidLock(request.resource.data);
      allow read, list, update, delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
