import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import SwmsForm from "@/components/swms/swms-form";
import DocumentPreview from "@/components/swms/document-preview";
import CreditCounter from "@/components/ui/credit-counter";
import { ArrowLeft, ArrowRight, FileText, Shield, CheckCircle } from "lucide-react";
import { Link } from "wouter";

const STEPS = [
  { id: 1, title: "Project Details", description: "Basic project information and trade selection" },
  { id: 2, title: "Select Activities", description: "Choose activities from comprehensive task database" },
  { id: 3, title: "SWMS Table", description: "Review generated risk assessment table and edit as needed" },
  { id: 4, title: "Custom Items", description: "Add custom activities and modify control measures" },
  { id: 5, title: "Legal Disclaimer", description: "Accept terms and liability disclaimer" },
  { id: 6, title: "Final Document", description: "Generate complete SWMS document" }
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

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

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
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">SWMS Builder</h2>
            <p className="text-gray-600">Create comprehensive safety documentation</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-50 text-primary border-primary/20">
          Step {currentStep} of {STEPS.length}
        </Badge>
      </div>

      {/* Credit Counter */}
      <CreditCounter />

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
