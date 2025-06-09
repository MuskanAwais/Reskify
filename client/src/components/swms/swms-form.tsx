import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import RiskComplianceChecker from "./risk-compliance-checker";
import DigitalSignatureSystem from "./digital-signature-system";
import PDFPrintSystem from "./pdf-print-system";
import RiskValidationSystem from "./risk-validation-system";
import PlantEquipmentSystem from "./plant-equipment-system";
import ComprehensiveRiskComplianceTool from "./comprehensive-risk-compliance-tool";
import { 
  MapPin, 
  Briefcase, 
  CheckSquare, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  Shield,
  FileText,
  Wrench,
  Eye,
  Download,
  Save,
  CheckCircle,
  PenTool
} from "lucide-react";
import { SimplifiedTableEditor } from "./simplified-table-editor";
import { translate } from "@/lib/language-direct";
import SmartTooltip from "@/components/ui/smart-tooltip";
import QuickActionTooltip, { presetTooltips } from "@/components/ui/quick-action-tooltip";

interface StepContentProps {
  step: number;
  formData: any;
  onDataChange: (data: any) => void;
}

interface SWMSFormProps {
  data?: any;
  onStepChange?: (step: number) => void;
  onDataChange?: (data: any) => void;
}

const TOTAL_STEPS = 7;

const StepContent = ({ step, formData, onDataChange }: StepContentProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set(formData.activities || []));
  const [selectedComplianceCodes, setSelectedComplianceCodes] = useState<Set<string>>(new Set(formData.complianceCodes || []));
  
  const updateFormData = (updates: any) => {
    const newData = { 
      ...formData, 
      ...updates,
      complianceStatus: updates.complianceStatus || formData.complianceStatus || { isCompliant: false, issues: [] },
      signatures: updates.signatures || formData.signatures || []
    };
    onDataChange(newData);
  };

  switch (step) {
    case 1:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project Details</h3>
            <p className="text-gray-600 text-sm">
              Enter basic information about your construction project
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobName">Job Name</Label>
                  <Input
                    id="jobName"
                    value={formData.jobName || ""}
                    onChange={(e) => updateFormData({ jobName: e.target.value })}
                    placeholder="Enter job name"
                  />
                </div>
                <div>
                  <Label htmlFor="jobNumber">Job Number</Label>
                  <Input
                    id="jobNumber"
                    value={formData.jobNumber || ""}
                    onChange={(e) => updateFormData({ jobNumber: e.target.value })}
                    placeholder="Enter job number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="projectAddress">Project Address</Label>
                <Input
                  id="projectAddress"
                  value={formData.projectAddress || ""}
                  onChange={(e) => updateFormData({ projectAddress: e.target.value })}
                  placeholder="Enter project address"
                />
              </div>

              <div>
                <Label htmlFor="tradeType">Trade Type</Label>
                <Select
                  value={formData.tradeType || ""}
                  onValueChange={(value) => updateFormData({ tradeType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General Construction</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Carpentry">Carpentry</SelectItem>
                    <SelectItem value="Roofing">Roofing</SelectItem>
                    <SelectItem value="Demolition">Demolition</SelectItem>
                    <SelectItem value="Excavation">Excavation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Describe the project scope and objectives"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
            <p className="text-gray-600 text-sm">
              Identify and assess potential risks for your project
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-gray-500">Risk assessment functionality placeholder</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Layers className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Visual Table Editor</h3>
            <p className="text-gray-600 text-sm">
              Edit and customize your risk assessments in an interactive table format
            </p>
          </div>

          {formData.riskAssessments && formData.riskAssessments.length > 0 ? (
            <SimplifiedTableEditor 
              riskAssessments={formData.riskAssessments}
              onUpdate={(assessments) => updateFormData({ riskAssessments: assessments })}
              tradeType={formData.tradeType || 'General'}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-gray-500">
                  No risk assessments found. Please complete Step 2 first.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Compliance Validation</h3>
            <p className="text-gray-600 text-sm">
              Verify compliance with Australian safety standards and validate risk assessments
            </p>
          </div>

          <ComprehensiveRiskComplianceTool
            riskAssessments={formData.riskAssessments || []}
            tradeType={formData.tradeType || 'general'}
            onComplianceUpdate={(result) => {
              updateFormData({
                complianceResult: result,
                complianceStatus: { 
                  isCompliant: result.isCompliant, 
                  issues: result.issues,
                  overallScore: result.overallScore 
                }
              });
            }}
          />
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Wrench className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plant & Equipment</h3>
            <p className="text-gray-600 text-sm">
              Document plant, equipment, and machinery required for your work
            </p>
          </div>

          <PlantEquipmentSystem
            tradeType={formData.tradeType || 'general'}
            activities={formData.activities || []}
            onEquipmentUpdate={(equipment) => {
              updateFormData({ plantEquipment: equipment });
            }}
          />
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <PenTool className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digital Signatures (Optional)</h3>
            <p className="text-gray-600 text-sm">
              Optionally collect digital signatures for document approval workflow
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Digital signatures are optional. You can skip this step and add signatures later, 
                  or proceed directly to generate your SWMS document.
                </p>
              </div>
            </CardContent>
          </Card>

          <DigitalSignatureSystem
            swmsId={formData.draftId || `draft-${Date.now()}`}
            swmsTitle={formData.jobName || 'SWMS Document'}
            isCompliant={formData.complianceStatus?.isCompliant || false}
            onSignaturesUpdate={(signatures) => {
              updateFormData({ signatures });
            }}
          />
        </div>
      );

    case 7:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Download className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generate & Print Final Document</h3>
            <p className="text-gray-600 text-sm">
              Download PDF and print your completed SWMS with all signatures and compliance validation
            </p>
          </div>

          <PDFPrintSystem
            swmsId={formData.draftId || `swms-${Date.now()}`}
            swmsTitle={formData.jobName || 'SWMS Document'}
            formData={formData}
            signatures={formData.signatures || []}
            isCompliant={formData.complianceStatus?.isCompliant || false}
          />
        </div>
      );

    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Invalid step</p>
        </div>
      );
  }
};

export default function SWMSForm({ data = {}, onStepChange, onDataChange }: SWMSFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(data);

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (onStepChange) onStepChange(newStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      if (onStepChange) onStepChange(newStep);
    }
  };

  const updateFormData = (updates: any) => {
    const newData = { 
      ...formData, 
      ...updates,
      complianceStatus: updates.complianceStatus || formData.complianceStatus || { isCompliant: false, issues: [] },
      signatures: updates.signatures || formData.signatures || []
    };
    setFormData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < TOTAL_STEPS && (
                <div
                  className={`w-12 h-0.5 ${
                    step < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        <StepContent 
          step={currentStep} 
          formData={formData} 
          onDataChange={updateFormData}
        />
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
        >
          Previous
        </Button>
        
        <Button
          onClick={nextStep}
          disabled={currentStep === TOTAL_STEPS}
        >
          {currentStep === TOTAL_STEPS ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}