import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      // Show instructions for manual installation
      if (
        /iPhone|iPad|iPod/.test(navigator.userAgent) &&
        !(window.navigator as any).standalone
      ) {
        alert(
          "To install this app on your iOS device, tap the Share button and then 'Add to Home Screen'."
        );
        return false;
      } else if (/Android/.test(navigator.userAgent)) {
        alert(
          "To install this app on your Android device, tap the menu button (three dots) and select 'Add to Home Screen' or 'Install App'."
        );
        return false;
      } else {
        alert(
          "Your browser doesn't support PWA installation. Please use Chrome, Edge, or Safari."
        );
        return false;
      }
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error installing PWA:", error);
      return false;
    }
  };

  return {
    installPWA,
    isInstallable,
    isInstalled,
    deferredPrompt: deferredPrompt !== null,
  };
}
