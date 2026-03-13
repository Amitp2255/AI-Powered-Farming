import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, User, KeyRound, Loader2, AlertTriangle, Hash, MapPin, Phone, Sprout } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';
import { FarmerProfile } from '../types';
import { Language } from '../translations';

interface SignupPageProps {
    onSwitchToLogin: () => void;
}

const SOIL_TYPES: FarmerProfile['soilType'][] = ['Black', 'Red', 'Loamy', 'Sandy', 'Clay'];
const IRRIGATION_SOURCES: FarmerProfile['irrigationSource'][] = ['Borewell', 'Canal', 'Rain-fed', 'Tank'];

const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin }) => {
    const { signup } = useAuth();
    const { t, supportedLanguages, language } = useLocalization();
    
    const [formData, setFormData] = useState<FarmerProfile & {username: string; password: string}>({
        fullName: '',
        phone: '',
        location: '',
        landSize: 0,
        soilType: '',
        irrigationSource: '',
        lastSeasonCrops: '',
        preferredLanguage: language,
        username: '',
        password: '',
    });
    
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'landSize' ? (value ? parseFloat(value) : 0) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const { username, password, ...profile } = formData;
        if (!username || !password || !profile.fullName || !profile.phone || !profile.location || !profile.soilType || !profile.irrigationSource || profile.landSize <= 0) {
            setError("Please fill all required fields.");
            setIsLoading(false);
            return;
        }

        try {
            await signup(username, password, profile);
            // Redirect to login page with a success message
            window.location.search = '?signup=success';
            onSwitchToLogin();
        } catch (err) {
            setError(err instanceof Error ? t(`signup.${err.message.includes('taken') ? 'usernameExistsError' : 'genericError'}`) : t('signup.genericError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-bg p-4">
            <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 animate-fade-in-up">
                <div className="text-center mb-6">
                    <div className="inline-block bg-brand-header p-3 rounded-full mb-3">
                        <Leaf className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-black">{t('signup.title')}</h1>
                    <p className="text-gray-600">{t('signup.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder={t('signup.fullName')} className="w-full p-3 text-base bg-white text-black border border-gray-300 rounded-lg shadow-sm" required />
                        <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder={t('signup.phoneNumber')} className="w-full p-3 text-base bg-white text-black border border-gray-300 rounded-lg shadow-sm" required />
                        <input name="location" value={formData.location} onChange={handleChange} placeholder={t('signup.villageDistrict')} className="w-full p-3 text-base bg-white text-black border border-gray-300 rounded-lg shadow-sm" required />
                        <input name="landSize" type="number" value={formData.landSize || ''} onChange={handleChange} placeholder={t('signup.landSize')} className="w-full p-3 text-base bg-white text-black border border-gray-300 rounded-lg shadow-sm" required min="0" />
                        <select name="soilType" value={formData.soilType} onChange={handleChange} className="w-full p-3 text-base bg-white text-black border border-gray-300 rounded-lg shadow-sm" required>
                            <option value="" disabled>{t('signup.selectSoilType')}</option>
                            {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select name="irrigationSource" value={formData.irrigationSource} onChange={handleChange} className="w-full p-3 text-base bg-white text-black border border-gray-300 rounded-lg shadow-sm" required>
                             <option value="" disabled>{t('signup.selectIrrigationSource')}</option>
                            {IRRIGATION_SOURCES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>
                    <input name="lastSeasonCrops" value={formData.lastSeasonCrops} onChange={handleChange} placeholder={t('signup.lastSeasonCropsPlaceholder')} className="w-full p-3 text-base bg-white text-black border border-gray-300 rounded-lg shadow-sm" required />
                    <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="w-full p-3 text-base bg-white text-black border border-gray-300 rounded-lg shadow-sm" required>
                       {supportedLanguages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                    <hr className="my-2 border-gray-300" />
                    <input name="username" value={formData.username} onChange={handleChange} placeholder={t('signup.username')} className="w-full p-3 text-base bg-white text-black border border-gray-300 rounded-lg shadow-sm" required autoComplete="username" />
                    <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={t('signup.password')} className="w-full p-3 text-base bg-white text-black border border-gray-300 rounded-lg shadow-sm" required autoComplete="new-password" />

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md flex items-center text-sm" role="alert">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400">
                        {isLoading ? <><Loader2 className="w-6 h-6 animate-spin mr-2" /> {t('signup.creatingAccount')}</> : t('signup.createAccountButton')}
                    </button>
                </form>

                 <div className="text-center mt-6">
                    <p className="text-sm text-black">
                        {t('signup.loginPrompt')}{' '}
                        <button onClick={onSwitchToLogin} className="font-semibold text-primary-600 hover:underline">
                           {t('signup.loginLink')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
