
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import translations, { Language, supportedLanguages } from '../translations';
import { useAuth } from './AuthContext';

// Helper to get nested translation values safely
const getNestedTranslation = (obj: any, path: string): string | undefined => {
  if (!obj) return undefined;
  return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
};

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  supportedLanguages: typeof supportedLanguages;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUserProfile } = useAuth();
  
  const [language, setLanguageState] = useState<Language>(() => {
    // Priority: User Profile > Local Storage > Default (en)
    if (user?.role === 'farmer' && user.profile.preferredLanguage) {
      // Validate that the profile language exists in our supported list
      if (supportedLanguages.some(l => l.code === user.profile.preferredLanguage)) {
        return user.profile.preferredLanguage;
      }
    }
    const storedLang = localStorage.getItem('app-language');
    if (storedLang && supportedLanguages.some(l => l.code === storedLang)) {
        return storedLang as Language;
    }
    return 'en';
  });

  // Sync language from user profile when user logs in or profile changes
  useEffect(() => {
    if (user?.role === 'farmer' && user.profile.preferredLanguage) {
      if (language !== user.profile.preferredLanguage && supportedLanguages.some(l => l.code === user.profile.preferredLanguage)) {
        setLanguageState(user.profile.preferredLanguage);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang); 
    // Persist to backend/profile if logged in
    if (user?.role === 'farmer' && user.profile.preferredLanguage !== lang) {
      updateUserProfile({ preferredLanguage: lang });
    }
  }, [user, updateUserProfile]);
  
  const t = useCallback((key: string): string => {
    const langTranslations = translations[language];
    let translation = getNestedTranslation(langTranslations, key);
    
    // Fallback Rule: If translation is missing in selected language, use English safely.
    // This prevents the UI from breaking or showing raw keys (e.g. "dashboard.title").
    if (!translation && language !== 'en') {
      const fallbackTranslations = translations.en;
      translation = getNestedTranslation(fallbackTranslations, key);
    }
    
    // Final fallback to the key itself if absolutely everything fails
    return translation || key;
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t, supportedLanguages }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
