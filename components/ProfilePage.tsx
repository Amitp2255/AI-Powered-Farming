import React, { useState } from 'react';
import { ArrowLeft, User, MapPin, Phone, Edit, Tractor, Wheat, Languages, Bell, LogOut, CheckCircle } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Language } from '../translations';
import { useAuth } from '../contexts/AuthContext';
import { FarmerUser } from '../types';

const PageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="bg-brand-header p-4 flex items-center text-white sticky top-0 z-10 shadow-sm">
    <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-white/20" aria-label="Go back">
      <ArrowLeft className="w-6 h-6" />
    </button>
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

const ProfilePage: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
    const { t, language, setLanguage, supportedLanguages } = useLocalization();
    const { user, logout } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const farmerUser = user as FarmerUser; // We assume this page is only for farmers

    const handleSubscribe = () => {
        if (phoneNumber.match(/^\d{10}$/)) {
            setIsSubscribed(true);
            // In a real app, an API call to register the number would go here.
        } else {
            alert(t('profile.invalidPhoneNumberError'));
        }
    };
    
    return (
        <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
            <PageHeader title={t('profile.title')} onBack={onBack} />
            <main className="p-4 space-y-4">
                {/* Profile Card */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg flex items-center space-x-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-10 h-10 text-gray-500" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-black">{farmerUser.profile.fullName}</h2>
                        <div className="text-sm text-black flex items-center mt-1">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{farmerUser.profile.phone}</span>
                        </div>
                        <div className="text-sm text-black flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{farmerUser.profile.location}</span>
                        </div>
                    </div>
                    <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" aria-label={t('profile.editProfile')}>
                        <Edit className="w-5 h-5" />
                    </button>
                </div>

                {/* Farm Information */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg">
                     <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-black">{t('profile.farmInfo')}</h3>
                        <button className="text-sm text-primary-600 font-medium flex items-center">
                            <Edit className="w-4 h-4 mr-1"/> {t('profile.update')}
                        </button>
                     </div>
                     <div className="space-y-2 text-sm">
                        <div className="flex items-center text-black">
                            <Tractor className="w-5 h-5 text-gray-400 mr-3"/>
                            <strong>{t('profile.soilType')}:</strong><span className="ml-2">{farmerUser.profile.soilType}</span>
                        </div>
                        <div className="flex items-center text-black">
                            <Wheat className="w-5 h-5 text-gray-400 mr-3"/>
                            <strong>{t('profile.primaryCrops')}:</strong><span className="ml-2">{farmerUser.profile.lastSeasonCrops}</span>
                        </div>
                     </div>
                </div>

                {/* Settings */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg">
                    <ul className="divide-y divide-gray-200">
                        <li className="p-4 flex justify-between items-center">
                            <div className="flex items-center">
                                <Languages className="w-5 h-5 text-gray-500 mr-3"/>
                                <span className="font-medium text-black">{t('profile.language')}</span>
                            </div>
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="text-sm text-black bg-gray-100 border-none rounded-md py-1 pl-2 pr-8 focus:ring-primary-500"
                            >
                                {supportedLanguages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                        </li>
                        <li className="p-4 flex justify-between items-center">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 text-gray-500 mr-3"/>
                                <span className="font-medium text-black">{t('profile.notifications')}</span>
                            </div>
                             <label htmlFor="notifications" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" id="notifications" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </li>
                    </ul>
                </div>

                {/* SMS Alerts for Non-Smartphone Farmers */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg">
                    <h3 className="text-lg font-semibold text-black mb-2">{t('profile.smsAlerts')}</h3>
                    <p className="text-sm text-black mb-3">{t('profile.smsDescription')}</p>
                    {isSubscribed ? (
                        <div className="text-center text-green-700 bg-green-100 p-3 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <p className="font-medium">{t('profile.subscribeSuccess')}</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder={t('profile.phoneNumberPlaceholder')}
                                className="flex-1 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                maxLength={10}
                            />
                            <button
                                onClick={handleSubscribe}
                                className="py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                            >
                                {t('profile.subscribe')}
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Logout Button */}
                <div className="pt-2">
                     <button onClick={logout} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <LogOut className="mr-2 h-5 w-5" /> {t('profile.logout')}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;