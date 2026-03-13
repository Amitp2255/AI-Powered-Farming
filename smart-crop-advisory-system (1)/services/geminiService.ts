
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { CropRecommendation, PestAnalysis, MarketPrediction, IoTData, WeatherData, MultiFarmingType, MultiFarmingInsight } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Use 'gemini-3-flash-preview' for stability
const MODEL_NAME = 'gemini-3-flash-preview'; 

const cropRecommenderSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      cropName: { type: Type.STRING, description: "Name of the recommended activity (Crop, Flower, Fish, etc.)." },
      reason: { type: Type.STRING, description: "Detailed reason based on location and season." },
      expectedYield: { type: Type.STRING, description: "Expected yield." },
      marketTrend: { type: Type.STRING, description: "General market trend based on historical data." },
      fertilizerAdvice: { type: Type.STRING, description: "Nutrient or Feed recommendation." },
      irrigationAdvice: { type: Type.STRING, description: "Water management advice." },
      cashCropInsights: {
        type: Type.OBJECT,
        nullable: true,
        description: "Populate if high commercial value.",
        properties: {
            isCashCrop: { type: Type.BOOLEAN },
            marketDemand: { type: Type.STRING, enum: ['Rising', 'Stable', 'Falling'] },
            demandExplanation: { type: Type.STRING, description: "Explanation of price trend." },
            expectedIncomeRange: { type: Type.STRING, description: "Expected income per unit." },
            demandStrength: { type: Type.STRING, enum: ['High', 'Moderate', 'Low'] },
            weatherRisk: { type: Type.STRING, enum: ['High', 'Moderate', 'Low'] },
            pestRisk: { type: Type.STRING, enum: ['High', 'Moderate', 'Low'] },
            potentialBuyers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of potential buyers." }
        }
      },
      intercroppingAdvice: {
          type: Type.OBJECT,
          nullable: true,
          description: "Multi-farming advice.",
          properties: {
              suitableCrops: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Compatible species." },
              benefits: { type: Type.STRING, description: "Synergy benefits." }
          }
      }
    },
    required: ["cropName", "reason", "expectedYield", "marketTrend"],
  },
};

const pestAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        validationSuccess: { type: Type.BOOLEAN, description: "True ONLY if ALL mandatory images (Leaf, Stem, Whole Plant) are present, distinct, and high quality." },
        validationError: { type: Type.STRING, description: "If validation fails, explain EXACTLY why to the farmer in the REQUESTED LANGUAGE (e.g., 'Missing Stem image', 'Duplicate images detected', 'Photo too blurry')." },
        imageQualityCheck: { type: Type.STRING, enum: ['Pass', 'Fail'], description: "Pass only if images are clear and focus is good." },
        disease: { type: Type.STRING, description: "Name of disease/pest in the REQUESTED LANGUAGE." },
        confidence: { type: Type.NUMBER, description: "Confidence score (0.0 to 1.0)." },
        description: { type: Type.STRING, description: "Symptoms description in the REQUESTED LANGUAGE." },
        recommendedAction: { type: Type.STRING, description: "Immediate actions in the REQUESTED LANGUAGE." },
        preventiveMeasures: { type: Type.STRING, description: "Future prevention in the REQUESTED LANGUAGE." },
        severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
        treatment: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                organic: { type: Type.STRING, description: "Organic/Natural treatment in the REQUESTED LANGUAGE." },
                chemical: { type: Type.STRING, description: "Chemical/Medicinal treatment in the REQUESTED LANGUAGE." },
                dosage: { type: Type.STRING, description: "Detailed dosage in the REQUESTED LANGUAGE." },
                timing: { type: Type.STRING, description: "Application timing in the REQUESTED LANGUAGE." },
                method: { type: Type.STRING, description: "Application method in the REQUESTED LANGUAGE." },
                safetyPrecautions: { type: Type.STRING, description: "Safety measures in the REQUESTED LANGUAGE." }
            }
        }
    },
    required: ["validationSuccess", "imageQualityCheck"],
};

