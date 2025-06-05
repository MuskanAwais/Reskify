import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/lib/language-context";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴" },
];

const translations = {
  en: {
    selectLanguage: "Select Language",
    currentLanguage: "Current Language",
  },
  es: {
    selectLanguage: "Seleccionar Idioma",
    currentLanguage: "Idioma Actual",
  },
  fr: {
    selectLanguage: "Sélectionner la Langue",
    currentLanguage: "Langue Actuelle",
  },
  de: {
    selectLanguage: "Sprache Auswählen",
    currentLanguage: "Aktuelle Sprache",
  },
  it: {
    selectLanguage: "Seleziona Lingua",
    currentLanguage: "Lingua Corrente",
  },
  pt: {
    selectLanguage: "Selecionar Idioma",
    currentLanguage: "Idioma Atual",
  },
  zh: {
    selectLanguage: "选择语言",
    currentLanguage: "当前语言",
  },
  ja: {
    selectLanguage: "言語を選択",
    currentLanguage: "現在の言語",
  },
  ko: {
    selectLanguage: "언어 선택",
    currentLanguage: "현재 언어",
  },
  ar: {
    selectLanguage: "اختر اللغة",
    currentLanguage: "اللغة الحالية",
  },
  ru: {
    selectLanguage: "Выбрать Язык",
    currentLanguage: "Текущий Язык",
  },
  hi: {
    selectLanguage: "भाषा चुनें",
    currentLanguage: "वर्तमान भाषा",
  },
  nl: {
    selectLanguage: "Taal Selecteren",
    currentLanguage: "Huidige Taal",
  },
  sv: {
    selectLanguage: "Välj Språk",
    currentLanguage: "Nuvarande Språk",
  },
  no: {
    selectLanguage: "Velg Språk",
    currentLanguage: "Gjeldende Språk",
  },
};

export default function ComprehensiveLanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem("selectedLanguage", languageCode);
    document.documentElement.lang = languageCode;
    
    // Apply RTL for Arabic
    if (languageCode === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }

    // Trigger a page reload to apply language changes
    window.location.reload();
  };

  const getCurrentLanguageData = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  const getCurrentTranslations = () => {
    return translations[currentLanguage as keyof typeof translations] || translations.en;
  };

  const currentLang = getCurrentLanguageData();
  const t = getCurrentTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden sm:inline text-sm">{currentLang.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          {t.selectLanguage}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{language.name}</span>
                  <span className="text-xs text-muted-foreground">{language.nativeName}</span>
                </div>
              </div>
              {currentLanguage === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}