import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MemoizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  className?: string;
  placeholder?: string;
}

const MemoizedImage: React.FC<MemoizedImageProps> = ({
  src,
  alt,
  fallbackSrc = "/placeholder-image.jpg",
  lazy = true,
  className,
  placeholder,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder || "");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy) {
      loadImage();
    }
  }, [src, lazy]);

  useEffect(() => {
    if (lazy && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(imgRef.current);

      return () => observer.disconnect();
    }
  }, [lazy]);

  const loadImage = () => {
    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      setHasError(true);
    };
    img.src = src;
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        {...props}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-muted-foreground text-sm">
            Failed to load image
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoizedImage;
