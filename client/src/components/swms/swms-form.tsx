import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Briefcase, 
  CheckSquare, 
  AlertTriangle, 
  Shield, 
  FileText,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  Wrench,
  Eye,
  Download,
  Save,
  CheckCircle
} from "lucide-react";
import { SimplifiedTableEditor } from "./simplified-table-editor";
import { translate } from "@/lib/language-direct";
import SmartTooltip from "@/components/ui/smart-tooltip";
import QuickActionTooltip, { presetTooltips } from "@/components/ui/quick-action-tooltip";
import { ComprehensiveProjectDetails } from "./comprehensive-project-details";
import { PlantEquipmentManager } from "./plant-equipment-manager";
import { ReviewMonitoringManager } from "./review-monitoring-manager";

interface SwmsFormProps {
  step: number;
  data: any;
  onDataChange: (data: any) => void;
  onNext?: () => void;
}

export default function SwmsForm({ step, data, onDataChange, onNext }: SwmsFormProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState(data);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set(data.activities || []));
  const [selectedComplianceCodes, setSelectedComplianceCodes] = useState<Set<string>>(new Set(data.complianceCodes || []));

  const updateFormData = (updates: any) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  // CSV parsing function for hazards and control measures
  const parseCSVData = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const parsedData = [];
    
    for (const line of lines) {
      const parts = line.split(';').map(part => part.trim());
      if (parts.length >= 2) {
        parsedData.push({
          id: Date.now() + Math.random(),
          hazard: parts[0] || '',
          controlMeasure: parts[1] || '',
          riskLevel: parts[2] || 'Medium'
        });
      }
    }
    
    return parsedData;
  };

  // Handle CSV file upload
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsedRisks = parseCSVData(csvText);
      
      updateFormData({
        riskAssessments: [...(formData.riskAssessments || []), ...parsedRisks]
      });
      
      toast({
        title: "CSV Data Imported",
        description: `Added ${parsedRisks.length} risk assessments from CSV file`,
      });
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Load trades data
  const { data: trades } = useQuery({
    queryKey: ["/api/trades"],
    enabled: step === 1
  });

  // Load safety library data for compliance codes
  const { data: safetyLibrary } = useQuery({
    queryKey: ["/api/safety-library"],
    enabled: step === 5
  });

  // Load subscription data for feature access
  const { data: subscription } = useQuery({
    queryKey: ["/api/user/subscription"]
  });

  const isProUser = subscription?.plan === "pro" || subscription?.plan === "enterprise";
  const isEnterpriseUser = subscription?.plan === "enterprise";

  useEffect(() => {
    if (onDataChange) {
      const newData = { ...formData, activities: Array.from(selectedActivities) };
      setFormData(newData);
      onDataChange(newData);
    }
  }, [selectedActivities]);

  useEffect(() => {
    if (onDataChange) {
      const newData = { ...formData, complianceCodes: Array.from(selectedComplianceCodes) };
      setFormData(newData);
      onDataChange(newData);
    }
  }, [selectedComplianceCodes]);

  const handleActivityToggle = (activityName: string) => {
    setSelectedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityName)) {
        newSet.delete(activityName);
      } else {
        newSet.add(activityName);
      }
      
      // Update form data with selected activities array
      const activitiesArray = Array.from(newSet);
      updateFormData({ activities: activitiesArray });
      
      return newSet;
    });
  };

  const getActivitiesForTrade = (tradeName: string) => {
    const trade = (Array.isArray(trades) ? trades : []).find((t: any) => t.name === tradeName);
    if (!trade?.categories) return [];
    
    // Flatten all activities from all categories
    const allActivities: any[] = [];
    trade.categories.forEach((category: any) => {
      if (category.activities) {
        category.activities.forEach((activity: string) => {
          allActivities.push({
            name: activity,
            category: category.name
          });
        });
      }
    });
    
    return allActivities;
  };

  const allActivities = formData.tradeType ? getActivitiesForTrade(formData.tradeType) : [];
  const filteredActivities = allActivities.filter((activity: any) =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activitiesByCategory = filteredActivities.reduce((acc: any, activity: any) => {
    const category = activity.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {});

  const categories = Object.keys(activitiesByCategory).sort((a, b) => a.localeCompare(b));

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const selectAllInCategory = (category: string) => {
    const activitiesInCategory = activitiesByCategory[category].map((a: any) => a.name);
    setSelectedActivities((prev) => {
      const newSet = new Set(prev);
      activitiesInCategory.forEach((activity: string) => newSet.add(activity));
      
      // Update form data with selected activities array
      const activitiesArray = Array.from(newSet);
      updateFormData({ activities: activitiesArray });
      
      return newSet;
    });
  };

  const deselectAllInCategory = (category: string) => {
    const activitiesInCategory = activitiesByCategory[category].map((a: any) => a.name);
    setSelectedActivities((prev) => {
      const newSet = new Set(prev);
      activitiesInCategory.forEach((activity: string) => newSet.delete(activity));
      
      // Update form data with selected activities array
      const activitiesArray = Array.from(newSet);
      updateFormData({ activities: activitiesArray });
      
      return newSet;
    });
  };

  const enhanceDataWithAI = async (currentData: any) => {
    try {
      const response = await fetch('/api/ai/enhance-swms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities: currentData.activities,
          tradeType: currentData.tradeType,
          projectLocation: currentData.projectLocation
        })
      });
      
      if (response.ok) {
        const aiData = await response.json();
        return {
          ...currentData,
          riskAssessments: aiData.riskAssessments,
          safetyMeasures: aiData.safetyMeasures,
          complianceCodes: [...(currentData.complianceCodes || []), ...aiData.complianceRecommendations]
        };
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
    }
    return currentData;
  };

  switch (step) {
    case 1:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">{translate("projectDetails")}</h3>
            <p className="text-gray-600 text-sm">
              {translate("projectDetailsDesc")}
            </p>
          </div>

          <ComprehensiveProjectDetails 
            formData={formData}
            onDataChange={updateFormData}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{translate("tradeSelection")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.tradeType || ""} onValueChange={(value) => updateFormData({ tradeType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={translate("selectTrade")} />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(trades) ? trades : []).map((trade: any) => (
                    <SelectItem key={trade.name} value={trade.name}>
                      {trade.name} ({trade.totalTasks} {translate("activities")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {formData.tradeType && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{translate("activitySelection")}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={translate("searchActivities")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {selectedActivities.size} {translate("selected")}
                  </Badge>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {categories.map((category) => {
                    const isCollapsed = collapsedCategories.has(category);
                    const activitiesInCategory = activitiesByCategory[category];
                    const selectedInCategory = activitiesInCategory.filter((a: any) => selectedActivities.has(a.name)).length;
                    
                    return (
                      <div key={category} className="border border-gray-200 rounded-lg">
                        <div 
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleCategory(category)}
                        >
                          <div className="flex items-center space-x-2">
                            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            <span className="font-medium">{category}</span>
                            <Badge variant="outline" className="text-xs">
                              {selectedInCategory}/{activitiesInCategory.length}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectAllInCategory(category);
                              }}
                              className="text-xs"
                            >
                              {translate("selectAll")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deselectAllInCategory(category);
                              }}
                              className="text-xs"
                            >
                              {translate("deselectAll")}
                            </Button>
                          </div>
                        </div>
                        
                        {!isCollapsed && (
                          <div className="px-3 pb-3 space-y-2">
                            {activitiesInCategory.map((activity: any) => (
                              <div key={activity.name} className="flex items-center space-x-2">
                                <Checkbox
                                  id={activity.name}
                                  checked={selectedActivities.has(activity.name)}
                                  onCheckedChange={() => handleActivityToggle(activity.name)}
                                />
                                <Label htmlFor={activity.name} className="text-sm cursor-pointer flex-1">
                                  {activity.name}
                                </Label>
                                <Badge variant="outline" className="text-xs">
                                  {activity.riskLevel}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
            <p className="text-gray-600 text-sm">
              Identify and assess potential hazards for your work activities
            </p>
          </div>

          {/* Risk Assessment Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-primary" />
                  Risk Assessment Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Qualitative vs Quantitative Scale */}
                  <div className="grid grid-cols-4 gap-1 text-xs border border-gray-300">
                    <div className="p-2 bg-cyan-100 font-medium text-center border-r">Qualitative Scale</div>
                    <div className="p-2 bg-cyan-100 font-medium text-center border-r">Quantitative Scale</div>
                    <div className="p-2 bg-green-200 font-medium text-center border-r">Magnitude Scale</div>
                    <div className="p-2 bg-green-300 font-medium text-center">Probability Scale</div>
                    
                    <div className="p-2 bg-cyan-50 text-center border-r">Extreme</div>
                    <div className="p-2 bg-cyan-50 text-center border-r">$50,000+</div>
                    <div className="p-2 bg-green-100 text-center border-r">Likely</div>
                    <div className="p-2 bg-green-200 text-center">Good chance</div>
                    
                    <div className="p-2 bg-cyan-50 text-center border-r">Fatality, significant disability, catastrophic property damage</div>
                    <div className="p-2 bg-green-100 text-center border-r">Monthly in the industry</div>
                    <div className="p-2 bg-green-200 text-center">High</div>
                    
                    <div className="p-2 bg-cyan-50 text-center border-r">High</div>
                    <div className="p-2 bg-cyan-50 text-center border-r">$15,000 - $50,000</div>
                    <div className="p-2 bg-green-100 text-center border-r">Possible</div>
                    <div className="p-2 bg-green-200 text-center">Even chance</div>
                    
                    <div className="p-2 bg-cyan-50 text-center border-r">Minor amputation, minor permanent disability, moderate property damage</div>
                    <div className="p-2 bg-green-100 text-center border-r">Yearly in the industry</div>
                    <div className="p-2 bg-green-200 text-center">Medium</div>
                    
                    <div className="p-2 bg-cyan-50 text-center border-r">Medium</div>
                    <div className="p-2 bg-cyan-50 text-center border-r">$1,000 - $15,000</div>
                    <div className="p-2 bg-green-100 text-center border-r">Unlikely</div>
                    <div className="p-2 bg-green-200 text-center">Low chance</div>
                    
                    <div className="p-2 bg-cyan-50 text-center border-r">Minor injury resulting in Lost Time injury or Medically Treated injury</div>
                    <div className="p-2 bg-green-100 text-center border-r">Every 10 years in the industry</div>
                    <div className="p-2 bg-green-200 text-center">Low</div>
                    
                    <div className="p-2 bg-cyan-50 text-center border-r">Low</div>
                    <div className="p-2 bg-cyan-50 text-center border-r">$0 - $1,000</div>
                    <div className="p-2 bg-green-100 text-center border-r">Very Rarely</div>
                    <div className="p-2 bg-green-200 text-center">Practically no chance</div>
                    
                    <div className="p-2 bg-cyan-50 text-center border-r">First Aid Treatment, with no lost time</div>
                    <div className="p-2 bg-green-100 text-center border-r">Once in a lifetime in the industry</div>
                    <div className="p-2 bg-green-200 text-center"></div>
                  </div>

                  {/* Risk Score Matrix */}
                  <div className="grid grid-cols-4 gap-1 text-xs border border-gray-300 mt-4">
                    <div className="p-2 bg-gray-100 font-medium text-center border-r">Likely</div>
                    <div className="p-2 bg-gray-100 font-medium text-center border-r">Possible</div>
                    <div className="p-2 bg-gray-100 font-medium text-center border-r">Unlikely</div>
                    <div className="p-2 bg-gray-100 font-medium text-center">Very Rare</div>
                    
                    <div className="p-2 bg-red-500 text-white font-bold text-center border-r">16</div>
                    <div className="p-2 bg-orange-400 text-white font-bold text-center border-r">14</div>
                    <div className="p-2 bg-yellow-400 font-bold text-center border-r">11</div>
                    <div className="p-2 bg-yellow-400 font-bold text-center">7</div>
                    
                    <div className="p-2 bg-orange-400 text-white font-bold text-center border-r">15</div>
                    <div className="p-2 bg-yellow-400 font-bold text-center border-r">12</div>
                    <div className="p-2 bg-green-400 text-white font-bold text-center border-r">8</div>
                    <div className="p-2 bg-green-400 text-white font-bold text-center">5</div>
                    
                    <div className="p-2 bg-yellow-400 font-bold text-center border-r">13</div>
                    <div className="p-2 bg-green-400 text-white font-bold text-center border-r">9</div>
                    <div className="p-2 bg-green-400 text-white font-bold text-center border-r">6</div>
                    <div className="p-2 bg-green-400 text-white font-bold text-center">3</div>
                    
                    <div className="p-2 bg-green-400 text-white font-bold text-center border-r">10</div>
                    <div className="p-2 bg-green-400 text-white font-bold text-center border-r">7</div>
                    <div className="p-2 bg-green-400 text-white font-bold text-center border-r">4</div>
                    <div className="p-2 bg-green-400 text-white font-bold text-center">2</div>
                  </div>

                  {/* Action Required Legend */}
                  <div className="grid grid-cols-4 gap-1 text-xs border border-gray-300 mt-4">
                    <div className="p-2 bg-gray-100 font-medium text-center border-r">Score</div>
                    <div className="p-2 bg-gray-100 font-medium text-center border-r">Ranking</div>
                    <div className="p-2 bg-gray-100 font-medium text-center border-r">Action</div>
                    <div className="p-2 bg-gray-100 font-medium text-center">Timeline</div>
                    
                    <div className="p-2 bg-red-500 text-white font-bold text-center border-r">14 - 16</div>
                    <div className="p-2 bg-red-500 text-white font-bold text-center border-r">Severe (5)</div>
                    <div className="p-2 bg-red-500 text-white text-xs text-center border-r">Action required</div>
                    <div className="p-2 bg-red-500 text-white text-xs text-center">Immediately</div>
                    
                    <div className="p-2 bg-orange-400 text-white font-bold text-center border-r">11 - 13</div>
                    <div className="p-2 bg-orange-400 text-white font-bold text-center border-r">High (4)</div>
                    <div className="p-2 bg-orange-400 text-white text-xs text-center border-r">Action within</div>
                    <div className="p-2 bg-orange-400 text-white text-xs text-center">24 hrs</div>
                    
                    <div className="p-2 bg-yellow-400 font-bold text-center border-r">7 - 10</div>
                    <div className="p-2 bg-yellow-400 font-bold text-center border-r">Medium (3)</div>
                    <div className="p-2 bg-yellow-400 text-xs text-center border-r">Action within</div>
                    <div className="p-2 bg-yellow-400 text-xs text-center">14 days</div>
                    
                    <div className="p-2 bg-green-400 text-white font-bold text-center border-r">3 - 6</div>
                    <div className="p-2 bg-green-400 text-white font-bold text-center border-r">Low (1-2)</div>
                    <div className="p-2 bg-green-400 text-white text-xs text-center border-r">Action within</div>
                    <div className="p-2 bg-green-400 text-white text-xs text-center">Business cycle</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-primary" />
                  Safety Control Hierarchy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded">
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">1</div>
                    <div>
                      <div className="font-medium text-red-800">Eliminate</div>
                      <div className="text-red-600">Remove the hazard completely</div>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-orange-50 border border-orange-200 rounded">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">2</div>
                    <div>
                      <div className="font-medium text-orange-800">Substitute</div>
                      <div className="text-orange-600">Replace with safer alternative</div>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">3</div>
                    <div>
                      <div className="font-medium text-yellow-800">Engineering</div>
                      <div className="text-yellow-600">Physical barriers & controls</div>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">4</div>
                    <div>
                      <div className="font-medium text-blue-800">Administrative</div>
                      <div className="text-blue-600">Procedures & training</div>
                    </div>
                  </div>
                  <div className="flex items-center p-2 bg-purple-50 border border-purple-200 rounded">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">5</div>
                    <div>
                      <div className="font-medium text-purple-800">PPE</div>
                      <div className="text-purple-600">Personal protective equipment</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Activities Summary */}
          {formData.activities && formData.activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected Activities</CardTitle>
                <p className="text-sm text-gray-600">
                  Activities selected from {formData.tradeType} that require risk assessment
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {formData.activities.map((activity: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <span className="text-sm font-medium">{activity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newRisk = {
                            id: `activity-${Date.now()}-${index}`,
                            activity: activity,
                            description: `Risk assessment for ${activity}`,
                            hazards: ['Identify specific hazards'],
                            initialRiskScore: 4,
                            riskLevel: 'Medium',
                            controlMeasures: ['Add control measures'],
                            legislation: ['Work Health and Safety Act'],
                            residualRiskScore: 2,
                            residualRiskLevel: 'Low',
                            responsible: 'Site Supervisor',
                            ppe: [],
                            trainingRequired: [],
                            permitRequired: [],
                            inspectionFrequency: 'Daily',
                            emergencyProcedures: [],
                            environmentalControls: []
                          };
                          updateFormData({ 
                            riskAssessments: [...(formData.riskAssessments || []), newRisk] 
                          });
                        }}
                        className="text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Risk Assessment
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual Risk Assessment Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manual Risk Assessment</CardTitle>
              <p className="text-sm text-gray-600">
                Add and edit risk assessments manually. Use AI Generator from sidebar for automated suggestions.
              </p>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newRisk = {
                    id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    activity: formData.activities[0] || 'General Activity',
                    description: '',
                    hazards: [''],
                    initialRiskScore: 4,
                    riskLevel: 'Medium',
                    controlMeasures: [''],
                    legislation: ['Work Health and Safety Act'],
                    residualRiskScore: 2,
                    residualRiskLevel: 'Low',
                    responsible: 'Site Supervisor',
                    ppe: [],
                    trainingRequired: [],
                    permitRequired: [],
                    inspectionFrequency: 'Daily',
                    emergencyProcedures: [],
                    environmentalControls: []
                  };
                  updateFormData({ 
                    riskAssessments: [...(formData.riskAssessments || []), newRisk] 
                  });
                }}
                className="mb-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Risk Assessment
              </Button>
            </CardContent>
          </Card>

          {/* Risk Assessment Display */}
          {formData.riskAssessments && formData.riskAssessments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Assessment Table</CardTitle>
                <p className="text-sm text-gray-600">
                  Review and customize risk assessments. Click on any cell to edit directly.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.riskAssessments.map((risk: any, index: number) => (
                    <div key={risk.id || index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{risk.activity}</h4>
                            <Badge
                              variant={
                                risk.riskLevel === 'extreme' ? 'destructive' :
                                risk.riskLevel === 'high' ? 'destructive' :
                                risk.riskLevel === 'medium' ? 'default' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {risk.riskLevel?.toUpperCase() || 'UNASSESSED'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Responsible:</strong> {risk.responsible || risk.responsiblePerson || 'Site Supervisor'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedRisks = formData.riskAssessments.filter((_: any, i: number) => i !== index);
                            updateFormData({ riskAssessments: updatedRisks });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-700">Hazards</Label>
                          <div className="space-y-2">
                            {Array.isArray(risk.hazards) ? 
                              risk.hazards.map((hazard: string, hazardIndex: number) => (
                                <div key={hazardIndex} className="flex items-center gap-2">
                                  <textarea
                                    value={hazard}
                                    onChange={(e) => {
                                      const updatedRisks = [...formData.riskAssessments];
                                      updatedRisks[index].hazards[hazardIndex] = e.target.value;
                                      updateFormData({ riskAssessments: updatedRisks });
                                    }}
                                    className="flex-1 min-h-[60px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                    placeholder="Describe the hazard..."
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updatedRisks = [...formData.riskAssessments];
                                      updatedRisks[index].hazards = updatedRisks[index].hazards.filter((_: any, i: number) => i !== hazardIndex);
                                      updateFormData({ riskAssessments: updatedRisks });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )) :
                              <textarea
                                value={risk.hazards || ''}
                                onChange={(e) => {
                                  const updatedRisks = [...formData.riskAssessments];
                                  updatedRisks[index].hazards = e.target.value;
                                  updateFormData({ riskAssessments: updatedRisks });
                                }}
                                className="w-full min-h-[60px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                placeholder="Describe the hazards..."
                              />
                            }
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedRisks = [...formData.riskAssessments];
                                if (!Array.isArray(updatedRisks[index].hazards)) {
                                  updatedRisks[index].hazards = [updatedRisks[index].hazards || ''];
                                }
                                updatedRisks[index].hazards.push('');
                                updateFormData({ riskAssessments: updatedRisks });
                              }}
                              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Hazard description
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-gray-700">Control Measures</Label>
                          <div className="space-y-2">
                            {Array.isArray(risk.controlMeasures) ? 
                              risk.controlMeasures.map((measure: string, measureIndex: number) => (
                                <div key={measureIndex} className="flex items-center gap-2">
                                  <textarea
                                    value={measure}
                                    onChange={(e) => {
                                      const updatedRisks = [...formData.riskAssessments];
                                      updatedRisks[index].controlMeasures[measureIndex] = e.target.value;
                                      updateFormData({ riskAssessments: updatedRisks });
                                    }}
                                    className="flex-1 min-h-[60px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                    placeholder="Describe the control measure..."
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const updatedRisks = [...formData.riskAssessments];
                                      updatedRisks[index].controlMeasures = updatedRisks[index].controlMeasures.filter((_: any, i: number) => i !== measureIndex);
                                      updateFormData({ riskAssessments: updatedRisks });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )) :
                              <textarea
                                value={risk.controlMeasures || ''}
                                onChange={(e) => {
                                  const updatedRisks = [...formData.riskAssessments];
                                  updatedRisks[index].controlMeasures = e.target.value;
                                  updateFormData({ riskAssessments: updatedRisks });
                                }}
                                className="w-full min-h-[60px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                placeholder="Describe the control measures..."
                              />
                            }
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedRisks = [...formData.riskAssessments];
                                if (!Array.isArray(updatedRisks[index].controlMeasures)) {
                                  updatedRisks[index].controlMeasures = [updatedRisks[index].controlMeasures || ''];
                                }
                                updatedRisks[index].controlMeasures.push('');
                                updateFormData({ riskAssessments: updatedRisks });
                              }}
                              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Control measure description
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {formData.activities.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-gray-500">
                  Please select activities in Step 1 to continue with risk assessment
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Layers className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Visual Table Editor</h3>
            <p className="text-gray-600 text-sm">
              Edit and customize your risk assessments in an interactive table format
            </p>
          </div>

          {formData.riskAssessments && formData.riskAssessments.length > 0 ? (
            <SimplifiedTableEditor 
              riskAssessments={formData.riskAssessments}
              onUpdate={(assessments) => updateFormData({ riskAssessments: assessments })}
              tradeType={formData.tradeType || 'General'}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-gray-500">
                  No risk assessments found. Please complete Step 2 first.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Wrench className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plant & Equipment</h3>
            <p className="text-gray-600 text-sm">
              Document plant, equipment, and machinery required for your work
            </p>
          </div>

          <PlantEquipmentManager 
            formData={formData}
            updateFormData={updateFormData}
          />

          <ReviewMonitoringManager 
            formData={formData}
            updateFormData={updateFormData}
          />
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Legal Disclaimer</h3>
            <p className="text-gray-600 text-sm">
              Select applicable safety codes and compliance requirements
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Applicable Safety Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Select safety codes and compliance requirements that apply to your project</p>
              
              {/* Trade-specific recommended codes */}
              {formData.tradeType && (
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Recommended for {formData.tradeType}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(Array.isArray(safetyLibrary) ? safetyLibrary : safetyLibrary?.documents || [])
                      ?.filter((code: any) => code.applicableIndustries?.includes(formData.tradeType))
                      .slice(0, 9)
                      .map((code: any) => (
                        <div key={code.id} className="flex items-start space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={code.id}
                            checked={selectedComplianceCodes.has(code.title)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedComplianceCodes(prev => new Set([...prev, code.title]));
                              } else {
                                setSelectedComplianceCodes(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(code.title);
                                  return newSet;
                                });
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <label htmlFor={code.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                              {code.title}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">{code.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* All available codes */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">All Available Safety Codes</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {(Array.isArray(safetyLibrary) ? safetyLibrary : safetyLibrary?.documents || [])
                    ?.map((code: any) => (
                      <div key={code.id} className="flex items-start space-x-2 p-2 border border-gray-200 rounded hover:bg-gray-50">
                        <Checkbox
                          id={`all-${code.id}`}
                          checked={selectedComplianceCodes.has(code.title)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedComplianceCodes(prev => new Set([...prev, code.title]));
                            } else {
                              setSelectedComplianceCodes(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(code.title);
                                return newSet;
                              });
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <label htmlFor={`all-${code.id}`} className="text-sm text-gray-900 cursor-pointer">
                            {code.title}
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Final Document</h3>
            <p className="text-gray-600 text-sm">
              Review your completed SWMS and generate the final document
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Final Document</h3>
                <p className="text-gray-600 text-sm">
                  Review your completed SWMS and generate the final document
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-green-800 mb-4">Document Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Project Details</h5>
                    <div className="space-y-1 text-sm text-green-600">
                      <div><strong>Title:</strong> {formData.title || 'Not specified'}</div>
                      <div><strong>Trade:</strong> {formData.tradeType || 'Not specified'}</div>
                      <div><strong>Location:</strong> {formData.projectLocation || 'Not specified'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Risk Assessments</h5>
                    <div className="space-y-1 text-sm text-green-600">
                      <div><strong>Total Assessments:</strong> {formData.riskAssessments?.length || 0}</div>
                      <div><strong>Activities:</strong> {formData.activities?.length || 0}</div>
                      <div><strong>Compliance Codes:</strong> {formData.complianceCodes?.length || 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-gray-700">Document Actions</h5>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/swms', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: formData.title || formData.jobName || "Untitled Project",
                            jobName: formData.jobName || formData.title || "Untitled Project", 
                            jobNumber: formData.jobNumber || "AUTO-" + Date.now(),
                            projectAddress: formData.projectAddress || formData.projectLocation || "",
                            projectLocation: formData.projectLocation || formData.projectAddress || "",
                            tradeType: formData.tradeType || "",
                            activities: Array.isArray(formData.activities) ? formData.activities : [],
                            riskAssessments: formData.riskAssessments || [],
                            safetyMeasures: formData.safetyMeasures || [],
                            complianceCodes: formData.complianceCodes || [],
                            status: "draft",
                            aiEnhanced: false
                          })
                        });
                        
                        if (response.ok) {
                          const result = await response.json();
                          // Open preview in new window/tab
                          window.open(`/api/swms/${result.swmsId}/pdf`, '_blank');
                        }
                      } catch (error) {
                        toast({
                          title: "Preview Error",
                          description: "Failed to generate preview",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    Preview Document
                  </Button>
                  
                  <Button
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/swms', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: formData.title || formData.jobName || "Untitled Project",
                            jobName: formData.jobName || formData.title || "Untitled Project", 
                            jobNumber: formData.jobNumber || "AUTO-" + Date.now(),
                            projectAddress: formData.projectAddress || formData.projectLocation || "",
                            projectLocation: formData.projectLocation || formData.projectAddress || "",
                            tradeType: formData.tradeType || "",
                            activities: Array.isArray(formData.activities) ? formData.activities : [],
                            riskAssessments: formData.riskAssessments || [],
                            safetyMeasures: formData.safetyMeasures || [],
                            complianceCodes: formData.complianceCodes || [],
                            status: "draft",
                            aiEnhanced: false
                          })
                        });
                        
                        if (response.ok) {
                          const result = await response.json();
                          // Download PDF
                          const pdfResponse = await fetch(`/api/swms/${result.swmsId}/pdf`);
                          const blob = await pdfResponse.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `SWMS-${result.swmsId}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          
                          toast({
                            title: "Download Complete",
                            description: "SWMS document downloaded successfully",
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Download Error",
                          description: "Failed to download PDF",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/swms', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: formData.title || formData.jobName || "Untitled Project",
                            jobName: formData.jobName || formData.title || "Untitled Project", 
                            jobNumber: formData.jobNumber || "AUTO-" + Date.now(),
                            projectAddress: formData.projectAddress || formData.projectLocation || "",
                            projectLocation: formData.projectLocation || formData.projectAddress || "",
                            tradeType: formData.tradeType || "",
                            activities: Array.isArray(formData.activities) ? formData.activities : [],
                            riskAssessments: formData.riskAssessments || [],
                            safetyMeasures: formData.safetyMeasures || [],
                            complianceCodes: formData.complianceCodes || [],
                            status: "draft",
                            aiEnhanced: false
                          })
                        });
                        
                        if (response.ok) {
                          toast({
                            title: "Draft Saved",
                            description: "SWMS draft saved successfully",
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Save Error",
                          description: "Failed to save draft",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800">Completion Checklist</h4>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Project details completed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Risk assessments generated</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Safety measures documented</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Legal disclaimer accepted</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    default:
      return <div>Invalid step</div>;
  }
}