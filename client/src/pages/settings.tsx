import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Download, 
  Database,
  Palette,
  Globe,
  Save,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/App";

export default function Settings() {
  const { toast } = useToast();
  const user = useUser();
  const [settings, setSettings] = useState({
    // User Profile Settings
    companyName: user?.user?.companyName || "ABC Construction",
    companyABN: "12 345 678 901",
    primaryTrade: user?.user?.primaryTrade || "Electrical",
    email: user?.user?.email || "john.doe@example.com",
    phone: "+61 400 123 456",
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    dailyReports: true,
    complianceAlerts: true,
    
    // SWMS Settings
    autoSaveEnabled: true,
    requireApproval: false,
    includePhotos: true,
    
    // Display Settings
    theme: "light",
    language: "en-AU",
    timezone: "Australia/Sydney",
    dateFormat: "DD/MM/YYYY"
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Your SWMS data export is being prepared.",
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <SettingsIcon className="h-8 w-8 text-primary/600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Company Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => handleSettingChange("companyName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="companyABN">ABN</Label>
                <Input
                  id="companyABN"
                  value={settings.companyABN}
                  onChange={(e) => handleSettingChange("companyABN", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="primaryTrade">Primary Trade</Label>
                <Select value={settings.primaryTrade} onValueChange={(value) => handleSettingChange("primaryTrade", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Carpentry">Carpentry</SelectItem>
                    <SelectItem value="Roofing">Roofing</SelectItem>
                    <SelectItem value="Concrete">Concrete</SelectItem>
                    <SelectItem value="Demolition">Demolition</SelectItem>
                    <SelectItem value="Excavation">Excavation</SelectItem>
                    <SelectItem value="Painting">Painting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange("phone", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={saveSettings} className="w-full bg-primary/600 hover:bg-primary/700">
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </Button>
            <Button onClick={exportData} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export SWMS Data
            </Button>
            <Button variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Import Company Logo
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <p className="text-sm text-gray-500">Receive urgent alerts via SMS</p>
              </div>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dailyReports">Daily Reports</Label>
                <p className="text-sm text-gray-500">Daily summary emails</p>
              </div>
              <Switch
                id="dailyReports"
                checked={settings.dailyReports}
                onCheckedChange={(checked) => handleSettingChange("dailyReports", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="complianceAlerts">Compliance Alerts</Label>
                <p className="text-sm text-gray-500">Safety compliance reminders</p>
              </div>
              <Switch
                id="complianceAlerts"
                checked={settings.complianceAlerts}
                onCheckedChange={(checked) => handleSettingChange("complianceAlerts", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SWMS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              SWMS Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSaveEnabled">Auto-Save</Label>
                <p className="text-sm text-gray-500">Automatically save drafts</p>
              </div>
              <Switch
                id="autoSaveEnabled"
                checked={settings.autoSaveEnabled}
                onCheckedChange={(checked) => handleSettingChange("autoSaveEnabled", checked)}
              />
            </div>
            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireApproval">Require Approval</Label>
                <p className="text-sm text-gray-500">SWMS requires supervisor approval</p>
              </div>
              <Switch
                id="requireApproval"
                checked={settings.requireApproval}
                onCheckedChange={(checked) => handleSettingChange("requireApproval", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includePhotos">Include Photos</Label>
                <p className="text-sm text-gray-500">Add photos to SWMS documents</p>
              </div>
              <Switch
                id="includePhotos"
                checked={settings.includePhotos}
                onCheckedChange={(checked) => handleSettingChange("includePhotos", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Display & Language
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-AU">English (Australia)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-UK">English (UK)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                  <SelectItem value="Australia/Melbourne">Melbourne</SelectItem>
                  <SelectItem value="Australia/Perth">Perth</SelectItem>
                  <SelectItem value="Australia/Brisbane">Brisbane</SelectItem>
                  <SelectItem value="Australia/Adelaide">Adelaide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange("dateFormat", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary/600">10,000+</p>
                <p className="text-sm text-gray-600">Construction Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">500+</p>
                <p className="text-sm text-gray-600">Australian Standards</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">8</p>
                <p className="text-sm text-gray-600">Major Trades</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">99.9%</p>
                <p className="text-sm text-gray-600">Compliance Rate</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Version 2.1.0</Badge>
              <Badge variant="outline">Database Updated</Badge>
              <Badge variant="outline">AU Compliant</Badge>
              <Badge variant="outline">Professional Edition</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}