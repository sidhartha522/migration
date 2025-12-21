# TWA (Trusted Web Activity) Setup Guide

## Prerequisites

1. ✅ Your web app must be hosted on HTTPS domain
2. ✅ Domain ownership verification (assetlinks.json)
3. ✅ PWA manifest.json (created)
4. ✅ Service Worker (optional but recommended)

## Step 1: Install Bubblewrap CLI

```bash
npm install -g @bubblewrap/cli
```

## Step 2: Host Your App

You need to deploy your React app to a domain with HTTPS. Options:

### Option A: Vercel (Recommended - Free)
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```
Your app will be at: `https://your-app.vercel.app`

### Option B: Netlify (Free)
```bash
cd frontend
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Option C: Firebase Hosting (Free)
```bash
cd frontend
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Step 3: Initialize TWA

Once your app is hosted (e.g., https://kathape-business.vercel.app):

```bash
# Create TWA directory
mkdir -p ../twa-kathape-business
cd ../twa-kathape-business

# Initialize TWA
bubblewrap init --manifest https://kathape-business.vercel.app/manifest.json
```

**Answer the prompts:**
- App name: `Kathape Business`
- Short name: `Kathape`
- Package ID: `com.kathape.business`
- Host: `kathape-business.vercel.app`
- Start URL: `/`
- Theme color: `#7c3aed`
- Background color: `#7c3aed`
- Icon path: Download your logo.png and provide path
- Signing key: Generate new (automatic)

## Step 4: Verify Domain Ownership

Bubblewrap will generate an `assetlinks.json` file. You need to host it at:
```
https://your-domain/.well-known/assetlinks.json
```

### For Vite/React apps:
```bash
# In your frontend project
mkdir -p public/.well-known
cp ../twa-kathape-business/assetlinks.json public/.well-known/

# Redeploy
vercel --prod
```

Verify it's accessible:
```bash
curl https://your-domain/.well-known/assetlinks.json
```

## Step 5: Build APK

```bash
cd ../twa-kathape-business

# Build debug APK
bubblewrap build

# Build release APK (for Play Store)
bubblewrap build --release
```

**Output:**
- Debug: `app-debug.apk`
- Release: `app-release-signed.apk`

## Step 6: Test APK

```bash
# Install on connected Android device
adb install app-debug.apk

# Or manually copy to device and install
```

## Step 7: Play Store Submission

The release APK can be uploaded directly to Google Play Console.

---

## Quick Start Script

For quick setup with Vercel:

```bash
#!/bin/bash

# 1. Build React app
cd frontend
npm run build

# 2. Deploy to Vercel
vercel --prod

# Wait for deployment URL...
# Let's say it's: https://kathape-business.vercel.app

# 3. Initialize TWA
cd ..
mkdir -p twa-kathape-business
cd twa-kathape-business

bubblewrap init \
  --manifest https://kathape-business.vercel.app/manifest.json

# 4. Build APK
bubblewrap build

echo "✅ APK created: app-debug.apk"
```

---

## Advantages Over Capacitor

✅ **No WebView issues** - Uses Chrome browser engine
✅ **Better performance** - Native Chrome rendering
✅ **Smaller APK** - No bundled WebView
✅ **Auto-updates** - Updates happen on your server
✅ **No code changes** - Just host and build
✅ **Play Store ready** - Fully supported by Google

## Limitations

❌ **Android only** - No iOS support
❌ **Requires HTTPS** - Must have hosted domain
❌ **Internet required** - Can't be fully offline (unless PWA with service worker)

---

## Next Steps

1. **Deploy your app to Vercel/Netlify** (takes 5 minutes)
2. **Run bubblewrap init** with your deployed URL
3. **Copy assetlinks.json** to your public/.well-known folder
4. **Redeploy** to make assetlinks.json accessible
5. **Build APK** with bubblewrap build
6. **Test** on Android device
7. **Submit** to Play Store if needed

Ready to proceed? Let me know your preferred hosting platform!
