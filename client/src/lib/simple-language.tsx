import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Simple language data
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

// Simple translations
const TRANSLATIONS = {
  en: {
    'legalDisclaimer': 'Legal Disclaimer',
    'reviewAcceptDisclaimer': 'Review and accept the legal disclaimer and terms',
    'startBuildingSwms': 'Start Building Your SWMS',
    'createComprehensiveDocumentation': 'Create comprehensive safety documentation tailored to your industry and project requirements.',
    'nav.dashboard': 'Dashboard',
    'nav.swms-builder': 'SWMS Builder',
    'nav.my-swms': 'My SWMS',
    'nav.safety-library': 'Safety Library',
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.next': 'Next',
    'btn.generate': 'Generate SWMS',
  },
  zh: {
    'legalDisclaimer': '法律免责声明',
    'reviewAcceptDisclaimer': '审查并接受法律免责声明和条款',
    'startBuildingSwms': '开始构建您的SWMS',
    'createComprehensiveDocumentation': '创建针对您的行业和项目要求的综合安全文档。',
    'nav.dashboard': '仪表板',
    'nav.swms-builder': 'SWMS构建器',
    'nav.my-swms': '我的SWMS',
    'nav.safety-library': '安全资料库',
    'btn.save': '保存',
    'btn.cancel': '取消',
    'btn.next': '下一个',
    'btn.generate': '生成SWMS',
  },
  es: {
    'legalDisclaimer': 'Descargo de Responsabilidad Legal',
    'reviewAcceptDisclaimer': 'Revisar y aceptar el descargo de responsabilidad legal y los términos',
    'startBuildingSwms': 'Comenzar a Construir Su SWMS',
    'createComprehensiveDocumentation': 'Crear documentación de seguridad integral adaptada a los requisitos de su industria y proyecto.',
    'nav.dashboard': 'Panel de Control',
    'nav.swms-builder': 'Constructor SWMS',
    'nav.my-swms': 'Mis SWMS',
    'nav.safety-library': 'Biblioteca de Seguridad',
    'btn.save': 'Guardar',
    'btn.cancel': 'Cancelar',
    'btn.next': 'Siguiente',
    'btn.generate': 'Generar SWMS',
  }
};

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function SimpleLanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [, forceUpdate] = useState({});

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('app-language', lang);
    // Force all components to re-render
    forceUpdate({});
    // Also trigger a page refresh to ensure all translations update
    setTimeout(() => window.location.reload(), 50);
  };

  const t = (key: string): string => {
    return TRANSLATIONS[currentLanguage as keyof typeof TRANSLATIONS]?.[key] || 
           TRANSLATIONS.en[key] || 
           key;
  };

  useEffect(() => {
    const saved = localStorage.getItem('app-language');
    if (saved && LANGUAGES.find(l => l.code === saved)) {
      setCurrentLanguage(saved);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useSimpleLanguage = () => useContext(LanguageContext);
export const SUPPORTED_LANGUAGES = LANGUAGES;