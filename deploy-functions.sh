#!/bin/bash

# Deploy Supabase Edge Functions
# This script deploys the updated Edge Functions with proper CORS headers

echo "🚀 Deploying Supabase Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run: supabase login"
    exit 1
fi

echo "📦 Deploying create-payment-intent function..."
supabase functions deploy create-payment-intent

echo "📦 Deploying confirm-payment function..."
supabase functions deploy confirm-payment

echo "✅ Functions deployed successfully!"
echo ""
echo "🔧 Make sure your environment variables are set:"
echo "   - STRIPE_SECRET_KEY"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "🧪 Test the functions:"
echo "   curl -X POST https://ngniknstgjpwgnyewpll.supabase.co/functions/v1/create-payment-intent \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'apikey: YOUR_ANON_KEY' \\"
echo "     -d '{\"amount\": 1000, \"currency\": \"usd\"}'"
