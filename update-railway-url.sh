#!/bin/bash

# Script to update Railway backend URL across all projects
# Usage: ./update-railway-url.sh https://your-app.up.railway.app

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Railway backend URL"
    echo "Usage: ./update-railway-url.sh https://your-app.up.railway.app"
    exit 1
fi

RAILWAY_URL=$1
API_URL="${RAILWAY_URL}/api"

echo "🚀 Updating Railway backend URL to: $API_URL"
echo ""

# Update Admin Dashboard
echo "📱 Updating Admin Dashboard..."
if [ -f "admin-dashboard/.env" ]; then
    sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$API_URL|g" admin-dashboard/.env
    echo "✅ Admin Dashboard updated"
else
    echo "⚠️  admin-dashboard/.env not found"
fi

# Update Mobile App
echo "📱 Updating Mobile App..."
if [ -f "frontend/.env" ]; then
    sed -i.bak "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=$API_URL|g" frontend/.env
    echo "✅ Mobile App updated"
else
    echo "⚠️  frontend/.env not found"
fi

echo ""
echo "✨ All done! Your apps are now configured to use Railway backend."
echo ""
echo "Next steps:"
echo "1. Rebuild admin dashboard: cd admin-dashboard && npm run build"
echo "2. Restart mobile app: cd frontend && npx expo start"
echo ""
echo "Test your backend: curl $API_URL/health"
