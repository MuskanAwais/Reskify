import { useState, useEffect } from "react";
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
import { Loader2, Search, Bot, Edit, CheckCircle2, AlertCircle, Plus, Trash2, LogIn, ArrowUp, ArrowDown, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

// Comprehensive equipment risk assessment function
function assessEquipmentRisk(equipmentName: string) {
  const toolLower = equipmentName.toLowerCase();
  
  // Critical Risk (Extreme) - Life-threatening equipment
  if (toolLower.includes('explosive') || toolLower.includes('demolition') || 
      toolLower.includes('high voltage') || toolLower.includes('x-ray') ||
      toolLower.includes('radioactive') || toolLower.includes('asbestos removal')) {
    return {
      riskLevel: 'Critical',
      category: 'Hazardous Materials',
      certificationRequired: true,
      safetyRequirements: ['Specialist license required', 'Permit to work', 'Emergency response plan', 'Exclusion zones', 'Medical surveillance']
    };
  }
  
  // High Risk - Serious injury potential
  if (toolLower.includes('welding') || toolLower.includes('welder') || 
      toolLower.includes('cutting torch') || toolLower.includes('plasma') ||
      toolLower.includes('oxy') || toolLower.includes('acetylene')) {
    return {
      riskLevel: 'High',
      category: 'Welding Equipment',
      certificationRequired: true,
      safetyRequirements: ['Licensed welder required', 'Hot work permit', 'Fire watch', 'Gas bottle safety', 'Ventilation required']
    };
  }
  
  if (toolLower.includes('grinder') || toolLower.includes('angle grinder') ||
      toolLower.includes('disc cutter') || toolLower.includes('diamond saw') ||
      toolLower.includes('circular saw') || toolLower.includes('chainsaw') ||
      toolLower.includes('nail gun') || toolLower.includes('powder actuated')) {
    return {
      riskLevel: 'High',
      category: 'Power Tools',
      certificationRequired: false,
      safetyRequirements: ['Pre-use inspection', 'Guard checks', 'Eye protection', 'Hearing protection', 'Dust control']
    };
  }
  
  if (toolLower.includes('crane') || toolLower.includes('hoist') || 
      toolLower.includes('excavator') || toolLower.includes('loader') ||
      toolLower.includes('dozer') || toolLower.includes('telehandler') ||
      toolLower.includes('forklift') || toolLower.includes('boom lift') ||
      toolLower.includes('scissor lift') || toolLower.includes('cherry picker')) {
    return {
      riskLevel: 'High',
      category: 'Heavy Plant',
      certificationRequired: true,
      safetyRequirements: ['Licensed operator', 'Daily pre-start inspection', 'Lift plan required', 'Exclusion zones', 'Spotter required']
    };
  }
  
  if (toolLower.includes('jackhammer') || toolLower.includes('pneumatic breaker') ||
      toolLower.includes('concrete saw') || toolLower.includes('demo hammer') ||
      toolLower.includes('rotary hammer') || toolLower.includes('core drill')) {
    return {
      riskLevel: 'High',
      category: 'Demolition Tools',
      certificationRequired: false,
      safetyRequirements: ['Hearing protection', 'Dust control', 'Vibration limits', 'Structural assessment', 'Utility clearance']
    };
  }
  
  // Medium Risk - Moderate injury potential
  if (toolLower.includes('compressor') || toolLower.includes('generator') ||
      toolLower.includes('pressure washer') || toolLower.includes('pump') ||
      toolLower.includes('concrete mixer') || toolLower.includes('plate compactor')) {
    return {
      riskLevel: 'Medium',
      category: 'Plant Equipment',
      certificationRequired: false,
      safetyRequirements: ['Pre-start checks', 'Pressure testing', 'Noise protection', 'Fuel handling', 'Maintenance schedule']
    };
  }
  
  if (toolLower.includes('ladder') || toolLower.includes('step ladder') ||
      toolLower.includes('extension ladder') || toolLower.includes('platform') ||
      toolLower.includes('trestle') || toolLower.includes('a-frame')) {
    return {
      riskLevel: 'Medium',
      category: 'Access Equipment',
      certificationRequired: false,
      safetyRequirements: ['Pre-use inspection', '3:1 angle rule', 'Three points contact', 'Weight limits', 'Secure base']
    };
  }
  
  if (toolLower.includes('drill') || toolLower.includes('impact driver') ||
      toolLower.includes('router') || toolLower.includes('jigsaw') ||
      toolLower.includes('reciprocating saw') || toolLower.includes('belt sander')) {
    return {
      riskLevel: 'Medium',
      category: 'Power Tools',
      certificationRequired: false,
      safetyRequirements: ['Pre-use inspection', 'Appropriate bits/blades', 'Secure workpiece', 'Eye protection', 'Dust extraction']
    };
  }
  
  if (toolLower.includes('scaffold') || toolLower.includes('scaffolding') ||
      toolLower.includes('mobile scaffold') || toolLower.includes('kwikstage')) {
    return {
      riskLevel: 'Medium',
      category: 'Scaffolding',
      certificationRequired: true,
      safetyRequirements: ['Licensed scaffolder', 'Handover certificate', 'Daily inspection', 'Fall protection', 'Load limits']
    };
  }
  
  // Low Risk - Minor injury potential
  if (toolLower.includes('hammer') || toolLower.includes('screwdriver') ||
      toolLower.includes('wrench') || toolLower.includes('pliers') ||
      toolLower.includes('chisel') || toolLower.includes('file') ||
      toolLower.includes('hand saw') || toolLower.includes('spirit level') ||
      toolLower.includes('measuring tape') || toolLower.includes('square') ||
      toolLower.includes('measuring') || toolLower.includes('ruler') ||
      toolLower.includes('caliper') || toolLower.includes('gauge') ||
      toolLower.includes('broom') || toolLower.includes('brush') ||
      toolLower.includes('cleaning') || toolLower.includes('cloth') ||
      toolLower.includes('bucket') || toolLower.includes('mop') ||
      toolLower.includes('dustpan') || toolLower.includes('marker') ||
      toolLower.includes('pencil') || toolLower.includes('chalk') ||
      toolLower.includes('string line') || toolLower.includes('level')) {
    return {
      riskLevel: 'Low',
      category: 'Hand Tools',
      certificationRequired: false,
      safetyRequirements: ['Pre-use inspection', 'Proper handling', 'Sharp edge protection', 'Appropriate tool for task']
    };
  }
  
  // Default assessment for unknown equipment
  return {
    riskLevel: 'Medium',
    category: 'General Equipment',
    certificationRequired: false,
    safetyRequirements: ['Pre-use inspection', 'Follow manufacturer instructions', 'Appropriate PPE', 'Training required']
  };
}

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
  onActivitiesGenerated: (activities: any[], plantEquipment: any[], workDescription?: string) => void;
  onMethodSelected: (method: string) => void;
  savedWorkDescription?: string;
  savedActivities?: any[];
}

