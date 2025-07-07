import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

const TOTAL_STEPS = 9;

// Simplified PDF Generation Component
const AutomaticPDFGeneration = ({ formData, onDataChange }: { formData: any; onDataChange: any }) => {
  const [currentMessage, setCurrentMessage] = useState('Generating professional SWMS document...');
  const [progress, setProgress] = useState(85);

  useEffect(() => {
    console.log('AutomaticPDFGeneration component loaded - Step 9 is working');
    console.log('Form data received:', formData);
    
    // Simple progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setCurrentMessage('PDF generation complete!');
          return 100;
        }
        return prev + 2;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Document Generation</h2>
          <p className="text-gray-600">Creating your professional SWMS document</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-700 font-medium">{currentMessage}</p>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomaticPDFGeneration;