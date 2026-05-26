import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  translations,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from "../lib/i18n/translations";

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
});

function getNested(obj, path) {
  return path
    .split(".")
    .reduce(
      (acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined),
      obj,
    );
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("helthyfood:locale");
    if (stored && SUPPORTED_LOCALES.includes(stored)) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    setLocaleState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("helthyfood:locale", next);
    }
  }, []);

  const t = useCallback(
    (key, fallback) => {
      const value = getNested(translations[locale], key);
      if (value !== undefined) return value;
      const fallbackValue = getNested(translations[DEFAULT_LOCALE], key);
      return fallbackValue !== undefined ? fallbackValue : fallback || key;
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LocaleContext);
}

export function useLocalized(obj, field) {
  const { locale } = useContext(LocaleContext);
  if (!obj) return "";
  return (
    obj[`${field}_${locale}`] ||
    obj[`${field}_${DEFAULT_LOCALE}`] ||
    obj[field] ||
    ""
  );
}
