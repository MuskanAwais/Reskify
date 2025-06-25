import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  UserPlus, 
  Mail, 
  Shield, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Crown,
  FileText,
  Settings
} from "lucide-react";
import { useLocation } from "wouter";
import { useAdmin } from "@/App";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "pending" | "inactive";
  joinedAt: string;
  lastActive: string;
}

interface TeamProject {
  id: string;
  title: string;
  status: "draft" | "in-review" | "approved" | "completed";
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  dueDate?: string;
  progress: number;
  comments: number;
}

export default function TeamCollaboration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("members");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const { isAdminMode } = useAdmin();

  // Check user subscription
  const { data: subscription } = useQuery<{ plan: string; subscriptionType: string }>({
    queryKey: ["/api/user/subscription"],
  });

  // Check for subscription or admin access - admins get full team collaboration access
  const hasTeamAccess = subscription?.plan === "subscription" || isAdminMode;

  // Team members and projects queries
  const { data: teamMembers = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team/members"],
    enabled: hasTeamAccess,
  });

  const { data: teamProjects = [], isLoading: projectsLoading } = useQuery<TeamProject[]>({
    queryKey: ["/api/team/projects"],  
    enabled: hasTeamAccess,
  });

  // Invite team member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return await apiRequest("POST", "/api/team/invite", data);
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "Team member invitation has been sent successfully.",
      });
      setNewMemberEmail("");
      setShowInviteForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
    },
    onError: (error: any) => {
      toast({
        title: "Invitation Failed",
        description: error.message || "Failed to send invitation.",
        variant: "destructive",
      });
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: { memberId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/team/members/${data.memberId}/role`, { role: data.role });
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "Team member role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update member role.",
        variant: "destructive",
      });
    },
  });

  // Remove team member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await apiRequest("DELETE", `/api/team/members/${memberId}`);
    },
    onSuccess: () => {
      toast({
        title: "Member Removed",
        description: "Team member has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
    },
    onError: (error: any) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove team member.",
        variant: "destructive",
      });
    },
  });

  if (!hasTeamAccess) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Team Collaboration</h2>
            <p className="text-gray-600 mb-6">
              Team collaboration features are available with subscription plans only.
            </p>
            <Button onClick={() => setLocation('/billing')}>
              Upgrade to Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="h-4 w-4 text-yellow-500" />;
      case "editor": return <Edit3 className="h-4 w-4 text-primary" />;
      case "viewer": return <User className="h-4 w-4 text-gray-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "inactive": return <Badge variant="outline">Inactive</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="outline">Draft</Badge>;
      case "in-review": return <Badge variant="secondary">In Review</Badge>;
      case "approved": return <Badge variant="default" className="bg-blue-100 text-blue-800">Approved</Badge>;
      case "completed": return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Collaboration</h1>
        <p className="text-gray-600">Manage your team members and collaborative SWMS projects.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1">
          <Button
            variant={selectedTab === "members" ? "default" : "ghost"}
            onClick={() => setSelectedTab("members")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Team Members
          </Button>
          <Button
            variant={selectedTab === "projects" ? "default" : "ghost"}
            onClick={() => setSelectedTab("projects")}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Collaborative Projects
          </Button>
          <Button
            variant={selectedTab === "settings" ? "default" : "ghost"}
            onClick={() => setSelectedTab("settings")}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Team Settings
          </Button>
        </div>

        {/* Team Members Tab */}
        {selectedTab === "members" && (
          <div className="space-y-6">
            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Members</p>
                      <p className="text-2xl font-bold">{teamMembers.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Members</p>
                      <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === "active").length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                      <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === "pending").length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Admins</p>
                      <p className="text-2xl font-bold">{teamMembers.filter(m => m.role === "admin").length}</p>
                    </div>
                    <Crown className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Member Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Invite Team Member
                  </CardTitle>
                  <Button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              {showInviteForm && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="team.member@company.com"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={newMemberRole} onValueChange={(value: any) => setNewMemberRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer - View only access</SelectItem>
                          <SelectItem value="editor">Editor - Can edit SWMS documents</SelectItem>
                          <SelectItem value="admin">Admin - Full team management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => inviteMemberMutation.mutate({ email: newMemberEmail, role: newMemberRole })}
                        disabled={!newMemberEmail || inviteMemberMutation.isPending}
                        className="w-full"
                      >
                        {inviteMemberMutation.isPending ? "Sending..." : "Send Invitation"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Team Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member: TeamMember) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(member.role)}
                            <span className="capitalize">{member.role}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(member.lastActive).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={member.role}
                              onValueChange={(value) => updateRoleMutation.mutate({ memberId: member.id, role: value })}
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMemberMutation.mutate(member.id)}
                              disabled={removeMemberMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Collaborative Projects Tab */}
        {selectedTab === "projects" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Collaborative SWMS Projects</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Collaborative Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Team</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamProjects.map((project: TeamProject) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-sm text-gray-500">Created {new Date(project.createdAt).toLocaleDateString()}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getProjectStatusBadge(project.status)}</TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {project.assignedTo.slice(0, 3).map((_, idx) => (
                              <div key={idx} className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                                <User className="h-3 w-3 text-blue-600" />
                              </div>
                            ))}
                            {project.assignedTo.length > 3 && (
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white text-xs">
                                +{project.assignedTo.length - 3}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{project.progress}%</span>
                        </TableCell>
                        <TableCell>
                          {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "No due date"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {project.comments}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Team Settings Tab */}
        {selectedTab === "settings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input id="team-name" placeholder="Your Team Name" />
                </div>
                <div>
                  <Label htmlFor="team-description">Team Description</Label>
                  <Textarea id="team-description" placeholder="Brief description of your team..." />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Default Member Role</h4>
                    <p className="text-sm text-gray-600">Default role for new team members</p>
                  </div>
                  <Select defaultValue="editor">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Project Notifications</h4>
                    <p className="text-sm text-gray-600">Notify team when projects are updated</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}