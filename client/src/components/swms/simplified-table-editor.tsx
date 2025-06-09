import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RiskAssessment {
  id: string;
  activity: string;
  description?: string;
  hazards: string[];
  initialRiskScore: number;
  controlMeasures: string[];
  residualRiskScore: number;
  responsible: string;
  ppe: string[];
  training: string[];
  legislation: string[];
}

interface SimplifiedTableEditorProps {
  riskAssessments: RiskAssessment[];
  onUpdate: (assessments: RiskAssessment[]) => void;
  tradeType: string;
}

export function SimplifiedTableEditor({ riskAssessments = [], onUpdate, tradeType }: SimplifiedTableEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAssessment, setNewAssessment] = useState<Partial<RiskAssessment>>({
    activity: '',
    hazards: [''],
    controlMeasures: [''],
    responsible: 'Site Supervisor',
    ppe: [''],
    training: [''],
    legislation: [''],
    initialRiskScore: 3,
    residualRiskScore: 2
  });

  const getRiskLevel = (score: number): { level: string; color: string } => {
    if (score <= 2) return { level: 'Low', color: 'bg-green-100 text-green-800' };
    if (score <= 3) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    if (score <= 4) return { level: 'High', color: 'bg-orange-100 text-orange-800' };
    return { level: 'Extreme', color: 'bg-red-100 text-red-800' };
  };

  const addNewRisk = () => {
    if (!newAssessment.activity?.trim()) return;
    
    const assessment: RiskAssessment = {
      id: `risk-${Date.now()}`,
      activity: newAssessment.activity,
      description: newAssessment.description || `${newAssessment.activity} work involving ${tradeType.toLowerCase()} trade activities`,
      hazards: newAssessment.hazards?.filter(h => h.trim()) || [],
      controlMeasures: newAssessment.controlMeasures?.filter(c => c.trim()) || [],
      responsible: newAssessment.responsible || 'Site Supervisor',
      ppe: newAssessment.ppe?.filter(p => p.trim()) || [],
      training: newAssessment.training?.filter(t => t.trim()) || [],
      legislation: newAssessment.legislation?.filter(l => l.trim()) || [],
      initialRiskScore: newAssessment.initialRiskScore || 3,
      residualRiskScore: newAssessment.residualRiskScore || 2
    };

    onUpdate([...riskAssessments, assessment]);
    setNewAssessment({
      activity: '',
      hazards: [''],
      controlMeasures: [''],
      responsible: 'Site Supervisor',
      ppe: [''],
      training: [''],
      legislation: [''],
      initialRiskScore: 3,
      residualRiskScore: 2
    });
  };

  const updateAssessment = (id: string, updates: Partial<RiskAssessment>) => {
    onUpdate(riskAssessments.map(assessment => 
      assessment.id === id ? { ...assessment, ...updates } : assessment
    ));
  };

  const removeAssessment = (id: string) => {
    onUpdate(riskAssessments.filter(assessment => assessment.id !== id));
  };

  const addArrayItem = (array: string[], setArray: (items: string[]) => void) => {
    setArray([...array, '']);
  };

  const updateArrayItem = (array: string[], index: number, value: string, setArray: (items: string[]) => void) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };

  const removeArrayItem = (array: string[], index: number, setArray: (items: string[]) => void) => {
    setArray(array.filter((_, i) => i !== index));
  };

  const ArrayEditor = ({ 
    items, 
    setItems, 
    placeholder, 
    type = 'input' 
  }: { 
    items: string[]; 
    setItems: (items: string[]) => void; 
    placeholder: string; 
    type?: 'input' | 'textarea';
  }) => (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          {type === 'textarea' ? (
            <Textarea
              value={item}
              onChange={(e) => updateArrayItem(items, index, e.target.value, setItems)}
              placeholder={placeholder}
              className="flex-1 min-h-[60px]"
            />
          ) : (
            <Input
              value={item}
              onChange={(e) => updateArrayItem(items, index, e.target.value, setItems)}
              placeholder={placeholder}
              className="flex-1"
            />
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem(items, index, setItems)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove item</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItems([...items, ''])}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {placeholder}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new {placeholder.toLowerCase()}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Risk Assessment Matrix Overview */}
      {riskAssessments.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment Matrix ({riskAssessments.length} assessments)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {riskAssessments.map((assessment) => {
                const initialRisk = getRiskLevel(assessment.initialRiskScore);
                const residualRisk = getRiskLevel(assessment.residualRiskScore);
                
                return (
                  <div key={assessment.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{assessment.activity}</h4>
                        <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge className={`${initialRisk.color} text-xs`}>
                          Initial: {initialRisk.level}
                        </Badge>
                        <Badge className={`${residualRisk.color} text-xs`}>
                          Residual: {residualRisk.level}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-red-700">Hazards:</span>
                        <ul className="list-disc list-inside text-gray-700 mt-1">
                          {assessment.hazards.map((hazard, idx) => (
                            <li key={idx}>{hazard}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">Control Measures:</span>
                        <ul className="list-disc list-inside text-gray-700 mt-1">
                          {assessment.controlMeasures.map((measure, idx) => (
                            <li key={idx}>{measure}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">
                        <strong>Responsible:</strong> {assessment.responsible}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(editingId === assessment.id ? null : assessment.id)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const updated = riskAssessments.filter(r => r.id !== assessment.id);
                            onUpdate(updated);
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Activity Name</label>
              <Input
                value={newAssessment.activity || ''}
                onChange={(e) => setNewAssessment({ ...newAssessment, activity: e.target.value })}
                placeholder="e.g., Power point installation"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Responsible Person</label>
              <Input
                value={newAssessment.responsible || ''}
                onChange={(e) => setNewAssessment({ ...newAssessment, responsible: e.target.value })}
                placeholder="Site Supervisor"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Activity Description</label>
            <Textarea
              value={newAssessment.description || ''}
              onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
              placeholder="Detailed description of the activity and work involved"
              className="min-h-[80px] w-full"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Hazards</label>
              <ArrayEditor
                items={newAssessment.hazards || ['']}
                setItems={(items) => setNewAssessment({ ...newAssessment, hazards: items })}
                placeholder="e.g., Electrocution from live circuits"
                type="textarea"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Control Measures</label>
              <ArrayEditor
                items={newAssessment.controlMeasures || ['']}
                setItems={(items) => setNewAssessment({ ...newAssessment, controlMeasures: items })}
                placeholder="e.g., Isolate power and test circuits dead"
                type="textarea"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">PPE Required</label>
              <ArrayEditor
                items={newAssessment.ppe || ['']}
                setItems={(items) => setNewAssessment({ ...newAssessment, ppe: items })}
                placeholder="e.g., Insulated gloves"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Training Required</label>
              <ArrayEditor
                items={newAssessment.training || ['']}
                setItems={(items) => setNewAssessment({ ...newAssessment, training: items })}
                placeholder="e.g., Electrical license"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Legislation</label>
              <ArrayEditor
                items={newAssessment.legislation || ['']}
                setItems={(items) => setNewAssessment({ ...newAssessment, legislation: items })}
                placeholder="e.g., AS/NZS 3000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Initial Risk Score (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={newAssessment.initialRiskScore || 3}
                onChange={(e) => setNewAssessment({ ...newAssessment, initialRiskScore: parseInt(e.target.value) || 3 })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Residual Risk Score (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={newAssessment.residualRiskScore || 2}
                onChange={(e) => setNewAssessment({ ...newAssessment, residualRiskScore: parseInt(e.target.value) || 2 })}
                className="w-full"
              />
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={addNewRisk} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Risk Assessment
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add this risk assessment to the SWMS</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Existing Risk Assessments */}
      <div className="space-y-4">
        {riskAssessments.map((assessment) => {
          const initialRisk = getRiskLevel(assessment.initialRiskScore);
          const residualRisk = getRiskLevel(assessment.residualRiskScore);
          
          return (
            <Card key={assessment.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{assessment.activity}</CardTitle>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(editingId === assessment.id ? null : assessment.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit risk assessment</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAssessment(assessment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove risk assessment</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                {assessment.description && (
                  <p className="text-sm text-muted-foreground">{assessment.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge className={initialRisk.color}>
                      Initial Risk: {initialRisk.level} ({assessment.initialRiskScore})
                    </Badge>
                    <span>→</span>
                    <Badge className={residualRisk.color}>
                      Residual Risk: {residualRisk.level} ({assessment.residualRiskScore})
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Responsible: {assessment.responsible}
                  </div>
                </div>

                {editingId !== assessment.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Hazards
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {(assessment.hazards || []).map((hazard, index) => (
                          <li key={index}>{hazard}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Control Measures
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {(assessment.controlMeasures || []).map((control, index) => (
                          <li key={index}>{control}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Hazards</label>
                        <ArrayEditor
                          items={assessment.hazards || ['']}
                          setItems={(items) => updateAssessment(assessment.id, { hazards: items })}
                          placeholder="Hazard description"
                          type="textarea"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Control Measures</label>
                        <ArrayEditor
                          items={assessment.controlMeasures || ['']}
                          setItems={(items) => updateAssessment(assessment.id, { controlMeasures: items })}
                          placeholder="Control measure description"
                          type="textarea"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button"
                              size="sm" 
                              onClick={() => {
                                // Force save by triggering update
                                onUpdate([...riskAssessments]);
                                setEditingId(null);
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Save changes</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Cancel editing</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}

                {assessment.ppe.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">PPE Required</h4>
                    <div className="flex flex-wrap gap-1">
                      {assessment.ppe.map((ppe, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {ppe}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {riskAssessments.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Risk Assessments</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first risk assessment above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}