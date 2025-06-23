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
  Info,
  Heart,
  Save,
  CheckCircle,
  PenTool,
  CreditCard,
  Plus,
  X,
  Scale,
  Zap
} from "lucide-react";
import { SimplifiedTableEditor } from "./simplified-table-editor";
import GPTTaskSelection from "./gpt-task-selection";
import { translate } from "@/lib/language-direct";
import SmartTooltip from "@/components/ui/smart-tooltip";
import QuickActionTooltip, { presetTooltips } from "@/components/ui/quick-action-tooltip";
import AustralianAddressAutocomplete from "@/components/ui/australian-address-autocomplete";
import LiveSWMSPreviewer from "./live-swms-previewer";
import { RiskAssessmentMatrix } from "./risk-assessment-matrix";

const TOTAL_STEPS = 7;

// Function to generate default control measures based on common hazards
const getDefaultControlMeasures = (hazards: string[], taskName: string = '') => {
  const controls = [];
  const hazardText = hazards.join(' ').toLowerCase();
  const taskText = taskName.toLowerCase();
  
  // Height/Falls controls
  if (hazardText.includes('fall') || hazardText.includes('height') || hazardText.includes('ladder') || taskText.includes('roof')) {
    controls.push('Use appropriate fall protection equipment (harness, safety lines)');
    controls.push('Ensure all ladders are secured and inspected before use');
    controls.push('Maintain three points of contact when climbing');
  }
  
  // Manual handling controls
  if (hazardText.includes('lifting') || hazardText.includes('heavy') || hazardText.includes('manual')) {
    controls.push('Use proper lifting techniques - bend knees, keep back straight');
    controls.push('Use mechanical aids where possible (trolleys, hoists)');
    controls.push('Get assistance for heavy items over 23kg');
  }
  
  // Electrical controls
  if (hazardText.includes('electrical') || hazardText.includes('power') || taskText.includes('electrical')) {
    controls.push('Ensure all electrical equipment is tested and tagged');
    controls.push('Use RCD protection for all portable electrical tools');
    controls.push('Keep electrical equipment away from wet areas');
  }
  
  // Tool safety controls
  if (hazardText.includes('tool') || hazardText.includes('cutting') || hazardText.includes('sharp')) {
    controls.push('Inspect all tools before use and ensure guards are in place');
    controls.push('Wear appropriate PPE (safety glasses, gloves)');
    controls.push('Keep tools sharp and well maintained');
  }
  
  // Dust and respiratory controls
  if (hazardText.includes('dust') || hazardText.includes('fume') || taskText.includes('cutting') || taskText.includes('grinding')) {
    controls.push('Use dust extraction or water suppression methods');
    controls.push('Wear appropriate respiratory protection (P2 masks minimum)');
    controls.push('Ensure adequate ventilation in work area');
  }
  
  // Weather and environment controls
  if (hazardText.includes('weather') || hazardText.includes('sun') || hazardText.includes('heat')) {
    controls.push('Monitor weather conditions and cease work in unsafe conditions');
    controls.push('Provide shade and regular breaks in hot weather');
    controls.push('Ensure adequate hydration and sun protection');
  }
  
  // Communication and coordination controls
  if (hazardText.includes('communication') || hazardText.includes('noise') || hazardText.includes('coordination')) {
    controls.push('Use hand signals or radio communication in noisy environments');
    controls.push('Conduct pre-start meetings to coordinate activities');
    controls.push('Ensure clear communication protocols are established');
  }
  
  // If no specific controls found, add general ones
  if (controls.length === 0) {
    controls.push('Conduct toolbox talk before commencing work');
    controls.push('Ensure all workers are trained and competent');
    controls.push('Wear appropriate PPE as per site requirements');
  }
  
  return controls;
};

