import { loadStripe, Stripe } from "@stripe/stripe-js";

// Initialize Stripe with your publishable key
// Make sure to set VITE_STRIPE_PUBLISHABLE_KEY in your Vercel environment variables
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  console.error('CRITICAL: Stripe publishable key is not set. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables.');
}

const stripePromise: Promise<Stripe | null> = stripeKey 
  ? loadStripe(stripeKey)
  : Promise.resolve(null);

export const getStripe = () => stripePromise;

export interface PaymentIntentData {
  amount: number;
  currency: string;
  metadata?: {
    orderId?: string;
    userId?: string;
    items?: string;
  };
}

export interface PaymentMethodData {
  type: "card";
  card: {
    token: string;
  };
  billing_details?: {
    name?: string;
    email?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}
