#!/bin/bash

# TWA Quick Setup Script for Kathape Business
# This script helps you create an APK using Trusted Web Activity

set -e

echo "🚀 Kathape Business - TWA Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if bubblewrap is installed
if ! command -v bubblewrap &> /dev/null; then
    echo -e "${YELLOW}⚠️  Bubblewrap CLI not found. Installing...${NC}"
    npm install -g @bubblewrap/cli
    echo -e "${GREEN}✅ Bubblewrap installed${NC}"
fi

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel installed${NC}"
fi

echo ""
echo "Step 1: Building React app..."
cd frontend
npm run build
echo -e "${GREEN}✅ Build complete${NC}"

echo ""
echo "Step 2: Deploying to Vercel..."
echo -e "${BLUE}Please log in to Vercel if prompted${NC}"
vercel --prod

echo ""
echo -e "${YELLOW}📝 Copy the deployment URL from above (e.g., https://kathape-business.vercel.app)${NC}"
read -p "Enter your deployment URL: " DEPLOY_URL

# Remove trailing slash if present
DEPLOY_URL=${DEPLOY_URL%/}

echo ""
echo "Step 3: Creating TWA project..."
cd ..
mkdir -p twa-kathape-business
cd twa-kathape-business

echo ""
echo -e "${BLUE}Initializing TWA with your deployed app...${NC}"
bubblewrap init --manifest "${DEPLOY_URL}/manifest.json"

echo ""
echo "Step 4: Setting up domain verification..."
if [ -f "assetlinks.json" ]; then
    echo -e "${BLUE}Copying assetlinks.json to frontend...${NC}"
    mkdir -p ../frontend/public/.well-known
    cp assetlinks.json ../frontend/public/.well-known/
    
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Redeploy to make assetlinks.json accessible${NC}"
    echo "Run this command in a new terminal:"
    echo "  cd frontend && vercel --prod"
    echo ""
    read -p "Press Enter after you've redeployed..."
fi

echo ""
echo "Step 5: Building APK..."
bubblewrap build

echo ""
echo -e "${GREEN}✅ SUCCESS! APK created${NC}"
echo ""
echo "📱 APK Location: $(pwd)/app-debug.apk"
echo ""
echo "Next steps:"
echo "1. Copy app-debug.apk to your Android device"
echo "2. Install and test"
echo "3. For release build: bubblewrap build --release"
echo ""
echo -e "${GREEN}Done! 🎉${NC}"
