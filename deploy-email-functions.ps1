# Deploy Email Edge Functions
# This script deploys the email-related Edge Functions

Write-Host "Deploying Email Edge Functions..." -ForegroundColor Green
Write-Host ""

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "[OK] Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Supabase CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
Write-Host "Checking Supabase login status..." -ForegroundColor Yellow
try {
    $loginCheck = supabase projects list 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "[OK] Logged in to Supabase" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Not logged in to Supabase. Please run: supabase login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deploying send-order-confirmation function..." -ForegroundColor Yellow
supabase functions deploy send-order-confirmation --project-ref ngniknstgjpwgnyewpll

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] send-order-confirmation deployed successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to deploy send-order-confirmation" -ForegroundColor Red
    Write-Host "Please check the error above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Deploying send-order-status-update function..." -ForegroundColor Yellow
supabase functions deploy send-order-status-update --project-ref ngniknstgjpwgnyewpll

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] send-order-status-update deployed successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to deploy send-order-status-update" -ForegroundColor Red
    Write-Host "Please check the error above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] All email functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Verify your environment variables are set in Supabase:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll/settings/functions" -ForegroundColor White
Write-Host "   2. Make sure RESEND_API_KEY is set" -ForegroundColor White
Write-Host ""
Write-Host "Environment variables needed:" -ForegroundColor Yellow
Write-Host "   - RESEND_API_KEY (your Resend API key starting with 're_')" -ForegroundColor White
Write-Host "   - SUPABASE_URL (automatically set)" -ForegroundColor White
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY (automatically set)" -ForegroundColor White
Write-Host ""
Write-Host "To test the functions:" -ForegroundColor Yellow
Write-Host "   1. Place a test order to trigger send-order-confirmation" -ForegroundColor White
Write-Host "   2. Update order status in admin panel to trigger send-order-status-update" -ForegroundColor White
Write-Host "   3. Check browser console and Supabase logs for any errors" -ForegroundColor White
Write-Host ""
Write-Host "Monitor function logs at:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll/logs/edge-functions" -ForegroundColor Cyan
Write-Host ""
