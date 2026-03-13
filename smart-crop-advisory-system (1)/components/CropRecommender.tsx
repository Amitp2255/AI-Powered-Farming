
import React, { useState, useCallback, useEffect } from 'react';
import { getCropRecommendation } from '../services/geminiService';
import { getIoTData, setPumpStatus } from '../services/iotService';
import { getWeatherData } from '../services/weatherService';
import { CropRecommendation, IoTData } from '../types';
import { ArrowLeft, DollarSign, BarChart, Loader2, Sprout, Thermometer, Droplets, TestTube, Zap, AlertTriangle, Lightbulb, CheckCircle, Power, Leaf, CloudRain, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';

// --- Shared Components ---
const PageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="bg-brand-header p-4 flex items-center text-white sticky top-0 z-10 shadow-sm">
    <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-white/20" aria-label="Go back">
      <ArrowLeft className="w-6 h-6" />
    </button>
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

const FormSelect: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }> = ({ label, id, value, onChange, options }) => {
    const { t } = useLocalization();
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-black mb-1">{label}</label>
            <select id={id} value={value} onChange={onChange} className="w-full p-3 text-base bg-white text-black border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-lg shadow-sm">
                {options.map(type => (
                    // Using t() to translate the display label, while keeping 'type' as the English value
                    <option key={type} value={type}>{t(`cropParams.${type}`)}</option>
                ))}
            </select>
        </div>
    );
};

const NutrientStatus: React.FC<{ level: number, low: number, high: number }> = ({ level, low, high }) => {
    let status = 'Optimal';
    let color = 'text-green-600';
    if (level < low) {
        status = 'Low';
        color = 'text-red-600';
    } else if (level > high) {
        status = 'High';
        color = 'text-orange-500';
    }
    return <span className={`font-bold ${color}`}>{status}</span>
};

// --- Main Page Component ---
const SOIL_TYPES = ["Alluvial", "Black", "Red", "Laterite", "Arid", "Forest"];
const WATER_AVAILABILITY = ["Abundant", "Moderate", "Scarce", "Rain-fed"];
const SEASONS = ["Kharif (Monsoon)", "Rabi (Winter)", "Zaid (Summer)"];
const FARMING_TYPES = ["Normal Farming", "Aquaculture", "Floriculture", "Horticulture", "Sericulture", "Apiculture", "Pisciculture", "Viticulture"];

const CropRecommenderPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t, language } = useLocalization();
  // Form state
  const [soilType, setSoilType] = useState(SOIL_TYPES[0]);
  const [waterAvailability, setWaterAvailability] = useState(WATER_AVAILABILITY[0]);
  const [season, setSeason] = useState(SEASONS[0]);
  const [farmingType, setFarmingType] = useState(FARMING_TYPES[0]);
  const [previousCrop, setPreviousCrop] = useState('');
  // API state
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // IoT state
  const [iotData, setIotData] = useState<IoTData | null>(null);
  const [isIotLoading, setIsIotLoading] = useState(false);
  const [iotError, setIotError] = useState<string | null>(null);
  // Weather state
  const [weatherAdvisory, setWeatherAdvisory] = useState<string | null>(null);


  const fetchIotData = useCallback(async (isInitial = false) => {
    if (isInitial) {
        setIsIotLoading(true);
        setIotError(null);
    }
    try {
      const data = await getIoTData();
      setIotData(data);
      if(isInitial) setIotError(null);
    } catch (err) {
      if(isInitial) setIotError(err instanceof Error ? err.message : 'Failed to connect.');
    } finally {
      if(isInitial) setIsIotLoading(false);
    }
  }, []);

  // Initial fetch and periodic polling for IoT
  useEffect(() => {
    fetchIotData(true); // Initial fetch with loading state
    const intervalId = setInterval(() => fetchIotData(false), 15000); // Poll every 15s for live demo feel
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchIotData]);
  
  // Fetch weather data for advisory (Safe Mode)
  useEffect(() => {
    const fetchWeatherForAdvisory = () => {
        // Safe mode call, no coordinates required
        getWeatherData().then(data => {
            const tomorrow = data.daily[1]; // Index 1 is tomorrow
            if (tomorrow && (tomorrow.description.toLowerCase().includes('rain') || tomorrow.description.toLowerCase().includes('thunder'))) {
                setWeatherAdvisory(t('cropRecommender.weatherRainAdvisory'));
            } else if (data.current.temp > 40) {
                setWeatherAdvisory(t('cropRecommender.weatherHotAdvisory'));
            } else {
                setWeatherAdvisory(null);
            }
        }).catch(err => {
            console.warn("Could not fetch weather for advisory:", err.message);
        });
    };
    
    fetchWeatherForAdvisory();
  }, [t]);


  const handlePumpToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!iotData) return;
    const newStatus = e.target.checked ? 'ON' : 'OFF';
    setIotData({ ...iotData, pumpStatus: newStatus }); // Optimistic update
    try {
        await setPumpStatus(newStatus);
        // We can re-fetch data here to confirm, but for demo, optimistic is fine.
    } catch (error) {
        // Revert on failure
        setIotData({ ...iotData, pumpStatus: newStatus === 'ON' ? 'OFF' : 'ON' });
        alert("Failed to toggle pump.");
    }
  };
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const result = await getCropRecommendation(soilType, waterAvailability, season, previousCrop, farmingType, iotData ?? undefined, language);
      setRecommendations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [soilType, waterAvailability, season, previousCrop, farmingType, iotData, language]);

  return (
    <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
      <PageHeader title={t('cropRecommender.title')} onBack={onBack} />
      <main className="p-4 space-y-4">
        {/* IoT Data Card */}
        <div className="bg-white p-4 rounded-3xl shadow-lg">
            <h2 className="text-lg font-semibold text-black text-center mb-3">{t('cropRecommender.iotTitle')}</h2>
            {isIotLoading ? (
                <div className="flex items-center justify-center text-black">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('cropRecommender.connecting')}
                </div>
            ) : iotError ? (
                <div className="text-center text-red-600 bg-red-100 p-3 rounded-xl">
                    <p>{iotError}</p>
                    <button onClick={() => fetchIotData(true)} className="text-sm font-semibold mt-2 underline">Try Again</button>
                </div>
            ) : iotData ? (
                <div className="animate-fade-in-up">
                    <p className="text-center text-sm text-green-700 font-medium mb-3 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2"/>{t('cropRecommender.sensorConnected')}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="bg-gray-100 p-2 rounded-lg"><TestTube className="w-5 h-5 mx-auto text-purple-500 mb-1"/><p className="font-medium text-black">{iotData.ph.toFixed(1)}</p><p className="text-xs text-black">pH</p></div>
                        <div className="bg-gray-100 p-2 rounded-lg"><Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1"/><p className="font-medium text-black">{iotData.moisture.toFixed(0)}%</p><p className="text-xs text-black">{t('cropRecommender.moisture')}</p></div>
                        <div className="bg-gray-100 p-2 rounded-lg"><Thermometer className="w-5 h-5 mx-auto text-red-500 mb-1"/><p className="font-medium text-black">{iotData.temperature.toFixed(0)}°C</p><p className="text-xs text-black">{t('cropRecommender.temperature')}</p></div>
                        <div className="bg-gray-100 p-2 rounded-lg"><p className="font-bold text-lg text-black">N</p><p className="font-medium text-black">{iotData.nitrogen.toFixed(0)}</p><p className="text-xs text-black">mg/kg</p></div>
                        <div className="bg-gray-100 p-2 rounded-lg"><p className="font-bold text-lg text-black">P</p><p className="font-medium text-black">{iotData.phosphorus.toFixed(0)}</p><p className="text-xs text-black">mg/kg</p></div>
                        <div className="bg-gray-100 p-2 rounded-lg"><p className="font-bold text-lg text-black">K</p><p className="font-medium text-black">{iotData.potassium.toFixed(0)}</p><p className="text-xs text-black">mg/kg</p></div>
                    </div>
                </div>
            ) : (
                <button onClick={() => fetchIotData(true)} className="w-full flex justify-center items-center py-2 px-4 border-2 border-dashed border-primary-400 rounded-lg text-primary-600 font-medium hover:bg-primary-50">
                    <Zap className="mr-2 h-5 w-5" /> {t('cropRecommender.connectSensor')}
                </button>
            )}
        </div>
        
        {iotData && (
             <div className="bg-white p-4 rounded-3xl shadow-lg space-y-3 animate-fade-in-up">
                 <h2 className="text-lg font-semibold text-black text-center">{t('cropRecommender.irrigationFertilizerTitle')}</h2>
                 {/* Weather Advisory */}
                 {weatherAdvisory && (
                    <div className="flex items-start text-sm bg-teal-50 p-3 rounded-lg">
                        <CloudRain className="w-5 h-5 text-teal-600 mr-2 mt-0.5 flex-shrink-0"/>
                        <div><strong className="font-semibold text-teal-900">{t('cropRecommender.weatherAdvisoryTitle')}:</strong><span className="text-xs text-teal-800 ml-1">{weatherAdvisory}</span></div>
                    </div>
                 )}
                 {/* Irrigation */}
                 <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                        <p className="font-semibold text-blue-900">{t('cropRecommender.waterPump')}</p>
                        <p className="text-xs text-blue-700">
                           {iotData.moisture < 30 ? t('cropRecommender.moistureLowAdvisory') : t('cropRecommender.moistureOkAdvisory')}
                        </p>
                    </div>
                    <label htmlFor="pump-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="pump-toggle" className="sr-only peer" checked={iotData.pumpStatus === 'ON'} onChange={handlePumpToggle} />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-black">{iotData.pumpStatus}</span>
                    </label>
                 </div>
                 {/* Fertilizer */}
                 <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="font-semibold text-yellow-900 flex items-center mb-1"><Leaf className="w-4 h-4 mr-2"/>{t('cropRecommender.nutrientStatus')}</p>
                    <div className="text-xs text-yellow-800 space-y-1">
                        <p>{t('cropRecommender.nitrogenStatus')}: <NutrientStatus level={iotData.nitrogen} low={100} high={250} />. {iotData.nitrogen < 100 && t('cropRecommender.considerUrea')}</p>
                        <p>{t('cropRecommender.phosphorusStatus')}: <NutrientStatus level={iotData.phosphorus} low={30} high={60} />. {iotData.phosphorus < 30 && t('cropRecommender.considerDAP')}</p>
                        <p>{t('cropRecommender.potassiumStatus')}: <NutrientStatus level={iotData.potassium} low={120} high={250} />. {iotData.potassium < 120 && t('cropRecommender.considerMOP')}</p>
                    </div>
                 </div>
             </div>
        )}

        {/* Input Form Card */}
        <div className="bg-white p-4 rounded-3xl shadow-lg">
             <form onSubmit={handleSubmit} className="space-y-4">
                 <h2 className="text-lg font-semibold text-black text-center mb-2">{t('cropRecommender.formTitle')}</h2>
                <FormSelect label={t('cropRecommender.soilType')} id="soilType" value={soilType} onChange={(e) => setSoilType(e.target.value)} options={SOIL_TYPES} />
                <FormSelect label={t('cropRecommender.waterAvailability')} id="waterAvailability" value={waterAvailability} onChange={(e) => setWaterAvailability(e.target.value)} options={WATER_AVAILABILITY} />
                <FormSelect label={t('cropRecommender.season')} id="season" value={season} onChange={(e) => setSeason(e.target.value)} options={SEASONS} />
                <FormSelect label={t('cropRecommender.farmingType')} id="farmingType" value={farmingType} onChange={(e) => setFarmingType(e.target.value)} options={FARMING_TYPES} />
                <div>
                    <label htmlFor="previousCrop" className="block text-sm font-medium text-black mb-1">{t('cropRecommender.previousCrop')}</label>
                    <input type="text" id="previousCrop" value={previousCrop} onChange={(e) => setPreviousCrop(e.target.value)} className="w-full p-3 text-base bg-white text-black border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-lg shadow-sm" placeholder={t('cropRecommender.previousCropPlaceholder')} />
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300">
                    {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('cropRecommender.generating')}</> : <><Sprout className="mr-2 h-5 w-5"/>{t('cropRecommender.getRecommendations')}</>}
                </button>
            </form>
        </div>

        {/* Results Section */}
        {error && <div className="text-center text-red-600 bg-red-100 p-4 rounded-xl shadow">{error}</div>}

        {recommendations.length > 0 && (
            <div className="space-y-4">
                 <h2 className="text-lg font-semibold text-black text-center">{t('cropRecommender.topRecommendations')}</h2>
                 {recommendations.map((rec, index) => (
                    <div key={index} className="bg-white p-4 rounded-3xl shadow-lg text-black animate-fade-in-up">
                        <div className="flex items-center mb-3">
                            <div className="bg-gray-100 p-3 rounded-full mr-4"><Sprout className="w-6 h-6 text-black"/></div>
                            <h3 className="text-xl font-semibold text-black">{rec.cropName}</h3>
                        </div>
                        <p className="text-black mb-4 text-sm">{rec.reason}</p>
                        
                        {/* Cash Crop Insights Block */}
                        {rec.cashCropInsights && rec.cashCropInsights.isCashCrop && (
                            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3 mb-4 relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp className="w-24 h-24 text-green-800" /></div>
                                <h4 className="font-bold text-green-900 flex items-center mb-3 relative z-10 border-b border-green-200 pb-2">
                                    <TrendingUp className="w-5 h-5 mr-2 text-green-700"/>
                                    {t('cropRecommender.cashCropTitle')}
                                </h4>
                                <div className="space-y-3 text-sm text-green-900 relative z-10">
                                    {/* Market Demand Forecasting */}
                                    <div className="bg-white/60 p-2.5 rounded-lg border border-green-100/50">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-green-800">{t('cropRecommender.marketDemand')}:</span>
                                            <div className="flex items-center">
                                                 <span className={`font-bold px-2 py-0.5 rounded text-xs ${rec.cashCropInsights.marketDemand === 'Rising' ? 'bg-green-200 text-green-800' : rec.cashCropInsights.marketDemand === 'Falling' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                    {rec.cashCropInsights.marketDemand}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs italic text-gray-700 leading-relaxed">{rec.cashCropInsights.demandExplanation}</p>
                                    </div>
                                    
                                    {/* Profitability Insights */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/60 p-2 rounded-lg border border-green-100/50">
                                            <p className="text-xs text-gray-600 font-medium mb-0.5">{t('cropRecommender.expectedIncome')}</p>
                                            <p className="font-bold text-green-700 text-base">{rec.cashCropInsights.expectedIncomeRange}</p>
                                        </div>
                                        <div className="bg-white/60 p-2 rounded-lg border border-green-100/50">
                                            <p className="text-xs text-gray-600 font-medium mb-0.5">{t('cropRecommender.demandStrength')}</p>
                                            <p className={`font-bold ${rec.cashCropInsights.demandStrength === 'High' ? 'text-green-600' : 'text-orange-600'}`}>{rec.cashCropInsights.demandStrength}</p>
                                        </div>
                                    </div>

                                    {/* Risks */}
                                    <div className="flex space-x-2 text-xs">
                                        <div className="flex-1 bg-orange-50 p-2 rounded border border-orange-100">
                                            <span className="text-orange-800 font-semibold block">{t('cropRecommender.weatherRisk')}</span>
                                            <span className="font-bold text-orange-600">{rec.cashCropInsights.weatherRisk}</span>
                                        </div>
                                        <div className="flex-1 bg-red-50 p-2 rounded border border-red-100">
                                            <span className="text-red-800 font-semibold block">{t('cropRecommender.pestRisk')}</span>
                                            <span className="font-bold text-red-600">{rec.cashCropInsights.pestRisk}</span>
                                        </div>
                                    </div>

                                    {/* Buyer Connectivity */}
                                    <div className="mt-2 pt-2 border-t border-green-200">
                                        <p className="font-bold text-green-800 text-xs mb-1.5 flex items-center">
                                            <Users className="w-3.5 h-3.5 mr-1.5"/> {t('cropRecommender.potentialBuyers')}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {rec.cashCropInsights.potentialBuyers.map((buyer, i) => (
                                                <span key={i} className="bg-white border border-green-300 text-green-700 text-xs px-2.5 py-1 rounded-md font-medium shadow-sm">
                                                    {buyer}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div className="flex items-center bg-gray-50 p-2 rounded-lg"><BarChart className="w-5 h-5 text-gray-500 mr-2"/> <div>Expected Yield: <span className="font-medium text-black block">{rec.expectedYield}</span></div></div>
                            <div className="flex items-center bg-gray-50 p-2 rounded-lg"><DollarSign className="w-5 h-5 text-gray-500 mr-2"/> <div>Market Trend: <span className="font-medium text-black block">{rec.marketTrend}</span></div></div>
                        </div>

                        {/* Intercropping Advice */}
                        {rec.intercroppingAdvice && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                                <h4 className="font-bold text-blue-900 flex items-center mb-2">
                                    <Leaf className="w-4 h-4 mr-2"/>
                                    {t('cropRecommender.intercroppingTitle')}
                                </h4>
                                <div className="text-sm text-blue-800">
                                    <p className="mb-1"><strong>{t('cropRecommender.suitableCrops')}:</strong> {rec.intercroppingAdvice.suitableCrops.join(', ')}</p>
                                    <p className="text-xs"><strong>{t('cropRecommender.benefits')}:</strong> {rec.intercroppingAdvice.benefits}</p>
                                </div>
                            </div>
                        )}

                        {(rec.fertilizerAdvice || rec.irrigationAdvice) && (
                            <div className="border-t border-gray-200 pt-3 space-y-2">
                                {rec.irrigationAdvice && (
                                    <div className="flex items-start text-sm bg-blue-50 p-3 rounded-lg">
                                        <Droplets className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"/>
                                        <div><strong className="font-semibold text-black">{t('cropRecommender.irrigationAdvice')}:</strong> {rec.irrigationAdvice}</div>
                                    </div>
                                )}
                                {rec.fertilizerAdvice && (
                                    <div className="flex items-start text-sm bg-yellow-50 p-3 rounded-lg">
                                        <Lightbulb className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"/>
                                        <div><strong className="font-semibold text-black">{t('cropRecommender.fertilizerAdvice')}:</strong> {rec.fertilizerAdvice}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                 ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default CropRecommenderPage;
