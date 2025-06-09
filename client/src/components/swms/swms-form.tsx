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
            <h3 className="text-lg font-semibold mb-2">Project & Contractor Details</h3>
            <p className="text-gray-600 text-sm">
              Project information, contractor details, and high-risk work identification
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
            <h3 className="text-lg font-semibold mb-2">Work Activities & Risk Assessment</h3>
            <p className="text-gray-600 text-sm">
              Detailed work breakdown and comprehensive risk assessments
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Work Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workDescription">Work Description</Label>
                <Textarea
                  id="workDescription"
                  value={formData.workDescription || ""}
                  onChange={(e) => updateFormData({ workDescription: e.target.value })}
                  placeholder="Describe the work activities and tasks to be performed"
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

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <SimplifiedTableEditor 
                riskAssessments={formData.riskAssessments || []}
                onUpdate={(assessments) => updateFormData({ riskAssessments: assessments })}
                tradeType={formData.tradeType || 'General'}
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
            <h3 className="text-lg font-semibold mb-2">Plant, Equipment & Training</h3>
            <p className="text-gray-600 text-sm">
              Equipment specifications, training requirements, and permits
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

    case 4:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Emergency & Monitoring</h3>
            <p className="text-gray-600 text-sm">
              Emergency procedures and review/monitoring processes
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Procedures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact || ""}
                  onChange={(e) => updateFormData({ emergencyContact: e.target.value })}
                  placeholder="Emergency contact number"
                />
              </div>
              <div>
                <Label htmlFor="evacuationPlan">Evacuation Procedures</Label>
                <Textarea
                  id="evacuationPlan"
                  value={formData.evacuationPlan || ""}
                  onChange={(e) => updateFormData({ evacuationPlan: e.target.value })}
                  placeholder="Describe evacuation procedures and emergency exits"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="monitoringProcedures">Monitoring & Review Process</Label>
                <Textarea
                  id="monitoringProcedures"
                  value={formData.monitoringProcedures || ""}
                  onChange={(e) => updateFormData({ monitoringProcedures: e.target.value })}
                  placeholder="Describe how work will be monitored and reviewed"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Legal Disclaimer</h3>
            <p className="text-gray-600 text-sm">
              Accept terms and liability disclaimer
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Legal Disclaimer</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  By proceeding with this SWMS document, you acknowledge that:
                </p>
                <ul className="text-sm text-gray-700 mt-2 space-y-1 list-disc list-inside">
                  <li>This document is a template and must be reviewed by qualified safety professionals</li>
                  <li>Site-specific hazards and conditions must be assessed independently</li>
                  <li>All work must comply with current Australian WHS legislation and standards</li>
                  <li>Regular review and updates of this SWMS are required</li>
                  <li>The principal contractor is responsible for final approval and implementation</li>
                </ul>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="disclaimer"
                  checked={formData.acceptedDisclaimer || false}
                  onCheckedChange={(checked) => updateFormData({ acceptedDisclaimer: checked })}
                />
                <Label htmlFor="disclaimer" className="text-sm leading-relaxed">
                  I acknowledge that I have read, understood, and accept the terms and conditions above. 
                  I understand that this SWMS must be reviewed by appropriate safety professionals before implementation.
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Final Document</h3>
            <p className="text-gray-600 text-sm">
              Generate complete SWMS document with all sections and compliance validation
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Generation & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Document Ready</h4>
                <p className="text-sm text-green-700">
                  Your SWMS document is ready for generation with all required sections completed.
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
            </CardContent>
          </Card>
        </div>
      );

    case 7:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <PenTool className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digital Signatures & PDF</h3>
            <p className="text-gray-600 text-sm">
              Optional signatures and final PDF generation
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
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