import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SwmsForm from "@/components/swms/swms-form";
import DocumentPreview from "@/components/swms/document-preview";
import SimplifiedTableEditor from "@/components/swms/simplified-table-editor";
import CreditCounter from "@/components/ui/credit-counter";
import { ArrowLeft, ArrowRight, FileText, Shield, CheckCircle, Save, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: 1, title: "Project Details", description: "Basic project information and trade selection" },
  { id: 2, title: "Risk Assessment", description: "Identify and assess potential hazards for your work activities" },
  { id: 3, title: "Safety Codes", description: "Select applicable safety codes and compliance requirements" },
  { id: 4, title: "Legal Disclaimer", description: "Accept terms and liability disclaimer" },
  { id: 5, title: "Final Document", description: "Generate complete SWMS document" }
];

export default function SwmsBuilder() {
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
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/swms/draft", {
        ...data,
        status: "draft",
        currentStep
      });
      return response;
    },
    onSuccess: (data) => {
      setDraftId(data.id);
      setIsDraft(true);
      toast({
        title: "Draft Saved",
        description: "Your SWMS has been saved as a draft.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swms"] });
    },
    onError: () => {
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
      saveDraftMutation.mutate(formData);
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
      {/* Risk Matrix and Safety Funnel Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <Shield className="mr-2 h-4 w-4 text-blue-500" />
              Risk Assessment Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-1 text-xs">
              <div className="font-medium text-center p-2 bg-gray-100 rounded">Risk</div>
              <div className="font-medium text-center p-2 bg-gray-100 rounded">Very Rare</div>
              <div className="font-medium text-center p-2 bg-gray-100 rounded">Unlikely</div>
              <div className="font-medium text-center p-2 bg-gray-100 rounded">Possible</div>
              <div className="font-medium text-center p-2 bg-gray-100 rounded">Likely</div>
              
              <div className="font-medium p-2 bg-gray-100 rounded">Catastrophic</div>
              <div className="p-2 bg-yellow-300 rounded text-center">Medium</div>
              <div className="p-2 bg-orange-400 rounded text-center text-white">High</div>
              <div className="p-2 bg-red-500 rounded text-center text-white">Extreme</div>
              <div className="p-2 bg-red-600 rounded text-center text-white">Extreme</div>
              
              <div className="font-medium p-2 bg-gray-100 rounded">Major</div>
              <div className="p-2 bg-green-400 rounded text-center">Low</div>
              <div className="p-2 bg-yellow-300 rounded text-center">Medium</div>
              <div className="p-2 bg-orange-400 rounded text-center text-white">High</div>
              <div className="p-2 bg-red-500 rounded text-center text-white">Extreme</div>
              
              <div className="font-medium p-2 bg-gray-100 rounded">Moderate</div>
              <div className="p-2 bg-green-300 rounded text-center">Low</div>
              <div className="p-2 bg-green-400 rounded text-center">Low</div>
              <div className="p-2 bg-yellow-300 rounded text-center">Medium</div>
              <div className="p-2 bg-orange-400 rounded text-center text-white">High</div>
              
              <div className="font-medium p-2 bg-gray-100 rounded">Minor</div>
              <div className="p-2 bg-green-200 rounded text-center">Low</div>
              <div className="p-2 bg-green-300 rounded text-center">Low</div>
              <div className="p-2 bg-green-400 rounded text-center">Low</div>
              <div className="p-2 bg-yellow-300 rounded text-center">Medium</div>
              
              <div className="font-medium p-2 bg-gray-100 rounded">Insignificant</div>
              <div className="p-2 bg-green-100 rounded text-center">Low</div>
              <div className="p-2 bg-green-200 rounded text-center">Low</div>
              <div className="p-2 bg-green-300 rounded text-center">Low</div>
              <div className="p-2 bg-green-400 rounded text-center">Low</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              Safety Control Hierarchy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded">
                <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">1</div>
                <div>
                  <div className="font-medium text-red-800">Eliminate</div>
                  <div className="text-red-600">Remove the hazard completely</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-orange-50 border border-orange-200 rounded">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">2</div>
                <div>
                  <div className="font-medium text-orange-800">Substitute</div>
                  <div className="text-orange-600">Replace with safer alternative</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">3</div>
                <div>
                  <div className="font-medium text-yellow-800">Engineering</div>
                  <div className="text-yellow-600">Physical barriers & controls</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">4</div>
                <div>
                  <div className="font-medium text-blue-800">Administrative</div>
                  <div className="text-blue-600">Procedures & training</div>
                </div>
              </div>
              <div className="flex items-center p-2 bg-purple-50 border border-purple-200 rounded">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">5</div>
                <div>
                  <div className="font-medium text-purple-800">PPE</div>
                  <div className="text-purple-600">Personal protective equipment</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">SWMS Builder</h2>
            <p className="text-gray-600">Create comprehensive safety documentation</p>
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
            {saveDraftMutation.isPending ? "Saving..." : "Save & Close"}
          </Button>
          <Badge variant="outline" className="bg-green-50 text-primary border-primary/20">
            Step {currentStep} of {STEPS.length}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
            
            {/* Step indicators */}
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center space-y-2">
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
                  <div className="text-center hidden md:block">
                    <p className="text-xs font-medium text-gray-800">{step.title}</p>
                    <p className="text-xs text-gray-500 max-w-24">{step.description}</p>
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
