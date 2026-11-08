import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(_error, _errorInfo) {
    // Error logged or handled cleanly
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          id="app-error-boundary"
          className="min-h-screen flex items-center justify-center p-6 bg-neutral-50"
        >
          <div className="card-static max-w-md w-full p-8 text-center bg-white shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5 border border-rose-100">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900 font-heading mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
              An unexpected error occurred in the application interface.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                id="error-boundary-reload-btn"
                onClick={this.handleReload}
                className="btn btn-primary w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                type="button"
                id="error-boundary-home-btn"
                onClick={this.handleReset}
                className="btn btn-secondary w-full sm:w-auto"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

