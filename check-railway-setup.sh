#!/bin/bash

# Railway Setup Checker Script
# This script verifies your Railway deployment configuration

echo "🔍 Railway Setup Checker"
echo "========================"
echo ""

# Check if Railway CLI is installed
echo "1. Checking Railway CLI..."
if command -v railway &> /dev/null; then
    echo "   ✅ Railway CLI is installed"
    railway --version
else
    echo "   ❌ Railway CLI not found"
    echo "   Install: npm install -g @railway/cli"
fi
echo ""

# Check backend files
echo "2. Checking backend files..."
if [ -f "backend/package.json" ]; then
    echo "   ✅ backend/package.json exists"
else
    echo "   ❌ backend/package.json not found"
fi

if [ -f "backend/Procfile" ]; then
    echo "   ✅ backend/Procfile exists"
else
    echo "   ⚠️  backend/Procfile not found (optional)"
fi

if [ -f "backend/railway.toml" ]; then
    echo "   ✅ backend/railway.toml exists"
else
    echo "   ⚠️  backend/railway.toml not found (optional)"
fi
echo ""

# Check environment files
echo "3. Checking environment files..."
if [ -f "admin-dashboard/.env" ]; then
    echo "   ✅ admin-dashboard/.env exists"
    ADMIN_URL=$(grep "NEXT_PUBLIC_API_URL" admin-dashboard/.env | cut -d '=' -f2)
    echo "      Current URL: $ADMIN_URL"
else
    echo "   ❌ admin-dashboard/.env not found"
fi

if [ -f "frontend/.env" ]; then
    echo "   ✅ frontend/.env exists"
    FRONTEND_URL=$(grep "EXPO_PUBLIC_API_URL" frontend/.env | cut -d '=' -f2)
    echo "      Current URL: $FRONTEND_URL"
else
    echo "   ❌ frontend/.env not found"
fi
echo ""

# Check if URLs are still localhost
echo "4. Checking if Railway URLs are configured..."
if [[ "$ADMIN_URL" == *"localhost"* ]]; then
    echo "   ⚠️  Admin dashboard still using localhost"
    echo "      Update with: update-railway-url.sh https://your-app.up.railway.app"
else
    echo "   ✅ Admin dashboard using production URL"
fi

if [[ "$FRONTEND_URL" == *"localhost"* ]]; then
    echo "   ⚠️  Mobile app still using localhost"
    echo "      Update with: update-railway-url.sh https://your-app.up.railway.app"
else
    echo "   ✅ Mobile app using production URL"
fi
echo ""

# Test backend if URL is provided
if [ ! -z "$1" ]; then
    echo "5. Testing backend connection..."
    BACKEND_URL=$1
    echo "   Testing: $BACKEND_URL/api/health"
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health")
    
    if [ "$RESPONSE" = "200" ]; then
        echo "   ✅ Backend is responding (HTTP $RESPONSE)"
        curl -s "$BACKEND_URL/api/health" | python -m json.tool 2>/dev/null || echo ""
    else
        echo "   ❌ Backend not responding (HTTP $RESPONSE)"
    fi
else
    echo "5. Backend connection test skipped"
    echo "   Usage: ./check-railway-setup.sh https://your-app.up.railway.app"
fi
echo ""

echo "========================"
echo "✨ Setup check complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend: cd backend && railway up"
echo "2. Get Railway URL: railway domain"
echo "3. Update apps: ./update-railway-url.sh https://your-app.up.railway.app"
echo "4. Test: ./check-railway-setup.sh https://your-app.up.railway.app"
