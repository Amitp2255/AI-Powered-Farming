import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, FarmerUser, FarmerProfile } from '../types';

interface StoredFarmer {
  username: string;
  password: string; // Plaintext for this demo app
  profile: FarmerProfile;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: 'farmer' | 'admin') => Promise<User>;
  signup: (username: string, password: string, profile: FarmerProfile) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<FarmerProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FARMERS_STORAGE_KEY = 'farmers';

// This function seeds a demo farmer if one doesn't exist.
const initializeDemoFarmer = () => {
    try {
        const storedData = localStorage.getItem(FARMERS_STORAGE_KEY);
        const farmers: StoredFarmer[] = storedData ? JSON.parse(storedData) : [];
        const demoFarmerExists = farmers.some(f => f.username === 'farmer1');

        if (!demoFarmerExists) {
            const demoFarmer: StoredFarmer = {
                username: 'farmer1',
                password: 'farmer123',
                profile: {
                    fullName: 'Demo Farmer',
                    phone: '9876543210',
                    location: 'Ramgarh, Rajasthan',
                    landSize: 10,
                    soilType: 'Loamy',
                    irrigationSource: 'Canal',
                    lastSeasonCrops: 'Wheat, Mustard',
                    preferredLanguage: 'en',
                }
            };
            farmers.push(demoFarmer);
            localStorage.setItem(FARMERS_STORAGE_KEY, JSON.stringify(farmers));
        }
    } catch (error) {
        console.error("Failed to initialize demo farmer:", error);
    }
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for a saved user session on initial load
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    initializeDemoFarmer();
  }, []);

  const login = async (username: string, password: string, role: 'farmer' | 'admin'): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate API call
        if (role === 'admin') {
          if (username === 'admin1' && password === 'admin123') {
            const adminUser: User = { role: 'admin', username: 'admin1' };
            localStorage.setItem('user', JSON.stringify(adminUser));
            setUser(adminUser);
            resolve(adminUser);
          } else {
            reject(new Error('Invalid Username or Password.'));
          }
        } else { // Farmer login
            const storedData = localStorage.getItem(FARMERS_STORAGE_KEY);
            const farmers: StoredFarmer[] = storedData ? JSON.parse(storedData) : [];
            const foundFarmer = farmers.find(f => f.username === username && f.password === password);

            if (foundFarmer) {
                const farmerUser: FarmerUser = {
                    role: 'farmer',
                    username: foundFarmer.username,
                    profile: foundFarmer.profile
                };
                localStorage.setItem('user', JSON.stringify(farmerUser));
                setUser(farmerUser);
                resolve(farmerUser);
            } else {
                reject(new Error('Invalid Username or Password.'));
            }
        }
      }, 500);
    });
  };

  const signup = async (username: string, password: string, profile: FarmerProfile): Promise<void> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const storedData = localStorage.getItem(FARMERS_STORAGE_KEY);
              const farmers: StoredFarmer[] = storedData ? JSON.parse(storedData) : [];

              if (farmers.some(f => f.username === username)) {
                  reject(new Error('This username is already taken.'));
                  return;
              }

              const newFarmer: StoredFarmer = { username, password, profile };
              farmers.push(newFarmer);
              localStorage.setItem(FARMERS_STORAGE_KEY, JSON.stringify(farmers));
              resolve();
          }, 500);
      });
  };

  const updateUserProfile = async (updates: Partial<FarmerProfile>): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (user?.role !== 'farmer') {
        return reject(new Error("Only farmer profiles can be updated."));
      }

      const updatedUser = {
        ...user,
        profile: { ...user.profile, ...updates },
      } as FarmerUser;

      // Update state
      setUser(updatedUser);
      // Persist session user
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the master list of farmers in localStorage
      const storedData = localStorage.getItem(FARMERS_STORAGE_KEY);
      let farmers: StoredFarmer[] = storedData ? JSON.parse(storedData) : [];
      const farmerIndex = farmers.findIndex(f => f.username === user.username);

      if (farmerIndex !== -1) {
        farmers[farmerIndex].profile = { ...farmers[farmerIndex].profile, ...updates };
        localStorage.setItem(FARMERS_STORAGE_KEY, JSON.stringify(farmers));
      }
      resolve();
    });
  };


  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};