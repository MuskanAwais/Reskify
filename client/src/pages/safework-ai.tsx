import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Bot, 
  Shield, 
  FileText, 
  AlertTriangle, 
  Zap, 
  Brain, 
  Target,
  CheckCircle,
  Loader2,
  Sparkles,
  Database,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';

interface AIGenerationInput {
  title: string;
  jobName: string;
  tradeType: string;
  projectLocation: string;
  activities: string[];
  projectDetails?: {
    projectType?: string;
    duration?: string;
    complexity?: string;
  };
}

export default function SafeworkAI() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AIGenerationInput>({
    title: '',
    jobName: '',
    tradeType: '',
    projectLocation: '',
    activities: [],
    projectDetails: {}
  });
  const [currentActivity, setCurrentActivity] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSwms, setGeneratedSwms] = useState<any>(null);

  const generateSwmsMutation = useMutation({
    mutationFn: async (data: AIGenerationInput) => {
      setGenerationProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await apiRequest('POST', '/api/generate-swms', data);
      const result = await response.json();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      return result;
    },
    onSuccess: (data) => {
      setGeneratedSwms(data);
      toast({
        title: "SWMS Generated Successfully",
        description: "Your AI-powered SWMS has been created with comprehensive risk assessments.",
      });
    },
    onError: (error) => {
      setGenerationProgress(0);
      toast({
        title: "Generation Failed",
        description: "Failed to generate SWMS. Please check your inputs and try again.",
        variant: "destructive",
      });
    }
  });

  const enhanceSwmsMutation = useMutation({
    mutationFn: async (swmsData: any) => {
      return await apiRequest('POST', '/api/enhance-swms-ai', {
        tradeType: formData.tradeType,
        activities: formData.activities,
        projectDetails: formData.projectDetails,
        existingSwms: swmsData
      });
    },
    onSuccess: () => {
      toast({
        title: "SWMS Enhanced",
        description: "AI has enhanced your SWMS with additional safety measures and compliance checks.",
      });
    }
  });

  const addActivity = () => {
    if (currentActivity.trim()) {
      setFormData(prev => ({
        ...prev,
        activities: [...prev.activities, currentActivity.trim()]
      }));
      setCurrentActivity('');
    }
  };

  const removeActivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  const handleGenerate = () => {
    if (!formData.title || !formData.jobName || !formData.tradeType || formData.activities.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and add at least one activity.",
        variant: "destructive",
      });
      return;
    }
    generateSwmsMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SAFEWORK AI
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI-powered SWMS generation with comprehensive risk assessment and Australian compliance
          </p>
        </div>

        {/* AI Capabilities Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
              AI Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-sm">Risk Analysis</p>
                  <p className="text-xs text-gray-600">AI-powered hazard identification</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <FileText className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">Compliance Check</p>
                  <p className="text-xs text-gray-600">Australian standards validation</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="font-semibold text-sm">Control Measures</p>
                  <p className="text-xs text-gray-600">Automated safety controls</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <Brain className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-semibold text-sm">Smart Generation</p>
                  <p className="text-xs text-gray-600">Context-aware SWMS creation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">AI Generation</TabsTrigger>
            <TabsTrigger value="enhance">AI Enhancement</TabsTrigger>
            <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobName">Job Name *</Label>
                    <Input
                      id="jobName"
                      value={formData.jobName}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobName: e.target.value }))}
                      placeholder="Enter job name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tradeType">Trade Type *</Label>
                    <Select
                      value={formData.tradeType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tradeType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trade type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General Construction</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="HVAC">HVAC</SelectItem>
                        <SelectItem value="Carpentry">Carpentry</SelectItem>
                        <SelectItem value="Roofing">Roofing</SelectItem>
                        <SelectItem value="Demolition">Demolition</SelectItem>
                        <SelectItem value="Excavation">Excavation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Project Location</Label>
                    <Input
                      id="location"
                      value={formData.projectLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectLocation: e.target.value }))}
                      placeholder="Project address or location"
                    />
                  </div>

                  <div>
                    <Label htmlFor="activity">Work Activities *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="activity"
                        value={currentActivity}
                        onChange={(e) => setCurrentActivity(e.target.value)}
                        placeholder="Add work activity"
                        onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                      />
                      <Button onClick={addActivity} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.activities.map((activity, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeActivity(index)}
                        >
                          {activity} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generateSwmsMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {generateSwmsMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating AI SWMS...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate AI SWMS
                      </>
                    )}
                  </Button>

                  {generateSwmsMutation.isPending && (
                    <div className="space-y-2">
                      <Progress value={generationProgress} className="w-full" />
                      <p className="text-sm text-center text-gray-600">
                        AI analyzing project requirements and generating comprehensive SWMS...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Output */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Generated SWMS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedSwms ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-semibold text-green-800">SWMS Generated Successfully</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          AI has created a comprehensive SWMS with risk assessments and safety measures.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Risk Assessments:</span>
                          <span className="ml-2">{generatedSwms?.riskAssessments?.length || 0}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Safety Measures:</span>
                          <span className="ml-2">{generatedSwms?.safetyMeasures?.length || 0}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Compliance Codes:</span>
                          <span className="ml-2">{generatedSwms?.complianceCodes?.length || 0}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Emergency Procedures:</span>
                          <span className="ml-2">{generatedSwms?.emergencyProcedures?.length || 0}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => enhanceSwmsMutation.mutate(generatedSwms)}
                          disabled={enhanceSwmsMutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          Enhance with AI
                        </Button>
                        <Button size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Open in Editor
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Fill in the project details and click "Generate AI SWMS" to create a comprehensive safety document.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="enhance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  AI Enhancement Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold">Risk Enhancement</h3>
                    <p className="text-sm text-gray-600">AI identifies additional risks and improved control measures</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-semibold">Compliance Check</h3>
                    <p className="text-sm text-gray-600">Automated validation against Australian safety standards</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
                    <h3 className="font-semibold">Safety Optimization</h3>
                    <p className="text-sm text-gray-600">AI suggests optimized safety procedures and equipment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  AI Safety Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">25,000+</p>
                    <p className="text-sm text-gray-600">Safety Data Points</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">1,500+</p>
                    <p className="text-sm text-gray-600">SWMS Generated</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">98.5%</p>
                    <p className="text-sm text-gray-600">Compliance Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm text-gray-600">AI Processing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}