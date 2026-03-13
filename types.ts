
import { Language } from './translations';

export type Page = 'dashboard' | 'crop-recommender' | 'pest-advisory' | 'chatbot';
export type AppPage = 'dashboard' | 'weather' | 'market' | 'crop' | 'pest' | 'schemes' | 'allocations' | 'profile' | 'multi-farming';

export interface IoTData {
  ph: number;
  moisture: number;
  temperature: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pumpStatus: 'ON' | 'OFF';
}

export interface CashCropInsights {
  isCashCrop: boolean;
  marketDemand: 'Rising' | 'Stable' | 'Falling';
  demandExplanation: string;
  expectedIncomeRange: string;
  demandStrength: 'High' | 'Moderate' | 'Low';
  weatherRisk: 'High' | 'Moderate' | 'Low';
  pestRisk: 'High' | 'Moderate' | 'Low';
  potentialBuyers: string[];
}

export interface IntercroppingAdvice {
  suitableCrops: string[];
  benefits: string;
}

export interface CropRecommendation {
  cropName: string;
  reason: string;
  expectedYield: string;
  marketTrend: string;
  fertilizerAdvice?: string;
  irrigationAdvice?: string;
  cashCropInsights?: CashCropInsights;
  intercroppingAdvice?: IntercroppingAdvice;
}

export interface PestAnalysis {
  disease: string;
  confidence: number;
  description: string;
  recommendedAction: string;
  preventiveMeasures: string;
  imageQualityCheck?: 'Pass' | 'Fail';
  severity?: 'Low' | 'Medium' | 'High';
  treatment?: {
    organic: string;
    chemical: string;
    dosage: string;
    timing: string;
    method: string;
    safetyPrecautions: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export interface WeatherData {
  current: {
    temp: number;
    description: string;
    icon: string;
    humidity: number;
    wind: number;
    location: string;
  };
  daily: {
    date: string;
    day: string;
    min: number;
    max: number;
    icon: string;
    description: string;
  }[];
}

export interface MarketData {
  crop: string;
  region: string;
  current: {
    price_per_qtl: number;
    market: string;
    change_pct: number;
  };
  history: {
    date: string; // "YYYY-MM-DD"
    price: number;
  }[];
}

export interface MarketPrediction {
  prediction7day: string;
  reason7day: string;
  prediction30day: string;
  reason30day: string;
}

export interface Scheme {
    id: number;
    title: string;
    summary: string;
    eligibility: string;
    benefits: string;
    applicationLink: string;
}

export interface Allocation {
    id: string;
    item: string;
    quantity: string;
    status: 'Allocated' | 'Pending' | 'Delivered';
    date: string;
}

export interface OutbreakAlert {
    id: string;
    disease: string;
    area: string;
    advice: string;
    date: string;
}

export interface FarmerProfile {
  fullName: string;
  phone: string;
  location: string; // Village / District
  landSize: number; // in acres
  soilType: 'Clay' | 'Sandy' | 'Loamy' | 'Black' | 'Red' | '';
  irrigationSource: 'Canal' | 'Borewell' | 'Rain-fed' | 'Tank' | '';
  lastSeasonCrops: string;
  preferredLanguage: Language;
}

export interface FarmerUser {
  role: 'farmer';
  username: string;
  profile: FarmerProfile;
}

export interface AdminUser {
  role: 'admin';
  username: string;
}

export type User = FarmerUser | AdminUser;


export interface AdminFarmer {
    id: string;
    name: string;
    location: string;
    phone: string;
    primaryCrops: string[];
}

export interface AdminIoTDevice {
    id: string; // device_id
    farmerName: string;
    farmerId: string;
    lastReading: IoTData & { timestamp: string };
    history: (IoTData & { timestamp: string })[];
}

export type MultiFarmingType = 'Aquaculture' | 'Floriculture' | 'Horticulture' | 'Sericulture' | 'Apiculture' | 'Pisciculture' | 'Viticulture';

export interface MultiFarmingInsight {
  combinations: {
    species: string[]; // Crops or Species names
    description: string;
    symbiosis: string; // e.g., "Nitrogen fixing", "Waste recycling"
  }[];
  resourcePlan: {
    waterStrategy: string;
    waterSavingPercentage: number;
    inputStrategy: string; // Fertilizer or Feed
    costSavingPercentage: number;
  };
  riskAnalysis: {
    singleCropRisk: number; // 0-100 score
    multiCropRisk: number; // 0-100 score
    incomeStabilityChange: number; // Percentage increase
    factors: string[];
  };
  videoPrompt: string;
}
