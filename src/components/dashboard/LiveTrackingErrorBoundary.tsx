import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorBoundaryFallback } from "./LiveTrackingMapFallback";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class LiveTrackingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error(
        "LiveTracking Error Boundary caught an error:",
        error,
        errorInfo
      );
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external error reporting service in production
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.error("LiveTracking Error:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback || (
          <ErrorBoundaryFallback
            error={this.state.error}
            resetError={this.handleReset}
          />
        )
      );
    }

    return this.props.children;
  }
}

// Hook for error boundary functionality
export const useErrorHandler = () => {
  const handleError = React.useCallback(
    (error: Error, errorInfo?: ErrorInfo) => {
      console.error("LiveTracking Error:", error, errorInfo);

      // You can add more error handling logic here
      // e.g., sending to error reporting service, showing toast notification, etc.
    },
    []
  );

  return { handleError };
};
