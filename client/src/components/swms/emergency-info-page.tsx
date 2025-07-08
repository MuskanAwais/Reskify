import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmergencyInfoPageProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export default function EmergencyInfoPage({ formData, updateFormData }: EmergencyInfoPageProps) {
  const handleContactChange = (index: number, field: string, value: string) => {
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    updateFormData({ emergencyContacts: updatedContacts });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.emergencyContacts?.map((contact: any, index: number) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`contact-name-${index}`}>Contact Name</Label>
                <Input
                  id={`contact-name-${index}`}
                  value={contact.name}
                  onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                  className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                />
              </div>
              <div>
                <Label htmlFor={`contact-phone-${index}`}>Phone Number</Label>
                <Input
                  id={`contact-phone-${index}`}
                  value={contact.phone}
                  onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                  className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Procedures</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="emergencyProcedures">Emergency Procedures</Label>
            <Textarea
              id="emergencyProcedures"
              value={formData.emergencyProcedures}
              onChange={(e) => updateFormData({ emergencyProcedures: e.target.value })}
              className="focus:ring-2 focus:ring-riskify-green focus:border-transparent min-h-[150px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="emergencyMonitoring">Emergency Monitoring</Label>
            <Textarea
              id="emergencyMonitoring"
              value={formData.emergencyMonitoring}
              onChange={(e) => updateFormData({ emergencyMonitoring: e.target.value })}
              className="focus:ring-2 focus:ring-riskify-green focus:border-transparent min-h-[150px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}