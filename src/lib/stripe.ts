import { loadStripe, Stripe } from "@stripe/stripe-js";

// Initialize Stripe with your publishable key
const stripePromise: Promise<Stripe | null> = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_your_publishable_key_here"
);

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
