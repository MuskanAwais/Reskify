import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import RiskComplianceChecker from "./risk-compliance-checker";
import { SWMSPrintInterface } from './SWMSPrintInterface';

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
  Zap,
  Package,
  Loader2,
  User,
  Users,
  Download,
  AlertCircle,
  ClipboardList,
  Crown
} from "lucide-react";
import { SimplifiedTableEditor } from "./simplified-table-editor";
import GPTTaskSelection from "./gpt-task-selection";
import { translate } from "@/lib/language-direct";
import SmartTooltip from "@/components/ui/smart-tooltip";
import QuickActionTooltip, { presetTooltips } from "@/components/ui/quick-action-tooltip";
import AustralianAddressAutocomplete from "@/components/ui/australian-address-autocomplete";
import VisualPDFPreviewer from "./visual-pdf-previewer";
import { RiskAssessmentMatrix } from "./risk-assessment-matrix";
import SwmsComplete from "./SwmsComplete";

const TOTAL_STEPS = 9;

// PDF Generation Component with SWMSprint Integration
const AutomaticPDFGeneration = ({ formData, onDataChange }: { formData: any; onDataChange: any }) => {
  const [currentMessage, setCurrentMessage] = useState('Initializing document generation...');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    console.log('AutomaticPDFGeneration component loaded - Step 9 is working');
    console.log('Form data received:', formData);
    
    const generatePDF = async () => {
      try {
        // Step 1: Prepare data
        setCurrentMessage('Preparing SWMS data...');
        setProgress(20);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Connect to SWMSprint
        setCurrentMessage('Generating professional PDF document...');
        setProgress(40);
        
        const pdfData = {
          jobName: formData.jobName || 'SWMS Document',
          jobNumber: formData.jobNumber || '',
          projectAddress: formData.projectAddress || '',
          startDate: formData.startDate || '',
          tradeType: formData.tradeType || 'General',
          swmsCreatorName: formData.swmsCreatorName || '',
          principalContractor: formData.principalContractor || '',
          projectManager: formData.projectManager || '',
          siteSupervisor: formData.siteSupervisor || '',
          activities: formData.workActivities || formData.selectedTasks || [],
          riskAssessments: formData.riskAssessments || [],
          hrcwCategories: formData.hrcwCategories || [],
          ppeRequirements: formData.ppeRequirements || [],
          plantEquipment: formData.plantEquipment || [],
          emergencyProcedures: formData.emergencyProcedures || [],
          signatures: formData.signatures || []
        };

        // Step 3: Generate PDF via SWMSprint
        setProgress(60);
        setCurrentMessage('Generating professional PDF document...');
        
        const response = await fetch('/api/swms/pdf-download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pdfData)
        });

        if (response.ok) {
          setProgress(80);
          setCurrentMessage('Processing PDF download...');
          
          const pdfBlob = await response.blob();
          setProgress(90);
          
          // Create download link
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${formData.jobName || 'SWMS'}-${Date.now()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          setProgress(100);
          setCurrentMessage('PDF download complete!');
          
          toast({
            title: "PDF Generated Successfully",
            description: "Your SWMS document has been downloaded to your computer.",
          });
          
        } else {
          throw new Error('PDF generation failed - please try again');
        }
        
      } catch (error) {
        console.error('PDF generation error:', error);
        setCurrentMessage('PDF generation encountered an error. Please try again.');
        setProgress(0);
        
        toast({
          title: "PDF Generation Error",
          description: "There was an issue generating your PDF. Please try again.",
          variant: "destructive"
        });
      }
    };

    generatePDF();
  }, []);

  const handleTryAgain = () => {
    setProgress(0);
    setCurrentMessage('Initializing document generation...');
    // Trigger regeneration by reloading the component
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Document Generation</h2>
          <p className="text-gray-600">Creating your professional SWMS document</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-700 font-medium">{currentMessage}</p>
            </div>

            {/* Action buttons based on status */}
            {currentMessage.includes('error') && (
              <div className="text-center space-y-3">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="text-amber-800 font-medium">PDF Generation Error</span>
                  </div>
                  <p className="text-amber-700 text-sm">
                    There was an issue generating your PDF. Please try again.
                  </p>
                </div>
                <Button 
                  onClick={handleTryAgain}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Try PDF Generation Again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Return to Dashboard
                </Button>
              </div>
            )}

            {currentMessage.includes('failed') && !currentMessage.includes('not running') && (
              <div className="text-center space-y-3">
                <Button onClick={handleTryAgain} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Return to Dashboard
                </Button>
              </div>
            )}

            {progress === 100 && currentMessage.includes('complete') && (
              <div className="text-center space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">PDF Successfully Downloaded</span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Return to Dashboard
                </Button>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
  onNext?: () => void;
  isProcessingCredit?: boolean;
  setIsProcessingCredit?: (value: boolean) => void;
  userData?: any;
  isLoadingCredits?: boolean;
  creditsError?: any;
  userBillingData?: any;
  isLoadingUserCredits?: boolean;
  userCreditsError?: any;
}

export interface SwmsFormData {
  id?: number;
  projectName?: string;
  jobName?: string;
  jobNumber?: string;
  projectAddress?: string;
  projectLocation?: string;
  startDate?: string;
  duration?: string;
  projectDescription?: string;
  workDescription?: string;
  swmsCreatorName?: string;
  swmsCreatorPosition?: string;
  principalContractor?: string;
  principalContractorAbn?: string;
  projectManager?: string;
  siteSupervisor?: string;
  subcontractor?: string;
  subcontractorAbn?: string;
  responsiblePersons?: string[];
  authorisingSignature?: string;
  licenseNumber?: string;
  documentVersion?: string;
  signatureMethod?: string;
  signatureImage?: string;
  signatureText?: string;
  signatureSection?: any;
  signatures?: any[];
  tradeType?: string;
  activities?: string[];
  workActivities?: any[];
  riskAssessments?: any[];
  isHighRiskWork?: boolean;
  highRiskActivities?: string[];
  whsRegulations?: string[];
  highRiskJustification?: string;
  hrcwCategories?: string[];
  ppeRequirements?: string[];
  plantEquipment?: any[];
  trainingRequirements?: string[];
  competencyRequirements?: string[];
  permitsRequired?: string[];
  emergencyProcedures?: string[];
  nearestHospital?: string;
  generalRequirements?: string[];
  acceptedDisclaimer?: boolean;
  selectedTasks?: string[];
  paidAccess?: boolean;
  paid?: boolean;
  creditsUsed?: number; // This should be a number, not boolean
  paymentMethod?: string;
  plainTextDescription?: string;
  monitoringRequirements?: string;
  lastPaymentUpdate?: number;
  lastModified?: string;
  companyLogo?: string;
  companyName?: string;
  abn?: string;
  status?: string;
  currentStep?: number;
}

interface SWMSFormProps {
  step: number;
  data?: any;
  onNext?: () => void;
  onDataChange?: (data: any) => void;
  userData?: any;
  isLoadingCredits?: boolean;
  creditsError?: any;
  setIsProcessingCredit?: (processing: boolean) => void;
}

const StepContent = ({ step, formData, onDataChange, onNext, isProcessingCredit, setIsProcessingCredit, userData, isLoadingCredits, creditsError, userBillingData, isLoadingUserCredits, userCreditsError }: StepContentProps) => {
  const { toast } = useToast();

  // Define credit variables for payment step
  const fallbackCredits = { credits: 0, subscriptionCredits: 0, addonCredits: 0 };
  const [isManualFetch, setIsManualFetch] = useState(false);
  const [fallbackCreditsState, setFallbackCredits] = useState(fallbackCredits);
  
  // Use userBillingData, then userData, then fallback
  const creditData = userBillingData || userData || fallbackCreditsState;
  const totalCredits = creditData?.credits || 0;
  const subscriptionCredits = creditData?.subscriptionCredits || 0;
  const addonCredits = creditData?.addonCredits || 0;
  const hasCredits = totalCredits > 0;
  
  // ENHANCED DEBUG: Log all credit sources when on payment step
  if (step === 6) {
    console.log('🔍 PAYMENT STEP COMPREHENSIVE CREDIT DEBUG:');
    console.log('userBillingData:', userBillingData);
    console.log('userData:', userData);
    console.log('fallbackCreditsState:', fallbackCreditsState);
    console.log('SELECTED creditData:', creditData);
    console.log('totalCredits:', totalCredits);
    console.log('subscriptionCredits:', subscriptionCredits);
    console.log('addonCredits:', addonCredits);
    console.log('hasCredits:', hasCredits);
    console.log('isLoadingUserCredits:', isLoadingUserCredits);
    console.log('userCreditsError:', userCreditsError);
    console.log('isLoadingCredits:', isLoadingCredits);
    console.log('creditsError:', creditsError);
  }

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
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription || ""}
                  onChange={(e) => updateFormData({ projectDescription: e.target.value })}
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
                
                {/* Person creating and authorising SWMS */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-medium text-blue-900 mb-3">Person Creating and Authorising SWMS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="swmsCreatorName">Name *</Label>
                      <Input
                        id="swmsCreatorName"
                        value={formData.swmsCreatorName || ""}
                        onChange={(e) => updateFormData({ swmsCreatorName: e.target.value })}
                        placeholder="Full name of person creating SWMS"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="swmsCreatorPosition">Position *</Label>
                      <Input
                        id="swmsCreatorPosition"
                        value={formData.swmsCreatorPosition || ""}
                        onChange={(e) => updateFormData({ swmsCreatorPosition: e.target.value })}
                        placeholder="Job title/position"
                        required
                      />
                    </div>
                  </div>
                  

                </div>

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


            </CardContent>
          </Card>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-primary mb-4" />
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
            savedWorkDescription={formData.workDescription || formData.projectDescription || ''}
            savedActivities={formData.workActivities || formData.activities || []}
            onActivitiesGenerated={(activities: any[], plantEquipment: any[], workDescription?: string) => {
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
              
              const updateData: any = { 
                activities: activities,
                selectedTasks: activities,
                plantEquipment: plantEquipment,
                ppeRequirements: Array.from(detectedPPE),
                generationMethod: 'gpt'
              };
              
              // Save work description if provided
              if (workDescription) {
                updateData.workDescription = workDescription;
              }
              
              updateFormData(updateData);
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
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
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
                              ? currentPPE.filter((id: string) => id !== ppe.id)
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
                              ? currentPPE.filter((id: string) => id !== ppe.id)
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
            <AlertTriangle className="mx-auto h-12 w-12 text-primary mb-4" />
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
      // Payment step - implement payment logic here if needed
      return (
        <div className="space-y-6">
          <div className="text-center">
            <CreditCard className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment (Skipped in Demo)</h3>
            <p className="text-gray-600 text-sm">
              This step handles payment processing. Currently skipped in demo mode.
            </p>
          </div>
        </div>
      );



    case 8:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <PenTool className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Signatures</h3>
            <p className="text-gray-600 text-sm">
              Add authorizing signatures for document validation
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Use Current Credits Option */}
                {isLoadingCredits ? (
                  <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-blue-800">Loading Credits...</p>
                        <p className="text-sm text-blue-700">Checking your available credits</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 border rounded-lg ${hasCredits ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className={`font-medium ${hasCredits ? 'text-green-800' : 'text-red-800'}`}>
                          {hasCredits ? 'Use Current Credits' : 'No Credits Available'}
                        </p>
                        <p className={`text-sm ${hasCredits ? 'text-green-700' : 'text-red-700'}`}>
                          {hasCredits 
                            ? `You have ${totalCredits} total credits available (${subscriptionCredits} subscription + ${addonCredits} add-on)`
                            : 'You need to purchase credits or use a payment option below to continue'
                          }
                        </p>
                      </div>
                      <Badge className={`${hasCredits ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {totalCredits} Credits
                      </Badge>
                    </div>
                    <Button 
                      size="lg"
                      className={`w-full ${hasCredits ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                      disabled={isProcessingCredit || !hasCredits}
                      onClick={async (e) => {
                        console.log('🎯 === USE CREDIT BUTTON CLICKED ===');
                        console.log('Event object:', e);
                        console.log('hasCredits:', hasCredits);
                        console.log('isProcessingCredit:', isProcessingCredit);
                        console.log('Button disabled state:', isProcessingCredit || !hasCredits);
                        console.log('Button element:', e.target);
                        console.log('Credit check - totalCredits:', totalCredits);
                        console.log('Credit check - creditData:', creditData);
                        
                        // If button is disabled, prevent execution
                        if (isProcessingCredit || !hasCredits) {
                          console.log('❌ Button execution blocked - disabled state');
                          return;
                        }
                        
                        if (!hasCredits) {
                          alert('You have no credits available. Please purchase credits below.');
                          return;
                        }
                        if (isProcessingCredit) return; // Prevent double clicks
                    
                        setIsProcessingCredit?.(true);
                        console.log('Credit button clicked - starting process');
                        
                        try {
                          // Call the credit usage API with admin demo headers
                          const response = await fetch('/api/user/use-credit', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'x-admin-demo': localStorage.getItem('adminDemoMode') || 'false',
                              'x-app-admin': localStorage.getItem('isAppAdmin') || 'false',
                            },
                            credentials: 'include',
                          });

                          console.log('Credit API response status:', response.status);
                          const result = await response.json();
                          console.log('Credit API response:', result);

                          if (response.ok) {
                            console.log('Credit used successfully:', result);
                            
                            // Immediately update form data to indicate payment is complete
                            updateFormData({ 
                              paymentMethod: 'credits', 
                              paid: true,
                              creditsUsed: 1,
                              paidAccess: true,  // This is what the step validation checks for
                              lastPaymentUpdate: Date.now() // Force refresh
                            });
                            
                            // Proceed immediately - don't wait for cache invalidation
                            console.log('Payment completed successfully with credits - proceeding to next step immediately');
                            if (onNext) {
                              onNext();
                            } else {
                              console.log('WARNING: onNext is not available');
                            }
                            
                            // Invalidate cache in background for next time (don't await)
                            setTimeout(() => {
                              queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/999'] });
                              queryClient.invalidateQueries({ queryKey: ['/api/user/billing'] });
                            }, 0);
                            
                          } else {
                            console.error('Failed to use credit:', response.statusText);
                            alert('Failed to process credit usage. Please try again.');
                          }
                        } catch (error) {
                          console.error('Error using credit:', error);
                          // Show more helpful error message
                          if (onNext) {
                            console.log('Error occurred, calling onNext anyway for demo');
                            onNext(); // Allow progression anyway for demo
                          }
                        } finally {
                          setIsProcessingCredit?.(false);
                        }
                      }}
                    >
                      {hasCredits ? 'Use Current Credits (1 credit)' : 'No Credits Available'}
                    </Button>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Or purchase additional credits or upgrade:
                  </p>
                  
                  {/* Real Stripe Payment Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* One-off SWMS Purchase */}
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/create-payment-intent', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                              amount: 1500, // $15.00 in cents
                              currency: 'aud',
                              product: 'One-off SWMS',
                              quantity: 1
                            })
                          });

                          if (response.ok) {
                            const { url } = await response.json();
                            window.open(url, '_blank');
                          } else {
                            toast({
                              title: "Payment Error",
                              description: "Unable to create payment session. Please try again.",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          console.error('Payment error:', error);
                          toast({
                            title: "Payment Error", 
                            description: "Something went wrong. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      One SWMS - $15
                    </Button>

                    {/* Credit Pack Purchase */}
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/create-payment-intent', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                              amount: 6000, // $60.00 in cents
                              currency: 'aud',
                              product: '5 SWMS Credit Pack',
                              quantity: 1
                            })
                          });

                          if (response.ok) {
                            const { url } = await response.json();
                            window.open(url, '_blank');
                          } else {
                            toast({
                              title: "Payment Error",
                              description: "Unable to create payment session. Please try again.",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          console.error('Payment error:', error);
                          toast({
                            title: "Payment Error",
                            description: "Something went wrong. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      5 Credits - $60
                    </Button>

                    {/* Subscription Option */}
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/create-payment-intent', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                              amount: 4900, // $49.00 in cents
                              currency: 'aud',
                              product: 'Pro Monthly Subscription',
                              quantity: 1,
                              subscription: true
                            })
                          });

                          if (response.ok) {
                            const { url } = await response.json();
                            window.open(url, '_blank');
                          } else {
                            toast({
                              title: "Payment Error",
                              description: "Unable to create payment session. Please try again.",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          console.error('Payment error:', error);
                          toast({
                            title: "Payment Error",
                            description: "Something went wrong. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Pro Plan - $49/mo
                    </Button>
                  </div>

                  {/* Demo Payment Options */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Demo Mode (Testing Only):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={async () => {
                        console.log('DEMO $15 BUTTON CLICKED');
                        // For demo purposes, simulate payment success
                        const confirmed = confirm('DEMO MODE: Simulate $15 payment for One-Off SWMS?');
                        console.log('User confirmed demo payment:', confirmed);
                        if (confirmed) {
                          try {
                            console.log('Making demo payment API call...');
                            const response = await fetch('/api/user/add-credits', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include',
                              body: JSON.stringify({
                                amount: 1,
                                type: 'demo-payment'
                              })
                            });

                            if (response.ok) {
                              alert('Demo payment successful! 1 credit added to your account.');
                              // Invalidate all user-related queries to refresh credit balance
                              queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                              queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                              queryClient.invalidateQueries({ queryKey: ["credits"] });
                              // Force re-render of payment step to show updated credits
                              updateFormData({ lastPaymentUpdate: Date.now() });
                              // Wait a moment then refetch user data
                              setTimeout(() => {
                                queryClient.refetchQueries({ queryKey: ["/api/user"] });
                              }, 500);
                            } else {
                              alert('Demo payment failed. Please try again.');
                            }
                          } catch (error) {
                            console.error('Error:', error);
                            alert('Error processing demo payment.');
                          }
                        }
                      }}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Demo: One-Off SWMS ($15)
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={async () => {
                        // For demo purposes, simulate payment success
                        const confirmed = confirm('DEMO MODE: Simulate $60 payment for 5 SWMS Credits?');
                        if (confirmed) {
                          try {
                            const response = await fetch('/api/user/add-credits', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include',
                              body: JSON.stringify({
                                amount: 5,
                                type: 'demo-payment'
                              })
                            });

                            if (response.ok) {
                              alert('Demo payment successful! 5 credits added to your account.');
                              // Invalidate all user-related queries to refresh credit balance
                              queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                              queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                              queryClient.invalidateQueries({ queryKey: ["credits"] });
                              // Force re-render of payment step to show updated credits
                              updateFormData({ lastPaymentUpdate: Date.now() });
                              // Wait a moment then refetch user data
                              setTimeout(() => {
                                queryClient.refetchQueries({ queryKey: ["/api/user"] });
                              }, 500);
                            } else {
                              alert('Demo payment failed. Please try again.');
                            }
                          } catch (error) {
                            console.error('Error:', error);
                            alert('Error processing demo payment.');
                          }
                        }
                      }}
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Credit Pack ($60)
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
            <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
            <p className="text-gray-600 text-sm">
              Review and accept the terms and conditions to proceed with document creation.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="text-lg font-semibold text-orange-800 mb-4">IMPORTANT LEGAL DISCLAIMER</h4>
                <div className="space-y-4 text-sm text-orange-700">
                  <p>
                    <strong>Template Nature:</strong> This SWMS is a template and must be reviewed, adapted, and approved by a competent person before use. It is not a substitute for professional safety advice or consultation.
                  </p>
                  <p>
                    <strong>User Responsibility:</strong> The user is responsible for ensuring compliance with all applicable workplace health and safety legislation, including but not limited to the Work Health and Safety Act 2011 and associated regulations.
                  </p>
                  <p>
                    <strong>Site-Specific Requirements:</strong> This template must be customized to reflect the specific hazards, controls, and conditions of your workplace and project. Generic content may not address all risks present at your site.
                  </p>
                  <p>
                    <strong>Professional Consultation:</strong> Users should consult with qualified safety professionals, supervisors, and workers before implementing any SWMS. This template does not replace professional safety expertise.
                  </p>
                  <p>
                    <strong>Limitation of Liability:</strong> The creators of this template accept no responsibility for any injuries, incidents, or non-compliance issues that may arise from its use. Use of this template is entirely at your own risk.
                  </p>
                  <p>
                    <strong>Regulatory Compliance:</strong> While this template references Australian safety standards and regulations, users must verify current legislative requirements and ensure full compliance with all applicable laws.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptDisclaimer"
                  checked={formData.acceptedDisclaimer || false}
                  onCheckedChange={(checked) => updateFormData({ acceptedDisclaimer: checked })}
                />
                <Label htmlFor="acceptDisclaimer" className="text-sm leading-relaxed">
                  I acknowledge that I have read and understood this disclaimer. I accept full responsibility for reviewing, 
                  adapting, and implementing this SWMS template in accordance with my specific workplace requirements and 
                  applicable safety legislation. I understand that use of this template is at my own risk.
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 8:
      // Check if user already has paid access
      const hasPaidAccess = formData.paidAccess === true || formData.paid === true || formData.creditsUsed === true;
      
      // Calculate total credits available
      const creditBalance = (userBillingData?.credits || userData?.credits || 0) + 
                           (userBillingData?.subscriptionCredits || userData?.subscriptionCredits || 0) + 
                           (userBillingData?.addonCredits || userData?.addonCredits || 0);
      
      // Check for admin/demo access
      const isAdmin = localStorage.getItem('isAppAdmin') === 'true' || 
                     localStorage.getItem('adminDemoMode') === 'true' ||
                     userData?.isAdmin === true;
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <CreditCard className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment & Access</h3>
            <p className="text-gray-600 text-sm">
              Complete payment to generate your professional SWMS document.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {hasPaidAccess ? "Document Ready" : 
                 isAdmin ? "Payment (Admin Mode)" : 
                 creditBalance > 0 ? "Use Credits" : "Payment Required"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasPaidAccess ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">Payment Complete</p>
                  <p className="text-green-600 text-sm">Ready to generate your SWMS document</p>
                </div>
              ) : isAdmin ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <Crown className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-blue-800 font-medium">Admin Access</p>
                  <p className="text-blue-600 text-sm">Payment processing bypassed in admin mode</p>
                </div>
              ) : creditBalance > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">Use Current Credits</p>
                        <p className="text-green-600 text-sm">You have {creditBalance} total credits available (0 subscription + 0 add-on)</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {creditBalance} Credits
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={async () => {
                      setIsProcessingCredit?.(true);
                      try {
                        const response = await fetch('/api/user/use-credit', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include'
                        });
                        
                        if (response.ok) {
                          console.log("Payment completed successfully with credits - proceeding to next step immediately");
                          onDataChange({ creditsUsed: true, paidAccess: true, paid: true });
                          if (onNext) onNext();
                        } else {
                          throw new Error('Credit usage failed');
                        }
                      } catch (error) {
                        console.error('Credit usage error:', error);
                      } finally {
                        setIsProcessingCredit?.(false);
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isProcessingCredit}
                  >
                    {isProcessingCredit ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Use Current Credits (1 credit)
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">Or purchase additional credits or upgrade:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="flex flex-col h-auto p-4">
                        <CreditCard className="h-5 w-5 mb-2" />
                        <span className="font-medium">One SWMS - $15</span>
                      </Button>
                      
                      <Button variant="outline" className="flex flex-col h-auto p-4">
                        <Zap className="h-5 w-5 mb-2" />
                        <span className="font-medium">5 Credits - $60</span>
                      </Button>
                      
                      <Button variant="outline" className="flex flex-col h-auto p-4">
                        <Shield className="h-5 w-5 mb-2" />
                        <span className="font-medium">Pro Plan - $49/mo</span>
                      </Button>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Demo Mode (Testing Only):</strong>
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            setIsProcessingCredit?.(true);
                            try {
                              const response = await fetch('/api/user/use-credit', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include'
                              });
                              
                              if (response.ok) {
                                onDataChange({ creditsUsed: true, paidAccess: true, paid: true });
                                if (onNext) onNext();
                              }
                            } finally {
                              setIsProcessingCredit?.(false);
                            }
                          }}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Demo: One-Off SWMS ($15)
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            setIsProcessingCredit?.(true);
                            try {
                              const response = await fetch('/api/user/use-credit', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include'
                              });
                              
                              if (response.ok) {
                                onDataChange({ creditsUsed: true, paidAccess: true, paid: true });
                                if (onNext) onNext();
                              }
                            } finally {
                              setIsProcessingCredit?.(false);
                            }
                          }}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Credit Pack ($60)
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-red-800 font-medium">No Credits Available</p>
                    <p className="text-red-600 text-sm">Please purchase credits or subscribe to continue</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="flex flex-col h-auto p-4">
                      <CreditCard className="h-5 w-5 mb-2" />
                      <span className="font-medium">One SWMS - $15</span>
                    </Button>
                    
                    <Button variant="outline" className="flex flex-col h-auto p-4">
                      <Zap className="h-5 w-5 mb-2" />
                      <span className="font-medium">5 Credits - $60</span>
                    </Button>
                    
                    <Button variant="outline" className="flex flex-col h-auto p-4">
                      <Shield className="h-5 w-5 mb-2" />
                      <span className="font-medium">Pro Plan - $49/mo</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );

    case 9:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Download className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document Generation</h3>
            <p className="text-gray-600 text-sm">
              Review and edit your SWMS document before final generation.
            </p>
          </div>
          
          <SwmsComplete initialData={formData} />
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

export default function SWMSForm({ step, data = {}, onNext, onDataChange, userData, isLoadingCredits, creditsError, setIsProcessingCredit }: SWMSFormProps) {
  const [formData, setFormData] = useState(data);
  // Use parent's setIsProcessingCredit instead of local state
  const isProcessingCredit = false; // This will be managed by parent component

  // Fetch current user billing data for real-time credits with better error handling
  const { data: userBillingData, refetch: refetchUserData, isLoading: isLoadingUserCredits, error: userCreditsError } = useQuery({
    queryKey: ['/api/user/billing'],
    enabled: step === 6, // Only fetch when on payment step
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fallback state for manual credit fetching
  const [fallbackCredits, setFallbackCredits] = useState<any>(null);
  const [isManualFetch, setIsManualFetch] = useState(false);

  // Compute credit data outside the JSX for consistent access
  const creditData = userBillingData || userData || fallbackCredits;
  const totalCredits = creditData?.credits || 0;
  const subscriptionCredits = creditData?.subscriptionCredits || 0;
  const addonCredits = creditData?.addonCredits || 0;
  const hasCredits = totalCredits > 0;

  // Debug logging for credit data
  useEffect(() => {
    if (step === 6) {
      console.log('Payment step - Credit data:', { userBillingData, userData, isLoadingCredits, creditsError });
      
      // If React Query fails, try manual fetch
      if ((userCreditsError || creditsError) && !isManualFetch) {
        console.log('React Query failed, attempting manual fetch...');
        setIsManualFetch(true);
        
        fetch('/api/user/billing', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(`HTTP ${response.status}`);
        })
        .then(data => {
          console.log('Manual fetch successful:', data);
          setFallbackCredits(data);
        })
        .catch(error => {
          console.error('Manual fetch also failed:', error);
        });
      }
    }
  }, [step, userData, isLoadingCredits, creditsError, isManualFetch]);

  const updateFormData = (updates: any) => {
    console.log('=== SWMSForm updateFormData CALLED ===');
    console.log('Updates received:', Object.keys(updates).filter(key => updates[key]));
    console.log('projectDescription in updates:', updates.projectDescription);
    console.log('workDescription in updates:', updates.workDescription);
    
    const newData = { 
      ...formData, 
      ...updates,
      lastModified: new Date().toISOString()
    };
    
    console.log('New data to send to parent:', Object.keys(newData).filter(key => newData[key]));
    console.log('projectDescription in newData:', newData.projectDescription);
    console.log('workDescription in newData:', newData.workDescription);
    
    setFormData(newData);
    if (onDataChange) {
      console.log('Calling onDataChange with data...');
      onDataChange(newData);
    } else {
      console.log('No onDataChange callback provided!');
    }
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
        onNext={onNext}
        isProcessingCredit={isProcessingCredit}
        setIsProcessingCredit={setIsProcessingCredit}
        userData={userData}
        isLoadingCredits={isLoadingCredits}
        creditsError={creditsError}
        userBillingData={userBillingData}
        isLoadingUserCredits={isLoadingUserCredits}
        userCreditsError={userCreditsError}
      />
    </div>
  );
}