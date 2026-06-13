import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, ShoppingBag } from "lucide-react";

interface OrderSuccessProps {
  orderNumber: string;
  email: string;
  totalAmount: number;
  onDismiss: () => void;
}

const OrderSuccess = ({ orderNumber, email, totalAmount, onDismiss }: OrderSuccessProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Confetti particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; angle: number; spin: number;
    }> = [];

    const colors = ["#B8965A", "#D4AF70", "#000000", "#C9C3BA", "#F8F5EF"];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        angle: Math.random() * 360,
        spin: (Math.random() - 0.5) * 5,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.angle += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();

        if (p.y > canvas.height + 20) {
          particles.splice(i, 1);
        }
      });

      if (particles.length > 0) {
        animId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  const steps = [
    { icon: CheckCircle, label: "Payment confirmed", done: true },
    { icon: Package, label: "Order processing", done: true },
    { icon: ShoppingBag, label: "Preparing for dispatch", done: false },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-[--c-ivory] flex flex-col items-center justify-center overflow-hidden">
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--c-void) 1px, transparent 1px),
            linear-gradient(90deg, var(--c-void) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg px-6 text-center">

        {/* Animated checkmark circle */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
          className="mx-auto mb-10 w-24 h-24 rounded-full bg-[--c-void] flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <CheckCircle className="w-10 h-10 text-[--c-ivory]" />
          </motion.div>
        </motion.div>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="t-label mb-4"
        >
          Order Confirmed
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="font-editorial text-4xl md:text-5xl font-semibold text-[--c-void] leading-tight mb-3"
        >
          Thank you.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="t-body mb-8 max-w-sm mx-auto"
        >
          Your order has been received and a confirmation has been sent to{" "}
          <span className="text-[--c-void] font-semibold">{email}</span>.
        </motion.p>

        {/* Order summary pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="border border-[--c-bone] bg-white/60 backdrop-blur-sm px-6 py-5 mb-8 flex items-center justify-between"
        >
          <div className="text-left">
            <p className="t-label mb-1">Order Number</p>
            <p className="text-[--c-void] font-bold text-lg tracking-wide">#{orderNumber}</p>
          </div>
          <div className="w-px h-10 bg-[--c-bone]" />
          <div className="text-right">
            <p className="t-label mb-1">Amount Paid</p>
            <p className="text-[--c-void] font-bold text-lg">
              ₦{totalAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </motion.div>

        {/* Status steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex items-center justify-center gap-0 mb-10"
        >
          {steps.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    step.done
                      ? "bg-[--c-void] border-[--c-void]"
                      : "bg-transparent border-[--c-bone]"
                  }`}
                >
                  {step.done ? (
                    <CheckCircle className="w-4 h-4 text-[--c-ivory]" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[--c-bone]" />
                  )}
                </div>
                <p
                  className={`text-[0.55rem] font-semibold tracking-wider uppercase text-center max-w-[70px] leading-tight ${
                    step.done ? "text-[--c-void]" : "text-[--c-warmgray]"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 h-px mb-5 mx-1 ${
                    step.done ? "bg-[--c-void]" : "bg-[--c-bone]"
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button onClick={onDismiss} className="btn-void">
            <span>View My Orders</span>
            <ArrowRight className="w-3 h-3 relative z-10" />
          </button>
          <Link to="/shop">
            <button className="btn-ghost w-full sm:w-auto">
              <span>Continue Shopping</span>
            </button>
          </Link>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-[0.65rem] text-[--c-stone] tracking-wide"
        >
          Questions? Email us at{" "}
          <a href="mailto:thestyleyardd@gmail.com" className="underline underline-offset-2">
            thestyleyardd@gmail.com
          </a>
        </motion.p>
      </div>
    </div>
  );
};

export default OrderSuccess;
