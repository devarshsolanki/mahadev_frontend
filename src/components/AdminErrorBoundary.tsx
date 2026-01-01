import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-2xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-muted-foreground">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="mt-6 flex gap-4">
            <Button onClick={this.handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-6 max-w-xl overflow-x-auto rounded bg-muted p-4 text-left text-sm">
              {this.state.error?.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}