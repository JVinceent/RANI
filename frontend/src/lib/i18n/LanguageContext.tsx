import { createContext, useContext, useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { translations, type LanguageCode, type TranslationKeys } from "./translations";

const STORAGE_KEY = "rani_language";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: keyof TranslationKeys, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en-US";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "fil" ? "fil" : "en-US";
}

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage?: LanguageCode | null;
}) {
  const [language, setLanguageState] = useState<LanguageCode>(
    initialLanguage ?? getInitialLanguage()
  );

  // If the backend later tells us the account's saved language (e.g. after
  // login), sync it in.
  useEffect(() => {
    if (initialLanguage) setLanguageState(initialLanguage);
  }, [initialLanguage]);

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    window.localStorage.setItem(STORAGE_KEY, code);
  };

  const t = useMemo(() => {
    const dict = translations[language];
    return (key: keyof TranslationKeys, vars?: Record<string, string>) => {
      let text = dict[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, v);
        }
      }
      return text;
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}