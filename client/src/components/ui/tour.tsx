import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  spotlight?: boolean;
}

interface TourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function Tour({ steps, isActive, onComplete, onSkip }: TourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || currentStep >= steps.length) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;
    
    if (element) {
      setTargetElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });

      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const position = step.position || 'bottom';
      
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = Math.max(20, rect.top - 120); // Ensure enough space above
          left = Math.max(20, Math.min(window.innerWidth - 400, rect.left + rect.width / 2 - 200));
          break;
        case 'bottom':
          top = Math.min(window.innerHeight - 200, rect.bottom + 30); // Ensure fits on screen
          left = Math.max(20, Math.min(window.innerWidth - 400, rect.left + rect.width / 2 - 200));
          break;
        case 'left':
          top = Math.max(20, Math.min(window.innerHeight - 200, rect.top + rect.height / 2 - 100));
          left = Math.max(20, rect.left - 420); // Position well to the left
          break;
        case 'right':
          top = Math.max(20, Math.min(window.innerHeight - 200, rect.top + rect.height / 2 - 100));
          left = Math.min(window.innerWidth - 420, rect.right + 30); // Position well to the right
          break;
      }

      setTooltipPosition({ top, left });

      // Add highlight class
      element.classList.add('tour-highlight');
      element.style.position = 'relative';
      element.style.zIndex = '1001';
    }

    return () => {
      if (element) {
        element.classList.remove('tour-highlight');
        element.style.position = '';
        element.style.zIndex = '';
      }
    };
  }, [currentStep, isActive, steps]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isActive || currentStep >= steps.length) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Light overlay that doesn't block interaction */}
      <div className="fixed inset-0 bg-black bg-opacity-20 pointer-events-none z-900" style={{ zIndex: 900 }} />
      
      {/* Highlight ring for target element */}
      {targetElement && (
        <div 
          className="fixed border-4 border-blue-500 rounded-lg pointer-events-none animate-pulse"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            zIndex: 1001,
            background: 'rgba(59, 130, 246, 0.1)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}
        />
      )}

      {/* Tooltip */}
      <Card 
        className="fixed max-w-sm z-1002 shadow-xl border-2 border-blue-500 bg-white"
        style={{
          top: Math.max(10, Math.min(window.innerHeight - 200, tooltipPosition.top)),
          left: Math.max(10, Math.min(window.innerWidth - 400, tooltipPosition.left)),
          transform: 'translate(-50%, 0)',
          zIndex: 1002
        }}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-blue-700">{step.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">{step.content}</p>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {currentStep + 1} of {steps.length}
            </span>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={prevStep}>
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              )}
              
              <Button size="sm" onClick={nextStep}>
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < steps.length - 1 && <ArrowRight className="h-3 w-3 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// CSS for highlighting
const tourStyles = `
.tour-highlight {
  position: relative !important;
  z-index: 9999 !important;
  outline: 3px solid #3b82f6 !important;
  outline-offset: 2px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.tour-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.5) !important;
  z-index: 9998 !important;
  pointer-events: none !important;
}

@keyframes tour-pulse {
  0% {
    outline-color: rgba(59, 130, 246, 1);
  }
  50% {
    outline-color: rgba(59, 130, 246, 0.5);
  }
  100% {
    outline-color: rgba(59, 130, 246, 1);
  }
}

.tour-highlight {
  animation: tour-pulse 2s infinite;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = tourStyles;
  document.head.appendChild(styleSheet);
}