// Simple Disclaimer Component
const DisclaimerAcceptance = ({ acceptedDisclaimer, onAcceptanceChange }: { acceptedDisclaimer: boolean; onAcceptanceChange: (accepted: boolean) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>Legal Disclaimer and Terms</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-700">
            By proceeding, you acknowledge that this SWMS is generated for informational purposes and must be reviewed by qualified safety professionals before use on any worksite.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="disclaimer"
            checked={acceptedDisclaimer}
            onCheckedChange={onAcceptanceChange}
          />
          <Label htmlFor="disclaimer" className="text-sm">
            I accept the terms and conditions and understand the limitations of this tool
          </Label>
        </div>
      </div>
    </CardContent>
  </Card>
);

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
                  <Label htmlFor="jobNumber">Job Number *</Label>
                  <Input
                    id="jobNumber"
                    value={formData.jobNumber || ""}
                    onChange={(e) => updateFormData({ jobNumber: e.target.value })}
                    placeholder="Enter job number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => updateFormData({ startDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="projectAddress">Project Address *</Label>
                <AustralianAddressAutocomplete
                  id="projectAddress"
                  value={formData.projectAddress || ""}
                  onChange={(value) => updateFormData({ projectAddress: value })}
                  placeholder="Start typing Australian address..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="tradeType">Trade Type *</Label>
                {formData.tradeType === "Other" ? (
                  <div className="space-y-2">
                    <Input
                      value={formData.customTradeType || ""}
                      onChange={(e) => updateFormData({ customTradeType: e.target.value })}
                      placeholder="Enter your trade type"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateFormData({ tradeType: "", customTradeType: "" })}
                    >
                      Back to list
                    </Button>
                  </div>
                ) : (
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
                    
                    {/* Other Option */}
                    <SelectItem value="Other">Other (specify below)</SelectItem>
                  </SelectContent>
                </Select>
                )}
              </div>

              <div>
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Describe what tasks you'll be undertaking as part of this project"
                  rows={4}
                  className="placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Project Personnel Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Project Personnel</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="principalContractor">Principal Contractor *</Label>
                    <Input
                      id="principalContractor"
                      value={formData.principalContractor || ""}
                      onChange={(e) => updateFormData({ principalContractor: e.target.value })}
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectManager">Project Manager *</Label>
                    <Input
                      id="projectManager"
                      value={formData.projectManager || ""}
                      onChange={(e) => updateFormData({ projectManager: e.target.value })}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteSupervisor">Site Supervisor *</Label>
                    <Input
                      id="siteSupervisor"
                      value={formData.siteSupervisor || ""}
                      onChange={(e) => updateFormData({ siteSupervisor: e.target.value })}
                      placeholder="Full name"
                      required
                    />
                  </div>
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

          <GPTTaskSelection
            projectDetails={{
              projectName: formData.projectName || '',
              location: formData.projectLocation || '',
              tradeType: formData.tradeType || '',
              description: formData.projectDescription || ''
            }}
            onActivitiesGenerated={(activities: any[], plantEquipment: any[]) => {
              // Auto-detect PPE based on AI-generated activities
              const activityTexts = activities.map(activity => 
                `${activity.name || ''} ${activity.description || ''} ${
                  activity.hazards?.map((h: any) => `${h.type} ${h.description}`).join(' ') || ''
                } ${
                  activity.ppe?.join(' ') || ''
                }`
              ).join(' ').toLowerCase();
              
              console.log('Activity texts for PPE detection:', activityTexts);
              
              const detectedPPE = new Set<string>();
              
              // Always include standard PPE
              ['hard-hat', 'hi-vis-vest', 'steel-cap-boots', 'safety-glasses', 'gloves', 'hearing-protection', 'long-pants', 'long-sleeve-shirt'].forEach(ppe => detectedPPE.add(ppe));
              
              // Activity-specific PPE detection with extensive keywords
              if (activityTexts.includes('height') || activityTexts.includes('ladder') || activityTexts.includes('scaffold') || activityTexts.includes('fall') || activityTexts.includes('elevated')) {
                detectedPPE.add('safety-harness');
              }
              if (activityTexts.includes('dust') || activityTexts.includes('cutting') || activityTexts.includes('grinding') || activityTexts.includes('sanding') || activityTexts.includes('demolition')) {
                detectedPPE.add('dust-mask');
                detectedPPE.add('respirator');
              }
              if (activityTexts.includes('electrical') || activityTexts.includes('power') || activityTexts.includes('wiring') || activityTexts.includes('live electrical')) {
                detectedPPE.add('electrical-gloves');
              }
              if (activityTexts.includes('welding') || activityTexts.includes('torch') || activityTexts.includes('cutting torch') || activityTexts.includes('hot work')) {
                detectedPPE.add('welding-helmet');
              }
              if (activityTexts.includes('chemical') || activityTexts.includes('paint') || activityTexts.includes('solvent') || activityTexts.includes('adhesive')) {
                detectedPPE.add('chemical-gloves');
                detectedPPE.add('respirator');
              }
              if (activityTexts.includes('confined') || activityTexts.includes('space') || activityTexts.includes('enclosed')) {
                detectedPPE.add('confined-space-equipment');
              }
              if (activityTexts.includes('cut') || activityTexts.includes('sharp') || activityTexts.includes('blade') || activityTexts.includes('knife')) {
                detectedPPE.add('cut-resistant-gloves');
              }
              if (activityTexts.includes('tile') || activityTexts.includes('tiling') || activityTexts.includes('ceramic') || activityTexts.includes('grout')) {
                detectedPPE.add('knee-pads');
                detectedPPE.add('cut-resistant-gloves');
              }
              
              console.log('Detected PPE:', Array.from(detectedPPE));
              
              updateFormData({ 
                selectedTasks: activities,
                plantEquipment: plantEquipment,
                ppeRequirements: Array.from(detectedPPE),
                generationMethod: 'gpt'
              });
            }}
            onMethodSelected={(method: string) => {
              updateFormData({ generationMethod: method });
            }}
          />
        </div>
      );





    case 3:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Personal Protective Equipment (PPE)</h3>
            <p className="text-gray-600 text-sm">
              Select required PPE based on your work activities and identified risks
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-blue-600" />
                PPE Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.ppeRequirements && formData.ppeRequirements.length > 0 ? (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Info className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">
                      {formData.ppeRequirements.length} PPE Items Auto-Selected
                    </span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    PPE has been automatically selected based on your work activities and risk assessment. Review and adjust as needed.
                  </p>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Info className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-800">Select Required PPE</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Select the personal protective equipment required for your work activities.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Standard PPE */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Standard PPE Items (General Use)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { id: 'hard-hat', title: 'Hard Hat', description: 'Head protection from falling objects' },
                      { id: 'hi-vis-vest', title: 'Hi-Vis Vest/Shirt', description: 'Visibility on site' },
                      { id: 'steel-cap-boots', title: 'Steel Cap Boots', description: 'Foot protection from impact or puncture' },
                      { id: 'safety-glasses', title: 'Safety Glasses', description: 'Eye protection' },
                      { id: 'gloves', title: 'Gloves', description: 'General hand protection' },
                      { id: 'hearing-protection', title: 'Hearing Protection', description: 'Earplugs or earmuffs' },
                      { id: 'long-pants', title: 'Long Pants', description: 'Protection from abrasions and minor cuts' },
                      { id: 'long-sleeve-shirt', title: 'Long Sleeve Shirt', description: 'General body protection' },
                      { id: 'dust-mask', title: 'Dust Mask', description: 'Basic airborne dust protection' },
                      { id: 'sun-protection', title: 'Sun Protection', description: 'Hat, sunscreen - UV exposure control' }
                    ].map((ppe) => {
                      const isSelected = (formData.ppeRequirements || []).includes(ppe.id);
                      return (
                        <div 
                          key={ppe.id} 
                          className={`cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 hover:shadow-md ${
                            isSelected 
                              ? 'border-green-500 bg-green-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => {
                            const currentPPE = formData.ppeRequirements || [];
                            const updatedPPE = isSelected
                              ? currentPPE.filter(id => id !== ppe.id)
                              : [...currentPPE, ppe.id];
                            updateFormData({ ppeRequirements: updatedPPE });
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                              isSelected 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900 leading-tight">
                                {ppe.title}
                              </div>
                              <p className="text-xs text-gray-600 mt-1 leading-tight">
                                {ppe.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Task-Specific PPE */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    Task-Specific PPE
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { id: 'fall-arrest-harness', title: 'Fall Arrest Harness', description: 'Working at heights' },
                      { id: 'confined-space-breathing-apparatus', title: 'Confined Space Breathing Apparatus', description: 'Confined spaces or poor air quality' },
                      { id: 'welding-helmet-gloves', title: 'Welding Helmet & Gloves', description: 'Welding tasks' },
                      { id: 'cut-resistant-gloves', title: 'Cut-Resistant Gloves', description: 'Blade or glass handling' },
                      { id: 'face-shield', title: 'Face Shield', description: 'High-impact or chemical splash risk' },
                      { id: 'respirator', title: 'Respirator (Half/Full Face)', description: 'Hazardous fumes, chemicals, or dust' },
                      { id: 'chemical-resistant-apron', title: 'Chemical-Resistant Apron', description: 'Handling corrosive substances' },
                      { id: 'anti-static-clothing', title: 'Anti-Static Clothing', description: 'Electrical or explosive environments' },
                      { id: 'insulated-gloves', title: 'Insulated Gloves', description: 'Live electrical work' },
                      { id: 'fire-retardant-clothing', title: 'Fire-Retardant Clothing', description: 'Hot works / fire risk areas' },
                      { id: 'knee-pads', title: 'Knee Pads', description: 'Prolonged kneeling (e.g. flooring work)' },
                      { id: 'non-slip-footwear', title: 'Non-slip Footwear', description: 'Wet/slippery environments' },
                      { id: 'safety-harness-lanyard', title: 'Safety Harness & Lanyard', description: 'Elevated work or boom lift' },
                      { id: 'ear-canal-protectors', title: 'Ear Canal Protectors', description: 'High-decibel machinery use' },
                      { id: 'impact-goggles', title: 'Impact Goggles', description: 'Demolition or grinding tasks' }
                    ].map((ppe) => {
                      const isSelected = (formData.ppeRequirements || []).includes(ppe.id);
                      return (
                        <div 
                          key={ppe.id} 
                          className={`cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 hover:shadow-md ${
                            isSelected 
                              ? 'border-yellow-500 bg-yellow-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => {
                            const currentPPE = formData.ppeRequirements || [];
                            const updatedPPE = isSelected
                              ? currentPPE.filter(id => id !== ppe.id)
                              : [...currentPPE, ppe.id];
                            updateFormData({ ppeRequirements: updatedPPE });
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                              isSelected 
                                ? 'bg-yellow-500 border-yellow-500' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900 leading-tight">
                                {ppe.title}
                              </div>
                              <p className="text-xs text-gray-600 mt-1 leading-tight">
                                {ppe.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {(formData.ppeRequirements || []).length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Info className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">PPE Compliance</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Ensure all selected PPE meets Australian Standards and is properly maintained, inspected, and worn correctly. 
                    Provide appropriate training for specialized PPE equipment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );

    case 4:
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

    case 5:
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
                  <Label>Emergency Contacts</Label>
                  <div className="space-y-3 mt-2">
                    {(formData.emergencyContactsList || []).map((contact: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-sm">Contact {index + 1}</h5>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updated = (formData.emergencyContactsList || []).filter((_: any, i: number) => i !== index);
                              updateFormData({ emergencyContactsList: updated });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input
                            placeholder="Contact Name/Organization"
                            value={contact.name || ""}
                            onChange={(e) => {
                              const updated = [...(formData.emergencyContactsList || [])];
                              updated[index] = { ...updated[index], name: e.target.value };
                              updateFormData({ emergencyContactsList: updated });
                            }}
                          />
                          <Input
                            placeholder="Phone Number"
                            value={contact.phone || ""}
                            onChange={(e) => {
                              const updated = [...(formData.emergencyContactsList || [])];
                              updated[index] = { ...updated[index], phone: e.target.value };
                              updateFormData({ emergencyContactsList: updated });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newContact = { name: "", phone: "" };
                        const updated = [...(formData.emergencyContactsList || []), newContact];
                        updateFormData({ emergencyContactsList: updated });
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Emergency Contact
                    </Button>
                    
                    {(!formData.emergencyContactsList || formData.emergencyContactsList.length === 0) && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-800 text-sm font-medium mb-1">Optional Step</p>
                        <p className="text-amber-700 text-sm">
                          Emergency contacts are optional. This section will only appear in your SWMS if you add content.
                        </p>
                      </div>
                    )}
                  </div>
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

    case 6:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <CreditCard className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment & Access</h3>
            <p className="text-gray-600 text-sm">
              Complete your payment to finalize and download your SWMS document.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Use Current Credits Option */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-green-800">Use Current Credits</p>
                      <p className="text-green-700 text-sm">You have 10 SWMS credits remaining from your subscription</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      10 Credits
                    </Badge>
                  </div>
                  <Button 
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      updateFormData({ paymentMethod: 'credits', paid: true });
                      // Move to next step (Legal Disclaimer)
                      window.location.href = '/swms-builder?step=6';
                    }}
                  >
                    Use Current Credits (1 credit)
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Or purchase additional credits or upgrade:
                  </p>
                  
                  {/* Show only One-Off SWMS and Credit Pack for subscription users */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={() => window.location.href = '/payment?plan=one-off'}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      One-Off SWMS ($15)
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => window.location.href = '/payment?plan=credits'}
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Credit Pack ($65)
                    </Button>
                  </div>
                  
                  {/* Admin Demo Toggle - Only visible to admin */}
                  {localStorage.getItem('isAppAdmin') === 'true' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm font-medium mb-2">Admin Demo Mode</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          localStorage.setItem('adminDemoMode', 'true');
                          updateFormData({ adminDemoBypass: true });
                        }}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        Proceed with Demo Access
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 7:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Scale className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Legal Disclaimer</h3>
            <p className="text-gray-600 text-sm">
              Review and accept the terms and liability disclaimer to proceed.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Legal Disclaimer and Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm text-gray-700 mb-4 space-y-3">
                  <p className="font-semibold">IMPORTANT LEGAL DISCLAIMER AND LIMITATION OF LIABILITY</p>
                  
                  <p>This Safe Work Method Statement (SWMS) is generated as a template using artificial intelligence and automated systems. By using this document, you acknowledge and agree that:</p>
                  
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Professional Review Required:</strong> This SWMS template must be thoroughly reviewed, customized, and approved by qualified safety professionals, competent persons, or licensed practitioners before any implementation or use on site.</li>
                    
                    <li><strong>Site-Specific Adaptation:</strong> You are solely responsible for ensuring this document is appropriately modified to reflect actual site conditions, specific hazards, applicable regulations, and industry standards relevant to your workplace and jurisdiction.</li>
                    
                    <li><strong>Compliance Responsibility:</strong> You acknowledge that compliance with all applicable workplace health and safety laws, regulations, codes of practice, and industry standards is your sole responsibility.</li>
                    
                    <li><strong>No Warranties:</strong> This service and document are provided "as is" without any express or implied warranties of accuracy, completeness, fitness for purpose, or compliance with specific regulatory requirements.</li>
                    
                    <li><strong>Limitation of Liability:</strong> To the maximum extent permitted by law, our company, its directors, employees, and affiliates shall not be liable for any direct, indirect, consequential, special, or punitive damages arising from the use or inability to use this document, including but not limited to workplace injuries, regulatory penalties, or business losses.</li>
                    
                    <li><strong>Indemnification:</strong> You agree to indemnify and hold harmless our company from any claims, damages, losses, or expenses arising from your use of this SWMS document.</li>
                  </ul>
                  
                  <p className="font-medium">This document does not constitute professional safety advice. Always consult qualified safety professionals for workplace-specific guidance.</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="disclaimer"
                    checked={formData.acceptedDisclaimer || false}
                    onCheckedChange={(checked) => updateFormData({ acceptedDisclaimer: checked })}
                    className="mt-1"
                  />
                  <Label htmlFor="disclaimer" className="text-sm leading-relaxed">
                    I have read, understood, and accept these terms and conditions. I acknowledge that this document requires professional review and site-specific customization before use, and I understand the limitations of liability outlined above.
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 8:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Digital Signatures & PDF Generation</h3>
            <p className="text-gray-600 text-sm">
              Generate complete SWMS document with optional digital signatures
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Digital Signature Collection (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium mb-2">Optional Step</p>
                <p className="text-gray-600">
                  Digital signatures are optional. You can proceed directly to generate your SWMS document.
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