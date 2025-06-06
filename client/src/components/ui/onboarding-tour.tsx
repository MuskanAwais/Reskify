import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight, ArrowLeft, Lightbulb, Target, Zap } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  placement: "top" | "bottom" | "left" | "right";
  action?: "click" | "hover" | "scroll";
  highlight?: boolean;
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Safety Sensei SWMS Builder",
    content: "Let's take a quick tour to show you how to create professional Safe Work Method Statements quickly and easily.",
    target: "body",
    placement: "bottom"
  },
  {
    id: "navigation",
    title: "Main Navigation",
    content: "Access all features from the navigation bar. Use SWMS Builder for manual creation or AI Generator for automated SWMS creation.",
    target: "[data-tour='navigation']",
    placement: "bottom"
  },
  {
    id: "swms-builder",
    title: "SWMS Builder",
    content: "Create detailed SWMS documents step-by-step. Select your trade, choose activities, and customize risk assessments.",
    target: "[data-tour='swms-builder']",
    placement: "bottom",
    highlight: true
  },
  {
    id: "ai-generator",
    title: "AI SWMS Generator",
    content: "Generate comprehensive SWMS documents instantly using AI. Just describe your job and let AI create the safety documentation.",
    target: "[data-tour='ai-generator']",
    placement: "bottom",
    highlight: true
  },
  {
    id: "my-swms",
    title: "My SWMS Documents",
    content: "View, edit, and manage all your created SWMS documents. Download PDFs, duplicate, or make revisions as needed.",
    target: "[data-tour='my-swms']",
    placement: "bottom"
  },
  {
    id: "safety-library",
    title: "Safety Library",
    content: "Access Australian safety standards, codes, and compliance requirements. Search and reference official safety documentation.",
    target: "[data-tour='safety-library']",
    placement: "bottom"
  },
  {
    id: "credits",
    title: "Credit System",
    content: "Track your SWMS generation credits. Each SWMS document uses one credit. Upgrade your plan for more monthly credits.",
    target: "[data-tour='credits']",
    placement: "left"
  },
  {
    id: "visual-editor",
    title: "Visual Table Editor",
    content: "Edit SWMS risk assessments directly in an interactive table. Click cells to modify risks, controls, and safety measures with dropdowns.",
    target: "[data-tour='visual-editor']",
    placement: "top"
  },
  {
    id: "complete",
    title: "You're Ready to Go!",
    content: "Start by creating your first SWMS document. Choose the manual builder for full control or AI generator for quick results.",
    target: "body",
    placement: "bottom"
  }
];

export default function OnboardingTour({ steps = TOUR_STEPS, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    const step = steps[currentStep];
    if (!step) return;

    const element = step.target === "body" 
      ? document.body 
      : document.querySelector(step.target) as HTMLElement;

    setTargetElement(element);

    if (element && element !== document.body) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.style.position = "relative";
      element.style.zIndex = "1001";
      
      if (step.highlight) {
        element.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.5)";
        element.style.borderRadius = "8px";
      }
    }

    return () => {
      if (element && element !== document.body) {
        element.style.position = "";
        element.style.zIndex = "";
        element.style.boxShadow = "";
        element.style.borderRadius = "";
      }
    };
  }, [currentStep, isVisible, steps]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem("onboarding-completed", "true");
    onComplete();
  };

  const skipTour = () => {
    setIsVisible(false);
    localStorage.setItem("onboarding-completed", "true");
    onSkip();
  };

  const getTooltipPosition = () => {
    if (!targetElement || targetElement === document.body) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const step = steps[currentStep];
    
    switch (step.placement) {
      case "top":
        return {
          top: rect.top - 20,
          left: rect.left + rect.width / 2,
          transform: "translate(-50%, -100%)"
        };
      case "bottom":
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: "translate(-50%, 0)"
        };
      case "left":
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 20,
          transform: "translate(-100%, -50%)"
        };
      case "right":
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          transform: "translate(0, -50%)"
        };
      default:
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: "translate(-50%, 0)"
        };
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-1000"
        style={{ zIndex: 1000 }}
      />
      
      {/* Tooltip */}
      <div
        className="fixed z-1001 max-w-sm"
        style={{ 
          ...tooltipStyle,
          zIndex: 1001
        }}
      >
        <Card className="shadow-lg border-2 border-primary">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {step.id === "welcome" && <Lightbulb className="h-5 w-5 text-yellow-500" />}
                {step.highlight && <Target className="h-5 w-5 text-primary" />}
                {step.id === "ai-generator" && <Zap className="h-5 w-5 text-purple-500" />}
                <h3 className="font-semibold text-sm">{step.title}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={skipTour} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{step.content}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} of {steps.length}
                </Badge>
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep 
                          ? "bg-primary" 
                          : index < currentStep 
                            ? "bg-primary/60" 
                            : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={prevStep}>
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={nextStep}>
                  {currentStep < steps.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </>
                  ) : (
                    "Finish"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}