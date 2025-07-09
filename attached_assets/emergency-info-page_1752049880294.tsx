import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { SwmsFormData, EmergencyContact } from "@/types/swms";

interface EmergencyInfoPageProps {
  formData: SwmsFormData;
  updateFormData: (updates: Partial<SwmsFormData>) => void;
}

export default function EmergencyInfoPage({ formData, updateFormData }: EmergencyInfoPageProps) {
  const addEmergencyContact = () => {
    const newContact: EmergencyContact = { name: "", phone: "" };
    updateFormData({
      emergencyContacts: [...formData.emergencyContacts, newContact]
    });
  };

  const removeEmergencyContact = (index: number) => {
    const newContacts = formData.emergencyContacts.filter((_, i) => i !== index);
    updateFormData({ emergencyContacts: newContacts });
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = formData.emergencyContacts.map((contact, i) => 
      i === index ? { ...contact, [field]: value } : contact
    );
    updateFormData({ emergencyContacts: newContacts });
  };

  return (
    <div className="space-y-6">
      {/* Emergency Contacts */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Emergency Contacts</h2>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addEmergencyContact}
            className="text-riskify-green border-riskify-green hover:bg-riskify-green hover:text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Contact
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.emergencyContacts.map((contact, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor={`contact-name-${index}`}>Contact Name</Label>
                <Input
                  id={`contact-name-${index}`}
                  value={contact.name}
                  onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                  placeholder="Emergency Contact Name"
                  className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`contact-phone-${index}`}>Phone Number</Label>
                <Input
                  id={`contact-phone-${index}`}
                  value={contact.phone}
                  onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                  placeholder="0499 999 999"
                  className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeEmergencyContact(index)}
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Response Procedures */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Response Procedures</h2>
        <div>
          <Label htmlFor="emergencyProcedures">Emergency Procedures</Label>
          <Textarea
            id="emergencyProcedures"
            rows={8}
            value={formData.emergencyProcedures}
            onChange={(e) => updateFormData({ emergencyProcedures: e.target.value })}
            placeholder="Enter emergency response procedures..."
            className="focus:ring-2 focus:ring-riskify-green focus:border-transparent resize-vertical"
          />
        </div>
      </div>

      {/* Monitoring & Review Requirements */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Monitoring & Review Requirements</h2>
        <div>
          <Label htmlFor="emergencyMonitoring">Monitoring Requirements</Label>
          <Textarea
            id="emergencyMonitoring"
            rows={6}
            value={formData.emergencyMonitoring}
            onChange={(e) => updateFormData({ emergencyMonitoring: e.target.value })}
            placeholder="Describe monitoring requirements, review schedules, compliance checks..."
            className="focus:ring-2 focus:ring-riskify-green focus:border-transparent resize-vertical"
          />
        </div>
      </div>
    </div>
  );
}
