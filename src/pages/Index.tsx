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
      {showInstallButton && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Button
            id="download"
            onClick={handleInstall}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 py-6 flex items-center gap-2"
            size="lg"
          >
            <Download className="h-5 w-5" />
            <span className="font-semibold">Download App</span>
          </Button>
        </div>
      )}
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
