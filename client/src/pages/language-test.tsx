import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES } from '@/lib/language-context';

export default function LanguageTest() {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Automatically test language switching
    const testLanguages = async () => {
      const results = [];
      
      // Test English
      setLanguage('en');
      await new Promise(resolve => setTimeout(resolve, 500));
      results.push(`English: ${t('legalDisclaimer')}`);
      
      // Test Chinese
      setLanguage('zh');
      await new Promise(resolve => setTimeout(resolve, 500));
      results.push(`Chinese: ${t('legalDisclaimer')}`);
      
      // Test Spanish
      setLanguage('es');
      await new Promise(resolve => setTimeout(resolve, 500));
      results.push(`Spanish: ${t('legalDisclaimer')}`);
      
      setTestResults(results);
    };

    testLanguages();
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Language Switching Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Language: {currentLanguage}</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {SUPPORTED_LANGUAGES.slice(0, 6).map((lang) => (
                <Button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  variant={currentLanguage === lang.code ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold">Translation Test Results:</h4>
              
              <div className="space-y-2">
                <p><strong>Legal Disclaimer:</strong> {t('legalDisclaimer')}</p>
                <p><strong>Review Accept Disclaimer:</strong> {t('reviewAcceptDisclaimer')}</p>
                <p><strong>Start Building SWMS:</strong> {t('startBuildingSwms')}</p>
                <p><strong>Create Documentation:</strong> {t('createComprehensiveDocumentation')}</p>
              </div>

              <div className="mt-4">
                <h5 className="font-medium">Navigation Translations:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Dashboard: {t('nav.dashboard')}</li>
                  <li>SWMS Builder: {t('nav.swms-builder')}</li>
                  <li>Safety Library: {t('nav.safety-library')}</li>
                </ul>
              </div>

              <div className="mt-4">
                <h5 className="font-medium">Button Translations:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Save: {t('btn.save')}</li>
                  <li>Cancel: {t('btn.cancel')}</li>
                  <li>Next: {t('btn.next')}</li>
                </ul>
              </div>
            </div>

            {testResults.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium mb-2">Automated Test Results:</h5>
                {testResults.map((result, index) => (
                  <p key={index} className="text-sm">{result}</p>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}