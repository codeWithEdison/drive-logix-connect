import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveTrackingMap } from "@/components/dashboard/LiveTrackingMap";
import { Search, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SEO } from "@/components/seo/SEO";
import { PAGE_SEO, generateWebPageSchema, generateServiceSchema } from "@/lib/seo/seoData";

const TrackingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState("");

  const handleSearch = () => {
    if (searchId.trim()) {
      // Support both cargo ID and cargo number
      navigate(`/tracking/${searchId.trim()}`);
    } else {
      toast.error("Please enter a cargo ID or cargo number");
    }
  };

  const webPageSchema = generateWebPageSchema(
    PAGE_SEO.tracking.title,
    PAGE_SEO.tracking.description,
    PAGE_SEO.tracking.path
  );
  const trackingServiceSchema = generateServiceSchema(
    "Real-time Cargo Tracking",
    "Track your cargo in real-time across Rwanda. Get live updates on your shipment location, delivery status, and estimated arrival time."
  );

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-10rem)]">
      <SEO
        title={PAGE_SEO.tracking.title}
        description={PAGE_SEO.tracking.description}
        keywords={PAGE_SEO.tracking.keywords}
        url={PAGE_SEO.tracking.path}
        structuredData={[webPageSchema, trackingServiceSchema]}
      />
      {/* Compact header - responsive text sizing */}
      <div className="flex-shrink-0 space-y-3 sm:space-y-4 pb-4 sm:pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-heading tracking-tight">
            {t("tracking.title")}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
            {t("tracking.subtitle")}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <Input
              placeholder={t("tracking.enterCargoIdPlaceholder")}
              className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover h-9 sm:h-10 px-4 sm:px-6 text-sm font-medium flex-shrink-0"
            onClick={handleSearch}
          >
            {t("tracking.track")}
          </Button>
        </div>
      </div>

      {/* Live Tracking Map - takes remaining space */}
      <div className="flex-1 min-h-0">
        <LiveTrackingMap />
      </div>
    </div>
  );
};

export default TrackingPage;
