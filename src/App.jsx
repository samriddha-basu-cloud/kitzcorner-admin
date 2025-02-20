import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import { 
  Card,
  CardContent,
} from '@/components/ui/card';
import LoginRegisterPage from './pages/LoginRegisterPage';
import HomePage from './pages/HomePage';
import Footer from '../src/components/Footer';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="w-full max-w-md p-6">
      <CardContent className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </CardContent>
    </Card>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center space-y-4 p-6">
              <h2 className="text-xl font-semibold text-destructive">Something went wrong</h2>
              <p className="text-sm text-muted-foreground text-center">
                Please try refreshing the page or contact support if the problem persists.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Refresh Page
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Component with enhanced loading state
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component with enhanced loading state
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();

  return (
    <>
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route
          path="/login/*"
          element={
            <PublicRoute>
              <LoginRegisterPage />
            </PublicRoute>
          }
        />

        {/* 404 Route with enhanced UI */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center p-4">
              <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                  <p className="text-sm text-muted-foreground text-center">
                    The page you are looking for does not exist or has been moved.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Go to Home
                  </button>
                </CardContent>
              </Card>
            </div>
          }
        />
      </Routes>
      {location.pathname !== '/login' && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <AppContent />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

// PropTypes validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default App;