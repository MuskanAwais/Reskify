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

// Using language data and translations from context

export default function ComprehensiveLanguageSwitcher() {
  const { currentLanguage, setLanguage, t } = useLanguage();
  
  const handleLanguageChange = (languageCode: string) => {
    console.log('Language changing to:', languageCode);
    setLanguage(languageCode);
    document.documentElement.lang = languageCode;
    
    // Force page refresh to ensure translations apply
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    // Apply RTL for Arabic
    if (languageCode === "ar") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  };

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden sm:inline text-sm">{currentLang.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          Select Language
        </div>
        <div className="max-h-80 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{language.name}</span>
                  <span className="text-xs text-muted-foreground">{language.name}</span>
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