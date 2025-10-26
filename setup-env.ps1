# Style Yard Emporium - Environment Setup Script (PowerShell)
# This script helps you set up the necessary environment variables

Write-Host "🚀 Style Yard Emporium - Environment Setup" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -notmatch "^[Yy]$") {
        Write-Host "❌ Setup cancelled." -ForegroundColor Red
        exit 1
    }
}

Write-Host "📝 Setting up environment variables..." -ForegroundColor Blue
Write-Host ""

# Create .env.local file
$envContent = @"
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Supabase Configuration
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbmlrbnN0Z2pwd2dueWV3cGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzk2NDAsImV4cCI6MjA3MzkxNTY0MH0.W-alKu6HmRPlzZieJ8vqL-I8Z9k2mJOqilADQJvEmQU
VITE_SUPABASE_URL=https://ngniknstgjpwgnyewpll.supabase.co
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Created .env.local file" -ForegroundColor Green
Write-Host ""

# Prompt for Stripe key
Write-Host "🔑 Stripe Setup Required:" -ForegroundColor Yellow
Write-Host "1. Go to: https://dashboard.stripe.com/apikeys" -ForegroundColor White
Write-Host "2. Copy your Publishable key (starts with pk_test_)" -ForegroundColor White
Write-Host "3. Paste it below (or press Enter to skip and edit manually later)" -ForegroundColor White
Write-Host ""
$stripeKey = Read-Host "Enter your Stripe Publishable Key"

if ($stripeKey) {
    # Replace the placeholder with actual key
    $envContent = $envContent -replace "pk_test_your_publishable_key_here", $stripeKey
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Stripe key updated!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipped Stripe key. You'll need to edit .env.local manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Get your Stripe Secret Key from the same page" -ForegroundColor White
Write-Host "2. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll" -ForegroundColor White
Write-Host "3. Add these environment variables in Settings → Edge Functions:" -ForegroundColor White
Write-Host "   - STRIPE_SECRET_KEY=sk_test_your_secret_key_here" -ForegroundColor Gray
Write-Host "   - RESEND_API_KEY=re_your_resend_api_key_here" -ForegroundColor Gray
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 For complete setup instructions, see: COMPLETE_SETUP_GUIDE.md" -ForegroundColor Blue
Write-Host ""
Write-Host "🎉 Environment setup complete!" -ForegroundColor Green
