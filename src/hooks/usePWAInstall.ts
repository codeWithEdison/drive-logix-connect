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
      const userAgent = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isStandalone = (window.navigator as any).standalone === true;

      if (isIOS && !isStandalone) {
        const message =
          "To install this app:\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add' to confirm";
        alert(message);
        return false;
      } else if (isAndroid) {
        const message =
          "To install this app:\n1. Tap the menu button (three dots) in your browser\n2. Select 'Add to Home Screen' or 'Install App'\n3. Follow the prompts to install";
        alert(message);
        return false;
      } else {
        // Desktop browsers
        const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
        const isEdge = /Edge/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

        if (isChrome || isEdge) {
          const message =
            "To install this app:\n1. Look for the install icon in your browser's address bar\n2. Click it and select 'Install'\n3. Or use the menu (three dots) > 'Install Loveway Logistics'";
          alert(message);
        } else if (isSafari) {
          const message =
            "To install this app:\n1. Click 'File' in the menu bar\n2. Select 'Add to Dock' or use Share > 'Add to Home Screen'";
          alert(message);
        } else {
          const message =
            "To install this app, please use Chrome, Edge, or Safari browser. Look for the install icon in your browser's address bar.";
          alert(message);
        }
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
      // If prompt fails, show fallback instructions
      const userAgent = navigator.userAgent;
      if (/Android/.test(userAgent)) {
        alert(
          "Please use your browser menu to install the app: Menu (three dots) > 'Add to Home Screen' or 'Install App'"
        );
      } else if (/iPhone|iPad|iPod/.test(userAgent)) {
        alert(
          "Please use Safari's Share button to add this app to your home screen."
        );
      }
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
