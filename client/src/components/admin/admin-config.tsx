import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function AdminConfig() {
  const { toast } = useToast();
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  const [adminDemoMode, setAdminDemoMode] = useState(false);

  useEffect(() => {
    // Check current admin status
    const adminStatus = localStorage.getItem('isAppAdmin') === 'true';
    const demoStatus = localStorage.getItem('adminDemoMode') === 'true';
    setIsAppAdmin(adminStatus);
    setAdminDemoMode(demoStatus);
  }, []);

  const toggleAdminStatus = () => {
    const newStatus = !isAppAdmin;
    setIsAppAdmin(newStatus);
    localStorage.setItem('isAppAdmin', newStatus.toString());
    
    if (!newStatus) {
      // If removing admin status, also disable demo mode
      setAdminDemoMode(false);
      localStorage.setItem('adminDemoMode', 'false');
    }
    
    toast({
      title: newStatus ? "Admin Access Enabled" : "Admin Access Disabled",
      description: newStatus 
        ? "You now have administrative access to the application" 
        : "Administrative features have been disabled",
    });
  };

  const toggleDemoMode = () => {
    if (!isAppAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to enable demo mode",
        variant: "destructive",
      });
      return;
    }
    
    const newStatus = !adminDemoMode;
    setAdminDemoMode(newStatus);
    localStorage.setItem('adminDemoMode', newStatus.toString());
    
    toast({
      title: newStatus ? "Demo Mode Enabled" : "Demo Mode Disabled",
      description: newStatus 
        ? "Payment steps will be bypassed for testing" 
        : "Normal payment flow restored",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Configuration
            {isAppAdmin && (
              <Badge variant="destructive" className="ml-2">
                ADMIN
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Admin Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <Label className="font-medium">App Administrator Access</Label>
                <p className="text-sm text-gray-600">
                  Enables administrative features and demo mode capabilities
                </p>
              </div>
            </div>
            <Switch
              checked={isAppAdmin}
              onCheckedChange={toggleAdminStatus}
            />
          </div>

          {/* Demo Mode Toggle */}
          <div className={`flex items-center justify-between p-4 border rounded-lg ${
            isAppAdmin ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${isAppAdmin ? 'text-amber-600' : 'text-gray-400'}`} />
              <div>
                <Label className={`font-medium ${!isAppAdmin ? 'text-gray-400' : ''}`}>
                  Demo Mode (Payment Bypass)
                </Label>
                <p className={`text-sm ${isAppAdmin ? 'text-gray-600' : 'text-gray-400'}`}>
                  Skips payment requirements for testing purposes
                </p>
              </div>
            </div>
            <Switch
              checked={adminDemoMode}
              onCheckedChange={toggleDemoMode}
              disabled={!isAppAdmin}
            />
          </div>

          {/* Status Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Current Status</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Admin Access: {isAppAdmin ? 'Enabled' : 'Disabled'}</li>
              <li>• Demo Mode: {adminDemoMode ? 'Active' : 'Inactive'}</li>
              <li>• Payment Bypass: {adminDemoMode ? 'Yes' : 'No'}</li>
            </ul>
          </div>

          {isAppAdmin && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Security Warning</span>
              </div>
              <p className="text-sm text-red-700">
                Admin access provides elevated privileges. Only enable this for authorized administrators. 
                Demo mode bypasses payment validation and should only be used for testing purposes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}