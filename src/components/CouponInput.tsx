import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CouponInputProps {
  cartTotal: number;
  onCouponApplied: (couponId: string, discountAmount: number) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: { code: string; discount: number };
}

export const CouponInput = ({
  cartTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidating(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.rpc("validate_coupon", {
        coupon_code: couponCode.toUpperCase(),
        user_id: user.user?.id || null,
        cart_total: cartTotal,
      });

      if (error) throw error;

      const result = data as { valid: boolean; coupon_id?: string; discount_amount?: number; error?: string };

      if (result.valid && result.coupon_id && result.discount_amount !== undefined) {
        onCouponApplied(result.coupon_id, result.discount_amount);
        toast({
          title: "Coupon applied!",
          description: `You saved $${result.discount_amount.toFixed(2)}`,
        });
        setCouponCode("");
      } else {
        toast({
          title: "Invalid coupon",
          description: result.error || "Invalid coupon code",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-accent" />
          <div>
            <p className="text-sm font-medium">{appliedCoupon.code}</p>
            <p className="text-xs text-muted-foreground">
              -${appliedCoupon.discount.toFixed(2)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCouponRemoved}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="pl-10"
          onKeyDown={(e) => e.key === "Enter" && validateCoupon()}
        />
      </div>
      <Button
        onClick={validateCoupon}
        disabled={isValidating || !couponCode.trim()}
      >
        {isValidating ? "Checking..." : "Apply"}
      </Button>
    </div>
  );
};