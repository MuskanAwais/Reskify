import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Edit3, 
  FileText, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Shield, 
  Wrench,
  Phone,
  CheckCircle
} from "lucide-react";

interface EmbeddedPDFEditorProps {
  formData: any;
  onDataChange: (updatedData: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function EmbeddedPDFEditor({ 
  formData, 
  onDataChange, 
  onNext, 
  onBack 
}: EmbeddedPDFEditorProps) {
  const [editableData, setEditableData] = useState({
    // Project Details
    projectName: formData.jobName || '',
    projectNumber: formData.jobNumber || '',
    projectAddress: formData.projectAddress || formData.projectLocation || '',
    principalContractor: formData.principalContractor || '',
    projectManager: formData.projectManager || '',
    siteSupervisor: formData.siteSupervisor || '',
    swmsCreator: formData.swmsCreatorName || '',
    creatorPosition: formData.swmsCreatorPosition || '',
    
    // Work Activities
    activities: formData.activities || formData.selectedTasks || [],
    
    // Plant & Equipment
    plantEquipment: formData.plantEquipment || [],
    
    // PPE Requirements
    ppeRequirements: formData.ppeRequirements || [],
    
    // Emergency Procedures
    emergencyProcedures: formData.emergencyProcedures || [],
    
    // Additional fields for customization
    documentVersion: '1.0',
    documentDate: new Date().toLocaleDateString('en-AU'),
    reviewDate: '',
    additionalNotes: ''
  });

  const updateField = (section: string, field: string, value: any) => {
    setEditableData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateDirectField = (field: string, value: any) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addActivity = () => {
    const newActivity = {
      name: 'New Work Activity',
      description: 'Enter activity description',
      hazards: [{ description: 'Identify hazards', riskRating: 'Medium' }],
      controlMeasures: ['Enter control measures'],
      riskScore: 6,
      residualRisk: 3,
      ppe: [],
      legislation: 'NSW WHS Regulation 2017'
    };
    
    setEditableData(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity]
    }));
  };

