#!/bin/bash

# Style Yard Emporium - Quick Setup Script
# This script helps you get the application running quickly

echo "🚀 Style Yard Emporium - Quick Setup"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found!"
    echo "Please run the environment setup first:"
    echo "  - Linux/Mac: ./setup-env.sh"
    echo "  - Windows: .\\setup-env.ps1"
    echo ""
    echo "Or create .env.local manually with your Stripe keys"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Please set up environment variables first."
        exit 1
    fi
fi

echo "🔧 Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
    echo "✅ Supabase CLI installed"
else
    echo "✅ Supabase CLI found"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Make sure you have your Stripe keys in .env.local"
echo "2. Set up Supabase environment variables:"
echo "   - Go to: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll"
echo "   - Settings → Edge Functions"
echo "   - Add: STRIPE_SECRET_KEY, RESEND_API_KEY"
echo ""
echo "3. Deploy Edge Functions:"
echo "   supabase login"
echo "   supabase functions deploy create-payment-intent"
echo "   supabase functions deploy confirm-payment"
echo "   supabase functions deploy seed-products"
echo ""
echo "4. Seed the database:"
echo "   supabase functions invoke seed-products"
echo ""
echo "5. Start the application:"
echo "   npm run dev"
echo ""

read -p "Do you want to start the development server now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting development server..."
    npm run dev
else
    echo "✅ Setup complete! Run 'npm run dev' when ready."
fi
