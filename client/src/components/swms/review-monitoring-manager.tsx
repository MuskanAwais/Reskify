import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Eye, ClipboardCheck, Calendar } from "lucide-react";

interface ReviewMonitoringManagerProps {
  formData: any;
  onDataChange: (data: any) => void;
}

const REVIEW_FREQUENCIES = [
  "Daily",
  "Weekly", 
  "Monthly",
  "Before Each Phase",
  "After Incidents",
  "When Conditions Change",
  "As Required"
];

const MONITORING_TYPES = [
  "Safety Inspections",
  "Toolbox Talks",
  "Pre-start Briefings",
  "Compliance Audits",
  "Incident Reviews",
  "Risk Reassessments",
  "Document Updates"
];

export function ReviewMonitoringManager({ formData, onDataChange }: ReviewMonitoringManagerProps) {
  const [reviewProcesses, setReviewProcesses] = useState(formData.reviewProcess || []);
  const [monitoringReqs, setMonitoringReqs] = useState(formData.monitoringRequirements || []);

  const updateData = (updates: any) => {
    onDataChange({ ...formData, ...updates });
  };

  const addReviewProcess = () => {
    const newProcess = {
      type: "",
      frequency: "",
      responsiblePerson: "",
      criteria: "",
      documentation: "",
      updateTriggers: []
    };
    const updated = [...reviewProcesses, newProcess];
    setReviewProcesses(updated);
    updateData({ reviewProcess: updated });
  };

  const updateReviewProcess = (index: number, field: string, value: any) => {
    const updated = [...reviewProcesses];
    updated[index] = { ...updated[index], [field]: value };
    setReviewProcesses(updated);
    updateData({ reviewProcess: updated });
  };

  const removeReviewProcess = (index: number) => {
    const updated = reviewProcesses.filter((_: any, i: number) => i !== index);
    setReviewProcesses(updated);
    updateData({ reviewProcess: updated });
  };

  const addMonitoringRequirement = () => {
    const newMonitoring = {
      type: "",
      description: "",
      frequency: "",
      responsiblePerson: "",
      recordsRequired: "",
      complianceChecks: []
    };
    const updated = [...monitoringReqs, newMonitoring];
    setMonitoringReqs(updated);
    updateData({ monitoringRequirements: updated });
  };

  const updateMonitoringRequirement = (index: number, field: string, value: any) => {
    const updated = [...monitoringReqs];
    updated[index] = { ...updated[index], [field]: value };
    setMonitoringReqs(updated);
    updateData({ monitoringRequirements: updated });
  };

  const removeMonitoringRequirement = (index: number) => {
    const updated = monitoringReqs.filter((_: any, i: number) => i !== index);
    setMonitoringReqs(updated);
    updateData({ monitoringRequirements: updated });
  };

  const addUpdateTrigger = (processIndex: number) => {
    const updated = [...reviewProcesses];
    const triggers = updated[processIndex].updateTriggers || [];
    triggers.push("");
    updated[processIndex].updateTriggers = triggers;
    setReviewProcesses(updated);
    updateData({ reviewProcess: updated });
  };

  const updateTrigger = (processIndex: number, triggerIndex: number, value: string) => {
    const updated = [...reviewProcesses];
    updated[processIndex].updateTriggers[triggerIndex] = value;
    setReviewProcesses(updated);
    updateData({ reviewProcess: updated });
  };

  const removeTrigger = (processIndex: number, triggerIndex: number) => {
    const updated = [...reviewProcesses];
    updated[processIndex].updateTriggers = updated[processIndex].updateTriggers.filter((_: any, i: number) => i !== triggerIndex);
    setReviewProcesses(updated);
    updateData({ reviewProcess: updated });
  };

  const addComplianceCheck = (monitoringIndex: number) => {
    const updated = [...monitoringReqs];
    const checks = updated[monitoringIndex].complianceChecks || [];
    checks.push("");
    updated[monitoringIndex].complianceChecks = checks;
    setMonitoringReqs(updated);
    updateData({ monitoringRequirements: updated });
  };

  const updateComplianceCheck = (monitoringIndex: number, checkIndex: number, value: string) => {
    const updated = [...monitoringReqs];
    updated[monitoringIndex].complianceChecks[checkIndex] = value;
    setMonitoringReqs(updated);
    updateData({ monitoringRequirements: updated });
  };

  const removeComplianceCheck = (monitoringIndex: number, checkIndex: number) => {
    const updated = [...monitoringReqs];
    updated[monitoringIndex].complianceChecks = updated[monitoringIndex].complianceChecks.filter((_: any, i: number) => i !== checkIndex);
    setMonitoringReqs(updated);
    updateData({ monitoringRequirements: updated });
  };

  return (
    <div className="space-y-6">
      {/* 10. Review and Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Review and Monitoring Processes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mb-4">
              <Label className="text-base font-medium">Review Processes</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Define how and when this SWMS will be reviewed and updated
              </p>
            </div>

            {reviewProcesses.map((process: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Review Process {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeReviewProcess(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label>Review Type</Label>
                    <Select
                      value={process.type || ""}
                      onValueChange={(value) => updateReviewProcess(index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select review type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled Review</SelectItem>
                        <SelectItem value="incident-triggered">Incident Triggered</SelectItem>
                        <SelectItem value="change-triggered">Change Triggered</SelectItem>
                        <SelectItem value="audit">Compliance Audit</SelectItem>
                        <SelectItem value="annual">Annual Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Review Frequency</Label>
                    <Select
                      value={process.frequency || ""}
                      onValueChange={(value) => updateReviewProcess(index, "frequency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {REVIEW_FREQUENCIES.map((freq) => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Responsible Person</Label>
                    <Input
                      placeholder="Name and role of responsible person"
                      value={process.responsiblePerson || ""}
                      onChange={(e) => updateReviewProcess(index, "responsiblePerson", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Documentation Method</Label>
                    <Input
                      placeholder="How reviews will be documented"
                      value={process.documentation || ""}
                      onChange={(e) => updateReviewProcess(index, "documentation", e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <Label>Review Criteria</Label>
                  <Textarea
                    placeholder="What criteria will trigger a review or update"
                    value={process.criteria || ""}
                    onChange={(e) => updateReviewProcess(index, "criteria", e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Update Triggers</Label>
                  <div className="space-y-2 mt-2">
                    {(process.updateTriggers || []).map((trigger: string, triggerIndex: number) => (
                      <div key={triggerIndex} className="flex gap-2">
                        <Input
                          placeholder="e.g., New regulations, Incident occurrence, Equipment changes"
                          value={trigger}
                          onChange={(e) => updateTrigger(index, triggerIndex, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTrigger(index, triggerIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addUpdateTrigger(index)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Update Trigger
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addReviewProcess}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Review Process
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Monitoring Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mb-4">
              <Label className="text-base font-medium">Site Monitoring and Compliance Checks</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Define ongoing monitoring activities to ensure SWMS compliance
              </p>
            </div>

            {monitoringReqs.map((monitoring: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Monitoring Requirement {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMonitoringRequirement(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label>Monitoring Type</Label>
                    <Select
                      value={monitoring.type || ""}
                      onValueChange={(value) => updateMonitoringRequirement(index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select monitoring type" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONITORING_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={monitoring.frequency || ""}
                      onValueChange={(value) => updateMonitoringRequirement(index, "frequency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {REVIEW_FREQUENCIES.map((freq) => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Responsible Person</Label>
                    <Input
                      placeholder="Who will conduct this monitoring"
                      value={monitoring.responsiblePerson || ""}
                      onChange={(e) => updateMonitoringRequirement(index, "responsiblePerson", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Records Required</Label>
                    <Input
                      placeholder="What records must be kept"
                      value={monitoring.recordsRequired || ""}
                      onChange={(e) => updateMonitoringRequirement(index, "recordsRequired", e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Detailed description of monitoring activities"
                    value={monitoring.description || ""}
                    onChange={(e) => updateMonitoringRequirement(index, "description", e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Compliance Checks</Label>
                  <div className="space-y-2 mt-2">
                    {(monitoring.complianceChecks || []).map((check: string, checkIndex: number) => (
                      <div key={checkIndex} className="flex gap-2">
                        <Input
                          placeholder="e.g., Verify PPE usage, Check safety barriers, Review training records"
                          value={check}
                          onChange={(e) => updateComplianceCheck(index, checkIndex, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeComplianceCheck(index, checkIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addComplianceCheck(index)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Compliance Check
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addMonitoringRequirement}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Monitoring Requirement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Site Supervisor Sign-off */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Site Supervisor Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="supervisorSignOff">Site Supervisor Sign-off Process</Label>
            <Textarea
              id="supervisorSignOff"
              value={formData.supervisorSignOff || ""}
              onChange={(e) => updateData({ supervisorSignOff: e.target.value })}
              placeholder="Describe the process for site supervisor sign-off, including daily briefings and approvals"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="toolboxTalkRequirements">Toolbox Talks / Pre-start Briefings</Label>
            <Textarea
              id="toolboxTalkRequirements"
              value={formData.toolboxTalkRequirements || ""}
              onChange={(e) => updateData({ toolboxTalkRequirements: e.target.value })}
              placeholder="Requirements for toolbox talks and pre-start briefings, including frequency and content"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="communicationMethod">Communication Method</Label>
              <Input
                id="communicationMethod"
                value={formData.communicationMethod || ""}
                onChange={(e) => updateData({ communicationMethod: e.target.value })}
                placeholder="How information will be communicated to workers"
              />
            </div>
            <div>
              <Label htmlFor="recordKeeping">Record Keeping Requirements</Label>
              <Input
                id="recordKeeping"
                value={formData.recordKeeping || ""}
                onChange={(e) => updateData({ recordKeeping: e.target.value })}
                placeholder="How records will be maintained and stored"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}