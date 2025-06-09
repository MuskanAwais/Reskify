import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Search, Brain, Edit, Plus, X, Loader2, CheckCircle } from "lucide-react";

interface Task {
  id?: string;
  activity: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  riskLevel?: string;
  hazards?: string[];
  controlMeasures?: string[];
}

interface TaskSelectionWithAIProps {
  tradeType: string;
  onTasksUpdate: (tasks: Task[]) => void;
  onWorkDescriptionUpdate: (description: string) => void;
  selectedTasks: Task[];
  workDescription: string;
}

export default function TaskSelectionWithAI({
  tradeType,
  onTasksUpdate,
  onWorkDescriptionUpdate,
  selectedTasks,
  workDescription
}: TaskSelectionWithAIProps) {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [customTask, setCustomTask] = useState({ activity: "", category: "", priority: "medium" as const });
  const { toast } = useToast();

  // Search database tasks
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/search-tasks', searchQuery, tradeType],
    enabled: searchQuery.length > 2,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/search-tasks?query=${encodeURIComponent(searchQuery)}&trade=${tradeType}`);
      return response.json();
    }
  });

  // AI generation mutation
  const aiGenerateMutation = useMutation({
    mutationFn: async (description: string) => {
      setGenerationProgress(0);
      
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      const response = await apiRequest('POST', '/api/generate-task-data', {
        description,
        tradeType,
        requestType: 'task_generation'
      });
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.tasks && data.tasks.length > 0) {
        const newTasks = data.tasks.map((task: any) => ({
          activity: task.activity,
          category: task.category || tradeType,
          priority: task.priority || 'medium',
          riskLevel: task.riskLevel,
          hazards: task.hazards || [],
          controlMeasures: task.controlMeasures || []
        }));
        
        onTasksUpdate([...selectedTasks, ...newTasks]);
        onWorkDescriptionUpdate(aiDescription);
        
        toast({
          title: "Tasks Generated",
          description: `Generated ${newTasks.length} tasks with comprehensive safety data`,
        });
        
        setGenerationProgress(0);
      }
    },
    onError: (error: any) => {
      setGenerationProgress(0);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate tasks",
        variant: "destructive",
      });
    }
  });

  const addTaskFromSearch = (task: any) => {
    const newTask: Task = {
      id: task.id,
      activity: task.activity,
      category: task.category || tradeType,
      priority: task.riskLevel === 'High' || task.riskLevel === 'Extreme' ? 'high' : 
                task.riskLevel === 'Medium' ? 'medium' : 'low',
      riskLevel: task.riskLevel,
      hazards: task.hazards || [],
      controlMeasures: task.controlMeasures || []
    };
    
    if (!selectedTasks.find(t => t.activity === newTask.activity)) {
      onTasksUpdate([...selectedTasks, newTask]);
      toast({
        title: "Task Added",
        description: `Added "${task.activity}" to your SWMS`,
      });
    }
  };

  const addCustomTask = () => {
    if (customTask.activity.trim()) {
      const newTask: Task = {
        activity: customTask.activity,
        category: customTask.category || tradeType,
        priority: customTask.priority
      };
      
      onTasksUpdate([...selectedTasks, newTask]);
      setCustomTask({ activity: "", category: "", priority: "medium" });
      
      toast({
        title: "Custom Task Added",
        description: "Task added successfully - remember to add safety details",
      });
    }
  };

  const removeTask = (index: number) => {
    const updatedTasks = selectedTasks.filter((_, i) => i !== index);
    onTasksUpdate(updatedTasks);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2 text-xs">
            <Search className="h-4 w-4" />
            <div className="text-center">
              <div className="font-medium">Search Database</div>
              <div className="text-[10px] opacity-70">Find existing tasks</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="ai-generate" className="flex items-center gap-2 text-xs">
            <Brain className="h-4 w-4" />
            <div className="text-center">
              <div className="font-medium">AI Auto-Generate</div>
              <div className="text-[10px] opacity-70">AI creates tasks for you</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2 text-xs">
            <Edit className="h-4 w-4" />
            <div className="text-center">
              <div className="font-medium">Manual Entry</div>
              <div className="text-[10px] opacity-70">Write your own tasks</div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Option 1: Search Our Task Database
              </CardTitle>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">How this works:</h4>
                <p className="text-sm text-blue-700">
                  Search through thousands of pre-built tasks with complete safety data already included. 
                  Each task comes with hazards, control measures, and compliance requirements ready to use.
                </p>
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  ✓ Fastest option • ✓ Pre-validated safety data • ✓ Industry standards included
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search for tasks by keyword or activity type</Label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., electrical installation, concrete pouring, scaffolding..."
                />
              </div>
              
              {isSearching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching database...
                </div>
              )}
              
              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((task: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{task.activity}</div>
                        <div className="text-sm text-muted-foreground">
                          {task.category} • Risk: {task.riskLevel}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addTaskFromSearch(task)}
                        disabled={selectedTasks.some(t => t.activity === task.activity)}
                      >
                        {selectedTasks.some(t => t.activity === task.activity) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery.length > 2 && searchResults && searchResults.length === 0 && !isSearching && (
                <div className="text-center py-4 text-muted-foreground">
                  No tasks found. Try the AI Generate tab to create custom tasks.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Option 2: AI Auto-Generate Tasks
              </CardTitle>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">How this works:</h4>
                <p className="text-sm text-purple-700">
                  Simply describe your work in plain English. Our AI will automatically break it down into specific tasks 
                  and generate complete safety data, risk assessments, and control measures for each task.
                </p>
                <p className="text-xs text-purple-600 mt-2 font-medium">
                  ✓ Custom to your project • ✓ AI-powered safety analysis • ✓ Comprehensive risk data generated
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ai-description">Describe your work in detail</Label>
                <Textarea
                  id="ai-description"
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="e.g., Install new electrical panels in basement, run conduit to upper floors, connect distribution boards..."
                  rows={4}
                />
              </div>
              
              {generationProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating comprehensive task data...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}
              
              <Button
                onClick={() => aiGenerateMutation.mutate(aiDescription)}
                disabled={!aiDescription.trim() || aiGenerateMutation.isPending}
                className="w-full"
              >
                {aiGenerateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Tasks & Safety Data...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Tasks with AI
                  </>
                )}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                AI will analyze your description and generate relevant tasks with comprehensive safety data, 
                risk assessments, and control measures specific to {tradeType} work.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-green-600" />
                Option 3: Manual Task Entry
              </CardTitle>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">How this works:</h4>
                <p className="text-sm text-green-700">
                  Enter your own custom tasks exactly as you want them. You'll have complete control over the task descriptions
                  and will manually add all safety data, risk assessments, and control measures in the next steps.
                </p>
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ✓ Full control • ✓ Custom task names • ✓ Manual safety data entry required
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom-activity">Task Description</Label>
                  <Input
                    id="custom-activity"
                    value={customTask.activity}
                    onChange={(e) => setCustomTask({ ...customTask, activity: e.target.value })}
                    placeholder="Enter your custom task description"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-category">Category (optional)</Label>
                  <Input
                    id="custom-category"
                    value={customTask.category}
                    onChange={(e) => setCustomTask({ ...customTask, category: e.target.value })}
                    placeholder={`Default: ${tradeType}`}
                  />
                </div>
              </div>
              
              <Button onClick={addCustomTask} disabled={!customTask.activity.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Task
              </Button>
              
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Custom tasks will require you to manually add risk assessments, 
                  hazards, and control measures in the following steps of the SWMS builder.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Tasks Display */}
      {selectedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Tasks ({selectedTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{task.activity}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}>
                        {task.priority} priority
                      </Badge>
                      {task.riskLevel && (
                        <Badge variant="outline">
                          {task.riskLevel} risk
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTask(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Description */}
      <div>
        <Label htmlFor="work-description">Overall Work Description</Label>
        <Textarea
          id="work-description"
          value={workDescription}
          onChange={(e) => onWorkDescriptionUpdate(e.target.value)}
          placeholder="Provide an overall description of the work activities..."
          rows={3}
        />
      </div>
    </div>
  );
}