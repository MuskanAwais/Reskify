import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LANGUAGES, getCurrentLanguage, setLanguage, translate } from '@/lib/language-direct';

export default function LanguageDemo() {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const handleLanguageSwitch = (langCode: string) => {
    setLanguage(langCode);
  };

  // Update current language display when it changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLang(getCurrentLanguage());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Language Switching Demonstration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Language: {currentLang}</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {LANGUAGES.map((lang) => (
                <Button
                  key={lang.code}
                  onClick={() => handleLanguageSwitch(lang.code)}
                  variant={currentLang === lang.code ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold">Live Translation Results:</h4>
              
              <div className="space-y-2">
                <p><strong>Legal Disclaimer:</strong> {translate('legalDisclaimer')}</p>
                <p><strong>Review Accept Disclaimer:</strong> {translate('reviewAcceptDisclaimer')}</p>
                <p><strong>Start Building SWMS:</strong> {translate('startBuildingSwms')}</p>
                <p><strong>Create Documentation:</strong> {translate('createComprehensiveDocumentation')}</p>
              </div>

              <div className="mt-4">
                <h5 className="font-medium">Navigation Translations:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Dashboard: {translate('nav.dashboard')}</li>
                  <li>SWMS Builder: {translate('nav.swms-builder')}</li>
                  <li>Safety Library: {translate('nav.safety-library')}</li>
                </ul>
              </div>

              <div className="mt-4">
                <h5 className="font-medium">Button Translations:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Save: {translate('btn.save')}</li>
                  <li>Cancel: {translate('btn.cancel')}</li>
                  <li>Next: {translate('btn.next')}</li>
                  <li>Generate: {translate('btn.generate')}</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">
                Language switching is working! Click any language button above to see the translations change.
                The page will refresh automatically to apply changes throughout the application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}