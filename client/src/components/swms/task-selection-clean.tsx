import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Search, Brain, Edit, Plus, X, Loader2, CheckCircle } from "lucide-react";
import { SimplifiedTableEditor } from "./simplified-table-editor";

interface Task {
  id?: string;
  activity: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  riskLevel?: string;
  hazards?: string[];
  controlMeasures?: string[];
}

interface TaskSelectionCleanProps {
  tradeType: string;
  onTasksUpdate: (tasks: Task[]) => void;
  selectedTasks: Task[];
  onRiskAssessmentsUpdate?: (assessments: any[]) => void;
  riskAssessments?: any[];
}

export default function TaskSelectionClean({
  tradeType,
  onTasksUpdate,
  selectedTasks,
  onRiskAssessmentsUpdate,
  riskAssessments = []
}: TaskSelectionCleanProps) {
  const [activeMethod, setActiveMethod] = useState<"search" | "ai" | "manual">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [customTask, setCustomTask] = useState({ activity: "", category: "", priority: "medium" as const });
  const { toast } = useToast();

  // Search database tasks
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/search-tasks', searchQuery, tradeType],
    enabled: searchQuery.length > 2,
  });

  // AI task generation
  const aiGenerateMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest('POST', '/api/generate-tasks', {
        description,
        tradeType,
      });
      return response.json();
    },
    onMutate: () => {
      setGenerationProgress(0);
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
    },
    onSuccess: (data) => {
      setGenerationProgress(100);
      if (data.tasks && data.tasks.length > 0) {
        onTasksUpdate([...selectedTasks, ...data.tasks]);
        toast({
          title: "Tasks Generated",
          description: `Generated ${data.tasks.length} tasks with AI`,
        });
        setAiDescription("");
      }
    },
    onError: () => {
      setGenerationProgress(0);
      toast({
        title: "Generation Failed",
        description: "Failed to generate tasks. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addTaskFromSearch = (task: any) => {
    const newTask: Task = {
      id: task.id,
      activity: task.activity,
      category: task.category,
      priority: task.priority || 'medium',
      riskLevel: task.riskLevel,
      hazards: task.hazards,
      controlMeasures: task.controlMeasures
    };
    onTasksUpdate([...selectedTasks, newTask]);
  };

  const addCustomTask = () => {
    if (!customTask.activity.trim()) return;
    
    const newTask: Task = {
      activity: customTask.activity,
      category: customTask.category || tradeType,
      priority: customTask.priority
    };
    
    onTasksUpdate([...selectedTasks, newTask]);
    setCustomTask({ activity: "", category: "", priority: "medium" });
  };

  const removeTask = (index: number) => {
    const updated = selectedTasks.filter((_, i) => i !== index);
    onTasksUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${activeMethod === 'search' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'}`}
          onClick={() => setActiveMethod('search')}
        >
          <CardContent className="p-4 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Search Database</h3>
            <p className="text-sm text-muted-foreground">Find existing tasks</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${activeMethod === 'ai' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'}`}
          onClick={() => setActiveMethod('ai')}
        >
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold">AI Auto-Generate</h3>
            <p className="text-sm text-muted-foreground">AI creates tasks for you</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${activeMethod === 'manual' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'}`}
          onClick={() => setActiveMethod('manual')}
        >
          <CardContent className="p-4 text-center">
            <Edit className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Manual Entry</h3>
            <p className="text-sm text-muted-foreground">Write your own tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Method Content */}
      {activeMethod === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle>Search Task Database</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Search for tasks</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., electrical installation, concrete pouring..."
              />
            </div>
            
            {isSearching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
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
          </CardContent>
        </Card>
      )}

      {activeMethod === 'ai' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Task Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Describe your work</Label>
              <Textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="e.g., Install new electrical panels in basement, run conduit to upper floors..."
                rows={4}
              />
            </div>
            
            {generationProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generating tasks...</span>
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
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Tasks
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeMethod === 'manual' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Custom Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Task Description</Label>
                <Input
                  value={customTask.activity}
                  onChange={(e) => setCustomTask({ ...customTask, activity: e.target.value })}
                  placeholder="Enter your custom task description"
                />
              </div>
              
              <Button onClick={addCustomTask} disabled={!customTask.activity.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </CardContent>
          </Card>

          {/* Risk Assessment Matrix - Only for Manual Entry */}
          {onRiskAssessmentsUpdate && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Matrix</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add detailed risk assessments for your custom tasks
                </p>
              </CardHeader>
              <CardContent>
                <SimplifiedTableEditor 
                  riskAssessments={riskAssessments}
                  onUpdate={onRiskAssessmentsUpdate}
                  tradeType={tradeType}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Selected Tasks */}
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
    </div>
  );
}