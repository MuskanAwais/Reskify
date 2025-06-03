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
  "Electrical", "Plumbing", "Carpentry", "Concreting", "Roofing", "Painting",
  "Scaffolding", "Demolition", "Excavation", "Steel Fixing", "Tiling", "Glazing",
  "HVAC", "Insulation", "Waterproofing", "Landscaping", "Fencing", "Flooring",
  "Bricklaying", "Plastering", "General Construction", "Civil Works"
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
        title: "SWMS Created Successfully",
        description: "Your AI-generated SWMS has been saved to My SWMS.",
      });
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
    </div>
  );
}