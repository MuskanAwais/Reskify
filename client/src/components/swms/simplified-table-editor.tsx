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
  Plus, 
  Trash2, 
  Edit,
  Shield,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface SimplifiedTableEditorProps {
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

export default function SimplifiedTableEditor({ formData, onDataChange }: SimplifiedTableEditorProps) {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      description: "The risk assessment has been removed.",
    });
  };

  const addNewAssessment = () => {
    const newAssessment: RiskAssessment = {
      id: `custom-${Date.now()}`,
      activity: "New Activity",
      hazards: ["Manual handling injuries", "Slip, trip and fall hazards"],
      initialRiskScore: 3,
      riskLevel: "Medium",
      controlMeasures: ["Follow safe work procedures", "Use appropriate PPE"],
      residualRiskScore: 2,
      residualRiskLevel: "Low",
      responsible: "Site Supervisor",
      ppe: ["Hard hat", "Safety boots", "High-vis vest"],
      training: ["Site induction", "Task-specific training"],
      legislation: ["Work Health and Safety Act 2011"],
      editable: true
    };
    
    const updated = [...riskAssessments, newAssessment];
    setRiskAssessments(updated);
    onDataChange({ ...formData, riskAssessments: updated });
    setEditingId(newAssessment.id);
  };

  const EditableField = ({ 
    value, 
    onSave, 
    type = "text",
    multiline = false,
    options = []
  }: {
    value: any;
    onSave: (value: any) => void;
    type?: string;
    multiline?: boolean;
    options?: any[];
  }) => {
    const [editValue, setEditValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
      onSave(editValue);
      setIsEditing(false);
    };

    if (!isEditing) {
      return (
        <div 
          className="cursor-pointer hover:bg-blue-50 p-2 rounded min-h-[40px] border border-gray-200 flex items-center"
          onClick={() => setIsEditing(true)}
        >
          {type === "array" ? (
            <div className="space-y-1 w-full">
              {Array.isArray(value) && value.length > 0 ? (
                value.slice(0, 3).map((item: string, index: number) => (
                  <Badge key={index} variant="secondary" className="mr-1 text-xs">
                    {item}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-400 text-sm">Click to add items...</span>
              )}
              {Array.isArray(value) && value.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{value.length - 3} more
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-sm">{value || "Click to edit..."}</span>
          )}
        </div>
      );
    }

    if (type === "select") {
      return (
        <div className="space-y-2">
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>
      );
    }

    if (type === "array") {
      return (
        <div className="space-y-2">
          <Textarea
            value={Array.isArray(editValue) ? editValue.join('\n') : editValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                const currentValue = e.currentTarget.value;
                const lines = currentValue.split('\n').filter(line => line.trim());
                if (lines.length > 0) {
                  setEditValue(lines);
                  onSave(lines);
                  setIsEditing(false);
                }
              }
            }}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Enter items, one per line. Press Ctrl+Enter to save."
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[60px]"
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Risk Assessment Management
          </CardTitle>
          <Button onClick={addNewAssessment} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Risk Assessment
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-800 font-medium mb-2">How to Edit Risk Assessment Table:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700">
              <div>
                <div className="font-medium mb-1">Editing Existing Risks:</div>
                <ul className="space-y-1">
                  <li>• Click any field to edit content directly</li>
                  <li>• For lists (hazards, controls), add one item per line</li>
                  <li>• Press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Ctrl+Enter</kbd> to save changes</li>
                  <li>• Press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Escape</kbd> to cancel</li>
                  <li>• Use <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Enter</kbd> for new lines in text areas</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Adding New Content:</div>
                <ul className="space-y-1">
                  <li>• Use "Add Risk Assessment" button for new activities</li>
                  <li>• Risk scores: 1-6 (Very Low to Extreme)</li>
                  <li>• Control measures should follow safety hierarchy</li>
                  <li>• Include specific PPE and training requirements</li>
                </ul>
              </div>
            </div>
          </div>

          {riskAssessments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Risk Assessments</h3>
              <p className="text-gray-500 mb-4">Create your first risk assessment to get started</p>
              <Button onClick={addNewAssessment} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Risk Assessment
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {riskAssessments.map((assessment) => (
                <Card key={assessment.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{assessment.activity}</h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${getRiskColor(assessment.initialRiskScore)}`} title="Initial Risk"></div>
                        <span className="text-xs text-gray-600">→</span>
                        <div className={`w-4 h-4 rounded ${getRiskColor(assessment.residualRiskScore)}`} title="Residual Risk"></div>
                        <span className="text-sm text-gray-600">
                          {getRiskLabel(assessment.residualRiskScore)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(editingId === assessment.id ? null : assessment.id)}
                      >
                        <Edit className="w-4 h-4" />
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
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Activity Name</Label>
                        <EditableField
                          value={assessment.activity}
                          onSave={(value) => updateAssessment(assessment.id, 'activity', value)}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Responsible Person</Label>
                        <EditableField
                          value={assessment.responsible}
                          onSave={(value) => updateAssessment(assessment.id, 'responsible', value)}
                          type="select"
                          options={RESPONSIBLE_PERSONS}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Initial Risk Score</Label>
                        <EditableField
                          value={assessment.initialRiskScore}
                          onSave={(value) => updateAssessment(assessment.id, 'initialRiskScore', parseInt(value))}
                          type="select"
                          options={RISK_LEVELS.map(r => ({ value: r.value, label: `${r.value} - ${r.label}` }))}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Residual Risk Score</Label>
                        <EditableField
                          value={assessment.residualRiskScore}
                          onSave={(value) => updateAssessment(assessment.id, 'residualRiskScore', parseInt(value))}
                          type="select"
                          options={RISK_LEVELS.map(r => ({ value: r.value, label: `${r.value} - ${r.label}` }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Hazards Identified</Label>
                      <EditableField
                        value={assessment.hazards}
                        onSave={(value) => updateAssessment(assessment.id, 'hazards', value)}
                        type="array"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Control Measures</Label>
                      <EditableField
                        value={assessment.controlMeasures}
                        onSave={(value) => updateAssessment(assessment.id, 'controlMeasures', value)}
                        type="array"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">PPE Required</Label>
                        <EditableField
                          value={assessment.ppe}
                          onSave={(value) => updateAssessment(assessment.id, 'ppe', value)}
                          type="array"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Training Required</Label>
                        <EditableField
                          value={assessment.training}
                          onSave={(value) => updateAssessment(assessment.id, 'training', value)}
                          type="array"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Australian Standards & Legislation</Label>
                      <EditableField
                        value={assessment.legislation}
                        onSave={(value) => updateAssessment(assessment.id, 'legislation', value)}
                        type="array"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}