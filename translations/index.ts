
export const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'or', name: 'ଓଡ଼ିଆ' },
    { code: 'bho', name: 'भोजपुरी' },
];

export type Language = typeof supportedLanguages[number]['code'];

// Base English Translations
const en = {
    header: { title: "Kisan Saathi" },
    login: {
      title: "Kisan Saathi",
      subtitle: "Global Smart Farming Assistant",
      usernamePlaceholder: "Username / Email",
      passwordPlaceholder: "Password",
      loginAsFarmer: "Login as Farmer",
      loginAsAdmin: "Login as Admin",
      createAccountPrompt: "Don't have an account?",
      createAccountLink: "Create New Account",
      signupSuccess: "Account created successfully! Please log in.",
      invalidCredentialsError: "Invalid Username or Password."
    },
    signup: {
        title: "Create Farmer Account",
        subtitle: "Provide your details to get personalized advice.",
        fullName: "Full Name",
        phoneNumber: "Phone Number",
        villageDistrict: "Village / District",
        landSize: "Land Size (in acres)",
        soilType: "Soil Type",
        selectSoilType: "Select Soil Type",
        irrigationSource: "Primary Irrigation Source",
        selectIrrigationSource: "Select Irrigation Source",
        lastSeasonCrops: "Farming Activities",
        lastSeasonCropsPlaceholder: "e.g., Wheat, Rose, Rohu",
        preferredLanguage: "Preferred Language",
        username: "Username",
        password: "Password",
        createAccountButton: "Create Account",
        creatingAccount: "Creating Account...",
        loginPrompt: "Already have an account?",
        loginLink: "Login Here",
        genericError: "An unexpected error occurred.",
        usernameExistsError: "This username is already taken."
    },
    dashboard: {
      speakPrompt: "Ask about Crops, Flowers, Fish or Schemes...",
      cropAdvice: "Farming Advice",
      pestAdvice: "Disease Detection",
      weatherUpdate: "Weather Update",
      marketPrices: "Market Trends",
      govtSchemes: "Govt. Schemes",
      myAllocations: "My Allocations",
      outbreakAlertTitle: "Outbreak Alert",
      multiFarmingTitle: "Global Multi-Farming",
      aquaculture: "Aquaculture",
      floriculture: "Floriculture",
      horticulture: "Horticulture",
      sericulture: "Sericulture",
      apiculture: "Apiculture",
      pisciculture: "Pisciculture",
      viticulture: "Viticulture",
      close: "Close",
      generateVideo: "Generate AI Explainer Video",
      videoGenerating: "Creating video...",
      videoError: "Failed to generate video.",
      watchVideo: "Watch Explainer Video"
    },
    cropRecommender: {
      title: "Smart Recommendation",
      formTitle: "Farm Conditions",
      soilType: "Soil / Bed Type",
      waterAvailability: "Water Availability",
      season: "Season",
      farmingType: "Farming Type",
      previousCrop: "Previous Activity",
      previousCropPlaceholder: "e.g., Wheat, Fish Pond, Rose Bed",
      getRecommendations: "Get Recommendations",
      generating: "Analyzing Data...",
      topRecommendations: "Top Recommendations",
      iotTitle: "Live Environment Data",
      connectSensor: "Connect Sensor",
      connecting: "Connecting...",
      sensorConnected: "Sensor Active",
      ph: "pH Level",
      moisture: "Moisture",
      temperature: "Temp",
      fertilizerAdvice: "Nutrient Advice",
      irrigationAdvice: "Water Management",
      irrigationFertilizerTitle: "Resource Management",
      waterPump: "Pump Status",
      moistureLowAdvisory: "Moisture low. Action needed.",
      moistureOkAdvisory: "Levels are optimal.",
      nutrientStatus: "Nutrient Status",
      nitrogenStatus: "Nitrogen (N)",
      phosphorusStatus: "Phosphorus (P)",
      potassiumStatus: "Potassium (K)",
      considerUrea: "Add Urea",
      considerDAP: "Add DAP",
      considerMOP: "Add MOP",
      weatherAdvisoryTitle: "Weather Advisory",
      weatherRainAdvisory: "Rain forecast.",
      weatherHotAdvisory: "High heat.",
      cashCropTitle: "Commercial Potential",
      marketDemand: "Global Demand",
      expectedIncome: "Est. Income",
      riskLevel: "Risk Profile",
      demandStrength: "Demand",
      weatherRisk: "Weather Risk",
      pestRisk: "Disease Risk",
      potentialBuyers: "Buyers",
      intercroppingTitle: "Multi-Farming Synergy",
      suitableCrops: "Compatible Species",
      benefits: "Benefits"
    },
    // New section for dynamic dropdown values
    cropParams: {
        "Alluvial": "Alluvial",
        "Black": "Black",
        "Red": "Red",
        "Laterite": "Laterite",
        "Arid": "Arid",
        "Forest": "Forest",
        "Abundant": "Abundant",
        "Moderate": "Moderate",
        "Scarce": "Scarce",
        "Rain-fed": "Rain-fed",
        "Kharif (Monsoon)": "Kharif (Monsoon)",
        "Rabi (Winter)": "Rabi (Winter)",
        "Zaid (Summer)": "Zaid (Summer)",
        "Normal Farming": "Normal Farming",
        "Aquaculture": "Aquaculture",
        "Floriculture": "Floriculture",
        "Horticulture": "Horticulture",
        "Sericulture": "Sericulture",
        "Apiculture": "Apiculture",
        "Pisciculture": "Pisciculture",
        "Viticulture": "Viticulture"
    },
    pestAdvisory: {
        title: "Disease & Pest Doctor",
        uploadTitle: "Upload Images",
        uploadPrompt: "Tap to upload",
        uploadFormats: "PNG, JPG, WEBP",
        analyze: "Diagnose Issue",
        analyzing: "Scanning...",
        analysisResult: "Diagnosis Report",
        confidence: "AI Confidence",
        description: "Symptoms",
        recommendedAction: "Remedy",
        preventiveMeasures: "Prevention",
        healthy: "Healthy",
        severity: "Severity",
        treatment: "Treatment Plan",
        organic: "Organic",
        chemical: "Chemical",
        dosage: "Dosage",
        timing: "Schedule",
        invalidImage: "Validation Failed",
        invalidImageDesc: "Images must show different angles."
    },
    weather: {
      title: "Weather Forecast",
      forecastTitle: "7-Day Forecast",
      today: "Today",
      aiAdvisoryTitle: "AI Farming Advisory",
      generatingAdvisory: "Generating advice...",
      fetching: "Fetching weather...",
      error: {
        title: "Weather unavailable",
        message: "Check connection."
      }
    },
    market: {
      title: "Market Intelligence",
      crop: "Commodity",
      region: "Market/Region",
      pricePerQuintal: "per Unit",
      priceTrend: "Price Trend",
      predictTitle: "AI Price Forecast",
      predictButton: "Predict Future Rates",
      predicting: "Forecasting...",
      predictionFor7Days: "Next 7 Days",
      predictionFor30Days: "Next 30 Days",
      analystReasoning: "Market Logic",
      fetching: "Fetching market data...",
      regenerate: "Update Forecast",
      error: {
        title: "Data Unavailable",
        message: "Could not load market data."
      }
    },
    schemes: {
        title: "Government Schemes",
        welfareSchemes: "All Farming Schemes",
        eligibility: "Eligibility",
        benefits: "Benefits",
        applyHere: "Apply",
        loading: "Loading Schemes...",
        error: "Could not load schemes."
    },
    allocations: {
        title: "Allocations",
        description: "Government assigned resources.",
        allocated: "Allocated",
        pending: "Pending",
        delivered: "Delivered",
        fetching: "Fetching...",
        error: "Load failed."
    },
    profile: {
        title: "Profile",
        fullName: "Name",
        phone: "Phone",
        location: "Location",
        editProfile: "Edit",
        farmInfo: "Farm Details",
        update: "Update",
        soilType: "Soil/Land Type",
        primaryCrops: "Primary Activities",
        language: "Language",
        notifications: "Notifications",
        logout: "Logout",
        smsAlerts: "SMS Alerts",
        smsDescription: "Get alerts via SMS.",
        phoneNumberPlaceholder: "Mobile Number",
        subscribe: "Subscribe",
        subscribeSuccess: "Subscribed!",
        invalidPhoneNumberError: "Invalid number.",
        adminPanel: "Admin Panel"
    },
    chatbot: {
        title: "Kisan Mitra AI",
        greeting: "Hello! I am Kisan Mitra. Ask me anything about farming.",
        placeholder: "Ask anything...",
        error: "Connection error.",
        ariaClose: "Close",
        ariaReadAloud: "Speak"
    },
    admin: {
        title: "Admin Panel",
        farmerManagement: "Farmers",
        viewAll: "View All",
        schemeControl: "Schemes",
        addNewScheme: "Add Scheme",
        outbreakAlerts: "Outbreaks",
        noActiveAlerts: "No active outbreaks.",
        reportsAndAnalytics: "Analytics",
        cropPopularity: "Activity Distribution",
        pestReports: "Disease Reports",
        exportCSV: "Export CSV",
        actionDisabled: "Disabled in demo.",
        iotTitle: "IoT Monitoring",
        iotOverride: "Override",
        iotTrends: "Trends"
    }
};

