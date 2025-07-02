import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  CreditCard, 
  Edit, 
  Key, 
  Plus, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  Settings
} from "lucide-react";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subscriptionType: string;
  swmsCredits: number;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalSwms: number;
  status: 'active' | 'inactive' | 'suspended';
}

export default function AllContacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [addingCredits, setAddingCredits] = useState<User | null>(null);
  const [resettingPassword, setResettingPassword] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all users
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });
  
  const users = usersResponse?.users || [];

  // Get unique companies
  const companies = [...new Set(users.map((user: User) => user.company).filter(Boolean))].sort();

  // Filter users
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === "all" || user.company === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  // Group users by company
  const usersByCompany = filteredUsers.reduce((acc: Record<string, User[]>, user: User) => {
    const company = user.company || "No Company";
    if (!acc[company]) acc[company] = [];
    acc[company].push(user);
    return acc;
  }, {});

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userData.id}`, userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const addCreditsMutation = useMutation({
    mutationFn: async ({ userId, credits }: { userId: number; credits: number }) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/credits`, { credits });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Credits added successfully" });
      setAddingCredits(null);
      setCreditAmount("");
    },
    onError: () => {
      toast({ title: "Failed to add credits", variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: number; password: string }) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/reset-password`, { password });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Password reset successfully" });
      setResettingPassword(null);
      setNewPassword("");
    },
    onError: () => {
      toast({ title: "Failed to reset password", variant: "destructive" });
    },
  });

  const handleUpdateUser = (userData: Partial<User>) => {
    if (!editingUser) return;
    updateUserMutation.mutate({ ...userData, id: editingUser.id });
  };

  const handleAddCredits = () => {
    if (!addingCredits || !creditAmount) return;
    const credits = parseInt(creditAmount);
    if (isNaN(credits) || credits <= 0) {
      toast({ title: "Please enter a valid credit amount", variant: "destructive" });
      return;
    }
    addCreditsMutation.mutate({ userId: addingCredits.id, credits });
  };

  const handleResetPassword = () => {
    if (!resettingPassword || !newPassword || newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    resetPasswordMutation.mutate({ userId: resettingPassword.id, password: newPassword });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSubscriptionBadge = (type: string) => {
    const variants: Record<string, string> = {
      trial: "bg-yellow-100 text-yellow-800",
      pro: "bg-blue-100 text-blue-800",
      enterprise: "bg-purple-100 text-purple-800"
    };
    return variants[type] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Contacts</h1>
          <p className="text-muted-foreground">Manage all user accounts, credits, and permissions</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {users.length} Total Users
        </Badge>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Filter by Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users by Company */}
      <div className="space-y-6">
        {Object.entries(usersByCompany).map(([company, companyUsers]) => (
          <Card key={company}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {company}
                <Badge variant="secondary">{companyUsers.length} users</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {companyUsers.map((user: User) => (
                  <div key={user.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{user.name}</span>
                          {user.isAdmin && (
                            <Badge variant="outline" className="bg-red-50 text-red-600">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {getStatusIcon(user.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={user.subscriptionType === 'trial' ? 'secondary' : 'default'}>
                          {user.subscriptionType === 'trial' ? 'Trial' : 'Subscription'}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <CreditCard className="h-3 w-3" />
                          {user.swmsCredits} credits
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.totalSwms} SWMS created
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User Details</DialogTitle>
                            <DialogDescription>
                              Update user information and settings
                            </DialogDescription>
                          </DialogHeader>
                          {editingUser && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Name</Label>
                                  <Input
                                    defaultValue={editingUser.name}
                                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Email</Label>
                                  <Input
                                    defaultValue={editingUser.email}
                                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Company</Label>
                                  <Input
                                    defaultValue={editingUser.company || ""}
                                    onChange={(e) => setEditingUser({...editingUser, company: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Phone</Label>
                                  <Input
                                    defaultValue={editingUser.phone || ""}
                                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Subscription Status</Label>
                                  <Select 
                                    value={editingUser.subscriptionType} 
                                    onValueChange={(value) => setEditingUser({...editingUser, subscriptionType: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="trial">Trial (No Subscription)</SelectItem>
                                      <SelectItem value="active">Active Subscription</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Account Status</Label>
                                  <Select 
                                    value={editingUser.status} 
                                    onValueChange={(value) => setEditingUser({...editingUser, status: value as any})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="inactive">Inactive</SelectItem>
                                      <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 p-3 border rounded-lg bg-amber-50">
                                <input
                                  type="checkbox"
                                  id="admin"
                                  checked={editingUser.isAdmin}
                                  onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                                  className="h-4 w-4"
                                />
                                <Label htmlFor="admin" className="font-medium">Administrator Access</Label>
                                <Shield className="h-4 w-4 text-amber-600" />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleUpdateUser(editingUser)}
                                  disabled={updateUserMutation.isPending}
                                >
                                  Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => setEditingUser(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setAddingCredits(user)}
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            Add Credits
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Credits</DialogTitle>
                            <DialogDescription>
                              Add SWMS credits to {user.name}'s account
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Credits to Add</Label>
                              <Input
                                type="number"
                                placeholder="Enter number of credits"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                              />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Current balance: {addingCredits?.swmsCredits} credits
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={handleAddCredits}
                                disabled={addCreditsMutation.isPending}
                              >
                                Add Credits
                              </Button>
                              <Button variant="outline" onClick={() => {
                                setAddingCredits(null);
                                setCreditAmount("");
                              }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setResettingPassword(user)}
                          >
                            <Key className="h-3 w-3 mr-1" />
                            Reset Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                              Set a new password for {user.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>New Password</Label>
                              <Input
                                type="password"
                                placeholder="Enter new password (min 6 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={handleResetPassword}
                                disabled={resetPasswordMutation.isPending}
                              >
                                Reset Password
                              </Button>
                              <Button variant="outline" onClick={() => {
                                setResettingPassword(null);
                                setNewPassword("");
                              }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}