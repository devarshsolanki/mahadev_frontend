import React from 'react';

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // You can log to an error reporting service here
    // console.error('Unhandled render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-8">
          <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">An unexpected error occurred while rendering this page.</p>
            <details className="text-xs whitespace-pre-wrap text-red-600">
              {this.state.error?.message}
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
