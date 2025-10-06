import { toast } from "sonner";

// Custom toast types with specific behaviors and styling
export const customToast = {
  // Success toasts - Green with checkmark icon
  success: (message: string, description?: string) => {
    return toast.success(message, {
      description,
      duration: 4000,
      icon: "✅",
      style: {
        background: "#f0fdf4", // solid green-50
        border: "1px solid #bbf7d0", // solid green-200
        color: "#166534", // solid green-800
      },
    });
  },

  // Error toasts - Red with X icon
  error: (message: string, description?: string) => {
    return toast.error(message, {
      description,
      duration: 6000, // Longer duration for errors
      icon: "❌",
      style: {
        background: "#fef2f2", // solid red-50
        border: "1px solid #fecaca", // solid red-200
        color: "#991b1b", // solid red-800
      },
    });
  },

  // Warning toasts - Yellow with warning icon
  warning: (message: string, description?: string) => {
    return toast.warning(message, {
      description,
      duration: 5000,
      icon: "⚠️",
      style: {
        background: "#fefce8", // solid yellow-50
        border: "1px solid #fde047", // solid yellow-200
        color: "#a16207", // solid yellow-800
      },
    });
  },

  // Info toasts - Blue with info icon
  info: (message: string, description?: string) => {
    return toast.info(message, {
      description,
      duration: 4000,
      icon: "ℹ️",
      style: {
        background: "#eff6ff", // solid blue-50
        border: "1px solid #bfdbfe", // solid blue-200
        color: "#1e40af", // solid blue-800
      },
    });
  },

  // Loading toasts - Purple with spinner
  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
      icon: "⏳",
      style: {
        background: "#faf5ff", // solid purple-50
        border: "1px solid #d8b4fe", // solid purple-200
        color: "#6b21a8", // solid purple-800
      },
    });
  },

  // Authentication specific toasts
  auth: {
    loginSuccess: (userName?: string) => {
      return customToast.success(
        "Welcome back!",
        userName ? `Logged in as ${userName}` : "Login successful"
      );
    },
    loginError: (message?: string) => {
      return customToast.error(
        "Login Failed",
        message || "Please check your credentials and try again"
      );
    },
    registerSuccess: (userName?: string) => {
      return customToast.success(
        "Account Created!",
        userName ? `Welcome ${userName}` : "Registration successful"
      );
    },
    registerError: (message?: string) => {
      return customToast.error(
        "Registration Failed",
        message || "Please check your information and try again"
      );
    },
    logoutSuccess: () => {
      return customToast.info(
        "Logged Out",
        "You have been successfully logged out"
      );
    },
    sessionExpired: () => {
      return customToast.warning(
        "Session Expired",
        "Please log in again to continue"
      );
    },
  },

  // API specific toasts
  api: {
    requestFailed: (endpoint?: string) => {
      return customToast.error(
        "Request Failed",
        endpoint ? `Failed to connect to ${endpoint}` : "Network error occurred"
      );
    },
    serverError: () => {
      return customToast.error(
        "Server Error",
        "Something went wrong on our end. Please try again later."
      );
    },
    networkError: () => {
      return customToast.error(
        "Network Error",
        "Please check your internet connection"
      );
    },
  },

  // Form validation toasts
  validation: {
    requiredField: (fieldName: string) => {
      return customToast.warning("Required Field", `${fieldName} is required`);
    },
    invalidFormat: (fieldName: string) => {
      return customToast.warning(
        "Invalid Format",
        `Please enter a valid ${fieldName}`
      );
    },
    passwordsNotMatch: () => {
      return customToast.warning("Password Mismatch", "Passwords do not match");
    },
  },

  // Cargo/Delivery specific toasts
  cargo: {
    created: (cargoId?: string) => {
      return customToast.success(
        "Cargo Created",
        cargoId
          ? `Cargo #${cargoId} has been created`
          : "Cargo created successfully"
      );
    },
    updated: (cargoId?: string) => {
      return customToast.info(
        "Cargo Updated",
        cargoId
          ? `Cargo #${cargoId} has been updated`
          : "Cargo updated successfully"
      );
    },
    deleted: (cargoId?: string) => {
      return customToast.warning(
        "Cargo Deleted",
        cargoId
          ? `Cargo #${cargoId} has been deleted`
          : "Cargo deleted successfully"
      );
    },
  },

  // Payment specific toasts
  payment: {
    success: (amount?: string) => {
      return customToast.success(
        "Payment Successful",
        amount
          ? `Payment of ${amount} completed`
          : "Payment processed successfully"
      );
    },
    failed: (reason?: string) => {
      return customToast.error(
        "Payment Failed",
        reason || "Payment could not be processed"
      );
    },
    pending: () => {
      return customToast.info(
        "Payment Pending",
        "Your payment is being processed"
      );
    },
  },
};

export default customToast;
