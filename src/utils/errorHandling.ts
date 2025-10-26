// Error handling utilities

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: any, context?: string, userId?: string): AppError {
    const appError: AppError = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: this.getErrorDetails(error),
      timestamp: new Date(),
      userId,
      context,
    };

    // Log error
    this.logError(appError);

    // In development, also log to console
    if (process.env.NODE_ENV === "development") {
      console.error("Error handled:", appError);
    }

    return appError;
  }

  private getErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.name) return error.name;
    if (error?.status) return `HTTP_${error.status}`;
    return "UNKNOWN_ERROR";
  }

  private getErrorMessage(error: any): string {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.error_description) return error.error_description;
    if (error?.msg) return error.msg;
    return "An unexpected error occurred";
  }

  private getErrorDetails(error: any): any {
    if (error?.details) return error.details;
    if (error?.stack) return { stack: error.stack };
    if (error?.response) return { response: error.response };
    return null;
  }

  private logError(error: AppError): void {
    this.errorLog.push(error);

    // Keep only last 100 errors in memory
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error);
  }

  public getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Common error types
export const ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  PAYMENT_ERROR: "PAYMENT_ERROR",
  INVENTORY_ERROR: "INVENTORY_ERROR",
  EMAIL_ERROR: "EMAIL_ERROR",
  UPLOAD_ERROR: "UPLOAD_ERROR",
} as const;

// Error message mappings
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]:
    "Network connection failed. Please check your internet connection and try again.",
  [ERROR_CODES.AUTHENTICATION_ERROR]:
    "Authentication failed. Please log in again.",
  [ERROR_CODES.AUTHORIZATION_ERROR]:
    "You do not have permission to perform this action.",
  [ERROR_CODES.VALIDATION_ERROR]: "Please check your input and try again.",
  [ERROR_CODES.NOT_FOUND_ERROR]: "The requested resource was not found.",
  [ERROR_CODES.SERVER_ERROR]:
    "A server error occurred. Please try again later.",
  [ERROR_CODES.PAYMENT_ERROR]:
    "Payment processing failed. Please try again or use a different payment method.",
  [ERROR_CODES.INVENTORY_ERROR]: "Inventory update failed. Please try again.",
  [ERROR_CODES.EMAIL_ERROR]: "Email sending failed. Please try again later.",
  [ERROR_CODES.UPLOAD_ERROR]: "File upload failed. Please try again.",
} as const;

// Helper function to get user-friendly error message
export const getUserFriendlyMessage = (error: any): string => {
  const errorHandler = ErrorHandler.getInstance();
  const appError = errorHandler.handleError(error);

  return (
    ERROR_MESSAGES[appError.code as keyof typeof ERROR_MESSAGES] ||
    appError.message
  );
};

// Helper function to check if error is retryable
export const isRetryableError = (error: any): boolean => {
  const code = error?.code || error?.status;

  // Network errors and 5xx server errors are usually retryable
  if (code === ERROR_CODES.NETWORK_ERROR) return true;
  if (typeof code === "number" && code >= 500) return true;

  return false;
};

// Helper function to get error severity
export const getErrorSeverity = (
  error: any
): "low" | "medium" | "high" | "critical" => {
  const code = error?.code || error?.status;

  switch (code) {
    case ERROR_CODES.PAYMENT_ERROR:
    case ERROR_CODES.AUTHENTICATION_ERROR:
      return "critical";
    case ERROR_CODES.SERVER_ERROR:
    case ERROR_CODES.INVENTORY_ERROR:
      return "high";
    case ERROR_CODES.NETWORK_ERROR:
    case ERROR_CODES.UPLOAD_ERROR:
      return "medium";
    default:
      return "low";
  }
};

// Retry utility
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};
