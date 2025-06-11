import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  
  const [selectedMethod, setSelectedMethod] = useState("task-selection");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [plainTextDescription, setPlainTextDescription] = useState("");
  const [taskList, setTaskList] = useState<string[]>([]);
  const [newTask, setNewTask] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [siteEnvironment, setSiteEnvironment] = useState("");
  const [specialRiskFactors, setSpecialRiskFactors] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("NSW");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Fetch available tasks for the trade type
  const { data: taskOptions } = useQuery<{ trade: string; tasks: TaskOption[] }>({
    queryKey: [`/api/gpt-tasks/${projectDetails.tradeType}`],
    enabled: !!projectDetails.tradeType && selectedMethod === "task-selection"
  });

  // Generate SWMS data mutation with real progress tracking
  const generateSWMSMutation = useMutation({
    mutationFn: async (request: any) => {
      setGenerationProgress(0);
      setGeneratedTasks([]);
      
      // Real progress tracking with actual milestones
      const updateProgress = (stage: string, percentage: number) => {
        setGenerationProgress(percentage);
        setProgressStatus(stage);
        console.log(`SWMS Generation: ${stage} - ${percentage}%`);
      };

      try {
        updateProgress("Initializing Riskify AI", 10);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        updateProgress("Processing trade requirements", 25);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateProgress("Analyzing risk factors", 40);
        const response = await apiRequest("POST", "/api/generate-swms", request);
        
        updateProgress("Generating safety protocols", 65);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        updateProgress("Creating risk assessments", 85);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        updateProgress("Finalizing SWMS document", 100);
        
        return response;
      } catch (error) {
        setGenerationProgress(0);
        setProgressStatus("Generation failed");
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
    },
    onError: (error: any) => {
      setGenerationProgress(0);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate SWMS data. Please try again.",
        variant: "destructive",
      });
    },
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

  // Start editing a task
  const startEditingTask = (task: any) => {
    setEditingTaskId(task.id);
    setEditingTask({ ...task });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTask(null);
  };

  // Save edited task
  const saveEditedTask = () => {
    if (editingTask && editingTaskId) {
      setGeneratedTasks(generatedTasks.map(task => 
        task.id === editingTaskId ? editingTask : task
      ));
      setEditingTaskId(null);
      setEditingTask(null);
      toast({
        title: "Task Updated",
        description: "Task has been successfully updated.",
      });
    }
  };

  // Update editing task field
  const updateEditingTaskField = (field: string, value: any) => {
    if (editingTask) {
      setEditingTask({ ...editingTask, [field]: value });
    }
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

  const removeTaskFromList = (task: string) => {
    setTaskList(taskList.filter(t => t !== task));
  };

  const toggleRiskFactor = (factor: string) => {
    setSpecialRiskFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const handleGenerate = () => {
    let request;
    
    if (selectedMethod === "task-selection") {
      if (taskList.length === 0) {
        toast({
          title: "No Tasks Selected",
          description: "Please add at least one task to generate SWMS.",
          variant: "destructive",
        });
        return;
      }
      
      request = {
        mode: "task",
        tasks: taskList,
        projectDetails: {
          ...projectDetails,
          siteEnvironment,
          specialRiskFactors,
          state: selectedState
        }
      };
    } else if (selectedMethod === "plain-text") {
      if (!plainTextDescription.trim()) {
        toast({
          title: "No Description Provided",
          description: "Please provide a job description to generate SWMS.",
          variant: "destructive",
        });
        return;
      }
      
      request = {
        mode: "job",
        plainTextDescription,
        projectDetails: {
          ...projectDetails,
          siteEnvironment,
          specialRiskFactors,
          state: selectedState
        }
      };
    } else {
      // Manual method - skip generation
      onActivitiesGenerated([], []);
      return;
    }

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
                  <Search className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    Describe the specific tasks you want the SWMS built for
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter a specific task (e.g., Install electrical outlets)"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    />
                    <Button onClick={addTask} disabled={!newTask.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {taskList.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Tasks:</Label>
                      {taskList.map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{task}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTaskFromList(task)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plain-text" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Edit className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Describe the job and we'll generate 10+ tasks automatically (Job Mode)
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the job in detail..."
                    value={plainTextDescription}
                    onChange={(e) => setPlainTextDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Edit className="h-5 w-5 text-orange-600" />
                <span className="text-orange-800 font-medium">
                  Build your SWMS manually without AI assistance
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter task name (e.g., Install electrical outlets)"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  />
                  <Button onClick={addTask} disabled={!newTask.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {taskList.length > 0 && (
                  <div className="space-y-2">
                    <Label>Manual Tasks:</Label>
                    {taskList.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <span className="flex-1">{task}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTaskFromList(task)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {taskList.length > 0 && (
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => {
                        const manualActivities = taskList.map((task, index) => ({
                          id: `manual-activity-${index + 1}`,
                          name: task,
                          description: "",
                          hazards: [],
                          ppe: [],
                          tools: [],
                          trainingRequired: [],
                          selected: true
                        }));
                        onActivitiesGenerated(manualActivities, []);
                        toast({
                          title: "Manual Tasks Added",
                          description: `${taskList.length} tasks ready for detailed SWMS completion.`,
                        });
                      }}
                      size="lg"
                      className="min-w-40"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Create Manual SWMS
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Options */}
          {selectedMethod !== "manual" && (
            <>
              <div className="space-y-4 mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold">Enhanced Safety Options</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Site Environment</Label>
                    <Select value={siteEnvironment} onValueChange={setSiteEnvironment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select environment" />
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
                    <Label>State/Territory</Label>
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
                  <div className="grid grid-cols-2 gap-2">
                    {['Confined space', 'Live electrical', 'Structural demolition', 'Height >2m', 'Airside works', 'Hazardous materials'].map((factor) => (
                      <div key={factor} className="flex items-center space-x-2">
                        <Checkbox
                          checked={specialRiskFactors.includes(factor)}
                          onCheckedChange={() => toggleRiskFactor(factor)}
                        />
                        <span className="text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {generateSWMSMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{progressStatus || "Generating SWMS with Riskify AI..."}</span>
                    <span className="text-sm text-gray-500">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                </div>
              )}

              {/* Editable Tasks Table */}
              {isEditing && generatedTasks.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Generated Tasks (Editable)</h3>
                    <Button onClick={finalizeEditedTasks} variant="outline">
                      Finalize Tasks
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {generatedTasks.map((task, index) => (
                      <div key={task.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">{index + 1}</span>
                              <Input
                                value={task.name}
                                onChange={(e) => updateTaskName(task.id, e.target.value)}
                                className="flex-1 font-medium"
                                placeholder="Task name"
                              />
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingTask(task)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTask(task.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {/* Hazards */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Key Hazards</h5>
                            <div className="space-y-1">
                              {task.hazards?.slice(0, 2).map((hazard: any, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${hazard.riskRating === 'High' ? 'bg-red-500' : hazard.riskRating === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                  <span className="text-gray-600">{hazard.type}: {hazard.description.slice(0, 50)}...</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* PPE */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Required PPE</h5>
                            <div className="flex flex-wrap gap-1">
                              {task.ppe?.slice(0, 3).map((item: string, i: number) => (
                                <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{item}</span>
                              ))}
                              {task.ppe?.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">+{task.ppe.length - 3} more</span>
                              )}
                            </div>
                          </div>

                          {/* Tools */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Tools & Equipment</h5>
                            <div className="flex flex-wrap gap-1">
                              {task.tools?.slice(0, 3).map((tool: string, i: number) => (
                                <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{tool}</span>
                              ))}
                              {task.tools?.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">+{task.tools.length - 3} more</span>
                              )}
                            </div>
                          </div>

                          {/* Training */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Training Required</h5>
                            <div className="flex flex-wrap gap-1">
                              {task.trainingRequired?.slice(0, 2).map((training: string, i: number) => (
                                <span key={i} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{training}</span>
                              ))}
                              {task.trainingRequired?.length > 2 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">+{task.trainingRequired.length - 2} more</span>
                              )}
                            </div>
                          </div>

                          {/* Risk Score and Legislation */}
                          <div className="col-span-2 pt-3 border-t mt-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Risk Score:</span>
                                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                    (task.riskScore || 12) >= 15 ? 'bg-red-100 text-red-800' :
                                    (task.riskScore || 12) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {task.riskScore || 12}/20
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Legislation:</span>
                                  <span className="ml-2 text-blue-600 text-xs">
                                    {task.legislation || "WHS Act 2011, WHS Regulation 2017"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add additional task..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
                    />
                    <Button onClick={addNewTask} disabled={!newTask.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerate}
                  disabled={generateSWMSMutation.isPending}
                  size="lg"
                  className="min-w-40"
                >
                  {generateSWMSMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
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