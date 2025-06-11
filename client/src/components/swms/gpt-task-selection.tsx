import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search, Bot, Edit, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectDetails {
  projectName: string;
  location: string;
  tradeType: string;
  description?: string;
}

interface TaskOption {
  name: string;
  id: string;
}

interface GeneratedSWMSData {
  activities: Array<{
    name: string;
    description: string;
    hazards: Array<{
      type: string;
      description: string;
      riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
      controlMeasures: string[];
      residualRisk: 'Low' | 'Medium' | 'High' | 'Critical';
    }>;
    ppe: string[];
    tools: string[];
    trainingRequired: string[];
  }>;
  plantEquipment: Array<{
    name: string;
    type: 'Equipment' | 'Plant' | 'Vehicle';
    category: string;
    certificationRequired: boolean;
    inspectionStatus: 'Current' | 'Overdue' | 'Required';
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    safetyRequirements: string[];
  }>;
  emergencyProcedures: Array<{
    scenario: string;
    response: string;
    contacts: string[];
  }>;
}

interface GPTTaskSelectionProps {
  projectDetails: ProjectDetails;
  onActivitiesGenerated: (activities: any[], plantEquipment: any[]) => void;
  onMethodSelected: (method: string) => void;
}

export default function GPTTaskSelection({ 
  projectDetails, 
  onActivitiesGenerated, 
  onMethodSelected 
}: GPTTaskSelectionProps) {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [plainTextDescription, setPlainTextDescription] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Fetch available tasks for the trade type
  const { data: taskOptions } = useQuery({
    queryKey: [`/api/gpt-tasks/${projectDetails.tradeType}`],
    enabled: !!projectDetails.tradeType && selectedMethod === "task-selection"
  });

  // Generate SWMS data mutation
  const generateSWMSMutation = useMutation({
    mutationFn: async (request: any) => {
      const response = await apiRequest("POST", "/api/generate-swms", request);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Convert generated data to the format expected by the parent component
        const convertedActivities = data.data.activities.map((activity: any, index: number) => ({
          id: `activity-${index + 1}`,
          name: activity.name,
          description: activity.description,
          hazards: activity.hazards,
          ppe: activity.ppe,
          tools: activity.tools,
          trainingRequired: activity.trainingRequired,
          selected: true
        }));

        const convertedPlantEquipment = data.data.plantEquipment.map((equipment: any, index: number) => ({
          id: `equipment-${index + 1}`,
          ...equipment
        }));

        onActivitiesGenerated(convertedActivities, convertedPlantEquipment);
        
        toast({
          title: "SWMS Generated Successfully",
          description: `Generated ${convertedActivities.length} activities and ${convertedPlantEquipment.length} equipment items using AI.`,
        });
      }
      setIsGenerating(false);
    },
    onError: (error: any) => {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate SWMS data. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  });

  const handleMethodSelection = (method: string) => {
    setSelectedMethod(method);
    onMethodSelected(method);
  };

  const handleTaskGeneration = async () => {
    if (!selectedTask && !plainTextDescription) {
      toast({
        title: "Selection Required",
        description: "Please select a task or provide a description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    const request = {
      taskName: selectedTask,
      plainTextDescription: plainTextDescription,
      projectDetails: {
        projectName: projectDetails.projectName,
        location: projectDetails.location,
        tradeType: projectDetails.tradeType,
        description: projectDetails.description
      }
    };

    generateSWMSMutation.mutate(request);
  };

  const filteredTasks = taskOptions?.tasks?.filter((task: TaskOption) =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Choose Your SWMS Generation Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMethod} onValueChange={handleMethodSelection}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="task-selection" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Task Selection
              </TabsTrigger>
              <TabsTrigger value="plain-text" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Plain Text Description
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Manual Input
              </TabsTrigger>
            </TabsList>

            <TabsContent value="task-selection" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">AI-Powered Task Generation</p>
                    <p className="text-sm text-blue-700">Select a task and our AI will generate comprehensive SWMS data with current safety standards.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="task-search">Search Tasks for {projectDetails.tradeType}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="task-search"
                      placeholder="Search available tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {filteredTasks.map((task: TaskOption) => (
                    <div
                      key={task.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTask === task.name
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTask(task.name)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{task.name}</span>
                        {selectedTask === task.name && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTask && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Selected: {selectedTask}</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="plain-text" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Edit className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">Custom Work Description</p>
                    <p className="text-sm text-purple-700">Describe your work activities in plain English and our AI will generate appropriate SWMS data.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="work-description">Work Description</Label>
                  <Textarea
                    id="work-description"
                    placeholder="Describe the work activities, tasks, and any specific requirements. For example: 'Installing electrical outlets and switches in a commercial office fitout on Level 3. Work involves running new cables through ceiling space, mounting outlet boxes, and testing all connections.'"
                    value={plainTextDescription}
                    onChange={(e) => setPlainTextDescription(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-600">
                    Be as detailed as possible. Include work location, specific tasks, equipment needed, and any unique conditions.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Edit className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Manual Input</p>
                    <p className="text-sm text-gray-700">Continue to manual activity selection and input for complete control over your SWMS content.</p>
                  </div>
                </div>

                <Button 
                  onClick={() => onActivitiesGenerated([], [])}
                  className="w-full"
                  variant="outline"
                >
                  Continue to Manual Input
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {(selectedMethod === "task-selection" || selectedMethod === "plain-text") && (
            <>
              <Separator className="my-6" />
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-medium">Ready to Generate SWMS</p>
                  <p className="text-sm text-gray-600">
                    {selectedMethod === "task-selection" 
                      ? `Task: ${selectedTask || 'None selected'}`
                      : `Description: ${plainTextDescription ? 'Provided' : 'Not provided'}`
                    }
                  </p>
                </div>
                
                <Button
                  onClick={handleTaskGeneration}
                  disabled={isGenerating || (!selectedTask && !plainTextDescription)}
                  className="min-w-[140px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Generate SWMS
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}