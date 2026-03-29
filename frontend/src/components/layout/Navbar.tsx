import { Activity } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--navbar-bg)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a href="/" className="flex items-center gap-2 text-[var(--text-primary)]">
          <Activity className="h-5 w-5 text-[#7c5aff]" />
          <span className="text-sm font-medium tracking-tight">
            Competitive Landscape Analyzer
          </span>
        </a>
        <ThemeToggle />
      </div>
    </nav>
  );
}
