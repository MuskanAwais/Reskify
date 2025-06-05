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
    'manageSafetyCompliance': 'Manage your Safe Work Method Statements and safety compliance',
    'draftSwms': 'Draft SWMS',
    'saveCompleteLater': 'Save and complete later',
    'completedSwms': 'Completed SWMS',
    'projectSpecificDocumentation': 'Project-specific documentation',
    'createNewSwms': 'Create New SWMS',
    'quickStart': 'Quick Start',
    'recentSwmsDocuments': 'Recent SWMS Documents',
    'viewAll': 'View All',
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
    'manageSafetyCompliance': '管理您的安全工作方法声明和安全合规性',
    'draftSwms': '草稿SWMS',
    'saveCompleteLater': '保存并稍后完成',
    'completedSwms': '已完成的SWMS',
    'projectSpecificDocumentation': '项目特定文档',
    'createNewSwms': '创建新的SWMS',
    'quickStart': '快速开始',
    'recentSwmsDocuments': '最近的SWMS文档',
    'viewAll': '查看全部',
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
    'manageSafetyCompliance': 'Gestione sus Declaraciones de Método de Trabajo Seguro y cumplimiento de seguridad',
    'draftSwms': 'Borrador SWMS',
    'saveCompleteLater': 'Guardar y completar más tarde',
    'completedSwms': 'SWMS Completados',
    'projectSpecificDocumentation': 'Documentación específica del proyecto',
    'createNewSwms': 'Crear Nuevo SWMS',
    'quickStart': 'Inicio Rápido',
    'recentSwmsDocuments': 'Documentos SWMS Recientes',
    'viewAll': 'Ver Todo',
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