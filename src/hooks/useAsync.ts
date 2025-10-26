import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  ErrorHandler,
  getUserFriendlyMessage,
  isRetryableError,
  withRetry,
} from "@/utils/errorHandling";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
  retryable?: boolean;
  maxRetries?: number;
}

export const useAsync = <T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) => {
  const {
    onSuccess,
    onError,
    showToast = true,
    retryable = true,
    maxRetries = 3,
  } = options;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { toast } = useToast();
  const errorHandler = ErrorHandler.getInstance();

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const executeFunction =
          retryable && isRetryableError
            ? () => withRetry(() => asyncFunction(...args), maxRetries)
            : () => asyncFunction(...args);

        const data = await executeFunction();

        setState({ data, loading: false, error: null });

        if (onSuccess) {
          onSuccess(data);
        }

        return data;
      } catch (error: any) {
        const appError = errorHandler.handleError(error, "useAsync");
        const friendlyMessage = getUserFriendlyMessage(error);

        setState({ data: null, loading: false, error });

        if (onError) {
          onError(error);
        }

        if (showToast) {
          toast({
            title: "Error",
            description: friendlyMessage,
            variant: "destructive",
          });
        }

        throw error;
      }
    },
    [
      asyncFunction,
      onSuccess,
      onError,
      showToast,
      retryable,
      maxRetries,
      toast,
      errorHandler,
    ]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

// Hook for handling form submissions with error handling
export const useFormSubmission = <T = any>(
  submitFunction: (data: T) => Promise<any>,
  options: UseAsyncOptions = {}
) => {
  const asyncHook = useAsync(submitFunction, {
    showToast: true,
    retryable: false, // Form submissions usually shouldn't retry automatically
    ...options,
  });

  const handleSubmit = useCallback(
    async (data: T) => {
      try {
        return await asyncHook.execute(data);
      } catch (error) {
        // Error handling is done in useAsync
        throw error;
      }
    },
    [asyncHook]
  );

  return {
    ...asyncHook,
    handleSubmit,
  };
};

// Hook for handling API calls with loading states
export const useApiCall = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) => {
  return useAsync(apiFunction, {
    showToast: true,
    retryable: true,
    ...options,
  });
};

// Hook for handling file uploads
export const useFileUpload = (
  uploadFunction: (file: File) => Promise<any>,
  options: UseAsyncOptions = {}
) => {
  return useAsync(uploadFunction, {
    showToast: true,
    retryable: true,
    maxRetries: 2, // File uploads should have fewer retries
    ...options,
  });
};
