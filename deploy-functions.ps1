# Deploy Supabase Edge Functions
# This script deploys the updated Edge Functions with proper CORS headers

Write-Host "🚀 Deploying Supabase Edge Functions..." -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
try {
    supabase status | Out-Null
    Write-Host "✅ Logged in to Supabase" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Supabase. Please run: supabase login" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Deploying create-payment-intent function..." -ForegroundColor Yellow
supabase functions deploy create-payment-intent

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ create-payment-intent deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy create-payment-intent" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Deploying confirm-payment function..." -ForegroundColor Yellow
supabase functions deploy confirm-payment

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ confirm-payment deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy confirm-payment" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Make sure your environment variables are set:" -ForegroundColor Yellow
Write-Host "   - STRIPE_SECRET_KEY" -ForegroundColor White
Write-Host "   - SUPABASE_URL" -ForegroundColor White
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test the functions:" -ForegroundColor Yellow
Write-Host "   curl -X POST https://ngniknstgjpwgnyewpll.supabase.co/functions/v1/create-payment-intent \" -ForegroundColor White
Write-Host "     -H 'Content-Type: application/json' \" -ForegroundColor White
Write-Host "     -H 'apikey: YOUR_ANON_KEY' \" -ForegroundColor White
Write-Host "     -d '{\"amount\": 1000, \"currency\": \"usd\"}'" -ForegroundColor White
