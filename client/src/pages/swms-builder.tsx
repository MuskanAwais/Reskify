import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SwmsForm from "@/components/swms/swms-form";
import DocumentPreview from "@/components/swms/document-preview";
import { SimplifiedTableEditor } from "@/components/swms/simplified-table-editor";
import CreditCounter from "@/components/ui/credit-counter";
import { ArrowLeft, ArrowRight, FileText, Shield, CheckCircle, Save, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { translate } from "@/lib/language-direct";

const getSteps = () => [
  { id: 1, title: "Project & Contractor Details", description: "Project information, contractor details, and high-risk work identification" },
  { id: 2, title: "Work Activities & Risk Assessment", description: "Detailed work breakdown and comprehensive risk assessments" },
  { id: 3, title: "Plant, Equipment & Training", description: "Equipment specifications, training requirements, and permits" },
  { id: 4, title: "Emergency & Monitoring", description: "Emergency procedures and review/monitoring processes" },
  { id: 5, title: "Legal Disclaimer", description: "Accept terms and liability disclaimer" },
  { id: 6, title: "Final Document", description: "Generate complete SWMS document" },
  { id: 7, title: "Digital Signatures & PDF", description: "Optional signatures and final PDF generation" }
];

export default function SwmsBuilder() {
  const STEPS = getSteps();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    jobName: "",
    jobNumber: "",
    projectAddress: "",
    projectLocation: "",
    tradeType: "",
    activities: [],
    hazards: [],
    riskAssessments: [],
    safetyMeasures: [],
    complianceCodes: []
  });
  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check user subscription for feature access
  const { data: subscription } = useQuery({
    queryKey: ["/api/user/subscription"],
  });

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Saving draft with data:', data);
      const response = await apiRequest("POST", "/api/swms/draft", {
        ...data,
        status: "draft",
        currentStep,
        title: data.title || data.jobName || "Untitled SWMS",
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      });
      console.log('Draft save response:', response);
      return response;
    },
    onSuccess: (data: any) => {
      console.log('Draft saved successfully:', data);
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
    if (!formData.tradeType?.trim()) {
      errors.push("Trade Type is required");
    }
    
    return errors;
  };

  const handleNext = () => {
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
    
    // Check for credits before proceeding to final document step (step 6)
    if (currentStep === 5) {
      const creditsRemaining = subscription?.creditsRemaining || 0;
      if (creditsRemaining === 0) {
        // Redirect to payment page if no credits
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
    autoSave();
    
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
  const hasAIAccess = subscription?.plan === "Pro" || subscription?.plan === "Enterprise";
  
  // Check if user has access to custom branding (Pro+ only)
  const hasCustomBranding = subscription?.plan === "Pro" || subscription?.plan === "Enterprise";

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
        activities: [],
        hazards: [],
        riskAssessments: [],
        safetyMeasures: [],
        complianceCodes: []
      });
    }
  }, []);

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormDataChange = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {translate("swms.back.dashboard")}
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{translate("swms.builder")}</h2>
            <p className="text-gray-600">{translate("swms.create.comprehensive")}</p>
            {isDraft && (
              <p className="text-sm text-amber-600 font-medium">Draft saved automatically</p>
            )}
          </div>
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
            <Progress value={progress} className="w-full" />
            
            {/* Step indicators */}
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center space-y-2 flex-1">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id <= currentStep 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
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
            <div className="flex justify-between items-center mt-8">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {/* Manual Save Button */}
              <Button 
                variant="outline" 
                onClick={() => autoSave()}
                disabled={saveDraftMutation.isPending}
                className="flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <DocumentPreview formData={formData} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
