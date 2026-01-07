# Firebase Migration Checklist

Use this checklist to ensure a smooth migration from Appwrite to Firebase.

## Pre-Migration

- [ ] Read [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)
- [ ] Read [FIREBASE_MIGRATION.md](FIREBASE_MIGRATION.md)
- [ ] Backup existing Appwrite data
- [ ] Create Firebase project
- [ ] Enable Firestore Database in Firebase Console

## Firebase Setup

### Backend Configuration
- [ ] Download Firebase service account key JSON file
- [ ] Save it securely (never commit to git!)
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Add `FIREBASE_SERVICE_ACCOUNT_PATH` to backend `.env`
- [ ] Add `JWT_SECRET_KEY` to backend `.env`
- [ ] Add `SECRET_KEY` to backend `.env`
- [ ] Add Cloudinary credentials (if using file uploads)

### Frontend Configuration
- [ ] Get Firebase web app config from console
- [ ] Copy `frontend/.env.example` to `frontend/.env`
- [ ] Add all `VITE_FIREBASE_*` variables
- [ ] Add `VITE_API_URL` (backend URL)

## Installation

- [ ] Run `./setup-firebase.sh` OR manually install dependencies:
  - [ ] Backend: `cd backend && pip install -r requirements.txt`
  - [ ] Frontend: `cd frontend && npm install`

## Data Migration (If Needed)

- [ ] Verify `appwrite_utils.py` still exists
- [ ] Run migration: `cd backend && python migrate_data.py`
- [ ] Verify data in Firebase Console
- [ ] Compare document counts between Appwrite and Firebase
- [ ] Test critical data (users, businesses, transactions)

## Testing

### Backend Tests
- [ ] Start backend: `cd backend && python app.py`
- [ ] Test health endpoint: `curl http://localhost:5003/api/health`
- [ ] Test registration
- [ ] Test login
- [ ] Test create customer
- [ ] Test create transaction
- [ ] Test list operations
- [ ] Test update operations
- [ ] Test delete operations
- [ ] Test search functionality
- [ ] Check backend logs for errors

### Frontend Tests
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Open app in browser
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test dashboard loads
- [ ] Test customer management
- [ ] Test transaction management
- [ ] Test product management (if applicable)
- [ ] Test all navigation
- [ ] Check browser console for errors

### Integration Tests
- [ ] Create test user
- [ ] Add test customers
- [ ] Create test transactions
- [ ] Update test data
- [ ] Delete test data
- [ ] Verify data in Firebase Console
- [ ] Test file uploads (if applicable)
- [ ] Test mobile app (if applicable)

## Security

- [ ] Update Firestore Security Rules in console
- [ ] Never commit `.env` files to git
- [ ] Never commit service account keys to git
- [ ] Add `.env` to `.gitignore`
- [ ] Add `serviceAccountKey.json` to `.gitignore`
- [ ] Review IAM permissions for service account
- [ ] Enable Firebase App Check (recommended)

## Performance

- [ ] Check query performance in Firebase Console
- [ ] Create composite indexes if needed
- [ ] Monitor read/write operations
- [ ] Set up caching if needed
- [ ] Test with production-like data volumes

## Monitoring

- [ ] Set up Firebase alerts for:
  - [ ] High read operations
  - [ ] High write operations
  - [ ] Error rate
  - [ ] Quota limits
- [ ] Enable Firebase Crashlytics (optional)
- [ ] Enable Firebase Analytics (optional)
- [ ] Set up logging/monitoring

## Deployment

### Backend Deployment
- [ ] Choose hosting platform (Render, Railway, Google Cloud, etc.)
- [ ] Set environment variables on platform
- [ ] Use `FIREBASE_SERVICE_ACCOUNT_JSON` (not file path) for deployment
- [ ] Deploy backend
- [ ] Test deployed backend endpoints
- [ ] Check deployment logs

### Frontend Deployment
- [ ] Choose hosting platform (Vercel, Netlify, Firebase Hosting, etc.)
- [ ] Set environment variables on platform
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Deploy frontend
- [ ] Test deployed frontend
- [ ] Check browser console for errors

## Post-Deployment

- [ ] Test all features in production
- [ ] Monitor Firebase Console for usage
- [ ] Monitor backend logs
- [ ] Check error rates
- [ ] Verify billing/usage is within expectations
- [ ] Update documentation with production URLs
- [ ] Notify team/users of migration

## Rollback Plan (If Needed)

- [ ] Keep `appwrite_utils.py` for at least 30 days
- [ ] Document rollback steps:
  1. [ ] Revert imports in `app.py`
  2. [ ] Restore `appwrite` in `requirements.txt`
  3. [ ] Restore Appwrite environment variables
  4. [ ] Redeploy with Appwrite

## Cleanup (After Successful Migration)

- [ ] Monitor for 1-2 weeks
- [ ] Verify everything works smoothly
- [ ] Archive Appwrite data (optional)
- [ ] Cancel Appwrite subscription (if applicable)
- [ ] Remove `appwrite_utils.py` (optional, after 30 days)
- [ ] Update project documentation
- [ ] Celebrate! 🎉

## Support Resources

- [ ] Bookmark Firebase Console
- [ ] Bookmark Firestore Console
- [ ] Save [Firebase Status Page](https://status.firebase.google.com/)
- [ ] Join Firebase Community
- [ ] Read [Firebase Best Practices](https://firebase.google.com/docs/firestore/best-practices)

## Notes

_Use this space for migration-specific notes:_

```
Date started: _______________
Expected completion: _______________
Team members involved: _______________
Issues encountered: _______________
Solutions: _______________
```

---

**Pro Tips:**
- Test in a development environment first
- Keep Appwrite running during initial migration
- Monitor Firebase usage closely in first week
- Set up billing alerts to avoid surprises
- Document any custom configurations
- Create a backup schedule for Firebase data

