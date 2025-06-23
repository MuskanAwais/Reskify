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

// 18 Categories of High-Risk Construction Work (HRCW) - WHS Regulations 2011 (Regulation 291)
const HRCW_CATEGORIES = [
  { 
    id: 1, 
    title: "Risk of a person falling more than 2 metres",
    description: "Work on ladders, scaffolding, roofs, elevated platforms",
    keywords: ["ladder", "scaffolding", "roof", "height", "elevated", "fall", "working at height", "platform", "tower"]
  },
  { 
    id: 2, 
    title: "Work on a telecommunication tower",
    description: "Telecommunication infrastructure work",
    keywords: ["telecommunication", "tower", "antenna", "communication", "mobile tower", "radio"]
  },
  { 
    id: 3, 
    title: "Demolition of load-bearing elements",
    description: "Demolition affecting structural integrity",
    keywords: ["demolition", "load-bearing", "structural", "wall", "beam", "column", "foundation"]
  },
  { 
    id: 4, 
    title: "Work involving disturbance of asbestos",
    description: "Asbestos removal or disturbance work",
    keywords: ["asbestos", "fibro", "removal", "disturbance", "hazardous material"]
  },
  { 
    id: 5, 
    title: "Structural alterations requiring temporary support",
    description: "Alterations needing temporary structural support",
    keywords: ["structural", "alteration", "temporary support", "propping", "shoring", "underpinning"]
  },
  { 
    id: 6, 
    title: "Work in or near confined spaces",
    description: "Confined space entry or work nearby",
    keywords: ["confined space", "tank", "vessel", "pit", "sewer", "tunnel", "enclosed"]
  },
  { 
    id: 7, 
    title: "Work in shafts, trenches or tunnels",
    description: "Excavation deeper than 1.5m or tunnel work",
    keywords: ["shaft", "trench", "tunnel", "excavation", "deep", "underground", "boring"]
  },
  { 
    id: 8, 
    title: "Work involving explosives",
    description: "Use of explosives for construction",
    keywords: ["explosive", "blasting", "detonation", "quarry", "mining"]
  },
  { 
    id: 9, 
    title: "Work on pressurised gas systems",
    description: "Gas distribution mains or piping work",
    keywords: ["gas", "pressurised", "pipeline", "distribution", "main", "natural gas"]
  },
  { 
    id: 10, 
    title: "Work on chemical, fuel or refrigerant lines",
    description: "Hazardous substance piping work",
    keywords: ["chemical", "fuel", "refrigerant", "pipeline", "hazardous", "toxic"]
  },
  { 
    id: 11, 
    title: "Work on energised electrical installations",
    description: "Live electrical work and installations",
    keywords: ["electrical", "energised", "live", "power", "installation", "switchboard", "high voltage"]
  },
  { 
    id: 12, 
    title: "Work in contaminated or flammable atmospheres",
    description: "Areas with contaminated or explosive atmospheres",
    keywords: ["contaminated", "flammable", "atmosphere", "explosive", "toxic", "hazardous air"]
  },
  { 
    id: 13, 
    title: "Tilt-up or precast concrete work",
    description: "Tilt-up or precast concrete element work",
    keywords: ["tilt-up", "precast", "concrete", "panel", "lifting", "crane"]
  },
  { 
    id: 14, 
    title: "Work adjacent to active traffic corridors",
    description: "Work near roads, railways in use",
    keywords: ["road", "railway", "traffic", "corridor", "highway", "active", "live traffic"]
  },
  { 
    id: 15, 
    title: "Work with powered mobile plant",
    description: "Areas with forklifts, excavators, cranes",
    keywords: ["mobile plant", "forklift", "excavator", "crane", "machinery", "powered equipment"]
  },
  { 
    id: 16, 
    title: "Work in extreme temperature areas",
    description: "Cold rooms, furnace areas, extreme temperatures",
    keywords: ["extreme temperature", "cold room", "furnace", "hot", "cold", "temperature"]
  },
  { 
    id: 17, 
    title: "Work near water with drowning risk",
    description: "Water or liquid work with drowning risk",
    keywords: ["water", "liquid", "drowning", "river", "dam", "pool", "flood"]
  },
  { 
    id: 18, 
    title: "Work on live electrical conductors",
    description: "Live electrical conductor work",
    keywords: ["live electrical", "conductor", "overhead", "powerline", "high voltage"]
  }
];

