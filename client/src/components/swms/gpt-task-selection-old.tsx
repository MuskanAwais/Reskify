import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search, Bot, Edit, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ProjectDetails {
  projectName: string;
  location: string;
  tradeType: string;
  description?: string;
  siteEnvironment?: string;
  specialRiskFactors?: string[];
  state?: string;
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
  const [taskList, setTaskList] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [siteEnvironment, setSiteEnvironment] = useState<string>("");
  const [specialRiskFactors, setSpecialRiskFactors] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("NSW");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [liveTaskDisplay, setLiveTaskDisplay] = useState<string[]>([]);

  // Fetch available tasks for the trade type
  const { data: taskOptions } = useQuery<{ trade: string; tasks: TaskOption[] }>({
    queryKey: [`/api/gpt-tasks/${projectDetails.tradeType}`],
    enabled: !!projectDetails.tradeType && selectedMethod === "task-selection"
  });

  // Generate SWMS data mutation
  const generateSWMSMutation = useMutation({
    mutationFn: async (request: any) => {
      setGenerationProgress(0);
      setGeneratedTasks([]);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 12, 85));
      }, 1000);

      try {
        const response = await apiRequest("POST", "/api/generate-swms", request);
        const data = await response.json();
        
        clearInterval(progressInterval);
        setGenerationProgress(100);
        
        return data;
      } catch (error) {
        clearInterval(progressInterval);
        setGenerationProgress(0);
        throw error;
      }
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

        // Set generated tasks for editing
        setGeneratedTasks(convertedActivities);
        setIsEditing(true);
        
        setTimeout(() => {
          onActivitiesGenerated(convertedActivities, convertedPlantEquipment);
          toast({
            title: "SWMS Generated Successfully",
            description: `Generated ${convertedActivities.length} tasks. You can edit them below before finalizing.`,
          });
        }, 1000);
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
      setGenerationProgress(0);
    }
  });

  // Add new task to generated list
  const addNewTask = () => {
    if (newTask.trim()) {
      const newTaskObj = {
        id: `activity-${generatedTasks.length + 1}`,
        name: newTask.trim(),
        description: "",
        hazards: [],
        ppe: [],
        tools: [],
        trainingRequired: [],
        selected: true
      };
      setGeneratedTasks([...generatedTasks, newTaskObj]);
      setNewTask("");
    }
  };

  // Remove task from generated list
  const removeTask = (taskId: string) => {
    setGeneratedTasks(generatedTasks.filter(task => task.id !== taskId));
  };

  // Update task name
  const updateTaskName = (taskId: string, newName: string) => {
    setGeneratedTasks(generatedTasks.map(task => 
      task.id === taskId ? { ...task, name: newName } : task
    ));
  };

  // Finalize edited tasks
  const finalizeEditedTasks = () => {
    onActivitiesGenerated(generatedTasks, []);
    setIsEditing(false);
    toast({
      title: "Tasks Finalized",
      description: `${generatedTasks.length} tasks ready for SWMS creation.`,
    });
  };

  const handleMethodSelection = (method: string) => {
    setSelectedMethod(method);
    onMethodSelected(method);
  };

  const addTask = () => {
    if (newTask.trim() && !taskList.includes(newTask.trim())) {
      setTaskList([...taskList, newTask.trim()]);
      setNewTask("");
    }
  };

  const removeTask = (taskToRemove: string) => {
    setTaskList(taskList.filter(task => task !== taskToRemove));
  };

  const toggleRiskFactor = (factor: string) => {
    if (specialRiskFactors.includes(factor)) {
      setSpecialRiskFactors(specialRiskFactors.filter(f => f !== factor));
    } else {
      setSpecialRiskFactors([...specialRiskFactors, factor]);
    }
  };

  const handleTaskGeneration = async () => {
    let request: any = {
      projectDetails: {
        projectName: projectDetails.projectName,
        location: projectDetails.location,
        tradeType: projectDetails.tradeType,
        description: projectDetails.description,
        siteEnvironment,
        specialRiskFactors,
        state: selectedState
      }
    };

    if (selectedMethod === "task-selection" && selectedTask) {
      // Single task selection - use job mode
      request.taskName = selectedTask;
      request.mode = 'job';
    } else if (selectedMethod === "plain-text" && plainTextDescription) {
      // Job description - use job mode
      request.plainTextDescription = plainTextDescription;
      request.mode = 'job';
    } else if (selectedMethod === "manual" && taskList.length > 0) {
      // Multiple tasks - use task mode
      request.taskList = taskList;
      request.mode = 'task';
    } else {
      toast({
        title: "Selection Required",
        description: "Please select a task, provide a description, or add tasks to the list.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateSWMSMutation.mutate(request);
  };

  const filteredTasks = (taskOptions?.tasks || []).filter((task: TaskOption) =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                Specific Tasks
              </TabsTrigger>
              <TabsTrigger value="plain-text" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Job Description
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Manual
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
                    <p className="font-medium text-purple-900">Job Mode - Describe Your Work</p>
                    <p className="text-sm text-purple-700">Describe your job and Riskify will generate 10+ SWMS tasks based on the job scope.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="work-description">Job Description</Label>
                  <Textarea
                    id="work-description"
                    placeholder="Example: 'Install plumbing for residential bathroom fitout' - Riskify will break this down into logical, industry-accurate tasks."
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
                <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <Edit className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">Task Mode - Specific Tasks</p>
                    <p className="text-sm text-orange-700">Add specific tasks and Riskify will generate 1 SWMS row per task provided.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="task-input">Add Tasks</Label>
                  <div className="flex gap-2">
                    <Input
                      id="task-input"
                      placeholder="Example: Install hot water unit"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    />
                    <Button onClick={addTask} variant="outline">Add</Button>
                  </div>
                  
                  {taskList.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Tasks ({taskList.length}):</p>
                      <div className="space-y-1">
                        {taskList.map((task, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <span className="text-sm">{task}</span>
                            <Button
                              onClick={() => removeTask(task)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />
          
          {/* Optional Fields for Enhanced Accuracy */}
          <div className="space-y-4">
            <h3 className="font-medium">Optional Fields (Improve Accuracy)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site-environment">Site Environment</Label>
                <Select value={siteEnvironment} onValueChange={setSiteEnvironment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="high-rise">High-rise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State/Territory</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSW">NSW</SelectItem>
                    <SelectItem value="VIC">VIC</SelectItem>
                    <SelectItem value="QLD">QLD</SelectItem>
                    <SelectItem value="WA">WA</SelectItem>
                    <SelectItem value="SA">SA</SelectItem>
                    <SelectItem value="TAS">TAS</SelectItem>
                    <SelectItem value="ACT">ACT</SelectItem>
                    <SelectItem value="NT">NT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Special Risk Factors</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Confined space', 'Live electrical', 'Structural demolition', 'Height >2m', 'Airside works', 'Hazardous materials'].map((factor) => (
                  <div key={factor} className="flex items-center space-x-2">
                    <Checkbox
                      id={factor}
                      checked={specialRiskFactors.includes(factor)}
                      onCheckedChange={() => toggleRiskFactor(factor)}
                    />
                    <Label htmlFor={factor} className="text-sm">{factor}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {((selectedMethod === "task-selection" && selectedTask) || 
            (selectedMethod === "plain-text" && plainTextDescription) || 
            (selectedMethod === "manual" && taskList.length > 0)) && (
            <>
              <Separator className="my-6" />
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-medium">Ready to Generate SWMS</p>
                  <p className="text-sm text-gray-600">
                    {selectedMethod === "task-selection" && `Task: ${selectedTask}`}
                    {selectedMethod === "plain-text" && "Job description provided"}
                    {selectedMethod === "manual" && `${taskList.length} tasks added`}
                  </p>
                </div>
                
                <Button
                  onClick={handleTaskGeneration}
                  disabled={isGenerating}
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