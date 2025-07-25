import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserCheck, UserX, Crown, Settings, Mail, Phone, MapPin, Building, Search, Filter, Key, Shield, CreditCard } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newCredits, setNewCredits] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/admin/contacts'],
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: number, password: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/password`, { password });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setNewPassword("");
      toast({
        title: "Password Reset",
        description: "User password has been reset successfully.",
      });
    },
  });

  const updateCreditsMutation = useMutation({
    mutationFn: async ({ userId, credits }: { userId: number, credits: number }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/credits`, { credits });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setNewCredits("");
      toast({
        title: "Credits Updated",
        description: "User credits have been updated successfully.",
      });
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number, isAdmin: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/admin`, { isAdmin });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Admin Status Updated",
        description: "User admin permissions have been updated successfully.",
      });
    },
  });

  const handleResetPassword = (userId: number) => {
    if (newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate({ userId, password: newPassword });
  };

  const handleUpdateCredits = (userId: number) => {
    const credits = parseInt(newCredits);
    if (isNaN(credits) || credits < 0) {
      toast({
        title: "Invalid Credits",
        description: "Credits must be a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    updateCreditsMutation.mutate({ userId, credits });
  };

  const handleToggleAdmin = (userId: number, currentStatus: boolean) => {
    updateAdminMutation.mutate({ userId, isAdmin: !currentStatus });
  };

  if (usersLoading || contactsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Helper function to determine user plan
  const getUserPlan = (user: any) => {
    if (user.subscriptionStatus === 'active') {
      return user.subscriptionType === 'enterprise' ? 'Enterprise' : 'Pro Subscription';
    }
    if (user.swmsCredits && user.swmsCredits > 0) {
      return 'Credits';
    }
    return 'No Plan';
  };

  // Helper function to format last active
  const formatLastActive = (lastActiveAt: string | null) => {
    if (!lastActiveAt) return 'Never';
    const date = new Date(lastActiveAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredUsers = (users as any[]).filter((user: any) =>
    (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (planFilter === "all" || getUserPlan(user).toLowerCase().includes(planFilter.toLowerCase()))
  );

  const filteredContacts = (contacts as any[]).filter((contact: any) =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User & Contact Management</h1>
          <p className="text-gray-600">Manage user accounts, permissions, and contact database</p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users, contacts, emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Basic">Basic Plan</SelectItem>
                <SelectItem value="Pro">Pro Plan</SelectItem>
                <SelectItem value="Enterprise">Enterprise Plan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contacts ({filteredContacts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-left p-3 font-medium">Company</th>
                      <th className="text-left p-3 font-medium">Plan</th>
                      <th className="text-left p-3 font-medium">SWMS Count</th>
                      <th className="text-left p-3 font-medium">Last Active</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {user.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.username}
                                {user.isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
                              </div>
                              <div className="text-gray-500 text-xs">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">{user.companyName || 'N/A'}</td>
                        <td className="p-3">
                          <Badge variant={
                            getUserPlan(user) === 'Pro Subscription' ? 'default' : 
                            getUserPlan(user) === 'Enterprise' ? 'secondary' :
                            getUserPlan(user) === 'Credits' ? 'outline' : 'destructive'
                          }>
                            {getUserPlan(user)}
                          </Badge>
                        </td>
                        <td className="p-3 font-medium">{user.swmsGenerated || 0}</td>
                        <td className="p-3 text-gray-600">{formatLastActive(user.lastActiveAt)}</td>
                        <td className="p-3">
                          <Dialog open={manageDialogOpen && selectedUser?.id === user.id} onOpenChange={setManageDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                Manage
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Manage User: {user.username}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* Reset Password */}
                                <div className="space-y-2">
                                  <Label htmlFor="password">Reset Password</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      id="password"
                                      type="password"
                                      placeholder="New password"
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <Button 
                                      onClick={() => resetPasswordMutation.mutate({ userId: user.id, password: newPassword })}
                                      disabled={!newPassword || resetPasswordMutation.isPending}
                                      size="sm"
                                    >
                                      <Key className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Admin Status */}
                                <div className="space-y-2">
                                  <Label>Admin Permissions</Label>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant={user.isAdmin ? "default" : "outline"}
                                      onClick={() => updateAdminMutation.mutate({ userId: user.id, isAdmin: !user.isAdmin })}
                                      disabled={updateAdminMutation.isPending}
                                      size="sm"
                                    >
                                      <Shield className="w-4 h-4 mr-1" />
                                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                    </Button>
                                  </div>
                                </div>

                                {/* Credits Management */}
                                <div className="space-y-2">
                                  <Label htmlFor="credits">SWMS Credits ({user.swmsCredits || 0} current)</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      id="credits"
                                      type="number"
                                      placeholder="New credit amount"
                                      value={newCredits}
                                      onChange={(e) => setNewCredits(e.target.value)}
                                    />
                                    <Button 
                                      onClick={() => updateCreditsMutation.mutate({ userId: user.id, credits: parseInt(newCredits) })}
                                      disabled={!newCredits || updateCreditsMutation.isPending}
                                      size="sm"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contact Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Contact</th>
                      <th className="text-left p-3 font-medium">Company</th>
                      <th className="text-left p-3 font-medium">Phone</th>
                      <th className="text-left p-3 font-medium">Location</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact: any) => (
                      <tr key={contact.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">
                                {contact.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-gray-500 text-xs">{contact.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">{contact.company}</td>
                        <td className="p-3 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {contact.location}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{contact.type}</Badge>
                        </td>
                        <td className="p-3">
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}