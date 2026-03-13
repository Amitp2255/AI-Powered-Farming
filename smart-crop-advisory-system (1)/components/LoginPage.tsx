import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, User, KeyRound, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';

interface LoginPageProps {
    onSwitchToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup }) => {
    const { login } = useAuth();
    const { t } = useLocalization();
    const [username, setUsername] = useState('farmer1');
    const [password, setPassword] = useState('farmer123');
    const [role, setRole] = useState<'farmer' | 'admin'>('farmer');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    // Check for a query param to show success message
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('signup') === 'success') {
            setSignupSuccess(true);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Update credentials when role changes for demo purposes
    useEffect(() => {
        if (role === 'farmer') {
            setUsername('farmer1');
            setPassword('farmer123');
        } else {
            setUsername('admin1');
            setPassword('admin123');
        }
        setError(null); // Clear error on role switch
    }, [role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        setSignupSuccess(false);
        try {
            await login(username, password, role);
        } catch (err) {
            setError(t('login.invalidCredentialsError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-bg p-4">
            <div className="w-full max-w-sm mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="inline-block bg-brand-header p-3 rounded-full mb-3">
                        <Leaf className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-black">{t('login.title')}</h1>
                    <p className="text-gray-600">{t('login.subtitle')}</p>
                    <p className="text-sm text-gray-500 mt-4 max-w-xs mx-auto">
                        Kisan Saathi is your AI-powered farming assistant, designed to empower farmers with data-driven insights. Get personalized crop recommendations based on your soil and weather, and use your camera to instantly detect pests. Our mission is to increase your yield and profitability through accessible technology.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Selector */}
                    <div className="flex justify-center bg-gray-200 rounded-full p-1">
                        <button
                            type="button"
                            onClick={() => setRole('farmer')}
                            className={`w-full py-2 text-sm font-semibold rounded-full transition-colors ${role === 'farmer' ? 'bg-primary-600 text-white shadow' : 'text-black'}`}
                        >
                            Farmer
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`w-full py-2 text-sm font-semibold rounded-full transition-colors ${role === 'admin' ? 'bg-gray-700 text-white shadow' : 'text-black'}`}
                        >
                            Admin
                        </button>
                    </div>

                    {/* Input Fields */}
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t('login.usernamePlaceholder')}
                            className="w-full pl-10 pr-3 py-3 text-base bg-white text-black border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-lg shadow-sm"
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('login.passwordPlaceholder')}
                            className="w-full pl-10 pr-3 py-3 text-base bg-white text-black border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-lg shadow-sm"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md flex items-center text-sm" role="alert">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    {signupSuccess && (
                         <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md flex items-center text-sm" role="alert">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span>{t('login.signupSuccess')}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white transition-colors ${role === 'farmer' ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500' : 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400`}
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (role === 'farmer' ? t('login.loginAsFarmer') : t('login.loginAsAdmin'))}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-black">
                        {t('login.createAccountPrompt')}{' '}
                        <button onClick={onSwitchToSignup} className="font-semibold text-primary-600 hover:underline">
                           {t('login.createAccountLink')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;