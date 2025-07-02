import { Loader2, FileText, Download, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface PDFLoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'loading' | 'success' | 'error';
  error?: string;
  fileName?: string;
  onRetry?: () => void;
}

export function PDFLoadingModal({ 
  isOpen, 
  onClose, 
  status, 
  error, 
  fileName = 'SWMS-Document.pdf',
  onRetry 
}: PDFLoadingModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    "Connecting to SWMSprint generator...",
    "Mapping SWMS data to template fields...",
    "Generating professional PDF layout...",
    "Processing activities and risk assessments...",
    "Adding company branding and signatures...",
    "Finalizing document formatting...",
    "Preparing download..."
  ];

  useEffect(() => {
    if (status === 'loading') {
      setProgress(0);
      setCurrentStep(0);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95; // Stop at 95% until success/error
          return prev + Math.random() * 15; // Random increments for realistic feel
        });
      }, 800);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= loadingSteps.length - 1) return prev;
          return prev + 1;
        });
      }, 2000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(stepInterval);
      };
    } else if (status === 'success') {
      setProgress(100);
    }
  }, [status, loadingSteps.length]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Generating PDF Document';
      case 'success':
        return 'PDF Generated Successfully';
      case 'error':
        return 'PDF Generation Failed';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return loadingSteps[currentStep] || 'Processing your SWMS document...';
      case 'success':
        return `${fileName} has been generated and is ready for download.`;
      case 'error':
        return error || 'An error occurred while generating the PDF. Please try again.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon()}
            {getStatusTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* Progress Bar - Only show during loading */}
          {status === 'loading' && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="text-sm text-gray-600 text-center">
                {Math.round(progress)}% complete
              </div>
            </div>
          )}

          {/* Current Step/Status Message */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-lg font-medium">
              <FileText className="h-5 w-5" />
              {status === 'loading' ? 'SWMSprint Integration' : fileName}
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              {getStatusMessage()}
            </p>

            {/* Loading steps indicator */}
            {status === 'loading' && (
              <div className="text-xs text-gray-500">
                Step {currentStep + 1} of {loadingSteps.length}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            {status === 'error' && onRetry && (
              <Button onClick={onRetry} variant="default" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Try Again
              </Button>
            )}
            
            {status !== 'loading' && (
              <Button onClick={onClose} variant={status === 'error' ? 'outline' : 'default'}>
                {status === 'success' ? 'Done' : 'Close'}
              </Button>
            )}
          </div>
        </div>

        {/* Technical Details for Error State */}
        {status === 'error' && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <div className="text-xs text-red-600 font-mono break-all">
              {error}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}