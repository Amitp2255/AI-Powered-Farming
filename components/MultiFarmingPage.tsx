
import React, { useState, useEffect } from 'react';
import { MultiFarmingType, MultiFarmingInsight } from '../types';
import { getMultiFarmingInsights, generateFarmingVideo } from '../services/geminiService';
import { useLocalization } from '../contexts/LocalizationContext';
import { ArrowLeft, Loader2, Layers, Droplets, Wallet, TrendingUp, AlertTriangle, Video, Leaf, ShieldCheck, Sprout } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MultiFarmingPageProps {
    farmingType: MultiFarmingType;
    onBack: () => void;
}

const PageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="bg-brand-header p-4 flex items-center text-white sticky top-0 z-10 shadow-sm">
    <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-white/20" aria-label="Go back">
      <ArrowLeft className="w-6 h-6" />
    </button>
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

const MultiFarmingPage: React.FC<MultiFarmingPageProps> = ({ farmingType, onBack }) => {
    const { t, language } = useLocalization();
    const [insights, setInsights] = useState<MultiFarmingInsight | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Video State
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getMultiFarmingInsights(farmingType, language);
                setInsights(data);
            } catch (err) {
                setError("Failed to load insights. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [farmingType, language]);

    const handleGenerateVideo = async () => {
        if (!insights?.videoPrompt) return;

        // API Key check
        const win = window as any;
        if (typeof win.aistudio !== 'undefined') {
            try {
                const hasKey = await win.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await win.aistudio.openSelectKey();
                }
            } catch (e) {
                console.warn("API Key check failed", e);
            }
        }

        setIsVideoLoading(true);
        setVideoError(null);
        try {
            const url = await generateFarmingVideo(insights.videoPrompt);
            setVideoUrl(url);
        } catch (e: any) {
             const errorMessage = e.message || JSON.stringify(e);
             if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("404")) {
                 if (typeof win.aistudio !== 'undefined') {
                    try {
                        await win.aistudio.openSelectKey();
                        setVideoError("Please select a paid API key.");
                    } catch (keyErr) {
                         setVideoError("Access denied. Check API key.");
                    }
                 } else {
                     setVideoError("Veo model not accessible.");
                 }
            } else {
                setVideoError("Failed to generate video.");
            }
        } finally {
            setIsVideoLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
                <PageHeader title={farmingType} onBack={onBack} />
                <div className="flex flex-col items-center justify-center h-[80vh] text-gray-600">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
                    <p className="text-lg font-medium">Analyzing optimized combinations...</p>
                    <p className="text-sm">Consulting AI Knowledge Base</p>
                </div>
            </div>
        );
    }

    if (error || !insights) {
        return (
             <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
                <PageHeader title={farmingType} onBack={onBack} />
                <div className="p-8 text-center text-red-600 bg-red-50 mt-10 mx-4 rounded-xl shadow">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                    <p>{error || "No data available."}</p>
                </div>
            </div>
        );
    }

    const riskData = [
        { name: 'Single Crop', risk: insights.riskAnalysis.singleCropRisk, fill: '#ef4444' }, // Red
        { name: 'Multi Crop', risk: insights.riskAnalysis.multiCropRisk, fill: '#22c55e' },   // Green
    ];

    return (
        <div className="max-w-md mx-auto bg-brand-bg min-h-screen pb-6">
            <PageHeader title={farmingType} onBack={onBack} />
            <main className="p-4 space-y-5 animate-fade-in-up">
                
                {/* Introduction */}
                <div className="bg-primary-600 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                         <h2 className="text-lg font-bold flex items-center mb-1">
                            <Layers className="w-5 h-5 mr-2" /> Multi-Farming Solutions
                         </h2>
                         <p className="text-sm text-primary-50 opacity-90">
                             Combine crops to reduce risk and double your income stability.
                         </p>
                    </div>
                    <Layers className="absolute -right-4 -bottom-4 w-32 h-32 text-primary-700 opacity-20" />
                </div>

                {/* Section 1: Smart Combinations */}
                <div>
                    <h3 className="text-black font-bold text-lg mb-3 flex items-center"><Sprout className="w-5 h-5 mr-2 text-green-600"/> Smart Combinations</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {insights.combinations.map((combo, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {combo.species.map((s, i) => (
                                        <span key={i} className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{combo.description}</p>
                                <div className="inline-flex items-center text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-1 rounded">
                                    <Leaf className="w-3 h-3 mr-1" /> Benefit: {combo.symbiosis}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2: Resource Plan */}
                <div>
                    <h3 className="text-black font-bold text-lg mb-3 flex items-center"><Droplets className="w-5 h-5 mr-2 text-blue-500"/> Resource Efficiency</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                            <p className="text-blue-800 text-xs font-bold uppercase mb-1">Water Savings</p>
                            <p className="text-2xl font-bold text-blue-600 mb-1">{insights.resourcePlan.waterSavingPercentage}%</p>
                            <p className="text-xs text-blue-700 leading-tight">{insights.resourcePlan.waterStrategy}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-2xl border border-yellow-100">
                            <p className="text-yellow-800 text-xs font-bold uppercase mb-1">Input Cost Savings</p>
                            <p className="text-2xl font-bold text-yellow-600 mb-1">{insights.resourcePlan.costSavingPercentage}%</p>
                            <p className="text-xs text-yellow-700 leading-tight">{insights.resourcePlan.inputStrategy}</p>
                        </div>
                    </div>
                </div>

                {/* Section 3: Risk Dashboard */}
                <div className="bg-white p-4 rounded-3xl shadow-lg">
                    <h3 className="text-black font-bold text-lg mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-indigo-600"/> Risk Reduction Dashboard</h3>
                    
                    <div className="flex justify-between items-end mb-4 px-2">
                        <div className="text-center">
                             <p className="text-xs text-gray-500">Single Crop Risk</p>
                             <p className="text-xl font-bold text-red-500">{insights.riskAnalysis.singleCropRisk}/100</p>
                        </div>
                        <div className="text-center">
                             <p className="text-xs text-gray-500">Multi Crop Risk</p>
                             <p className="text-xl font-bold text-green-500">{insights.riskAnalysis.multiCropRisk}/100</p>
                        </div>
                    </div>

                    <div className="w-full h-40">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={riskData} layout="vertical" margin={{top: 0, right: 30, left: 20, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fontWeight: 'bold'}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="risk" barSize={20} radius={[0, 4, 4, 0]}>
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 bg-green-50 rounded-xl p-3 border border-green-100">
                        <div className="flex items-center mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-bold text-green-800">Income Stability: +{insights.riskAnalysis.incomeStabilityChange}%</span>
                        </div>
                        <ul className="text-xs text-green-800 space-y-1 pl-1">
                            {insights.riskAnalysis.factors.map((factor, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="mr-2">•</span> {factor}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Section 4: Visual Guide (Veo Video) */}
                <div className="bg-gray-900 text-white p-4 rounded-3xl shadow-lg">
                    <h3 className="font-bold text-lg mb-2 flex items-center">
                        <Video className="w-5 h-5 mr-2 text-purple-400"/> AI Visual Guide
                    </h3>
                    <p className="text-xs text-gray-300 mb-4">See how this multi-farming setup looks in real life with a generated video simulation.</p>
                    
                    {videoUrl ? (
                         <video 
                            controls 
                            autoPlay 
                            className="w-full rounded-xl shadow-lg aspect-video border border-gray-700" 
                            src={videoUrl}
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : isVideoLoading ? (
                        <div className="w-full aspect-video bg-gray-800 rounded-xl flex flex-col items-center justify-center border border-gray-700">
                             <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2"/>
                             <p className="text-xs text-gray-400">Rendering Simulation...</p>
                        </div>
                    ) : (
                        <button 
                            onClick={handleGenerateVideo}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold flex items-center justify-center transition-colors"
                        >
                            <Video className="w-5 h-5 mr-2" /> Generate Simulation Video
                        </button>
                    )}
                    {videoError && <p className="text-red-400 text-xs mt-3 text-center bg-red-900/20 p-2 rounded">{videoError}</p>}
                </div>

            </main>
        </div>
    );
};

export default MultiFarmingPage;