const marketPredictionSchema = {
    type: Type.OBJECT,
    properties: {
        prediction7day: { type: Type.STRING, description: "Price range next 7 days (Estimated)." },
        reason7day: { type: Type.STRING, description: "Reasoning based on historical trends." },
        prediction30day: { type: Type.STRING, description: "Price range next 30 days (Estimated)." },
        reason30day: { type: Type.STRING, description: "Reasoning based on seasonal patterns." },
    },
    required: ["prediction7day", "reason7day", "prediction30day", "reason30day"],
};

const multiFarmingSchema = {
  type: Type.OBJECT,
  properties: {
    combinations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          species: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Names of compatible crops or species." },
          description: { type: Type.STRING, description: "Short description of interaction." },
          symbiosis: { type: Type.STRING, description: "Key benefit term." }
        }
      }
    },
    resourcePlan: {
      type: Type.OBJECT,
      properties: {
        waterStrategy: { type: Type.STRING, description: "Water usage optimization plan." },
        waterSavingPercentage: { type: Type.NUMBER, description: "Estimated % water saved." },
        inputStrategy: { type: Type.STRING, description: "Fertilizer/Feed optimization plan." },
        costSavingPercentage: { type: Type.NUMBER, description: "Estimated % input cost saved." }
      }
    },
    riskAnalysis: {
      type: Type.OBJECT,
      properties: {
        singleCropRisk: { type: Type.NUMBER, description: "Risk score (0-100) for single farming." },
        multiCropRisk: { type: Type.NUMBER, description: "Risk score (0-100) for multi-farming." },
        incomeStabilityChange: { type: Type.NUMBER, description: "Percentage increase in stability." },
        factors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Risk reduction factors." }
      }
    },
    videoPrompt: { type: Type.STRING, description: "Prompt for Veo video model." }
  },
  required: ["combinations", "resourcePlan", "riskAnalysis", "videoPrompt"]
};


