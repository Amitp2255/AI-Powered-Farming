
import React, { useState, useEffect, useCallback } from 'react';
import { MarketData, MarketPrediction } from '../types';
import { ArrowLeft, IndianRupee, TrendingUp, TrendingDown, MapPin, Loader2, Lightbulb, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocalization } from '../contexts/LocalizationContext';
import { getMarketPrediction } from '../services/geminiService';
import { getMarketData } from '../services/marketService';

const commodities = [
    'Wheat', 'Rice', 'Cotton', 'Soyabean', 'Mustard', // Field Crops
    'Tomato', 'Onion', 'Potato', 'Ginger', // Horticulture
    'Rose (Loose)', 'Marigold', 'Gerbera', // Floriculture
    'Rohu (Fish)', 'Catla (Fish)', 'Prawns', // Aquaculture
    'Silk Cocoon', 'Honey' // Other
];
const regions = ['Uttar Pradesh', 'Punjab', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Andhra Pradesh', 'Karnataka', 'West Bengal'];

// --- Components ---

const PageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="bg-brand-header p-4 flex items-center text-white sticky top-0 z-20 shadow-sm">
    <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-white/20" aria-label="Go back">
      <ArrowLeft className="w-6 h-6" />
    </button>
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const date = new Date(payload[0].payload.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return (
      <div className="bg-white/80 backdrop-blur-sm p-2 border border-gray-200 rounded-md shadow-lg">
        <p className="label font-semibold">{`${date}`}</p>
        <p className="intro text-primary-600">{`Price: ₹${payload[0].value}/unit`}</p>
      </div>
    );
  }
  return null;
};

const MarketPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t, language } = useLocalization();
  const [crop, setCrop] = useState(commodities[0]);
  const [region, setRegion] = useState(regions[0]);
  const [timeframe, setTimeframe] = useState('30d');
  
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [prediction, setPrediction] = useState<MarketPrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        setMarketData(null);
        setPrediction(null);
        setPredictionError(null);
        try {
            const data = await getMarketData(crop, region);
            setMarketData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [crop, region]);

  const handlePredict = useCallback(async () => {
    if (!marketData) return;
    setIsPredicting(true);
    setPrediction(null);
    setPredictionError(null);
    try {
      const result = await getMarketPrediction(marketData.crop, marketData.region, marketData.history, language);
      setPrediction(result);
    } catch (err) {
      setPredictionError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsPredicting(false);
    }
  }, [marketData, language]);

  const getFilteredHistory = () => {
    if (!marketData) return [];
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    return marketData.history.slice(-days);
  };
  
  const chartData = getFilteredHistory().map(item => ({
      ...item,
      shortDate: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }));

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-black">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p>{t('market.fetching')}</p>
        </div>
      );
    }

    if (error || !marketData) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-red-600 bg-red-50/50 p-4 text-center rounded-3xl shadow-lg">
                <AlertCircle className="w-10 h-10 mb-4" />
                <p className="font-semibold text-lg">{t('market.error.title')}</p>
                <p className="text-sm">{error || t('market.error.message')}</p>
            </div>
        );
    }
    
    return (
        <>
            {/* Current Price */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg text-black text-center animate-fade-in-up">
                <p className="font-semibold">{marketData.crop} in {marketData.current.market}</p>
                <div className="flex items-center justify-center gap-4 my-2">
                    <IndianRupee className="w-10 h-10 text-primary-600" />
                    <div>
                        <p className="text-5xl font-bold">{marketData.current.price_per_qtl}</p>
                        <p className="text-lg -mt-1">{t('market.pricePerQuintal')}</p>
                    </div>
                </div>
                 <div className={`flex items-center justify-center gap-1 text-lg font-semibold ${marketData.current.change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketData.current.change_pct >= 0 ? <TrendingUp className="w-5 h-5"/> : <TrendingDown className="w-5 h-5"/>}
                    <span>{Math.abs(marketData.current.change_pct)}%</span>
                </div>
            </div>
            
            {/* Chart */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-lg font-semibold text-black">{t('market.priceTrend')}</h2>
                    <div className="flex items-center bg-gray-200/70 rounded-full p-1 text-sm">
                        {['7d', '30d', '90d'].map(tf => (
                             <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1 rounded-full transition-all ${timeframe === tf ? 'bg-white shadow-sm font-semibold text-primary-600' : 'text-gray-600'}`}>{tf.replace('d', 'D')}</button>
                        ))}
                    </div>
                </div>
                <div className="w-full h-64">
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="shortDate" tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Price Prediction Section */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-lg font-semibold text-black text-center mb-3">{t('market.predictTitle')}</h2>
              
              {!prediction && !isPredicting && (
                <button 
                  onClick={handlePredict}
                  disabled={isPredicting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                >
                  <TrendingUp className="mr-2 h-5 w-5" /> {t('market.predictButton')}
                </button>
              )}

              {isPredicting && (
                <div className="flex justify-center items-center py-3 text-black">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>{t('market.predicting')}</span>
                </div>
              )}

              {predictionError && (
                 <div className="text-center text-red-600 bg-red-100 p-3 rounded-xl shadow-sm">{predictionError}</div>
              )}

              {prediction && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-100 p-3 rounded-xl text-center">
                      <p className="text-sm font-medium text-black">{t('market.predictionFor7Days')}</p>
                      <p className="text-lg font-bold text-primary-700">{prediction.prediction7day}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-xl text-center">
                      <p className="text-sm font-medium text-black">{t('market.predictionFor30Days')}</p>
                      <p className="text-lg font-bold text-primary-700">{prediction.prediction30day}</p>
                    </div>
                  </div>
                  <div className="text-sm text-black">
                    <h4 className="font-semibold flex items-center mb-1">
                      <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                      {t('market.analystReasoning')}
                    </h4>
                    <p className="pl-6 border-l-2 border-gray-200 text-xs italic">{prediction.reason7day}</p>
                    <p className="pl-6 border-l-2 border-gray-200 text-xs italic mt-1">{prediction.reason30day}</p>
                  </div>
                  <button 
                    onClick={handlePredict}
                    className="w-full text-center text-sm text-primary-600 font-medium mt-2 hover:underline disabled:text-gray-400"
                    disabled={isPredicting}
                  >
                    {isPredicting ? t('market.predicting') : t('market.regenerate')}
                  </button>
                </div>
              )}
            </div>
        </>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
      <PageHeader title={t('market.title')} onBack={onBack} />
      <main className="p-4 space-y-4">
        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="crop-select" className="block text-sm font-medium text-black">{t('market.crop')}</label>
                    <select id="crop-select" value={crop} onChange={e => setCrop(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-black border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                        {commodities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="region-select" className="block text-sm font-medium text-black">{t('market.region')}</label>
                    <select id="region-select" value={region} onChange={e => setRegion(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-black border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {renderContent()}
        
      </main>
    </div>
  );
};

export default MarketPage;
