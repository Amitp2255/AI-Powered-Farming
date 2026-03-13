import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocalizationProvider } from './contexts/LocalizationContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import FarmerApp from './components/FarmerApp';
import AdminDashboard from './components/AdminDashboard';
import { Loader2 } from 'lucide-react';

// This component decides which main view to show based on auth state.
const AppContent: React.FC = () => {
  const { user } = useAuth(); // Use user from context to react to login/logout
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    // AuthProvider handles initializing the user. This just prevents a layout flash.
    setTimeout(() => setLoading(false), 200);
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-bg">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
    );
  }

  if (!user) {
    switch (authView) {
      case 'signup':
        return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
      case 'login':
      default:
        return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />;
    }
  }

  switch(user.role) {
    case 'farmer':
      return <FarmerApp />;
    case 'admin':
      return <AdminDashboard />;
    default:
      // This case should not be reached if a user object exists
      return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />;
  }
};

const App: React.FC = () => (
  <AuthProvider>
    <LocalizationProvider>
      <AppContent />
    </LocalizationProvider>
  </AuthProvider>
);

export default App;