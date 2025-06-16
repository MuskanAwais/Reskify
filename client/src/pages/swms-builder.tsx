import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SwmsForm from "@/components/swms/swms-form";
import DocumentPreview from "@/components/swms/document-preview";
import { SimplifiedTableEditor } from "@/components/swms/simplified-table-editor";
import CreditCounter from "@/components/ui/credit-counter";
import LiveSWMSPreviewer from "@/components/swms/live-swms-previewer";
import { ArrowLeft, ArrowRight, FileText, Shield, CheckCircle, Save, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { translate } from "@/lib/language-direct";

const getSteps = () => [
  { id: 1, title: "Project & Contractor Details", description: "Project information, contractor details, and high-risk work identification" },
  { id: 2, title: "Work Activities & Risk Assessment", description: "Generate tasks and manage comprehensive risk assessments with controls" },
  { id: 3, title: "Plant, Equipment & Training", description: "Equipment specifications, training requirements, and permits" },
  { id: 4, title: "Emergency & Monitoring", description: "Emergency procedures and review/monitoring processes" },
  { id: 5, title: "Payment & Access", description: "Select payment option to complete SWMS generation" },
  { id: 6, title: "Legal Disclaimer", description: "Accept terms and liability disclaimer" },
  { id: 7, title: "Digital Signatures & PDF", description: "Generate complete SWMS document with optional signatures" }
];

export default function SwmsBuilder() {
  const STEPS = getSteps();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    jobName: "",
    jobNumber: "",
    projectAddress: "",
    projectLocation: "",
    startDate: "",
    tradeType: "",
    activities: [],
    hazards: [],
    riskAssessments: [],
    safetyMeasures: [],
    complianceCodes: [],
    acceptedDisclaimer: false,
    selectedTasks: [],
    workDescription: "",
    plantEquipment: [],
    signatures: [],
    emergencyProcedures: [],
    generalRequirements: []
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('swms-form-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
    
    // Parse step from URL
    const urlParams = new URLSearchParams(window.location.search);
    const step = parseInt(urlParams.get('step') || '1');
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
    }
  }, []);

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('swms-form-data', JSON.stringify(formData));
  }, [formData]);

  // Check user subscription for feature access
  const { data: subscription } = useQuery({
    queryKey: ["/api/user/subscription"],
  });

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  // Silent auto-save mutation (no notifications)
  const autoSaveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/swms/draft", {
        ...data,
        status: "draft",
        currentStep,
        title: data.title || data.jobName || "Untitled SWMS",
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data?.draftId) {
        setDraftId(data.draftId);
        setIsDraft(true);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/swms/my-documents"] });
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
    },
  });

  // Manual save mutation (with notifications)
  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/swms/draft", {
        ...data,
        status: "draft",
        currentStep,
        title: data.title || data.jobName || "Untitled SWMS",
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data?.draftId) {
        setDraftId(data.draftId);
        setIsDraft(true);
      }
      toast({
        title: "Draft Saved",
        description: "Your SWMS has been saved as a draft.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swms/my-documents"] });
    },
    onError: (error) => {
      console.error('Draft save error:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Debounced auto-save to prevent excessive API calls
  const debouncedAutoSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (data: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (data.title || data.jobName || data.tradeType) {
            autoSaveMutation.mutate(data);
          }
        }, 1000); // Save after 1 second of inactivity
      };
    })(),
    [autoSaveMutation]
  );

  // Auto-save when moving between steps
  const autoSave = () => {
    if (formData.title || formData.jobName || formData.tradeType) {
      console.log('Auto-saving draft with form data:', formData);
      saveDraftMutation.mutate(formData);
    } else {
      console.log('Skipping auto-save - insufficient data');
    }
  };

  // Validation function for step 1
  const validateStep1 = () => {
    const errors: string[] = [];
    
    if (!formData.jobName?.trim()) {
      errors.push("Job Name is required");
    }
    if (!formData.jobNumber?.trim()) {
      errors.push("Job Number is required");
    }
    if (!formData.projectAddress?.trim()) {
      errors.push("Project Address is required");
    }
    if (!formData.startDate?.trim()) {
      errors.push("Start Date is required");
    }
    if (!formData.tradeType?.trim()) {
      errors.push("Trade Type is required");
    }
    
    return errors;
  };

  const handleNext = async () => {
    // Validate step 1 before proceeding
    if (currentStep === 1) {
      const errors = validateStep1();
      if (errors.length > 0) {
        toast({
          title: "Missing Required Information",
          description: "Please fill in all mandatory fields: " + errors.join(", "),
          variant: "destructive",
        });
        return;
      }
    }
    
    // Handle payment step (step 5)
    if (currentStep === 4) {
      // Always go to payment step next
      setCurrentStep(5);
      return;
    }
    
    // Handle proceeding from payment step (step 5)
    if (currentStep === 5) {
      const creditsRemaining = subscription ? (subscription as any).creditsRemaining || 0 : 0;
      const hasProPlan = (subscription as any)?.plan === "Pro" || (subscription as any)?.plan === "Enterprise";
      const isAdminDemo = localStorage.getItem('adminDemoMode') === 'true';
      const isAppAdmin = localStorage.getItem('isAppAdmin') === 'true';
      
      // Allow admin to bypass payment in demo mode OR if user has credits
      if ((isAppAdmin && isAdminDemo) || creditsRemaining > 0 || hasProPlan) {
        // Admin demo mode or user has credits - skip payment validation
        console.log('Payment validation bypassed - demo mode or credits available');
      } else {
        // Redirect to payment page if no credits and not in admin demo mode
        setLocation("/payment");
        return;
      }
    }
    
    // Validate legal disclaimer acceptance before proceeding from step 6 (legal disclaimer step)
    if (currentStep === 6 && !formData.acceptedDisclaimer) {
      toast({
        title: "Legal Disclaimer Required",
        description: "You must accept the legal disclaimer to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Auto-save before moving to next step
    if (formData.title || formData.jobName || formData.tradeType) {
      try {
        await autoSaveMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSaveAndClose = () => {
    saveDraftMutation.mutate(formData);
    setTimeout(() => {
      setLocation("/dashboard");
    }, 1000);
  };

  // Check if user has access to AI generation (Pro+ only)
  const hasAIAccess = (subscription as any)?.plan === "Pro" || (subscription as any)?.plan === "Enterprise";
  
  // Check if user has access to custom branding (Pro+ only)
  const hasCustomBranding = (subscription as any)?.plan === "Pro" || (subscription as any)?.plan === "Enterprise";

  // Handle AI-generated SWMS data on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAiGenerated = urlParams.get('ai') === 'true';
    const startStep = parseInt(urlParams.get('step') || '1');
    
    if (isAiGenerated) {
      const aiData = sessionStorage.getItem('aiGeneratedSwmsData');
      if (aiData) {
        try {
          const parsedData = JSON.parse(aiData);
          setFormData(parsedData);
          setCurrentStep(startStep);
          sessionStorage.removeItem('aiGeneratedSwmsData');
        } catch (error) {
          console.error('Failed to parse AI-generated SWMS data:', error);
        }
      }
    } else {
      // Clear form data when starting fresh to prevent carrying over project details
      setFormData({
        title: "",
        jobName: "",
        jobNumber: "",
        projectAddress: "",
        projectLocation: "",
        tradeType: "",
        startDate: "",
        workDescription: "",
        activities: [],
        hazards: [],
        riskAssessments: [],
        safetyMeasures: [],
        complianceCodes: [],
        plantEquipment: [],
        signatures: [],
        emergencyProcedures: [],
        generalRequirements: [],
        acceptedDisclaimer: false,
        selectedTasks: []
      });
    }
  }, []);

  const handlePrevious = async () => {
    // Auto-save before moving to previous step
    if (formData.title || formData.jobName || formData.tradeType) {
      try {
        await autoSaveMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }
    
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setLocation(`/swms-builder?step=${newStep}`);
    }
  };

  const handleStepClick = async (stepId: number) => {
    // Can navigate backward freely, or one step forward if form is valid
    if (stepId <= currentStep || stepId === currentStep + 1) {
      // Auto-save before step change
      if (formData.title || formData.jobName || formData.tradeType) {
        try {
          await autoSaveMutation.mutateAsync(formData);
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }
      
      setCurrentStep(stepId);
      setLocation(`/swms-builder?step=${stepId}`);
    }
  };

  const handleFormDataChange = (data: any) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);
    
    // Silent auto-save with debouncing
    debouncedAutoSave(newFormData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{translate("swms.builder")}</h2>
          <p className="text-gray-600">{translate("swms.create.comprehensive")}</p>
          {isDraft && (
            <p className="text-sm text-amber-600 font-medium">Draft saved automatically</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSaveAndClose}
            disabled={saveDraftMutation.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saveDraftMutation.isPending ? "Saving..." : translate("swms.save.close")}
          </Button>
          <Badge variant="outline" className="bg-green-50 text-primary border-primary/20">
            {translate("swms.step")} {currentStep} {translate("swms.of")} {STEPS.length}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{translate("swms.progress")}</span>
              <span>{Math.round(progress)}% {translate("swms.complete")}</span>
            </div>
            <Progress value={progress} className="w-full h-3" />
            
            {/* Clickable Step indicators */}
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center space-y-2 flex-1">
                  <button
                    onClick={() => handleStepClick(step.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all hover:scale-110 ${
                      step.id === currentStep 
                        ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' 
                        : step.id < currentStep
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    disabled={step.id > currentStep + 1} // Can only go one step ahead
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </button>
                  <div className="text-center hidden md:block px-2">
                    <p className="text-xs font-medium text-gray-800 text-center">{step.title}</p>
                    <p className="text-xs text-gray-500 text-center leading-tight">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SwmsForm 
              step={currentStep}
              data={formData}
              onDataChange={handleFormDataChange}
              onNext={handleNext}
            />
            
            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button 
                  onClick={handleNext} 
                  className="bg-primary hover:bg-primary/90"
                  disabled={saveDraftMutation.isPending || (currentStep === 2 && (!formData.selectedTasks || formData.selectedTasks.length === 0))}
                >
                  {saveDraftMutation.isPending ? "Saving..." : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <DocumentPreview formData={formData} />
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Live SWMS Previewer positioned below step content with spacing */}
        <div className="mt-8">
          <LiveSWMSPreviewer 
            formData={formData}
            currentStep={currentStep}
          />
        </div>
      </div>
    </div>
  );
}
