import React from "react";
import { useMotionValue, motion, useMotionTemplate } from "framer-motion";

const dotDefault = `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%23404040' cx='10' cy='10' r='2.5'/%3E%3C/svg%3E")`;
const dotHover = `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3E%3Ccircle fill='%238183f4' cx='10' cy='10' r='2.5'/%3E%3C/svg%3E")`;

interface HeroHighlightProps {
  children: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

export const HeroHighlight: React.FC<HeroHighlightProps> = ({
  children,
  containerStyle,
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    if (!currentTarget) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        ...containerStyle,
      }}
    >
      {/* Static dot pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: dotDefault,
        }}
      />

      {/* Highlighted dots that follow mouse */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: dotHover,
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 20, width: "100%" }}>
        {children}
      </div>
    </div>
  );
};
