import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Language } from "../../types/shared";

// Import translation files
import enTranslations from "./locales/en.json";
import rwTranslations from "./locales/rw.json";
import frTranslations from "./locales/fr.json";

// Translation resources
const resources = {
  en: {
    translation: enTranslations,
  },
  rw: {
    translation: rwTranslations,
  },
  fr: {
    translation: frTranslations,
  },
};

// Get saved language from localStorage or default to 'en'
const savedLanguage =
  (localStorage.getItem("preferred_language") as Language) || Language.EN;

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: Language.EN,

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  // Namespace configuration
  defaultNS: "translation",
  ns: ["translation"],

  // Detection options
  detection: {
    order: ["localStorage", "navigator", "htmlTag"],
    caches: ["localStorage"],
  },

  // React i18next options
  react: {
    useSuspense: false,
  },
});

// Export language change function
export const changeLanguage = (language: Language) => {
  i18n.changeLanguage(language);
  localStorage.setItem("preferred_language", language);
};

// Export current language getter
export const getCurrentLanguage = (): Language => {
  return i18n.language as Language;
};

export default i18n;
