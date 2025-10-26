// Test script for the payment function
// Run this with: node test-payment-function.js

const SUPABASE_URL = "https://ngniknstgjpwgnyewpll.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || "your-anon-key-here";

async function testPaymentFunction() {
  try {
    console.log("🧪 Testing create-payment-intent function...");

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/create-payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          amount: 1000, // $10.00
          currency: "usd",
          metadata: {
            orderId: "test-order-123",
          },
        }),
      }
    );

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error response:", errorText);
      return;
    }

    const data = await response.json();
    console.log("✅ Success! Response data:", data);

    if (data.clientSecret) {
      console.log("✅ Payment intent created successfully");
      console.log("Client Secret:", data.clientSecret.substring(0, 20) + "...");
    } else {
      console.log("❌ No client secret in response");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testPaymentFunction();
