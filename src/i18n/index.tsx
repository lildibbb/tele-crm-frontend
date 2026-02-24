"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import en from "./en";
import ms from "./ms";

export type Locale = "en" | "ms";

const LOCALES: Record<Locale, Record<string, string>> = { en, ms };
const LS_KEY = "tele-crm-locale";

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const Ctx = createContext<LocaleCtx>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as Locale | null;
    if (stored && (stored === "en" || stored === "ms")) setLocaleState(stored);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(LS_KEY, l);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      let str = LOCALES[locale][key] ?? LOCALES["en"][key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replaceAll(`{{${k}}}`, v);
        });
      }
      return str;
    },
    [locale]
  );

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

/** Main translation hook */
export function useT() {
  return useContext(Ctx).t;
}

/** Locale state + setter */
export function useLocale() {
  const { locale, setLocale } = useContext(Ctx);
  return { locale, setLocale };
}
