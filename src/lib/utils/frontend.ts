// ===========================================
// FRONTEND UTILITY FUNCTIONS
// ===========================================

import {
  format,
  parseISO,
  isValid,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { Language } from "../../types/shared";

// ===========================================
// DATE UTILITIES
// ===========================================

const dateLocales = {
  en: enUS,
  fr: fr,
  rw: enUS, // Fallback to English for Kinyarwanda since date-fns doesn't support it
};

export const formatDate = (
  date: string | Date,
  formatString: string = "MMM dd, yyyy",
  language: Language = Language.EN
): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "Invalid Date";

    const locale = dateLocales[language] || enUS;
    return format(dateObj, formatString, { locale });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid Date";
  }
};

export const formatDateTime = (
  date: string | Date,
  language: Language = Language.EN
): string => {
  return formatDate(date, "MMM dd, yyyy HH:mm", language);
};

export const formatTime = (
  date: string | Date,
  language: Language = Language.EN
): string => {
  return formatDate(date, "HH:mm", language);
};

export const getRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "Invalid Date";

    const now = new Date();
    const daysDiff = differenceInDays(now, dateObj);
    const hoursDiff = differenceInHours(now, dateObj);
    const minutesDiff = differenceInMinutes(now, dateObj);

    if (daysDiff > 0) {
      return `${daysDiff} day${daysDiff > 1 ? "s" : ""} ago`;
    } else if (hoursDiff > 0) {
      return `${hoursDiff} hour${hoursDiff > 1 ? "s" : ""} ago`;
    } else if (minutesDiff > 0) {
      return `${minutesDiff} minute${minutesDiff > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  } catch (error) {
    console.error("Relative time error:", error);
    return "Invalid Date";
  }
};

// ===========================================
// CURRENCY UTILITIES
// ===========================================

export const formatCurrency = (
  amount: number,
  currency: string = "USD",
  language: Language = Language.EN
): string => {
  try {
    const locale =
      language === Language.FR
        ? "fr-FR"
        : language === Language.RW
        ? "en-RW"
        : "en-US";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error("Currency formatting error:", error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const formatNumber = (
  number: number,
  language: Language = Language.EN
): string => {
  try {
    const locale =
      language === Language.FR
        ? "fr-FR"
        : language === Language.RW
        ? "en-RW"
        : "en-US";

    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    console.error("Number formatting error:", error);
    return number.toString();
  }
};

// ===========================================
// STRING UTILITIES
// ===========================================

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  }

  return phone; // Return original if format is not recognized
};

export const generateInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};

// ===========================================
// VALIDATION UTILITIES
// ===========================================

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ===========================================
// FILE UTILITIES
// ===========================================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

export const isDocumentFile = (filename: string): boolean => {
  const documentExtensions = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
  ];
  const extension = getFileExtension(filename).toLowerCase();
  return documentExtensions.includes(extension);
};

// ===========================================
// URL UTILITIES
// ===========================================

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

export const parseQueryString = (queryString: string): Record<string, any> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, any> = {};

  for (const [key, value] of params.entries()) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
};

// ===========================================
// COLOR UTILITIES
// ===========================================

export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const getContrastColor = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#000000";

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
};

// ===========================================
// ARRAY UTILITIES
// ===========================================

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// ===========================================
// DEBOUNCE UTILITY
// ===========================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ===========================================
// LOCAL STORAGE UTILITIES
// ===========================================

export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};

// ===========================================
// ERROR HANDLING UTILITIES
// ===========================================

export const getErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error?.message)
    return error.response.data.error.message;
  return "An unexpected error occurred";
};

export const isNetworkError = (error: any): boolean => {
  return !error?.response && error?.code === "NETWORK_ERROR";
};

export const isAuthError = (error: any): boolean => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

// ===========================================
// EXPORT ALL UTILITIES
// ===========================================

export default {
  formatDate,
  formatDateTime,
  formatTime,
  getRelativeTime,
  formatCurrency,
  formatNumber,
  truncateText,
  capitalizeFirst,
  formatPhoneNumber,
  generateInitials,
  validateEmail,
  validatePhone,
  validatePassword,
  formatFileSize,
  getFileExtension,
  isImageFile,
  isDocumentFile,
  buildQueryString,
  parseQueryString,
  hexToRgb,
  rgbToHex,
  getContrastColor,
  groupBy,
  sortBy,
  uniqueBy,
  debounce,
  storage,
  getErrorMessage,
  isNetworkError,
  isAuthError,
};
