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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [categoryActivities, setCategoryActivities] = useState<Record<string, string[]>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { data: trades } = useQuery({
    queryKey: ["/api/trades"],
  });

  const { data: safetyLibrary } = useQuery({
    queryKey: ["/api/safety-library"],
  });

  // Check user subscription for task limits
  const { data: subscription } = useQuery({
    queryKey: ["/api/user/subscription"],
  });

  // Check if demo mode is active with real-time updates
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return localStorage.getItem('demoMode') === 'true';
    } catch {
      return false;
    }
  });

  // Listen for localStorage changes to update demo mode in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setIsDemoMode(localStorage.getItem('demoMode') === 'true');
      } catch {
        setIsDemoMode(false);
      }
    };

    // Listen for storage events and custom events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('demoModeChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('demoModeChanged', handleStorageChange);
    };
  }, []);

  // Task limits based on subscription and demo mode
  const getTaskLimit = () => {
    // Demo mode restrictions - only when explicitly enabled
    if (isDemoMode) return 2;
    // All paid plans have unlimited tasks
    if (subscription?.plan === "Pro" || subscription?.plan === "Enterprise") return 999;
    return 999; // Default unlimited for regular users
  };

  const taskLimit = getTaskLimit();
  const isTaskLimitReached = formData.activities?.length >= taskLimit;

  // Function to get trade-specific safety codes
  const getTradeSpecificCodes = (tradeType: string): string[] => {
    const tradeCodeMap: Record<string, string[]> = {
      'Electrical': [
        'AS/NZS 3000:2018',
        'Work Health and Safety Act 2011',
        'Work Health and Safety Regulation 2017',
        'AS/NZS 1801:1997'
      ],
      'Plumbing': [
        'Work Health and Safety Act 2011',
        'Work Health and Safety Regulation 2017',
        'National Construction Code',
        'Australian Standards AS 3500'
      ],
      'Carpentry': [
        'Work Health and Safety Act 2011',
        'Work Health and Safety Regulation 2017',
        'Building Code of Australia',
        'Australian Standards AS 1100'
      ],
      'Painting': [
        'Work Health and Safety Act 2011',
        'Work Health and Safety Regulation 2017',
        'Building Code of Australia',
        'Australian Standards AS 1100 - Technical drawing'
      ],
      'HVAC': [
        'Work Health and Safety Act 2011',
        'Work Health and Safety Regulation 2017',
        'Building Code of Australia',
        'AS/NZS 3000:2018'
      ]
    };
    
    return tradeCodeMap[tradeType] || [
      'Work Health and Safety Act 2011',
      'Work Health and Safety Regulation 2017',
      'Building Code of Australia'
    ];
  };

  useEffect(() => {
    onDataChange(formData);
  }, [formData]);

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  // Auto-generate SWMS from selected activities
  const autoGenerateSwms = async () => {
    // Check if activities exist
    if (!formData.activities || formData.activities.length === 0) {
      console.log("No activities found in formData:", formData.activities);
      return;
    }

    try {
      const response = await fetch('/api/auto-generate-swms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities: formData.activities,
          tradeType: formData.tradeType,
          projectLocation: formData.projectLocation,
          title: formData.title,
          jobName: formData.jobName,
          jobNumber: formData.jobNumber
        })
      });

      if (response.ok) {
        const autoSwms = await response.json();
        console.log('Auto-generation response:', autoSwms);
        console.log('Risk assessments received:', autoSwms.riskAssessments?.length || 0);
        
        // Force a complete state update
        setFormData(prev => ({
          ...prev,
          riskAssessments: autoSwms.riskAssessments || [],
          safetyMeasures: autoSwms.safetyMeasures || [],
          complianceCodes: autoSwms.complianceCodes || [],
          autoGenerated: true
        }));
        
        toast({
          title: "SWMS Auto-Generated",
          description: `Generated ${autoSwms.riskAssessments?.length || 0} risk assessments and ${autoSwms.safetyMeasures?.length || 0} safety measures from selected activities`,
        });
      } else {
        throw new Error('Failed to auto-generate SWMS');
      }
    } catch (error) {
      toast({
        title: "Auto-Generation Failed",
        description: "Failed to auto-generate SWMS. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addArrayItem = (field: string, item: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), item]
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const selectedTrade = trades?.find((trade: any) => trade.name === formData.tradeType);

  switch (step) {
    case 1:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                {translate("swms.title")}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder={translate("placeholder.swmsTitle")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeType" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                {translate("swms.trade.type")}
              </Label>
              <Select value={formData.tradeType} onValueChange={(value) => updateFormData({ tradeType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={translate("swms.select.trade")} />
                </SelectTrigger>
                <SelectContent>
                  {trades?.map((trade: any) => (
                    <SelectItem key={trade.name} value={trade.name}>
                      {trade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="jobName" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                {translate("swms.job.name")} <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="jobName"
                value={formData.jobName || ""}
                onChange={(e) => updateFormData({ jobName: e.target.value })}
                placeholder={translate("placeholder.jobName")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobNumber" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                {translate("swms.job.number")}
              </Label>
              <Input
                id="jobNumber"
                value={formData.jobNumber || ""}
                onChange={(e) => updateFormData({ jobNumber: e.target.value })}
                placeholder={translate("placeholder.jobNumber")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectAddress" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              {translate("swms.project.address")} <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="projectAddress"
              value={formData.projectAddress || ""}
              onChange={(e) => updateFormData({ projectAddress: e.target.value })}
              placeholder={translate("placeholder.projectAddress")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectLocation" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              {translate("swms.project.location")}
            </Label>
            <Input
              id="projectLocation"
              value={formData.projectLocation}
              onChange={(e) => updateFormData({ projectLocation: e.target.value })}
              placeholder={translate("placeholder.projectLocation")}
            />
          </div>

          {selectedTrade && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Select Activities for {selectedTrade.name}
                </CardTitle>
                <p className="text-sm text-gray-600">Choose all applicable work activities for this project</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Task Limit Indicator */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Tasks Selected: {formData.activities?.length || 0} 
                      {taskLimit === 999 ? " (Unlimited)" : ` / ${taskLimit}`}
                    </span>
                  </div>
                  {isTaskLimitReached && taskLimit !== 999 && (
                    <Badge variant="destructive" className="text-xs">
                      Limit Reached
                    </Badge>
                  )}
                  {isDemoMode && (
                    <Badge variant="outline" className="text-xs">
                      Demo Mode - 2 Tasks Max
                    </Badge>
                  )}
                  {!isDemoMode && subscription?.plan && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      {subscription.plan} Plan
                    </Badge>
                  )}
                </div>

                {/* Activity Search */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search Activities</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search for specific activities..."
                      className="pl-10"
                      value={searchTerm || ""}
                      onChange={async (e) => {
                        const term = e.target.value;
                        setSearchTerm(term);
                        
                        if (term.length > 2) {
                          try {
                            const response = await fetch(`/api/search-activities?q=${encodeURIComponent(term)}&trade=${encodeURIComponent(selectedTrade.name)}`);
                            const results = await response.json();
                            setSearchResults(results);
                          } catch (error) {
                            console.error('Search failed:', error);
                            setSearchResults([]);
                          }
                        } else {
                          setSearchResults([]);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Search Results */}
                  {searchTerm.length > 2 && searchResults.length > 0 && (
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium text-sm mb-3">Search Results ({searchResults.length} found)</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.map((result: any, index: number) => {
                          const isSelected = formData.activities.includes(result.activity);
                          return (
                            <div key={index} className="flex items-center space-x-2">
                              <Checkbox
                                checked={isSelected}
                                disabled={!isSelected && isTaskLimitReached}
                                onCheckedChange={async (checked) => {
                                  if (checked) {
                                    if (isTaskLimitReached) {
                                      toast({
                                        title: "Task Limit Reached",
                                        description: `You can only select ${taskLimit} tasks with your current plan. Upgrade to Pro for more tasks.`,
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    addArrayItem('activities', result.activity);
                                    // Auto-generate SWMS when activities are selected
                                    setTimeout(() => autoGenerateSwms(), 500);
                                  } else {
                                    const idx = formData.activities.indexOf(result.activity);
                                    if (idx > -1) removeArrayItem('activities', idx);
                                  }
                                }}
                              />
                              <Label className="text-sm flex-1 cursor-pointer">
                                {result.activity}
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {result.trade || selectedTrade.name}
                                </Badge>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {searchTerm.length > 2 && searchResults.length === 0 && (
                    <div className="text-sm text-gray-500 p-2">
                      No activities found matching "{searchTerm}"
                    </div>
                  )}
                </div>

                {selectedTrade.categories?.map((category: any) => {
                  const isCollapsed = collapsedCategories.has(category.name);
                  const selectedCount = category.activities.filter((activity: string) => 
                    formData.activities.includes(activity)
                  ).length;
                  const totalCount = category.totalActivities || category.activities.length;
                  const displayedCount = category.activities.length;
                  
                  return (
                    <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="activity-category-header bg-gray-50 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 p-0 h-auto font-medium text-gray-800 hover:bg-transparent"
                            onClick={() => toggleCategory(category.name)}
                          >
                            <Layers className="h-4 w-4" />
                            {category.name}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {selectedCount}/{totalCount}
                            </Badge>
                            {isCollapsed ? (
                              <ChevronDown className="h-4 w-4 ml-1" />
                            ) : (
                              <ChevronUp className="h-4 w-4 ml-1" />
                            )}
                          </Button>
                          
                          <QuickActionTooltip
                            title="Select All Activities"
                            description="Toggle selection for all activities in this category"
                            category="editing"
                            shortcuts={[
                              { key: "Ctrl + A", action: "Select all in category" }
                            ]}
                            tips={[
                              "Quickly select/deselect entire categories",
                              "Respects your current plan's task limits",
                              "Shows count of selected vs total activities"
                            ]}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="select-all-btn"
                              onClick={() => {
                                const allSelected = category.activities.every((activity: string) => 
                                  formData.activities.includes(activity)
                                );
                                if (allSelected) {
                                  // Deselect all
                                  category.activities.forEach((activity: string) => {
                                    const index = formData.activities.indexOf(activity);
                                    if (index > -1) removeArrayItem('activities', index);
                                  });
                                } else {
                                  // Select all with task limit enforcement (only for demo mode)
                                  const currentCount = formData.activities?.length || 0;
                                  
                                  if (taskLimit !== 999) { // Only enforce limits for demo mode
                                    const availableSlots = taskLimit - currentCount;
                                    
                                    if (availableSlots <= 0) {
                                      toast({
                                        title: "Task Limit Reached",
                                        description: `Demo mode limited to ${taskLimit} tasks. Sign up for unlimited tasks.`,
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                  }
                                  
                                  let addedCount = 0;
                                  const availableSlots = taskLimit === 999 ? Infinity : (taskLimit - currentCount);
                                  
                                  category.activities.forEach((activity: string) => {
                                    if (!formData.activities.includes(activity) && addedCount < availableSlots) {
                                      addArrayItem('activities', activity);
                                      addedCount++;
                                    }
                                  });
                                  
                                  if (addedCount < category.activities.filter(a => !formData.activities.includes(a)).length) {
                                    toast({
                                      title: "Partial Selection",
                                      description: `Only ${addedCount} activities selected due to your ${taskLimit} task limit.`,
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                            >
                              {category.activities.every((activity: string) => 
                                formData.activities.includes(activity)
                            ) ? 'Deselect All' : 'Select All'}
                            </Button>
                          </QuickActionTooltip>
                        </div>
                      </div>
                      
                      <div className={`category-content ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                        {!isCollapsed && (
                          <div className="p-4">
                            <div className="activity-checkbox-group">
                              {/* Display expanded activities if loaded, otherwise show default activities */}
                              {(expandedCategories.has(`${selectedTrade.name}-${category.name}`) 
                                ? categoryActivities[`${selectedTrade.name}-${category.name}`] || category.activities
                                : category.activities
                              ).map((activity: string) => {
                                const isSelected = formData.activities.includes(activity);
                                return (
                                  <div 
                                    key={activity} 
                                    className={`activity-checkbox-item ${isSelected ? 'selected' : ''}`}
                                  >
                                    <Checkbox
                                      id={activity}
                                      checked={isSelected}
                                      disabled={!isSelected && isTaskLimitReached}
                                      onCheckedChange={async (checked) => {
                                        if (checked) {
                                          if (isTaskLimitReached) {
                                            toast({
                                              title: "Task Limit Reached",
                                              description: `You can only select ${taskLimit} tasks with your current plan. Upgrade to Pro for more tasks.`,
                                              variant: "destructive",
                                            });
                                            return;
                                          }
                                          addArrayItem('activities', activity);
                                          // Auto-generate SWMS when activities are selected with updated state
                                          setTimeout(() => {
                                            setFormData((currentData) => {
                                              if (currentData.activities && currentData.activities.length > 0) {
                                                autoGenerateSwms();
                                              }
                                              return currentData;
                                            });
                                          }, 100);
                                        } else {
                                          const index = formData.activities.indexOf(activity);
                                          if (index > -1) removeArrayItem('activities', index);
                                        }
                                      }}
                                      className="mt-0.5"
                                    />
                                    <Label 
                                      htmlFor={activity} 
                                      className="text-sm text-gray-700 leading-tight cursor-pointer flex-1"
                                    >
                                      {activity}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Show More Button for categories with additional activities */}
                            {category.hasMore && !expandedCategories.has(`${selectedTrade.name}-${category.name}`) && (
                              <div className="mt-4 border-t pt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/trades/${selectedTrade.name}/activities?category=${encodeURIComponent(category.name)}`);
                                      const data = await response.json();
                                      
                                      if (data.activities) {
                                        // Store all activities for this category
                                        setCategoryActivities(prev => ({
                                          ...prev,
                                          [`${selectedTrade.name}-${category.name}`]: data.activities
                                        }));
                                        
                                        // Mark category as expanded
                                        setExpandedCategories(prev => new Set([...prev, `${selectedTrade.name}-${category.name}`]));
                                        
                                        toast({
                                          title: "Activities Loaded",
                                          description: `Loaded ${data.activities.length} activities for ${category.name}`,
                                        });
                                      }
                                    } catch (error) {
                                      console.error('Failed to load more activities:', error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to load additional activities",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  Show All {totalCount} Activities ({displayedCount} of {totalCount} shown)
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {formData.activities.length > 0 && (
                  <div className="selected-activities-summary">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Selected Activities ({formData.activities.length})
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Risk assessments auto-generated below
                      </div>
                    </div>
                    
                    {formData.autoGenerated && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckSquare className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            SWMS Auto-Generated Successfully
                          </span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          Pre-populated with {formData.riskAssessments?.length || 0} risk assessments, 
                          {formData.safetyMeasures?.length || 0} safety measures, and 
                          {formData.complianceCodes?.length || 0} compliance codes based on your selected activities.
                          You can review and edit these in the next steps.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <span></span>
                      <QuickActionTooltip
                        title="Clear All Activities"
                        description="Remove all selected activities from your SWMS"
                        category="editing"
                        shortcuts={[
                          { key: "Ctrl + Delete", action: "Clear all activities" }
                        ]}
                        tips={[
                          "This will remove all selected activities",
                          "You can always re-select activities afterward",
                          "Useful for starting fresh with activity selection"
                        ]}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2 text-blue-600 hover:text-blue-800"
                          onClick={() => updateFormData({ activities: [] })}
                        >
                          Clear All
                        </Button>
                      </QuickActionTooltip>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.activities.slice(0, 8).map((activity: string, index: number) => (
                        <Badge key={index} className="activity-badge">
                          {activity}
                        </Badge>
                      ))}
                      {formData.activities.length > 8 && (
                        <Badge variant="outline" className="text-xs bg-white">
                          +{formData.activities.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
            <p className="text-gray-600 text-sm">
              Identify and assess potential hazards for your work activities
            </p>
          </div>

          {/* Risk Matrix and Safety Hierarchy Reference */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <QuickActionTooltip
                    {...presetTooltips.riskMatrix}
                    side="right"
                  >
                    <div className="flex items-center cursor-help">
                      <Shield className="mr-2 h-4 w-4 text-primary" />
                      Risk Assessment Matrix
                    </div>
                  </QuickActionTooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Section A: Qualitative and Quantitative Scales */}
                <div className="grid grid-cols-4 gap-1 text-xs border border-gray-300 mb-4">
                  <div className="p-2 bg-cyan-200 font-medium text-center border-r">Qualitative Scale</div>
                  <div className="p-2 bg-cyan-200 font-medium text-center border-r">Quantitative Scale</div>
                  <div className="p-2 bg-green-300 font-medium text-center border-r">Magnitude Scale</div>
                  <div className="p-2 bg-green-300 font-medium text-center">Probability Scale</div>
                  
                  <div className="p-2 bg-cyan-100 border-r">
                    <div className="font-medium">Extreme</div>
                    <div className="text-xs text-gray-600">Fatality, significant disability, catastrophic property damage</div>
                  </div>
                  <div className="p-2 bg-cyan-100 border-r">$50,000+</div>
                  <div className="p-2 bg-green-200 border-r">
                    <div className="font-medium">Likely</div>
                    <div className="text-xs">Monthly in the industry</div>
                  </div>
                  <div className="p-2 bg-green-200">Good chance</div>
                  
                  <div className="p-2 bg-cyan-100 border-r">
                    <div className="font-medium">High</div>
                    <div className="text-xs text-gray-600">Minor amputation, minor permanent disability, moderate property damage</div>
                  </div>
                  <div className="p-2 bg-cyan-100 border-r">$15,000 - $50,000</div>
                  <div className="p-2 bg-green-200 border-r">
                    <div className="font-medium">Possible</div>
                    <div className="text-xs">Yearly in the industry</div>
                  </div>
                  <div className="p-2 bg-green-200">Even chance</div>
                  
                  <div className="p-2 bg-cyan-100 border-r">
                    <div className="font-medium">Medium</div>
                    <div className="text-xs text-gray-600">Minor injury resulting in Lost Time Injury or Medically Treated Injury</div>
                  </div>
                  <div className="p-2 bg-cyan-100 border-r">$1,000 - $15,000</div>
                  <div className="p-2 bg-green-200 border-r">
                    <div className="font-medium">Unlikely</div>
                    <div className="text-xs">Every 10 years in the industry</div>
                  </div>
                  <div className="p-2 bg-green-200">Low chance</div>
                  
                  <div className="p-2 bg-cyan-100 border-r">
                    <div className="font-medium">Low</div>
                    <div className="text-xs text-gray-600">First Aid Treatment with no lost time</div>
                  </div>
                  <div className="p-2 bg-cyan-100 border-r">$0 - $1,000</div>
                  <div className="p-2 bg-green-200 border-r">
                    <div className="font-medium">Very Rarely</div>
                    <div className="text-xs">Once in a lifetime in the industry</div>
                  </div>
                  <div className="p-2 bg-green-200">Practically no chance</div>
                </div>

                {/* Section B & C: Risk Matrix */}
                <div className="grid grid-cols-4 gap-1 text-xs border border-gray-300 mb-4">
                  <div className="p-2 bg-cyan-200 font-medium text-center border-r">Likely</div>
                  <div className="p-2 bg-cyan-200 font-medium text-center border-r">Possible</div>
                  <div className="p-2 bg-cyan-200 font-medium text-center border-r">Unlikely</div>
                  <div className="p-2 bg-cyan-200 font-medium text-center">Very Rare</div>
                  
                  <div className="p-2 bg-red-500 text-white text-center font-bold border-r">16</div>
                  <div className="p-2 bg-red-400 text-white text-center font-bold border-r">14</div>
                  <div className="p-2 bg-yellow-400 text-center font-bold border-r">11</div>
                  <div className="p-2 bg-yellow-300 text-center font-bold">7</div>
                  
                  <div className="p-2 bg-orange-400 text-white text-center font-bold border-r">15</div>
                  <div className="p-2 bg-yellow-400 text-center font-bold border-r">12</div>
                  <div className="p-2 bg-green-400 text-center font-bold border-r">8</div>
                  <div className="p-2 bg-green-300 text-center font-bold">5</div>
                  
                  <div className="p-2 bg-yellow-400 text-center font-bold border-r">13</div>
                  <div className="p-2 bg-green-400 text-center font-bold border-r">9</div>
                  <div className="p-2 bg-green-300 text-center font-bold border-r">6</div>
                  <div className="p-2 bg-green-200 text-center font-bold">3</div>
                  
                  <div className="p-2 bg-green-400 text-center font-bold border-r">10</div>
                  <div className="p-2 bg-green-300 text-center font-bold border-r">7</div>
                  <div className="p-2 bg-green-200 text-center font-bold border-r">4</div>
                  <div className="p-2 bg-green-100 text-center font-bold">2</div>
                </div>

                {/* Section D: Action Matrix */}
                <div className="grid grid-cols-4 gap-1 text-xs border border-gray-300">
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

          {/* AI section removed - users can access AI generation via sidebar */}

          {formData.riskAssessments && formData.riskAssessments.length > 0 && (
            <div className="space-y-4">
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
            </div>
          )}

          {/* Manual risk assessment entry area - always visible */}
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

    case 5:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Safety Codes & Compliance</h3>
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
                            checked={formData.complianceCodes.includes(code.code)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                addArrayItem('complianceCodes', code.code);
                              } else {
                                const index = formData.complianceCodes.indexOf(code.code);
                                if (index > -1) removeArrayItem('complianceCodes', index);
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <Label htmlFor={code.id} className="text-sm font-medium cursor-pointer block">
                              {code.code}
                            </Label>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {code.title}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Wrench className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plant, Equipment & Training</h3>
            <p className="text-gray-600 text-sm">
              Specify required equipment, plant, and training requirements
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Equipment & Plant Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Required Equipment</Label>
                <Textarea
                  value={formData.requiredEquipment || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredEquipment: e.target.value }))}
                  placeholder="List all equipment required for this work (e.g., scaffolding, power tools, safety harnesses, etc.)"
                  className="mt-2 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Plant & Machinery</Label>
                <Textarea
                  value={formData.plantMachinery || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, plantMachinery: e.target.value }))}
                  placeholder="List any plant or machinery to be used (e.g., excavators, cranes, generators, etc.)"
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Required Licenses & Certifications</Label>
                <Textarea
                  value={formData.requiredLicenses || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredLicenses: e.target.value }))}
                  placeholder="List required licenses, certifications, and training (e.g., Working at Heights, Electrical License, First Aid, etc.)"
                  className="mt-2 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Competency Requirements</Label>
                <Textarea
                  value={formData.competencyRequirements || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, competencyRequirements: e.target.value }))}
                  placeholder="Describe specific competency requirements and experience needed"
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Site Access & Permits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Required Permits</Label>
                <Textarea
                  value={formData.requiredPermits || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredPermits: e.target.value }))}
                  placeholder="List any permits required for this work (e.g., hot work permit, confined space permit, electrical work permit)"
                  className="mt-2 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Site Access Requirements</Label>
                <Textarea
                  value={formData.siteAccess || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, siteAccess: e.target.value }))}
                  placeholder="Describe site access requirements, restrictions, and safety protocols"
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Emergency Procedures & Monitoring</h3>
            <p className="text-gray-600 text-sm">
              Define emergency procedures, monitoring requirements, and inspection schedules
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Procedures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Emergency Contact Information</Label>
                <Textarea
                  value={formData.emergencyContacts || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContacts: e.target.value }))}
                  placeholder="Emergency contacts including site supervisor, first aid officer, emergency services numbers"
                  className="mt-2 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Emergency Response Procedures</Label>
                <Textarea
                  value={formData.emergencyProcedures || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyProcedures: e.target.value }))}
                  placeholder="Step-by-step emergency response procedures for incidents, injuries, and evacuations"
                  className="mt-2 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">First Aid Requirements</Label>
                <Textarea
                  value={formData.firstAidRequirements || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstAidRequirements: e.target.value }))}
                  placeholder="First aid kit locations, trained first aid officers, medical facilities nearby"
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monitoring & Inspection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Inspection Schedule</Label>
                <Textarea
                  value={formData.inspectionSchedule || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, inspectionSchedule: e.target.value }))}
                  placeholder="Daily, weekly, or periodic inspection requirements and schedules"
                  className="mt-2 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Monitoring Requirements</Label>
                <Textarea
                  value={formData.monitoringRequirements || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, monitoringRequirements: e.target.value }))}
                  placeholder="Ongoing monitoring requirements during work activities"
                  className="mt-2 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Record Keeping</Label>
                <Textarea
                  value={formData.recordKeeping || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, recordKeeping: e.target.value }))}
                  placeholder="Documentation and record keeping requirements"
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{translate('legalDisclaimer')}</h3>
            <p className="text-gray-600 text-sm">
              {translate('reviewAcceptDisclaimer')}
            </p>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {translate('legalDisclaimerTerms')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-6 rounded-lg border border-red-200">
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">IMPORTANT LEGAL DISCLAIMER</h4>
                    <p className="text-red-700">
                      <strong>NO LIABILITY:</strong> Safety Samurai and its operators are NOT LIABLE for any incidents, accidents, injuries, property damage, or fatalities arising from the use of this SWMS document.
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-red-700">
                      <strong>TEMPLATE ONLY:</strong> This document is a TEMPLATE and must be reviewed, modified, and approved by qualified safety professionals before use.
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-red-700">
                      <strong>CONTRACTOR RESPONSIBILITY:</strong> You are solely responsible for ensuring this SWMS complies with all applicable laws, regulations, and safety requirements.
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-red-700">
                      <strong>SITE-SPECIFIC REQUIREMENTS:</strong> This document must be adapted to site-specific conditions and hazards.
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-red-700">
                      <strong>PROFESSIONAL REVIEW REQUIRED:</strong> A qualified safety professional must review and approve this SWMS before work commences.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-start space-x-3">
                <Checkbox
                  checked={formData.acceptedDisclaimer || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptedDisclaimer: checked }))}
                  className="mt-1"
                />
                <Label className="text-sm text-gray-700 leading-relaxed">
                  I acknowledge and accept the legal disclaimer above. I understand that Riskify is not liable for any incidents or damages arising from the use of this SWMS document, and that I am responsible for ensuring compliance with all applicable safety regulations.
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Final Document</h3>
            <p className="text-gray-600 text-sm">
              Review your completed SWMS and generate the final document
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Document Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Project Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Title:</strong> {formData.title || 'Not specified'}</p>
                    <p><strong>Trade:</strong> {formData.tradeType || 'Not specified'}</p>
                    <p><strong>Location:</strong> {formData.projectLocation || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Risk Assessments</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Total Assessments:</strong> {formData.riskAssessments?.length || 0}</p>
                    <p><strong>Activities:</strong> {formData.activities?.length || 0}</p>
                    <p><strong>Compliance Codes:</strong> {formData.complianceCodes?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Document Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => console.log('Preview SWMS')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Document
                  </Button>
                  <Button 
                    onClick={() => console.log('Download PDF')}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button 
                    onClick={() => console.log('Save Draft')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Completion Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Project details completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Risk assessments generated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Safety measures documented</span>
                </div>
                <div className="flex items-center gap-2">
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