const hi = {
    ...en,
    header: { title: "किसान साथी" },
    login: {
      ...en.login,
      title: "किसान साथी",
      subtitle: "ग्लोबल स्मार्ट फार्मिंग असिस्टेंट",
      usernamePlaceholder: "उपयोगकर्ता नाम / ईमेल",
      passwordPlaceholder: "पासवर्ड",
      loginAsFarmer: "किसान लॉगिन",
      loginAsAdmin: "एडमिन लॉगिन",
      signupSuccess: "खाता बन गया! कृपया लॉगिन करें।",
    },
    dashboard: {
      ...en.dashboard,
      speakPrompt: "फसल, फूल, मछली या योजनाओं के बारे में पूछें...",
      cropAdvice: "खेती सलाह",
      pestAdvice: "रोग पहचान",
      weatherUpdate: "मौसम",
      marketPrices: "बाजार भाव",
      govtSchemes: "योजनाएं",
      myAllocations: "आवंटन",
      outbreakAlertTitle: "प्रकोप चेतावनी",
      multiFarmingTitle: "मल्टी-फार्मिंग",
      aquaculture: "मछली पालन",
      floriculture: "फूलों की खेती",
      horticulture: "बागवानी",
      sericulture: "रेशम उत्पादन",
      apiculture: "मधुमक्खी पालन",
      pisciculture: "मत्स्य पालन",
      viticulture: "अंगूर की खेती",
      close: "बंद करें",
      generateVideo: "AI वीडियो बनाएं",
      videoGenerating: "वीडियो बन रहा है...",
      watchVideo: "वीडियो देखें"
    },
    cropRecommender: {
      ...en.cropRecommender,
      title: "स्मार्ट सुझाव",
      formTitle: "खेत/फार्म विवरण",
      soilType: "मिट्टी का प्रकार",
      waterAvailability: "पानी की उपलब्धता",
      season: "मौसम",
      farmingType: "खेती का प्रकार",
      previousCrop: "पिछली गतिविधि",
      previousCropPlaceholder: "जैसे: गेहूं, मछली तालाब, गुलाब", // Localized placeholder
      getRecommendations: "सुझाव लें",
      generating: "विश्लेषण हो रहा है...",
      topRecommendations: "शीर्ष सुझाव",
      iotTitle: "लाइव डेटा",
      connectSensor: "सेंसर कनेक्ट करें",
      connecting: "कनेक्ट हो रहा है...",
      sensorConnected: "सेंसर सक्रिय",
      ph: "pH स्तर",
      moisture: "नमी",
      temperature: "तापमान",
      fertilizerAdvice: "पोषण/चारा सलाह",
      irrigationAdvice: "जल प्रबंधन",
      irrigationFertilizerTitle: "संसाधन प्रबंधन",
      waterPump: "पंप स्थिति",
      moistureLowAdvisory: "नमी कम है।",
      moistureOkAdvisory: "स्तर ठीक है।",
      nutrientStatus: "पोषक तत्व स्थिति",
      considerUrea: "यूरिया डालें",
      considerDAP: "डीएपी डालें",
      considerMOP: "एमओपी डालें",
      weatherAdvisoryTitle: "मौसम सलाह",
      weatherRainAdvisory: "बारिश की संभावना।",
      weatherHotAdvisory: "तेज गर्मी।",
      cashCropTitle: "व्यावसायिक क्षमता",
      marketDemand: "बाजार मांग",
      expectedIncome: "अनुमानित आय",
      riskLevel: "जोखिम",
      demandStrength: "मांग",
      weatherRisk: "मौसम जोखिम",
      pestRisk: "रोग जोखिम",
      potentialBuyers: "खरीदार",
      intercroppingTitle: "मल्टी-फार्मिंग",
      suitableCrops: "उपयुक्त प्रजातियां",
      benefits: "लाभ"
    },
    cropParams: {
        "Alluvial": "जलोढ़ (Alluvial)",
        "Black": "काली (Black)",
        "Red": "लाल (Red)",
        "Laterite": "लैटेराइट (Laterite)",
        "Arid": "शुष्क (Arid)",
        "Forest": "वन (Forest)",
        "Abundant": "प्रचुर (Abundant)",
        "Moderate": "मध्यम (Moderate)",
        "Scarce": "कम (Scarce)",
        "Rain-fed": "वर्षा आधारित (Rain-fed)",
        "Kharif (Monsoon)": "खरीफ (मानसून)",
        "Rabi (Winter)": "रबी (सर्दी)",
        "Zaid (Summer)": "ज़ायद (गर्मी)",
        "Normal Farming": "सामान्य खेती",
        "Aquaculture": "जलीय कृषि (Aquaculture)",
        "Floriculture": "फूलों की खेती (Floriculture)",
        "Horticulture": "बागवानी (Horticulture)",
        "Sericulture": "रेशम उत्पादन (Sericulture)",
        "Apiculture": "मधुमक्खी पालन (Apiculture)",
        "Pisciculture": "मत्स्य पालन (Pisciculture)",
        "Viticulture": "अंगूर की खेती (Viticulture)"
    },
    pestAdvisory: {
        ...en.pestAdvisory,
        title: "रोग डॉक्टर",
        uploadTitle: "तस्वीरें अपलोड करें",
        uploadPrompt: "अपलोड करें",
        analyze: "जांच करें",
        analyzing: "स्कैनिंग...",
        analysisResult: "रिपोर्ट",
        confidence: "AI विश्वास",
        description: "लक्षण",
        recommendedAction: "उपाय",
        preventiveMeasures: "बचाव",
        healthy: "स्वस्थ",
        severity: "गंभीरता",
        treatment: "उपचार",
        organic: "जैविक",
        chemical: "रासायनिक",
        dosage: "मात्रा",
        timing: "समय",
        invalidImage: "अमान्य छवि",
        invalidImageDesc: "कृपया स्पष्ट और अलग-अलग कोणों से तस्वीरें लें।"
    },
    weather: {
      ...en.weather,
      title: "मौसम पूर्वानुमान",
      forecastTitle: "7-दिन का पूर्वानुमान",
      today: "आज",
      aiAdvisoryTitle: "AI मौसम सलाह",
      generatingAdvisory: "सलाह बन रही है...",
      fetching: "मौसम लोड हो रहा है..."
    },
    market: {
      ...en.market,
      title: "बाजार भाव",
      crop: "फसल/वस्तु",
      region: "क्षेत्र",
      pricePerQuintal: "प्रति यूनिट",
      priceTrend: "भाव रुझान",
      predictTitle: "AI मूल्य पूर्वानुमान",
      predictButton: "भविष्य के भाव जानें",
      predicting: "अनुमान लग रहा है...",
      predictionFor7Days: "अगले 7 दिन",
      predictionFor30Days: "अगले 30 दिन",
      analystReasoning: "बाजार तर्क",
      fetching: "डेटा लोड हो रहा है...",
      regenerate: "अपडेट करें"
    },
    schemes: {
        ...en.schemes,
        title: "सरकारी योजनाएं",
        welfareSchemes: "सभी कृषि योजनाएं",
        eligibility: "पात्रता",
        benefits: "लाभ",
        applyHere: "आवेदन करें",
        loading: "योजनाएं लोड हो रही हैं..."
    },
    allocations: {
        ...en.allocations,
        title: "आवंटन",
        description: "सरकारी संसाधन।",
        allocated: "आवंटित",
        pending: "लंबित",
        delivered: "वितरित",
        fetching: "लोड हो रहा है..."
    },
    profile: {
        ...en.profile,
        title: "प्रोफाइल",
        fullName: "नाम",
        phone: "फोन",
        location: "स्थान",
        editProfile: "एडिट",
        farmInfo: "खेत विवरण",
        update: "अपडेट",
        soilType: "मिट्टी का प्रकार",
        primaryCrops: "मुख्य गतिविधियां",
        language: "भाषा",
        notifications: "सूचनाएं",
        logout: "लॉगआउट",
        smsAlerts: "SMS अलर्ट",
        smsDescription: "SMS द्वारा अलर्ट प्राप्त करें।",
        phoneNumberPlaceholder: "मोबाइल नंबर",
        subscribe: "सब्सक्राइब",
        subscribeSuccess: "सब्सक्राइब किया गया!",
        invalidPhoneNumberError: "अमान्य नंबर।"
    },
    chatbot: {
        ...en.chatbot,
        title: "किसान मित्र AI",
        greeting: "नमस्ते! मैं किसान मित्र हूँ। खेती से जुड़ा कुछ भी पूछें।",
        placeholder: "कुछ भी पूछें...",
        error: "कनेक्शन त्रुटि।",
        ariaClose: "बंद करें",
        ariaReadAloud: "सुनाएं"
    }
};

