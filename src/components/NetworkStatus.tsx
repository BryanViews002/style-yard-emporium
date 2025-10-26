import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkStatusProps {
  className?: string;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ className }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOnline(true);
      setShowOfflineMessage(false);
      // Reload the page to refresh data
      window.location.reload();
    }
  };

  if (!showOfflineMessage && isOnline) {
    return null;
  }

  return (
    <div className={cn("fixed top-4 left-4 right-4 z-50", className)}>
      <Card
        className={cn(
          "border-l-4",
          isOnline ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}

            <div className="flex-1">
              <h4 className="font-medium">
                {isOnline ? "Connection Restored" : "You're Offline"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isOnline
                  ? "Your internet connection has been restored."
                  : "Please check your internet connection and try again."}
              </p>
            </div>

            {!isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkStatus;
