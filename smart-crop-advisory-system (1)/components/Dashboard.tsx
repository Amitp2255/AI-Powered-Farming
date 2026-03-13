
import React, { useState, useEffect } from 'react';
import { Leaf, HelpCircle, Mic, Home, User, Sprout, CloudSun, BarChart, Bug, Search, IndianRupee, Landmark, Package, Bell, AlertTriangle, X, Fish, Flower, Layers, Box, Grape, Info, Loader2, Video, MapPin } from 'lucide-react';
import { AppPage, OutbreakAlert, MultiFarmingType } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';
import { getOutbreakAlerts } from '../services/alertService';
import { getLocationFromCoordinates } from '../services/locationService';
import { getWeatherData } from '../services/weatherService';

interface DashboardProps {
  onNavigate: (page: AppPage) => void;
  onOpenChatbot: () => void;
  onSelectFarmingType: (type: MultiFarmingType) => void;
}

const Header: React.FC<{ alertCount: number, onAlertClick: () => void }> = ({ alertCount, onAlertClick }) => {
  const { t } = useLocalization();
  return (
    <header className="bg-brand-header p-4 flex justify-between items-center text-white sticky top-0 z-10 shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="bg-white p-1 rounded-full">
          <Leaf className="w-6 h-6 text-green-600" />
        </div>
        <h1 className="text-xl font-bold">{t('header.title')}</h1>
      </div>
      <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-full hover:bg-white/20" onClick={onAlertClick}>
            <Bell className="w-6 h-6" />
            {alertCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{alertCount}</span>
                </span>
            )}
          </button>
        <HelpCircle className="w-6 h-6" />
      </div>
    </header>
  );
};

const OutbreakAlertBanner: React.FC<{ alert: OutbreakAlert; onDismiss: () => void }> = ({ alert, onDismiss }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded-r-lg shadow-lg animate-fade-in-up" role="alert">
            <div className="flex">
                <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-4"/></div>
                <div>
                    <p className="font-bold">{t('dashboard.outbreakAlertTitle')}: {alert.disease}</p>
                    <p className="text-sm">{alert.advice}</p>
                </div>
                <button onClick={onDismiss} className="ml-auto -mt-2 -mr-2 p-1 text-red-500 hover:text-red-800" aria-label="Dismiss">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}

const VoiceControl: React.FC<{ onOpenChatbot: () => void }> = ({ onOpenChatbot }) => {
  const { t } = useLocalization();
  return (
    <button onClick={onOpenChatbot} className="w-full flex flex-col items-center justify-center text-center py-8 px-4 text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg">
      <div className="relative mb-4">
        <div className="absolute -inset-1 border border-gray-300/70 rounded-full animate-pulse"></div>
        <div className="absolute -inset-2.5 border border-gray-300/50 rounded-full animate-pulse delay-500"></div>
        <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
          <Mic className="w-16 h-16 text-gray-700" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 bg-white px-2 py-1 rounded-md shadow-sm">
          <span role="img" aria-label="Indian Flag">🇮🇳</span>
        </div>
      </div>
      <p className="font-semibold text-lg">{t('dashboard.speakPrompt')}</p>
    </button>
  );
};

const NavCard: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    bgColor: string; 
    children?: React.ReactNode;
    onClick?: () => void;
    isButton?: boolean;
}> = ({ icon, title, bgColor, children, onClick, isButton }) => {
    const content = (
        <>
            <div className="flex-grow flex items-center justify-center">
                {icon}
            </div>
            <p className="font-semibold text-black mt-2 text-center">{title}</p>
            {children}
        </>
    );
    const classNames = `relative ${bgColor} p-4 rounded-2xl flex flex-col justify-between items-center h-36 shadow-sm w-full transition-transform hover:scale-105`;

    if (isButton) {
        return (
            <button onClick={onClick} className={`${classNames} text-black`}>
                {content}
            </button>
        );
    }
    return <div className={classNames}>{content}</div>;
};

const MultiFarmingCard: React.FC<{ type: MultiFarmingType; onClick: (type: MultiFarmingType) => void }> = ({ type, onClick }) => {
    const { t } = useLocalization();
    const icons: Record<MultiFarmingType, React.ReactNode> = {
        Aquaculture: <Fish className="w-6 h-6 text-blue-600"/>,
        Floriculture: <Flower className="w-6 h-6 text-pink-600"/>,
        Horticulture: <Sprout className="w-6 h-6 text-green-600"/>,
        Sericulture: <Layers className="w-6 h-6 text-amber-600"/>, // Silk layers
        Apiculture: <Box className="w-6 h-6 text-yellow-600"/>, // Bee box
        Pisciculture: <Fish className="w-6 h-6 text-cyan-600"/>,
        Viticulture: <Grape className="w-6 h-6 text-purple-600"/>
    };

    return (
        <button onClick={() => onClick(type)} className="min-w-[100px] bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center mr-3 hover:bg-gray-50 transition-colors">
            <div className="bg-gray-100 p-2 rounded-full mb-2">
                {icons[type]}
            </div>
            <span className="text-xs font-medium text-gray-800 text-center">{t(`dashboard.${type.toLowerCase()}`)}</span>
        </button>
    );
};


