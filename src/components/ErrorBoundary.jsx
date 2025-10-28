import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
          <Card className="max-w-md w-full p-8 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-2">Yon erè te rive</h2>
            <p className="text-gray-600 mb-6">
              Nou regret erè sa. Tanpri eseye ankò oswa retounen nan paj lakay ou.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-red-50 rounded text-left text-xs text-red-700 font-mono overflow-auto">
                {this.state.error?.toString()}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw size={16} className="mr-2" />
                Reesseye
              </Button>
              <Button onClick={() => (window.location.href = '/')} variant="outline">
                <Home size={16} className="mr-2" />
                Paj Lakay
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

