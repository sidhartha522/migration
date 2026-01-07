# Firebase Migration Guide

This guide covers the migration from Appwrite to Google Cloud Firebase for the Kathape Business application.

## Overview

The application has been migrated from Appwrite to Firebase, replacing:
- **Appwrite Database** → **Firebase Firestore**
- **Appwrite API** → **Firebase Admin SDK (Backend) + Firebase Client SDK (Frontend)**

## What Changed

### Backend Changes

1. **New Files Created**:
   - `backend/firebase_utils.py` - Firebase database utilities (replaces `appwrite_utils.py`)
   - `backend/firebase_query.py` - Query builder compatible with the old Appwrite Query API

2. **Updated Files**:
   - `backend/app.py` - Updated to use `firebase_db` instead of `appwrite_db`
   - `backend/requirements.txt` - Replaced `appwrite==13.6.1` with `firebase-admin==6.5.0`
   - All migration scripts updated to use Firebase

3. **API Compatibility**:
   - The Firebase utilities maintain the same API as Appwrite for backward compatibility
   - All CRUD operations work the same way: `create_document`, `get_document`, `list_documents`, `update_document`, `delete_document`

### Frontend Changes

1. **New Files Created**:
   - `frontend/src/firebase.js` - Firebase configuration and initialization
   - `frontend/.env.example` - Environment variables template

2. **Updated Files**:
   - `frontend/package.json` - Added `firebase` package

3. **Note**: The frontend primarily uses the backend API, so minimal changes are needed. Firebase Client SDK is available for future direct client-side operations if needed.

## Setup Instructions

### Prerequisites

1. **Google Cloud / Firebase Account**
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Firestore Database in your project

2. **Service Account Key**
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely (never commit this to git!)

### Backend Setup

#### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Flask Configuration
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
FLASK_ENV=development

# Firebase Configuration (Choose ONE option)

# Option 1: Local Development - Service Account File Path
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/your/serviceAccountKey.json

# Option 2: Production - Service Account JSON String
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}

# Option 3: Google Application Default Credentials
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/serviceAccountKey.json

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=5003
```

#### 3. Firestore Setup

The Firebase utilities will automatically create documents in these collections:
- `users` - User accounts
- `businesses` - Business profiles
- `customers` - Customer records
- `customer_credits` - Credit balances
- `transactions` - Transaction history
- `recurring_transactions` - Recurring/scheduled transactions
- `products` - Product inventory
- `vouchers` - Voucher/coupon management
- `offers` - Special offers

**Important**: Firestore will create collections automatically when you add the first document. No manual collection creation is needed.

#### 4. Firestore Security Rules (Recommended)

Go to Firestore Database → Rules and add security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow server-side access with service account (no restrictions for Admin SDK)
    // For web/mobile client access, add appropriate rules here
    
    // Example: Allow authenticated users to read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /businesses/{businessId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Add more rules as needed for your use case
  }
}
```

#### 5. Run the Backend

```bash
cd backend
python app.py
```

The server will start on `http://localhost:5003`

### Frontend Setup

#### 1. Install Dependencies

```bash
cd frontend
npm install
```

#### 2. Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API URL
VITE_API_URL=http://localhost:5003/api
```

**To get these values**:
1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" section
3. Click the web app icon (</>) or create a new web app
4. Copy the config values

#### 3. Run the Frontend

```bash
cd frontend
npm run dev
```

The app will start on `http://localhost:5173`

## Data Migration

If you have existing data in Appwrite that needs to be migrated to Firebase:

### Option 1: Manual Export/Import

1. **Export from Appwrite**:
   ```bash
   # Use Appwrite CLI or custom script to export data
   appwrite databases listDocuments --databaseId=kathape_business --collectionId=users
   ```

2. **Import to Firebase**:
   Create a migration script in `backend/`:
   
   ```python
   from firebase_utils import FirebaseDB
   import json
   
   db = FirebaseDB()
   
   # Load exported data
   with open('exported_users.json', 'r') as f:
       users = json.load(f)
   
   # Import to Firebase
   for user in users:
       user_id = user.pop('$id')  # Remove Appwrite's $id field
       db.create_document('users', user_id, user)
   
   print(f"Migrated {len(users)} users")
   ```

### Option 2: Automated Migration Script

Create a comprehensive migration script:

