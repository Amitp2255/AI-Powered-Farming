import { IoTData } from '../types';

// This is a mock service to simulate fetching data from an IoT device.
// In a real application, this would involve a library to communicate
// with hardware or a dedicated IoT backend service.

// --- In-memory state for simulation ---
let mockPumpStatus: 'ON' | 'OFF' = 'OFF';
let lastSimulatedData: Omit<IoTData, 'pumpStatus'> | null = null;

const generateInitialData = () => {
    if (!lastSimulatedData) {
        lastSimulatedData = {
            ph: 6.2 + (Math.random() * 0.5 - 0.25), // pH between 5.95 and 6.45
            moisture: 28 + (Math.random() * 10 - 5), // Moisture between 23% and 33%
            temperature: 32 + (Math.random() * 4 - 2), // Temperature between 30°C and 34°C
            nitrogen: 120 + Math.random() * 100 - 50, // 70-170
            phosphorus: 40 + Math.random() * 20 - 10, // 30-50
            potassium: 150 + Math.random() * 80 - 40, // 110-190
        };
    }
};

const simulateData = (): IoTData => {
    generateInitialData();
    // Slightly tweak values to simulate change over time
    lastSimulatedData = {
        ph: Math.max(5.0, Math.min(8.0, lastSimulatedData!.ph + (Math.random() * 0.2 - 0.1))),
        moisture: mockPumpStatus === 'ON' 
            ? Math.min(80, lastSimulatedData!.moisture + Math.random() * 2) // increase if pump is on
            : Math.max(20, lastSimulatedData!.moisture - Math.random() * 0.5), // decrease slowly
        temperature: Math.max(15, Math.min(40, lastSimulatedData!.temperature + (Math.random() * 0.4 - 0.2))),
        nitrogen: Math.max(50, Math.min(500, lastSimulatedData!.nitrogen - Math.random() * 2)),
        phosphorus: Math.max(20, Math.min(200, lastSimulatedData!.phosphorus - Math.random() * 1)),
        potassium: Math.max(50, Math.min(300, lastSimulatedData!.potassium - Math.random() * 1.5)),
    };

    return { ...lastSimulatedData, pumpStatus: mockPumpStatus };
};


export const getIoTData = (): Promise<IoTData> => {
  return new Promise((resolve, reject) => {
    // Simulate network delay and connection time
    setTimeout(() => {
      // Simulate a small chance of connection failure
      if (Math.random() < 0.05) { // reduced failure rate
        reject(new Error("Failed to connect to the soil sensor. Please check the device."));
      } else {
        resolve(simulateData());
      }
    }, 800);
  });
};

export const setPumpStatus = (status: 'ON' | 'OFF'): Promise<{ success: true }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            mockPumpStatus = status;
            resolve({ success: true });
        }, 300);
    });
};

// --- Admin Panel Specific Functions ---
const mockAdminDeviceDatabase: { [farmerId: string]: (IoTData & { timestamp: string })[] } = {};

const generateHistoricalData = (farmerId: string) => {
    if (!mockAdminDeviceDatabase[farmerId]) {
        const history: (IoTData & { timestamp: string })[] = [];
        let currentSimData = simulateData(); // start with some data
        
        for (let i = 0; i < 24; i++) { // 24 hours of data
            const timestamp = new Date(Date.now() - i * 60 * 60 * 1000).toISOString();
            history.unshift({ ...currentSimData, timestamp }); // add to beginning
            
            // Go back in time, slightly changing values
            currentSimData = {
                ...currentSimData,
                moisture: Math.max(20, Math.min(80, currentSimData.moisture + (Math.random() - 0.6) * 5)),
                nitrogen: Math.max(50, Math.min(500, currentSimData.nitrogen + (Math.random() - 0.4) * 20)),
                potassium: Math.max(50, Math.min(300, currentSimData.potassium + (Math.random() - 0.4) * 15)),
            };
        }
        mockAdminDeviceDatabase[farmerId] = history;
    }
};

export const getIoTDeviceDataForAdmin = (farmerId: string): Promise<{ lastReading: IoTData & { timestamp: string }, history: (IoTData & { timestamp: string })[] }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            generateHistoricalData(farmerId);
            const history = mockAdminDeviceDatabase[farmerId];
            resolve({ lastReading: history[history.length - 1], history });
        }, 500);
    });
};