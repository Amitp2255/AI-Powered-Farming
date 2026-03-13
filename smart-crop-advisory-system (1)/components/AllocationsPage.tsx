

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle, Clock, Truck, Loader2, AlertCircle } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Allocation } from '../types';
import { getAllocations } from '../services/allocationsService';

const PageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="bg-brand-header p-4 flex items-center text-white sticky top-0 z-10 shadow-sm">
    <button onClick={onBack} className="mr-4 p-1 rounded-full hover:bg-white/20" aria-label="Go back">
      <ArrowLeft className="w-6 h-6" />
    </button>
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

const StatusBadge: React.FC<{ status: Allocation['status'] }> = ({ status }) => {
    const { t } = useLocalization();
    const statusMap = {
        'Allocated': {
            text: t('allocations.allocated'),
            icon: <CheckCircle className="w-4 h-4 mr-1.5" />,
            className: 'bg-blue-100 text-blue-800',
        },
        'Pending': {
            text: t('allocations.pending'),
            icon: <Clock className="w-4 h-4 mr-1.5" />,
            className: 'bg-yellow-100 text-yellow-800',
        },
        'Delivered': {
            text: t('allocations.delivered'),
            icon: <Truck className="w-4 h-4 mr-1.5" />,
            className: 'bg-green-100 text-green-800',
        },
    };
    const currentStatus = statusMap[status];

    return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.className}`}>
            {currentStatus.icon}
            {currentStatus.text}
        </div>
    );
};


const AllocationCard: React.FC<{ allocation: Allocation }> = ({ allocation }) => {
    const formattedDate = new Date(allocation.date).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in-up">
            <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <Package className="w-6 h-6 text-gray-600"/>
                </div>
                <div>
                    <h3 className="font-semibold text-black">{allocation.item}</h3>
                    <p className="text-sm text-black">{allocation.quantity}</p>
                    <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
                </div>
            </div>
            <StatusBadge status={allocation.status} />
        </div>
    );
};

const AllocationsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAllocations()
            .then(data => setAllocations(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())))
            .catch(() => setError(t('allocations.error')))
            .finally(() => setIsLoading(false));
    }, [t]);
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-150px)]">
                    <Loader2 className="w-10 h-10 text-gray-500 animate-spin mb-4" />
                    <p className="text-black">{t('allocations.fetching')}</p>
                </div>
            );
        }
        if (error) {
             return (
                <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-150px)] bg-red-50/50 p-4 m-4 rounded-3xl shadow-lg">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="font-semibold text-red-700">{error}</p>
                </div>
            );
        }
        if (allocations.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-150px)]">
                    <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <p className="text-black">{t('allocations.description')}</p>
                </div>
            )
        }
        return (
            <div className="space-y-3">
                {allocations.map(alloc => <AllocationCard key={alloc.id} allocation={alloc} />)}
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
            <PageHeader title={t('allocations.title')} onBack={onBack} />
            <main className="p-4">
               {renderContent()}
            </main>
        </div>
    );
};

export default AllocationsPage;