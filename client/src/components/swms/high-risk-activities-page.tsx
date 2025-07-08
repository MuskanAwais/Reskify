import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface HighRiskActivitiesPageProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const HIGH_RISK_CATEGORIES = [
  { id: 'excavation', label: 'Excavation Work' },
  { id: 'confined-spaces', label: 'Confined Spaces' },
  { id: 'hot-work', label: 'Hot Work (Welding/Cutting)' },
  { id: 'working-at-height', label: 'Working at Height' },
  { id: 'electrical-work', label: 'Electrical Work' },
  { id: 'asbestos', label: 'Asbestos Related Work' },
  { id: 'demolition', label: 'Demolition Work' },
  { id: 'crane-lifting', label: 'Crane and Lifting Operations' }
];

export default function HighRiskActivitiesPage({ formData, updateFormData }: HighRiskActivitiesPageProps) {
  const handleActivityToggle = (activityId: string, checked: boolean) => {
    const currentActivities = formData.highRiskActivities || [];
    let updatedActivities;
    
    if (checked) {
      updatedActivities = [...currentActivities, activityId];
    } else {
      updatedActivities = currentActivities.filter((id: string) => id !== activityId);
    }
    
    updateFormData({ highRiskActivities: updatedActivities });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>High Risk Construction Work</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HIGH_RISK_CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={formData.highRiskActivities?.includes(category.id) || false}
                onCheckedChange={(checked) => handleActivityToggle(category.id, !!checked)}
              />
              <label
                htmlFor={category.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}