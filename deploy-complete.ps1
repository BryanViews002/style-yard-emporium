# Style Yard Emporium - Complete Deployment Script (PowerShell)
# This script handles the complete setup and deployment process

Write-Host "🚀 Style Yard Emporium - Complete Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Blue
if (-not (Test-Path "node_modules")) {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Step 2: Environment setup
Write-Host ""
Write-Host "🔧 Step 2: Environment setup..." -ForegroundColor Blue
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found!" -ForegroundColor Yellow
    Write-Host "Creating .env.local template..." -ForegroundColor White
    
    $envContent = @"
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Supabase Configuration
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbmlrbnN0Z2pwd2dueWV3cGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzk2NDAsImV4cCI6MjA3MzkxNTY0MH0.W-alKu6HmRPlzZieJ8vqL-I8Z9k2mJOqilADQJvEmQU
VITE_SUPABASE_URL=https://ngniknstgjpwgnyewpll.supabase.co
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Created .env.local template" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env.local and add your Stripe publishable key" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Step 3: Check Supabase CLI
Write-Host ""
Write-Host "🔧 Step 3: Checking Supabase CLI..." -ForegroundColor Blue
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Supabase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g supabase
    Write-Host "✅ Supabase CLI installed" -ForegroundColor Green
}

# Step 4: Login to Supabase
Write-Host ""
Write-Host "🔐 Step 4: Supabase authentication..." -ForegroundColor Blue
Write-Host "You need to login to Supabase to deploy functions." -ForegroundColor White
Write-Host "This will open a browser window for authentication." -ForegroundColor White
Write-Host ""
$login = Read-Host "Do you want to login to Supabase now? (y/N)"
if ($login -match "^[Yy]$") {
    try {
        supabase login
        Write-Host "✅ Successfully logged in to Supabase" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to login to Supabase. Please run 'supabase login' manually." -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped Supabase login. You'll need to run 'supabase login' manually." -ForegroundColor Yellow
}

# Step 5: Deploy Edge Functions
Write-Host ""
Write-Host "🚀 Step 5: Deploying Edge Functions..." -ForegroundColor Blue
Write-Host "This will deploy all necessary Edge Functions to Supabase." -ForegroundColor White
Write-Host ""
$deploy = Read-Host "Do you want to deploy Edge Functions now? (y/N)"
if ($deploy -match "^[Yy]$") {
    $functions = @(
        "create-payment-intent",
        "confirm-payment", 
        "send-order-confirmation",
        "send-password-reset",
        "validate-stock",
        "seed-products",
        "get-admin-users",
        "handle-contact-form",
        "send-order-status-update",
        "upload-product-image",
        "check-rate-limit"
    )
    
    foreach ($function in $functions) {
        Write-Host "📦 Deploying $function..." -ForegroundColor Yellow
        try {
            supabase functions deploy $function
            Write-Host "✅ $function deployed successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to deploy $function" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  Skipped function deployment. You can deploy manually later." -ForegroundColor Yellow
}

# Step 6: Seed Database
Write-Host ""
Write-Host "🌱 Step 6: Seeding database..." -ForegroundColor Blue
Write-Host "This will populate the database with sample products and categories." -ForegroundColor White
Write-Host ""
$seed = Read-Host "Do you want to seed the database now? (y/N)"
if ($seed -match "^[Yy]$") {
    try {
        supabase functions invoke seed-products
        Write-Host "✅ Database seeded successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to seed database. You can run 'supabase functions invoke seed-products' manually." -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped database seeding. You can run 'supabase functions invoke seed-products' manually." -ForegroundColor Yellow
}

# Step 7: Final instructions
Write-Host ""
Write-Host "🎯 Final Setup Instructions:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local and add your Stripe publishable key" -ForegroundColor White
Write-Host "2. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ngniknstgjpwgnyewpll" -ForegroundColor White
Write-Host "3. Add these environment variables in Settings → Edge Functions:" -ForegroundColor White
Write-Host "   - STRIPE_SECRET_KEY=sk_test_your_secret_key_here" -ForegroundColor Gray
Write-Host "   - RESEND_API_KEY=re_your_resend_api_key_here" -ForegroundColor Gray
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Create an admin user:" -ForegroundColor White
Write-Host "   - Sign up through the app" -ForegroundColor Gray
Write-Host "   - Go to Supabase Dashboard → Authentication → Users" -ForegroundColor Gray
Write-Host "   - Copy user ID and add to user_roles table with role='admin'" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Start the application:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

$startNow = Read-Host "Do you want to start the development server now? (y/N)"
if ($startNow -match "^[Yy]$") {
    Write-Host "🚀 Starting development server..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host "Deployment complete! Run 'npm run dev' when ready." -ForegroundColor Green
}

Write-Host ""
Write-Host "📖 For detailed instructions, see: COMPLETE_SETUP_GUIDE.md" -ForegroundColor Blue
Write-Host "🎉 Your Style Yard Emporium is ready to go!" -ForegroundColor Green