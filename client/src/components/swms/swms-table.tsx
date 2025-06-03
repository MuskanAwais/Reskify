import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X, AlertTriangle, Shield } from "lucide-react";
import { useUser } from "@/App";

interface RiskAssessment {
  id: string;
  activity: string;
  hazards: string[];
  initialRiskScore: number;
  controlMeasures: string[];
  legislation: string[];
  residualRiskScore: number;
  responsible: string;
  isEditing?: boolean;
}

interface SwmsTableProps {
  formData: any;
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

const RISK_LEVELS = {
  1: { label: "Very Low", color: "bg-green-600", textColor: "text-white" },
  2: { label: "Low", color: "bg-green-500", textColor: "text-white" },
  3: { label: "Low", color: "bg-green-400", textColor: "text-gray-900" },
  4: { label: "Low", color: "bg-green-300", textColor: "text-gray-900" },
  5: { label: "Medium", color: "bg-yellow-300", textColor: "text-gray-900" },
  6: { label: "Medium", color: "bg-yellow-400", textColor: "text-gray-900" },
  7: { label: "Medium", color: "bg-yellow-500", textColor: "text-white" },
  8: { label: "Medium", color: "bg-orange-400", textColor: "text-white" },
  9: { label: "High", color: "bg-orange-500", textColor: "text-white" },
  10: { label: "High", color: "bg-orange-600", textColor: "text-white" },
  11: { label: "High", color: "bg-red-500", textColor: "text-white" },
  12: { label: "High", color: "bg-red-600", textColor: "text-white" },
  13: { label: "Severe", color: "bg-red-700", textColor: "text-white" },
  14: { label: "Severe", color: "bg-red-800", textColor: "text-white" },
  15: { label: "Severe", color: "bg-red-900", textColor: "text-white" },
  16: { label: "Severe", color: "bg-red-950", textColor: "text-white" },
};

export default function SwmsTable({ formData, onDataChange, readOnly = false }: SwmsTableProps) {
  const [editingRisk, setEditingRisk] = useState<string | null>(null);
  const [newRisk, setNewRisk] = useState<Partial<RiskAssessment>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const user = useUser();

  const riskAssessments: RiskAssessment[] = formData.riskAssessments || [];

  const addNewRisk = () => {
    if (!newRisk.activity || !newRisk.hazards?.length || !newRisk.controlMeasures?.length) return;

    const risk: RiskAssessment = {
      id: Date.now().toString(),
      activity: newRisk.activity || "",
      hazards: newRisk.hazards || [],
      initialRiskScore: newRisk.initialRiskScore || 8,
      controlMeasures: newRisk.controlMeasures || [],
      legislation: newRisk.legislation || [],
      residualRiskScore: newRisk.residualRiskScore || 4,
      responsible: newRisk.responsible || user?.username || "Site Supervisor"
    };

    const updatedRisks = [...riskAssessments, risk];
    onDataChange({
      ...formData,
      riskAssessments: updatedRisks
    });

    setNewRisk({});
    setIsAddingNew(false);
  };

  const updateRisk = (id: string, updates: Partial<RiskAssessment>) => {
    const updatedRisks = riskAssessments.map(risk => 
      risk.id === id ? { ...risk, ...updates } : risk
    );
    onDataChange({
      ...formData,
      riskAssessments: updatedRisks
    });
  };

  const deleteRisk = (id: string) => {
    const updatedRisks = riskAssessments.filter(risk => risk.id !== id);
    onDataChange({
      ...formData,
      riskAssessments: updatedRisks
    });
  };

  const getRiskBadge = (score: number) => {
    const risk = RISK_LEVELS[score as keyof typeof RISK_LEVELS] || RISK_LEVELS[8];
    return (
      <Badge className={`${risk.color} ${risk.textColor} font-medium`}>
        {score} {risk.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <Card className="border-2 border-blue-600">
        <CardHeader className="bg-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">SWMS Builder Pro</CardTitle>
              <p className="text-blue-100">Australian Construction Safety Documentation</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{user?.companyName || "Your Company"}</p>
              <p className="text-blue-200 text-sm">ABN: 123 456 789</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Project:</span>
              <p className="text-gray-700">{formData.projectLocation || "Not specified"}</p>
            </div>
            <div>
              <span className="font-medium">Trade Type:</span>
              <p className="text-gray-700">{formData.tradeType || "Not specified"}</p>
            </div>
            <div>
              <span className="font-medium">Document Title:</span>
              <p className="text-gray-700">{formData.title || "Untitled SWMS"}</p>
            </div>
            <div>
              <span className="font-medium">Date:</span>
              <p className="text-gray-700">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Risk Assessment and Control Measures
            </CardTitle>
            {!readOnly && (
              <Button
                onClick={() => setIsAddingNew(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Risk
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-semibold min-w-[150px]">
                    Activity / Item
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold min-w-[150px]">
                    Hazards / Risks
                  </th>
                  <th className="border border-gray-300 p-3 text-center font-semibold min-w-[100px]">
                    Initial Risk Score
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold min-w-[300px]">
                    Control Measures / Risk Treatment
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold min-w-[150px]">
                    Legislation, Codes of Practice, and Guidelines
                  </th>
                  <th className="border border-gray-300 p-3 text-center font-semibold min-w-[100px]">
                    Residual Risk Score
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold min-w-[120px]">
                    Responsible Person
                  </th>
                  {!readOnly && (
                    <th className="border border-gray-300 p-3 text-center font-semibold min-w-[100px]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {riskAssessments.map((risk) => (
                  <tr key={risk.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 align-top">
                      {editingRisk === risk.id ? (
                        <Input
                          value={risk.activity}
                          onChange={(e) => updateRisk(risk.id, { activity: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <div className="font-medium">{risk.activity}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 align-top">
                      {editingRisk === risk.id ? (
                        <Textarea
                          value={risk.hazards.join('\n')}
                          onChange={(e) => updateRisk(risk.id, { hazards: e.target.value.split('\n').filter(h => h.trim()) })}
                          className="w-full min-h-[80px]"
                          placeholder="Enter hazards (one per line)"
                        />
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          {risk.hazards.map((hazard, idx) => (
                            <li key={idx} className="text-sm">{hazard}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 align-top text-center">
                      {editingRisk === risk.id ? (
                        <Select
                          value={risk.initialRiskScore.toString()}
                          onValueChange={(value) => updateRisk(risk.id, { initialRiskScore: parseInt(value) })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(RISK_LEVELS).map(([score, level]) => (
                              <SelectItem key={score} value={score}>
                                {score} - {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        getRiskBadge(risk.initialRiskScore)
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 align-top">
                      {editingRisk === risk.id ? (
                        <Textarea
                          value={risk.controlMeasures.join('\n')}
                          onChange={(e) => updateRisk(risk.id, { controlMeasures: e.target.value.split('\n').filter(m => m.trim()) })}
                          className="w-full min-h-[120px]"
                          placeholder="Enter control measures (one per line)"
                        />
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          {risk.controlMeasures.map((measure, idx) => (
                            <li key={idx} className="text-sm">{measure}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 align-top">
                      {editingRisk === risk.id ? (
                        <Textarea
                          value={risk.legislation.join('\n')}
                          onChange={(e) => updateRisk(risk.id, { legislation: e.target.value.split('\n').filter(l => l.trim()) })}
                          className="w-full min-h-[80px]"
                          placeholder="Enter legislation/codes (one per line)"
                        />
                      ) : (
                        <ul className="space-y-1">
                          {risk.legislation.map((law, idx) => (
                            <li key={idx} className="text-sm text-blue-700 font-medium">{law}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 align-top text-center">
                      {editingRisk === risk.id ? (
                        <Select
                          value={risk.residualRiskScore.toString()}
                          onValueChange={(value) => updateRisk(risk.id, { residualRiskScore: parseInt(value) })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(RISK_LEVELS).map(([score, level]) => (
                              <SelectItem key={score} value={score}>
                                {score} - {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        getRiskBadge(risk.residualRiskScore)
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 align-top">
                      {editingRisk === risk.id ? (
                        <Input
                          value={risk.responsible}
                          onChange={(e) => updateRisk(risk.id, { responsible: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-sm font-medium">{risk.responsible}</div>
                      )}
                    </td>
                    {!readOnly && (
                      <td className="border border-gray-300 p-3 align-top">
                        <div className="flex gap-1">
                          {editingRisk === risk.id ? (
                            <>
                              <Button
                                onClick={() => setEditingRisk(null)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => setEditingRisk(null)}
                                variant="outline"
                                size="sm"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => setEditingRisk(risk.id)}
                                variant="outline"
                                size="sm"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => deleteRisk(risk.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {/* Add New Risk Row */}
                {isAddingNew && (
                  <tr className="bg-blue-50 border-2 border-blue-200">
                    <td className="border border-gray-300 p-3">
                      <Input
                        value={newRisk.activity || ""}
                        onChange={(e) => setNewRisk({ ...newRisk, activity: e.target.value })}
                        placeholder="Enter activity"
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 p-3">
                      <Textarea
                        value={newRisk.hazards?.join('\n') || ""}
                        onChange={(e) => setNewRisk({ ...newRisk, hazards: e.target.value.split('\n').filter(h => h.trim()) })}
                        placeholder="Enter hazards (one per line)"
                        className="w-full min-h-[80px]"
                      />
                    </td>
                    <td className="border border-gray-300 p-3">
                      <Select
                        value={newRisk.initialRiskScore?.toString() || "8"}
                        onValueChange={(value) => setNewRisk({ ...newRisk, initialRiskScore: parseInt(value) })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(RISK_LEVELS).map(([score, level]) => (
                            <SelectItem key={score} value={score}>
                              {score} - {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border border-gray-300 p-3">
                      <Textarea
                        value={newRisk.controlMeasures?.join('\n') || ""}
                        onChange={(e) => setNewRisk({ ...newRisk, controlMeasures: e.target.value.split('\n').filter(m => m.trim()) })}
                        placeholder="Enter control measures (one per line)"
                        className="w-full min-h-[120px]"
                      />
                    </td>
                    <td className="border border-gray-300 p-3">
                      <Textarea
                        value={newRisk.legislation?.join('\n') || ""}
                        onChange={(e) => setNewRisk({ ...newRisk, legislation: e.target.value.split('\n').filter(l => l.trim()) })}
                        placeholder="Enter legislation/codes (one per line)"
                        className="w-full min-h-[80px]"
                      />
                    </td>
                    <td className="border border-gray-300 p-3">
                      <Select
                        value={newRisk.residualRiskScore?.toString() || "4"}
                        onValueChange={(value) => setNewRisk({ ...newRisk, residualRiskScore: parseInt(value) })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(RISK_LEVELS).map(([score, level]) => (
                            <SelectItem key={score} value={score}>
                              {score} - {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border border-gray-300 p-3">
                      <Input
                        value={newRisk.responsible || user?.username || ""}
                        onChange={(e) => setNewRisk({ ...newRisk, responsible: e.target.value })}
                        placeholder="Responsible person"
                        className="w-full"
                      />
                    </td>
                    <td className="border border-gray-300 p-3">
                      <div className="flex gap-1">
                        <Button
                          onClick={addNewRisk}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => {
                            setIsAddingNew(false);
                            setNewRisk({});
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {riskAssessments.length === 0 && !isAddingNew && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p>No risk assessments added yet.</p>
              {!readOnly && (
                <p className="text-sm">Click "Add Risk" to get started with your safety documentation.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Matrix Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Matrix Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium mb-2">Very Low Risk (1-4)</h4>
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3, 4].map(score => (
                  <div key={score}>{getRiskBadge(score)}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Medium Risk (5-8)</h4>
              <div className="flex flex-wrap gap-1">
                {[5, 6, 7, 8].map(score => (
                  <div key={score}>{getRiskBadge(score)}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">High Risk (9-12)</h4>
              <div className="flex flex-wrap gap-1">
                {[9, 10, 11, 12].map(score => (
                  <div key={score}>{getRiskBadge(score)}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Severe Risk (13-16)</h4>
              <div className="flex flex-wrap gap-1">
                {[13, 14, 15, 16].map(score => (
                  <div key={score}>{getRiskBadge(score)}</div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}