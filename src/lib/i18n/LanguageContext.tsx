import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Language } from "../../types/shared";
import { changeLanguage, getCurrentLanguage } from "../i18n";
import { useAuth } from "../../contexts/AuthContext";

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
  const { user } = useAuth();

  // Force English for admin and superadmin users
  const getInitialLanguage = (): Language => {
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      return Language.EN;
    }
    return getCurrentLanguage();
  };

  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    getInitialLanguage()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
    }
  }, [ready, currentLanguage]);

  // Force English for admin and superadmin users
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      if (currentLanguage !== Language.EN) {
        setCurrentLanguage(Language.EN);
        changeLanguage(Language.EN);
      }
    }
  }, [user, currentLanguage]);

  const handleSetLanguage = (language: Language) => {
    // Prevent language change for admin and superadmin users
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      return;
    }
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
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const switchLanguage = async (language: Language) => {
    // Prevent language change for admin and superadmin users
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      return;
    }

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
