# Firebase Project Information

## Project Details

- **Project ID**: `ekthaa-2026`
- **Project Number**: `955272392528`
- **Console URL**: [https://console.firebase.google.com/project/ekthaa-2026](https://console.firebase.google.com/project/ekthaa-2026)

## Quick Links

- **Firestore Database**: [https://console.firebase.google.com/project/ekthaa-2026/firestore](https://console.firebase.google.com/project/ekthaa-2026/firestore)
- **Authentication**: [https://console.firebase.google.com/project/ekthaa-2026/authentication](https://console.firebase.google.com/project/ekthaa-2026/authentication)
- **Storage**: [https://console.firebase.google.com/project/ekthaa-2026/storage](https://console.firebase.google.com/project/ekthaa-2026/storage)
- **Project Settings**: [https://console.firebase.google.com/project/ekthaa-2026/settings/general](https://console.firebase.google.com/project/ekthaa-2026/settings/general)
- **Service Accounts**: [https://console.firebase.google.com/project/ekthaa-2026/settings/serviceaccounts/adminsdk](https://console.firebase.google.com/project/ekthaa-2026/settings/serviceaccounts/adminsdk)
- **Usage & Billing**: [https://console.firebase.google.com/project/ekthaa-2026/usage](https://console.firebase.google.com/project/ekthaa-2026/usage)

## Configuration Values

### Backend Configuration

Your service account JSON file should have:
```json
{
  "type": "service_account",
  "project_id": "ekthaa-2026",
  ...
}
```

### Frontend Configuration

Update your `frontend/.env` with:
```env
VITE_FIREBASE_PROJECT_ID=ekthaa-2026
VITE_FIREBASE_AUTH_DOMAIN=ekthaa-2026.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=ekthaa-2026.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=955272392528
```

## Getting Your Credentials

### Backend Service Account Key

1. Go to [Service Accounts](https://console.firebase.google.com/project/ekthaa-2026/settings/serviceaccounts/adminsdk)
2. Click **"Generate New Private Key"**
3. Save the JSON file securely
4. Add path to `backend/.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
   ```

### Frontend Web App Config

**First, Register a Web App:**

1. Go to [Project Settings](https://console.firebase.google.com/project/ekthaa-2026/settings/general)
2. Scroll to **"Your apps"** section
3. Since you have no apps yet, click **"Add app"** or the **Web icon** (`</>`)
4. Register your app:
   - **App nickname**: `Kathape Business Web` (or any name you prefer)
   - **Firebase Hosting**: Check this if you plan to use Firebase Hosting (optional)
5. Click **"Register app"**
6. Copy the configuration values shown:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",  // Copy this
     authDomain: "ekthaa-2026.firebaseapp.com",  // Already set
     projectId: "ekthaa-2026",  // Already set
     storageBucket: "ekthaa-2026.appspot.com",  // Already set
     messagingSenderId: "955272392528",  // Already set
     appId: "1:955272392528:web:...",  // Copy this
     measurementId: "G-..."  // Copy this
   };
   ```
7. Click **"Continue to console"**
8. Update `frontend/.env` with these values

## Firestore Collections

Your database will use these collections:
- `users` - User accounts
- `businesses` - Business profiles
- `customers` - Customer records
- `customer_credits` - Credit balances
- `transactions` - Transaction history
- `recurring_transactions` - Scheduled transactions
- `products` - Product inventory
- `vouchers` - Voucher management
- `offers` - Special offers

## Security Rules Setup

1. Go to [Firestore Rules](https://console.firebase.google.com/project/ekthaa-2026/firestore/rules)
2. Update rules as needed for your security requirements
3. Test rules before deploying to production

## Next Steps

1. ✅ Firebase project created (ekthaa-2026)
2. [ ] **Register a web app** in Firebase Console (click "Add app" or `</>` icon)
3. [ ] **Enable Firestore Database**: Go to [Firestore](https://console.firebase.google.com/project/ekthaa-2026/firestore) → Create Database
4. [ ] **Download service account key** for backend
5. [ ] **Copy web app config** values (API Key, App ID, Measurement ID)
6. [ ] Configure environment variables in `.env` files
7. [ ] Run setup script: `./setup-firebase.sh`
8. [ ] Test the application
9. [ ] Deploy to production

## Monitoring

Keep track of your usage at:
- [Usage Dashboard](https://console.firebase.google.com/project/ekthaa-2026/usage)

Set up billing alerts to avoid surprises!

---

**Important**: Never commit your service account key or API keys to version control!
