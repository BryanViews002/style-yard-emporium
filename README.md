# The Style Yard - E-Commerce Platform

## About

The Style Yard is a luxury fashion and jewelry e-commerce platform built with modern web technologies. Shop our curated collection of contemporary fashion and premium accessories.

## Technologies Used

This project is built with:

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn-ui
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Payments:** Stripe
- **Email:** Resend

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account
- Stripe account
- Resend account

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd style-yard-emporium

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Features

- 🛍️ Product catalog with search and filtering
- 🛒 Shopping cart and wishlist
- 💳 Secure payment processing with Stripe
- 📧 Email notifications (order confirmations, status updates)
- 👤 User authentication and profiles
- 📦 Order management and tracking
- 🎨 Admin dashboard for store management
- 📊 Analytics and reporting
- 💎 Coupon and bundle systems
- 📱 Fully responsive design

## Deployment

### Build for Production

```sh
npm run build
```

### Deploy to Netlify/Vercel

1. Connect your repository
2. Set environment variables
3. Deploy!

## Project Structure

```
style-yard-emporium/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React context providers
│   ├── utils/          # Utility functions
│   └── lib/            # Third-party integrations
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
└── public/             # Static assets
```

## License

All rights reserved © 2024 The Style Yard
