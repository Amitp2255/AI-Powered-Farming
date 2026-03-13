
import { WeatherData } from '../types';

const OPENWEATHER_API_KEY = '16773e4c73626299c4f6f243b8599a44';

// --- Helper: Map OpenWeatherMap icons to our internal Lucide icons ---
const mapOWMIcon = (code: string): string => {
  // Codes: https://openweathermap.org/weather-conditions
  if (code.startsWith('01')) return 'Sun'; // Clear
  if (code.startsWith('02')) return 'CloudSun'; // Few clouds
  if (code.startsWith('03') || code.startsWith('04')) return 'Cloud'; // Scattered/Broken clouds
  if (code.startsWith('09') || code.startsWith('10')) return 'CloudRain'; // Rain
  if (code.startsWith('11')) return 'CloudRain'; // Thunderstorm
  if (code.startsWith('13')) return 'CloudSnow'; // Snow
  if (code.startsWith('50')) return 'Cloud'; // Mist
  return 'CloudSun';
};

// --- Helper: Safe Mode / Fallback Generator ---
// Used when API fails or no coordinates are available
const getSeasonalWeather = (locationName: string): WeatherData => {
    const date = new Date();
    const month = date.getMonth(); // 0-11
    
    // Base values for "General Average" conditions
    let temp = 30;
    let description = "Sunny";
    let icon = "Sun";
    let min = 20;
    let max = 35;
    let humidity = 50;

    // Apply Location Heuristics based on Normalized Location String
    const locLower = locationName.toLowerCase();
    let locationModifier = 0; // Temp modifier
    let humidityModifier = 0;

    // Northern Zone
    if (locLower.includes('punjab') || locLower.includes('haryana') || locLower.includes('delhi') || locLower.includes('himachal') || locLower.includes('kashmir') || locLower.includes('northern')) {
        locationModifier = -4;
        humidityModifier = -10;
    } 
    // Western/Arid Zone
    else if (locLower.includes('rajasthan') || locLower.includes('gujarat') || locLower.includes('arid') || locLower.includes('dry')) {
        locationModifier = 4;
        humidityModifier = -20;
    }
    // Coastal/Southern Zone
    else if (locLower.includes('kerala') || locLower.includes('tamil') || locLower.includes('mumbai') || locLower.includes('bengal') || locLower.includes('coastal') || locLower.includes('southern')) {
        humidityModifier = 25;
        locationModifier = -1; 
    }

    // Seasonal Logic
    if (month >= 5 && month <= 8) { // Jun-Sep (Monsoon)
        temp = 29 + locationModifier;
        description = "Cloudy / Expected Rain";
        icon = "CloudRain";
        min = 25 + locationModifier;
        max = 32 + locationModifier;
        humidity = Math.min(95, 75 + humidityModifier);
    } else if (month >= 9 && month <= 10) { // Oct-Nov (Post Monsoon)
        temp = 27 + locationModifier;
        description = "Partly Cloudy (Likely)";
        icon = "CloudSun";
        min = 22 + locationModifier;
        max = 31 + locationModifier;
        humidity = Math.min(85, 60 + humidityModifier);
    } else if (month >= 11 || month <= 1) { // Dec-Feb (Winter)
        temp = 18 + locationModifier; 
        description = "Clear Sky (Seasonal)";
        icon = "Sun";
        min = 10 + locationModifier;
        max = 25 + locationModifier;
        humidity = Math.max(30, 45 + humidityModifier);
    } else { // Mar-May (Summer)
        temp = 38 + locationModifier;
        description = "Hot / Sunny";
        icon = "Sun";
        min = 26 + locationModifier;
        max = 42 + locationModifier;
        humidity = Math.max(15, 30 + humidityModifier);
    }

    const variance = Math.floor(Math.random() * 3); 
    temp += variance;

    const daily = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(date);
        d.setDate(date.getDate() + i);
        const trend = Math.round(Math.sin(i) * 1.5);
        const dailyVariance = Math.floor(Math.random() * 2);

        return {
            date: d.toISOString().split('T')[0],
            day: i === 0 ? 'Today' : d.toLocaleString('en-US', { weekday: 'short' }),
            min: min + trend + dailyVariance,
            max: max + trend + dailyVariance,
            icon: icon,
            description: i === 0 ? description : "Expected Pattern"
        };
    });

    return {
        current: {
            temp,
            description,
            icon,
            humidity,
            wind: 10 + variance,
            location: locationName
        },
        daily
    };
};

// --- Real API Fetcher ---
export const getWeatherData = async (locationName: string = "Regional Forecast", lat?: number, lon?: number): Promise<WeatherData> => {
    
    // 1. Fallback immediately if no key or no coordinates
    if (!OPENWEATHER_API_KEY || lat === undefined || lon === undefined) {
        // console.warn("Using seasonal fallback (No API Key or Coordinates)");
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getSeasonalWeather(locationName));
            }, 400); 
        });
    }

    try {
        // 2. Fetch Current Weather
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`);
        if (!currentRes.ok) throw new Error("Weather API failed");
        const currentData = await currentRes.json();

        // 3. Fetch 5-Day Forecast
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`);
        if (!forecastRes.ok) throw new Error("Forecast API failed");
        const forecastData = await forecastRes.json();

        // 4. Process Forecast Data (OWM returns 3-hour steps, we need daily summaries)
        const dailyMap = new Map<string, { min: number, max: number, icon: string, description: string, count: number }>();
        
        forecastData.list.forEach((item: any) => {
            const date = item.dt_txt.split(' ')[0];
            const temp = item.main.temp;
            const iconCode = item.weather[0].icon;
            const desc = item.weather[0].description;
            
            if (!dailyMap.has(date)) {
                dailyMap.set(date, { min: temp, max: temp, icon: iconCode, description: desc, count: 1 });
            } else {
                const entry = dailyMap.get(date)!;
                entry.min = Math.min(entry.min, temp);
                entry.max = Math.max(entry.max, temp);
                // Simple logic: take the icon/desc from midday (usually the middle entries)
                if (item.dt_txt.includes("12:00:00")) {
                     entry.icon = iconCode;
                     entry.description = desc;
                }
                entry.count++;
            }
        });

        // Convert Map to Array, sorting by date
        const daily = Array.from(dailyMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(0, 7) // Ensure we don't exceed 7 days (OWM usually gives 5)
            .map(([dateStr, data], index) => {
                const d = new Date(dateStr);
                return {
                    date: dateStr,
                    day: index === 0 ? 'Today' : d.toLocaleString('en-US', { weekday: 'short' }),
                    min: Math.round(data.min),
                    max: Math.round(data.max),
                    icon: mapOWMIcon(data.icon),
                    description: data.description.charAt(0).toUpperCase() + data.description.slice(1)
                };
            });

        return {
            current: {
                temp: Math.round(currentData.main.temp),
                description: currentData.weather[0].description.charAt(0).toUpperCase() + currentData.weather[0].description.slice(1),
                icon: mapOWMIcon(currentData.weather[0].icon),
                humidity: currentData.main.humidity,
                wind: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
                location: locationName // Use the resolved name passed from locationService
            },
            daily
        };

    } catch (error) {
        console.warn("Weather API error, switching to fallback:", error);
        return getSeasonalWeather(locationName);
    }
};
