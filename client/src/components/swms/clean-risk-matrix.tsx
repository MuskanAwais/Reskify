import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, X } from "lucide-react";

interface RiskAssessment {
  id: string;
  activity: string;
  description: string;
  hazards: string[];
  controlMeasures: string[];
  ppeRequired: string[];
  trainingRequired: string[];
  legislation: string[];
  initialRisk: number;
  residualRisk: number;
  responsiblePerson: string;
}

interface CleanRiskMatrixProps {
  riskAssessments: RiskAssessment[];
  onUpdate: (assessments: RiskAssessment[]) => void;
  tradeType: string;
}

export default function CleanRiskMatrix({ riskAssessments, onUpdate, tradeType }: CleanRiskMatrixProps) {
  const [newAssessment, setNewAssessment] = useState<Partial<RiskAssessment>>({
    activity: '',
    description: '',
    hazards: [],
    controlMeasures: [],
    ppeRequired: [],
    trainingRequired: [],
    legislation: [],
    initialRisk: 3,
    residualRisk: 2,
    responsiblePerson: 'Site Supervisor'
  });
  
  const [newHazard, setNewHazard] = useState('');
  const [newControlMeasure, setNewControlMeasure] = useState('');
  const [newPPE, setNewPPE] = useState('');
  const [newTraining, setNewTraining] = useState('');
  const [newLegislation, setNewLegislation] = useState('');

  const addListItem = (field: keyof RiskAssessment, value: string, setter: (val: string) => void) => {
    if (!value.trim()) return;
    
    const currentItems = (newAssessment[field] as string[]) || [];
    setNewAssessment({
      ...newAssessment,
      [field]: [...currentItems, value.trim()]
    });
    setter('');
  };

  const removeListItem = (field: keyof RiskAssessment, index: number) => {
    const currentItems = (newAssessment[field] as string[]) || [];
    setNewAssessment({
      ...newAssessment,
      [field]: currentItems.filter((_, i) => i !== index)
    });
  };

  const addRiskAssessment = () => {
    if (!newAssessment.activity?.trim() || !newAssessment.description?.trim()) return;

    const assessment: RiskAssessment = {
      id: Date.now().toString(),
      activity: newAssessment.activity,
      description: newAssessment.description,
      hazards: newAssessment.hazards || [],
      controlMeasures: newAssessment.controlMeasures || [],
      ppeRequired: newAssessment.ppeRequired || [],
      trainingRequired: newAssessment.trainingRequired || [],
      legislation: newAssessment.legislation || [],
      initialRisk: newAssessment.initialRisk || 3,
      residualRisk: newAssessment.residualRisk || 2,
      responsiblePerson: newAssessment.responsiblePerson || 'Site Supervisor'
    };

    onUpdate([...riskAssessments, assessment]);
    
    // Reset form
    setNewAssessment({
      activity: '',
      description: '',
      hazards: [],
      controlMeasures: [],
      ppeRequired: [],
      trainingRequired: [],
      legislation: [],
      initialRisk: 3,
      residualRisk: 2,
      responsiblePerson: 'Site Supervisor'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">Risk Assessment Matrix</CardTitle>
          <p className="text-sm text-gray-500">Add detailed risk assessments for your custom tasks</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Add New Risk Assessment Header */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-primary" />
                Add New Risk Assessment
              </h3>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activity">Activity Name</Label>
                <Input
                  id="activity"
                  value={newAssessment.activity || ''}
                  onChange={(e) => setNewAssessment({ ...newAssessment, activity: e.target.value })}
                  placeholder="e.g., Power point installation"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="responsible">Responsible Person</Label>
                <Input
                  id="responsible"
                  value={newAssessment.responsiblePerson || ''}
                  onChange={(e) => setNewAssessment({ ...newAssessment, responsiblePerson: e.target.value })}
                  placeholder="Site Supervisor"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Activity Description */}
            <div>
              <Label htmlFor="description">Activity Description</Label>
              <Textarea
                id="description"
                value={newAssessment.description || ''}
                onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                placeholder="Detailed description of the activity and work involved"
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Hazards and Control Measures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hazards */}
              <div>
                <Label>Hazards</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newHazard}
                      onChange={(e) => setNewHazard(e.target.value)}
                      placeholder="e.g., Electrocution from live circuits"
                      onKeyPress={(e) => e.key === 'Enter' && addListItem('hazards', newHazard, setNewHazard)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addListItem('hazards', newHazard, setNewHazard)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(newAssessment.hazards || []).map((hazard, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1">
                        {hazard}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeListItem('hazards', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Control Measures */}
              <div>
                <Label>Control Measures</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newControlMeasure}
                      onChange={(e) => setNewControlMeasure(e.target.value)}
                      placeholder="e.g., Isolate power and test circuits dead"
                      onKeyPress={(e) => e.key === 'Enter' && addListItem('controlMeasures', newControlMeasure, setNewControlMeasure)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addListItem('controlMeasures', newControlMeasure, setNewControlMeasure)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(newAssessment.controlMeasures || []).map((measure, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {measure}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeListItem('controlMeasures', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PPE, Training, Legislation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PPE Required */}
              <div>
                <Label>PPE Required</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newPPE}
                      onChange={(e) => setNewPPE(e.target.value)}
                      placeholder="e.g., Insulated gloves"
                      onKeyPress={(e) => e.key === 'Enter' && addListItem('ppeRequired', newPPE, setNewPPE)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addListItem('ppeRequired', newPPE, setNewPPE)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(newAssessment.ppeRequired || []).map((ppe, index) => (
                      <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                        {ppe}
                        <X 
                          className="h-2 w-2 cursor-pointer" 
                          onClick={() => removeListItem('ppeRequired', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Training Required */}
              <div>
                <Label>Training Required</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTraining}
                      onChange={(e) => setNewTraining(e.target.value)}
                      placeholder="e.g., Electrical license"
                      onKeyPress={(e) => e.key === 'Enter' && addListItem('trainingRequired', newTraining, setNewTraining)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addListItem('trainingRequired', newTraining, setNewTraining)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(newAssessment.trainingRequired || []).map((training, index) => (
                      <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                        {training}
                        <X 
                          className="h-2 w-2 cursor-pointer" 
                          onClick={() => removeListItem('trainingRequired', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legislation */}
              <div>
                <Label>Legislation</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newLegislation}
                      onChange={(e) => setNewLegislation(e.target.value)}
                      placeholder="e.g., AS/NZS 3000"
                      onKeyPress={(e) => e.key === 'Enter' && addListItem('legislation', newLegislation, setNewLegislation)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addListItem('legislation', newLegislation, setNewLegislation)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(newAssessment.legislation || []).map((leg, index) => (
                      <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                        {leg}
                        <X 
                          className="h-2 w-2 cursor-pointer" 
                          onClick={() => removeListItem('legislation', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initialRisk">Initial Risk Score (1-5)</Label>
                <Select 
                  value={newAssessment.initialRisk?.toString() || '3'} 
                  onValueChange={(value) => setNewAssessment({ ...newAssessment, initialRisk: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Low</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="residualRisk">Residual Risk Score (1-5)</Label>
                <Select 
                  value={newAssessment.residualRisk?.toString() || '2'} 
                  onValueChange={(value) => setNewAssessment({ ...newAssessment, residualRisk: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Low</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Button */}
            <div className="pt-4 border-t">
              <Button 
                onClick={addRiskAssessment}
                disabled={!newAssessment.activity?.trim() || !newAssessment.description?.trim()}
                className="w-full bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Risk Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Risk Assessments */}
      {riskAssessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Added Risk Assessments ({riskAssessments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskAssessments.map((assessment, index) => (
                <div key={assessment.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{assessment.activity}</h4>
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
                  <p className="text-sm text-gray-600 mb-3">{assessment.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Hazards:</span> {assessment.hazards.length}
                    </div>
                    <div>
                      <span className="font-medium">Controls:</span> {assessment.controlMeasures.length}
                    </div>
                    <div>
                      <span className="font-medium">Initial Risk:</span> {assessment.initialRisk}
                    </div>
                    <div>
                      <span className="font-medium">Residual Risk:</span> {assessment.residualRisk}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}