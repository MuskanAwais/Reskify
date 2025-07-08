import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RiskBadgeNew } from "./RiskBadgeNew";
import { Plus, Trash2 } from "lucide-react";

interface WorkActivitiesPageProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

interface WorkActivity {
  id: string;
  name: string;
  hazards: string;
  controlMeasures: string;
  riskLevel: string;
  riskScore: number;
}

export default function WorkActivitiesPage({ formData, updateFormData }: WorkActivitiesPageProps) {
  const [newActivity, setNewActivity] = useState<Partial<WorkActivity>>({
    name: '',
    hazards: '',
    controlMeasures: '',
    riskLevel: 'medium',
    riskScore: 6
  });

  const addActivity = () => {
    if (!newActivity.name?.trim()) return;
    
    const activity: WorkActivity = {
      id: Date.now().toString(),
      name: newActivity.name,
      hazards: newActivity.hazards || '',
      controlMeasures: newActivity.controlMeasures || '',
      riskLevel: newActivity.riskLevel || 'medium',
      riskScore: newActivity.riskScore || 6
    };

    const updatedActivities = [...(formData.workActivities || []), activity];
    updateFormData({ workActivities: updatedActivities });
    
    setNewActivity({
      name: '',
      hazards: '',
      controlMeasures: '',
      riskLevel: 'medium',
      riskScore: 6
    });
  };

  const removeActivity = (id: string) => {
    const updatedActivities = formData.workActivities?.filter((activity: WorkActivity) => activity.id !== id) || [];
    updateFormData({ workActivities: updatedActivities });
  };

  const updateActivity = (id: string, field: string, value: any) => {
    const updatedActivities = formData.workActivities?.map((activity: WorkActivity) => 
      activity.id === id ? { ...activity, [field]: value } : activity
    ) || [];
    updateFormData({ workActivities: updatedActivities });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Work Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="activity-name">Activity Name</Label>
            <Input
              id="activity-name"
              value={newActivity.name || ''}
              onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
              placeholder="e.g., Concrete Pouring"
              className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
            />
          </div>
          
          <div>
            <Label htmlFor="activity-hazards">Hazards</Label>
            <Textarea
              id="activity-hazards"
              value={newActivity.hazards || ''}
              onChange={(e) => setNewActivity({ ...newActivity, hazards: e.target.value })}
              placeholder="Describe potential hazards..."
              className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
            />
          </div>
          
          <div>
            <Label htmlFor="activity-controls">Control Measures</Label>
            <Textarea
              id="activity-controls"
              value={newActivity.controlMeasures || ''}
              onChange={(e) => setNewActivity({ ...newActivity, controlMeasures: e.target.value })}
              placeholder="Describe control measures..."
              className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="risk-level">Risk Level</Label>
              <select
                id="risk-level"
                value={newActivity.riskLevel || 'medium'}
                onChange={(e) => setNewActivity({ ...newActivity, riskLevel: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-riskify-green focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="risk-score">Risk Score</Label>
              <Input
                id="risk-score"
                type="number"
                min="1"
                max="20"
                value={newActivity.riskScore || 6}
                onChange={(e) => setNewActivity({ ...newActivity, riskScore: parseInt(e.target.value) || 6 })}
                className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
              />
            </div>
          </div>
          
          <Button onClick={addActivity} className="bg-riskify-green hover:bg-riskify-green-dark text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </CardContent>
      </Card>

      {formData.workActivities && formData.workActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Work Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.workActivities.map((activity: WorkActivity) => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{activity.name}</h3>
                    <div className="flex items-center space-x-2">
                      <RiskBadgeNew level={activity.riskLevel} score={activity.riskScore} />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeActivity(activity.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Hazards</Label>
                      <Textarea
                        value={activity.hazards}
                        onChange={(e) => updateActivity(activity.id, 'hazards', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Control Measures</Label>
                      <Textarea
                        value={activity.controlMeasures}
                        onChange={(e) => updateActivity(activity.id, 'controlMeasures', e.target.value)}
                        className="mt-1"
                      />
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