  const removeActivity = (index: number) => {
    setEditableData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  const updateActivity = (index: number, field: string, value: any) => {
    setEditableData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const addEquipment = () => {
    const newEquipment = {
      name: 'Equipment Item',
      type: 'Equipment',
      riskLevel: 'Medium',
      certificationRequired: false,
      inspectionStatus: 'Current'
    };
    
    setEditableData(prev => ({
      ...prev,
      plantEquipment: [...prev.plantEquipment, newEquipment]
    }));
  };

  const removeEquipment = (index: number) => {
    setEditableData(prev => ({
      ...prev,
      plantEquipment: prev.plantEquipment.filter((_, i) => i !== index)
    }));
  };

  const handleSaveAndContinue = () => {
    // Update the main form data with all editable changes
    onDataChange({
      ...formData,
      ...editableData,
      jobName: editableData.projectName,
      jobNumber: editableData.projectNumber,
      projectAddress: editableData.projectAddress,
      principalContractor: editableData.principalContractor,
      projectManager: editableData.projectManager,
      siteSupervisor: editableData.siteSupervisor,
      swmsCreatorName: editableData.swmsCreator,
      swmsCreatorPosition: editableData.creatorPosition,
      activities: editableData.activities,
      plantEquipment: editableData.plantEquipment,
      ppeRequirements: editableData.ppeRequirements,
      emergencyProcedures: editableData.emergencyProcedures
    });
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            PDF Template Editor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and edit your SWMS document template. All fields are pre-populated from your builder data but can be customized before final PDF generation.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={editableData.projectName}
                onChange={(e) => updateDirectField('projectName', e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <Label htmlFor="projectNumber">Project Number</Label>
              <Input
                id="projectNumber"
                value={editableData.projectNumber}
                onChange={(e) => updateDirectField('projectNumber', e.target.value)}
                placeholder="Enter project number"
              />
            </div>
            
            <div>
              <Label htmlFor="projectAddress">Project Address</Label>
              <Textarea
                id="projectAddress"
                value={editableData.projectAddress}
                onChange={(e) => updateDirectField('projectAddress', e.target.value)}
                placeholder="Enter project address"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="principalContractor">Principal Contractor</Label>
              <Input
                id="principalContractor"
                value={editableData.principalContractor}
                onChange={(e) => updateDirectField('principalContractor', e.target.value)}
                placeholder="Enter principal contractor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectManager">Project Manager</Label>
                <Input
                  id="projectManager"
                  value={editableData.projectManager}
                  onChange={(e) => updateDirectField('projectManager', e.target.value)}
                  placeholder="Project manager"
                />
              </div>
              
              <div>
                <Label htmlFor="siteSupervisor">Site Supervisor</Label>
                <Input
                  id="siteSupervisor"
                  value={editableData.siteSupervisor}
                  onChange={(e) => updateDirectField('siteSupervisor', e.target.value)}
                  placeholder="Site supervisor"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="swmsCreator">SWMS Creator</Label>
                <Input
                  id="swmsCreator"
                  value={editableData.swmsCreator}
                  onChange={(e) => updateDirectField('swmsCreator', e.target.value)}
                  placeholder="Creator name"
                />
              </div>
              
              <div>
                <Label htmlFor="creatorPosition">Creator Position</Label>
                <Input
                  id="creatorPosition"
                  value={editableData.creatorPosition}
                  onChange={(e) => updateDirectField('creatorPosition', e.target.value)}
                  placeholder="Creator position"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documentVersion">Document Version</Label>
                <Input
                  id="documentVersion"
                  value={editableData.documentVersion}
                  onChange={(e) => updateDirectField('documentVersion', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="documentDate">Document Date</Label>
                <Input
                  id="documentDate"
                  value={editableData.documentDate}
                  onChange={(e) => updateDirectField('documentDate', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="reviewDate">Next Review Date</Label>
              <Input
                id="reviewDate"
                type="date"
                value={editableData.reviewDate}
                onChange={(e) => updateDirectField('reviewDate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={editableData.additionalNotes}
                onChange={(e) => updateDirectField('additionalNotes', e.target.value)}
                placeholder="Add any additional notes or requirements"
                rows={4}
              />
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Document Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Activities: {editableData.activities.length}</div>
                <div>Equipment Items: {editableData.plantEquipment.length}</div>
                <div>PPE Requirements: {editableData.ppeRequirements.length}</div>
                <div>Emergency Procedures: {editableData.emergencyProcedures.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Activities Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Work Activities & Risk Assessment
          </CardTitle>
          <Button onClick={addActivity} size="sm" className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {editableData.activities.map((activity, index) => (
                <Card key={index} className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label>Activity Name</Label>
                          <Input
                            value={activity.name || activity.task || ''}
                            onChange={(e) => updateActivity(index, 'name', e.target.value)}
                            placeholder="Activity name"
                          />
                        </div>
                        
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={activity.description || ''}
                            onChange={(e) => updateActivity(index, 'description', e.target.value)}
                            placeholder="Activity description"
                            rows={2}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Risk Score (Initial)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="25"
                              value={activity.riskScore || 6}
                              onChange={(e) => updateActivity(index, 'riskScore', parseInt(e.target.value))}
                            />
                          </div>
                          
                          <div>
                            <Label>Residual Risk</Label>
                            <Input
                              type="number"
                              min="1"
                              max="25"
                              value={activity.residualRisk || 3}
                              onChange={(e) => updateActivity(index, 'residualRisk', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeActivity(index)}
                        className="ml-4 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Plant & Equipment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Plant & Equipment Register
          </CardTitle>
          <Button onClick={addEquipment} size="sm" className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {editableData.plantEquipment.map((equipment, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <Label>Equipment Name</Label>
                    <Input
                      value={equipment.name || equipment.equipment || ''}
                      onChange={(e) => {
                        const updated = [...editableData.plantEquipment];
                        updated[index] = { ...updated[index], name: e.target.value };
                        updateDirectField('plantEquipment', updated);
                      }}
                      placeholder="Equipment name"
                    />
                  </div>
                  
                  <div>
                    <Label>Type</Label>
                    <Input
                      value={equipment.type || 'Equipment'}
                      onChange={(e) => {
                        const updated = [...editableData.plantEquipment];
                        updated[index] = { ...updated[index], type: e.target.value };
                        updateDirectField('plantEquipment', updated);
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label>Risk Level</Label>
                    <select
                      value={equipment.riskLevel || 'Medium'}
                      onChange={(e) => {
                        const updated = [...editableData.plantEquipment];
                        updated[index] = { ...updated[index], riskLevel: e.target.value };
                        updateDirectField('plantEquipment', updated);
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeEquipment(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        
        <Button onClick={handleSaveAndContinue} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Save Template & Continue
        </Button>
      </div>
    </div>
  );
}