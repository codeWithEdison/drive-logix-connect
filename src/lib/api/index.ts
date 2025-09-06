// ===========================================
// MAIN API EXPORTS
// ===========================================

// Export axios instance
export { default as axiosInstance } from "./axios";

// Export query client and keys
export { queryClient, queryKeys } from "./queryClient";

// Export all services
export * from "./services";

// Export all hooks
export * from "./hooks";

// Export types
export * from "../../types/frontend";

// Export utilities
export * from "../utils/frontend";

// Export i18n
export { default as i18n } from "../i18n";
export {
  LanguageProvider,
  useLanguage,
  useAvailableLanguages,
  useLanguageSwitcher,
} from "../i18n/LanguageContext";
export { LanguageSwitcher } from "../i18n/LanguageSwitcher";
