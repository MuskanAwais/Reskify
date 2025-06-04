import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Wrench, AlertTriangle, CheckCircle } from "lucide-react";

interface PlantEquipmentManagerProps {
  formData: any;
  onDataChange: (data: any) => void;
}

const EQUIPMENT_CATEGORIES = [
  "Hand Tools",
  "Power Tools",
  "Heavy Machinery",
  "Lifting Equipment",
  "Access Equipment",
  "Safety Equipment",
  "Measuring Equipment",
  "Cutting Equipment",
  "Welding Equipment",
  "Electrical Equipment"
];

const INSPECTION_FREQUENCIES = [
  "Daily",
  "Weekly", 
  "Monthly",
  "Before Each Use",
  "As Per Manufacturer",
  "Annually",
  "After Maintenance"
];

export function PlantEquipmentManager({ formData, onDataChange }: PlantEquipmentManagerProps) {
  const [equipment, setEquipment] = useState(formData.plantEquipment || []);
  const [trainingReqs, setTrainingReqs] = useState(formData.trainingRequirements || []);
  const [permits, setPermits] = useState(formData.permitsRequired || []);

  const updateData = (updates: any) => {
    onDataChange({ ...formData, ...updates });
  };

  const addEquipment = () => {
    const newEquipment = {
      name: "",
      category: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      inspectionRequired: false,
      inspectionFrequency: "",
      preStartChecks: [],
      manufacturerRecommendations: "",
      operatorRequirements: []
    };
    const updated = [...equipment, newEquipment];
    setEquipment(updated);
    updateData({ plantEquipment: updated });
  };

  const updateEquipment = (index: number, field: string, value: any) => {
    const updated = [...equipment];
    updated[index] = { ...updated[index], [field]: value };
    setEquipment(updated);
    updateData({ plantEquipment: updated });
  };

  const removeEquipment = (index: number) => {
    const updated = equipment.filter((_: any, i: number) => i !== index);
    setEquipment(updated);
    updateData({ plantEquipment: updated });
  };

  const addPreStartCheck = (equipmentIndex: number) => {
    const updated = [...equipment];
    const checks = updated[equipmentIndex].preStartChecks || [];
    checks.push("");
    updated[equipmentIndex].preStartChecks = checks;
    setEquipment(updated);
    updateData({ plantEquipment: updated });
  };

  const updatePreStartCheck = (equipmentIndex: number, checkIndex: number, value: string) => {
    const updated = [...equipment];
    updated[equipmentIndex].preStartChecks[checkIndex] = value;
    setEquipment(updated);
    updateData({ plantEquipment: updated });
  };

  const removePreStartCheck = (equipmentIndex: number, checkIndex: number) => {
    const updated = [...equipment];
    updated[equipmentIndex].preStartChecks = updated[equipmentIndex].preStartChecks.filter((_: any, i: number) => i !== checkIndex);
    setEquipment(updated);
    updateData({ plantEquipment: updated });
  };

  const addTrainingRequirement = () => {
    const newTraining = {
      type: "",
      description: "",
      competencyLevel: "",
      renewalPeriod: "",
      provider: "",
      mandatory: true
    };
    const updated = [...trainingReqs, newTraining];
    setTrainingReqs(updated);
    updateData({ trainingRequirements: updated });
  };

  const updateTrainingRequirement = (index: number, field: string, value: any) => {
    const updated = [...trainingReqs];
    updated[index] = { ...updated[index], [field]: value };
    setTrainingReqs(updated);
    updateData({ trainingRequirements: updated });
  };

  const removeTrainingRequirement = (index: number) => {
    const updated = trainingReqs.filter((_: any, i: number) => i !== index);
    setTrainingReqs(updated);
    updateData({ trainingRequirements: updated });
  };

  const addPermit = () => {
    const updated = [...permits, ""];
    setPermits(updated);
    updateData({ permitsRequired: updated });
  };

  const updatePermit = (index: number, value: string) => {
    const updated = [...permits];
    updated[index] = value;
    setPermits(updated);
    updateData({ permitsRequired: updated });
  };

  const removePermit = (index: number) => {
    const updated = permits.filter((_: any, i: number) => i !== index);
    setPermits(updated);
    updateData({ permitsRequired: updated });
  };

  return (
    <div className="space-y-6">
      {/* 6. Plant, Equipment and Materials Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Plant, Equipment and Materials Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {equipment.map((item: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Equipment {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEquipment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label>Equipment Name</Label>
                    <Input
                      placeholder="e.g., Angle Grinder, Excavator"
                      value={item.name || ""}
                      onChange={(e) => updateEquipment(index, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={item.category || ""}
                      onValueChange={(value) => updateEquipment(index, "category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EQUIPMENT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Manufacturer</Label>
                    <Input
                      placeholder="Equipment manufacturer"
                      value={item.manufacturer || ""}
                      onChange={(e) => updateEquipment(index, "manufacturer", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      placeholder="Model number"
                      value={item.model || ""}
                      onChange={(e) => updateEquipment(index, "model", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Serial Number</Label>
                    <Input
                      placeholder="Serial number"
                      value={item.serialNumber || ""}
                      onChange={(e) => updateEquipment(index, "serialNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Inspection Frequency</Label>
                    <Select
                      value={item.inspectionFrequency || ""}
                      onValueChange={(value) => updateEquipment(index, "inspectionFrequency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSPECTION_FREQUENCIES.map((freq) => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={item.inspectionRequired || false}
                      onCheckedChange={(checked) => updateEquipment(index, "inspectionRequired", checked)}
                    />
                    <Label>Requires pre-start inspection</Label>
                  </div>
                </div>

                {item.inspectionRequired && (
                  <div className="mb-3">
                    <Label>Pre-Start Inspection Checks</Label>
                    <div className="space-y-2 mt-2">
                      {(item.preStartChecks || []).map((check: string, checkIndex: number) => (
                        <div key={checkIndex} className="flex gap-2">
                          <Input
                            placeholder="e.g., Check power cord for damage"
                            value={check}
                            onChange={(e) => updatePreStartCheck(index, checkIndex, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePreStartCheck(index, checkIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPreStartCheck(index)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Check
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Manufacturer Recommendations</Label>
                  <Textarea
                    placeholder="Any specific manufacturer recommendations for safe operation"
                    value={item.manufacturerRecommendations || ""}
                    onChange={(e) => updateEquipment(index, "manufacturerRecommendations", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addEquipment}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 8. Training, Competency and Permits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Training, Competency and Permits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Training Requirements */}
          <div>
            <Label className="text-base font-medium">Training Requirements</Label>
            <div className="space-y-3 mt-2">
              {trainingReqs.map((training: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium">Training Requirement {index + 1}</h5>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTrainingRequirement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Training Type (e.g., White Card, High Risk License)"
                      value={training.type || ""}
                      onChange={(e) => updateTrainingRequirement(index, "type", e.target.value)}
                    />
                    <Input
                      placeholder="Competency Level Required"
                      value={training.competencyLevel || ""}
                      onChange={(e) => updateTrainingRequirement(index, "competencyLevel", e.target.value)}
                    />
                    <Input
                      placeholder="Training Provider"
                      value={training.provider || ""}
                      onChange={(e) => updateTrainingRequirement(index, "provider", e.target.value)}
                    />
                    <Input
                      placeholder="Renewal Period (e.g., 2 years)"
                      value={training.renewalPeriod || ""}
                      onChange={(e) => updateTrainingRequirement(index, "renewalPeriod", e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Training description and requirements"
                    value={training.description || ""}
                    onChange={(e) => updateTrainingRequirement(index, "description", e.target.value)}
                    rows={2}
                    className="mb-2"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={training.mandatory || false}
                      onCheckedChange={(checked) => updateTrainingRequirement(index, "mandatory", checked)}
                    />
                    <Label>Mandatory for this work</Label>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addTrainingRequirement}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Training Requirement
              </Button>
            </div>
          </div>

          {/* Permits Required */}
          <div>
            <Label className="text-base font-medium">Permits Required</Label>
            <div className="space-y-2 mt-2">
              {permits.map((permit: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Select
                    value={permit}
                    onValueChange={(value) => updatePermit(index, value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select permit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot-works">Hot Works Permit</SelectItem>
                      <SelectItem value="confined-space">Confined Space Entry Permit</SelectItem>
                      <SelectItem value="electrical-isolation">Electrical Isolation Permit</SelectItem>
                      <SelectItem value="excavation">Excavation Permit</SelectItem>
                      <SelectItem value="working-at-height">Working at Height Permit</SelectItem>
                      <SelectItem value="crane-operation">Crane Operation Permit</SelectItem>
                      <SelectItem value="road-closure">Road Closure Permit</SelectItem>
                      <SelectItem value="environmental">Environmental Permit</SelectItem>
                      <SelectItem value="noise">Noise Permit</SelectItem>
                      <SelectItem value="other">Other Permit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePermit(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addPermit}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Permit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}