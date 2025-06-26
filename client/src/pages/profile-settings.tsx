import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, User, Building, Phone, Mail, MapPin, FileText, Camera, Save } from "lucide-react";

const tradeOptions = [
  "General Construction",
  "Electrical",
  "Plumbing", 
  "Carpentry",
  "Roofing",
  "Excavation",
  "Concreting",
  "Painting",
  "Tiling",
  "Glazing",
  "HVAC",
  "Scaffolding",
  "Demolition",
  "Landscaping",
  "Other"
];

export default function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    abn: "",
    address: "",
    primaryTrade: "",
    licenseNumber: "",
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['/api/user/settings'],
    enabled: !!user,
  });

  // Update form data when user settings are loaded
  useEffect(() => {
    if (userSettings) {
      setFormData({
        name: userSettings.name || "",
        email: userSettings.email || "",
        phone: userSettings.phone || "",
        companyName: userSettings.companyName || "",
        abn: userSettings.abn || "",
        address: userSettings.address || "",
        primaryTrade: userSettings.primaryTrade || "",
        licenseNumber: userSettings.licenseNumber || "",
      });
      if (userSettings.companyLogo) {
        setLogoPreview(userSettings.companyLogo);
      }
    }
  }, [userSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/user/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Settings Updated",
        description: "Your profile settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch('/api/user/logo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setLogoPreview(data.logoUrl);
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      toast({
        title: "Logo Uploaded",
        description: "Your company logo has been uploaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo. Please ensure the file is less than 5MB.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Logo file must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (PNG, JPG, GIF).",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleUploadLogo = () => {
    if (logoFile) {
      uploadLogoMutation.mutate(logoFile);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Logo Upload */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Company Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              {logoPreview ? (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={logoPreview} 
                    alt="Company Logo" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No logo uploaded</p>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Logo
              </Button>
              
              {logoFile && (
                <Button
                  onClick={handleUploadLogo}
                  disabled={uploadLogoMutation.isPending}
                  className="w-full"
                >
                  {uploadLogoMutation.isPending ? "Uploading..." : "Upload Logo"}
                </Button>
              )}
              
              <p className="text-xs text-gray-500 text-center">
                Upload your company logo (max 5MB).<br />
                This logo will appear on all your SWMS documents.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="04xxxxxxxx"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primaryTrade">Primary Trade</Label>
                <Select value={formData.primaryTrade} onValueChange={(value) => handleInputChange('primaryTrade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {tradeOptions.map((trade) => (
                      <SelectItem key={trade} value={trade}>
                        {trade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="abn">ABN</Label>
                <Input
                  id="abn"
                  value={formData.abn}
                  onChange={(e) => handleInputChange('abn', e.target.value)}
                  placeholder="Enter ABN"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  placeholder="Enter license number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          size="lg"
          className="px-8"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}