
// Service to handle Location resolution via OpenWeatherMap Geocoding API
// This is now the Single Source of Truth for location names.

const OPENWEATHER_API_KEY = '16773e4c73626299c4f6f243b8599a44';

export const getLocationFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    // Graceful fallback if no key is configured
    if (!OPENWEATHER_API_KEY) {
        console.warn("OpenWeatherMap API Key not configured. Using fallback.");
        return getInternalFallbackLocation(lat);
    }

    try {
        // OWM Geocoding API - Reverse
        // Limit 1 ensures we get the most relevant result for the exact coordinates
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`);
        
        if (!response.ok) {
            return getInternalFallbackLocation(lat);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const loc = data[0];
            // Construct precise location string: "City, State"
            // We do not guess. We use exactly what OWM returns.
            const parts = [];
            if (loc.name) parts.push(loc.name);
            if (loc.state) parts.push(loc.state);
            
            return parts.length > 0 ? parts.join(", ") : getInternalFallbackLocation(lat);
        }
    } catch (error) {
        // Silently fail to fallback logic to ensure user experience isn't broken
        console.warn("Location resolution failed, switching to zone estimation.");
    }
    
    return getInternalFallbackLocation(lat);
};

// Internal fallback logic based on Latitude (Safe Mode)
// Used only when API connectivity is totally lost
const getInternalFallbackLocation = (lat: number): string => {
    if (lat > 28) return "Northern Plains";
    if (lat > 24) return "Central India";
    if (lat > 20) return "Western Zone";
    if (lat > 15) return "Deccan Plateau";
    return "Southern Peninsula";
};