export const getCropRecommendation = async (
  soilType: string,
  waterAvailability: string,
  season: string,
  previousCrop: string,
  farmingType: string,
  iotData: IoTData | undefined,
  lang: string
): Promise<CropRecommendation[]> => {
  const iotPromptPart = iotData
    ? `
    IoT Data (Live):
    - pH: ${iotData.ph.toFixed(1)}
    - Moisture: ${iotData.moisture.toFixed(0)}%
    - Temp: ${iotData.temperature.toFixed(0)}°C
    - NPK: ${iotData.nitrogen}/${iotData.phosphorus}/${iotData.potassium}
    `
    : '';

  const prompt = `
    Analyze agricultural conditions for a farm in India.
    
    STRICT CONSTRAINT: You must ONLY recommend activities that belong to the selected Farming Type: "${farmingType}".
    NOTE: All advice must be based on historical trends and agro-climatic zones. Do NOT use Google Search.

    **LANGUAGE REQUIREMENT**:
    - The output JSON keys (like "cropName", "reason") MUST stay in English.
    - The VALUES (content, descriptions, advice) MUST be strictly in "${lang}" language.
    - If "${lang}" is not English, translate all advice, reasons, and crop names to "${lang}".

    FARMING TYPE RULES:
    1. "Normal Farming": Recommend ONLY traditional field crops.
    2. "Aquaculture" or "Pisciculture": Recommend ONLY fish or aquatic species.
    3. "Floriculture": Recommend ONLY flower plants.
    4. "Horticulture": Recommend ONLY fruits, vegetables, or plantation crops.
    5. "Sericulture": Recommend ONLY silkworm/mulberry related activities.
    6. "Apiculture": Recommend ONLY beekeeping activities.
    7. "Viticulture": Recommend ONLY grape varieties.

    Conditions:
    - Soil/Land Type: ${soilType}
    - Water: ${waterAvailability}
    - Season: ${season}
    - Previous Activity: ${previousCrop}
    ${iotPromptPart}

    For each recommendation:
    1. Check if it is a high-value Commercial/Cash activity.
    2. Populate 'cashCropInsights':
       - Analyze market demand (Rising/Stable/Falling) based on historical seasonality.
       - Est. Income per unit.
       - Assess Risks (Weather/Disease).
       - Suggest Buyers.
    3. Suggest 'intercroppingAdvice' (Multi-Farming).
    4. Provide specific Feed/Fertilizer & Water advice.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: cropRecommenderSchema,
      temperature: 0.5,
    },
  });
  
  try {
    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty response from AI");
    return JSON.parse(jsonText) as CropRecommendation[];
  } catch (error) {
    console.error("Error parsing recommendation JSON:", error);
    throw new Error("Failed to get recommendations.");
  }
};

export const analyzePest = async (
  images: string[],
  mimeTypes: string[],
  context: { weather?: WeatherData; season?: string; cropContext?: string } | undefined,
  lang: string
): Promise<PestAnalysis> => {
    
    const imageParts = images.map((img, index) => ({
        inlineData: {
          data: img,
          mimeType: mimeTypes[index],
        },
    }));

    // Use weather description (which contains location info) for context
    const weatherContext = context?.weather ? `Typical Weather for ${context.weather.current.location}: ${context.weather.current.description}, ${context.weather.current.temp}°C.` : '';
    const cropContext = context?.cropContext ? `Context: ${context.cropContext}.` : '';

    const textPart = {
        text: `You are an AI vision system for crop pest and disease detection.
        You must strictly enforce multi-image, multi-part validation before performing any diagnosis.

        **LANGUAGE INSTRUCTION**:
        - You MUST Output strictly in JSON.
        - The JSON Keys must be in English.
        - The JSON Values (descriptions, disease names, advice) MUST be in "${lang}" language.
        - Speak like a local expert in "${lang}".

        **MANDATORY IMAGE REQUIREMENT RULES**
        A single image is NOT sufficient for analysis. The farmer must upload images from different crop parts:
        1. Leaf image (MANDATORY)
        2. Whole plant image (MANDATORY)
        3. Stem / plant body image (MANDATORY)
        4. Root image (Optional but recommended)
        Each image must represent a different physical part of the same crop.

        **IMAGE-TYPE VERIFICATION BARRIER (PLANT VALIDATION LOGIC)**
        Before analysis, validate that:
        - Leaf image is NOT the same as stem or root image.
        - Root image is visually distinct from leaf and plant body.
        - Background, angle, and visual features differ logically.
        - **DUPLICATE DETECTION**: If two uploaded images appear visually identical or highly similar, IMMEDIATELY REJECT the request. Show alert: "Different crop part images required. Same image detected." (Translate this alert to ${lang}).

        **REAL-TIME IMAGE QUALITY VALIDATION**
        Reject images if:
        - Image is blurry.
        - Image is dark or underexposed.
        - Focus is unclear.
        - Crop part is not clearly visible.

        Only proceed when all mandatory image categories pass validation.

        **AI ANALYSIS FLOW (AFTER VALIDATION ONLY)**
        Once validation succeeds:
        1. Perform visual feature extraction.
        2. Identify pest or disease.
        3. Cross-check with:
           - Crop Type: ${cropContext}
           - Weather/Season: ${weatherContext}

        **AI OUTPUT REQUIREMENTS**
        If validation succeeds, return:
        - Pest or disease name
        - Severity level: Low / Medium / High
        - Recommended treatment: Organic solution, Chemical solution, Dosage, Application timing.
        - Preventive measures.

        **STRICT FAILURE HANDLING RULES**
        If:
        - Required image type is missing (e.g. No Stem image).
        - Same image uploaded for multiple categories.
        - Image quality validation fails.
        THEN:
        - Do NOT perform diagnosis.
        - Set 'validationSuccess': false.
        - Set 'validationError': Show clear farmer-friendly instruction on what image is needed (e.g., "Upload a clear photo of the Stem") translated in ${lang}.
        `
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [...imageParts, textPart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: pestAnalysisSchema,
            temperature: 0.2,
        },
    });

    try {
        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response from AI");
        return JSON.parse(jsonText) as PestAnalysis;
    } catch (error) {
        console.error("Error parsing pest analysis JSON:", error);
        throw new Error("Failed to analyze.");
    }
};

export const getMarketPrediction = async (
    crop: string,
    region: string,
    history: { date: string; price: number }[],
    lang: string
): Promise<MarketPrediction> => {
    const prompt = `
        Analyze historical price data for "${crop}" in "${region}".
        History (30 days): ${JSON.stringify(history.slice(-30))}
        
        Based on historical trends and seasonal patterns for this region, predict price ranges for next 7 and 30 days.
        Do NOT access real-time market APIs. Use the provided history and general seasonality.

        **LANGUAGE INSTRUCTION**:
        - Output strictly in JSON.
        - JSON Keys: English.
        - JSON Values (Reasoning, Predictions text): Strictly in "${lang}" language.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: marketPredictionSchema,
            temperature: 0.3,
        },
    });

    try {
        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response from AI");
        return JSON.parse(jsonText) as MarketPrediction;
    } catch (error) {
        console.error("Error parsing prediction JSON:", error);
        throw new Error("Failed to predict.");
    }
};


