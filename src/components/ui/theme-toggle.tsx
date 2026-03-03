"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useCircularTransition } from "@/lib/hooks/use-circular-transition";
import { Button } from "./button";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme } = useTheme();
  const { toggleTheme } = useCircularTransition();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors border border-border-subtle cursor-pointer ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
