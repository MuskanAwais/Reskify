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

const TOTAL_STEPS = 7;

interface StepContentProps {
  step: number;
  formData: any;
  onDataChange: (data: any) => void;
}

interface SWMSFormProps {
  step: number;
  data?: any;
  onNext?: () => void;
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
                <Label htmlFor="jobName">Job Name *</Label>
                <Input
                  id="jobName"
                  value={formData.jobName || ""}
                  onChange={(e) => updateFormData({ jobName: e.target.value })}
                  placeholder="Enter job name"
                  required
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
                <Label htmlFor="projectAddress">Project Address *</Label>
                <Input
                  id="projectAddress"
                  value={formData.projectAddress || ""}
                  onChange={(e) => updateFormData({ projectAddress: e.target.value })}
                  placeholder="Enter project address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tradeType">Trade Type *</Label>
                <Select
                  value={formData.tradeType || ""}
                  onValueChange={(value) => updateFormData({ tradeType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-96 overflow-y-auto">
                    {/* Core Construction Trades */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Core Construction</div>
                    <SelectItem value="General Construction">General Construction</SelectItem>
                    <SelectItem value="Carpentry & Joinery">Carpentry & Joinery</SelectItem>
                    <SelectItem value="Bricklaying & Masonry">Bricklaying & Masonry</SelectItem>
                    <SelectItem value="Concreting & Cement Work">Concreting & Cement Work</SelectItem>
                    <SelectItem value="Steel Fixing & Welding">Steel Fixing & Welding</SelectItem>
                    <SelectItem value="Roofing & Guttering">Roofing & Guttering</SelectItem>
                    <SelectItem value="Tiling & Waterproofing">Tiling & Waterproofing</SelectItem>
                    <SelectItem value="Painting & Decorating">Painting & Decorating</SelectItem>
                    <SelectItem value="Glazing & Window Installation">Glazing & Window Installation</SelectItem>
                    <SelectItem value="Flooring & Floor Coverings">Flooring & Floor Coverings</SelectItem>
                    <SelectItem value="Plastering & Rendering">Plastering & Rendering</SelectItem>
                    <SelectItem value="Insulation Installation">Insulation Installation</SelectItem>
                    <SelectItem value="Cladding & External Finishes">Cladding & External Finishes</SelectItem>
                    
                    {/* Mechanical & Electrical */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Mechanical & Electrical</div>
                    <SelectItem value="Electrical Installation">Electrical Installation</SelectItem>
                    <SelectItem value="Air Conditioning & Refrigeration">Air Conditioning & Refrigeration</SelectItem>
                    <SelectItem value="Plumbing & Gasfitting">Plumbing & Gasfitting</SelectItem>
                    <SelectItem value="Fire Protection Systems">Fire Protection Systems</SelectItem>
                    <SelectItem value="Security Systems Installation">Security Systems Installation</SelectItem>
                    <SelectItem value="Communications & Data Cabling">Communications & Data Cabling</SelectItem>
                    <SelectItem value="Solar & Renewable Energy">Solar & Renewable Energy</SelectItem>
                    <SelectItem value="Mechanical Services">Mechanical Services</SelectItem>
                    <SelectItem value="Lift & Escalator Installation">Lift & Escalator Installation</SelectItem>
                    <SelectItem value="Pool & Spa Construction">Pool & Spa Construction</SelectItem>
                    
                    {/* Specialist Construction */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Specialist Construction</div>
                    <SelectItem value="Demolition & Asbestos Removal">Demolition & Asbestos Removal</SelectItem>
                    <SelectItem value="Excavation & Earthworks">Excavation & Earthworks</SelectItem>
                    <SelectItem value="Scaffolding & Access">Scaffolding & Access</SelectItem>
                    <SelectItem value="Crane & Rigging Operations">Crane & Rigging Operations</SelectItem>
                    <SelectItem value="Piling & Foundations">Piling & Foundations</SelectItem>
                    <SelectItem value="Road Construction & Civil Works">Road Construction & Civil Works</SelectItem>
                    <SelectItem value="Bridge & Infrastructure">Bridge & Infrastructure</SelectItem>
                    <SelectItem value="Tunneling & Underground">Tunneling & Underground</SelectItem>
                    <SelectItem value="Marine Construction">Marine Construction</SelectItem>
                    <SelectItem value="High-Rise Construction">High-Rise Construction</SelectItem>
                    
                    {/* Finishing & Specialist */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Finishing & Specialist</div>
                    <SelectItem value="Landscape Construction">Landscape Construction</SelectItem>
                    <SelectItem value="Fencing & Gates">Fencing & Gates</SelectItem>
                    <SelectItem value="Signage Installation">Signage Installation</SelectItem>
                    <SelectItem value="Kitchen & Bathroom Installation">Kitchen & Bathroom Installation</SelectItem>
                    <SelectItem value="Curtain Wall Installation">Curtain Wall Installation</SelectItem>
                    <SelectItem value="Stonework & Natural Stone">Stonework & Natural Stone</SelectItem>
                    <SelectItem value="Shopfitting & Joinery">Shopfitting & Joinery</SelectItem>
                    <SelectItem value="Heritage & Restoration">Heritage & Restoration</SelectItem>
                    <SelectItem value="Green Roof & Living Walls">Green Roof & Living Walls</SelectItem>
                    <SelectItem value="Architectural Metalwork">Architectural Metalwork</SelectItem>
                    
                    {/* Industrial & Specialist */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Industrial & Specialist</div>
                    <SelectItem value="Industrial Maintenance">Industrial Maintenance</SelectItem>
                    <SelectItem value="Mining Construction">Mining Construction</SelectItem>
                    <SelectItem value="Petrochemical Construction">Petrochemical Construction</SelectItem>
                    <SelectItem value="Food Processing Facilities">Food Processing Facilities</SelectItem>
                    <SelectItem value="Clean Room Construction">Clean Room Construction</SelectItem>
                    <SelectItem value="Hospital & Medical Facilities">Hospital & Medical Facilities</SelectItem>
                    <SelectItem value="Educational Facilities">Educational Facilities</SelectItem>
                    <SelectItem value="Aged Care Construction">Aged Care Construction</SelectItem>
                    <SelectItem value="Data Centre Construction">Data Centre Construction</SelectItem>
                    <SelectItem value="Warehouse & Logistics">Warehouse & Logistics</SelectItem>
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
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Emergency & Monitoring (Optional)</h3>
            <p className="text-gray-600 text-sm">
              Emergency procedures and monitoring processes are optional. You can skip this step if not required for your project.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Procedures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-orange-800 font-medium mb-2">Optional Step</p>
                <p className="text-gray-600">
                  Emergency procedures and monitoring are optional. This section will only appear in your SWMS if you add content.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="emergencyContacts">Emergency Contacts</Label>
                  <Textarea
                    id="emergencyContacts"
                    placeholder="List emergency contact numbers and procedures..."
                    value={formData.emergencyContacts || ""}
                    onChange={(e) => updateFormData({ emergencyContacts: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyProcedures">Emergency Response Procedures</Label>
                  <Textarea
                    id="emergencyProcedures"
                    placeholder="Describe emergency response procedures, evacuation routes, assembly points..."
                    value={formData.emergencyProcedures || ""}
                    onChange={(e) => updateFormData({ emergencyProcedures: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="monitoringRequirements">Monitoring & Review Requirements</Label>
                  <Textarea
                    id="monitoringRequirements"
                    placeholder="Describe monitoring requirements, review schedules, compliance checks..."
                    value={formData.monitoringRequirements || ""}
                    onChange={(e) => updateFormData({ monitoringRequirements: e.target.value })}
                    rows={3}
                  />
                </div>
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
              Review and accept the terms and liability disclaimer to proceed.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700 mb-4">
                  By proceeding, you acknowledge that this SWMS document is generated as a template and must be reviewed by qualified safety professionals before use on site.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="disclaimer"
                    checked={formData.disclaimerAccepted || false}
                    onCheckedChange={(checked) => updateFormData({ disclaimerAccepted: checked })}
                  />
                  <Label htmlFor="disclaimer" className="text-sm">
                    I accept the terms and conditions and understand this document requires professional review
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <CheckSquare className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Final Document</h3>
            <p className="text-gray-600 text-sm">
              Generate your complete SWMS document ready for use.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Your SWMS is ready to be generated with all the information you've provided.</p>
                <Button 
                  size="lg"
                  onClick={() => updateFormData({ documentGenerated: true })}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate SWMS Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 7:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <PenTool className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digital Signatures & PDF (Optional)</h3>
            <p className="text-gray-600 text-sm">
              Digital signatures are optional. You can skip this step and proceed directly to download your SWMS document.
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

export default function SWMSForm({ step, data = {}, onNext, onDataChange }: SWMSFormProps) {
  const [formData, setFormData] = useState(data);

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Content */}
      <StepContent 
        step={step} 
        formData={formData} 
        onDataChange={updateFormData} 
      />
    </div>
  );
}