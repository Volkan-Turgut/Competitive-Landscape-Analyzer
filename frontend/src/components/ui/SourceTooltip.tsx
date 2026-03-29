import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { SourceRef } from "@/types";

interface SourceTooltipProps {
  children: React.ReactNode;
  sources?: SourceRef[];
}

const MAX_SHOWN = 3;

export function SourceTooltip({ children, sources }: SourceTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }, []);

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 320;
      const pad = 12;
      let x = rect.left + rect.width / 2;
      // Clamp so tooltip stays within viewport
      x = Math.max(tooltipWidth / 2 + pad, Math.min(x, window.innerWidth - tooltipWidth / 2 - pad));
      setCoords({ x, y: rect.top });
    }
  }, []);

  const startShow = useCallback(() => {
    clearTimers();
    updateCoords();
    showTimer.current = setTimeout(() => setVisible(true), 200);
  }, [clearTimers, updateCoords]);

  const startHide = useCallback(() => {
    clearTimers();
    hideTimer.current = setTimeout(() => setVisible(false), 300);
  }, [clearTimers]);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  if (!sources || sources.length === 0) {
    return <>{children}</>;
  }

  const shown = sources.slice(0, MAX_SHOWN);
  const remaining = sources.length - MAX_SHOWN;

  return (
    <span
      ref={triggerRef}
      style={{ display: "inline" }}
      onMouseEnter={startShow}
      onMouseLeave={startHide}
    >
      <span style={{ borderBottom: "1px dotted var(--text-tertiary)", cursor: "help" }}>
        {children}
      </span>

      {visible && coords && createPortal(
        <div
          onMouseEnter={cancelHide}
          onMouseLeave={startHide}
          style={{
            position: "fixed",
            left: coords.x,
            top: coords.y - 10,
            transform: "translateX(-50%) translateY(-100%)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-secondary)",
            borderRadius: 10,
            padding: "10px 14px",
            maxWidth: 320,
            minWidth: 200,
            zIndex: 100,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            pointerEvents: "auto",
          }}
        >
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid var(--border-secondary)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid var(--bg-card)",
            }}
          />

          <div className="flex flex-col gap-1">
            <div style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 1 }}>
              Sources
            </div>
            {shown.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "#7c5aff",
                  textDecoration: "none",
                  lineHeight: 1.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
              >
                {s.title || s.url}
              </a>
            ))}
            {remaining > 0 && (
              <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)" }}>
                and {remaining} more
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
