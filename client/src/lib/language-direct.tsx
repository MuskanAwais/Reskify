// Direct language switching without complex context
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export const TRANSLATIONS = {
  en: {
    'legalDisclaimer': 'Legal Disclaimer',
    'reviewAcceptDisclaimer': 'Review and accept the legal disclaimer and terms',
    'startBuildingSwms': 'Start Building Your SWMS',
    'createComprehensiveDocumentation': 'Create comprehensive safety documentation tailored to your industry and project requirements.',
    'quickActions': 'Quick Actions',
    'nav.dashboard': 'Dashboard',
    'nav.swms-builder': 'SWMS Builder',
    'nav.ai-generator': 'AI SWMS Generator',
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
    'quickActions': '快捷操作',
    'nav.dashboard': '仪表板',
    'nav.swms-builder': 'SWMS构建器',
    'nav.ai-generator': 'AI SWMS生成器',
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
    'quickActions': 'Acciones Rápidas',
    'nav.dashboard': 'Panel de Control',
    'nav.swms-builder': 'Constructor SWMS',
    'nav.ai-generator': 'Generador AI SWMS',
    'nav.my-swms': 'Mis SWMS',
    'nav.safety-library': 'Biblioteca de Seguridad',
    'btn.save': 'Guardar',
    'btn.cancel': 'Cancelar',
    'btn.next': 'Siguiente',
    'btn.generate': 'Generar SWMS',
  }
};

// Global language state
let currentLang = 'en';

export function getCurrentLanguage(): string {
  return currentLang;
}

export function setLanguage(lang: string): void {
  currentLang = lang;
  localStorage.setItem('app-language', lang);
  window.location.reload(); // Force page refresh to apply translations
}

export function translate(key: string): string {
  const langTranslations = TRANSLATIONS[currentLang as keyof typeof TRANSLATIONS];
  return (langTranslations as any)?.[key] || (TRANSLATIONS.en as any)[key] || key;
}

// Initialize language from localStorage
try {
  const saved = localStorage.getItem('app-language');
  if (saved && LANGUAGES.find(l => l.code === saved)) {
    currentLang = saved;
  }
} catch {
  currentLang = 'en';
}