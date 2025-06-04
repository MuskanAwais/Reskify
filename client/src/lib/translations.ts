// Translation system for multi-language support
export const translations = {
  en: {
    // Header
    "Safety Sensei": "Safety Sensei",
    "Dashboard": "Dashboard",
    "My SWMS": "My SWMS", 
    "Safety Library": "Safety Library",
    "Team": "Team",
    "Analytics": "Analytics",
    "Account": "Account",
    "Quick Actions": "Quick Actions",
    "Create New SWMS": "Create New SWMS",
    "View Recent": "View Recent",
    "Search Library": "Search Library",
    
    // SWMS Builder
    "SWMS Builder": "SWMS Builder",
    "Project Information": "Project Information",
    "Job Name": "Job Name",
    "Job Number": "Job Number", 
    "Project Address": "Project Address",
    "Project Location": "Project Location",
    "Trade Type": "Trade Type",
    "Select Activities": "Select Activities",
    "Tasks Selected": "Tasks Selected",
    "Demo Mode - 2 Tasks Max": "Demo Mode - 2 Tasks Max",
    "Search Activities": "Search Activities",
    "Generate SWMS": "Generate SWMS",
    
    // Common
    "Save": "Save",
    "Cancel": "Cancel",
    "Continue": "Continue",
    "Back": "Back",
    "Next": "Next",
    "Finish": "Finish",
    "Close": "Close",
    "Edit": "Edit",
    "Delete": "Delete",
    "Add": "Add",
    "Remove": "Remove",
    "Search": "Search",
    "Filter": "Filter",
    "Sort": "Sort",
    "Export": "Export",
    "Import": "Import",
    "Print": "Print",
    "Download": "Download",
    "Upload": "Upload",
    "Select": "Select",
    "Deselect": "Deselect",
    "Select All": "Select All",
    "Clear All": "Clear All",
    "Loading": "Loading",
    "Error": "Error",
    "Success": "Success",
    "Warning": "Warning",
    "Info": "Info",
  },
  es: {
    // Header
    "Safety Sensei": "Safety Sensei",
    "Dashboard": "Panel de Control",
    "My SWMS": "Mis SWMS",
    "Safety Library": "Biblioteca de Seguridad", 
    "Team": "Equipo",
    "Analytics": "Análisis",
    "Account": "Cuenta",
    "Quick Actions": "Acciones Rápidas",
    "Create New SWMS": "Crear Nuevo SWMS",
    "View Recent": "Ver Recientes",
    "Search Library": "Buscar Biblioteca",
    
    // SWMS Builder
    "SWMS Builder": "Constructor SWMS",
    "Project Information": "Información del Proyecto",
    "Job Name": "Nombre del Trabajo",
    "Job Number": "Número de Trabajo",
    "Project Address": "Dirección del Proyecto", 
    "Project Location": "Ubicación del Proyecto",
    "Trade Type": "Tipo de Oficio",
    "Select Activities": "Seleccionar Actividades",
    "Tasks Selected": "Tareas Seleccionadas",
    "Demo Mode - 2 Tasks Max": "Modo Demo - Máx 2 Tareas",
    "Search Activities": "Buscar Actividades",
    "Generate SWMS": "Generar SWMS",
    
    // Common
    "Save": "Guardar",
    "Cancel": "Cancelar",
    "Continue": "Continuar",
    "Back": "Atrás",
    "Next": "Siguiente",
    "Finish": "Finalizar",
    "Close": "Cerrar",
    "Edit": "Editar",
    "Delete": "Eliminar",
    "Add": "Agregar",
    "Remove": "Quitar",
    "Search": "Buscar",
    "Filter": "Filtrar",
    "Sort": "Ordenar",
    "Export": "Exportar",
    "Import": "Importar",
    "Print": "Imprimir",
    "Download": "Descargar",
    "Upload": "Subir",
    "Select": "Seleccionar",
    "Deselect": "Deseleccionar",
    "Select All": "Seleccionar Todo",
    "Clear All": "Limpiar Todo",
    "Loading": "Cargando",
    "Error": "Error",
    "Success": "Éxito",
    "Warning": "Advertencia",
    "Info": "Información",
  },
  fr: {
    // Header
    "Safety Sensei": "Safety Sensei",
    "Dashboard": "Tableau de Bord",
    "My SWMS": "Mes SWMS",
    "Safety Library": "Bibliothèque de Sécurité",
    "Team": "Équipe", 
    "Analytics": "Analyses",
    "Account": "Compte",
    "Quick Actions": "Actions Rapides",
    "Create New SWMS": "Créer Nouveau SWMS",
    "View Recent": "Voir Récents",
    "Search Library": "Rechercher Bibliothèque",
    
    // SWMS Builder
    "SWMS Builder": "Constructeur SWMS",
    "Project Information": "Informations du Projet",
    "Job Name": "Nom du Travail",
    "Job Number": "Numéro de Travail",
    "Project Address": "Adresse du Projet",
    "Project Location": "Localisation du Projet", 
    "Trade Type": "Type de Métier",
    "Select Activities": "Sélectionner Activités",
    "Tasks Selected": "Tâches Sélectionnées",
    "Demo Mode - 2 Tasks Max": "Mode Démo - Max 2 Tâches",
    "Search Activities": "Rechercher Activités",
    "Generate SWMS": "Générer SWMS",
    
    // Common
    "Save": "Enregistrer",
    "Cancel": "Annuler",
    "Continue": "Continuer",
    "Back": "Retour",
    "Next": "Suivant", 
    "Finish": "Terminer",
    "Close": "Fermer",
    "Edit": "Modifier",
    "Delete": "Supprimer",
    "Add": "Ajouter",
    "Remove": "Retirer",
    "Search": "Rechercher",
    "Filter": "Filtrer",
    "Sort": "Trier",
    "Export": "Exporter",
    "Import": "Importer",
    "Print": "Imprimer",
    "Download": "Télécharger",
    "Upload": "Téléverser",
    "Select": "Sélectionner",
    "Deselect": "Désélectionner",
    "Select All": "Tout Sélectionner",
    "Clear All": "Tout Effacer",
    "Loading": "Chargement",
    "Error": "Erreur",
    "Success": "Succès",
    "Warning": "Avertissement",
    "Info": "Information",
  }
};

// Translation hook
export function useTranslation() {
  const getStoredLanguage = () => {
    try {
      return localStorage.getItem("selectedLanguage") || "en";
    } catch {
      return "en";
    }
  };

  const currentLanguage = getStoredLanguage();

  const t = (key: string): string => {
    const languageTranslations = translations[currentLanguage as keyof typeof translations] || translations.en;
    return languageTranslations[key as keyof typeof languageTranslations] || key;
  };

  return { t, currentLanguage };
}