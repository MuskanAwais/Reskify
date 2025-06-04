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
  Wrench
} from "lucide-react";
import { SimplifiedTableEditor } from "./simplified-table-editor";
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
                SWMS Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="e.g., Electrical Installation - Office Building"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeType" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                Trade Type
              </Label>
              <Select value={formData.tradeType} onValueChange={(value) => updateFormData({ tradeType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your trade" />
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
                Job Name <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="jobName"
                value={formData.jobName || ""}
                onChange={(e) => updateFormData({ jobName: e.target.value })}
                placeholder="e.g., Office Tower Construction"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobNumber" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Job Number
              </Label>
              <Input
                id="jobNumber"
                value={formData.jobNumber || ""}
                onChange={(e) => updateFormData({ jobNumber: e.target.value })}
                placeholder="e.g., JOB-2025-001 (optional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectAddress" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Project Address <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="projectAddress"
              value={formData.projectAddress || ""}
              onChange={(e) => updateFormData({ projectAddress: e.target.value })}
              placeholder="Enter the complete project address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectLocation" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Project Location/Description
            </Label>
            <Input
              id="projectLocation"
              value={formData.projectLocation}
              onChange={(e) => updateFormData({ projectLocation: e.target.value })}
              placeholder="e.g., Level 5 Office Fitout, Main Building"
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
                      <Shield className="mr-2 h-4 w-4 text-blue-500" />
                      Risk Assessment Matrix
                    </div>
                  </QuickActionTooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-1 text-xs">
                  <div className="font-medium text-center p-2 bg-gray-100 rounded">Risk</div>
                  <div className="font-medium text-center p-2 bg-gray-100 rounded">Very Rare</div>
                  <div className="font-medium text-center p-2 bg-gray-100 rounded">Unlikely</div>
                  <div className="font-medium text-center p-2 bg-gray-100 rounded">Possible</div>
                  <div className="font-medium text-center p-2 bg-gray-100 rounded">Likely</div>
                  
                  <div className="font-medium p-2 bg-gray-100 rounded">Catastrophic</div>
                  <div className="p-2 bg-yellow-300 rounded text-center">Medium</div>
                  <div className="p-2 bg-orange-400 rounded text-center text-white">High</div>
                  <div className="p-2 bg-red-500 rounded text-center text-white">Extreme</div>
                  <div className="p-2 bg-red-600 rounded text-center text-white">Extreme</div>
                  
                  <div className="font-medium p-2 bg-gray-100 rounded">Major</div>
                  <div className="p-2 bg-green-400 rounded text-center">Low</div>
                  <div className="p-2 bg-yellow-300 rounded text-center">Medium</div>
                  <div className="p-2 bg-orange-400 rounded text-center text-white">High</div>
                  <div className="p-2 bg-red-500 rounded text-center text-white">Extreme</div>
                  
                  <div className="font-medium p-2 bg-gray-100 rounded">Moderate</div>
                  <div className="p-2 bg-green-300 rounded text-center">Low</div>
                  <div className="p-2 bg-green-400 rounded text-center">Low</div>
                  <div className="p-2 bg-yellow-300 rounded text-center">Medium</div>
                  <div className="p-2 bg-orange-400 rounded text-center text-white">High</div>
                  
                  <div className="font-medium p-2 bg-gray-100 rounded">Minor</div>
                  <div className="p-2 bg-green-200 rounded text-center">Low</div>
                  <div className="p-2 bg-green-300 rounded text-center">Low</div>
                  <div className="p-2 bg-green-400 rounded text-center">Low</div>
                  <div className="p-2 bg-yellow-300 rounded text-center">Medium</div>
                  
                  <div className="font-medium p-2 bg-gray-100 rounded">Insignificant</div>
                  <div className="p-2 bg-green-100 rounded text-center">Low</div>
                  <div className="p-2 bg-green-200 rounded text-center">Low</div>
                  <div className="p-2 bg-green-300 rounded text-center">Low</div>
                  <div className="p-2 bg-green-400 rounded text-center">Low</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-blue-500" />
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

          {formData.activities.length > 0 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    AI-Powered Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Selected Activities ({formData.activities.length})</Label>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {formData.activities.slice(0, 6).map((activity: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                        {formData.activities.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{formData.activities.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <QuickActionTooltip
                      title="AI Risk Assessment Generator"
                      description="Automatically generate comprehensive risk assessments for your selected activities using advanced AI analysis"
                      category="creation"
                      shortcuts={[
                        { key: "Ctrl + G", action: "Generate AI assessment" }
                      ]}
                      tips={[
                        "AI considers trade-specific hazards and regulations",
                        "Generated assessments follow Australian safety standards",
                        "Results automatically advance to the visual editor",
                        "You can customize all generated content afterward"
                      ]}
                      actions={[
                        {
                          label: "Quick Generate",
                          icon: <Shield className="h-3 w-3" />,
                          onClick: async () => {
                            try {
                              const response = await fetch('/api/ai/enhance-swms', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  activities: formData.activities,
                                  tradeType: formData.tradeType,
                                  projectLocation: formData.projectLocation
                                })
                              });
                              
                              if (response.ok) {
                                const aiData = await response.json();
                                updateFormData({
                                  riskAssessments: aiData.riskAssessments,
                                  safetyMeasures: aiData.safetyMeasures,
                                  complianceCodes: [...(formData.complianceCodes || []), ...aiData.complianceRecommendations]
                                });
                                toast({
                                  title: "AI Analysis Complete",
                                  description: `Generated ${aiData.riskAssessments.length} risk assessments. Proceeding to visual table editor.`,
                                });
                                setTimeout(() => {
                                  if (onNext) onNext();
                                }, 1500);
                              } else {
                                throw new Error('AI analysis failed');
                              }
                            } catch (error) {
                              toast({
                                title: "AI Analysis Error",
                                description: "Unable to generate AI risk assessment. Please check your connection.",
                                variant: "destructive"
                              });
                            }
                          },
                          variant: "default"
                        }
                      ]}
                    >
                      <Button
                        type="button"
                        className="w-full"
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/ai/enhance-swms', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                activities: formData.activities,
                                tradeType: formData.tradeType,
                                projectLocation: formData.projectLocation
                              })
                            });
                            
                            if (response.ok) {
                              const aiData = await response.json();
                              updateFormData({
                                riskAssessments: aiData.riskAssessments,
                                safetyMeasures: aiData.safetyMeasures,
                                complianceCodes: [...(formData.complianceCodes || []), ...aiData.complianceRecommendations]
                              });
                              toast({
                                title: "AI Analysis Complete",
                                description: `Generated ${aiData.riskAssessments.length} risk assessments. Proceeding to visual table editor.`,
                              });
                              // Automatically advance to step 3 (Visual Table Editor) after AI generation
                              setTimeout(() => {
                                if (onNext) onNext();
                              }, 1500);
                            } else {
                              throw new Error('AI analysis failed');
                            }
                          } catch (error) {
                            toast({
                              title: "AI Analysis Error",
                              description: "Unable to generate AI risk assessment. Please check your connection.",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Generate AI Risk Assessment
                      </Button>
                    </QuickActionTooltip>
                  </div>
                </CardContent>
              </Card>

              {formData.riskAssessments && formData.riskAssessments.length > 0 && (
                <Card>
                  <CardHeader>
                    <QuickActionTooltip
                      {...presetTooltips.tableEditor}
                      side="top"
                    >
                      <div className="cursor-help">
                        <CardTitle className="text-base">Risk Assessment Table</CardTitle>
                        <p className="text-sm text-gray-600">
                          Review and customize the AI-generated risk assessments. Click on any cell to edit directly.
                        </p>
                      </div>
                    </QuickActionTooltip>
                  </CardHeader>
                  <CardContent>
                    <SimplifiedTableEditor 
                      riskAssessments={formData?.riskAssessments || []}
                      onUpdate={(assessments) => onDataChange({ ...formData, riskAssessments: assessments })}
                      tradeType={formData?.tradeType || 'General'}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Legacy risk display for reference */}
              {false && formData.riskAssessments && formData.riskAssessments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Identified Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {formData.riskAssessments.map((risk: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">{risk.hazard}</h4>
                                <Badge 
                                  variant={
                                    risk.riskLevel === 'extreme' ? 'destructive' :
                                    risk.riskLevel === 'high' ? 'destructive' :
                                    risk.riskLevel === 'medium' ? 'default' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {risk.riskLevel.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Responsible:</strong> {risk.responsiblePerson}
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
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-700">Control Measures</Label>
                            <div className="space-y-1">
                              {Array.isArray(risk.controlMeasures) ? 
                                risk.controlMeasures.map((measure: string, measureIndex: number) => (
                                  <div key={measureIndex} className="text-sm text-gray-600 flex items-start">
                                    <CheckSquare className="h-3 w-3 mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                                    {measure}
                                  </div>
                                )) :
                                <div className="text-sm text-gray-600 flex items-start">
                                  <CheckSquare className="h-3 w-3 mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                                  {risk.controlMeasures}
                                </div>
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}


            </div>
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
            <Shield className="mx-auto h-12 w-12 text-blue-500 mb-4" />
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
                    <Shield className="h-4 w-4 text-blue-500" />
                    Recommended for {formData.tradeType}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {safetyLibrary
                      ?.filter((code: any) => code.applicableTrades?.includes(formData.tradeType))
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
                    <Shield className="h-4 w-4 text-blue-500" />
                    Recommended for {formData.tradeType}
                  </h4>
                  <div className="grid gap-3">
                    {getTradeSpecificCodes(formData.tradeType).map((code: string) => {
                      const safetyItem = safetyLibrary?.find((item: any) => item.code === code);
                      return (
                        <div key={code} className="flex items-start space-x-3 p-3 border rounded-lg bg-blue-50 border-blue-200">
                          <Checkbox
                            checked={formData.complianceCodes.includes(code)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                addArrayItem('complianceCodes', code);
                              } else {
                                const index = formData.complianceCodes.indexOf(code);
                                if (index > -1) removeArrayItem('complianceCodes', index);
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-blue-800">{code}</p>
                            {safetyItem && (
                              <p className="text-xs text-blue-600 mt-1">{safetyItem.title}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* General Safety Codes */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  All Available Safety Codes
                </h4>
                <div className="mb-3">
                  <Input
                    placeholder="Search safety codes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {safetyLibrary
                    ?.filter((item: any) => 
                      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.title.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item: any) => (
                    <div key={item.code} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={formData.complianceCodes.includes(item.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            addArrayItem('complianceCodes', item.code);
                          } else {
                            const index = formData.complianceCodes.indexOf(item.code);
                            if (index > -1) removeArrayItem('complianceCodes', index);
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.code}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Selected codes summary */}
              {formData.complianceCodes.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2">Selected Codes ({formData.complianceCodes.length})</h5>
                  <div className="flex flex-wrap gap-2">
                    {formData.complianceCodes.map((code: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white">
                        {code}
                        <button
                          onClick={() => {
                            const codeIndex = formData.complianceCodes.indexOf(code);
                            if (codeIndex > -1) removeArrayItem('complianceCodes', codeIndex);
                          }}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Wrench className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plant, Equipment & Training</h3>
            <p className="text-gray-600 text-sm">
              Specify required equipment, plant, and training requirements
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Equipment & Plant Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Required Equipment</Label>
                  <Textarea
                    value={formData.requiredEquipment || ''}
                    onChange={(e) => updateFormData({ requiredEquipment: e.target.value })}
                    placeholder="List all equipment required for this work (e.g., scaffolding, power tools, safety harnesses, etc.)"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Plant & Machinery</Label>
                  <Textarea
                    value={formData.plantMachinery || ''}
                    onChange={(e) => updateFormData({ plantMachinery: e.target.value })}
                    placeholder="List any plant or machinery to be used (e.g., excavators, cranes, generators, etc.)"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Training Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Required Licenses & Certifications</Label>
                  <Textarea
                    value={formData.trainingRequirements || ''}
                    onChange={(e) => updateFormData({ trainingRequirements: e.target.value })}
                    placeholder="List required licenses, certifications, and training (e.g., Working at Heights, Electrical License, First Aid, etc.)"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Competency Requirements</Label>
                  <Textarea
                    value={formData.competencyRequirements || ''}
                    onChange={(e) => updateFormData({ competencyRequirements: e.target.value })}
                    placeholder="Describe specific competency requirements and experience needed"
                    rows={3}
                  />
                </div>
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
            <h3 className="text-lg font-semibold mb-2">Emergency Procedures & Monitoring</h3>
            <p className="text-gray-600 text-sm">
              Define emergency procedures, monitoring requirements, and inspection schedules
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Emergency Procedures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Emergency Contact Information</Label>
                  <Textarea
                    value={formData.emergencyContacts || ''}
                    onChange={(e) => updateFormData({ emergencyContacts: e.target.value })}
                    placeholder="Emergency contacts including site supervisor, first aid officer, emergency services numbers"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Emergency Response Procedures</Label>
                  <Textarea
                    value={formData.emergencyProcedures || ''}
                    onChange={(e) => updateFormData({ emergencyProcedures: e.target.value })}
                    placeholder="Step-by-step emergency response procedures for incidents, injuries, and evacuations"
                    rows={4}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">First Aid Requirements</Label>
                  <Textarea
                    value={formData.firstAidRequirements || ''}
                    onChange={(e) => updateFormData({ firstAidRequirements: e.target.value })}
                    placeholder="First aid kit locations, trained first aid officers, medical facilities nearby"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monitoring & Inspection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Inspection Schedule</Label>
                  <Textarea
                    value={formData.inspectionSchedule || ''}
                    onChange={(e) => updateFormData({ inspectionSchedule: e.target.value })}
                    placeholder="Daily, weekly, or periodic inspection requirements and schedules"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Monitoring Requirements</Label>
                  <Textarea
                    value={formData.monitoringRequirements || ''}
                    onChange={(e) => updateFormData({ monitoringRequirements: e.target.value })}
                    placeholder="Ongoing monitoring requirements during work activities"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Record Keeping</Label>
                  <Textarea
                    value={formData.recordKeeping || ''}
                    onChange={(e) => updateFormData({ recordKeeping: e.target.value })}
                    placeholder="Documentation and record keeping requirements"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <Card className="border-2 border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center text-red-800">
                <Shield className="mr-2 h-5 w-5" />
                Legal Disclaimer & Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h4 className="font-bold text-red-800 mb-3">IMPORTANT LEGAL DISCLAIMER</h4>
                <div className="text-sm text-red-700 space-y-2">
                  <p><strong>NO LIABILITY:</strong> Safety Samurai and its operators are NOT LIABLE for any incidents, accidents, injuries, property damage, or fatalities arising from the use of this SWMS document.</p>
                  <p><strong>TEMPLATE ONLY:</strong> This document is a TEMPLATE and must be reviewed, modified, and approved by qualified safety professionals before use.</p>
                  <p><strong>CONTRACTOR RESPONSIBILITY:</strong> You are solely responsible for ensuring this SWMS complies with all applicable laws, regulations, and safety requirements.</p>
                  <p><strong>SITE-SPECIFIC REQUIREMENTS:</strong> This document must be adapted to site-specific conditions and hazards.</p>
                  <p><strong>PROFESSIONAL REVIEW REQUIRED:</strong> A qualified safety professional must review and approve this SWMS before work commences.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id="legal-agreement"
                  checked={formData.legalAgreementAccepted || false}
                  onCheckedChange={(checked) => updateFormData({ legalAgreementAccepted: checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="legal-agreement" className="text-sm font-medium cursor-pointer">
                    I acknowledge and accept the legal disclaimer above. I understand that Safety Samurai is not liable for any incidents or damages arising from the use of this SWMS document, and that I am responsible for ensuring compliance with all applicable safety regulations.
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Your SWMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Project Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Title:</strong> {formData.title}</p>
                    <p><strong>Trade:</strong> {formData.tradeType}</p>
                    <p><strong>Location:</strong> {formData.projectLocation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Activities</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.activities.map((activity: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Compliance Codes</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.complianceCodes.map((code: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {code}
                    </Badge>
                  ))}
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
