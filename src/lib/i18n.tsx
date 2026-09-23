import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "../locales/en.json";
import my from "../locales/my.json";

export type Language = "en" | "my";

const messages = { en, my } as const;


export type MessageKey = keyof typeof en;
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: MessageKey) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem("property-portal-language") === "my" ? "my" : "en");
  const setLanguage = (next: Language) => { setLanguageState(next); localStorage.setItem("property-portal-language", next); };
  useEffect(() => { document.documentElement.lang = language === "my" ? "my" : "en"; }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (key: MessageKey) => messages[language][key] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
