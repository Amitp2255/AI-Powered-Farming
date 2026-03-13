import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, FileText, BarChart2, Bug, Download, PlusCircle, Edit2, Trash2, Loader2, AlertTriangle, MapPin, LogOut, Droplets, TestTube, Power, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { useLocalization } from '../contexts/LocalizationContext';
import { Scheme, AdminFarmer, OutbreakAlert, AdminIoTDevice } from '../types';
import { getGovernmentSchemes } from '../services/schemesService';
import { getAdminFarmers, getAnalyticsData, getAdminIoTOverview } from '../services/adminService';
import { getOutbreakAlerts } from '../services/alertService';
import { useAuth } from '../contexts/AuthContext';

const PageHeader: React.FC<{ title: string; onLogout: () => void }> = ({ title, onLogout }) => (
  <header className="bg-gray-800 p-4 flex justify-between items-center text-white sticky top-0 z-10 shadow-md">
     <h1 className="text-xl font-bold">{title}</h1>
    <button onClick={onLogout} className="p-2 rounded-full hover:bg-white/20" aria-label="Logout">
      <LogOut className="w-6 h-6" />
    </button>
  </header>
);

const AdminCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; actions?: React.ReactNode; }> = ({ icon, title, children, actions }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg animate-fade-in-up">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
                <span className="text-primary-600 mr-3">{icon}</span>
                <h3 className="font-semibold text-black text-lg">{title}</h3>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        <div className="p-4">{children}</div>
    </div>
);

const CustomBarTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-2 border border-gray-200 rounded-md shadow-lg">
        <p className="label font-semibold">{`${label}`}</p>
        <p className="intro text-primary-600">{`Farms: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-2 border border-gray-200 rounded-md shadow-lg">
        <p className="label font-semibold">{`${label}`}</p>
        {payload.map(pld => (
             <p key={pld.dataKey} style={{ color: pld.stroke }}>{`${pld.name}: ${pld.value.toFixed(1)}`}</p>
        ))}
      </div>
    );
  }
  return null;
};


const AdminDashboard: React.FC = () => {
    const { t } = useLocalization();
    const { logout } = useAuth();
    const [farmers, setFarmers] = useState<AdminFarmer[]>([]);
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [alerts, setAlerts] = useState<OutbreakAlert[]>([]);
    const [iotDevices, setIotDevices] = useState<AdminIoTDevice[]>([]);
    const [analytics, setAnalytics] = useState<{ cropData: any[], pestData: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getAdminFarmers(),
            getGovernmentSchemes(),
            getOutbreakAlerts(),
            getAnalyticsData(),
            getAdminIoTOverview()
        ]).then(([farmerData, schemeData, alertData, analyticsData, iotData]) => {
            setFarmers(farmerData);
            setSchemes(schemeData);
            setAlerts(alertData);
            setAnalytics(analyticsData);
            setIotDevices(iotData);
        }).finally(() => setLoading(false));
    }, []);

    const handleDisabledAction = () => {
        alert(t('admin.actionDisabled'));
    }
    
    const chartData = iotDevices[0]?.history.map(h => ({
        time: new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute:'2-digit' }),
        Moisture: h.moisture,
        Nitrogen: h.nitrogen
    }));

    if (loading) {
        return (
             <div className="max-w-md mx-auto bg-brand-bg min-h-screen">
                <PageHeader title={t('admin.title')} onLogout={logout} />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-black">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto bg-brand-bg min-h-screen pb-4">
            <PageHeader title={t('admin.title')} onLogout={logout} />
            <main className="p-4 space-y-4">
                 {/* IoT Device Monitoring */}
                {iotDevices.length > 0 && (
                    <AdminCard icon={<Activity className="w-6 h-6" />} title={t('admin.iotTitle')}>
                        <div className="space-y-4">
                            {iotDevices.map(device => (
                                <div key={device.id}>
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg mb-3">
                                        <div>
                                            <p className="font-medium text-black">{device.farmerName}</p>
                                            <p className="text-xs text-gray-500">{device.id}</p>
                                        </div>
                                        <button onClick={handleDisabledAction} className="text-xs bg-gray-600 text-white font-medium px-2 py-1 rounded-md">{t('admin.iotOverride')}</button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="bg-gray-100 p-2 rounded-lg"><Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1"/><p className="font-medium">{device.lastReading.moisture.toFixed(0)}%</p></div>
                                        <div className="bg-gray-100 p-2 rounded-lg"><TestTube className="w-5 h-5 mx-auto text-purple-500 mb-1"/><p className="font-medium">{device.lastReading.ph.toFixed(1)} pH</p></div>
                                        <div className="bg-gray-100 p-2 rounded-lg"><Power className={`w-5 h-5 mx-auto mb-1 ${device.lastReading.pumpStatus === 'ON' ? 'text-green-500' : 'text-red-500'}`}/><p className="font-medium">{device.lastReading.pumpStatus}</p></div>
                                        <div className="bg-gray-100 p-2 rounded-lg"><p className="font-bold">N</p><p className="font-medium">{device.lastReading.nitrogen.toFixed(0)}</p></div>
                                        <div className="bg-gray-100 p-2 rounded-lg"><p className="font-bold">P</p><p className="font-medium">{device.lastReading.phosphorus.toFixed(0)}</p></div>
                                        <div className="bg-gray-100 p-2 rounded-lg"><p className="font-bold">K</p><p className="font-medium">{device.lastReading.potassium.toFixed(0)}</p></div>
                                    </div>
                                </div>
                            ))}
                            <div>
                                <h4 className="font-medium text-center text-black my-2 text-sm">{t('admin.iotTrends')}</h4>
                                 <div className="w-full h-48">
                                    <ResponsiveContainer>
                                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis dataKey="time" tick={{fontSize: 9}} interval={4} />
                                            <YAxis yAxisId="left" tick={{fontSize: 10}}/>
                                            <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}}/>
                                            <Tooltip content={<CustomLineTooltip />}/>
                                            <Legend wrapperStyle={{fontSize: "10px"}}/>
                                            <Line yAxisId="left" name="Moisture (%)" type="monotone" dataKey="Moisture" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                            <Line yAxisId="right" name="Nitrogen (mg/kg)" type="monotone" dataKey="Nitrogen" stroke="#ca8a04" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </AdminCard>
                )}

                {/* Farmer Management */}
                <AdminCard 
                    icon={<Users className="w-6 h-6" />} 
                    title={t('admin.farmerManagement')}
                    actions={<button onClick={handleDisabledAction} className="text-sm text-primary-600 font-medium">{t('admin.viewAll')}</button>}
                >
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {farmers.map(farmer => (
                            <div key={farmer.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-black">{farmer.name}</p>
                                    <p className="text-xs text-gray-500">{farmer.location}</p>
                                </div>
                                <button onClick={handleDisabledAction} className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-200">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </AdminCard>

                {/* Scheme Control */}
                 <AdminCard 
                    icon={<FileText className="w-6 h-6" />} 
                    title={t('admin.schemeControl')}
                    actions={<button onClick={handleDisabledAction} className="text-sm bg-primary-600 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1"><PlusCircle className="w-4 h-4"/>{t('admin.addNewScheme')}</button>}
                >
                     <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {schemes.map(scheme => (
                            <div key={scheme.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                <p className="font-medium text-black truncate flex-1 mr-2">{scheme.title}</p>
                                <div className="flex gap-1">
                                     <button onClick={handleDisabledAction} className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-200"><Edit2 className="w-4 h-4" /></button>
                                     <button onClick={handleDisabledAction} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCard>
                
                {/* Pest Outbreak Monitoring */}
                <AdminCard icon={<Bug className="w-6 h-6" />} title={t('admin.outbreakAlerts')}>
                    {alerts.length > 0 ? alerts.map(alert => (
                        <div key={alert.id} className="bg-red-100 border-l-4 border-red-500 text-red-800 p-3 rounded-r-md">
                            <p className="font-bold flex items-center"><AlertTriangle className="w-5 h-5 mr-2" />{alert.disease}</p>
                            <p className="text-sm mt-1 flex items-start"><MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />{alert.area}</p>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500">{t('admin.noActiveAlerts')}</p>
                    )}
                </AdminCard>

                {/* Reports & Analytics */}
                <AdminCard 
                    icon={<BarChart2 className="w-6 h-6" />} 
                    title={t('admin.reportsAndAnalytics')}
                    actions={<button onClick={handleDisabledAction} className="text-sm bg-gray-600 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1"><Download className="w-4 h-4"/>{t('admin.exportCSV')}</button>}
                >
                    {analytics && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium text-center text-black mb-2">{t('admin.cropPopularity')}</h4>
                                <div className="w-full h-48">
                                    <ResponsiveContainer>
                                        <BarChart data={analytics.cropData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                            <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                                            <YAxis tick={{fontSize: 10}} />
                                            <Tooltip content={<CustomBarTooltip />} cursor={{fill: 'rgba(22, 163, 74, 0.1)'}}/>
                                            <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                             <div>
                                <h4 className="font-medium text-center text-black mb-2">{t('admin.pestReports')}</h4>
                                <div className="w-full h-48">
                                    <ResponsiveContainer>
                                        <LineChart data={analytics.pestData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis dataKey="date" tick={{fontSize: 10}} />
                                            <YAxis tick={{fontSize: 10}}/>
                                            <Tooltip content={<CustomLineTooltip />}/>
                                            <Line type="monotone" dataKey="reports" name="Reports" stroke="#dc2626" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminCard>
            </main>
        </div>
    );
};

export default AdminDashboard;