import React from "react";
import { cn } from "../../lib/utils";

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  style?: React.CSSProperties;
}

interface GlowingCardsProps {
  children: React.ReactNode;
  className?: string;
  gap?: string;
  padding?: string;
  maxWidth?: string;
}

export function GlowingCard({
  children, className, glowColor = "#3b82f6", style,
}: GlowingCardProps) {
  return (
    <div
      className={cn(
        "relative flex-1 min-w-[14rem] p-6 rounded-2xl",
        "bg-[var(--bg-card)] transition-all duration-300 ease-out",
        className
      )}
      style={{
        border: `1px solid ${glowColor}25`,
        boxShadow: "0 0 0 0 transparent",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${glowColor}80`;
        e.currentTarget.style.boxShadow =
          `0 0 20px ${glowColor}20, 0 0 40px ${glowColor}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${glowColor}25`;
        e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
      }}
    >
      {children}
    </div>
  );
}

export function GlowingCards({
  children, className, gap = "1rem", padding = "0", maxWidth = "100%",
}: GlowingCardsProps) {
  return (
    <div
      className={cn("flex flex-wrap items-stretch", className)}
      style={{ gap, padding, maxWidth }}
    >
      {children}
    </div>
  );
}
