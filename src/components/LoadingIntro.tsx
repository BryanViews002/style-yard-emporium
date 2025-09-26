import { useState, useEffect } from "react";

const LoadingIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade out to complete
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center hero-section transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center space-y-6">
        <div className="animate-brand-reveal">
          <h1 className="text-6xl md:text-8xl font-light tracking-wider text-hero-text mb-4">
            THE
          </h1>
          <h1 className="text-6xl md:text-8xl font-light tracking-wider text-hero-text mb-4">
            STYLE
          </h1>
          <h1 className="text-6xl md:text-8xl font-light tracking-wider bg-gradient-to-r from-premium-gold to-accent bg-clip-text text-transparent">
            YARD
          </h1>
        </div>
        <div className="flex justify-center">
          <div className="loading-spinner"></div>
        </div>
        <p className="text-hero-text/70 text-lg font-light tracking-wide animate-fade-in-up">
          Curating luxury fashion & jewelry
        </p>
      </div>
    </div>
  );
};

export default LoadingIntro;