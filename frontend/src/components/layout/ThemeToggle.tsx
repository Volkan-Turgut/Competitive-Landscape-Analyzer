import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="group/theme relative overflow-hidden rounded-lg border border-[var(--border-primary)] px-4 py-2 text-sm transition-all duration-300 hover:border-[var(--border-secondary)]"
    >
      <span className="inline-block transition-all duration-300 text-[var(--text-muted)] group-hover/theme:-translate-x-10 group-hover/theme:opacity-0">
        Theme
      </span>
      <div className="absolute inset-0 flex items-center justify-center translate-x-10 opacity-0 transition-all duration-300 group-hover/theme:translate-x-0 group-hover/theme:opacity-100">
        {dark ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-400" />
        )}
      </div>
    </button>
  );
}
