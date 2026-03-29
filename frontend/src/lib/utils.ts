import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(mm: number | null): string {
  if (mm === null) return "\u2014";
  if (mm >= 1000) return `$${(mm / 1000).toFixed(1)}B`;
  return `$${mm.toFixed(0)}M`;
}

export function formatPercent(pct: number | null): string {
  if (pct === null) return "\u2014";
  return `${pct.toFixed(1)}%`;
}
