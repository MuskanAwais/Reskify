import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/App";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Building, Phone, Mail, Copyright, Save, AlertCircle } from "lucide-react";

export default function Profile() {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    companyName: user?.companyName || "",
    abn: "",
    phone: "",
    address: "",
    primaryTrade: user?.primaryTrade || "",
    licenseNumber: ""
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: trades } = useQuery({
    queryKey: ["/api/trades"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/users/${user?.id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      username: userData?.username || "",
      email: userData?.email || "",
      companyName: userData?.companyName || "",
      abn: userData?.abn || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
      primaryTrade: userData?.primaryTrade || "",
      licenseNumber: userData?.licenseNumber || ""
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentUserData = userData || user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Profile Management</h2>
          <p className="text-gray-600">Manage your account information and trade credentials</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Full Name</Label>
                <Input
                  id="username"
                  value={isEditing ? formData.username : currentUserData?.username || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? formData.email : currentUserData?.email || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={isEditing ? formData.phone : currentUserData?.phone || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="+61 XXX XXX XXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={isEditing ? formData.address : currentUserData?.address || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Enter your business address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company & Trade Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Company & Trade Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={isEditing ? formData.companyName : currentUserData?.companyName || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Enter your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abn">Australian Business Number (ABN)</Label>
                <Input
                  id="abn"
                  value={isEditing ? formData.abn : currentUserData?.abn || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, abn: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="XX XXX XXX XXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryTrade">Primary Trade</Label>
                {isEditing ? (
                  <Select 
                    value={formData.primaryTrade} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, primaryTrade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary trade" />
                    </SelectTrigger>
                    <SelectContent>
                      {trades?.map((trade: any) => (
                        <SelectItem key={trade.name} value={trade.name}>
                          {trade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={currentUserData?.primaryTrade || ""}
                      disabled
                    />
                    <Badge variant="secondary">{currentUserData?.primaryTrade}</Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Trade License Number</Label>
                <div className="relative">
                  <Copyright className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="licenseNumber"
                    value={isEditing ? formData.licenseNumber : currentUserData?.licenseNumber || "N/A"}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="N/A - Trade license number not applicable"
                  />
                </div>
              </div>

              {!isEditing && !currentUserData?.licenseNumber && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Trade license number: N/A</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <Card>
            <CardContent className="pt-6">
              <Separator className="mb-6" />
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={updateUserMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
