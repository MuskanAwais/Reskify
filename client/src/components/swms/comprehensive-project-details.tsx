import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Building, FileText, Shield, AlertTriangle } from "lucide-react";

interface ComprehensiveProjectDetailsProps {
  formData: any;
  onDataChange: (data: any) => void;
}

const HIGH_RISK_ACTIVITIES = [
  "Work at heights above 2m",
  "Work near live electrical installations", 
  "Demolition or structural alterations",
  "Asbestos-related work",
  "Confined spaces",
  "Excavation work",
  "Tilt-up or precast concrete work",
  "Work involving dive operations",
  "Work involving the use of explosives",
  "Work involving pressure equipment",
  "Work on or near energized electrical installations",
  "Work involving structural steel erection",
  "Work involving timber framing",
  "Work in or adjacent to road or rail traffic",
  "Work involving the disturbance of contaminated soil",
  "Work involving live services",
  "Work involving crane operations",
  "Work involving powered mobile plant"
];

const WHS_REGULATIONS = [
  "WHS Regulation 291 - High Risk Construction Work",
  "WHS Regulation 213 - Falls from heights",
  "WHS Regulation 140 - Electrical safety",
  "WHS Regulation 420 - Asbestos",
  "WHS Regulation 80 - Confined spaces",
  "WHS Regulation 306 - Excavation",
  "WHS Regulation 347 - Demolition work"
];