const MainContent: React.FC<{ onNavigate: (page: AppPage) => void; onSelectFarmingType: (type: MultiFarmingType) => void }> = ({ onNavigate, onSelectFarmingType }) => {
  const { t } = useLocalization();

  const handleFarmingClick = (type: MultiFarmingType) => {
      onSelectFarmingType(type);
      onNavigate('multi-farming');
  };

  const farmingTypes: MultiFarmingType[] = ['Aquaculture', 'Floriculture', 'Horticulture', 'Sericulture', 'Apiculture', 'Pisciculture', 'Viticulture'];

  return (
    <main className="px-4 pb-4">
        <div className="bg-white rounded-3xl p-4 shadow-lg space-y-4">
            
            {/* Top Row */}
            <div className="grid grid-cols-2 gap-4">
                <NavCard 
                    isButton
                    onClick={() => onNavigate('crop')}
                    icon={<Sprout className="w-10 h-10 text-yellow-700"/>} 
                    title={t('dashboard.cropAdvice')}
                    bgColor="bg-brand-cardYellow" 
                />
                <NavCard 
                    isButton
                    onClick={() => onNavigate('pest')}
                    icon={<Bug className="w-10 h-10 text-teal-700"/>} 
                    title={t('dashboard.pestAdvice')}
                    bgColor="bg-brand-cardTeal"
                />
            </div>

            {/* Weather - Full Width */}
            <NavCard 
                isButton
                onClick={() => onNavigate('weather')}
                icon={<CloudSun className="w-10 h-10 text-blue-500"/>} 
                title={t('dashboard.weatherUpdate')}
                bgColor="bg-blue-50"
            />

            {/* Multi-Farming Solutions Section (Below Crop/Pest, Above Market) */}
            <div className="pt-2 pb-1">
                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <Layers className="w-4 h-4 mr-1 text-primary-600"/>
                    {t('dashboard.multiFarmingTitle')}
                </h3>
                <div className="flex overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                    {farmingTypes.map(type => (
                        <MultiFarmingCard key={type} type={type} onClick={handleFarmingClick} />
                    ))}
                </div>
            </div>

            {/* Bottom Row - Market & Schemes */}
             <div className="grid grid-cols-2 gap-4">
                <NavCard 
                    isButton
                    onClick={() => onNavigate('market')}
                    icon={<BarChart className="w-10 h-10 text-green-700"/>} 
                    title={t('dashboard.marketPrices')}
                    bgColor="bg-green-50" 
                />
                <NavCard 
                    isButton
                    onClick={() => onNavigate('schemes')}
                    icon={<Landmark className="w-10 h-10 text-purple-700"/>} 
                    title={t('dashboard.govtSchemes')}
                    bgColor="bg-purple-50" 
                />
            </div>
            
             <div className="grid grid-cols-2 gap-4">
                 <NavCard 
                    isButton
                    onClick={() => onNavigate('allocations')}
                    icon={<Package className="w-10 h-10 text-orange-600"/>} 
                    title={t('dashboard.myAllocations')}
                    bgColor="bg-orange-50" 
                />
                 <NavCard 
                    isButton
                    onClick={() => onNavigate('profile')}
                    icon={<User className="w-10 h-10 text-gray-600"/>} 
                    title={t('profile.title')}
                    bgColor="bg-gray-50" 
                />
             </div>
        </div>
    </main>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenChatbot, onSelectFarmingType }) => {
  const [alerts, setAlerts] = useState<OutbreakAlert[]>([]);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [liveWeather, setLiveWeather] = useState<{location: string, temp: number, desc: string} | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    // Poll for alerts occasionally
    getOutbreakAlerts().then(setAlerts);
  }, []);

  // Live Location & Weather Fetch
  useEffect(() => {
    const fetchLiveLocation = async () => {
        if ("geolocation" in navigator) {
            setLoadingWeather(true);
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const location = await getLocationFromCoordinates(lat, lon);
                    const weather = await getWeatherData(location, lat, lon);
                    setLiveWeather({
                        location: location,
                        temp: weather.current.temp,
                        desc: weather.current.description
                    });
                } catch (e) {
                    console.error("Live fetch failed", e);
                } finally {
                    setLoadingWeather(false);
                }
            }, (error) => {
                 console.warn("Geolocation denied/error", error);
                 setLoadingWeather(false);
            }, { timeout: 10000 });
        }
    };
    fetchLiveLocation();
  }, []);

  const handleDismissAlert = () => setIsAlertVisible(false);
  const handleShowAlert = () => {
    if (alerts.length > 0) setIsAlertVisible(true);
  }
  
  // Show alert automatically on load if exists
  useEffect(() => {
    if (alerts.length > 0) setIsAlertVisible(true);
  }, [alerts]);

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20">
      <Header alertCount={alerts.length} onAlertClick={handleShowAlert}/>
      {isAlertVisible && alerts.length > 0 && (
        <OutbreakAlertBanner alert={alerts[0]} onDismiss={handleDismissAlert} />
      )}
      <VoiceControl onOpenChatbot={onOpenChatbot} />
      <MainContent onNavigate={onNavigate} onSelectFarmingType={onSelectFarmingType} />

      {/* Live Weather Footer */}
      {(liveWeather || loadingWeather) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-2 z-50 flex justify-between items-center px-4 shadow-lg animate-fade-in-up max-w-md mx-auto rounded-t-xl">
            {loadingWeather ? (
                 <div className="flex items-center text-xs text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin mr-2"/> Locating...
                 </div>
            ) : liveWeather && (
                <>
                    <div className="flex items-center text-sm font-semibold text-gray-800">
                        <MapPin className="w-4 h-4 text-green-600 mr-1"/>
                        {liveWeather.location}
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-600">
                        <CloudSun className="w-4 h-4 text-orange-500 mr-1"/>
                        {liveWeather.temp}°C, {liveWeather.desc}
                    </div>
                </>
            )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