```python
"""
migrate_appwrite_to_firebase.py
Complete data migration from Appwrite to Firebase
"""
from appwrite_utils import AppwriteDB as OldDB
from firebase_utils import FirebaseDB as NewDB

old_db = OldDB()
new_db = NewDB()

collections = ['users', 'businesses', 'customers', 'transactions', 
               'products', 'vouchers', 'offers', 'recurring_transactions']

for collection in collections:
    print(f"Migrating {collection}...")
    
    # Get all documents from Appwrite
    docs = old_db.list_documents(collection)
    
    for doc in docs:
        doc_id = doc.pop('$id')
        # Remove Appwrite-specific fields
        doc.pop('$permissions', None)
        doc.pop('$collectionId', None)
        doc.pop('$databaseId', None)
        
        # Create in Firebase
        new_db.create_document(collection, doc_id, doc)
    
    print(f"✅ Migrated {len(docs)} documents from {collection}")

print("Migration complete!")
```

## Deployment

### Backend Deployment (Render, Railway, etc.)

1. **Add Environment Variables** in your deployment platform:
   ```
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   JWT_SECRET_KEY=your-jwt-secret
   SECRET_KEY=your-secret-key
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

2. **Deploy** - Your platform should automatically install dependencies from `requirements.txt`

### Frontend Deployment (Vercel, Netlify, etc.)

1. **Add Environment Variables**:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_API_URL=https://your-backend-url.com/api
   ```

2. **Deploy** - Build and deploy your frontend

## Key Differences: Appwrite vs Firebase

| Feature | Appwrite | Firebase |
|---------|----------|----------|
| **Database Type** | Document DB | Firestore (Document DB) |
| **Query Syntax** | `Query.equal('field', 'value')` | Same (via firebase_query.py) |
| **Document ID** | `$id` field | Extracted and added as `$id` for compatibility |
| **Authentication** | Built-in | Firebase Auth (available but not currently used) |
| **File Storage** | Built-in | Firebase Storage (available, using Cloudinary) |
| **Real-time** | Realtime subscriptions | Firestore real-time listeners |
| **Pricing** | Free tier available | Free tier + pay-as-you-go |

## Troubleshooting

### Common Issues

1. **"Failed to initialize Firebase"**
   - Check that your service account key is valid
   - Verify the path or JSON string in environment variables
   - Ensure the service account has Firestore permissions

2. **"Permission Denied" errors**
   - Check Firestore Security Rules
   - Verify that the service account has proper IAM roles

3. **"Collection not found"**
   - Firestore creates collections automatically when first document is added
   - Make sure you're using the correct collection names

4. **Query not working as expected**
   - Firebase has different indexing requirements than Appwrite
   - Complex queries may need composite indexes (Firestore will suggest creating them)

### Performance Tips

1. **Use Indexes**: For complex queries, create indexes in Firestore console
2. **Batch Operations**: Use `batch_write()` for multiple operations
3. **Caching**: The Firebase utilities include basic caching (60s TTL)
4. **Pagination**: Use `limit()` and cursor-based pagination for large datasets

## Testing

Before going to production:

1. **Test Registration & Login**
   ```bash
   curl -X POST http://localhost:5003/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"business_name":"Test Business","phone_number":"1234567890","password":"test123"}'
   ```

2. **Test Database Operations**
   - Create a customer
   - Add a transaction
   - List all data
   - Verify data in Firestore console

3. **Test Edge Cases**
   - Empty result sets
   - Large data queries
   - Concurrent operations

## Rollback Plan

If you need to rollback to Appwrite:

1. Keep `appwrite_utils.py` file (don't delete it)
2. Update imports in `app.py`:
   ```python
   from appwrite_utils import AppwriteDB
   appwrite_db = AppwriteDB()
   ```
3. Revert `requirements.txt` to use `appwrite` instead of `firebase-admin`
4. Restore your Appwrite environment variables

## Support & Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Documentation**: https://firebase.google.com/docs/firestore
- **Firebase Admin SDK**: https://firebase.google.com/docs/admin/setup
- **Pricing Calculator**: https://firebase.google.com/pricing

## Next Steps

1. ✅ Migration completed
2. Test all features thoroughly
3. Monitor Firebase usage in console
4. Set up Firebase alerts for quota limits
5. Configure backup/export schedules
6. Consider adding Firebase Authentication for direct client access
7. Explore Firebase Cloud Functions for serverless operations
8. Set up Firebase Analytics for user insights

## Notes

- The backend API remains unchanged from the client perspective
- All existing frontend code continues to work without modifications
- Firebase provides better scalability and global distribution
- Consider using Firebase Authentication instead of JWT tokens in the future
- Firebase Storage can replace Cloudinary if needed
