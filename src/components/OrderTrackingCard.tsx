import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, ExternalLink } from "lucide-react";

interface OrderTrackingCardProps {
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
}

export const OrderTrackingCard = ({
  orderNumber,
  status,
  trackingNumber,
  trackingUrl,
  createdAt,
}: OrderTrackingCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "pending":
      case "processing":
        return <Package className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { label: "Order Placed", status: "pending", completed: true },
      { label: "Processing", status: "processing", completed: ["processing", "shipped", "delivered"].includes(status) },
      { label: "Shipped", status: "shipped", completed: ["shipped", "delivered"].includes(status) },
      { label: "Delivered", status: "delivered", completed: status === "delivered" },
    ];
    return steps;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Order {orderNumber}
          </CardTitle>
          <Badge variant={status === "delivered" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Placed on {new Date(createdAt).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="relative">
          <div className="flex justify-between">
            {getStatusSteps().map((step, index) => (
              <div key={step.status} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    step.completed
                      ? "bg-accent border-accent text-accent-foreground"
                      : "bg-background border-muted-foreground/30"
                  }`}
                >
                  {step.completed && <CheckCircle className="h-4 w-4" />}
                </div>
                <p className="text-xs mt-2 text-center">{step.label}</p>
              </div>
            ))}
          </div>
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted-foreground/20 -z-10" />
        </div>

        {/* Tracking Information */}
        {trackingNumber && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Tracking Information</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-mono">{trackingNumber}</p>
              </div>
              {trackingUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                    Track Package
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};