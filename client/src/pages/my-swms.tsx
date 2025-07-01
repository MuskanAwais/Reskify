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
import { PDFPreview } from "@/components/PDFPreview";

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
    queryKey: ["/api/swms"],
    enabled: !!user,
  });

  // Get documents array from API response
  const documents = (documentsData as any)?.documents || [];
  
  // Format documents for display
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
      queryClient.invalidateQueries({ queryKey: ["/api/swms"] });
      toast({
        title: "Document Deleted",
        description: "SWMS document has been successfully deleted.",
      });
    },
  });

  const downloadDocumentMutation = useMutation({
    mutationFn: async (swmsDocument: any) => {
      console.log('Starting PDF download for:', swmsDocument.title || swmsDocument.jobName);
      
      try {
        // Use the comprehensive PDF generation endpoint
        const response = await fetch('/api/swms/pdf-download', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf',
          },
          body: JSON.stringify({
            title: swmsDocument.title || swmsDocument.jobName,
            projectName: swmsDocument.title || swmsDocument.jobName,
            projectNumber: swmsDocument.jobNumber,
            projectAddress: swmsDocument.projectAddress || swmsDocument.projectLocation,
            companyName: swmsDocument.principalContractor,
            principalContractor: swmsDocument.principalContractor,
            swmsData: swmsDocument.swmsData || {
              activities: swmsDocument.workActivities || [],
              plantEquipment: swmsDocument.plantEquipment || [],
              emergencyProcedures: swmsDocument.emergencyProcedures || {}
            },
            formData: {
              jobName: swmsDocument.title || swmsDocument.jobName,
              jobNumber: swmsDocument.jobNumber,
              projectLocation: swmsDocument.projectAddress || swmsDocument.projectLocation,
              principalContractor: swmsDocument.principalContractor,
              supervisorName: swmsDocument.responsiblePersons?.supervisor || 'N/A',
              supervisorPhone: swmsDocument.responsiblePersons?.phone || 'N/A'
            }
          })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('PDF generation failed:', errorText);
          throw new Error(`Failed to generate PDF: ${response.status}`);
        }

        // Check if response is actually a PDF
        const contentType = response.headers.get('content-type');
        console.log('Content type:', contentType);
        
        if (!contentType || !contentType.includes('application/pdf')) {
          console.error('Response is not a PDF:', contentType);
          const responseText = await response.text();
          console.error('Response body:', responseText);
          throw new Error('Server returned invalid response format');
        }

        // Get response as ArrayBuffer for proper binary handling
        const arrayBuffer = await response.arrayBuffer();
        console.log('ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
        
        if (arrayBuffer.byteLength === 0) {
          throw new Error('Empty PDF received from server');
        }

        // Create blob with explicit PDF MIME type
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(swmsDocument.title || swmsDocument.jobName).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_swms.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('PDF download completed successfully');
        return { success: true };
      } catch (error) {
        console.error('PDF download error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your comprehensive SWMS PDF is being downloaded.",
      });
    },
    onError: (error) => {
      console.error("PDF download error:", error);
      toast({
        title: "Download Failed",
        description: `Error: ${error.message || 'Failed to generate PDF. Please try again.'}`,
        variant: "destructive"
      });
    }
  });

  const viewPdfMutation = useMutation({
    mutationFn: async (swmsDocument: any) => {
      // Generate PDF and open in new tab for viewing
      const response = await fetch('/api/swms/pdf-download', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
        },
        body: JSON.stringify({
          title: swmsDocument.title || swmsDocument.jobName,
          projectName: swmsDocument.title || swmsDocument.jobName,
          projectNumber: swmsDocument.jobNumber,
          projectAddress: swmsDocument.projectAddress || swmsDocument.projectLocation,
          companyName: swmsDocument.principalContractor,
          principalContractor: swmsDocument.principalContractor,
          swmsData: swmsDocument.swmsData || {
            activities: swmsDocument.workActivities || [],
            plantEquipment: swmsDocument.plantEquipment || [],
            emergencyProcedures: swmsDocument.emergencyProcedures || {}
          },
          formData: {
            jobName: swmsDocument.title || swmsDocument.jobName,
            jobNumber: swmsDocument.jobNumber,
            projectLocation: swmsDocument.projectAddress || swmsDocument.projectLocation,
            principalContractor: swmsDocument.principalContractor,
            supervisorName: swmsDocument.responsiblePersons?.supervisor || 'N/A',
            supervisorPhone: swmsDocument.responsiblePersons?.phone || 'N/A'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PDF generation failed:', errorText);
        throw new Error(`Failed to generate PDF: ${response.status}`);
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        console.error('Response is not a PDF:', contentType);
        throw new Error('Server returned invalid response format');
      }

      // Get the response as an ArrayBuffer for proper binary handling
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Empty PDF received from server');
      }

      // Create blob with explicit PDF MIME type
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Open in new tab
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        // Fallback: download if popup blocked
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(swmsDocument.title || swmsDocument.jobName).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_swms.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 5000);
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
                <SelectItem value="completed">Completed</SelectItem>
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


                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {document.status === 'completed' ? (
                    // Completed documents: Download and Delete only
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => downloadDocumentMutation.mutate(document)}
                        disabled={downloadDocumentMutation.isPending}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocumentMutation.mutate(document.id)}
                        disabled={deleteDocumentMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    // Draft documents: Edit and Delete only
                    <>
                      <Link href={`/swms-builder?edit=${document.id}`} className="flex-1">
                        <Button variant="default" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocumentMutation.mutate(document.id)}
                        disabled={deleteDocumentMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}