export const getWeatherAdvisory = async (weatherData: WeatherData, lang: string): Promise<string> => {
    const prompt = `
        Act as an expert agricultural advisor for ${weatherData.current.location}.
        Based on the typical seasonal weather described below, provide concise farming advice (2-3 sentences).
        
        Conditions: ${weatherData.current.description}, Approx ${weatherData.current.temp}°C.
        
        **LANGUAGE**: Provide the advice strictly in "${lang}" language.
        
        Disclaimer: Phrase your advice as "likely" or "expected" based on historical patterns. Do not imply real-time forecast accuracy.
    `;
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            temperature: 0.4,
        },
    });

    return response.text || "Advisory unavailable.";
};

// Deprecated string version, kept for safety
export const getMultiFarmingAdvice = async (farmingType: MultiFarmingType, lang: string): Promise<string> => {
    const prompt = `Provide advisory for ${farmingType} in ${lang}`;
    return "Feature migrated to structured object.";
};

export const getMultiFarmingInsights = async (farmingType: MultiFarmingType, lang: string): Promise<MultiFarmingInsight> => {
    const prompt = `
        Act as a global agricultural expert.
        Generate a multi-farming strategy for: "${farmingType}".
        
        1. Identify 2-3 highly compatible species/crops for this type (e.g. for Aquaculture: Fish + Rice + Duck).
        2. Explain the symbiosis.
        3. Create a resource efficiency plan (Water/Input savings).
        4. Analyze Risk Reduction (Single vs Multi crop).
        5. Generate a prompt for a video generation model (Veo) that visualizes this farming setup in action.

        **LANGUAGE INSTRUCTION**:
        - Output strictly in JSON with English Keys.
        - All Descriptions, Strategies, and Explanations must be in "${lang}" language.
        - Ensure the 'videoPrompt' remains in English (for the model).
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: multiFarmingSchema,
            temperature: 0.4,
        },
    });

    try {
        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response from AI");
        return JSON.parse(jsonText) as MultiFarmingInsight;
    } catch (error) {
        console.error("Error parsing multi-farming JSON:", error);
        throw new Error("Failed to load insights.");
    }
};

export const getChatbotResponse = async (message: string, lang: string): Promise<string> => {
    const prompt = `
        You are 'Kisan Mitra', a friendly AI farming assistant for Indian farmers.
        User Message: "${message}"
        Target Language: "${lang}"
        
        INSTRUCTIONS:
        1. Answer strictly in the Target Language: "${lang}".
        2. Do NOT mix languages. If user asks in English but 'Target Language' is Hindi, reply in Hindi.
        3. Focus on crops, weather, and government schemes.
        4. Be encouraging, helpful, and concise.
    `;
     const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            temperature: 0.7,
        },
    });
    return response.text || "I am unable to answer right now.";
};


export const generateFarmingVideo = async (prompt: string): Promise<string> => {
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A photorealistic educational farming video: ${prompt}. Cinematic lighting, detailed closeups of crops/livestock.`,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed.");
    
    // Return URI with API key appended for direct playback
    return `${videoUri}&key=${process.env.API_KEY}`;
};
