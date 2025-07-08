import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface PpePageProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const PPE_ITEMS = [
  { id: 'hard-hat', label: 'Hard Hat' },
  { id: 'safety-glasses', label: 'Safety Glasses' },
  { id: 'hearing-protection', label: 'Hearing Protection' },
  { id: 'high-vis-vest', label: 'High Visibility Vest' },
  { id: 'safety-boots', label: 'Safety Boots' },
  { id: 'gloves', label: 'Gloves' },
  { id: 'respirator', label: 'Respirator' },
  { id: 'fall-arrest', label: 'Fall Arrest Harness' },
  { id: 'face-shield', label: 'Face Shield' },
  { id: 'protective-clothing', label: 'Protective Clothing' }
];

export default function PpePage({ formData, updateFormData }: PpePageProps) {
  const handlePpeToggle = (ppeId: string, checked: boolean) => {
    const currentPpe = formData.ppeRequirements || [];
    let updatedPpe;
    
    if (checked) {
      updatedPpe = [...currentPpe, ppeId];
    } else {
      updatedPpe = currentPpe.filter((id: string) => id !== ppeId);
    }
    
    updateFormData({ ppeRequirements: updatedPpe });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Protective Equipment (PPE)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PPE_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={formData.ppeRequirements?.includes(item.id) || false}
                onCheckedChange={(checked) => handlePpeToggle(item.id, !!checked)}
              />
              <label
                htmlFor={item.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}