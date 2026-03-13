
import React, { useState, useCallback, useEffect } from 'react';
import { analyzePest } from '../services/geminiService';
import { PestAnalysis, WeatherData } from '../types';
import { ArrowLeft, UploadCloud, Bug, Shield, Microscope, AlertTriangle, Loader2, CheckCircle, Skull, Leaf, Clock, Volume2, AlertOctagon, Images, Info, CloudRain, Sun, X, FileWarning } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';
import { getWeatherData } from '../services/weatherService';
import { useAuth } from '../contexts/AuthContext';
import { FarmerUser } from '../types';

// Mapping internal language codes to BCP 47 tags for Speech API
const localeMap: Record<string, string> = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN',
    'pa': 'pa-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'or': 'or-IN',
    'bho': 'hi-IN',
};

// --- Shared Components ---
const PageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="bg-brand-header p-4 flex items-center text-white sticky top-0 z-10 shadow-sm">
    <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-white/20" aria-label="Go back">
      <ArrowLeft className="w-6 h-6" />
    </button>
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; content: string; }> = ({ icon, title, content }) => (
  <div>
    <h4 className="font-semibold text-md text-black flex items-center mb-1">
      <span className="text-primary-600 mr-2">{icon}</span>
      {title}
    </h4>
    <p className="text-black text-sm pl-8 whitespace-pre-line">{content}</p>
  </div>
);

// Helper to convert file to base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

// Helper to determine season roughly based on Month (India context)
const getCurrentSeason = (): string => {
    const month = new Date().getMonth(); // 0-11
    if (month >= 5 && month <= 9) return "Kharif (Monsoon)"; // June - Oct
    if (month >= 10 || month <= 2) return "Rabi (Winter)"; // Nov - March
    return "Zaid (Summer)"; // April - May
};

const PestAdvisoryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t, language } = useLocalization();
    const { user } = useAuth();
    
    // State for multiple images
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    
    const [analysis, setAnalysis] = useState<PestAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Context State
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [season] = useState<string>(getCurrentSeason());

    // Fetch context on mount (Safe Mode)
    useEffect(() => {
        const fetchContext = async () => {
            try {
                // Safe mode fetch, no coordinates needed
                const data = await getWeatherData();
                setWeather(data);
            } catch (e) {
                console.warn("Could not fetch weather context", e);
            }
        };
        fetchContext();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files) as File[];
            
            // Client-Side Duplicate Check
            // We check against existing images and within the new batch
            const uniqueFiles: File[] = [];
            const existingKeys = new Set(images.map(img => `${img.name}-${img.size}`));
            
            for (const file of filesArray) {
                const key = `${file.name}-${file.size}`;
                if (!existingKeys.has(key)) {
                    uniqueFiles.push(file);
                    existingKeys.add(key); // Add to set to prevent duplicates within the new batch too
                }
            }

            if (uniqueFiles.length < filesArray.length) {
                // Notify user if some files were skipped
                alert("Duplicate images detected and removed.");
            }

            // Limit total images to 5
            const newImages = [...images, ...uniqueFiles].slice(0, 5);
            setImages(newImages);

            // Generate previews for ONLY the new unique files effectively
            // Note: We regenerate previews for the whole set to keep indices aligned
            const newPreviews = newImages.map(file => URL.createObjectURL(file));
            setPreviews(prevs => {
                // revoke old urls to avoid memory leaks
                prevs.forEach(url => URL.revokeObjectURL(url));
                return newPreviews;
            });
            
            // Reset state on new upload
            setAnalysis(null);
            setError(null);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleAnalyze = useCallback(async () => {
        // Strict Client-Side Count Check
        if (images.length < 3) {
            setError("Mandatory: Please upload at least 3 images (Leaf, Stem, Whole Plant).");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            // Convert all images to base64
            const base64Promises = images.map(img => toBase64(img));
            const base64Images = await Promise.all(base64Promises);
            const mimeTypes = images.map(img => img.type);

            // Gather context
            const cropContext = user?.role === 'farmer' ? (user as FarmerUser).profile.lastSeasonCrops : '';
            const context = {
                weather: weather || undefined,
                season: season,
                cropContext: cropContext
            };

            const result = await analyzePest(base64Images, mimeTypes, context, language);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [images, weather, season, user, language]);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Use precise locale mapping
            const targetLocale = localeMap[language] || 'en-IN';
            
            // Try to find a voice that matches
            const voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.lang === targetLocale) || voices.find(v => v.lang.startsWith(language));
            
            utterance.lang = targetLocale;
            if (voice) {
                utterance.voice = voice;
            }
            
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-brand-bg min-h-screen pb-10">
            <PageHeader title={t('pestAdvisory.title')} onBack={onBack} />
            <main className="p-4 space-y-4">
                
                {/* Context Info Banner */}
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex justify-between items-center text-xs text-blue-800">
                    <div className="flex items-center"><Sun className="w-4 h-4 mr-1"/> {season}</div>
                    {weather && <div className="flex items-center"><CloudRain className="w-4 h-4 mr-1"/> {weather.current.temp}°C, {weather.current.humidity}% Hum.</div>}
                </div>

                {/* Uploader Card */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg text-center">
                    <h2 className="text-lg font-semibold text-black mb-2">{t('pestAdvisory.uploadTitle')}</h2>
                    
                    {previews.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {previews.map((src, index) => (
                                <div key={index} className="relative aspect-square">
                                    <img src={src} alt={`Upload ${index}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                    <button 
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {previews.length < 5 && (
                                <label htmlFor="leaf-upload-more" className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <UploadCloud className="w-6 h-6 text-gray-400" />
                                    <input id="leaf-upload-more" type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                    ) : (
                        <label htmlFor="leaf-upload" className="cursor-pointer block">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition-colors">
                                <div className="flex flex-col items-center text-gray-500">
                                    <Images className="h-10 w-10 mb-2 text-primary-500" />
                                    <p className="font-semibold text-black">Select Photos</p>
                                    <div className="mt-2 text-left bg-gray-50 p-2 rounded text-xs text-gray-600 space-y-1">
                                         <p className="font-bold text-red-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> MANDATORY:</p>
                                         <p>1. Leaf Image</p>
                                         <p>2. Stem / Body Image</p>
                                         <p>3. Whole Plant Image</p>
                                         <p className="text-gray-400 italic">4. Root Image (Optional)</p>
                                    </div>
                                    <p className="text-xs mt-2 text-gray-400">JPG, PNG, WEBP supported</p>
                                </div>
                            </div>
                            <input id="leaf-upload" type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                        </label>
                    )}

                    {images.length > 0 && (
                        <div className="mt-4">
                             <p className="text-xs text-gray-500 mb-2">
                                 {images.length}/3 required images selected
                             </p>
                            <button 
                                onClick={handleAnalyze} 
                                disabled={isLoading || images.length < 3} 
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('pestAdvisory.analyzing')}</> : t('pestAdvisory.analyze')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && <div className="text-center text-red-600 bg-red-100 p-4 rounded-xl shadow border border-red-200">{error}</div>}

                {/* Analysis Results */}
                {analysis && (
                    <div className="space-y-4 pb-10 animate-fade-in-up">
                         {/* Validation Failure Handling */}
                         {(!analysis.validationSuccess || analysis.imageQualityCheck === 'Fail') ? (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-4 rounded-r-lg shadow-lg">
                                <div className="flex">
                                    <div className="py-1"><FileWarning className="h-6 w-6 text-red-500 mr-4"/></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-lg mb-1">{t('pestAdvisory.invalidImage')}</p>
                                        <p className="text-sm font-medium">{analysis.validationError || analysis.description || "Images did not meet quality standards."}</p>
                                        
                                        <div className="mt-3 bg-white p-3 rounded-lg border border-red-100 text-xs text-gray-600">
                                            <p className="font-semibold mb-1">Checklist for next upload:</p>
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li>Upload DIFFERENT parts (Leaf, Stem, Whole Plant).</li>
                                                <li>Do NOT use the same image twice.</li>
                                                <li>Ensure photos are clear and bright.</li>
                                            </ul>
                                        </div>

                                        <button onClick={() => { setImages([]); setPreviews([]); setAnalysis(null); }} className="mt-3 w-full py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Success Result */}
                                <h2 className="text-lg font-semibold text-black text-center">{t('pestAdvisory.analysisResult')}</h2>
                                <div className={`p-4 rounded-3xl shadow-lg relative ${analysis.disease === 'Healthy' ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'} border`}>
                                    <button 
                                        onClick={() => speak(`${analysis.disease}. Severity ${analysis.severity}. ${analysis.description}. Treatment: ${analysis.recommendedAction}`)}
                                        className="absolute top-4 right-4 p-2 bg-white/60 rounded-full hover:bg-white transition-colors"
                                    >
                                        <Volume2 className="w-5 h-5 text-gray-800"/>
                                    </button>
                                    <div className="flex items-start">
                                        <div className={`p-3 rounded-full mr-4 shrink-0 ${analysis.disease === 'Healthy' ? 'bg-green-200' : 'bg-red-200'}`}>
                                            {analysis.disease === 'Healthy' ? <CheckCircle className="w-8 h-8 text-green-700"/> : <Bug className="w-8 h-8 text-red-700"/>}
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-bold ${analysis.disease === 'Healthy' ? 'text-green-900' : 'text-red-900'}`}>
                                                {analysis.disease === 'Healthy' ? t('pestAdvisory.healthy') : analysis.disease}
                                            </h3>
                                            <p className={`text-sm font-medium mt-1 ${analysis.disease === 'Healthy' ? 'text-green-700' : 'text-red-700'}`}>{t('pestAdvisory.confidence')}: {(analysis.confidence * 100).toFixed(0)}%</p>
                                            
                                            {analysis.disease !== 'Healthy' && analysis.severity && (
                                                <div className="mt-2 flex items-center">
                                                     <span className="text-xs font-semibold mr-2 text-gray-600">Severity:</span>
                                                     <div className="flex gap-1">
                                                        <div className={`h-2 w-6 rounded-full ${['Low','Medium','High'].includes(analysis.severity) ? 'bg-red-400' : 'bg-gray-300'}`}></div>
                                                        <div className={`h-2 w-6 rounded-full ${['Medium','High'].includes(analysis.severity) ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                                        <div className={`h-2 w-6 rounded-full ${analysis.severity === 'High' ? 'bg-red-600' : 'bg-gray-300'}`}></div>
                                                     </div>
                                                     <span className="text-xs ml-2 font-bold text-red-800">{analysis.severity}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-lg space-y-5">
                                    <InfoCard icon={<Microscope className="w-5 h-5"/>} title={t('pestAdvisory.description')} content={analysis.description} />
                                    
                                    {/* Detailed Treatment Plan */}
                                    {analysis.treatment && analysis.disease !== 'Healthy' && (
                                        <div className="border-t border-b border-gray-100 py-4 my-2">
                                            <h4 className="font-bold text-lg text-black flex items-center mb-3">
                                                <span className="text-primary-600 mr-2"><Shield className="w-6 h-6"/></span>
                                                {t('pestAdvisory.treatment')}
                                            </h4>
                                            <div className="space-y-3">
                                                {/* Organic */}
                                                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                                    <p className="text-xs font-bold text-green-800 uppercase flex items-center mb-1"><Leaf className="w-3.5 h-3.5 mr-1.5"/> {t('pestAdvisory.organic')}</p>
                                                    <p className="text-sm text-green-900 font-medium">{analysis.treatment.organic}</p>
                                                </div>
                                                
                                                {/* Chemical */}
                                                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                                    <p className="text-xs font-bold text-orange-800 uppercase flex items-center mb-1"><Skull className="w-3.5 h-3.5 mr-1.5"/> {t('pestAdvisory.chemical')}</p>
                                                    <p className="text-sm text-orange-900 font-medium">{analysis.treatment.chemical}</p>
                                                </div>

                                                {/* Dosage & Timing Grid */}
                                                <div className="grid grid-cols-2 gap-3 mt-2">
                                                     <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">{t('pestAdvisory.dosage')}</p>
                                                        <p className="text-sm text-gray-800">{analysis.treatment.dosage}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        <p className="text-xs text-gray-500 uppercase font-bold flex items-center mb-1"><Clock className="w-3 h-3 mr-1"/> {t('pestAdvisory.timing')}</p>
                                                        <p className="text-sm text-gray-800">{analysis.treatment.timing}</p>
                                                    </div>
                                                </div>
                                                
                                                 {/* Method */}
                                                {analysis.treatment.method && (
                                                     <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Application Method</p>
                                                        <p className="text-sm text-gray-800">{analysis.treatment.method}</p>
                                                    </div>
                                                )}

                                                {/* Safety */}
                                                {analysis.treatment.safetyPrecautions && (
                                                    <div className="flex items-start bg-red-50 p-3 rounded-xl border border-red-100 text-xs">
                                                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2 shrink-0 mt-0.5"/>
                                                        <span className="text-red-800"><strong>Safety:</strong> {analysis.treatment.safetyPrecautions}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <InfoCard icon={<Info className="w-5 h-5"/>} title={t('pestAdvisory.recommendedAction')} content={analysis.recommendedAction} />
                                    <InfoCard icon={<Shield className="w-5 h-5"/>} title={t('pestAdvisory.preventiveMeasures')} content={analysis.preventiveMeasures} />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PestAdvisoryPage;
