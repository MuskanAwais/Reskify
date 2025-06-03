export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
];

export const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.swms-builder': 'SWMS Builder',
    'nav.my-swms': 'My SWMS',
    'nav.safety-library': 'Safety Library',
    'nav.subscription': 'Subscription',
    
    // SWMS Builder
    'swms.title': 'SWMS Builder',
    'swms.step1.title': 'Project Details',
    'swms.step1.description': 'Basic project information and trade selection',
    'swms.step2.title': 'Select Activities',
    'swms.step2.description': 'Choose activities from comprehensive task database',
    'swms.step3.title': 'Visual Table Editor',
    'swms.step3.description': 'Interactive risk assessment table with dropdowns and editable cells',
    'swms.step4.title': 'Safety Codes',
    'swms.step4.description': 'Select applicable safety codes and compliance requirements',
    'swms.step5.title': 'Legal Disclaimer',
    'swms.step5.description': 'Accept terms and liability disclaimer',
    'swms.step6.title': 'Final Document',
    'swms.step6.description': 'Generate complete SWMS document',
    
    // Form Fields
    'form.job-name': 'Job Name',
    'form.job-number': 'Job Number',
    'form.project-address': 'Project Address',
    'form.trade-type': 'Trade Type',
    'form.select-trade': 'Select a trade type...',
    
    // Buttons
    'btn.next': 'Next',
    'btn.previous': 'Previous',
    'btn.generate': 'Generate SWMS',
    'btn.download': 'Download PDF',
    'btn.save': 'Save',
    'btn.edit': 'Edit',
    'btn.delete': 'Delete',
    'btn.add': 'Add',
    'btn.voice-input': 'Voice Input',
    
    // Voice Control
    'voice.enable': 'Enable Voice Control',
    'voice.listening': 'Listening...',
    'voice.stopped': 'Voice input stopped',
    'voice.permission-required': 'Microphone permission required',
    'voice.permission-denied': 'Microphone access denied. Please enable in browser settings.',
    'voice.not-supported': 'Voice recognition not supported in this browser',
    
    // Risk Assessment
    'risk.low': 'Low',
    'risk.medium': 'Medium',
    'risk.high': 'High',
    'risk.extreme': 'Extreme',
    'risk.activity': 'Activity',
    'risk.hazards': 'Hazards',
    'risk.initial-risk': 'Initial Risk',
    'risk.control-measures': 'Control Measures',
    'risk.residual-risk': 'Residual Risk',
    'risk.responsible': 'Responsible',
    'risk.ppe': 'PPE Required',
    'risk.standards': 'Australian Standards',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close'
  },
  
  zh: {
    // Navigation
    'nav.dashboard': '仪表板',
    'nav.swms-builder': 'SWMS构建器',
    'nav.my-swms': '我的SWMS',
    'nav.safety-library': '安全库',
    'nav.subscription': '订阅',
    
    // SWMS Builder
    'swms.title': 'SWMS构建器',
    'swms.step1.title': '项目详情',
    'swms.step1.description': '基本项目信息和行业选择',
    'swms.step2.title': '选择活动',
    'swms.step2.description': '从综合任务数据库中选择活动',
    'swms.step3.title': '可视化表格编辑器',
    'swms.step3.description': '交互式风险评估表格，包含下拉菜单和可编辑单元格',
    'swms.step4.title': '安全代码',
    'swms.step4.description': '选择适用的安全代码和合规要求',
    'swms.step5.title': '法律免责声明',
    'swms.step5.description': '接受条款和责任免责声明',
    'swms.step6.title': '最终文档',
    'swms.step6.description': '生成完整的SWMS文档',
    
    // Form Fields
    'form.job-name': '工作名称',
    'form.job-number': '工作编号',
    'form.project-address': '项目地址',
    'form.trade-type': '行业类型',
    'form.select-trade': '选择行业类型...',
    
    // Buttons
    'btn.next': '下一步',
    'btn.previous': '上一步',
    'btn.generate': '生成SWMS',
    'btn.download': '下载PDF',
    'btn.save': '保存',
    'btn.edit': '编辑',
    'btn.delete': '删除',
    'btn.add': '添加',
    'btn.voice-input': '语音输入',
    
    // Voice Control
    'voice.enable': '启用语音控制',
    'voice.listening': '正在听取...',
    'voice.stopped': '语音输入已停止',
    'voice.permission-required': '需要麦克风权限',
    'voice.permission-denied': '麦克风访问被拒绝。请在浏览器设置中启用。',
    'voice.not-supported': '此浏览器不支持语音识别',
    
    // Risk Assessment
    'risk.low': '低',
    'risk.medium': '中等',
    'risk.high': '高',
    'risk.extreme': '极高',
    'risk.activity': '活动',
    'risk.hazards': '危险',
    'risk.initial-risk': '初始风险',
    'risk.control-measures': '控制措施',
    'risk.residual-risk': '剩余风险',
    'risk.responsible': '负责人',
    'risk.ppe': '所需PPE',
    'risk.standards': '澳大利亚标准',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.close': '关闭'
  },
  
  es: {
    // Navigation
    'nav.dashboard': 'Panel de Control',
    'nav.swms-builder': 'Constructor SWMS',
    'nav.my-swms': 'Mis SWMS',
    'nav.safety-library': 'Biblioteca de Seguridad',
    'nav.subscription': 'Suscripción',
    
    // SWMS Builder
    'swms.title': 'Constructor SWMS',
    'swms.step1.title': 'Detalles del Proyecto',
    'swms.step1.description': 'Información básica del proyecto y selección de oficio',
    'swms.step2.title': 'Seleccionar Actividades',
    'swms.step2.description': 'Elegir actividades de la base de datos de tareas completa',
    'swms.step3.title': 'Editor de Tabla Visual',
    'swms.step3.description': 'Tabla de evaluación de riesgos interactiva con menús desplegables y celdas editables',
    'swms.step4.title': 'Códigos de Seguridad',
    'swms.step4.description': 'Seleccionar códigos de seguridad y requisitos de cumplimiento aplicables',
    'swms.step5.title': 'Descargo Legal',
    'swms.step5.description': 'Aceptar términos y descargo de responsabilidad',
    'swms.step6.title': 'Documento Final',
    'swms.step6.description': 'Generar documento SWMS completo',
    
    // Form Fields
    'form.job-name': 'Nombre del Trabajo',
    'form.job-number': 'Número de Trabajo',
    'form.project-address': 'Dirección del Proyecto',
    'form.trade-type': 'Tipo de Oficio',
    'form.select-trade': 'Seleccionar tipo de oficio...',
    
    // Buttons
    'btn.next': 'Siguiente',
    'btn.previous': 'Anterior',
    'btn.generate': 'Generar SWMS',
    'btn.download': 'Descargar PDF',
    'btn.save': 'Guardar',
    'btn.edit': 'Editar',
    'btn.delete': 'Eliminar',
    'btn.add': 'Agregar',
    'btn.voice-input': 'Entrada de Voz',
    
    // Voice Control
    'voice.enable': 'Habilitar Control de Voz',
    'voice.listening': 'Escuchando...',
    'voice.stopped': 'Entrada de voz detenida',
    'voice.permission-required': 'Permiso de micrófono requerido',
    'voice.permission-denied': 'Acceso al micrófono denegado. Por favor, habilitar en la configuración del navegador.',
    'voice.not-supported': 'Reconocimiento de voz no compatible con este navegador',
    
    // Risk Assessment
    'risk.low': 'Bajo',
    'risk.medium': 'Medio',
    'risk.high': 'Alto',
    'risk.extreme': 'Extremo',
    'risk.activity': 'Actividad',
    'risk.hazards': 'Peligros',
    'risk.initial-risk': 'Riesgo Inicial',
    'risk.control-measures': 'Medidas de Control',
    'risk.residual-risk': 'Riesgo Residual',
    'risk.responsible': 'Responsable',
    'risk.ppe': 'EPP Requerido',
    'risk.standards': 'Estándares Australianos',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.close': 'Cerrar'
  }
};

export function useTranslation(language: string = 'en') {
  const t = (key: string): string => {
    const lang = translations[language as keyof typeof translations] || translations.en;
    return lang[key as keyof typeof lang] || key;
  };

  return { t };
}