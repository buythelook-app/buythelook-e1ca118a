
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error("Auth component error:", error);
    console.error("Error details:", errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }
  
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };
  
  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 flex flex-col items-center justify-center">
          <Alert variant="destructive" className="bg-red-900/80 text-white border-red-700 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              An error occurred in the authentication process.
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-gray-400 mb-4">
            {this.state.error?.message}
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={this.handleRetry}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Retry
            </Button>
            
            <Button 
              onClick={this.handleReload}
              className="bg-netflix-accent text-white hover:bg-netflix-accent/90"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
