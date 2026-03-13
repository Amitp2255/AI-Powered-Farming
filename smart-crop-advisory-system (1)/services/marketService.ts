
import { MarketData } from '../types';

/**
 * Generates mock historical price data for chart display.
 * @param currentPrice - The current price to base the history on.
 * @param days - The number of historical days to generate.
 * @param volatility - A factor for price fluctuation (e.g., 0.015 for 1.5%).
 * @returns An array of historical price points.
 */
const generateHistory = (currentPrice: number, days: number, volatility: number = 0.02): { date: string; price: number }[] => {
    const history = [];
    let price = currentPrice;
    const priceHistory = [price];

    // Generate prices backwards from today
    for (let i = 0; i < days - 1; i++) {
        const fluctuation = (Math.random() - 0.48) * volatility; // small daily fluctuation
        price = price / (1 + fluctuation);
        priceHistory.unshift(price);
    }
    
    // Create date-price pairs
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        history.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(priceHistory[i])
        });
    }

    return history;
};


// Base prices for mock data generation (INR)
const basePrices: { [key: string]: number } = {
    "Wheat": 2350,
    "Rice": 3800,
    "Cotton": 7200,
    "Soyabean": 4600,
    "Mustard": 5400,
    "Tomato": 1200,
    "Onion": 2500,
    "Potato": 800,
    "Ginger": 6000,
    "Rose (Loose)": 150, // Per Kg
    "Marigold": 60, // Per Kg
    "Gerbera": 400, // Per Bundle (approx normalized)
    "Rohu (Fish)": 16000, // Per Quintal (160/kg)
    "Catla (Fish)": 18000, // 180/kg
    "Prawns": 45000, // 450/kg
    "Silk Cocoon": 40000, // 400/kg
    "Honey": 20000 // 200/kg bulk
};

/**
 * Generates a complete mock MarketData object.
 * @param crop The name of the crop/commodity.
 * @param region The name of the region.
 * @returns A mock MarketData object.
 */
const generateMockMarketData = (crop: string, region: string): MarketData => {
    const basePrice = basePrices[crop] || 3000;
    
    // Create a simple hash from strings to introduce deterministic variance
    const stringToHash = (s: string) => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);
    
    const varianceFactor = ((stringToHash(crop) % 100) + (stringToHash(region) % 100)) / 1000; // +/- 0 to 20%
    const currentPrice = Math.round(basePrice * (1 + varianceFactor));

    // Higher volatility for perishables like Flowers/Fish
    let volatility = 0.02;
    if (['Tomato', 'Rose (Loose)', 'Marigold'].includes(crop)) volatility = 0.05;
    if (['Rohu (Fish)', 'Prawns'].includes(crop)) volatility = 0.03;

    const history = generateHistory(currentPrice, 90, volatility);

    const yesterdayPrice = history[history.length - 2]?.price || currentPrice * 0.99;
    const changePct = parseFloat(((currentPrice - yesterdayPrice) / yesterdayPrice * 100).toFixed(2));

    return {
        crop: crop,
        region: region,
        current: {
            price_per_qtl: currentPrice,
            market: `${region} Mandi/Market`, 
            change_pct: changePct,
        },
        history: history
    };
};

/**
 * Fetches market data for a given crop/commodity and region.
 */
export const getMarketData = async (crop: string, region: string): Promise<MarketData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const data = generateMockMarketData(crop, region);
                resolve(data);
            } catch (error) {
                console.error("Error generating mock market data:", error);
                resolve(generateMockMarketData('Wheat', 'Punjab'));
            }
        }, 600 + Math.random() * 400); 
    });
};
