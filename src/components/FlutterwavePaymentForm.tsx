import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { useAuth } from "@/hooks/useAuth";

interface FlutterwavePaymentProps {
  amount: number;       // in Naira (NGN)
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
  onPaymentCancelled: () => void;
}

const FLUTTERWAVE_PUBLIC_KEY =
  import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-XXXX-X";

const FlutterwavePaymentForm = ({
  amount,
  orderId,
  orderNumber,
  customerEmail,
  customerName,
  customerPhone,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancelled,
}: FlutterwavePaymentProps) => {
  const config = {
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `TSY-${orderId}-${Date.now()}`,
    amount: Math.ceil(amount),        // Flutterwave expects whole numbers
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd,bank_transfer",
    customer: {
      email: customerEmail,
      phone_number: customerPhone || "",
      name: customerName,
    },
    customizations: {
      title: "The Style Yard",
      description: `Payment for Order #${orderNumber}`,
      logo: "/IMG_4121.png",
    },
    meta: {
      order_id: orderId,
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const initializePayment = () => {
    handleFlutterPayment({
      callback: (response) => {
        closePaymentModal();
        if (response.status === "successful" || response.status === "completed") {
          onPaymentSuccess(String(response.transaction_id));
        } else {
          onPaymentError("Payment was not completed. Please try again.");
        }
      },
      onClose: () => {
        // User closed the modal without completing payment — cancel the order
        onPaymentCancelled();
      },
    });
  };

  return (
    <div className="border border-[--c-bone] p-6 bg-[--c-ivory]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-[--c-void] flex items-center justify-center">
          <svg className="w-4 h-4 text-[--c-ivory]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <p className="t-label text-[--c-void]">Secure Payment</p>
          <p className="text-xs text-[--c-stone] mt-0.5 font-light">
            Powered by Flutterwave · Cards, USSD, Bank Transfer
          </p>
        </div>
      </div>

      <p className="text-xs text-[--c-stone] mb-5 font-light leading-relaxed">
        Click below to securely pay <strong className="text-[--c-void]">₦{amount.toLocaleString()}</strong> via Flutterwave. You'll be redirected to a secure payment page.
      </p>

      <button
        onClick={initializePayment}
        className="btn-void w-full justify-center"
        style={{ display: "flex" }}
      >
        <span>Pay ₦{amount.toLocaleString()}</span>
        <svg className="w-3 h-3 relative z-10" viewBox="0 0 12 12" fill="none">
          <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <p className="text-center text-[0.6rem] text-[--c-stone] mt-4 tracking-wide">
        256-bit SSL encryption · PCI-DSS compliant
      </p>
    </div>
  );
};

export default FlutterwavePaymentForm;
