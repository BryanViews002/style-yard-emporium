import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastNotificationProps {
  type: ToastType;
  title: string;
  description?: string;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  className?: string;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  type,
  title,
  description,
  onClose,
  action,
  duration = 5000,
  className,
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-96 max-w-sm p-4 border rounded-lg shadow-lg",
        getBackgroundColor(),
        className
      )}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{title}</h4>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
          {action && (
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="mt-2"
            >
              {action.label}
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ToastNotification;
