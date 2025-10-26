# Style Yard Emporium - Quick Setup Script (PowerShell)
# This script helps you get the application running quickly

Write-Host "🚀 Style Yard Emporium - Quick Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found!" -ForegroundColor Yellow
    Write-Host "Please run the environment setup first:" -ForegroundColor White
    Write-Host "  - Windows: .\setup-env.ps1" -ForegroundColor White
    Write-Host "  - Linux/Mac: ./setup-env.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "Or create .env.local manually with your Stripe keys" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Do you want to continue anyway? (y/N)"
    if ($continue -notmatch "^[Yy]$") {
        Write-Host "❌ Setup cancelled. Please set up environment variables first." -ForegroundColor Red
        exit 1
    }
}

Write-Host "🔧 Checking Supabase CLI..." -ForegroundColor Blue
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Supabase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g supabase
    Write-Host "✅ Supabase CLI installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Make sure you have your Stripe keys in .env.local" -ForegroundColor White
Write-Host "2. Set up Supabase environment variables:" -ForegroundColor White
Write-Host "   - Go to: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll" -ForegroundColor Gray
Write-Host "   - Settings → Edge Functions" -ForegroundColor Gray
Write-Host "   - Add: STRIPE_SECRET_KEY, RESEND_API_KEY" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy Edge Functions:" -ForegroundColor White
Write-Host "   supabase login" -ForegroundColor Gray
Write-Host "   supabase functions deploy create-payment-intent" -ForegroundColor Gray
Write-Host "   supabase functions deploy confirm-payment" -ForegroundColor Gray
Write-Host "   supabase functions deploy seed-products" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Seed the database:" -ForegroundColor White
Write-Host "   supabase functions invoke seed-products" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Start the application:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

$startNow = Read-Host "Do you want to start the development server now? (y/N)"
if ($startNow -match "^[Yy]$") {
    Write-Host "🚀 Starting development server..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host "✅ Setup complete! Run 'npm run dev' when ready." -ForegroundColor Green
}
