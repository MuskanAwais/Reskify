import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Shield
} from "lucide-react";

interface VisualTableEditorProps {
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

// Australian Standards and Reference Points
const AUSTRALIAN_STANDARDS = [
  "AS/NZS 3000:2018 - Electrical installations",
  "AS/NZS 1891:2007 - Industrial fall-arrest systems",
  "AS/NZS 4804:2001 - Occupational health and safety management systems",
  "AS/NZS 1270:2002 - Acoustics - Hearing protectors",
  "AS/NZS 1337:2010 - Personal eye-protection",
  "AS/NZS 2210:2009 - Occupational protective footwear",
  "AS/NZS 1716:2012 - Respiratory protective devices",
  "AS/NZS 4501.1:2008 - Occupational protective gloves",
  "AS 1319:1994 - Safety signs for the occupational environment",
  "AS 2865:2009 - Safe working on roofs"
];

const RISK_LEVELS = [
  { value: "2", label: "Very Low", color: "bg-green-500" },
  { value: "3", label: "Low", color: "bg-green-400" },
  { value: "4", label: "Low", color: "bg-green-300" },
  { value: "5", label: "Low", color: "bg-yellow-300" },
  { value: "6", label: "Medium", color: "bg-yellow-400" },
  { value: "7", label: "Medium", color: "bg-yellow-500" },
  { value: "8", label: "Medium", color: "bg-orange-400" },
  { value: "9", label: "Medium", color: "bg-orange-500" },
  { value: "10", label: "High", color: "bg-red-400" },
  { value: "11", label: "High", color: "bg-red-500" },
  { value: "12", label: "High", color: "bg-red-600" },
  { value: "13", label: "Extreme", color: "bg-red-700" },
  { value: "14", label: "Extreme", color: "bg-red-800" },
  { value: "15", label: "Extreme", color: "bg-red-900" },
  { value: "16", label: "Extreme", color: "bg-red-950" }
];

const COMMON_HAZARDS = [
  "Manual handling injuries",
  "Slips, trips and falls",
  "Electrical shock/electrocution",
  "Falls from height",
  "Cuts and lacerations",
  "Eye injuries",
  "Respiratory exposure",
  "Noise exposure",
  "Heat stress",
  "Chemical exposure",
  "Fire and explosion",
  "Crushing injuries",
  "Vehicle/equipment collision",
  "Structural collapse"
];

const COMMON_PPE = [
  "Safety glasses/goggles",
  "Hard hat/helmet",
  "Safety boots",
  "High-visibility clothing",
  "Safety gloves",
  "Hearing protection",
  "Respiratory protection",
  "Fall arrest harness",
  "Cut-resistant clothing",
  "Face shield"
];

const RESPONSIBLE_PERSONS = [
  "Site Supervisor",
  "Safety Officer",
  "Project Manager",
  "Trade Supervisor",
  "Site Foreman",
  "Lead Hand",
  "Qualified Tradesperson",
  "Safety Representative"
];

export default function VisualTableEditor({ formData, onDataChange }: VisualTableEditorProps) {
  const { toast } = useToast();
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>(formData.riskAssessments || []);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(formData.activities || []);

  const { data: trades } = useQuery({
    queryKey: ["/api/trades"],
  });

  const selectedTrade = trades && Array.isArray(trades) ? trades.find((trade: any) => trade.name === formData.tradeType) : null;

  useEffect(() => {
    onDataChange({
      ...formData,
      riskAssessments,
      activities: selectedActivities
    });
  }, [riskAssessments, selectedActivities]);

  const getRiskLevel = (score: number): string => {
    if (score <= 4) return "Low";
    if (score <= 9) return "Medium";
    if (score <= 12) return "High";
    return "Extreme";
  };

  const getRiskColor = (score: number): string => {
    const risk = RISK_LEVELS.find(r => parseInt(r.value) === score);
    return risk?.color || "bg-gray-300";
  };

  const addNewRow = () => {
    const newAssessment: RiskAssessment = {
      id: `custom-${Date.now()}`,
      activity: "",
      hazards: [],
      initialRiskScore: 6,
      riskLevel: "Medium",
      controlMeasures: [],
      residualRiskScore: 3,
      residualRiskLevel: "Low",
      responsible: "Site Supervisor",
      ppe: [],
      training: [],
      legislation: [],
      editable: true
    };
    
    setRiskAssessments([...riskAssessments, newAssessment]);
    setEditingRow(newAssessment.id);
  };

  const updateAssessment = (id: string, field: string, value: any) => {
    setRiskAssessments(prev => prev.map(assessment => {
      if (assessment.id === id) {
        const updated = { ...assessment, [field]: value };
        
        // Auto-calculate risk levels when scores change
        if (field === 'initialRiskScore') {
          updated.riskLevel = getRiskLevel(value);
        }
        if (field === 'residualRiskScore') {
          updated.residualRiskLevel = getRiskLevel(value);
        }
        
        return updated;
      }
      return assessment;
    }));
  };

  const deleteAssessment = (id: string) => {
    setRiskAssessments(prev => prev.filter(assessment => assessment.id !== id));
    if (editingRow === id) {
      setEditingRow(null);
    }
  };

  const addActivityFromTrade = (activity: string) => {
    if (!selectedActivities.includes(activity)) {
      setSelectedActivities([...selectedActivities, activity]);
      
      // Auto-generate risk assessment for this activity
      const newAssessment: RiskAssessment = {
        id: `trade-${Date.now()}`,
        activity: activity,
        hazards: ["Manual handling injuries", "Tool and equipment hazards"],
        initialRiskScore: 6,
        riskLevel: "Medium",
        controlMeasures: ["Follow safe work procedures", "Use appropriate PPE"],
        residualRiskScore: 3,
        residualRiskLevel: "Low",
        responsible: "Site Supervisor",
        ppe: ["Safety glasses", "Hard hat", "Safety boots"],
        training: ["Safety induction", "Task-specific training"],
        legislation: ["Work Health and Safety Act 2011"],
        editable: true
      };
      
      setRiskAssessments([...riskAssessments, newAssessment]);
    }
  };

  const EditableCell = ({ 
    value, 
    onSave, 
    type = "text", 
    options = [], 
    multiSelect = false,
    placeholder = "" 
  }: any) => {
    const [editValue, setEditValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);

    if (!isEditing) {
      return (
        <div 
          className="min-h-[32px] cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center"
          onClick={() => setIsEditing(true)}
        >
          {multiSelect && Array.isArray(value) ? (
            <div className="flex flex-wrap gap-1">
              {value.map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-sm">{value || placeholder}</span>
          )}
          <Edit3 className="w-3 h-3 ml-1 text-gray-400" />
        </div>
      );
    }

    if (type === "select") {
      return (
        <div className="flex items-center gap-1">
          <Select value={editValue} onValueChange={(val) => setEditValue(val)}>
            <SelectTrigger className="h-8 text-xs">
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
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0"
            onClick={() => {
              onSave(editValue);
              setIsEditing(false);
            }}
          >
            <Save className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    if (type === "risk-score") {
      return (
        <div className="flex items-center gap-1">
          <Select value={editValue.toString()} onValueChange={(val) => setEditValue(parseInt(val))}>
            <SelectTrigger className="h-8 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RISK_LEVELS.map((risk) => (
                <SelectItem key={risk.value} value={risk.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${risk.color}`}></div>
                    {risk.value} - {risk.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0"
            onClick={() => {
              onSave(editValue);
              setIsEditing(false);
            }}
          >
            <Save className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    if (multiSelect) {
      return (
        <div className="space-y-1">
          <Textarea
            value={Array.isArray(editValue) ? editValue.join('\n') : editValue}
            onChange={(e) => setEditValue(e.target.value.split('\n').filter(Boolean))}
            className="text-xs min-h-[60px]"
            placeholder="Enter items, one per line"
          />
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 text-xs"
              onClick={() => {
                onSave(Array.isArray(editValue) ? editValue : editValue.split('\n').filter(Boolean));
                setIsEditing(false);
              }}
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 text-xs"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 text-xs"
          placeholder={placeholder}
        />
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-6 w-6 p-0"
          onClick={() => {
            onSave(editValue);
            setIsEditing(false);
          }}
        >
          <Save className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Activity Selection */}
      {selectedTrade && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Activities - {selectedTrade.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {selectedTrade.categories?.map((category: any) => 
                category.activities?.slice(0, 5).map((activity: string) => (
                  <Button
                    key={activity}
                    variant={selectedActivities.includes(activity) ? "default" : "outline"}
                    size="sm"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => addActivityFromTrade(activity)}
                  >
                    <span className="text-xs">{activity}</span>
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Risk Assessment Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Risk Assessment Table
          </CardTitle>
          <Button onClick={addNewRow} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Custom Row
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-[200px]">Activity</TableHead>
                  <TableHead className="w-[150px]">Hazards</TableHead>
                  <TableHead className="w-[80px]">Initial Risk</TableHead>
                  <TableHead className="w-[200px]">Control Measures</TableHead>
                  <TableHead className="w-[80px]">Residual Risk</TableHead>
                  <TableHead className="w-[120px]">Responsible</TableHead>
                  <TableHead className="w-[120px]">PPE Required</TableHead>
                  <TableHead className="w-[150px]">Australian Standards</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskAssessments.map((assessment) => (
                  <TableRow key={assessment.id} className="text-xs">
                    <TableCell>
                      <EditableCell
                        value={assessment.activity}
                        onSave={(value: string) => updateAssessment(assessment.id, 'activity', value)}
                        placeholder="Enter activity..."
                      />
                    </TableCell>
                    
                    <TableCell>
                      <EditableCell
                        value={assessment.hazards}
                        onSave={(value: string[]) => updateAssessment(assessment.id, 'hazards', value)}
                        multiSelect={true}
                        placeholder="Click to add hazards..."
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${getRiskColor(assessment.initialRiskScore)}`}></div>
                        <EditableCell
                          value={assessment.initialRiskScore}
                          onSave={(value: number) => updateAssessment(assessment.id, 'initialRiskScore', value)}
                          type="risk-score"
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <EditableCell
                        value={assessment.controlMeasures}
                        onSave={(value: string[]) => updateAssessment(assessment.id, 'controlMeasures', value)}
                        multiSelect={true}
                        placeholder="Click to add controls..."
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${getRiskColor(assessment.residualRiskScore)}`}></div>
                        <EditableCell
                          value={assessment.residualRiskScore}
                          onSave={(value: number) => updateAssessment(assessment.id, 'residualRiskScore', value)}
                          type="risk-score"
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <EditableCell
                        value={assessment.responsible}
                        onSave={(value: string) => updateAssessment(assessment.id, 'responsible', value)}
                        type="select"
                        options={RESPONSIBLE_PERSONS}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <EditableCell
                        value={assessment.ppe}
                        onSave={(value: string[]) => updateAssessment(assessment.id, 'ppe', value)}
                        multiSelect={true}
                        placeholder="Click to add PPE..."
                      />
                    </TableCell>
                    
                    <TableCell>
                      <EditableCell
                        value={assessment.legislation}
                        onSave={(value: string[]) => updateAssessment(assessment.id, 'legislation', value)}
                        type="select"
                        options={AUSTRALIAN_STANDARDS}
                        multiSelect={true}
                        placeholder="Select standards..."
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAssessment(assessment.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {riskAssessments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <p>No risk assessments yet. Select activities above or add custom rows.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {riskAssessments.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Total Risk Assessments: {riskAssessments.length}
              </span>
              <div className="flex gap-4">
                <span className="text-red-600">
                  High/Extreme: {riskAssessments.filter(r => r.initialRiskScore >= 10).length}
                </span>
                <span className="text-yellow-600">
                  Medium: {riskAssessments.filter(r => r.initialRiskScore >= 5 && r.initialRiskScore < 10).length}
                </span>
                <span className="text-green-600">
                  Low: {riskAssessments.filter(r => r.initialRiskScore < 5).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}