import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Briefcase, 
  CheckSquare, 
  AlertTriangle, 
  Shield, 
  FileText,
  Plus,
  X
} from "lucide-react";

interface SwmsFormProps {
  step: number;
  data: any;
  onDataChange: (data: any) => void;
}

export default function SwmsForm({ step, data, onDataChange }: SwmsFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(data);

  const { data: trades } = useQuery({
    queryKey: ["/api/trades"],
  });

  const { data: safetyLibrary } = useQuery({
    queryKey: ["/api/safety-library"],
  });

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const updateFormData = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const addArrayItem = (field: string, item: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), item]
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const selectedTrade = trades?.find((trade: any) => trade.name === formData.tradeType);

  switch (step) {
    case 1:
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                SWMS Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="e.g., Electrical Installation - Office Building"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeType" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                Trade Type
              </Label>
              <Select value={formData.tradeType} onValueChange={(value) => updateFormData({ tradeType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your trade" />
                </SelectTrigger>
                <SelectContent>
                  {trades?.map((trade: any) => (
                    <SelectItem key={trade.name} value={trade.name}>
                      {trade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectLocation" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Project Location
            </Label>
            <Input
              id="projectLocation"
              value={formData.projectLocation}
              onChange={(e) => updateFormData({ projectLocation: e.target.value })}
              placeholder="Enter the complete project address"
            />
          </div>

          {selectedTrade && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Activities for {selectedTrade.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTrade.activities.map((activity: string) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox
                        id={activity}
                        checked={formData.activities.includes(activity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            addArrayItem('activities', activity);
                          } else {
                            const index = formData.activities.indexOf(activity);
                            if (index > -1) removeArrayItem('activities', index);
                          }
                        }}
                      />
                      <Label htmlFor={activity} className="text-sm">
                        {activity}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="mr-2 h-5 w-5" />
                Selected Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.activities.length === 0 ? (
                <p className="text-gray-500 text-sm">No activities selected. Please go back and select activities.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.activities.map((activity: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center">
                      {activity}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-4 w-4 p-0"
                        onClick={() => removeArrayItem('activities', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Identify Additional Hazards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {formData.hazards.map((hazard: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={hazard}
                      onChange={(e) => {
                        const newHazards = [...formData.hazards];
                        newHazards[index] = e.target.value;
                        updateFormData({ hazards: newHazards });
                      }}
                      placeholder="Describe the hazard"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('hazards', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => addArrayItem('hazards', '')}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Hazard
              </Button>
            </CardContent>
          </Card>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[...formData.activities, ...formData.hazards.filter((h: string) => h.trim())].map((item: string, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-gray-800">{item}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Risk Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="extreme">Extreme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Control Measures</Label>
                      <Textarea
                        placeholder="Describe control measures"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Responsible Person</Label>
                      <Input placeholder="Role/Position" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applicable Safety Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTrade && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Recommended for {selectedTrade.name}</h4>
                  <div className="space-y-3">
                    {selectedTrade.codes.map((code: string) => {
                      const safetyItem = safetyLibrary?.find((item: any) => item.code === code);
                      return (
                        <div key={code} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={formData.complianceCodes.includes(code)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                addArrayItem('complianceCodes', code);
                              } else {
                                const index = formData.complianceCodes.indexOf(code);
                                if (index > -1) removeArrayItem('complianceCodes', index);
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{code}</p>
                            {safetyItem && (
                              <p className="text-xs text-gray-600">{safetyItem.title}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Your SWMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Project Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Title:</strong> {formData.title}</p>
                    <p><strong>Trade:</strong> {formData.tradeType}</p>
                    <p><strong>Location:</strong> {formData.projectLocation}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Activities</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.activities.map((activity: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Compliance Codes</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.complianceCodes.map((code: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    default:
      return <div>Invalid step</div>;
  }
}
