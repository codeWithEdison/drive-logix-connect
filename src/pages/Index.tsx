import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const Index = () => {
  const { installPWA, isInstallable, isInstalled } = usePWAInstall();
  const { t } = useLanguage();
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Show install button if PWA is installable and not already installed
    if (isInstallable && !isInstalled) {
      setShowInstallButton(true);
    } else {
      setShowInstallButton(false);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) {
      setShowInstallButton(false);
    }
  };

  return (
    <>
      <ClientDashboard />
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <a
          href="https://play.google.com/store/apps/details?id=com.lovelycargo.app"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 py-4 flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5ZM14.4,12.71L17.14,14.29L4.84,22.39C4.94,22.46 5.06,22.5 5.18,22.5C5.36,22.5 5.53,22.41 5.64,22.25L14.4,12.71ZM14.4,11.29L5.64,1.75C5.53,1.59 5.36,1.5 5.18,1.5C5.06,1.5 4.94,1.54 4.84,1.61L17.14,9.71L14.4,11.29ZM18.53,10.51L15.39,12L18.53,13.49C19.16,13.79 19.84,13.56 20.14,12.93C20.25,12.65 20.25,12.35 20.14,12.07C19.84,11.44 19.16,11.21 18.53,10.51Z" />
          </svg>
          <span className="font-semibold">Download App</span>
        </a>
      </div>
      {isInstalled && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg rounded-full px-6 py-6 flex items-center gap-2 cursor-default"
            size="lg"
            disabled
          >
            <Check className="h-5 w-5" />
            <span className="font-semibold">
              {t("landing.downloadApp.installed")}
            </span>
          </Button>
        </div>
      )}
    </>
  );
};

export default Index;
