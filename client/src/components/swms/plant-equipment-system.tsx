import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wrench, Plus, Edit, Trash2, AlertTriangle, CheckCircle, Calendar, Shield, FileText } from "lucide-react";

interface PlantEquipment {
  id: string;
  name: string;
  type: 'Plant' | 'Equipment' | 'Tool' | 'Vehicle';
  category: string;
  model: string;
  serialNumber: string;
  certificationRequired: boolean;
  lastInspection: string;
  nextInspection: string;
  inspectionStatus: 'Current' | 'Due' | 'Overdue';
  operator: string;
  safetyRequirements: string[];
  documentation: string[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  maintenanceSchedule: string;
  notes: string;
}

interface PlantEquipmentSystemProps {
  plantEquipment: PlantEquipment[];
  onUpdate: (equipment: PlantEquipment[]) => void;
}

const EQUIPMENT_CATEGORIES = {
  'Plant': ['Excavator', 'Crane', 'Forklift', 'Bulldozer', 'Loader', 'Compactor'],
  'Equipment': ['Generator', 'Compressor', 'Welder', 'Concrete Mixer', 'Pump', 'Scaffolding'],
  'Tool': ['Power Tools', 'Hand Tools', 'Cutting Tools', 'Measuring Tools', 'Safety Equipment'],
  'Vehicle': ['Truck', 'Van', 'Utility Vehicle', 'Trailer', 'Mobile Crane']
};

const TRADE_SPECIFIC_EQUIPMENT = {
  'carpentry': ['Circular Saw', 'Nail Gun', 'Router', 'Planer', 'Table Saw', 'Scaffolding'],
  'electrical': ['Multimeter', 'Cable Puller', 'Conduit Bender', 'Wire Stripper', 'Test Equipment', 'Insulation Tester'],
  'plumbing': ['Pipe Cutter', 'Threading Machine', 'Drain Snake', 'Pressure Tester', 'Soldering Kit', 'Pipe Bender'],
  'concreting': ['Concrete Mixer', 'Vibrator', 'Screed', 'Float', 'Trowel', 'Pump'],
  'steel-fixing': ['Rebar Cutter', 'Rebar Bender', 'Tie Wire Tool', 'Crane', 'Welding Equipment'],
  'painting': ['Spray Gun', 'Compressor', 'Brushes', 'Rollers', 'Scaffolding', 'Ventilation Equipment'],
  'roofing': ['Safety Harness', 'Roof Ladder', 'Nail Gun', 'Sheet Metal Tools', 'Crane', 'Fall Protection'],
  'hvac': ['Pipe Cutter', 'Bender', 'Vacuum Pump', 'Manifold Gauges', 'Leak Detector', 'Brazing Kit'],
  'excavation': ['Excavator', 'Loader', 'Compactor', 'Surveying Equipment', 'Shoring Equipment'],
  'demolition': ['Demolition Hammer', 'Cutting Equipment', 'Crane', 'Protective Equipment', 'Dust Control']
};

const SAFETY_REQUIREMENTS = {
  'High': ['Pre-use inspection required', 'Certified operator only', 'Safety briefing mandatory', 'Emergency procedures in place'],
  'Critical': ['Daily inspection required', 'Licensed operator only', 'Supervisor approval required', 'Emergency response plan active']
};

export default function PlantEquipmentSystem({ plantEquipment, onUpdate }: PlantEquipmentSystemProps) {
  const [equipment, setEquipment] = useState<PlantEquipment[]>(plantEquipment || []);
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<PlantEquipment | null>(null);
  const [newEquipment, setNewEquipment] = useState<Partial<PlantEquipment>>({
    type: 'Equipment',
    category: '',
    certificationRequired: false,
    inspectionStatus: 'Current',
    safetyRequirements: [],
    documentation: [],
    riskLevel: 'Low'
  });

  useEffect(() => {
    setEquipment(plantEquipment || []);
  }, [plantEquipment]);

  useEffect(() => {
    if (JSON.stringify(equipment) !== JSON.stringify(plantEquipment)) {
      onUpdate(equipment);
    }
  }, [equipment]);

  const addEquipment = () => {
    if (!newEquipment.name || !newEquipment.type) return;

    const equipmentItem: PlantEquipment = {
      id: `eq-${Date.now()}`,
      name: newEquipment.name,
      type: newEquipment.type as PlantEquipment['type'],
      category: newEquipment.category || 'General',
      model: newEquipment.model || 'Standard',
      serialNumber: newEquipment.serialNumber || `SN-${Date.now()}`,
      certificationRequired: newEquipment.certificationRequired || false,
      lastInspection: newEquipment.lastInspection || new Date().toISOString().split('T')[0],
      nextInspection: newEquipment.nextInspection || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      inspectionStatus: newEquipment.inspectionStatus || 'Current',
      operator: newEquipment.operator || 'TBD',
      safetyRequirements: newEquipment.safetyRequirements || [],
      documentation: newEquipment.documentation || [],
      riskLevel: newEquipment.riskLevel || 'Low',
      maintenanceSchedule: newEquipment.maintenanceSchedule || 'Monthly',
      notes: newEquipment.notes || ''
    };

    const updatedEquipment = [...equipment, equipmentItem];
    setEquipment(updatedEquipment);
    setIsAddingEquipment(false);
    setNewEquipment({
      type: 'Equipment',
      category: '',
      certificationRequired: false,
      inspectionStatus: 'Current',
      safetyRequirements: [],
      documentation: [],
      riskLevel: 'Low'
    });
  };

  const deleteEquipment = (id: string) => {
    const updatedEquipment = equipment.filter(eq => eq.id !== id);
    setEquipment(updatedEquipment);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getInspectionColor = (status: string) => {
    switch (status) {
      case 'Current': return 'bg-green-100 text-green-800';
      case 'Due': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Plant & Equipment Register</h3>
            </div>
            <Button onClick={() => setIsAddingEquipment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Wrench className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{equipment.length}</div>
              <div className="text-sm text-blue-600">Total Equipment</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {equipment.filter(eq => eq.riskLevel === 'Critical' || eq.riskLevel === 'High').length}
              </div>
              <div className="text-sm text-red-600">High Risk Items</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Calendar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {equipment.filter(eq => eq.inspectionStatus === 'Due' || eq.inspectionStatus === 'Overdue').length}
              </div>
              <div className="text-sm text-yellow-600">Inspections Due</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {equipment.filter(eq => eq.certificationRequired).length}
              </div>
              <div className="text-sm text-green-600">Certification Required</div>
            </div>
          </div>

          {equipment.filter(eq => eq.inspectionStatus === 'Due' || eq.inspectionStatus === 'Overdue').length > 0 && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Inspection Alert:</strong> {equipment.filter(eq => eq.inspectionStatus === 'Due').length} items due for inspection, 
                {equipment.filter(eq => eq.inspectionStatus === 'Overdue').length} items overdue.
              </AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Equipment</th>
                  <th className="border border-gray-300 p-2 text-left">Model</th>
                  <th className="border border-gray-300 p-2 text-left">Serial Number</th>
                  <th className="border border-gray-300 p-2 text-center">Next Inspection Due</th>
                  <th className="border border-gray-300 p-2 text-center">Certification Required</th>
                  <th className="border border-gray-300 p-2 text-center">Risk Level</th>
                  <th className="border border-gray-300 p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">
                      <div className="font-medium">{item.name}</div>
                    </td>
                    <td className="border border-gray-300 p-2">{item.model || '-'}</td>
                    <td className="border border-gray-300 p-2">{item.serialNumber || '-'}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      {item.nextInspection ? new Date(item.nextInspection).toLocaleDateString() : '-'}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <Badge variant={item.certificationRequired ? "destructive" : "secondary"}>
                        {item.certificationRequired ? "Required" : "Not Required"}
                      </Badge>
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <Badge className={getRiskColor(item.riskLevel)}>
                        {item.riskLevel}
                      </Badge>
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEquipment(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteEquipment(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Equipment Dialog */}
      <Dialog open={isAddingEquipment} onOpenChange={setIsAddingEquipment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Plant & Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="equipment-name">Equipment Name</Label>
              <Input
                id="equipment-name"
                value={newEquipment.name || ''}
                onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                placeholder="Enter equipment name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipment-model">Model</Label>
                <Input
                  id="equipment-model"
                  value={newEquipment.model || ''}
                  onChange={(e) => setNewEquipment({...newEquipment, model: e.target.value})}
                  placeholder="Equipment model"
                />
              </div>
              <div>
                <Label htmlFor="equipment-serial">Serial Number</Label>
                <Input
                  id="equipment-serial"
                  value={newEquipment.serialNumber || ''}
                  onChange={(e) => setNewEquipment({...newEquipment, serialNumber: e.target.value})}
                  placeholder="Serial number"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="equipment-inspection">Next Inspection Due</Label>
                <Input
                  id="equipment-inspection"
                  type="date"
                  value={newEquipment.nextInspection || ''}
                  onChange={(e) => setNewEquipment({...newEquipment, nextInspection: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="equipment-certification">Certification Required</Label>
                <Select 
                  value={newEquipment.certificationRequired ? "true" : "false"}
                  onValueChange={(value) => setNewEquipment({...newEquipment, certificationRequired: value === "true"})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select certification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Not Required</SelectItem>
                    <SelectItem value="true">Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="equipment-risk">Risk Level</Label>
                <Select 
                  value={newEquipment.riskLevel} 
                  onValueChange={(value) => setNewEquipment({...newEquipment, riskLevel: value as PlantEquipment['riskLevel']})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="equipment-notes">Notes</Label>
              <Textarea
                id="equipment-notes"
                value={newEquipment.notes || ''}
                onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                placeholder="Additional notes and requirements"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingEquipment(false)}>
                Cancel
              </Button>
              <Button onClick={addEquipment}>
                Add Equipment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Equipment Dialog */}
      <Dialog open={!!editingEquipment} onOpenChange={(open) => !open && setEditingEquipment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plant & Equipment</DialogTitle>
          </DialogHeader>
          {editingEquipment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-equipment-name">Equipment Name</Label>
                <Input
                  id="edit-equipment-name"
                  value={editingEquipment.name || ''}
                  onChange={(e) => setEditingEquipment({...editingEquipment, name: e.target.value})}
                  placeholder="Enter equipment name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-equipment-model">Model</Label>
                  <Input
                    id="edit-equipment-model"
                    value={editingEquipment.model || ''}
                    onChange={(e) => setEditingEquipment({...editingEquipment, model: e.target.value})}
                    placeholder="Model number"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-equipment-serial">Serial Number</Label>
                  <Input
                    id="edit-equipment-serial"
                    value={editingEquipment.serialNumber || ''}
                    onChange={(e) => setEditingEquipment({...editingEquipment, serialNumber: e.target.value})}
                    placeholder="Serial number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-inspection-due">Next Inspection Due</Label>
                  <Input
                    id="edit-inspection-due"
                    type="date"
                    value={editingEquipment.nextInspection || ''}
                    onChange={(e) => setEditingEquipment({...editingEquipment, nextInspection: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-certification">Certification Required</Label>
                  <Select 
                    value={editingEquipment.certificationRequired ? "true" : "false"}
                    onValueChange={(value) => setEditingEquipment({...editingEquipment, certificationRequired: value === "true"})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select certification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Not Required</SelectItem>
                      <SelectItem value="true">Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-risk-level">Risk Level</Label>
                  <Select 
                    value={editingEquipment.riskLevel} 
                    onValueChange={(value) => setEditingEquipment({...editingEquipment, riskLevel: value as PlantEquipment['riskLevel']})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-equipment-notes">Notes</Label>
                <Textarea
                  id="edit-equipment-notes"
                  value={editingEquipment.notes || ''}
                  onChange={(e) => setEditingEquipment({...editingEquipment, notes: e.target.value})}
                  placeholder="Additional notes and requirements"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingEquipment(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  const updatedEquipment = equipment.map(item => 
                    item.id === editingEquipment.id ? editingEquipment : item
                  );
                  setEquipment(updatedEquipment);
                  setEditingEquipment(null);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}