export function ComprehensiveProjectDetails({ formData, onDataChange }: ComprehensiveProjectDetailsProps) {
  const [responsiblePersons, setResponsiblePersons] = useState(formData.responsiblePersons || []);
  const [emergencyContacts, setEmergencyContacts] = useState(formData.emergencyContacts || []);

  const updateData = (updates: any) => {
    onDataChange({ ...formData, ...updates });
  };

  const addResponsiblePerson = () => {
    const newPerson = { name: "", role: "", phone: "", email: "" };
    const updated = [...responsiblePersons, newPerson];
    setResponsiblePersons(updated);
    updateData({ responsiblePersons: updated });
  };

  const updateResponsiblePerson = (index: number, field: string, value: string) => {
    const updated = [...responsiblePersons];
    updated[index] = { ...updated[index], [field]: value };
    setResponsiblePersons(updated);
    updateData({ responsiblePersons: updated });
  };

  const removeResponsiblePerson = (index: number) => {
    const updated = responsiblePersons.filter((_, i) => i !== index);
    setResponsiblePersons(updated);
    updateData({ responsiblePersons: updated });
  };

  const addEmergencyContact = () => {
    const newContact = { type: "", name: "", phone: "", address: "" };
    const updated = [...emergencyContacts, newContact];
    setEmergencyContacts(updated);
    updateData({ emergencyContacts: updated });
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
    updateData({ emergencyContacts: updated });
  };

  const removeEmergencyContact = (index: number) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(updated);
    updateData({ emergencyContacts: updated });
  };

  return (
    <div className="space-y-6">
      {/* 1. Project and Document Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Project and Document Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobName">Project Name</Label>
              <Input
                id="jobName"
                value={formData.jobName || ""}
                onChange={(e) => updateData({ jobName: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div>
              <Label htmlFor="jobNumber">Job Number</Label>
              <Input
                id="jobNumber"
                value={formData.jobNumber || ""}
                onChange={(e) => updateData({ jobNumber: e.target.value })}
                placeholder="Enter job number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="projectDescription">Project Description</Label>
            <Textarea
              id="projectDescription"
              value={formData.projectDescription || ""}
              onChange={(e) => updateData({ projectDescription: e.target.value })}
              placeholder="Detailed description of the project and scope of work"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectAddress">Project Address</Label>
              <Input
                id="projectAddress"
                value={formData.projectAddress || ""}
                onChange={(e) => updateData({ projectAddress: e.target.value })}
                placeholder="Enter project address"
              />
            </div>
            <div>
              <Label htmlFor="projectLocation">Project Location</Label>
              <Input
                id="projectLocation"
                value={formData.projectLocation || ""}
                onChange={(e) => updateData({ projectLocation: e.target.value })}
                placeholder="Enter project location"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="principalContractor">Principal Contractor</Label>
              <Input
                id="principalContractor"
                value={formData.principalContractor || ""}
                onChange={(e) => updateData({ principalContractor: e.target.value })}
                placeholder="Enter principal contractor name"
              />
            </div>
            <div>
              <Label htmlFor="principalContractorAbn">Principal Contractor ABN</Label>
              <Input
                id="principalContractorAbn"
                value={formData.principalContractorAbn || ""}
                onChange={(e) => updateData({ principalContractorAbn: e.target.value })}
                placeholder="Enter ABN"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subcontractor">Subcontractor (if applicable)</Label>
              <Input
                id="subcontractor"
                value={formData.subcontractor || ""}
                onChange={(e) => updateData({ subcontractor: e.target.value })}
                placeholder="Enter subcontractor name"
              />
            </div>
            <div>
              <Label htmlFor="subcontractorAbn">Subcontractor ABN</Label>
              <Input
                id="subcontractorAbn"
                value={formData.subcontractorAbn || ""}
                onChange={(e) => updateData({ subcontractorAbn: e.target.value })}
                placeholder="Enter subcontractor ABN"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="licenseNumber">License Number (if applicable)</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber || ""}
                onChange={(e) => updateData({ licenseNumber: e.target.value })}
                placeholder="Enter license number"
              />
            </div>
            <div>
              <Label htmlFor="documentVersion">Document Version</Label>
              <Input
                id="documentVersion"
                value={formData.documentVersion || "1.0"}
                onChange={(e) => updateData({ documentVersion: e.target.value })}
                placeholder="1.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsible Persons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Persons Responsible for SWMS Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {responsiblePersons.map((person: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Responsible Person {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeResponsiblePerson(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Full Name"
                    value={person.name || ""}
                    onChange={(e) => updateResponsiblePerson(index, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Role/Position"
                    value={person.role || ""}
                    onChange={(e) => updateResponsiblePerson(index, "role", e.target.value)}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={person.phone || ""}
                    onChange={(e) => updateResponsiblePerson(index, "phone", e.target.value)}
                  />
                  <Input
                    placeholder="Email Address"
                    value={person.email || ""}
                    onChange={(e) => updateResponsiblePerson(index, "email", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addResponsiblePerson}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Responsible Person
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. High-Risk Construction Work (HRCW) Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            High-Risk Construction Work (HRCW) Identification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isHighRiskWork"
              checked={formData.isHighRiskWork || false}
              onCheckedChange={(checked) => updateData({ isHighRiskWork: checked })}
            />
            <Label htmlFor="isHighRiskWork">
              This work involves High-Risk Construction Work activities
            </Label>
          </div>

          {formData.isHighRiskWork && (
            <>
              <div>
                <Label>High-Risk Activities (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {HIGH_RISK_ACTIVITIES.map((activity) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox
                        id={activity}
                        checked={(formData.highRiskActivities || []).includes(activity)}
                        onCheckedChange={(checked) => {
                          const current = formData.highRiskActivities || [];
                          const updated = checked
                            ? [...current, activity]
                            : current.filter((a: string) => a !== activity);
                          updateData({ highRiskActivities: updated });
                        }}
                      />
                      <Label htmlFor={activity} className="text-sm">
                        {activity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Applicable WHS Regulations (Select all that apply)</Label>
                <div className="space-y-2 mt-2">
                  {WHS_REGULATIONS.map((regulation) => (
                    <div key={regulation} className="flex items-center space-x-2">
                      <Checkbox
                        id={regulation}
                        checked={(formData.whsRegulations || []).includes(regulation)}
                        onCheckedChange={(checked) => {
                          const current = formData.whsRegulations || [];
                          const updated = checked
                            ? [...current, regulation]
                            : current.filter((r: string) => r !== regulation);
                          updateData({ whsRegulations: updated });
                        }}
                      />
                      <Label htmlFor={regulation} className="text-sm">
                        {regulation}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="highRiskJustification">
                  Justification for High-Risk Classification
                </Label>
                <Textarea
                  id="highRiskJustification"
                  value={formData.highRiskJustification || ""}
                  onChange={(e) => updateData({ highRiskJustification: e.target.value })}
                  placeholder="Explain why this work is classified as high-risk and which specific regulations apply"
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 9. Emergency Procedures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Procedures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nearestHospital">Nearest Hospital</Label>
            <Input
              id="nearestHospital"
              value={formData.nearestHospital || ""}
              onChange={(e) => updateData({ nearestHospital: e.target.value })}
              placeholder="Enter nearest hospital name and address"
            />
          </div>

          <div>
            <Label htmlFor="firstAidArrangements">First Aid Arrangements</Label>
            <Textarea
              id="firstAidArrangements"
              value={formData.firstAidArrangements || ""}
              onChange={(e) => updateData({ firstAidArrangements: e.target.value })}
              placeholder="Describe first aid arrangements on site, qualified personnel, equipment location"
              rows={3}
            />
          </div>

          {/* Emergency Contacts */}
          <div>
            <Label>Emergency Contacts</Label>
            <div className="space-y-3 mt-2">
              {emergencyContacts.map((contact: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium">Emergency Contact {index + 1}</h5>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEmergencyContact(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Select
                      value={contact.type || ""}
                      onValueChange={(value) => updateEmergencyContact(index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Contact Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency Services</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="fire">Fire Department</SelectItem>
                        <SelectItem value="police">Police</SelectItem>
                        <SelectItem value="site">Site Emergency</SelectItem>
                        <SelectItem value="poison">Poison Control</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Contact Name"
                      value={contact.name || ""}
                      onChange={(e) => updateEmergencyContact(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Phone Number"
                      value={contact.phone || ""}
                      onChange={(e) => updateEmergencyContact(index, "phone", e.target.value)}
                    />
                    <Input
                      placeholder="Address (if applicable)"
                      value={contact.address || ""}
                      onChange={(e) => updateEmergencyContact(index, "address", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEmergencyContact}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Emergency Contact
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}