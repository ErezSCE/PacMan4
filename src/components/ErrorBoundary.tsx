import React, { Component, ReactNode } from 'react';

/**
 * Global error boundary that catches render errors in the React component tree.
 * It accepts a `logLevel` prop to control the verbosity of console logging.
 * Supported levels: "error", "warn", "info", "debug". Default is "error".
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  /** Log level for console output when an error is caught */
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  /** Optional fallback UI to render when an error occurs */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static defaultProps = {
    logLevel: 'error' as const,
    fallback: <h2>Something went wrong.</h2>,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { logLevel } = this.props;
    // Log based on the configured level.
    // eslint-disable-next-line no-console
    switch (logLevel) {
      case 'debug':
        console.debug('ErrorBoundary caught an error:', error, errorInfo);
        break;
      case 'info':
        console.info('ErrorBoundary caught an error:', error, errorInfo);
        break;
      case 'warn':
        console.warn('ErrorBoundary caught an error:', error, errorInfo);
        break;
      case 'error':
      default:
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        break;
    }
  }

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;
    if (hasError) {
      return fallback;
    }
    return children;
  }
}
