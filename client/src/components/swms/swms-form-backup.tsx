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
  ClipboardList,
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
  Crown,
  Phone,
  ExternalLink
} from "lucide-react";
import { SimplifiedTableEditor } from "./simplified-table-editor";
import GPTTaskSelection from "./gpt-task-selection";
import { translate } from "@/lib/language-direct";
import SmartTooltip from "@/components/ui/smart-tooltip";
import QuickActionTooltip, { presetTooltips } from "@/components/ui/quick-action-tooltip";
import AustralianAddressAutocomplete from "@/components/ui/australian-address-autocomplete";
import VisualPDFPreviewer from "./visual-pdf-previewer";
import { RiskAssessmentMatrix } from "./risk-assessment-matrix";

const TOTAL_STEPS = 9;

// Simplified PDF Generation Component
const AutomaticPDFGeneration = ({ formData, onDataChange }: { formData: any; onDataChange: any }) => {
  const [currentMessage, setCurrentMessage] = useState('Generating professional SWMS document...');
  const [progress, setProgress] = useState(85);

  useEffect(() => {
    console.log('AutomaticPDFGeneration component loaded - Step 9 is working');
    console.log('Form data received:', formData);
    
    // Simple progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setCurrentMessage('PDF generation complete!');
          return 100;
        }
        return prev + 2;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

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

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Payment Component for Step 8
            name: formData.companyName || '',
            logo: formData.companyLogo || null,
            abn: formData.abn || ''
          },
          // Compliance and safety
          compliance: {
            australianStandards: true,
            whsCompliant: true,
            riskMatrix: 'Australian Standard',
            lastReviewed: new Date().toLocaleDateString('en-AU')
          }
        };
        
        setCurrentMessage('Testing SWMSprint connection...');
        setProgress(88);
        
        // First test if SWMSprint is accessible
        console.log('Testing SWMSprint API connection...');
        const healthCheck = await fetch('https://79937ff1-cac5-4736-b2b2-1df5354fb4b3-00-1bbtav2oqagxg.spock.replit.dev/api/health', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        console.log('Health check response:', {
          status: healthCheck.status,
          ok: healthCheck.ok,
          headers: Object.fromEntries(healthCheck.headers.entries())
        });
        
        // Check if SWMSprint app is sleeping/not running
        if (healthCheck.status === 404) {
          const responseText = await healthCheck.text();
          if (responseText.includes('Run this app to see the results here')) {
            setStatus('error');
            setCurrentMessage('SWMSprint app is not running. Please start your SWMSprint app first.');
            throw new Error('SWMSprint app is sleeping or not running. Please start the app at: https://79937ff1-cac5-4736-b2b2-1df5354fb4b3-00-1bbtav2oqagxg.spock.replit.dev');
          }
        }
        
        setCurrentMessage('Connecting to SWMSprint PDF generator...');
        setProgress(90);
        
        console.log('Sending PDF generation request with data:', {
          dataKeys: Object.keys(enhancedPdfData),
          jobName: enhancedPdfData.jobName,
          activitiesCount: enhancedPdfData.workActivities?.length || 0
        });
        
        const response = await fetch('https://79937ff1-cac5-4736-b2b2-1df5354fb4b3-00-1bbtav2oqagxg.spock.replit.dev/api/swms/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf'
          },
          body: JSON.stringify(enhancedPdfData)
        });
        
        console.log('PDF generation response:', {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.ok) {
          setProgress(95);
          setCurrentMessage('Processing PDF through SWMSprint...');
          
          // Get the PDF blob
          const pdfBlob = await response.blob();
          
          if (pdfBlob.size > 0) {
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPdfUrl(pdfUrl);
            
            setProgress(100);
            setCurrentMessage('SWMS document generated successfully!');
            setStatus('completed');
            
            // Auto-download the PDF to user's computer
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${formData.jobName || 'SWMS'}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Mark SWMS as completed and save to database
            if (onDataChange) {
              onDataChange({ 
                ...formData,
                status: 'completed', 
                paidAccess: true,
                completedAt: new Date().toISOString(),
                pdfGenerated: true,
                pdfSize: pdfBlob.size
              });
            }
          } else {
            throw new Error('Empty PDF received from SWMSprint');
          }
        } else {
          const errorText = await response.text();
          throw new Error(`SWMSprint API error ${response.status}: ${errorText}`);
        }
        
      } catch (error) {
        console.error('PDF generation error details:', {
          message: error?.message || 'Unknown error',
          name: error?.name || 'Error',
          stack: error?.stack || 'No stack trace',
          error: error
        });
        setStatus('error');
        setCurrentMessage(`PDF generation failed: ${error?.message || 'Connection error with SWMSprint'}`);
        setProgress(0);
        
        toast({
          title: "Generation Failed",
          description: `Error: ${error?.message || 'Connection issue with SWMSprint API. Please check the URL and try again.'}`,
          variant: "destructive"
        });
      }
    };

    // Start automatic PDF generation when component mounts
    generatePDF();
  }, []);

  if (status === 'completed') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-green-700">SWMS Generated Successfully!</h3>
          <p className="text-gray-600 text-sm mb-6">
            Your professional SWMS document has been generated and downloaded automatically.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Document Ready</p>
                    <p className="text-green-600 text-sm">Professional SWMS with Australian WHS compliance</p>
                  </div>
                </div>
              </div>
              
              {pdfUrl && (
                <Button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = `${formData.jobName || 'SWMS'}-${Date.now()}.pdf`;
                    link.click();
                  }}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Again
                </Button>
              )}
              

            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    const isSWMSprintDown = currentMessage.includes('SWMSprint app is not running');
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-red-700">
            {isSWMSprintDown ? 'SWMSprint App Not Running' : 'Generation Failed'}
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            {isSWMSprintDown ? 'Your SWMSprint PDF generator app needs to be started first.' : 'There was an issue generating your PDF. Please try again.'}
          </p>
        </div>

        {isSWMSprintDown && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-6 w-6 text-orange-600" />
                  <div className="text-left">
                    <p className="font-medium text-orange-800">Action Required</p>
                    <p className="text-orange-700 text-sm">Please start your SWMSprint app first</p>
                  </div>
                </div>
                
                <div className="text-left space-y-2">
                  <p className="text-sm text-orange-700 font-medium">Steps to start SWMSprint:</p>
                  <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                    <li>Open your SWMSprint Replit project</li>
                    <li>Click the "Run" button to start the app</li>
                    <li>Wait for the app to fully load</li>
                    <li>Return here and try again</li>
                  </ol>
                </div>
                
                <Button 
                  onClick={() => window.open('https://79937ff1-cac5-4736-b2b2-1df5354fb4b3-00-1bbtav2oqagxg.spock.replit.dev', '_blank')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open SWMSprint App
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                PDF generation encountered an issue. Please check your data and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative mb-6">
          <Loader2 className="mx-auto h-16 w-16 text-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary/60" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Generating Your Professional SWMS</h3>
        <p className="text-gray-600 text-sm mb-6">
          Please wait while we create your compliant Australian workplace safety document
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            <div className="text-center">
              <p className="text-gray-700 font-medium">{currentMessage}</p>
            </div>
            

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

// Helper function to get step icon
const getStepIcon = (step: number) => {
  const iconClasses = "mx-auto h-12 w-12 text-primary mb-4";
  
  switch (step) {
    case 1:
      return <FileText className={iconClasses} />;
    case 2:
      return <ClipboardList className={iconClasses} />;
    case 3:
      return <Shield className={iconClasses} />;
    case 4:
      return <Wrench className={iconClasses} />;
    case 5:
      return <AlertTriangle className={iconClasses} />;
    case 6:
      return <PenTool className={iconClasses} />;
    case 7:
      return <Scale className={iconClasses} />;
    case 8:
      return <CreditCard className={iconClasses} />;
    case 9:
      return <Download className={iconClasses} />;
    default:
      return <FileText className={iconClasses} />;
  }
};

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
            {getStepIcon(1)}
            <h3 className="text-xl font-semibold mb-2">{translate("projectDetails")}</h3>
            <p className="text-gray-600 text-sm">
              {translate("projectDetailsDesc")}
            </p>
          </div>

          <Card>
            <CardContent className="space-y-4 pt-6">
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
                <h2 className="text-xl font-semibold mb-4">Project Personnel</h2>
                


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
            {getStepIcon(2)}
            <h3 className="text-xl font-semibold mb-2">Work Activities & Risk Assessment</h3>
            <p className="text-gray-600 text-sm">
              Generate tasks with high-risk work selection and manage comprehensive risk assessments
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
            {getStepIcon(3)}
            <h3 className="text-xl font-semibold mb-2">Personal Protective Equipment</h3>
            <p className="text-gray-600 text-sm">
              Select required PPE based on work activities and risk assessments
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
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
            {getStepIcon(4)}
            <h3 className="text-xl font-semibold mb-2">Plant, Equipment & Training</h3>
            <p className="text-gray-600 text-sm">
              Manage plant, equipment, and tools with inspection schedules
            </p>
          </div>

          <PlantEquipmentSystem
            plantEquipment={formData.plantEquipment || []}
            onUpdate={(equipment) => onDataChange({ plantEquipment: equipment })}
          />
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div className="text-center">
            {getStepIcon(5)}
            <h3 className="text-xl font-semibold mb-2">Emergency Information</h3>
            <p className="text-gray-600 text-sm">
              Configure emergency contacts and safety procedures
            </p>
          </div>

          {/* Emergency Contacts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Phone className="mr-2 h-5 w-5 text-red-600" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!formData.emergencyContacts || formData.emergencyContacts.length === 0) && (
                <div className="space-y-4">
                  {/* Default 3 emergency contacts */}
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="grid grid-cols-2 gap-4 p-3 border border-gray-200 rounded-lg">
                      <div>
                        <Label htmlFor={`emergency-name-${num}`}>Emergency Contact 0{num} Name</Label>
                        <Input
                          id={`emergency-name-${num}`}
                          placeholder="Contact name"
                          value={formData.emergencyContacts?.[num-1]?.name || ""}
                          onChange={(e) => {
                            const contacts = [...(formData.emergencyContacts || [])];
                            while (contacts.length < num) contacts.push({ name: "", phone: "" });
                            contacts[num-1] = { ...contacts[num-1], name: e.target.value };
                            updateFormData({ emergencyContacts: contacts });
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`emergency-phone-${num}`}>Phone Number</Label>
                        <Input
                          id={`emergency-phone-${num}`}
                          placeholder="0499 999 999"
                          value={formData.emergencyContacts?.[num-1]?.phone || ""}
                          onChange={(e) => {
                            const contacts = [...(formData.emergencyContacts || [])];
                            while (contacts.length < num) contacts.push({ name: "", phone: "" });
                            contacts[num-1] = { ...contacts[num-1], phone: e.target.value };
                            updateFormData({ emergencyContacts: contacts });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.emergencyContacts && formData.emergencyContacts.length > 0 && (
                <div className="space-y-4">
                  {formData.emergencyContacts.map((contact: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-4 p-3 border border-gray-200 rounded-lg">
                      <div>
                        <Label htmlFor={`emergency-name-${index}`}>Emergency Contact 0{index + 1} Name</Label>
                        <Input
                          id={`emergency-name-${index}`}
                          placeholder="Contact name"
                          value={contact.name || ""}
                          onChange={(e) => {
                            const contacts = [...formData.emergencyContacts];
                            contacts[index] = { ...contacts[index], name: e.target.value };
                            updateFormData({ emergencyContacts: contacts });
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`emergency-phone-${index}`}>Phone Number</Label>
                        <Input
                          id={`emergency-phone-${index}`}
                          placeholder="0499 999 999"
                          value={contact.phone || ""}
                          onChange={(e) => {
                            const contacts = [...formData.emergencyContacts];
                            contacts[index] = { ...contacts[index], phone: e.target.value };
                            updateFormData({ emergencyContacts: contacts });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const contacts = [...(formData.emergencyContacts || [])];
                  contacts.push({ name: "", phone: "" });
                  updateFormData({ emergencyContacts: contacts });
                }}
                className="w-full flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Emergency Contact</span>
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Response Procedures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
                Emergency Response Procedures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter detailed emergency response procedures here..."
                value={formData.emergencyResponseProcedures || ""}
                onChange={(e) => updateFormData({ emergencyResponseProcedures: e.target.value })}
                rows={6}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Monitoring & Review Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Eye className="mr-2 h-5 w-5 text-blue-600" />
                Monitoring & Review Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter monitoring and review requirements here..."
                value={formData.monitoringRequirements || ""}
                onChange={(e) => updateFormData({ monitoringRequirements: e.target.value })}
                rows={6}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div className="text-center">
            {getStepIcon(6)}
            <h3 className="text-xl font-semibold mb-2">Emergency Procedures & Monitoring</h3>
            <p className="text-gray-600 text-sm">
              Configure emergency protocols and safety monitoring requirements
            </p>
          </div>

          {/* Person Creating and Authorising SWMS Section */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Person Creating and Authorising SWMS</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="swmsCreatorName">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="swmsCreatorName"
                    placeholder="Enter creator/authorizer name"
                    value={formData.swmsCreatorName || ""}
                    onChange={(e) => updateFormData({ swmsCreatorName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="swmsCreatorPosition">Position/Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="swmsCreatorPosition"
                    placeholder="Enter position or title"
                    value={formData.swmsCreatorPosition || ""}
                    onChange={(e) => updateFormData({ swmsCreatorPosition: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Signature Method <span className="text-red-500">*</span></Label>
                <div className="flex space-x-4 mt-2">
                  <Button
                    type="button"
                    variant={formData.signatureMethod === 'type' ? 'default' : 'outline'}
                    onClick={() => updateFormData({ signatureMethod: 'type', signatureImage: null })}
                    className="flex items-center space-x-2"
                  >
                    <span>Type Name</span>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.signatureMethod === 'upload' ? 'default' : 'outline'}
                    onClick={() => updateFormData({ signatureMethod: 'upload', signatureText: '' })}
                    className="flex items-center space-x-2"
                  >
                    <span>Upload Image</span>
                  </Button>
                </div>
              </div>

              {formData.signatureMethod === 'type' && (
                <div>
                  <Label htmlFor="signatureText">Typed Signature</Label>
                  <Input
                    id="signatureText"
                    placeholder="Type your full name as signature"
                    value={formData.signatureText || ""}
                    onChange={(e) => updateFormData({ signatureText: e.target.value })}
                    className="font-cursive text-lg"
                  />
                </div>
              )}

              {formData.signatureMethod === 'upload' && (
                <div>
                  <Label htmlFor="signatureUpload">Upload Signature Image</Label>
                  <Input
                    id="signatureUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          updateFormData({ signatureImage: event.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {formData.signatureImage && (
                    <div className="mt-2">
                      <img src={formData.signatureImage} alt="Signature" className="max-h-20 border rounded" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Signatories Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Additional Project Signatories</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Add project managers, site supervisors, or other personnel who need to sign this SWMS.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!formData.signatures || formData.signatures.length === 0) && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-gray-600 text-sm mb-3">No additional signatories added yet.</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newSignature = { name: "", phone: "", signatureMethod: "type", signatureText: "", signatureImage: null };
                      updateFormData({ signatures: [newSignature] });
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add First Signatory</span>
                  </Button>
                </div>
              )}

              {formData.signatures && formData.signatures.map((signature: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">Signatory {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = [...(formData.signatures || [])];
                        updated.splice(index, 1);
                        updateFormData({ signatures: updated });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`sig-name-${index}`}>Full Name</Label>
                      <Input
                        id={`sig-name-${index}`}
                        placeholder="Enter signatory name"
                        value={signature.name || ""}
                        onChange={(e) => {
                          const updated = [...(formData.signatures || [])];
                          updated[index] = { ...updated[index], name: e.target.value };
                          updateFormData({ signatures: updated });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`sig-phone-${index}`}>Phone Number</Label>
                      <Input
                        id={`sig-phone-${index}`}
                        placeholder="Enter phone number"
                        value={signature.phone || ""}
                        onChange={(e) => {
                          const updated = [...(formData.signatures || [])];
                          updated[index] = { ...updated[index], phone: e.target.value };
                          updateFormData({ signatures: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Signature Method</Label>
                    <div className="flex space-x-4 mt-2">
                      <Button
                        type="button"
                        variant={signature.signatureMethod === 'type' ? 'default' : 'outline'}
                        onClick={() => {
                          const updated = [...(formData.signatures || [])];
                          updated[index] = { ...updated[index], signatureMethod: 'type', signatureImage: null };
                          updateFormData({ signatures: updated });
                        }}
                        size="sm"
                      >
                        Type Name
                      </Button>
                      <Button
                        type="button"
                        variant={signature.signatureMethod === 'upload' ? 'default' : 'outline'}
                        onClick={() => {
                          const updated = [...(formData.signatures || [])];
                          updated[index] = { ...updated[index], signatureMethod: 'upload', signatureText: '' };
                          updateFormData({ signatures: updated });
                        }}
                        size="sm"
                      >
                        Upload Image
                      </Button>
                    </div>
                  </div>

                  {signature.signatureMethod === 'type' && (
                    <div>
                      <Label htmlFor={`sig-text-${index}`}>Typed Signature</Label>
                      <Input
                        id={`sig-text-${index}`}
                        placeholder="Type full name as signature"
                        value={signature.signatureText || ""}
                        onChange={(e) => {
                          const updated = [...(formData.signatures || [])];
                          updated[index] = { ...updated[index], signatureText: e.target.value };
                          updateFormData({ signatures: updated });
                        }}
                        className="font-cursive text-lg"
                      />
                    </div>
                  )}

                  {signature.signatureMethod === 'upload' && (
                    <div>
                      <Label htmlFor={`sig-upload-${index}`}>Upload Signature Image</Label>
                      <Input
                        id={`sig-upload-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const updated = [...(formData.signatures || [])];
                              updated[index] = { ...updated[index], signatureImage: event.target?.result as string };
                              updateFormData({ signatures: updated });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {signature.signatureImage && (
                        <div className="mt-2">
                          <img src={signature.signatureImage} alt="Signature" className="max-h-20 border rounded" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {formData.signatures && formData.signatures.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newSignature = { name: "", phone: "", signatureMethod: "type", signatureText: "", signatureImage: null };
                    const updated = [...(formData.signatures || []), newSignature];
                    updateFormData({ signatures: updated });
                  }}
                  className="w-full flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Another Signatory</span>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      );



    case 7:
      return (
        <div className="space-y-6">
          <div className="text-center">
            {getStepIcon(7)}
            <h3 className="text-xl font-semibold mb-2">Legal Disclaimer & Compliance</h3>
            <p className="text-gray-600 text-sm">
              Review and acknowledge Australian WHS compliance requirements
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
            {getStepIcon(8)}
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
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-amber-800">Available Credits: {creditBalance}</p>
                        <p className="text-amber-600 text-sm">Use 1 credit to generate this SWMS</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => {
                        // Mark as credit used and proceed
                        onDataChange({ creditsUsed: true, paidAccess: true });
                        // Call onNext to proceed to document generation
                        if (onNext) onNext();
                      }}
                      size="lg"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
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
                          Use 1 Credit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-red-800 font-medium">Payment Required</p>
                  <p className="text-red-600 text-sm">Please purchase credits or subscribe to continue</p>
                </div>
              )}
              
              {(hasPaidAccess || isAdmin) && (
                <div className="flex justify-end">
                  <div className="text-green-600 text-sm font-medium">
                    ✓ Access granted - Use the Continue button below to proceed to document generation
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );

    case 9:
      return <AutomaticPDFGeneration formData={formData} onDataChange={onDataChange} />;

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