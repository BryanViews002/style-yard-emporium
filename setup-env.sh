#!/bin/bash

# Style Yard Emporium - Environment Setup Script
# This script helps you set up the necessary environment variables

echo "🚀 Style Yard Emporium - Environment Setup"
echo "=========================================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

echo "📝 Setting up environment variables..."
echo ""

# Create .env.local file
cat > .env.local << EOF
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Supabase Configuration
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbmlrbnN0Z2pwd2dueWV3cGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzk2NDAsImV4cCI6MjA3MzkxNTY0MH0.W-alKu6HmRPlzZieJ8vqL-I8Z9k2mJOqilADQJvEmQU
VITE_SUPABASE_URL=https://ngniknstgjpwgnyewpll.supabase.co
EOF

echo "✅ Created .env.local file"
echo ""

# Prompt for Stripe key
echo "🔑 Stripe Setup Required:"
echo "1. Go to: https://dashboard.stripe.com/apikeys"
echo "2. Copy your Publishable key (starts with pk_test_)"
echo "3. Paste it below (or press Enter to skip and edit manually later)"
echo ""
read -p "Enter your Stripe Publishable Key: " stripe_key

if [ ! -z "$stripe_key" ]; then
    # Replace the placeholder with actual key
    sed -i.bak "s/pk_test_your_publishable_key_here/$stripe_key/g" .env.local
    rm .env.local.bak
    echo "✅ Stripe key updated!"
else
    echo "⚠️  Skipped Stripe key. You'll need to edit .env.local manually."
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Get your Stripe Secret Key from the same page"
echo "2. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll"
echo "3. Add these environment variables in Settings → Edge Functions:"
echo "   - STRIPE_SECRET_KEY=sk_test_your_secret_key_here"
echo "   - RESEND_API_KEY=re_your_resend_api_key_here"
echo "4. Run: npm run dev"
echo ""
echo "📖 For complete setup instructions, see: COMPLETE_SETUP_GUIDE.md"
echo ""
echo "🎉 Environment setup complete!"
