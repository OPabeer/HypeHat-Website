import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

// Define the structure of your translation files.
// Using 'any' for simplicity, but you could create a deep type definition.

type Language = 'en' | 'bn';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, ...args: any[]) => any;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error("useI18n must be used within an I18nProvider");
    return context;
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const storedLang = localStorage.getItem('language');
        return (storedLang === 'en' || storedLang === 'bn') ? storedLang : 'en';
    });
    
    const [translations, setTranslations] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const [enResponse, bnResponse] = await Promise.all([
                    fetch('/locales/en.json'),
                    fetch('/locales/bn.json')
                ]);
                const en = await enResponse.json();
                const bn = await bnResponse.json();
                setTranslations({ en, bn });
            } catch (error) {
                console.error("Failed to load translation files:", error);
            }
        };
        loadTranslations();
    }, []);


    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
    }, [language]);

    const t = useCallback((key: string, ...args: any[]): any => {
        if (!translations.en) return key; // Return key if not loaded
        
        const keys = key.split('.');
        let result: any = translations[language];
        
        try {
            for (const k of keys) {
                result = result[k];
            }

            if (result === undefined) {
                // Fallback to English if key not found in current language
                let fallbackResult: any = translations['en'];
                for (const fk of keys) {
                    fallbackResult = fallbackResult[fk];
                }
                 if (fallbackResult === undefined) return key; // Return key if not found in english either
                 result = fallbackResult;
            }
        
            if (typeof result === 'string' && args.length > 0) {
            return result.replace(/{(\d+)}/g, (match, number) => 
                typeof args[number] !== 'undefined'
                ? args[number]
                : match
            );
            }

            return result;
        } catch (e) {
            return key;
        }
    }, [language, translations]);

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
};
