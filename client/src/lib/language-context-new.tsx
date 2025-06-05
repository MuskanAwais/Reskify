import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Language Support
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
];

// Translations object
const translations: Record<string, Record<string, string>> = {
  en: {
    // App Name
    'app.name': 'Riskify',
    'app.tagline': 'Australian SWMS Construction Tool',
    
    // Legal disclaimer section
    'legalDisclaimer': 'Legal Disclaimer',
    'reviewAcceptDisclaimer': 'Review and accept the legal disclaimer and terms',
    'legalDisclaimerTerms': 'Legal Disclaimer and Terms',
    
    // Dashboard
    'startBuildingSwms': 'Start Building Your SWMS',
    'createComprehensiveDocumentation': 'Create comprehensive safety documentation tailored to your industry and project requirements.',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.swms-builder': 'SWMS Builder',
    'nav.my-swms': 'My SWMS',
    'nav.safety-library': 'Safety Library',
    'nav.subscription': 'Subscription',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    
    // Common UI
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.continue': 'Continue',
    'btn.back': 'Back',
    'btn.next': 'Next',
    'btn.finish': 'Finish',
    'btn.edit': 'Edit',
    'btn.delete': 'Delete',
    'btn.add': 'Add',
    'btn.remove': 'Remove',
    'btn.generate': 'Generate SWMS',
    'btn.download': 'Download PDF',
  },
  
  zh: {
    // App Name
    'app.name': 'Riskify',
    'app.tagline': '澳大利亚SWMS建设工具',
    
    // Legal disclaimer section
    'legalDisclaimer': '法律免责声明',
    'reviewAcceptDisclaimer': '审查并接受法律免责声明和条款',
    'legalDisclaimerTerms': '法律免责声明和条款',
    
    // Dashboard
    'startBuildingSwms': '开始构建您的SWMS',
    'createComprehensiveDocumentation': '创建针对您的行业和项目要求的综合安全文档。',
    
    // Navigation
    'nav.dashboard': '仪表板',
    'nav.swms-builder': 'SWMS构建器',
    'nav.my-swms': '我的SWMS',
    'nav.safety-library': '安全资料库',
    'nav.subscription': '订阅',
    'nav.profile': '个人资料',
    'nav.settings': '设置',
    
    // Common UI
    'btn.save': '保存',
    'btn.cancel': '取消',
    'btn.continue': '继续',
    'btn.back': '返回',
    'btn.next': '下一个',
    'btn.finish': '完成',
    'btn.edit': '编辑',
    'btn.delete': '删除',
    'btn.add': '添加',
    'btn.remove': '移除',
    'btn.generate': '生成SWMS',
    'btn.download': '下载PDF',
  },
  
  es: {
    // App Name
    'app.name': 'Riskify',
    'app.tagline': 'Herramienta de Construcción SWMS Australiana',
    
    // Legal disclaimer section
    'legalDisclaimer': 'Descargo de Responsabilidad Legal',
    'reviewAcceptDisclaimer': 'Revisar y aceptar el descargo de responsabilidad legal y los términos',
    'legalDisclaimerTerms': 'Descargo de Responsabilidad Legal y Términos',
    
    // Dashboard
    'startBuildingSwms': 'Comenzar a Construir Su SWMS',
    'createComprehensiveDocumentation': 'Crear documentación de seguridad integral adaptada a los requisitos de su industria y proyecto.',
    
    // Navigation
    'nav.dashboard': 'Panel de Control',
    'nav.swms-builder': 'Constructor SWMS',
    'nav.my-swms': 'Mis SWMS',
    'nav.safety-library': 'Biblioteca de Seguridad',
    'nav.subscription': 'Suscripción',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuraciones',
    
    // Common UI
    'btn.save': 'Guardar',
    'btn.cancel': 'Cancelar',
    'btn.continue': 'Continuar',
    'btn.back': 'Atrás',
    'btn.next': 'Siguiente',
    'btn.finish': 'Finalizar',
    'btn.edit': 'Editar',
    'btn.delete': 'Eliminar',
    'btn.add': 'Agregar',
    'btn.remove': 'Quitar',
    'btn.generate': 'Generar SWMS',
    'btn.download': 'Descargar PDF',
  }
};

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (languageCode: string) => void;
  t: (key: string) => string;
  forceRefresh: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const setLanguage = (languageCode: string) => {
    console.log('Language switching to:', languageCode);
    setCurrentLanguage(languageCode);
    localStorage.setItem('preferred-language', languageCode);
    
    // Force immediate re-render
    setRefreshKey(prev => prev + 1);
    
    // Also trigger document update
    document.documentElement.lang = languageCode;
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: languageCode } 
    }));
  };

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const t = (key: string): string => {
    const translation = translations[currentLanguage]?.[key] || translations['en'][key] || key;
    return translation;
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider 
      value={{ currentLanguage, setLanguage, t, forceRefresh }} 
      key={`lang-${currentLanguage}-${refreshKey}`}
    >
      <div key={`content-${currentLanguage}-${refreshKey}`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}