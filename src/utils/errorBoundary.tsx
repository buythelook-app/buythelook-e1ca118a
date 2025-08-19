import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

/**
 * Global Error Boundary to catch React errors and provide graceful fallback
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Here you could send the error to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.handleReset} />;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-netflix-background text-netflix-text flex items-center justify-center p-6">
          <div className="bg-netflix-card rounded-lg p-8 max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4">משהו השתבש</h1>
            <p className="text-gray-400 mb-6">
              אירעה שגיאה בלתי צפויה. אנא נסה לרענן את הדף או חזור מאוחר יותר.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full bg-netflix-accent hover:bg-netflix-accent/90"
              >
                נסה שוב
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">פרטי השגיאה</summary>
                <pre className="text-xs mt-2 p-2 bg-gray-800 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for functional components to handle errors
 */
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    console.error('Error caught by error handler:', error, errorInfo);
    // You could also trigger a state update to show an error UI
  }, []);

  return handleError;
};