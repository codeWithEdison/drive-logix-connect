import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Language } from "../../types/shared";
import { changeLanguage, getCurrentLanguage } from "../i18n";

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: any) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const { t, ready } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    getCurrentLanguage()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
    }
  }, [ready, currentLanguage]);

  const handleSetLanguage = (language: Language) => {
    setCurrentLanguage(language);
    changeLanguage(language);
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage: handleSetLanguage,
    t,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Hook for getting available languages
export const useAvailableLanguages = () => {
  return [
    { code: Language.EN, name: "English", flag: "🇺🇸" },
    { code: Language.RW, name: "Kinyarwanda", flag: "🇷🇼" },
    { code: Language.FR, name: "Français", flag: "🇫🇷" },
  ];
};

// Hook for language switching with API integration
export const useLanguageSwitcher = () => {
  const { setLanguage, currentLanguage } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  const switchLanguage = async (language: Language) => {
    if (language === currentLanguage) return;

    setIsUpdating(true);
    try {
      // Update language in localStorage and i18n
      setLanguage(language);

      // Here you could also update the user's preferred language on the server
      // await UserService.updateProfile({ preferred_language: language });
    } catch (error) {
      console.error("Failed to update language:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    switchLanguage,
    isUpdating,
    currentLanguage,
  };
};
