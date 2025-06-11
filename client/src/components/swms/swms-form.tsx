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
  Heart,
  Save,
  CheckCircle,
  PenTool
} from "lucide-react";
import { SimplifiedTableEditor } from "./simplified-table-editor";
import GPTTaskSelection from "./gpt-task-selection";
import { translate } from "@/lib/language-direct";
import SmartTooltip from "@/components/ui/smart-tooltip";
import QuickActionTooltip, { presetTooltips } from "@/components/ui/quick-action-tooltip";

const TOTAL_STEPS = 4;

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

const StepContent = ({ step, formData, onDataChange }: StepContentProps) => {
  const { toast } = useToast();

  const updateFormData = (updates: any) => {
    const newData = { 
      ...formData, 
      ...updates,
      lastModified: new Date().toISOString()
    };
    onDataChange(newData);
  };

  switch (step) {
    case 1:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">{translate("projectDetails")}</h3>
            <p className="text-gray-600 text-sm">
              {translate("projectDetailsDesc")}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobName">Job Name</Label>
                <Input
                  id="jobName"
                  value={formData.jobName || ""}
                  onChange={(e) => updateFormData({ jobName: e.target.value })}
                  placeholder="Enter job name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => updateFormData({ startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) => updateFormData({ duration: e.target.value })}
                    placeholder="Enter duration"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="workLocation">Specific Work Location</Label>
                <Input
                  id="workLocation"
                  value={formData.workLocation || ""}
                  onChange={(e) => updateFormData({ workLocation: e.target.value })}
                  placeholder="Specific area or location where work will be performed"
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
            <h3 className="text-lg font-semibold mb-2">Work Activities & Task Selection</h3>
            <p className="text-gray-600 text-sm">
              Choose how to add tasks to your SWMS - search existing tasks, generate with AI, or create custom tasks
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Task Selection Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <GPTTaskSelection
                projectDetails={{
                  projectName: formData.projectName || '',
                  location: formData.projectLocation || '',
                  tradeType: formData.tradeType || '',
                  description: formData.projectDescription || ''
                }}
                onActivitiesGenerated={(activities: any[], plantEquipment: any[]) => {
                  updateFormData({ 
                    selectedTasks: activities,
                    plantEquipment: plantEquipment,
                    generationMethod: 'gpt'
                  });
                }}
                onMethodSelected={(method: string) => {
                  updateFormData({ generationMethod: method });
                }}
              />
            </CardContent>
          </Card>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Wrench className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plant & Equipment (Optional)</h3>
            <p className="text-gray-600 text-sm">
              Add any plant, equipment, or tools required for this project. This section is optional and will only appear in your SWMS if you add items.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Plant, Equipment & Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <PlantEquipmentSystem
                plantEquipment={formData.plantEquipment || []}
                onUpdate={(equipment) => updateFormData({ plantEquipment: equipment })}
              />
            </CardContent>
          </Card>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <PenTool className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digital Signatures (Optional)</h3>
            <p className="text-gray-600 text-sm">
              Digital signatures are optional. You can skip this step and proceed directly to generate your SWMS document.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Digital Signature Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium mb-2">Optional Step</p>
                <p className="text-gray-600">
                  Digital signatures are optional. You can skip this step and proceed directly to generate your SWMS document.
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

          <div className="mt-8 pt-6 border-t">
            <PDFPrintSystem
              swmsId={formData.draftId || `swms-${Date.now()}`}
              swmsTitle={formData.jobName || 'SWMS Document'}
              formData={formData}
              signatures={formData.signatures || []}
              isCompliant={formData.complianceStatus?.isCompliant || false}
            />
          </div>
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
      lastModified: new Date().toISOString()
    };
    setFormData(newData);
    if (onDataChange) onDataChange(newData);
  };

  useEffect(() => {
    setFormData(data);
  }, [data]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {translate("swms.step")} {currentStep} {translate("swms.of")} {TOTAL_STEPS}
          </h2>
          <div className="text-sm text-gray-500">
            {Math.round((currentStep / TOTAL_STEPS) * 100)}% {translate("swms.complete")}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <StepContent 
        step={currentStep} 
        formData={formData} 
        onDataChange={updateFormData} 
      />

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        
        <Button
          onClick={nextStep}
          disabled={currentStep === TOTAL_STEPS}
        >
          {currentStep === TOTAL_STEPS ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}