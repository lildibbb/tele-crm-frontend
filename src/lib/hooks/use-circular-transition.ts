"use client";

import { useRef, useCallback } from "react";
import { useTheme } from "next-themes";

interface CircularTransitionHook {
  toggleTheme: (event: React.MouseEvent) => void;
  isTransitioning: () => boolean;
}

export function useCircularTransition(): CircularTransitionHook {
  const { theme, setTheme } = useTheme();
  const isTransitioningRef = useRef(false);

  const toggleTheme = useCallback(
    (event: React.MouseEvent) => {
      if (isTransitioningRef.current) return;

      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;

      document.documentElement.style.setProperty("--x", `${x}%`);
      document.documentElement.style.setProperty("--y", `${y}%`);

      const next = theme === "dark" ? "light" : "dark";

      if ("startViewTransition" in document) {
        isTransitioningRef.current = true;
        const vt = (
          document as Document & {
            startViewTransition: (cb: () => void) => { finished: Promise<void> };
          }
        ).startViewTransition(() => {
          setTheme(next);
        });
        vt.finished.finally(() => {
          isTransitioningRef.current = false;
        });
      } else {
        setTheme(next);
      }
    },
    [theme, setTheme],
  );

  const isTransitioning = useCallback(() => isTransitioningRef.current, []);

  return { toggleTheme, isTransitioning };
}
