import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Check } from "lucide-react";
import { SUPPORTED_LANGUAGES, useTranslation, type Language } from "@/lib/i18n";

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
  compact?: boolean;
}

export default function LanguageSelector({ 
  currentLanguage, 
  onLanguageChange, 
  className = "",
  compact = false
}: LanguageSelectorProps) {
  const { t } = useTranslation(currentLanguage);
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  if (compact) {
    return (
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className={`w-[140px] ${className}`}>
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-sm">{currentLang.flag}</span>
              <span className="hidden sm:inline text-sm">{currentLang.name}</span>
              <span className="sm:hidden text-xs">{currentLang.code.toUpperCase()}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.name}</span>
                {language.code === currentLanguage && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="font-medium text-sm">Language</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {SUPPORTED_LANGUAGES.length} languages
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {SUPPORTED_LANGUAGES.map((language) => (
            <Button
              key={language.code}
              variant={language.code === currentLanguage ? "default" : "outline"}
              size="sm"
              className="justify-start text-left h-auto py-2 px-3"
              onClick={() => onLanguageChange(language.code)}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-base">{language.flag}</span>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium">{language.name}</span>
                  <span className="text-xs opacity-60">{language.code.toUpperCase()}</span>
                </div>
                {language.code === currentLanguage && (
                  <Check className="w-3 h-3 text-green-500 ml-auto" />
                )}
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          Select your preferred language for the interface
        </div>
      </CardContent>
    </Card>
  );
}