import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check, Loader2 } from "lucide-react";
import { LANGUAGES, getCurrentLanguage, setLanguage } from "@/lib/language-direct";

export default function SimpleLanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    console.log('Switching language to:', languageCode);
    setIsLoading(true);
    
    // Add a small delay to show loading state
    setTimeout(() => {
      setLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setIsLoading(false);
    }, 300);
  };

  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{isLoading ? "Loading..." : currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}