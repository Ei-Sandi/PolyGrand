import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          maxWidth: '800px', 
          margin: '40px auto',
          backgroundColor: '#fee',
          border: '2px solid #c00',
          borderRadius: '8px'
        }}>
          <h1 style={{ color: '#c00', marginBottom: '20px' }}>Something went wrong</h1>
          <details style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }}>
              Error Details
            </summary>
            <p style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
              {this.state.error?.toString()}
            </p>
            <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#00dc94',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
