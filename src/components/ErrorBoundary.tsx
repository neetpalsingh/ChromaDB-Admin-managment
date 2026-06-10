import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-red-600 mb-4">
                An error occurred while loading this component. Please try refreshing the page.
              </p>
              {this.state.error && (
                <div className="text-xs text-red-500 mb-4 text-left">
                  <details>
                    <summary className="cursor-pointer font-medium">Error details</summary>
                    <div className="mt-2 p-2 bg-red-100 rounded overflow-auto">
                      <pre className="whitespace-pre-wrap">{this.state.error.message}</pre>
                    </div>
                  </details>

                  {/* Specific help for common errors */}
                  {(this.state.error.message.includes('map is not a function') ||
                    this.state.error.message.includes('filter is not a function')) && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 text-xs">
                        <strong>Common cause:</strong> The server returned data in an unexpected format.
                        This usually happens when the API response is not an array as expected.
                        Try refreshing the page or check the browser console for more details.
                      </p>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