export default function GPTTaskSelection({ 
  projectDetails, 
  onActivitiesGenerated, 
  onMethodSelected,
  savedWorkDescription = '',
  savedActivities = []
}: GPTTaskSelectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [selectedMethod, setSelectedMethod] = useState("plain-text");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [plainTextDescription, setPlainTextDescription] = useState("");
  const [taskList, setTaskList] = useState<string[]>([]);
  const [newTask, setNewTask] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [siteEnvironment, setSiteEnvironment] = useState("");
  const [specialRiskFactors, setSpecialRiskFactors] = useState<string[]>([]);
  const [hrcwCategories, setHrcwCategories] = useState<number[]>([]);
  const [selectedState, setSelectedState] = useState("NSW");
  const [showAllHRCW, setShowAllHRCW] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Initialize component with saved data when available
  useEffect(() => {
    if (savedWorkDescription) {
      setPlainTextDescription(savedWorkDescription);
      console.log('Restored job description:', savedWorkDescription);
    }
    // Always restore saved activities if they exist, regardless of current generated tasks
    if (savedActivities && savedActivities.length > 0) {
      console.log('Step 2 - Restoring saved activities:', savedActivities);
      console.log('Step 2 - Current generated tasks count (before update):', generatedTasks.length);
      setGeneratedTasks(savedActivities);
      setIsEditing(true); // Enable editing mode to display the restored activities
      console.log('Step 2 - Activities restored successfully, setting isEditing to true');
    } else {
      console.log('Step 2 - No saved activities to restore');
    }
  }, [savedWorkDescription, savedActivities]);



  // Risk matrix mapping
  const getRiskDescription = (score: number): string => {
    if (score >= 16) return "Extreme";
    if (score >= 11) return "High";
    if (score >= 6) return "Medium";
    if (score >= 3) return "Low";
    return "Very Low";
  };

  const getRiskColor = (score: number): string => {
    if (score >= 16) return "bg-red-100 text-red-800";
    if (score >= 11) return "bg-orange-100 text-orange-800";
    if (score >= 6) return "bg-yellow-100 text-yellow-800";
    if (score >= 3) return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

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
        await new Promise(resolve => setTimeout(resolve, 500));
        
        updateProgress("Processing trade requirements", 25);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        updateProgress("Analyzing risk factors", 40);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        updateProgress("Generating SWMS data", 60);
        const response = await apiRequest("POST", "/api/generate-swms", request);
        const data = await response.json();
        
        updateProgress("Processing safety protocols", 80);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        updateProgress("Finalizing document", 100);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        return data;
      } catch (error) {
        setGenerationProgress(0);
        setProgressStatus("Generation failed");
        throw error;
      }
    },
    onSuccess: (data: any) => {
      console.log('Generation success response:', data);
      setGenerationProgress(100);
      
      if (data.success && data.data && data.data.activities && data.data.activities.length > 0) {
        // Convert generated data to the format expected by the parent component
        const convertedActivities = data.data.activities.map((activity: any, index: number) => ({
          id: `activity-${index + 1}`,
          name: activity.name || activity.task,
          description: activity.description,
          hazards: activity.hazards,
          ppe: activity.ppe,
          tools: activity.tools,
          trainingRequired: activity.trainingRequired,
          riskScore: activity.riskScore || 12,
          legislation: activity.legislation || "WHS Act 2011, WHS Regulation 2017",
          selected: true
        }));

        console.log('Raw AI activities:', data.data.activities);
        console.log('Converted activities:', convertedActivities);
        
        if (convertedActivities.length === 0) {
          console.error('CRITICAL: No activities generated despite success response');
          toast({
            title: "Generation Error",
            description: "No tasks were generated. Please try again with a different description.",
            variant: "destructive",
          });
          setGenerationProgress(0);
          return;
        }

        const convertedPlantEquipment = data.data.plantEquipment?.map((equipment: any, index: number) => ({
          id: `equipment-${index + 1}`,
          ...equipment
        })) || [];

        // Auto-extract plant and equipment from generated tasks with proper risk levels
        const autoPlantEquipment: any[] = [];
        convertedActivities.forEach((activity: any, index: number) => {
          if (activity.tools && activity.tools.length > 0) {
            activity.tools.forEach((tool: string, toolIndex: number) => {
              // Comprehensive equipment risk assessment using dedicated function
              const equipmentAssessment = assessEquipmentRisk(tool);
              
              autoPlantEquipment.push({
                id: `auto-equipment-${index}-${toolIndex}`,
                name: tool,
                type: 'Equipment',
                category: equipmentAssessment.category,
                certificationRequired: equipmentAssessment.certificationRequired,
                inspectionStatus: 'Current',
                riskLevel: equipmentAssessment.riskLevel,
                safetyRequirements: equipmentAssessment.safetyRequirements
              });
            });
          }
        });

        const allPlantEquipment = [...convertedPlantEquipment, ...autoPlantEquipment];

        // CRITICAL FIX: Set tasks and editing state together BEFORE calling the callback
        console.log('CRITICAL FIX: Setting generated tasks and editing state immediately');
        console.log('CRITICAL FIX: Generated tasks count:', convertedActivities.length);
        console.log('CRITICAL FIX: First task:', convertedActivities[0]?.name);
        
        // Use functional state updates to ensure immediate state change
        setGeneratedTasks(() => {
          console.log('CRITICAL FIX: State setter called for generatedTasks');
          return convertedActivities;
        });
        setIsEditing(() => {
          console.log('CRITICAL FIX: State setter called for isEditing');
          return true;
        });
        
        // Call the callback immediately to update parent state
        console.log('CRITICAL FIX: Calling onActivitiesGenerated callback');
        onActivitiesGenerated(convertedActivities, allPlantEquipment, plainTextDescription);
        
        // Show success toast
        toast({
          title: "SWMS Generated Successfully",
          description: `Generated ${convertedActivities.length} tasks with ${allPlantEquipment.length} equipment items auto-populated. Tasks are now ready for editing.`,
        });
        
        // Force a re-render by updating state
        setTimeout(() => {
          if (!isEditing || generatedTasks.length === 0) {
            console.log('BACKUP: Force setting editing state and tasks again');
            setIsEditing(true);
            setGeneratedTasks(convertedActivities);
          }
        }, 100);
        
      } else {
        console.error('CRITICAL: Generation API returned success but no valid data:', data);
        toast({
          title: "Generation Error", 
          description: "The AI generated an empty response. Please try with a more detailed description.",
          variant: "destructive",
        });
        setGenerationProgress(0);
      }
    },
    onError: (error: any) => {
      setGenerationProgress(0);
      
      // Check for authentication error
      if (error.message?.includes('Authentication required') || error.message?.includes('401')) {
        toast({
          title: "Login Required",
          description: "Please log in to generate SWMS documents.",
          variant: "destructive",
        });
        setLocation('/auth');
        return;
      }
      
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate SWMS data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add new task to generated list
  const addNewTaskToGenerated = () => {
    if (newTask.trim()) {
      const newTaskObj = {
        id: `activity-${generatedTasks.length + 1}`,
        name: newTask.trim(),
        description: "Custom task - manually added",
        hazards: [
          {
            type: "General",
            description: "Standard workplace hazards - to be assessed",
            riskRating: 8
          }
        ],
        ppe: ["Safety glasses", "Hard hat", "High-vis vest", "Safety boots"],
        tools: ["Standard hand tools"],
        trainingRequired: ["General construction induction", "Task-specific training"],
        riskScore: 10,
        residualRisk: 5,
        legislation: "WHS Act 2011, WHS Regulation 2017",
        selected: true
      };
      setGeneratedTasks([...generatedTasks, newTaskObj]);
      setNewTask("");
      
      toast({
        title: "Task Added",
        description: "Additional task added successfully. You can edit it using the edit button.",
      });
    }
  };

  // Remove task from generated list
  const removeGeneratedTask = (taskId: string) => {
    setGeneratedTasks(generatedTasks.filter(task => task.id !== taskId));
    toast({
      title: "Task Removed",
      description: "Task has been removed from the list.",
    });
  };

  // Move task up in order
  const moveTaskUp = (taskId: string) => {
    const index = generatedTasks.findIndex(task => task.id === taskId);
    if (index > 0) {
      const newTasks = [...generatedTasks];
      [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
      setGeneratedTasks(newTasks);
    }
  };

  // Move task down in order
  const moveTaskDown = (taskId: string) => {
    const index = generatedTasks.findIndex(task => task.id === taskId);
    if (index < generatedTasks.length - 1) {
      const newTasks = [...generatedTasks];
      [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
      setGeneratedTasks(newTasks);
    }
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

  const toggleHrcwCategory = (categoryId: number) => {
    setHrcwCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
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
          hrcwCategories: hrcwCategories,
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
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2 h-auto p-2">
              <TabsTrigger value="plain-text" className="flex items-center gap-2 text-xs sm:text-sm px-2 py-3">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">Describe Job (AI-Powered)</span>
                <span className="sm:hidden">AI Generate</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2 text-xs sm:text-sm px-2 py-3">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Manual Entry</span>
                <span className="sm:hidden">Manual</span>
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
                    placeholder={projectDetails.description || "Describe the job in detail..."}
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

                <div className="space-y-4">
                  <Label className="text-base font-medium">High-Risk Construction Work Categories</Label>
                  <p className="text-sm text-gray-600">Select applicable HRCW categories to enhance AI generation with targeted safety requirements</p>
                  
                  <div className="relative">
                    <div className="grid grid-cols-1 gap-3 max-h-none">
                      {/* All 18 categories in expandable view */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { id: 1, title: "Risk of falling more than 2 metres", description: "Work on ladders, scaffolding, roofs" },
                          { id: 2, title: "Work on telecommunication tower", description: "Telecommunication infrastructure work" },
                          { id: 3, title: "Demolition of load-bearing elements", description: "Structural demolition work" },
                          { id: 4, title: "Work involving asbestos disturbance", description: "Asbestos removal or disturbance" },
                          { id: 5, title: "Structural alterations requiring support", description: "Temporary structural support needed" },
                          { id: 6, title: "Work in or near confined spaces", description: "Confined space entry or nearby work" },
                          { id: 7, title: "Work in shafts, trenches or tunnels", description: "Excavation deeper than 1.5m" },
                          { id: 8, title: "Work involving explosives", description: "Use of explosives for construction" },
                          { id: 9, title: "Work on pressurised gas systems", description: "Gas distribution mains or piping" },
                          ...(!showAllHRCW ? [] : [
                            { id: 10, title: "Work on chemical/fuel/refrigerant lines", description: "Hazardous substance piping" },
                            { id: 11, title: "Work on energised electrical installations", description: "Live electrical work" },
                            { id: 12, title: "Work in contaminated/flammable atmospheres", description: "Contaminated or explosive atmospheres" },
                            { id: 13, title: "Tilt-up or precast concrete work", description: "Tilt-up or precast concrete elements" },
                            { id: 14, title: "Work adjacent to active traffic corridors", description: "Work near roads/railways in use" },
                            { id: 15, title: "Work with powered mobile plant", description: "Areas with forklifts, excavators, cranes" },
                            { id: 16, title: "Work in extreme temperature areas", description: "Cold rooms, furnace areas" },
                            { id: 17, title: "Work near water with drowning risk", description: "Water work with drowning risk" },
                            { id: 18, title: "Work on live electrical conductors", description: "Live electrical conductor work" }
                          ])
                        ].map((category) => {
                          const isSelected = hrcwCategories.includes(category.id);
                          return (
                            <div 
                              key={category.id} 
                              className={`cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 hover:shadow-md ${
                                isSelected 
                                  ? 'border-red-500 bg-red-50 shadow-md' 
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                              onClick={() => toggleHrcwCategory(category.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                                  isSelected 
                                    ? 'bg-red-500 border-red-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900 leading-tight">
                                    {category.id}. {category.title}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 leading-tight">
                                    {category.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Show More/Less button */}
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => setShowAllHRCW(!showAllHRCW)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {showAllHRCW ? 'Show Less Categories' : 'Show More Categories (9 additional)'}
                          </span>
                          {showAllHRCW ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authentication Check */}
              {!user && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-800">Login Required</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        You need to log in to generate SWMS documents with guaranteed 8+ tasks.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setLocation('/auth')}
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </div>
                </div>
              )}

              {/* Generate SWMS Button with increased spacing */}
              <div className="flex justify-end mt-8 mb-8">
                <Button 
                  onClick={handleGenerate}
                  disabled={generateSWMSMutation.isPending || !user}
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
                      Generate SWMS (8+ Tasks)
                    </>
                  )}
                </Button>
              </div>

              {/* Enhanced Progress Bar with Detailed Descriptions */}
              {generateSWMSMutation.isPending && (
                <div className="space-y-3 mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">{progressStatus || "Generating SWMS with Riskify AI..."}</span>
                    <span className="text-sm text-blue-600 font-medium">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="w-full h-2" />
                  <div className="text-xs text-blue-600 font-medium">
                    {generationProgress === 60 ? (
                      "🔄 Creating comprehensive safety procedures - this is the most complex step and takes longest (30-45 seconds)"
                    ) : generationProgress === 70 ? (
                      "✅ Validating against Australian WHS regulations and compliance requirements"
                    ) : generationProgress === 80 ? (
                      "🛡️ Processing control measures, PPE requirements, and emergency procedures"
                    ) : generationProgress >= 90 ? (
                      "🔧 Auto-populating plant and equipment with accurate risk assessments"
                    ) : (
                      "⚡ Analyzing your trade requirements and safety factors..."
                    )}
                  </div>
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
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex flex-col gap-1 mt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveTaskUp(task.id)}
                                disabled={index === 0}
                                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                                title="Move up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveTaskDown(task.id)}
                                disabled={index === generatedTasks.length - 1}
                                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                                title="Move down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
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
                              onClick={() => removeGeneratedTask(task.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4 text-sm">
                          {/* Hazards */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2 text-xs sm:text-sm">Key Hazards</h5>
                            <div className="space-y-1">
                              {task.hazards?.slice(0, 2).map((hazard: any, i: number) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${hazard.riskRating === 'High' ? 'bg-red-500' : hazard.riskRating === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                  <span className="text-gray-600 text-xs sm:text-sm leading-relaxed">{hazard.type}: {hazard.description.slice(0, 60)}...</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* PPE */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2 text-xs sm:text-sm">Required PPE</h5>
                            <div className="flex flex-wrap gap-1">
                              {task.ppe?.slice(0, 4).map((item: string, i: number) => (
                                <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">{item}</span>
                              ))}
                              {task.ppe?.length > 4 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">+{task.ppe.length - 4} more</span>
                              )}
                            </div>
                          </div>

                          {/* Tools */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2 text-xs sm:text-sm">Tools & Equipment</h5>
                            <div className="flex flex-wrap gap-1">
                              {task.tools?.slice(0, 4).map((tool: string, i: number) => (
                                <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">{tool}</span>
                              ))}
                              {task.tools?.length > 4 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">+{task.tools.length - 4} more</span>
                              )}
                            </div>
                          </div>

                          {/* Training */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2 text-xs sm:text-sm">Training Required</h5>
                            <div className="flex flex-wrap gap-1">
                              {task.trainingRequired?.slice(0, 3).map((training: string, i: number) => (
                                <span key={i} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded whitespace-nowrap">{training}</span>
                              ))}
                              {task.trainingRequired?.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">+{task.trainingRequired.length - 3} more</span>
                              )}
                            </div>
                          </div>

                          {/* Risk Score and Legislation */}
                          <div className="pt-3 border-t mt-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="text-xs sm:text-sm">
                                  <span className="font-medium text-gray-700">Risk Score:</span>
                                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getRiskColor(task.riskScore || 12)}`}>
                                    {task.riskScore || 12}/20 - {getRiskDescription(task.riskScore || 12)}
                                  </span>
                                </div>
                                <div className="text-xs sm:text-sm">
                                  <span className="font-medium text-gray-700">Legislation:</span>
                                  <span className="ml-2 text-blue-600 text-xs">
                                    {task.legislation || "WHS Act 2011"}
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
                      onKeyPress={(e) => e.key === 'Enter' && addNewTaskToGenerated()}
                    />
                    <Button onClick={addNewTaskToGenerated} disabled={!newTask.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Task Editing Modal */}
              {editingTaskId && editingTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">Edit Task</h3>
                        <div className="flex gap-2">
                          <Button onClick={saveEditedTask} className="bg-green-600 hover:bg-green-700">
                            Save Changes
                          </Button>
                          <Button onClick={cancelEditing} variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Task Name and Description */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="task-name">Task Name</Label>
                            <Input
                              id="task-name"
                              value={editingTask.name}
                              onChange={(e) => updateEditingTaskField('name', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="task-description">Task Description</Label>
                            <Textarea
                              id="task-description"
                              value={editingTask.description}
                              onChange={(e) => updateEditingTaskField('description', e.target.value)}
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        {/* Risk Score and Legislation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="risk-score">Initial Risk Score (1-20)</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                id="risk-score"
                                type="number"
                                min="1"
                                max="20"
                                value={editingTask.riskScore || 12}
                                onChange={(e) => updateEditingTaskField('riskScore', parseInt(e.target.value))}
                                className="flex-1"
                              />
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(editingTask.riskScore || 12)}`}>
                                {getRiskDescription(editingTask.riskScore || 12)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="residual-risk">Residual Risk Score (1-20)</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                id="residual-risk"
                                type="number"
                                min="1"
                                max="20"
                                value={editingTask.residualRisk || 6}
                                onChange={(e) => updateEditingTaskField('residualRisk', parseInt(e.target.value))}
                                className="flex-1"
                              />
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(editingTask.residualRisk || 6)}`}>
                                {getRiskDescription(editingTask.residualRisk || 6)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Legislation */}
                        <div>
                          <Label htmlFor="legislation">Applicable Legislation</Label>
                          <Input
                            id="legislation"
                            value={editingTask.legislation || "WHS Act 2011, WHS Regulation 2017"}
                            onChange={(e) => updateEditingTaskField('legislation', e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        {/* Hazards Section */}
                        <div>
                          <Label>Hazards & Control Measures</Label>
                          <div className="mt-2 space-y-4">
                            {editingTask.hazards?.map((hazard: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm">Hazard Type</Label>
                                    <Input
                                      value={hazard.type || ''}
                                      onChange={(e) => {
                                        const newHazards = [...(editingTask.hazards || [])];
                                        newHazards[index] = { ...newHazards[index], type: e.target.value };
                                        updateEditingTaskField('hazards', newHazards);
                                      }}
                                      placeholder="e.g., Electrical, Physical, Chemical"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm">Risk Rating</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={hazard.riskRating || 8}
                                        onChange={(e) => {
                                          const newHazards = [...(editingTask.hazards || [])];
                                          newHazards[index] = { ...newHazards[index], riskRating: parseInt(e.target.value) };
                                          updateEditingTaskField('hazards', newHazards);
                                        }}
                                        className="flex-1"
                                      />
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(hazard.riskRating || 8)}`}>
                                        {getRiskDescription(hazard.riskRating || 8)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <Label className="text-sm">Hazard Description</Label>
                                  <Textarea
                                    value={hazard.description || ''}
                                    onChange={(e) => {
                                      const newHazards = [...(editingTask.hazards || [])];
                                      newHazards[index] = { ...newHazards[index], description: e.target.value };
                                      updateEditingTaskField('hazards', newHazards);
                                    }}
                                    placeholder="Describe the hazard and potential consequences"
                                    rows={2}
                                    className="mt-1"
                                  />
                                </div>
                                <div className="mt-4">
                                  <Label className="text-sm">Control Measures</Label>
                                  <div className="mt-2 space-y-2">
                                    {hazard.controlMeasures?.map((control: string, controlIndex: number) => (
                                      <div key={controlIndex} className="flex items-center gap-2">
                                        <Input
                                          value={control}
                                          onChange={(e) => {
                                            const newHazards = [...(editingTask.hazards || [])];
                                            const newControls = [...(newHazards[index].controlMeasures || [])];
                                            newControls[controlIndex] = e.target.value;
                                            newHazards[index] = { ...newHazards[index], controlMeasures: newControls };
                                            updateEditingTaskField('hazards', newHazards);
                                          }}
                                          placeholder="Control measure"
                                          className="flex-1"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const newHazards = [...(editingTask.hazards || [])];
                                            const newControls = newHazards[index].controlMeasures?.filter((_: any, i: number) => i !== controlIndex) || [];
                                            newHazards[index] = { ...newHazards[index], controlMeasures: newControls };
                                            updateEditingTaskField('hazards', newHazards);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newHazards = [...(editingTask.hazards || [])];
                                        const newControls = [...(newHazards[index].controlMeasures || []), ''];
                                        newHazards[index] = { ...newHazards[index], controlMeasures: newControls };
                                        updateEditingTaskField('hazards', newHazards);
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Control Measure
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <Label className="text-sm">Residual Risk (After Controls)</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Input
                                      type="number"
                                      min="1"
                                      max="20"
                                      value={hazard.residualRisk || 4}
                                      onChange={(e) => {
                                        const newHazards = [...(editingTask.hazards || [])];
                                        newHazards[index] = { ...newHazards[index], residualRisk: parseInt(e.target.value) };
                                        updateEditingTaskField('hazards', newHazards);
                                      }}
                                      className="w-20"
                                    />
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(hazard.residualRisk || 4)}`}>
                                      {getRiskDescription(hazard.residualRisk || 4)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newHazards = editingTask.hazards?.filter((_: any, i: number) => i !== index) || [];
                                      updateEditingTaskField('hazards', newHazards);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove Hazard
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => {
                                const newHazard = {
                                  type: '',
                                  description: '',
                                  riskRating: 8,
                                  controlMeasures: [''],
                                  residualRisk: 4
                                };
                                const newHazards = [...(editingTask.hazards || []), newHazard];
                                updateEditingTaskField('hazards', newHazards);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add New Hazard
                            </Button>
                          </div>
                        </div>

                        {/* PPE Section */}
                        <div>
                          <Label>Personal Protective Equipment (PPE)</Label>
                          <div className="mt-2 space-y-2">
                            {editingTask.ppe?.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) => {
                                    const newPPE = [...(editingTask.ppe || [])];
                                    newPPE[index] = e.target.value;
                                    updateEditingTaskField('ppe', newPPE);
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newPPE = editingTask.ppe?.filter((_: any, i: number) => i !== index) || [];
                                    updateEditingTaskField('ppe', newPPE);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newPPE = [...(editingTask.ppe || []), ''];
                                updateEditingTaskField('ppe', newPPE);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add PPE Item
                            </Button>
                          </div>
                        </div>

                        {/* Tools Section */}
                        <div>
                          <Label>Tools & Equipment</Label>
                          <div className="mt-2 space-y-2">
                            {editingTask.tools?.map((tool: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  value={tool}
                                  onChange={(e) => {
                                    const newTools = [...(editingTask.tools || [])];
                                    newTools[index] = e.target.value;
                                    updateEditingTaskField('tools', newTools);
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newTools = editingTask.tools?.filter((_: any, i: number) => i !== index) || [];
                                    updateEditingTaskField('tools', newTools);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newTools = [...(editingTask.tools || []), ''];
                                updateEditingTaskField('tools', newTools);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Tool
                            </Button>
                          </div>
                        </div>

                        {/* Training Section */}
                        <div>
                          <Label>Training Required</Label>
                          <div className="mt-2 space-y-2">
                            {editingTask.trainingRequired?.map((training: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  value={training}
                                  onChange={(e) => {
                                    const newTraining = [...(editingTask.trainingRequired || [])];
                                    newTraining[index] = e.target.value;
                                    updateEditingTaskField('trainingRequired', newTraining);
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newTraining = editingTask.trainingRequired?.filter((_: any, i: number) => i !== index) || [];
                                    updateEditingTaskField('trainingRequired', newTraining);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newTraining = [...(editingTask.trainingRequired || []), ''];
                                updateEditingTaskField('trainingRequired', newTraining);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Training
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}