import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Search, Download, Eye, Calendar, User, Edit, Trash2, Building2, MapPin, Phone, Mail, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface SwmsDocument {
  id: number;
  title: string;
  jobName: string;
  company: string;
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  tradeType: string;
  workDescription: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  status: 'draft' | 'active' | 'completed';
  riskAssessments?: any[];
  plantEquipment?: any[];
  emergencyProcedures?: any[];
}

export default function AllSwms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [editingSwms, setEditingSwms] = useState<SwmsDocument | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allSwms, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/all-swms'],
  });

  // Update SWMS mutation
  const updateSwmsMutation = useMutation({
    mutationFn: async (swmsData: Partial<SwmsDocument> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/admin/swms/${swmsData.id}`, swmsData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-swms'] });
      toast({ title: "SWMS updated successfully" });
      setEditingSwms(null);
    },
    onError: () => {
      toast({ title: "Failed to update SWMS", variant: "destructive" });
    },
  });

  // Delete SWMS mutation
  const deleteSwmsMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/swms/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-swms'] });
      toast({ title: "SWMS deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete SWMS", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Use only real SWMS data from database
  const swmsData: SwmsDocument[] = Array.isArray(allSwms) ? allSwms : [];

  // Get unique companies
  const companies = [...new Set(swmsData.map(swms => swms.company).filter(Boolean))].sort();

  // Filter data
  const filteredData = swmsData.filter((swms: SwmsDocument) => {
    const matchesSearch = swms.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swms.jobName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swms.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swms.tradeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         swms.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === "all" || swms.company === selectedCompany;
    const matchesStatus = selectedStatus === "all" || swms.status === selectedStatus;
    return matchesSearch && matchesCompany && matchesStatus;
  });

  // Group SWMS by company
  const swmsByCompany = filteredData.reduce((acc: Record<string, SwmsDocument[]>, swms: SwmsDocument) => {
    const company = swms.company || "No Company";
    if (!acc[company]) acc[company] = [];
    acc[company].push(swms);
    return acc;
  }, {});

  const handleEdit = (swms: SwmsDocument) => {
    setEditingSwms(swms);
  };

  const handleUpdateSwms = (swmsData: Partial<SwmsDocument>) => {
    if (!editingSwms) return;
    updateSwmsMutation.mutate({ ...swmsData, id: editingSwms.id });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this SWMS document? This action cannot be undone.")) {
      deleteSwmsMutation.mutate(id);
    }
  };

  const handleDirectEdit = (id: number) => {
    // Navigate to SWMS builder with admin override
    window.open(`/swms-builder?edit=${id}&admin=true`, '_blank');
  };

  const handleDownload = async (id: number) => {
    try {
      const response = await fetch(`/api/swms/${id}/download`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swms-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "SWMS downloaded successfully" });
    } catch (error) {
      toast({ title: "Failed to download SWMS", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800"
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All SWMS Documents</h1>
          <p className="text-muted-foreground">Comprehensive SWMS management with full editing capabilities</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredData.length} Total Documents
        </Badge>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search Documents</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, job, company, trade, user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Filter by Company</Label>
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
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SWMS Documents by Company */}
      <div className="space-y-6">
        {Object.entries(swmsByCompany).map(([company, companySwms]) => (
          <Card key={company}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {company}
                <Badge variant="secondary">{companySwms.length} documents</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {companySwms.map((swms: SwmsDocument) => (
                  <div key={swms.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{swms.title || swms.jobName}</h3>
                          <Badge className={getStatusBadge(swms.status)}>
                            {swms.status?.toUpperCase() || "ACTIVE"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>Created by: {swms.userName || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {new Date(swms.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3" />
                              <span>Trade: {swms.tradeType || "General"}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {swms.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span>{swms.location}</span>
                              </div>
                            )}
                            {swms.contactName && (
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                <span>Contact: {swms.contactName}</span>
                              </div>
                            )}
                            {swms.contactPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{swms.contactPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {swms.workDescription && (
                          <div className="text-sm">
                            <strong>Work Description:</strong> {swms.workDescription.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDirectEdit(swms.id)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Full Edit
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(swms)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Quick Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit SWMS Details</DialogTitle>
                            <DialogDescription>
                              Update SWMS information and settings
                            </DialogDescription>
                          </DialogHeader>
                          {editingSwms && (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Title</Label>
                                  <Input
                                    defaultValue={editingSwms.title}
                                    onChange={(e) => setEditingSwms({...editingSwms, title: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Job Name</Label>
                                  <Input
                                    defaultValue={editingSwms.jobName}
                                    onChange={(e) => setEditingSwms({...editingSwms, jobName: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Company</Label>
                                  <Input
                                    defaultValue={editingSwms.company}
                                    onChange={(e) => setEditingSwms({...editingSwms, company: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Location</Label>
                                  <Input
                                    defaultValue={editingSwms.location}
                                    onChange={(e) => setEditingSwms({...editingSwms, location: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>Contact Name</Label>
                                  <Input
                                    defaultValue={editingSwms.contactName}
                                    onChange={(e) => setEditingSwms({...editingSwms, contactName: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Contact Phone</Label>
                                  <Input
                                    defaultValue={editingSwms.contactPhone}
                                    onChange={(e) => setEditingSwms({...editingSwms, contactPhone: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Contact Email</Label>
                                  <Input
                                    defaultValue={editingSwms.contactEmail}
                                    onChange={(e) => setEditingSwms({...editingSwms, contactEmail: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Trade Type</Label>
                                  <Input
                                    defaultValue={editingSwms.tradeType}
                                    onChange={(e) => setEditingSwms({...editingSwms, tradeType: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Status</Label>
                                  <Select 
                                    value={editingSwms.status} 
                                    onValueChange={(value) => setEditingSwms({...editingSwms, status: value as any})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="draft">Draft</SelectItem>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Work Description</Label>
                                <Textarea
                                  defaultValue={editingSwms.workDescription}
                                  onChange={(e) => setEditingSwms({...editingSwms, workDescription: e.target.value})}
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleUpdateSwms(editingSwms)}
                                  disabled={updateSwmsMutation.isPending}
                                >
                                  Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => setEditingSwms(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(swms.id)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(swms.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={deleteSwmsMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No SWMS documents found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCompany !== "all" || selectedStatus !== "all" 
                ? "Try adjusting your search criteria or filters." 
                : "No SWMS documents have been created yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}