// Generates a basic structure for other languages, ensuring all keys exist.
// In a production app, these would be properly translated.
// For this demo, we use English/Hindi hybrid or English values to ensure stability.
const createLang = (name: string, overrides: any = {}) => ({
    ...en,
    header: { title: name },
    login: { ...en.login, title: name },
    ...overrides
});

const translations: { [key in Language]: typeof en } = {
  en: en,
  hi: hi,
  // Marathi
  mr: createLang("किसान साथी (Marathi)", {
      dashboard: { ...en.dashboard, cropAdvice: "शेती सल्ला", pestAdvice: "रोग निदान", weatherUpdate: "हवामान", marketPrices: "बाजार भाव", govtSchemes: "योजना", myAllocations: "वाटप" },
      chatbot: { ...en.chatbot, title: "शेतकरी मित्र AI", greeting: "नमस्कार! मी शेतकरी मित्र आहे. शेतीबद्दल काहीही विचारा." }
  }),
  // Gujarati
  gu: createLang("કિસાન સાથી (Gujarati)", {
      dashboard: { ...en.dashboard, cropAdvice: "ખેતી સલાહ", pestAdvice: "રોગ નિદાન", weatherUpdate: "હવામાન", marketPrices: "બજાર ભાવ", govtSchemes: "યોજનાઓ" },
      chatbot: { ...en.chatbot, title: "કિસાન મિત્ર AI", greeting: "નમસ્તે! હું કિસાન મિત્ર છું." }
  }),
  // Tamil
  ta: createLang("கிசான் சாத்தி (Tamil)", {
      dashboard: { ...en.dashboard, cropAdvice: "விவசாய ஆலோசனை", pestAdvice: "நோய் கண்டறிதல்", weatherUpdate: "வானிலை", marketPrices: "சந்தை விலை" },
      chatbot: { ...en.chatbot, title: "விவசாயி நண்பன் AI", greeting: "வணக்கம்! நான் உங்கள் விவசாய நண்பன்." }
  }),
  // Telugu
  te: createLang("కిసాన్ సాథీ (Telugu)", {
      dashboard: { ...en.dashboard, cropAdvice: "వ్యవసాయ సలహా", pestAdvice: "తెగులు గుర్తింపు", weatherUpdate: "వాతావరణం", marketPrices: "మార్కెట్ ధరలు" },
      chatbot: { ...en.chatbot, title: "రైతు మిత్రుడు AI", greeting: "నమస్కారం! నేను మీ రైతు మిత్రుడిని." }
  }),
  // Bengali
  bn: createLang("কিসান সাথী (Bengali)", {
      dashboard: { ...en.dashboard, cropAdvice: "কৃষি পরামর্শ", pestAdvice: "রোগ নির্ণয়", weatherUpdate: "আবহাওয়া", marketPrices: "বাজার দর" },
      chatbot: { ...en.chatbot, title: "কৃষক বন্ধু AI", greeting: "নমস্কার! আমি কৃষক বন্ধু।" }
  }),
  // Punjabi
  pa: createLang("ਕਿਸਾਨ ਸਾਥੀ (Punjabi)", {
      dashboard: { ...en.dashboard, cropAdvice: "ਖੇਤੀ ਸਲਾਹ", pestAdvice: "ਰੋਗ ਪਛਾਣ", weatherUpdate: "ਮੌਸਮ", marketPrices: "ਮੰਡੀ ਭਾਅ" },
      chatbot: { ...en.chatbot, title: "ਕਿਸਾਨ ਮਿੱਤਰ AI", greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਕਿਸਾਨ ਮਿੱਤਰ ਹਾਂ।" }
  }),
  // Kannada
  kn: createLang("ಕಿಸಾನ್ ಸಾಥಿ (Kannada)", {
      dashboard: { ...en.dashboard, cropAdvice: "ಕೃಷಿ ಸಲಹೆ", pestAdvice: "ರೋಗ ಪತ್ತೆ", weatherUpdate: "ಹವಾಮಾನ", marketPrices: "ಮಾರುಕಟ್ಟೆ ದರ" },
      chatbot: { ...en.chatbot, title: "ರೈತ ಮಿತ್ರ AI", greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ರೈತ ಮಿತ್ರ." }
  }),
  // Malayalam
  ml: createLang("കിസാൻ സാത്തി (Malayalam)", {
      dashboard: { ...en.dashboard, cropAdvice: "കാർഷിക ഉപദേശം", pestAdvice: "രോഗനിർണ്ണയം", weatherUpdate: "കാലാവസ്ഥ", marketPrices: "വിപണി വില" },
      chatbot: { ...en.chatbot, title: "കർഷക മിത്രം AI", greeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ കർഷക മിത്രമാണ്." }
  }),
  // Odia
  or: createLang("କିଷାନ ସାଥୀ (Odia)", {
      dashboard: { ...en.dashboard, cropAdvice: "କୃଷି ପରାମର୍ଶ", pestAdvice: "ରୋଗ ଚିହ୍ନଟ", weatherUpdate: "ପାଣିପାଗ", marketPrices: "ବଜାର ଦର" },
      chatbot: { ...en.chatbot, title: "କିଷାନ ମିତ୍ର AI", greeting: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର କିଷାନ ମିତ୍ର।" }
  }),
  // Bhojpuri
  bho: createLang("किसान साथी (Bhojpuri)", {
      dashboard: { ...en.dashboard, cropAdvice: "खेती सलाह", pestAdvice: "रोग पहचान", weatherUpdate: "मौसम", marketPrices: "बाजार भाव" },
      chatbot: { ...en.chatbot, title: "किसान मित्र AI", greeting: "प्रणाम! हम रउआ के किसान मित्र हईं।" }
  })
};

export default translations;
