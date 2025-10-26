import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TouchOptimizedButtonProps extends ButtonProps {
  touchTarget?: "small" | "medium" | "large";
  hapticFeedback?: boolean;
}

const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  touchTarget = "medium",
  hapticFeedback = true,
  className,
  onClick,
  children,
  ...props
}) => {
  const getTouchTargetSize = () => {
    switch (touchTarget) {
      case "small":
        return "min-h-[44px] min-w-[44px]";
      case "medium":
        return "min-h-[48px] min-w-[48px]";
      case "large":
        return "min-h-[56px] min-w-[56px]";
      default:
        return "min-h-[48px] min-w-[48px]";
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Add haptic feedback on mobile devices
    if (hapticFeedback && "vibrate" in navigator) {
      navigator.vibrate(10); // Short vibration
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      {...props}
      className={cn(
        getTouchTargetSize(),
        "touch-manipulation", // Optimize for touch
        "active:scale-95", // Touch feedback
        "transition-transform duration-150",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};

export default TouchOptimizedButton;
