import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveTrackingMap } from "@/components/dashboard/LiveTrackingMap";
import { Search, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">
            {t("tracking.title")}
          </h1>
          <p className="text-muted-foreground">{t("tracking.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Enter cargo ID or cargo number (e.g., LC20250913001)"
              className="pl-10"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={handleSearch}
          >
            {t("tracking.track")}
          </Button>
        </div>
      </div>

      {/* Live Tracking Map Component */}
      <div className="h-[calc(100vh-200px)]">
        <LiveTrackingMap />
      </div>
    </div>
  );
};

export default TrackingPage;
