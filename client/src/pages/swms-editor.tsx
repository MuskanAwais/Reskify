import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { 
  ArrowLeft, 
  Save, 
  FileDown, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Shield,
  Wrench,
  Phone,
  Eye,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SwmsActivity {
  activity: string;
  hazards: string[];
  likelihood: number;
  consequence: number;
  initialRiskScore: number;
  controlMeasures: string[];
  residualLikelihood: number;
  residualConsequence: number;
  residualRiskScore: number;
  riskLevel: string;
  ppe: string[];
  responsible: string;
}

interface PlantEquipment {
  item: string;
  riskLevel: string;
  controlMeasures: string[];
}

interface EmergencyProcedures {
  evacuation: string;
  firstAid: string;
  emergencyContacts: string;
}

export default function SwmsEditor() {
  const [, params] = useRoute("/swms-editor/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const swmsId = params?.id;
  
  const [activities, setActivities] = useState<SwmsActivity[]>([]);
  const [plantEquipment, setPlantEquipment] = useState<PlantEquipment[]>([]);
  const [emergencyProcedures, setEmergencyProcedures] = useState<EmergencyProcedures>({
    evacuation: "",
    firstAid: "",
    emergencyContacts: ""
  });
  
  // Load SWMS data for editing
  const { data: swmsData, isLoading } = useQuery({
    queryKey: [`/api/swms/draft/${swmsId}`],
    enabled: !!swmsId,
  });

  const [projectInfo, setProjectInfo] = useState({
    title: "",
    projectNumber: "",
    projectAddress: "",
    principalContractor: "",
    tradeType: ""
  });

  useEffect(() => {
    if (swmsData && typeof swmsData === 'object') {
      setProjectInfo({
        title: swmsData.title || swmsData.jobName || "",
        projectNumber: swmsData.jobNumber || "",
        projectAddress: swmsData.projectAddress || swmsData.projectLocation || "",
        principalContractor: swmsData.principalContractor || "",
        tradeType: swmsData.tradeType || ""
      });
      
      if (swmsData.activities) {
        setActivities(swmsData.activities);
      }
      
      if (swmsData.plantEquipment) {
        setPlantEquipment(swmsData.plantEquipment);
      }
      
      if (swmsData.emergencyProcedures) {
        setEmergencyProcedures(swmsData.emergencyProcedures);
      }
    }
  }, [swmsData]);

  const saveSwmsMutation = useMutation({
    mutationFn: async () => {
      const updatedData = {
        ...swmsData,
        swmsData: {
          activities,
          plantEquipment,
          emergencyProcedures
        }
      };
      
      return apiRequest("PUT", `/api/swms/draft/${swmsId}`, updatedData);
    },
    onSuccess: () => {
      toast({
        title: "SWMS Saved",
        description: "Your changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swms/my-documents"] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save SWMS. Please try again.",
        variant: "destructive"
      });
    }
  });

  const generatePdfMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/swms/pdf-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: projectInfo.title,
          projectNumber: projectInfo.projectNumber,
          projectAddress: projectInfo.projectAddress,
          companyName: projectInfo.principalContractor,
          principalContractor: projectInfo.principalContractor,
          swmsData: {
            activities,
            plantEquipment,
            emergencyProcedures
          },
          formData: {
            jobName: projectInfo.title,
            jobNumber: projectInfo.projectNumber,
            projectLocation: projectInfo.projectAddress,
            principalContractor: projectInfo.principalContractor
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_swms.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "PDF Generated",
        description: "Your SWMS PDF has been downloaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  });

  const addActivity = () => {
    setActivities([...activities, {
      activity: "",
      hazards: [],
      likelihood: 1,
      consequence: 1,
      initialRiskScore: 1,
      controlMeasures: [],
      residualLikelihood: 1,
      residualConsequence: 1,
      residualRiskScore: 1,
      riskLevel: "Low",
      ppe: [],
      responsible: ""
    }]);
  };

  const updateActivity = (index: number, field: keyof SwmsActivity, value: any) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate risk scores
    if (field === 'likelihood' || field === 'consequence') {
      updated[index].initialRiskScore = updated[index].likelihood * updated[index].consequence;
    }
    if (field === 'residualLikelihood' || field === 'residualConsequence') {
      updated[index].residualRiskScore = updated[index].residualLikelihood * updated[index].residualConsequence;
      
      // Auto-update risk level
      const score = updated[index].residualRiskScore;
      if (score <= 4) updated[index].riskLevel = "Low";
      else if (score <= 9) updated[index].riskLevel = "Medium";
      else if (score <= 16) updated[index].riskLevel = "High";
      else updated[index].riskLevel = "Extreme";
    }
    
    setActivities(updated);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const addPlantEquipment = () => {
    setPlantEquipment([...plantEquipment, {
      item: "",
      riskLevel: "Low",
      controlMeasures: []
    }]);
  };

  const updatePlantEquipment = (index: number, field: keyof PlantEquipment, value: any) => {
    const updated = [...plantEquipment];
    updated[index] = { ...updated[index], [field]: value };
    setPlantEquipment(updated);
  };

  const removePlantEquipment = (index: number) => {
    setPlantEquipment(plantEquipment.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SWMS for editing...</p>
        </div>
      </div>
    );
  }

  const getRiskBadge = (level: string) => {
    const colors = {
      Low: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800", 
      High: "bg-orange-100 text-orange-800",
      Extreme: "bg-red-100 text-red-800"
    };
    return <Badge className={colors[level as keyof typeof colors] || colors.Low}>{level}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/my-swms")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My SWMS
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit SWMS</h1>
            <p className="text-gray-600">{projectInfo.title}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => saveSwmsMutation.mutate()}
            disabled={saveSwmsMutation.isPending}
            className="bg-primary/600 hover:bg-primary/700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button
            onClick={() => generatePdfMutation.mutate()}
            disabled={generatePdfMutation.isPending}
            variant="outline"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Project Info (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2 text-gray-500" />
            Project Information (Protected)
          </CardTitle>
          <p className="text-sm text-gray-600">
            Project details are locked to prevent changes after payment. Contact support for modifications.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Project Name</label>
              <div className="mt-1 p-3 bg-gray-50 border rounded-md text-gray-900">
                {projectInfo.title}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Job Number</label>
              <div className="mt-1 p-3 bg-gray-50 border rounded-md text-gray-900">
                {projectInfo.projectNumber || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Project Address</label>
              <div className="mt-1 p-3 bg-gray-50 border rounded-md text-gray-900">
                {projectInfo.projectAddress}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Principal Contractor</label>
              <div className="mt-1 p-3 bg-gray-50 border rounded-md text-gray-900">
                {projectInfo.principalContractor}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Content */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Work Activities & Risks
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center">
            <Wrench className="h-4 w-4 mr-2" />
            Plant & Equipment
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            Emergency Procedures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Work Activities & Risk Assessment</h3>
            <Button onClick={addActivity} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </div>
          
          {activities.map((activity, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Activity {index + 1}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeActivity(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Activity Description</label>
                  <Input
                    value={activity.activity}
                    onChange={(e) => updateActivity(index, 'activity', e.target.value)}
                    placeholder="Describe the work activity..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Hazards</label>
                    <Textarea
                      value={activity.hazards.join(', ')}
                      onChange={(e) => updateActivity(index, 'hazards', e.target.value.split(', ').filter(h => h.trim()))}
                      placeholder="List hazards separated by commas..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Control Measures</label>
                    <Textarea
                      value={activity.controlMeasures.join(', ')}
                      onChange={(e) => updateActivity(index, 'controlMeasures', e.target.value.split(', ').filter(c => c.trim()))}
                      placeholder="List control measures separated by commas..."
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Initial Likelihood (1-5)</label>
                    <Select value={activity.likelihood.toString()} onValueChange={(v) => updateActivity(index, 'likelihood', parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Initial Consequence (1-5)</label>
                    <Select value={activity.consequence.toString()} onValueChange={(v) => updateActivity(index, 'consequence', parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Residual Likelihood</label>
                    <Select value={activity.residualLikelihood.toString()} onValueChange={(v) => updateActivity(index, 'residualLikelihood', parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Residual Consequence</label>
                    <Select value={activity.residualConsequence.toString()} onValueChange={(v) => updateActivity(index, 'residualConsequence', parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-sm font-medium">Risk Level: </span>
                    {getRiskBadge(activity.riskLevel)}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Risk Score: </span>
                    <Badge variant="outline">{activity.residualRiskScore}</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">PPE Required</label>
                    <Textarea
                      value={activity.ppe.join(', ')}
                      onChange={(e) => updateActivity(index, 'ppe', e.target.value.split(', ').filter(p => p.trim()))}
                      placeholder="List PPE separated by commas..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Responsible Person</label>
                    <Input
                      value={activity.responsible}
                      onChange={(e) => updateActivity(index, 'responsible', e.target.value)}
                      placeholder="Who is responsible for this activity?"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Plant & Equipment</h3>
            <Button onClick={addPlantEquipment} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
          
          {plantEquipment.map((equipment, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-base font-medium">Equipment {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePlantEquipment(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Equipment/Tool Name</label>
                    <Input
                      value={equipment.item}
                      onChange={(e) => updatePlantEquipment(index, 'item', e.target.value)}
                      placeholder="e.g., Tower Crane, Excavator..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Risk Level</label>
                    <Select value={equipment.riskLevel} onValueChange={(v) => updatePlantEquipment(index, 'riskLevel', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="text-sm font-medium">Control Measures</label>
                  <Textarea
                    value={equipment.controlMeasures.join(', ')}
                    onChange={(e) => updatePlantEquipment(index, 'controlMeasures', e.target.value.split(', ').filter(c => c.trim()))}
                    placeholder="List control measures separated by commas..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <h3 className="text-lg font-semibold">Emergency Procedures</h3>
          
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Evacuation Procedures</label>
                <Textarea
                  value={emergencyProcedures.evacuation}
                  onChange={(e) => setEmergencyProcedures({...emergencyProcedures, evacuation: e.target.value})}
                  placeholder="Describe evacuation procedures and assembly points..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">First Aid Procedures</label>
                <Textarea
                  value={emergencyProcedures.firstAid}
                  onChange={(e) => setEmergencyProcedures({...emergencyProcedures, firstAid: e.target.value})}
                  placeholder="Describe first aid procedures and locations..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Emergency Contacts</label>
                <Textarea
                  value={emergencyProcedures.emergencyContacts}
                  onChange={(e) => setEmergencyProcedures({...emergencyProcedures, emergencyContacts: e.target.value})}
                  placeholder="List emergency contacts, phone numbers, and services..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}