import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface FeatureWalkthroughProps {
  steps: WalkthroughStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function FeatureWalkthrough({ steps, isActive, onComplete, onSkip }: FeatureWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (steps[currentStep].highlight) {
          element.style.boxShadow = '0 0 20px 5px rgba(59, 130, 246, 0.5)';
          element.style.zIndex = '1000';
          element.style.position = 'relative';
        }
      }
    }
  }, [currentStep, isActive, steps]);

  const nextStep = () => {
    if (targetElement && steps[currentStep].highlight) {
      targetElement.style.boxShadow = '';
      targetElement.style.zIndex = '';
      targetElement.style.position = '';
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (targetElement && steps[currentStep].highlight) {
      targetElement.style.boxShadow = '';
      targetElement.style.zIndex = '';
      targetElement.style.position = '';
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (targetElement && steps[currentStep].highlight) {
      targetElement.style.boxShadow = '';
      targetElement.style.zIndex = '';
      targetElement.style.position = '';
    }
    onSkip();
  };

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Walkthrough Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96"
          >
            <Card className="shadow-2xl border-2 border-primary/200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-primary/800">{step.title}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleSkip}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{step.description}</p>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-primary/600 hover:bg-primary/700"
                  >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full text-gray-500 hover:text-gray-700"
                >
                  Skip Tutorial
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for managing walkthrough state
export function useFeatureWalkthrough() {
  const [isActive, setIsActive] = useState(false);
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenWalkthrough');
    setHasSeenWalkthrough(!!seen);
  }, []);

  const startWalkthrough = () => {
    setIsActive(true);
  };

  const completeWalkthrough = () => {
    setIsActive(false);
    setHasSeenWalkthrough(true);
    localStorage.setItem('hasSeenWalkthrough', 'true');
  };

  const skipWalkthrough = () => {
    setIsActive(false);
    setHasSeenWalkthrough(true);
    localStorage.setItem('hasSeenWalkthrough', 'true');
  };

  const resetWalkthrough = () => {
    setHasSeenWalkthrough(false);
    localStorage.removeItem('hasSeenWalkthrough');
  };

  return {
    isActive,
    hasSeenWalkthrough,
    startWalkthrough,
    completeWalkthrough,
    skipWalkthrough,
    resetWalkthrough
  };
}