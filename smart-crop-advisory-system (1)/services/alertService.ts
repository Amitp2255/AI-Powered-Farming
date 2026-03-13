import { OutbreakAlert } from '../types';

// This mock service simulates fetching alerts that would be created by an admin.
export const getOutbreakAlerts = (): Promise<OutbreakAlert[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real app, you might check if an alert is new or already dismissed by the user.
            // For this demo, we'll return one active alert.
            resolve([
                {
                    id: 'outbreak_123',
                    disease: 'Leaf Blight',
                    area: 'Bhopal Region',
                    advice: 'A Leaf Blight outbreak has been reported in your area. Recommended pesticide: Mancozeb. Spray immediately and monitor crops closely.',
                    date: new Date().toISOString(),
                }
            ]);
        }, 1000);
    });
};
