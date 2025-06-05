import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Enhanced translation system with more comprehensive translations
const translations = {
  en: {
    // App Name
    'app.name': 'Riskify',
    'app.tagline': 'SWMS Builder for Australia',
    
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
    
    // SWMS Builder
    'swms.title': 'SWMS Builder',
    'swms.project-info': 'Project Information',
    'swms.activities': 'Select Activities',
    'swms.risk-assessment': 'Risk Assessment',
    'swms.safety-codes': 'Safety Codes',
    
    // Form Fields
    'form.job-name': 'Job Name',
    'form.project-address': 'Project Address',
    'form.trade-type': 'Trade Type',
    'form.principal-contractor': 'Principal Contractor',
    
    // Language Selector
    'language.select': 'Select Language',
    'language.current': 'Current Language',
    'language.apply': 'Apply Language',
    
    // Status Messages
    'status.loading': 'Loading...',
    'status.error': 'Error',
    'status.success': 'Success',
    'status.saved': 'Saved successfully',
    
    // Safety Library
    'safety.library': 'Safety Library',
    'safety.search': 'Search safety documents',
    'safety.filter': 'Filter by category',
    
    // Demo Mode
    'demo.mode': 'Demo Mode',
    'demo.limited': 'Limited to 2 tasks',
    'demo.upgrade': 'Upgrade for unlimited access'
  },
  
  es: {
    // App Name
    'app.name': 'Riskify',
    'app.tagline': 'Constructor de SWMS para Australia',
    
    // Navigation
    'nav.dashboard': 'Tablero',
    'nav.swms-builder': 'Constructor SWMS',
    'nav.my-swms': 'Mis SWMS',
    'nav.safety-library': 'Biblioteca de Seguridad',
    'nav.subscription': 'Suscripción',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    
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
    
    // SWMS Builder
    'swms.title': 'Constructor SWMS',
    'swms.project-info': 'Información del Proyecto',
    'swms.activities': 'Seleccionar Actividades',
    'swms.risk-assessment': 'Evaluación de Riesgos',
    'swms.safety-codes': 'Códigos de Seguridad',
    
    // Form Fields
    'form.job-name': 'Nombre del Trabajo',
    'form.project-address': 'Dirección del Proyecto',
    'form.trade-type': 'Tipo de Oficio',
    'form.principal-contractor': 'Contratista Principal',
    
    // Language Selector
    'language.select': 'Seleccionar Idioma',
    'language.current': 'Idioma Actual',
    'language.apply': 'Aplicar Idioma',
    
    // Status Messages
    'status.loading': 'Cargando...',
    'status.error': 'Error',
    'status.success': 'Éxito',
    'status.saved': 'Guardado exitosamente',
    
    // Safety Library
    'safety.library': 'Biblioteca de Seguridad',
    'safety.search': 'Buscar documentos de seguridad',
    'safety.filter': 'Filtrar por categoría',
    
    // Demo Mode
    'demo.mode': 'Modo Demo',
    'demo.limited': 'Limitado a 2 tareas',
    'demo.upgrade': 'Actualizar para acceso ilimitado'
  },
  
  zh: {
    // App Name
    'app.name': 'Riskify',
    'app.tagline': '澳大利亚SWMS建设工具',
    
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
    
    // SWMS Builder
    'swms.title': 'SWMS构建器',
    'swms.project-info': '项目信息',
    'swms.activities': '选择活动',
    'swms.risk-assessment': '风险评估',
    'swms.safety-codes': '安全代码',
    
    // Form Fields
    'form.job-name': '工作名称',
    'form.project-address': '项目地址',
    'form.trade-type': '贸易类型',
    'form.principal-contractor': '主要承包商',
    
    // Language Selector
    'language.select': '选择语言',
    'language.current': '当前语言',
    'language.apply': '应用语言',
    
    // Status Messages
    'status.loading': '加载中...',
    'status.error': '错误',
    'status.success': '成功',
    'status.saved': '保存成功',
    
    // Safety Library
    'safety.library': '安全资料库',
    'safety.search': '搜索安全文档',
    'safety.filter': '按类别筛选',
    
    // Demo Mode
    'demo.mode': '演示模式',
    'demo.limited': '限制为2个任务',
    'demo.upgrade': '升级以获得无限访问'
  },
  
  fr: {
    // App Name
    'app.name': 'Riskify',
    'app.tagline': 'Constructeur SWMS pour l\'Australie',
    
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.swms-builder': 'Constructeur SWMS',
    'nav.my-swms': 'Mes SWMS',
    'nav.safety-library': 'Bibliothèque de sécurité',
    'nav.subscription': 'Abonnement',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    
    // Common UI
    'btn.save': 'Enregistrer',
    'btn.cancel': 'Annuler',
    'btn.continue': 'Continuer',
    'btn.back': 'Retour',
    'btn.next': 'Suivant',
    'btn.finish': 'Terminer',
    'btn.edit': 'Modifier',
    'btn.delete': 'Supprimer',
    'btn.add': 'Ajouter',
    'btn.remove': 'Retirer',
    'btn.generate': 'Générer SWMS',
    'btn.download': 'Télécharger PDF',
    
    // SWMS Builder
    'swms.title': 'Constructeur SWMS',
    'swms.project-info': 'Informations du projet',
    'swms.activities': 'Sélectionner les activités',
    'swms.risk-assessment': 'Évaluation des risques',
    'swms.safety-codes': 'Codes de sécurité',
    
    // Form Fields
    'form.job-name': 'Nom du travail',
    'form.project-address': 'Adresse du projet',
    'form.trade-type': 'Type de métier',
    'form.principal-contractor': 'Entrepreneur principal',
    
    // Language Selector
    'language.select': 'Sélectionner la langue',
    'language.current': 'Langue actuelle',
    'language.apply': 'Appliquer la langue',
    
    // Status Messages
    'status.loading': 'Chargement...',
    'status.error': 'Erreur',
    'status.success': 'Succès',
    'status.saved': 'Enregistré avec succès',
    
    // Safety Library
    'safety.library': 'Bibliothèque de sécurité',
    'safety.search': 'Rechercher des documents de sécurité',
    'safety.filter': 'Filtrer par catégorie',
    
    // Demo Mode
    'demo.mode': 'Mode démo',
    'demo.limited': 'Limité à 2 tâches',
    'demo.upgrade': 'Mettre à niveau pour un accès illimité'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem('selectedLanguage') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    try {
      localStorage.setItem('selectedLanguage', language);
      // Trigger custom event for real-time updates
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
      // Force re-render for immediate UI updates
      window.location.reload();
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const t = (key: string): string => {
    const lang = translations[currentLanguage as keyof typeof translations] || translations.en;
    return lang[key as keyof typeof lang] || key;
  };

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' }
];