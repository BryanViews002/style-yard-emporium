// Mobile responsiveness utilities

export const breakpoints = {
  xs: "0px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook for responsive breakpoints
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>("lg");

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= 1536) setBreakpoint("2xl");
      else if (width >= 1280) setBreakpoint("xl");
      else if (width >= 1024) setBreakpoint("lg");
      else if (width >= 768) setBreakpoint("md");
      else if (width >= 640) setBreakpoint("sm");
      else setBreakpoint("xs");
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);

    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
};

// Hook for checking if current breakpoint matches
export const useIsBreakpoint = (targetBreakpoint: Breakpoint): boolean => {
  const currentBreakpoint = useBreakpoint();
  const breakpointOrder: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];

  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const targetIndex = breakpointOrder.indexOf(targetBreakpoint);

  return currentIndex >= targetIndex;
};

// Utility for responsive class names
export const getResponsiveClasses = (
  classes: Partial<Record<Breakpoint, string>>
): string => {
  return Object.entries(classes)
    .map(([breakpoint, className]) => {
      if (breakpoint === "xs") return className;
      return `${breakpoint}:${className}`;
    })
    .join(" ");
};

// Mobile-specific utilities
export const isMobile = (): boolean => {
  return window.innerWidth < 768;
};

export const isTablet = (): boolean => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = (): boolean => {
  return window.innerWidth >= 1024;
};

// Touch utilities
export const isTouchDevice = (): boolean => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

// Responsive image sizes
export const getResponsiveImageSizes = (baseSize: number) => ({
  xs: Math.round(baseSize * 0.75),
  sm: Math.round(baseSize * 0.875),
  md: baseSize,
  lg: Math.round(baseSize * 1.125),
  xl: Math.round(baseSize * 1.25),
  "2xl": Math.round(baseSize * 1.5),
});

// Responsive spacing
export const getResponsiveSpacing = (baseSpacing: number) => ({
  xs: Math.round(baseSpacing * 0.5),
  sm: Math.round(baseSpacing * 0.75),
  md: baseSpacing,
  lg: Math.round(baseSpacing * 1.25),
  xl: Math.round(baseSpacing * 1.5),
  "2xl": Math.round(baseSpacing * 2),
});
