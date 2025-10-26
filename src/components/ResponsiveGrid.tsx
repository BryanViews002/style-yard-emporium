import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  gap?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  className?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, "2xl": 6 },
  gap = { xs: 4, sm: 4, md: 6, lg: 6, xl: 8, "2xl": 8 },
  className,
}) => {
  const getGridCols = () => {
    const colClasses = Object.entries(cols)
      .map(([breakpoint, colCount]) => {
        if (breakpoint === "xs") return `grid-cols-${colCount}`;
        return `${breakpoint}:grid-cols-${colCount}`;
      })
      .join(" ");

    return colClasses;
  };

  const getGap = () => {
    const gapClasses = Object.entries(gap)
      .map(([breakpoint, gapSize]) => {
        if (breakpoint === "xs") return `gap-${gapSize}`;
        return `${breakpoint}:gap-${gapSize}`;
      })
      .join(" ");

    return gapClasses;
  };

  return (
    <div className={cn("grid", getGridCols(), getGap(), className)}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
