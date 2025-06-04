import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  X,
  AlertTriangle,
  Shield,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface EnhancedTableEditorProps {
  formData: any;
  onDataChange: (data: any) => void;
}

interface RiskAssessment {
  id: string;
  activity: string;
  hazards: string[];
  initialRiskScore: number;
  riskLevel: string;
  controlMeasures: string[];
  residualRiskScore: number;
  residualRiskLevel: string;
  responsible: string;
  ppe: string[];
  training: string[];
  legislation: string[];
  editable?: boolean;
}

const RISK_LEVELS = [
  { value: 1, label: "Very Low", color: "bg-green-500" },
  { value: 2, label: "Low", color: "bg-green-400" },
  { value: 3, label: "Medium", color: "bg-yellow-500" },
  { value: 4, label: "High", color: "bg-orange-500" },
  { value: 5, label: "Very High", color: "bg-red-500" },
  { value: 6, label: "Extreme", color: "bg-red-600" }
];

const RESPONSIBLE_PERSONS = [
  "Site Supervisor",
  "Safety Officer",
  "Project Manager",
  "Lead Tradesperson",
  "Site Foreman",
  "Safety Coordinator"
];

export default function EnhancedTableEditor({ formData, onDataChange }: EnhancedTableEditorProps) {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (formData.riskAssessments) {
      setRiskAssessments(formData.riskAssessments);
    }
  }, [formData]);

  const getRiskColor = (score: number) => {
    const risk = RISK_LEVELS.find(r => r.value === score);
    return risk?.color || "bg-gray-400";
  };

  const getRiskLabel = (score: number) => {
    const risk = RISK_LEVELS.find(r => r.value === score);
    return risk?.label || "Unknown";
  };

  const updateAssessment = (id: string, field: string, value: any) => {
    const updated = riskAssessments.map(assessment => 
      assessment.id === id 
        ? { ...assessment, [field]: value }
        : assessment
    );
    setRiskAssessments(updated);
    onDataChange({ ...formData, riskAssessments: updated });
  };

  const deleteAssessment = (id: string) => {
    const updated = riskAssessments.filter(assessment => assessment.id !== id);
    setRiskAssessments(updated);
    onDataChange({ ...formData, riskAssessments: updated });
    toast({
      title: "Risk Assessment Deleted",
      description: "The risk assessment has been removed from the table.",
    });
  };

  const addNewAssessment = () => {
    const newAssessment: RiskAssessment = {
      id: `custom-${Date.now()}`,
      activity: "New Activity",
      hazards: [],
      initialRiskScore: 3,
      riskLevel: "Medium",
      controlMeasures: [],
      residualRiskScore: 2,
      residualRiskLevel: "Low",
      responsible: "Site Supervisor",
      ppe: [],
      training: [],
      legislation: [],
      editable: true
    };
    
    const updated = [...riskAssessments, newAssessment];
    setRiskAssessments(updated);
    onDataChange({ ...formData, riskAssessments: updated });
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const openDetailDialog = (assessment: RiskAssessment) => {
    setSelectedAssessment(assessment);
    setIsDetailDialogOpen(true);
  };

  const CompactCell = ({ items, maxShow = 2, type = "text" }: { items: string[], maxShow?: number, type?: string }) => {
    if (!items || items.length === 0) {
      return <span className="text-gray-400 text-xs">None specified</span>;
    }

    if (items.length === 1) {
      return <span className="text-xs">{items[0]}</span>;
    }

    if (items.length <= maxShow) {
      return (
        <div className="text-xs">
          {items.map((item, index) => (
            <div key={index} className="truncate">{item}</div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-xs">
        <div className="truncate">{items[0]}</div>
        <span className="text-gray-500 font-medium">+{items.length - 1} more</span>
      </div>
    );
  };

  const InlineEditField = ({ 
    value, 
    onSave, 
    type = "text",
    options = [],
    placeholder = "Click to edit..."
  }: {
    value: any;
    onSave: (value: any) => void;
    type?: string;
    options?: string[];
    placeholder?: string;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
      onSave(editValue);
      setIsEditing(false);
    };

    if (!isEditing) {
      return (
        <div 
          className="cursor-pointer hover:bg-blue-50 p-1 rounded text-xs min-h-[24px] flex items-center"
          onClick={() => setIsEditing(true)}
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || placeholder}
          </span>
          <Edit3 className="w-3 h-3 ml-1 text-gray-400 opacity-0 group-hover:opacity-100" />
        </div>
      );
    }

    if (type === "select") {
      return (
        <div className="flex items-center gap-1">
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option} className="text-xs">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleSave}>
            <Save className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsEditing(false)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-7 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          autoFocus
        />
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleSave}>
          <Save className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsEditing(false)}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Risk Assessment Table
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={addNewAssessment} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Risk Assessment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {riskAssessments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Risk Assessments</h3>
              <p className="text-sm mb-4">Get started by adding your first risk assessment</p>
              <Button onClick={addNewAssessment} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Risk Assessment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {riskAssessments.map((assessment) => (
                <Card key={assessment.id} className="border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleRowExpansion(assessment.id)}
                        >
                          {expandedRows.has(assessment.id) ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                          }
                        </Button>
                        <h4 className="font-medium text-gray-900">{assessment.activity}</h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${getRiskColor(assessment.initialRiskScore)}`} title="Initial Risk"></div>
                          <span className="text-xs text-gray-600">→</span>
                          <div className={`w-3 h-3 rounded ${getRiskColor(assessment.residualRiskScore)}`} title="Residual Risk"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailDialog(assessment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAssessment(assessment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Compact Summary Row */}
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Hazards</Label>
                        <CompactCell items={assessment.hazards} maxShow={2} />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Control Measures</Label>
                        <CompactCell items={assessment.controlMeasures} maxShow={2} />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">PPE Required</Label>
                        <CompactCell items={assessment.ppe} maxShow={3} />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Responsible Person</Label>
                        <InlineEditField
                          value={assessment.responsible}
                          onSave={(value) => updateAssessment(assessment.id, 'responsible', value)}
                          type="select"
                          options={RESPONSIBLE_PERSONS}
                        />
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <Collapsible open={expandedRows.has(assessment.id)}>
                      <CollapsibleContent className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Activity Name</Label>
                              <InlineEditField
                                value={assessment.activity}
                                onSave={(value) => updateAssessment(assessment.id, 'activity', value)}
                                placeholder="Enter activity name..."
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Initial Risk Score</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <InlineEditField
                                  value={assessment.initialRiskScore.toString()}
                                  onSave={(value) => updateAssessment(assessment.id, 'initialRiskScore', parseInt(value))}
                                  type="select"
                                  options={RISK_LEVELS.map(r => r.value.toString())}
                                />
                                <span className="text-xs text-gray-600">
                                  ({getRiskLabel(assessment.initialRiskScore)})
                                </span>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Residual Risk Score</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <InlineEditField
                                  value={assessment.residualRiskScore.toString()}
                                  onSave={(value) => updateAssessment(assessment.id, 'residualRiskScore', parseInt(value))}
                                  type="select"
                                  options={RISK_LEVELS.map(r => r.value.toString())}
                                />
                                <span className="text-xs text-gray-600">
                                  ({getRiskLabel(assessment.residualRiskScore)})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Training Required</Label>
                              <div className="mt-1">
                                <CompactCell items={assessment.training || []} />
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Australian Standards</Label>
                              <div className="mt-1">
                                <CompactCell items={assessment.legislation || []} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Risk Assessment Details</DialogTitle>
            <DialogDescription>
              {selectedAssessment?.activity}
            </DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Hazards Identified</Label>
                  <div className="mt-2 space-y-1">
                    {selectedAssessment.hazards?.map((hazard, index) => (
                      <div key={index} className="bg-red-50 p-2 rounded text-sm">
                        {hazard}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Control Measures</Label>
                  <div className="mt-2 space-y-1">
                    {selectedAssessment.controlMeasures?.map((measure, index) => (
                      <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                        {measure}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">PPE Required</Label>
                  <div className="mt-2 space-y-1">
                    {selectedAssessment.ppe?.map((item, index) => (
                      <div key={index} className="bg-green-50 p-2 rounded text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Training Requirements</Label>
                  <div className="mt-2 space-y-1">
                    {selectedAssessment.training?.map((item, index) => (
                      <div key={index} className="bg-yellow-50 p-2 rounded text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Australian Standards</Label>
                  <div className="mt-2 space-y-1">
                    {selectedAssessment.legislation?.map((item, index) => (
                      <div key={index} className="bg-purple-50 p-2 rounded text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}