import { AdminFarmer, FarmerProfile, AdminIoTDevice } from '../types';
import { Language } from '../translations';
import { getIoTDeviceDataForAdmin } from './iotService';

// This is a mock service to simulate fetching data for an admin dashboard.
// In a real application, this would fetch data from a secure backend API.

interface StoredFarmer {
  username: string;
  password: string; 
  profile: FarmerProfile;
}

const mockCropAnalytics = [
    { name: 'Soybean', count: 45 },
    { name: 'Wheat', count: 38 },
    { name: 'Cotton', count: 25 },
    { name: 'Rice', count: 18 },
    { name: 'Corn', count: 12 },
];

const mockPestAnalytics = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        reports: Math.floor(Math.random() * 15) + (i > 20 ? Math.floor(Math.random() * 10) : 2), // Simulate a recent increase
    };
});

export const getAdminFarmers = (): Promise<AdminFarmer[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const storedData = localStorage.getItem('farmers');
            if (storedData) {
                const farmers: StoredFarmer[] = JSON.parse(storedData);
                const adminFarmers: AdminFarmer[] = farmers.map(f => ({
                    id: f.username,
                    name: f.profile.fullName,
                    location: f.profile.location,
                    phone: f.profile.phone,
                    primaryCrops: f.profile.lastSeasonCrops.split(',').map(c => c.trim()).filter(Boolean),
                }));
                resolve(adminFarmers);
            } else {
                resolve([]);
            }
        }, 500);
    });
};

export const getAnalyticsData = (): Promise<{ cropData: any[], pestData: any[] }> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                cropData: mockCropAnalytics,
                pestData: mockPestAnalytics
            });
        }, 800);
    });
};

export const getAdminIoTOverview = async (): Promise<AdminIoTDevice[]> => {
    const farmers = await getAdminFarmers();
    if (farmers.length === 0) return [];
    
    // In a real app, you'd fetch data for all farmers. For this demo,
    // let's just create data for the first farmer to keep it simple and performant.
    const demoFarmer = farmers[0];

    const iotData = await getIoTDeviceDataForAdmin(demoFarmer.id);

    const deviceOverview: AdminIoTDevice[] = [{
        id: `iot_device_${demoFarmer.id}`,
        farmerName: demoFarmer.name,
        farmerId: demoFarmer.id,
        ...iotData,
    }];
    
    return deviceOverview;
};