const getSteps = () => [
  { id: 1, title: "Project & Contractor Details", description: "Project information, contractor details, and high-risk work identification" },
  { id: 2, title: "Work Activities & Risk Assessment", description: "Generate tasks and manage comprehensive risk assessments with controls" },
  { id: 3, title: "High-Risk Construction Work", description: "Auto-detected HRCW categories from WHS Regulations 2011" },
  { id: 4, title: "Plant, Equipment & Training", description: "Equipment specifications, training requirements, and permits" },
  { id: 5, title: "Emergency & Monitoring", description: "Emergency procedures and review/monitoring processes" },
  { id: 6, title: "Payment & Access", description: "Select payment option to complete SWMS generation" },
  { id: 7, title: "Legal Disclaimer", description: "Accept terms and liability disclaimer" },
  { id: 8, title: "Digital Signatures & PDF", description: "Generate complete SWMS document with optional signatures" }
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
    generalRequirements: [],
    hrcwCategories: [] // Auto-detected High-Risk Construction Work categories
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      // Load draft from database
      loadDraftMutation.mutate(parseInt(editId));
    } else {
      // Load from localStorage for new SWMS
      const savedData = localStorage.getItem('swms-form-data');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsedData }));
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
    }
    
    // Parse step from URL
    const step = parseInt(urlParams.get('step') || '1');
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
    }
  }, []);

  // Auto-detect HRCW categories based on activities
  const detectHRCWCategories = (activities: any[]) => {
    const detectedCategories = new Set<number>();
    
    activities.forEach(activity => {
      const activityText = `${activity.task || ''} ${activity.hazards?.join(' ') || ''} ${activity.controlMeasures?.join(' ') || ''}`.toLowerCase();
      
      HRCW_CATEGORIES.forEach(category => {
        const hasMatch = category.keywords.some(keyword => 
          activityText.includes(keyword.toLowerCase())
        );
        
        if (hasMatch) {
          detectedCategories.add(category.id);
        }
      });
    });
    
    return Array.from(detectedCategories);
  };

  // Auto-detect HRCW when activities change
  useEffect(() => {
    if (formData.activities.length > 0) {
      const detectedCategories = detectHRCWCategories(formData.activities);
      if (detectedCategories.length > 0) {
        setFormData(prev => ({
          ...prev,
          hrcwCategories: detectedCategories
        }));
      }
    }
  }, [formData.activities]);

  // Load draft mutation
  const loadDraftMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("GET", `/api/swms/draft/${id}`);
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data) {
        console.log('Draft data loaded:', data);
        
        // Map database fields to form structure
        const mappedData = {
          ...formData, // Keep existing form structure
          id: data.id,
          title: data.title || data.jobName || '',
          jobName: data.jobName || data.title || '',
          jobNumber: data.jobNumber || '',
          projectAddress: data.projectAddress || '',
          projectLocation: data.projectLocation || data.projectAddress || '',
          startDate: data.startDate || '',
          tradeType: data.tradeType || '',
          customTradeType: data.customTradeType || '',
          principalContractor: data.principalContractor || '',
          responsiblePersons: data.responsiblePersons || [],
          activities: data.activities || data.workActivities || [],
          selectedTasks: data.activities || data.workActivities || [],
          riskAssessments: data.riskAssessments || [],
          safetyMeasures: data.safetyMeasures || [],
          emergencyProcedures: data.emergencyProcedures || [],
          complianceCodes: data.complianceCodes || [],
          plantEquipment: data.plantEquipment || [],
          monitoringRequirements: data.monitoringRequirements || [],
          generalRequirements: data.generalRequirements || [],
          acceptedDisclaimer: data.acceptedDisclaimer || false,
          signatures: data.signatures || [],
          draftId: data.id
        };
        
        console.log('Mapped form data:', mappedData);
        setFormData(mappedData);
        setDraftId(data.id);
        setIsDraft(true);
        
        if (data.currentStep) {
          setCurrentStep(data.currentStep);
        }
        
        toast({
          title: "Draft Loaded",
          description: `Successfully loaded "${data.title || 'Untitled SWMS'}" draft.`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to load draft:', error);
      toast({
        title: "Error",
        description: "Failed to load draft SWMS document.",
        variant: "destructive",
      });
    },
  });

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
        draftId: draftId, // Include existing draft ID to update instead of create new
        status: "draft",
        currentStep,
        title: data.title || data.jobName || "Untitled SWMS",
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data?.draftId && !draftId) {
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
      debouncedAutoSave(formData);
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

  // Enhanced validation functions for each step
  const validateStep2 = () => {
    const errors: string[] = [];
    if (!formData.selectedTasks || formData.selectedTasks.length === 0) {
      errors.push("At least one work activity must be selected");
    }
    return errors;
  };

  const validateStep3 = () => {
    const errors: string[] = [];
    if (!formData.plantEquipment || formData.plantEquipment.length === 0) {
      errors.push("Plant and equipment information is required");
    }
    return errors;
  };

  const validateStep4 = () => {
    const errors: string[] = [];
    if (!formData.emergencyProcedures || formData.emergencyProcedures.length === 0) {
      errors.push("Emergency procedures must be defined");
    }
    return errors;
  };

  const validateStep6 = () => {
    const errors: string[] = [];
    if (!formData.acceptedDisclaimer) {
      errors.push("Legal disclaimer must be accepted");
    }
    return errors;
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    let errors: string[] = [];
    
    if (currentStep === 1) {
      errors = validateStep1();
    } else if (currentStep === 2) {
      errors = validateStep2();
    } else if (currentStep === 3) {
      errors = validateStep3();
    } else if (currentStep === 4) {
      errors = validateStep4();
    } else if (currentStep === 5) {
      errors = validateStep5();
    } else if (currentStep === 7) {
      errors = validateStep7();
    }

    if (errors.length > 0) {
      toast({
        title: "Missing Required Information",
        description: "Please complete all required fields: " + errors.join(", "),
        variant: "destructive",
      });
      return;
    }
    
    // Handle payment step (step 5)
    if (currentStep === 4) {
      // Always go to payment step next
      setCurrentStep(5);
      return;
    }
    
    // Handle proceeding from payment step (step 5) - STRICT VALIDATION
    if (currentStep === 5) {
      const creditsRemaining = subscription ? (subscription as any).creditsRemaining || 0 : 0;
      const hasProPlan = (subscription as any)?.plan === "Pro" || (subscription as any)?.plan === "Enterprise";
      const isAdminDemo = localStorage.getItem('adminDemoMode') === 'true';
      const isAppAdmin = localStorage.getItem('isAppAdmin') === 'true';
      
      // STRICT: Only allow if user has credits, pro plan, or admin demo mode
      if (!((isAppAdmin && isAdminDemo) || creditsRemaining > 0 || hasProPlan)) {
        toast({
          title: "Payment Required",
          description: "Please complete payment or use available credits to proceed.",
          variant: "destructive",
        });
        return;
      }
      
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
    // Allow backward navigation to any completed step
    if (stepId <= currentStep) {
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
      return;
    }

    // Prevent jumping ahead - show helpful message
    if (stepId > currentStep) {
      const stepNames = ['Project Details', 'Work Activities', 'Plant & Equipment', 'Emergency & Monitoring', 'Payment', 'Legal Disclaimer', 'Digital Signatures'];
      toast({
        title: "Complete Current Step First",
        description: `Please complete "${stepNames[currentStep - 1]}" before proceeding to "${stepNames[stepId - 1]}".`,
        variant: "destructive",
      });
      return;
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step.id === currentStep 
                        ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 hover:scale-110' 
                        : step.id < currentStep
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:scale-110 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                    disabled={step.id > currentStep}
                    title={step.id > currentStep ? 'Complete current step to unlock' : step.id < currentStep ? 'Click to return to this step' : 'Current step'}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </button>
                  <div className="text-center hidden md:block px-2">
                    <p className={`text-xs font-medium text-center ${
                      step.id === currentStep 
                        ? 'text-primary' 
                        : step.id < currentStep
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}>{step.title}</p>
                    <p className={`text-xs text-center leading-tight ${
                      step.id <= currentStep ? 'text-gray-600' : 'text-gray-400'
                    }`}>{step.description}</p>
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
