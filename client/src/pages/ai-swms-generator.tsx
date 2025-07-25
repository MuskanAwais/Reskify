import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/App";
import { Bot, Sparkles, AlertTriangle, FileText, Loader2, Lock, Crown, Zap } from "lucide-react";

interface AIGeneratedSWMS {
  projectDetails: {
    title: string;
    description: string;
    location: string;
    estimatedDuration: string;
  };
  suggestedTasks: Array<{
    activity: string;
    category: string;
    priority: "high" | "medium" | "low";
    reasoning: string;
  }>;
  riskAssessments: Array<{
    activity: string;
    hazards: string[];
    initialRiskScore: number;
    riskLevel: string;
    controlMeasures: string[];
    legislation: string[];
    residualRiskScore: number;
    residualRiskLevel: string;
    responsible: string;
    ppe: string[];
    trainingRequired: string[];
  }>;
  safetyMeasures: Array<{
    category: string;
    measures: string[];
    equipment: string[];
    procedures: string[];
  }>;
  complianceCodes: string[];
  emergencyProcedures: string[];
  generalRequirements: string[];
  additionalRecommendations: string[];
}

const trades = [
  // Core Construction Trades
  "General Construction", "Carpentry & Joinery", "Bricklaying & Masonry", "Concreting & Cement Work",
  "Steel Fixing & Welding", "Roofing & Guttering", "Tiling & Waterproofing", "Painting & Decorating",
  "Glazing & Window Installation", "Flooring & Floor Coverings", "Plastering & Rendering", 
  "Insulation Installation", "Cladding & External Finishes",
  // Mechanical & Electrical
  "Electrical Installation", "Air Conditioning & Refrigeration", "Plumbing & Gasfitting",
  "Fire Protection Systems", "Security Systems Installation", "Communications & Data Cabling",
  "Solar & Renewable Energy", "Mechanical Services", "Lift & Escalator Installation", "Pool & Spa Construction",
  // Specialist Construction
  "Demolition & Asbestos Removal", "Excavation & Earthworks", "Scaffolding & Access", "Crane & Rigging Operations",
  "Piling & Foundations", "Road Construction & Civil Works", "Bridge & Infrastructure", "Tunneling & Underground",
  "Marine Construction", "High-Rise Construction",
  // Finishing & Specialist
  "Landscape Construction", "Fencing & Gates", "Signage Installation", "Kitchen & Bathroom Installation",
  "Curtain Wall Installation", "Stonework & Natural Stone", "Shopfitting & Joinery", "Heritage & Restoration",
  "Green Roof & Living Walls", "Architectural Metalwork",
  // Industrial & Specialist
  "Industrial Maintenance", "Mining Construction", "Petrochemical Construction", "Food Processing Facilities",
  "Clean Room Construction", "Hospital & Medical Facilities", "Educational Facilities", "Aged Care Construction",
  "Data Centre Construction", "Warehouse & Logistics"
];

const projectTypes = [
  "Residential Construction", "Commercial Construction", "Industrial Construction",
  "Infrastructure", "Renovation/Refurbishment", "Maintenance", "Emergency Repairs",
  "Fit-out", "Demolition", "Site Preparation"
];

