import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  className?: string;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  className,
}) => {
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setCurrentPos({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !startPos) return;

    const touch = e.touches[0];
    setCurrentPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!isDragging || !startPos || !currentPos) {
      setIsDragging(false);
      setStartPos(null);
      setCurrentPos(null);
      return;
    }

    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine swipe direction
    if (absDeltaX > absDeltaY && absDeltaX > swipeThreshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > swipeThreshold) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    setIsDragging(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartPos({ x: e.clientX, y: e.clientY });
    setCurrentPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !startPos) return;
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    handleTouchEnd();
  };

  // Calculate transform for visual feedback
  const getTransform = () => {
    if (!isDragging || !startPos || !currentPos) return "";

    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;

    return `translate(${deltaX * 0.1}px, ${deltaY * 0.1}px)`;
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        "transition-transform duration-150 ease-out",
        isDragging && "shadow-lg",
        className
      )}
      style={{
        transform: getTransform(),
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
};

export default SwipeableCard;
