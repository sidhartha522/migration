# 🔥 Firebase Migration Quick Start

## Quick Setup

Run the automated setup script:

```bash
./setup-firebase.sh
```

This will:
- Install backend dependencies (Python packages)
- Install frontend dependencies (Node packages)
- Create `.env` files from examples
- Set up the environment

## Manual Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Firebase credentials
python app.py
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev
```

## Get Firebase Credentials

### Backend (Service Account)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file and add path to `.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
   ```

### Frontend (Web App Config)

1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" section
3. Click web icon (</>) or add a new web app
4. Copy the config values to frontend `.env`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   # etc.
   ```

## Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose "Start in production mode" or "Test mode"
4. Select a location close to your users

## Complete Migration Guide

See [FIREBASE_MIGRATION.md](FIREBASE_MIGRATION.md) for:
- Detailed setup instructions
- Data migration from Appwrite
- Deployment guide
- Troubleshooting
- API differences

## Key Changes

✅ **Backend**: Uses Firebase Admin SDK via `firebase_utils.py`  
✅ **Frontend**: Firebase Client SDK available in `firebase.js`  
✅ **API**: Backward compatible - no frontend code changes needed  
✅ **Database**: Firestore replaces Appwrite collections  

## Testing

```bash
# Backend
curl -X POST http://localhost:5003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"business_name":"Test","phone_number":"1234567890","password":"test123"}'

# Frontend
# Open http://localhost:5173 and test registration/login
```

## Need Help?

- 📖 Read [FIREBASE_MIGRATION.md](FIREBASE_MIGRATION.md)
- 🔥 Firebase Docs: https://firebase.google.com/docs
- 📊 Firestore Docs: https://firebase.google.com/docs/firestore
