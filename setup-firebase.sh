#!/bin/bash

# Firebase Migration Setup Script
# This script helps set up the Firebase environment

set -e

echo "🔥 Firebase Migration Setup"
echo "============================"
echo ""

# Check if we're in the project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Backend setup
echo "📦 Setting up Backend..."
cd backend

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✏️  Please edit backend/.env with your Firebase credentials"
fi

cd ..

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Install dependencies
echo "Installing Node dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✏️  Please edit frontend/.env with your Firebase credentials"
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Edit backend/.env with your Firebase service account credentials"
echo "2. Edit frontend/.env with your Firebase web app credentials"
echo "3. Start the backend: cd backend && source venv/bin/activate && python app.py"
echo "4. Start the frontend: cd frontend && npm run dev"
echo ""
echo "📖 Read FIREBASE_MIGRATION.md for detailed instructions"
