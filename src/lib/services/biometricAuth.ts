import { Capacitor } from "@capacitor/core";
import { BiometricAuth } from "@aparajita/capacitor-biometric-auth";

/**
 * Biometric authentication service
 * Provides fingerprint, face recognition, and other biometric authentication
 */
export class BiometricAuthService {
  /**
   * Check if biometric authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      // Try to authenticate with a simple check
      await BiometricAuth.authenticate({
        reason: "Check biometric availability",
        cancelTitle: "Cancel",
        allowDeviceCredential: true,
      });
      return true;
    } catch (error: any) {
      // If authentication fails, it might still be available
      // We'll check if it's a user cancellation vs system error
      return (
        error.message !== "User cancelled" &&
        error.message !== "Authentication failed"
      );
    }
  }

  /**
   * Request biometric authentication
   */
  static async authenticate(reason?: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      await BiometricAuth.authenticate({
        reason: reason || "Please authenticate to continue",
        cancelTitle: "Cancel",
        iosFallbackTitle: "Use Passcode",
        allowDeviceCredential: true,
      });

      return true;
    } catch (error: any) {
      console.error("Biometric authentication error:", error);
      return false;
    }
  }

  /**
   * Check if biometric is enrolled
   */
  static async isEnrolled(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      // Try a simple authentication to check enrollment
      await BiometricAuth.authenticate({
        reason: "Check biometric enrollment",
        cancelTitle: "Cancel",
        allowDeviceCredential: true,
      });
      return true;
    } catch (error: any) {
      // If it's a user cancellation, biometric is enrolled
      // If it's a system error, it might not be enrolled
      return error.message === "User cancelled";
    }
  }

  /**
   * Get available biometric types
   */
  static async getAvailableTypes(): Promise<string[]> {
    if (!Capacitor.isNativePlatform()) {
      return [];
    }

    try {
      // Try to authenticate to determine available types
      await BiometricAuth.authenticate({
        reason: "Check biometric types",
        cancelTitle: "Cancel",
        allowDeviceCredential: true,
      });

      // If successful, we can't determine the exact type without platform-specific code
      // Return generic types based on platform
      if (Capacitor.getPlatform() === "ios") {
        return ["Face ID", "Touch ID"];
      } else if (Capacitor.getPlatform() === "android") {
        return ["Fingerprint", "Face Recognition"];
      }

      return ["Biometric"];
    } catch (error) {
      console.error("Error getting biometric types:", error);
      return [];
    }
  }

  /**
   * Check if biometric authentication is ready to use
   */
  static async isReady(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const isAvailable = await this.isAvailable();
      const isEnrolled = await this.isEnrolled();
      return isAvailable && isEnrolled;
    } catch (error) {
      console.error("Error checking biometric readiness:", error);
      return false;
    }
  }

  /**
   * Authenticate with custom options
   */
  static async authenticateWithOptions(options: {
    reason?: string;
    cancelTitle?: string;
    iosFallbackTitle?: string;
    allowDeviceCredential?: boolean;
  }): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      await BiometricAuth.authenticate({
        reason: options.reason || "Please authenticate to continue",
        cancelTitle: options.cancelTitle || "Cancel",
        iosFallbackTitle: options.iosFallbackTitle || "Use Passcode",
        allowDeviceCredential: options.allowDeviceCredential ?? true,
      });

      return true;
    } catch (error: any) {
      console.error("Biometric authentication error:", error);
      return false;
    }
  }

  /**
   * Get biometric info
   */
  static async getBiometricInfo(): Promise<{
    isAvailable: boolean;
    isEnrolled: boolean;
    biometryType: string | null;
    errorCode?: string;
  }> {
    if (!Capacitor.isNativePlatform()) {
      return {
        isAvailable: false,
        isEnrolled: false,
        biometryType: null,
      };
    }

    try {
      const isAvailable = await this.isAvailable();
      const isEnrolled = await this.isEnrolled();
      const types = await this.getAvailableTypes();

      return {
        isAvailable,
        isEnrolled,
        biometryType: types.length > 0 ? types[0] : null,
      };
    } catch (error) {
      console.error("Error getting biometric info:", error);
      return {
        isAvailable: false,
        isEnrolled: false,
        biometryType: null,
        errorCode: "unknown_error",
      };
    }
  }

  /**
   * Quick authentication for sensitive actions
   */
  static async quickAuth(action: string): Promise<boolean> {
    return await this.authenticate(`Please authenticate to ${action}`);
  }

  /**
   * Login authentication
   */
  static async loginAuth(): Promise<boolean> {
    return await this.authenticateWithOptions({
      reason: "Please authenticate to login",
      cancelTitle: "Use Password",
      iosFallbackTitle: "Use Passcode",
      allowDeviceCredential: true,
    });
  }
}

export default BiometricAuthService;