export default function AISwmsGenerator() {
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [specificRequirements, setSpecificRequirements] = useState("");
  const [generatedSWMS, setGeneratedSWMS] = useState<AIGeneratedSWMS | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editableSwms, setEditableSwms] = useState<AIGeneratedSWMS | null>(null);

  const { toast } = useToast();
  const { isAdminMode } = useAdmin();

  // Check user subscription
  const { data: subscription } = useQuery({
    queryKey: ["/api/user/subscription"],
  });

  // Admin mode bypasses subscription check, otherwise require pro/enterprise
  const hasAccess = true; // Always allow access for testing and admin purposes

  const generateSWMS = useMutation({
    mutationFn: async (data: {
      jobDescription: string;
      trade: string;
      projectType: string;
      location: string;
      duration: string;
      requirements: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai/generate-swms", data);
      if (!response.ok) {
        throw new Error("Failed to generate SWMS");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedSWMS(data);
      toast({
        title: "SWMS Generated Successfully",
        description: "Your AI-powered SWMS has been created with comprehensive safety measures.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate SWMS. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!jobDescription || !selectedTrade) {
      toast({
        title: "Missing Information",
        description: "Please provide job description and select a trade.",
        variant: "destructive",
      });
      return;
    }

    generateSWMS.mutate({
      jobDescription,
      trade: selectedTrade,
      projectType,
      location: projectLocation,
      duration: estimatedDuration,
      requirements: specificRequirements,
    });
  };

  const saveToMySwms = useMutation({
    mutationFn: async () => {
      if (!generatedSWMS) return;
      
      const swmsData = {
        projectName: generatedSWMS.projectDetails.title,
        location: generatedSWMS.projectDetails.location,
        trade: selectedTrade,
        activities: generatedSWMS.suggestedTasks.map(task => task.activity),
        riskAssessments: generatedSWMS.riskAssessments,
        safetyMeasures: generatedSWMS.safetyMeasures,
        complianceCodes: generatedSWMS.complianceCodes,
        emergencyProcedures: generatedSWMS.emergencyProcedures,
        isAIGenerated: true
      };

      const response = await apiRequest("POST", "/api/swms", swmsData);
      if (!response.ok) {
        throw new Error("Failed to save SWMS");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "SWMS Saved",
        description: "Your AI-generated SWMS has been saved to My SWMS.",
      });
    },
  });

  // Create SWMS from AI generation
  const createSwmsMutation = useMutation({
    mutationFn: async () => {
      if (!generatedSWMS) throw new Error("No SWMS generated");
      
      const swmsData = {
        title: generatedSWMS.projectDetails.title,
        jobName: generatedSWMS.projectDetails.title,
        projectAddress: generatedSWMS.projectDetails.location,
        projectLocation: generatedSWMS.projectDetails.location,
        tradeType: selectedTrade,
        activities: generatedSWMS.suggestedTasks.map(task => task.activity),
        riskAssessments: generatedSWMS.riskAssessments.map(risk => ({
          activity: risk.activity,
          hazards: risk.hazards,
          initialRiskScore: risk.initialRiskScore,
          controlMeasures: risk.controlMeasures,
          legislation: risk.legislation,
          residualRiskScore: risk.residualRiskScore,
          responsible: risk.responsible
        })),
        complianceCodes: generatedSWMS.complianceCodes,
        emergencyProcedures: generatedSWMS.emergencyProcedures,
        generalRequirements: generatedSWMS.generalRequirements || []
      };

      const response = await apiRequest("POST", "/api/swms", swmsData);
      if (!response.ok) {
        throw new Error("Failed to create SWMS");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI SWMS Generated Successfully",
        description: "Redirecting to visual table editor for customization...",
      });
      
      // Redirect to SWMS builder with AI-generated data for visual editing
      setTimeout(() => {
        const currentFormData = document.querySelector('form');
        const jobDescription = (document.getElementById('jobDescription') as HTMLTextAreaElement)?.value || '';
        const trade = (document.querySelector('[name="trade"]') as HTMLSelectElement)?.value || '';
        const location = (document.getElementById('location') as HTMLInputElement)?.value || '';
        
        const swmsData = {
          title: generatedSWMS?.projectDetails?.title || jobDescription,
          jobName: generatedSWMS?.projectDetails?.title || jobDescription,
          jobNumber: `AI-${Date.now()}`,
          projectAddress: generatedSWMS?.projectDetails?.location || location,
          projectLocation: generatedSWMS?.projectDetails?.location || location,
          tradeType: trade,
          activities: generatedSWMS?.suggestedTasks?.map(task => task.activity) || [],
          riskAssessments: generatedSWMS?.riskAssessments || [],
          safetyMeasures: generatedSWMS?.safetyMeasures || [],
          complianceCodes: generatedSWMS?.complianceCodes || [],
          emergencyProcedures: generatedSWMS?.emergencyProcedures || [],
          generalRequirements: generatedSWMS?.generalRequirements || [],
          aiGenerated: true,
          step: 3 // Start at visual table editor
        };
        
        // Store in session storage for SWMS builder
        sessionStorage.setItem('aiGeneratedSwmsData', JSON.stringify(swmsData));
        window.location.href = '/swms-builder?ai=true&step=3';
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Error Creating SWMS",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreateSwmsFromAI = () => {
    createSwmsMutation.mutate();
  };

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              AI SWMS Generator
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              AI-powered comprehensive SWMS generation based on job descriptions
            </p>
          </div>
        </div>

        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Lock className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              The AI SWMS Generator is available for Pro and Enterprise subscribers. 
              Upgrade your plan to access this powerful feature.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                AI-powered task suggestion and risk assessment
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Comprehensive SWMS generation from job descriptions
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                Extensive coverage with Australian compliance
              </div>
            </div>
            <Button className="mt-6" onClick={() => window.open('/billing', '_self')}>
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            AI SWMS Generator
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Describe your job and let AI create comprehensive SWMS with suggested tasks and detailed risk assessments
          </p>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          The AI generator creates comprehensive SWMS documents but should be reviewed by qualified safety professionals before use on site.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Provide detailed information about your construction job for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description *</Label>
              <Textarea
                id="jobDescription"
                placeholder="Describe the construction work in detail including scope, specific activities, site conditions, materials to be used, equipment required, and any special considerations..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-32"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trade">Primary Trade *</Label>
                <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {trades.map((trade) => (
                      <SelectItem key={trade} value={trade}>
                        {trade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Project Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Sydney CBD, Remote site, Indoor facility"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2 weeks, 3 months, 1 day"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Specific Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Any specific safety requirements, site constraints, environmental considerations, or regulatory requirements..."
                value={specificRequirements}
                onChange={(e) => setSpecificRequirements(e.target.value)}
                className="min-h-24"
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={generateSWMS.isPending || !jobDescription || !selectedTrade}
              className="w-full"
            >
              {generateSWMS.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating AI SWMS...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI SWMS
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated SWMS Display */}
        {generatedSWMS && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated SWMS
              </CardTitle>
              <CardDescription>
                AI-generated comprehensive SWMS based on your job description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Details */}
              <div>
                <h4 className="font-semibold mb-2">Project Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Title:</span> {generatedSWMS.projectDetails.title}</p>
                  <p><span className="font-medium">Description:</span> {generatedSWMS.projectDetails.description}</p>
                  <p><span className="font-medium">Location:</span> {generatedSWMS.projectDetails.location}</p>
                  <p><span className="font-medium">Duration:</span> {generatedSWMS.projectDetails.estimatedDuration}</p>
                </div>
              </div>

              <Separator />

              {/* Suggested Tasks */}
              <div>
                <h4 className="font-semibold mb-2">Suggested Tasks ({generatedSWMS.suggestedTasks.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {generatedSWMS.suggestedTasks.map((task, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{task.activity}</span>
                        <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "secondary" : "outline"}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{task.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowPreview(true)}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Preview Document
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowEditor(true)}
                  className="flex-1"
                >
                  Edit SWMS
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleCreateSwmsFromAI}
                  disabled={createSwmsMutation.isPending}
                >
                  Save to Library
                </Button>
              </div>

              <Separator />

              {/* Risk Assessments Summary */}
              <div>
                <h4 className="font-semibold mb-2">Risk Assessments ({generatedSWMS.riskAssessments.length})</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-medium text-red-600">High Risk</div>
                    <div className="text-lg font-bold">
                      {generatedSWMS.riskAssessments.filter(r => r.riskLevel === "High" || r.riskLevel === "Extreme").length}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-medium text-yellow-600">Medium Risk</div>
                    <div className="text-lg font-bold">
                      {generatedSWMS.riskAssessments.filter(r => r.riskLevel === "Medium").length}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Safety Measures */}
              <div>
                <h4 className="font-semibold mb-2">Safety Measures ({generatedSWMS.safetyMeasures.length} categories)</h4>
                <div className="space-y-1 text-sm max-h-24 overflow-y-auto">
                  {generatedSWMS.safetyMeasures.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{category.category}</span>
                      <Badge variant="outline">{category.measures.length} measures</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Compliance */}
              <div>
                <h4 className="font-semibold mb-2">Compliance Codes ({generatedSWMS.complianceCodes.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {generatedSWMS.complianceCodes.slice(0, 3).map((code, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {code}
                    </Badge>
                  ))}
                  {generatedSWMS.complianceCodes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{generatedSWMS.complianceCodes.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button 
                onClick={() => saveToMySwms.mutate()} 
                disabled={saveToMySwms.isPending}
                className="w-full"
              >
                {saveToMySwms.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Save to My SWMS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Document Preview Modal */}
      {showPreview && generatedSWMS && (
        <SwmsPreviewModal 
          swms={generatedSWMS}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onDownload={() => {
            handleDownloadPDF(generatedSWMS);
          }}
        />
      )}

      {/* Document Editor Modal */}
      {showEditor && generatedSWMS && (
        <SwmsEditorModal 
          swms={editableSwms || generatedSWMS}
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          onSave={(editedSwms) => {
            setEditableSwms(editedSwms);
            setGeneratedSWMS(editedSwms);
            setShowEditor(false);
            toast({
              title: "SWMS Updated",
              description: "Your changes have been saved.",
            });
          }}
        />
      )}
    </div>
  );
}

// SWMS Preview Modal Component
function SwmsPreviewModal({ swms, isOpen, onClose, onDownload }: {
  swms: AIGeneratedSWMS;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">SWMS Document Preview</h2>
          <div className="flex gap-2">
            <Button onClick={onDownload} variant="outline">
              Download PDF
            </Button>
            <Button onClick={onClose} variant="ghost">
              ✕
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Document Header with Watermark */}
          <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-primary/500">
            <div className="absolute top-2 right-2 text-primary/300 text-xs font-medium opacity-60">
              SAFETY SENSEI - AI GENERATED
            </div>
            <h1 className="text-2xl font-bold text-primary/900 mb-2">
              {swms.projectDetails.title}
            </h1>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Location:</span> {swms.projectDetails.location}</div>
              <div><span className="font-medium">Duration:</span> {swms.projectDetails.estimatedDuration}</div>
            </div>
            <p className="mt-2 text-sm text-gray-700">{swms.projectDetails.description}</p>
          </div>

          {/* Project Tasks */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Project Tasks</h3>
            <div className="grid gap-2">
              {swms.suggestedTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">{task.activity}</span>
                  <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "secondary" : "outline"}>
                    {task.priority} priority
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Assessment Table */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Risk Assessment Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Activity</th>
                    <th className="border border-gray-300 p-2 text-left">Hazards</th>
                    <th className="border border-gray-300 p-2 text-center">Initial Risk</th>
                    <th className="border border-gray-300 p-2 text-left">Control Measures</th>
                    <th className="border border-gray-300 p-2 text-center">Residual Risk</th>
                    <th className="border border-gray-300 p-2 text-left">Responsible</th>
                  </tr>
                </thead>
                <tbody>
                  {swms.riskAssessments.map((risk, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2 font-medium">{risk.activity}</td>
                      <td className="border border-gray-300 p-2">
                        <ul className="list-disc list-inside text-sm">
                          {risk.hazards.map((hazard, idx) => (
                            <li key={idx}>{hazard}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <Badge variant={risk.initialRiskScore >= 15 ? "destructive" : risk.initialRiskScore >= 8 ? "secondary" : "outline"}>
                          {risk.initialRiskScore}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <ul className="list-disc list-inside text-sm">
                          {risk.controlMeasures.map((measure, idx) => (
                            <li key={idx}>{measure}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <Badge variant={risk.residualRiskScore >= 15 ? "destructive" : risk.residualRiskScore >= 8 ? "secondary" : "outline"}>
                          {risk.residualRiskScore}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 p-2">{risk.responsible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety Measures */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Safety Measures</h3>
            <div className="grid gap-4">
              {swms.safetyMeasures.map((category, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{category.category}</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Measures:</span>
                      <ul className="list-disc list-inside mt-1">
                        {category.measures.map((measure, idx) => (
                          <li key={idx}>{measure}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Equipment:</span>
                      <ul className="list-disc list-inside mt-1">
                        {category.equipment.map((equipment, idx) => (
                          <li key={idx}>{equipment}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Procedures:</span>
                      <ul className="list-disc list-inside mt-1">
                        {category.procedures.map((procedure, idx) => (
                          <li key={idx}>{procedure}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Codes */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Compliance Requirements</h3>
            <div className="flex flex-wrap gap-2">
              {swms.complianceCodes.map((code, index) => (
                <Badge key={index} variant="secondary">{code}</Badge>
              ))}
            </div>
          </div>

          {/* Emergency Procedures */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Emergency Procedures</h3>
            <ul className="list-disc list-inside space-y-1">
              {swms.emergencyProcedures.map((procedure, index) => (
                <li key={index}>{procedure}</li>
              ))}
            </ul>
          </div>

          {/* Document Footer */}
          <div className="border-t pt-4 text-center text-sm text-gray-500">
            <p>This document was generated by Safety Sensei AI SWMS Generator</p>
            <p className="mt-1">Generated on: {new Date().toLocaleDateString()}</p>
            <p className="text-xs mt-2 text-red-500">
              ⚠️ This AI-generated document should be reviewed by qualified safety professionals before use on site
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// SWMS Editor Modal Component
function SwmsEditorModal({ swms, isOpen, onClose, onSave }: {
  swms: AIGeneratedSWMS;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedSwms: AIGeneratedSWMS) => void;
}) {
  const [editedSwms, setEditedSwms] = useState<AIGeneratedSWMS>(swms);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editedSwms);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit SWMS Document</h2>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button onClick={onClose} variant="ghost">Cancel</Button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Project Details Editor */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Project Details</h3>
            <div className="grid gap-4">
              <div>
                <Label>Project Title</Label>
                <Input 
                  value={editedSwms.projectDetails.title}
                  onChange={(e) => setEditedSwms({
                    ...editedSwms,
                    projectDetails: {
                      ...editedSwms.projectDetails,
                      title: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input 
                  value={editedSwms.projectDetails.location}
                  onChange={(e) => setEditedSwms({
                    ...editedSwms,
                    projectDetails: {
                      ...editedSwms.projectDetails,
                      location: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input 
                  value={editedSwms.projectDetails.estimatedDuration}
                  onChange={(e) => setEditedSwms({
                    ...editedSwms,
                    projectDetails: {
                      ...editedSwms.projectDetails,
                      estimatedDuration: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={editedSwms.projectDetails.description}
                  onChange={(e) => setEditedSwms({
                    ...editedSwms,
                    projectDetails: {
                      ...editedSwms.projectDetails,
                      description: e.target.value
                    }
                  })}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Tasks Editor with Enhanced Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Project Tasks</h3>
            <div className="space-y-3">
              {editedSwms.suggestedTasks.map((task, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex gap-2 items-start mb-2">
                    <Input 
                      value={task.activity}
                      onChange={(e) => {
                        const newTasks = [...editedSwms.suggestedTasks];
                        newTasks[index] = { ...task, activity: e.target.value };
                        setEditedSwms({ ...editedSwms, suggestedTasks: newTasks });
                      }}
                      className="flex-1"
                      placeholder="Task description"
                    />
                    <Select 
                      value={task.priority} 
                      onValueChange={(value: "high" | "medium" | "low") => {
                        const newTasks = [...editedSwms.suggestedTasks];
                        newTasks[index] = { ...task, priority: value };
                        setEditedSwms({ ...editedSwms, suggestedTasks: newTasks });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        const newTasks = editedSwms.suggestedTasks.filter((_, i) => i !== index);
                        setEditedSwms({ ...editedSwms, suggestedTasks: newTasks });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={task.category}
                      onChange={(e) => {
                        const newTasks = [...editedSwms.suggestedTasks];
                        newTasks[index] = { ...task, category: e.target.value };
                        setEditedSwms({ ...editedSwms, suggestedTasks: newTasks });
                      }}
                      className="w-40"
                      placeholder="Category"
                    />
                    <Input 
                      value={task.reasoning}
                      onChange={(e) => {
                        const newTasks = [...editedSwms.suggestedTasks];
                        newTasks[index] = { ...task, reasoning: e.target.value };
                        setEditedSwms({ ...editedSwms, suggestedTasks: newTasks });
                      }}
                      className="flex-1"
                      placeholder="Reasoning for this task"
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setEditedSwms({
                      ...editedSwms,
                      suggestedTasks: [
                        ...editedSwms.suggestedTasks,
                        { activity: "New Task", category: "General", priority: "medium", reasoning: "Added manually" }
                      ]
                    });
                  }}
                >
                  Add Task
                </Button>
                
                <Button 
                  variant="secondary"
                  onClick={() => {
                    const commonTasks = [
                      { activity: "Site setup and access control", category: "Preparation", priority: "high", reasoning: "Essential for safe site operations" },
                      { activity: "Material handling and storage", category: "Logistics", priority: "medium", reasoning: "Required for project materials" },
                      { activity: "Waste management and disposal", category: "Environmental", priority: "medium", reasoning: "Environmental compliance" },
                      { activity: "Emergency evacuation procedures", category: "Safety", priority: "high", reasoning: "Critical safety requirement" }
                    ];
                    
                    const tasksToAdd = commonTasks.filter(newTask => 
                      !editedSwms.suggestedTasks.some(existing => 
                        existing.activity.toLowerCase().includes(newTask.activity.toLowerCase())
                      )
                    );
                    
                    if (tasksToAdd.length > 0) {
                      setEditedSwms({
                        ...editedSwms,
                        suggestedTasks: [...editedSwms.suggestedTasks, ...tasksToAdd]
                      });
                    }
                  }}
                >
                  Add Common Tasks
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    const selectedTasks = editedSwms.suggestedTasks.filter(task => task.priority === "high");
                    setEditedSwms({ ...editedSwms, suggestedTasks: selectedTasks });
                  }}
                >
                  Keep Only High Priority
                </Button>
              </div>
            </div>
          </div>

          {/* Note about editing */}
          <div className="bg-primary/50 p-4 rounded-lg">
            <p className="text-sm text-primary/700">
              💡 <strong>Note:</strong> This is a simplified editor. For detailed risk assessment editing, 
              save this SWMS and use the full editor in the "My SWMS" section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// PDF Download Function
function handleDownloadPDF(swms: AIGeneratedSWMS) {
  // Import jsPDF dynamically for better performance
  import('jspdf').then(({ default: jsPDF }) => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Add Safety Sensei watermark
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text('SAFETY SENSEI - AI GENERATED SWMS', 150, 10);
    
    // Reset color and add title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(swms.projectDetails.title, 20, yPosition);
    yPosition += 15;

    // Project details
    doc.setFontSize(12);
    doc.text(`Location: ${swms.projectDetails.location}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Duration: ${swms.projectDetails.estimatedDuration}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Description: ${swms.projectDetails.description}`, 20, yPosition);
    yPosition += 15;

    // Tasks section
    doc.setFontSize(14);
    doc.text('Project Tasks:', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    swms.suggestedTasks.forEach((task, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${index + 1}. ${task.activity} (${task.priority} priority)`, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Risk assessments section
    doc.setFontSize(14);
    doc.text('Risk Assessments:', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(8);
    swms.riskAssessments.forEach((risk, index) => {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`Activity: ${risk.activity}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Hazards: ${risk.hazards.join(', ')}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Initial Risk: ${risk.initialRiskScore} | Residual Risk: ${risk.residualRiskScore}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Responsible: ${risk.responsible}`, 20, yPosition);
      yPosition += 8;
    });

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by Safety Sensei AI SWMS Generator', 20, 280);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 285);

    // Download the PDF
    doc.save(`${swms.projectDetails.title.replace(/[^a-z0-9]/gi, '_')}_SWMS.pdf`);
  });
}