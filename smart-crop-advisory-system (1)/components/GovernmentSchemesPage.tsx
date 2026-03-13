

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, CheckCircle, Award, FileText, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Scheme } from '../types';
import { getGovernmentSchemes } from '../services/schemesService';

const PageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="bg-brand-header p-4 flex items-center text-white sticky top-0 z-10 shadow-sm">
    <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-white/20" aria-label="Go back">
      <ArrowLeft className="w-6 h-6" />
    </button>
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

const SchemeCard: React.FC<{ scheme: Scheme; isOpen: boolean; onToggle: () => void; }> = ({ scheme, isOpen, onToggle }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
            <button onClick={onToggle} className="w-full text-left p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-black text-lg">{scheme.title}</h3>
                    {!isOpen && <p className="text-sm text-black mt-1">{scheme.summary.substring(0, 80)}...</p>}
                </div>
                <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 border-t border-gray-200 space-y-3">
                     <p className="text-sm text-black">{scheme.summary}</p>
                     <div className="flex items-start text-sm">
                        <CheckCircle className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div><strong className="font-medium text-black">{t('schemes.eligibility')}:</strong> {scheme.eligibility}</div>
                     </div>
                     <div className="flex items-start text-sm">
                        <Award className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div><strong className="font-medium text-black">{t('schemes.benefits')}:</strong> {scheme.benefits}</div>
                     </div>
                     <div className="flex items-start text-sm">
                        <FileText className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                        <a href={scheme.applicationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                            {t('schemes.applyHere')} <LinkIcon className="w-4 h-4 ml-1" />
                        </a>
                     </div>
                </div>
            </div>
        </div>
    );
}

const GovernmentSchemesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const [openSchemeId, setOpenSchemeId] = useState<number | null>(null);
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getGovernmentSchemes()
            .then(data => {
                setSchemes(data);
                if (data.length > 0) {
                    setOpenSchemeId(data[0].id); // Open the first scheme by default
                }
            })
            .catch(() => setError(t('schemes.error')))
            .finally(() => setIsLoading(false));
    }, [t]);

    const handleToggle = (id: number) => {
        setOpenSchemeId(openSchemeId === id ? null : id);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-black">
                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                    <p>{t('schemes.loading')}</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50/50 p-4 text-center rounded-3xl shadow-lg">
                    <AlertCircle className="w-10 h-10 mb-4" />
                    <p className="font-semibold">{error}</p>
                </div>
            );
        }
        return (
            <>
                <h2 className="text-lg font-semibold text-black text-center">{t('schemes.welfareSchemes')}</h2>
                {schemes.map(scheme => (
                    <SchemeCard 
                        key={scheme.id} 
                        scheme={scheme} 
                        isOpen={openSchemeId === scheme.id} 
                        onToggle={() => handleToggle(scheme.id)}
                    />
                ))}
            </>
        )
    }

    return (
        <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
            <PageHeader title={t('schemes.title')} onBack={onBack} />
            <main className="p-4 space-y-4">
                 {renderContent()}
            </main>
        </div>
    );
};

export default GovernmentSchemesPage;