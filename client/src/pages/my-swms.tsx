import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { generateProtectedPDF } from "@/lib/pdf-generator";
import { useUser } from "@/App";

interface SwmsDocument {
  id: number;
  title: string;
  tradeType: string;
  projectLocation: string;
  activities: string[];
  status: string;
  aiEnhanced: boolean;
  createdAt: string;
  complianceScore?: number;
  riskLevel?: string;
}

export default function MySwms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tradeFilter, setTradeFilter] = useState("all");
  const { toast } = useToast();
  const user = useUser();

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ["/api/swms/my-documents"],
    enabled: !!user,
  });

  // Combine drafts and completed documents into a single array
  const documents = documentsData ? [...((documentsData as any).drafts || []), ...((documentsData as any).completed || [])] : [];
  
  // Fix data structure for display
  const formattedDocuments = documents.map((doc: any) => ({
    ...doc,
    title: doc.title || doc.jobName || 'Untitled SWMS',
    tradeType: doc.tradeType || 'General Construction',
    projectLocation: doc.projectAddress || doc.projectLocation || 'Not specified',
    activities: doc.activities || [],
    aiEnhanced: doc.aiEnhanced || false,
    complianceScore: doc.complianceScore || 85,
    riskLevel: doc.riskLevel || 'medium'
  }));

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/swms/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/swms/my-documents"] });
      toast({
        title: "Document Deleted",
        description: "SWMS document has been successfully deleted.",
      });
    },
  });

  const downloadDocumentMutation = useMutation({
    mutationFn: async (document: any) => {
      // Use the comprehensive PDF generation endpoint
      const response = await fetch('/api/swms/pdf-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: document.title || document.jobName,
          projectNumber: document.jobNumber,
          projectAddress: document.projectAddress || document.projectLocation,
          companyName: document.principalContractor,
          principalContractor: document.principalContractor,
          swmsData: document.swmsData || {
            activities: document.workActivities || [],
            plantEquipment: document.plantEquipment || [],
            emergencyProcedures: document.emergencyProcedures || {}
          },
          formData: {
            jobName: document.title || document.jobName,
            jobNumber: document.jobNumber,
            projectLocation: document.projectAddress || document.projectLocation,
            principalContractor: document.principalContractor,
            supervisorName: document.responsiblePersons?.supervisor || 'N/A',
            supervisorPhone: document.responsiblePersons?.phone || 'N/A'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(document.title || document.jobName).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_swms.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your comprehensive SWMS PDF is being downloaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  });

  const viewPdfMutation = useMutation({
    mutationFn: async (document: any) => {
      // Generate PDF and open in new tab for viewing
      const response = await fetch('/api/swms/pdf-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: document.title || document.jobName,
          projectNumber: document.jobNumber,
          projectAddress: document.projectAddress || document.projectLocation,
          companyName: document.principalContractor,
          principalContractor: document.principalContractor,
          swmsData: document.swmsData || {
            activities: document.workActivities || [],
            plantEquipment: document.plantEquipment || [],
            emergencyProcedures: document.emergencyProcedures || {}
          },
          formData: {
            jobName: document.title || document.jobName,
            jobNumber: document.jobNumber,
            projectLocation: document.projectAddress || document.projectLocation,
            principalContractor: document.principalContractor,
            supervisorName: document.responsiblePersons?.supervisor || 'N/A',
            supervisorPhone: document.responsiblePersons?.phone || 'N/A'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    onSuccess: () => {
      toast({
        title: "PDF Opened",
        description: "Your SWMS PDF is now displayed in a new tab.",
      });
    },
    onError: (error) => {
      toast({
        title: "View Failed",
        description: "Failed to open PDF. Please try again.",
        variant: "destructive"
      });
    }
  });

  const filteredDocuments = formattedDocuments.filter((doc: SwmsDocument) => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tradeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.projectLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesTrade = tradeFilter === "all" || doc.tradeType === tradeFilter;
    return matchesSearch && matchesStatus && matchesTrade;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High Risk</Badge>;
      case "extreme":
        return <Badge className="bg-red-100 text-red-800">Extreme Risk</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary/600" />
            <p className="text-gray-600">Loading your SWMS documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My SWMS Documents</h1>
          <p className="text-gray-600 mt-1">Manage and track your Safe Work Method Statements</p>
        </div>
        <Link href="/swms-builder">
          <Button className="bg-primary/600 hover:bg-primary/700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create New SWMS
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by trade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
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
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SWMS documents found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" || tradeFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "Get started by creating your first SWMS document"}
              </p>
              <Link href="/swms-builder">
                <Button className="bg-primary/600 hover:bg-primary/700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First SWMS
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document: SwmsDocument) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {document.title}
                  </CardTitle>
                  {document.aiEnhanced && (
                    <Badge className="bg-purple-100 text-purple-800 ml-2">
                      <Shield className="h-3 w-3 mr-1" />
                      AI Enhanced
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  {getStatusBadge(document.status)}
                  {document.riskLevel && getRiskBadge(document.riskLevel)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(document.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Trade:</span> {document.tradeType}
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Location:</span> {document.projectLocation}
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Activities:</span> {document.activities?.length || 0} selected
                  </div>

                  {document.complianceScore && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium mr-2">Compliance:</span>
                      <div className="flex items-center">
                        {document.complianceScore >= 80 ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                        )}
                        <span>{document.complianceScore}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {document.status === 'completed' ? (
                    // Completed documents: View PDF and Download
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => viewPdfMutation.mutate(document)}
                        disabled={viewPdfMutation.isPending}
                        className="flex-1 bg-primary/600 hover:bg-primary/700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View PDF
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocumentMutation.mutate(document)}
                        disabled={downloadDocumentMutation.isPending}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    // Draft documents: Edit option
                    <Link href={`/swms-editor/${document.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Continue Editing
                      </Button>
                    </Link>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteDocumentMutation.mutate(document.id)}
                    disabled={deleteDocumentMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}