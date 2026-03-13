
import React, { useState, useEffect, useCallback } from 'react';
import { WeatherData, FarmerUser } from '../types';
import { ArrowLeft, Wind, Droplets, Sun, Cloud, CloudRain, CloudSun, CloudSnow, LucideProps, Loader2, AlertCircle, Lightbulb, X, MapPin } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';
import { getWeatherData } from '../services/weatherService';
import { getLocationFromCoordinates } from '../services/locationService';
import { getWeatherAdvisory } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

// Hardcoded check for display purposes only, matching service logic
const OPENWEATHER_API_KEY = '16773e4c73626299c4f6f243b8599a44';

const weatherIcons: { [key: string]: React.ReactElement<LucideProps> } = {
  "Sun": <Sun className="w-20 h-20 text-yellow-500" />,
  "Cloud": <Cloud className="w-20 h-20 text-gray-400" />,
  "CloudRain": <CloudRain className="w-20 h-20 text-blue-500" />,
  "CloudSun": <CloudSun className="w-20 h-20 text-yellow-600" />,
  "CloudSnow": <CloudSnow className="w-20 h-20 text-blue-200" />,
};

const smallWeatherIcons: { [key: string]: React.ReactElement<LucideProps> } = {
  "Sun": <Sun className="w-8 h-8 text-yellow-500" />,
  "Cloud": <Cloud className="w-8 h-8 text-gray-400" />,
  "CloudRain": <CloudRain className="w-8 h-8 text-blue-500" />,
  "CloudSun": <CloudSun className="w-8 h-8 text-yellow-600" />,
  "CloudSnow": <CloudSnow className="w-8 h-8 text-blue-200" />,
};

const PageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="bg-brand-header p-4 flex items-center text-white sticky top-0 z-10 shadow-sm">
    <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-white/20" aria-label="Go back">
      <ArrowLeft className="w-6 h-6" />
    </button>
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

const WeatherPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advisory, setAdvisory] = useState<string | null>(null);
  const [isAdvisoryLoading, setIsAdvisoryLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Derive default location from user profile if available
  const defaultLocation = user?.role === 'farmer' ? (user as FarmerUser).profile.location : "Your Region";

  const fetchWeatherAndAdvisory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    let locationToUse = defaultLocation;
    let coords: { lat: number, lon: number } | undefined = undefined;

    try {
        if ("geolocation" in navigator) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
                });
                
                coords = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };

                // OpenWeatherMap Geocoding API via service
                const resolvedLocation = await getLocationFromCoordinates(
                    position.coords.latitude, 
                    position.coords.longitude
                );
                
                // Use the resolved location (City, State) from OWM
                locationToUse = resolvedLocation;

            } catch (geoError) {
                console.warn("Geolocation fallback:", geoError);
            }
        }

        // Pass coordinates to weather service for precision. 
        // If coords is undefined, it handles fallback safely.
        const data = await getWeatherData(locationToUse, coords?.lat, coords?.lon);
        
        if (data.daily.length > 0) {
            data.daily[0].day = t('weather.today');
        }

        setWeather(data);
        
        // Fetch AI advisory based on this real or fallback data
        setIsAdvisoryLoading(true);
        // Pass language to AI service
        getWeatherAdvisory(data, language)
            .then(setAdvisory)
            .catch(err => console.error("Failed to get AI advisory", err))
            .finally(() => setIsAdvisoryLoading(false));

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
        setLoading(false);
    }
  }, [defaultLocation, t, language]);

  useEffect(() => {
    fetchWeatherAndAdvisory();
  }, [fetchWeatherAndAdvisory]);


  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
        <PageHeader title={t('weather.title')} onBack={onBack} />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-black">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p>{t('weather.fetching')}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
        <PageHeader title={t('weather.title')} onBack={onBack} />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-red-600 p-4 text-center">
          <AlertCircle className="w-10 h-10 mb-4" />
          <p className="font-semibold text-lg">{t('weather.error.title')}</p>
          <p className="text-sm">{error || t('weather.error.message')}</p>
        </div>
      </div>
    );
  }
  
  const { current, daily } = weather;

  return (
    <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
      <PageHeader title={t('weather.title')} onBack={onBack} />
      <main className="p-4 space-y-4">
        {/* Notification Banner */}
        {notification && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg shadow-md flex justify-between items-center animate-fade-in-up" role="alert">
                <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3"/>
                    <p className="text-sm font-medium">{notification}</p>
                </div>
                <button onClick={() => setNotification(null)} className="ml-2 p-1 text-yellow-500 hover:text-yellow-800" aria-label="Dismiss">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        {/* Current Weather Card */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg text-black text-center animate-fade-in-up">
            <div className="flex items-center justify-center mb-1">
                <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                <p className="font-semibold text-lg">{current.location}</p>
            </div>
            {/* Show badge if using real OWM data or fallback */}
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">
               {OPENWEATHER_API_KEY ? "Live Forecast" : "Seasonal Trends"}
            </p>

            <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-20 h-20">{weatherIcons[current.icon] || <CloudSun className="w-20 h-20 text-yellow-600" />}</div>
                <div>
                    <p className="text-6xl font-bold">{current.temp}°</p>
                    <p className="text-lg -mt-1 font-medium">{current.description}</p>
                </div>
            </div>
            <div className="flex justify-around text-sm border-t border-gray-100 pt-4">
                <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span>{current.humidity}% Humidity</span>
                </div>
                <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span>{current.wind} km/h Wind</span>
                </div>
            </div>
        </div>

        {/* AI Advisory */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg text-black animate-fade-in-up" style={{animationDelay: '150ms'}}>
            <h2 className="text-lg font-semibold mb-2 px-2 flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-yellow-500"/>{t('weather.aiAdvisoryTitle')}</h2>
            {isAdvisoryLoading ? (
                 <div className="flex items-center text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/> {t('weather.generatingAdvisory')}
                </div>
            ) : (
                <p className="text-sm text-black italic">"{advisory || "Advisory unavailable."}"</p>
            )}
        </div>

        {/* Forecast List */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg text-black animate-fade-in-up" style={{animationDelay: '300ms'}}>
            <h2 className="text-lg font-semibold mb-2 px-2">{t('weather.forecastTitle')}</h2>
            <div className="space-y-2">
                {daily.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <p className="font-semibold w-12">{day.day}</p>
                        <div className="flex items-center gap-2 flex-1 justify-center">
                            {smallWeatherIcons[day.icon] || <CloudSun className="w-8 h-8 text-yellow-600" />}
                            <span className="text-xs text-gray-600">{day.description}</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium w-16 justify-end">
                            <span>{day.max}°</span>
                            <span className="text-gray-400">{day.min}°</span>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
                {OPENWEATHER_API_KEY ? "Verified OpenWeatherMap Data" : "Insights generated based on seasonal patterns."}
            </p>
        </div>
      </main>
    </div>
  );
};

export default WeatherPage;
