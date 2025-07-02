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
  AlertCircle,
  MapPin,
  Search,
  Plus,
  RotateCcw,
  Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();
  const user = useUser();

  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/swms"],
    enabled: !!user,
  });

  const { data: deletedDocumentsData, isLoading: isLoadingDeleted } = useQuery({
    queryKey: ["/api/swms/deleted"],
    enabled: !!user && activeTab === "deleted"
  });

  // Get documents array from API response
  const documents = (documentsData as any)?.documents || [];
  const deletedDocuments = (deletedDocumentsData as any)?.documents || [];
  
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

  // Format deleted documents for display
  const formattedDeletedDocuments = deletedDocuments.map((doc: any) => ({
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
      queryClient.invalidateQueries({ queryKey: ["/api/swms/deleted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Document Moved to Recycling Bin",
        description: "SWMS document has been moved to recycling bin.",
      });
    },
  });

  // Restore document from recycling bin
  const restoreDocumentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/swms/${id}/restore`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/swms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/swms/deleted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      // Switch back to active tab to show restored document
      setActiveTab("active");
      toast({
        title: "Document Restored",
        description: "SWMS document has been successfully restored and moved to active documents.",
      });
    },
    onError: () => {
      toast({
        title: "Restore Failed",
        description: "Failed to restore document. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Permanently delete document
  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/swms/${id}/permanent`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/swms/deleted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Document Permanently Deleted",
        description: "SWMS document has been permanently deleted and cannot be recovered.",
        variant: "destructive"
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to permanently delete document. Please try again.",
        variant: "destructive"
      });
    }
  });

  const downloadDocumentMutation = useMutation({
    mutationFn: async (swmsDocument: any) => {
      console.log('Starting RiskTemplateBuilder PDF download for:', swmsDocument.title || swmsDocument.jobName);
      
      try {
        // Prepare comprehensive data for RiskTemplateBuilder - ALL FIELDS MAPPED
        const templateBuilderData = {
          // Project Information
          project_name: swmsDocument.title || swmsDocument.jobName || '',
          job_number: swmsDocument.jobNumber || '',
          project_address: swmsDocument.projectAddress || swmsDocument.projectLocation || '',
          principal_contractor: swmsDocument.principalContractor || '',
          project_manager: swmsDocument.projectManager || '',
          site_supervisor: swmsDocument.siteSupervisor || '',
          
          // Additional Project Fields
          subcontractor: swmsDocument.subcontractor || '',
          principal_contractor_abn: swmsDocument.principalContractorAbn || '',
          subcontractor_abn: swmsDocument.subcontractorAbn || '',
          license_number: swmsDocument.licenseNumber || '',
          document_version: swmsDocument.documentVersion || '1.0',
          
          // Creator Information
          swms_creator_name: swmsDocument.swmsCreatorName || '',
          swms_creator_position: swmsDocument.swmsCreatorPosition || '',
          
          // Company Logo
          company_logo: swmsDocument.companyLogo || '',
          
          // Signature Fields - CRITICAL MISSING FIELDS
          signature_method: swmsDocument.signatureMethod || '',
          signature_image: swmsDocument.signatureImage || '',
          signature_text: swmsDocument.signatureText || '',
          signed_by: swmsDocument.signedBy || '',
          signature_title: swmsDocument.signatureTitle || '',
          signed_at: swmsDocument.signedAt || '',
          
          // Work Activities with proper structure
          work_activities: (swmsDocument.workActivities || []).map((activity: any) => ({
            activity: activity.activity || activity.description || '',
            hazards: Array.isArray(activity.hazards) ? activity.hazards.join(', ') : (activity.hazards || ''),
            initial_risk: activity.initialRisk || activity.riskLevel || 'Medium',
            control_measures: Array.isArray(activity.controlMeasures) ? activity.controlMeasures.join(', ') : (activity.controlMeasures || ''),
            residual_risk: activity.residualRisk || activity.finalRiskLevel || 'Low',
            legislation: activity.legislation || 'WHS Act 2011, WHS Regulation 2017'
          })),
          
          // Plant and Equipment
          plant_equipment: (swmsDocument.plantEquipment || []).map((equipment: any) => ({
            equipment: equipment.equipment || equipment.name || '',
            risk_level: equipment.riskLevel || 'Low',
            next_inspection: equipment.nextInspection || 'As Required',
            certification_required: equipment.certificationRequired ? 'Required' : 'Not Required'
          })),
          
          // PPE Requirements
          ppe_requirements: swmsDocument.ppeRequirements || [],
          
          // HRCW Categories and Risk Fields
          hrcw_categories: swmsDocument.hrcwCategories || [],
          is_high_risk_work: swmsDocument.isHighRiskWork || false,
          high_risk_activities: swmsDocument.highRiskActivities || [],
          whs_regulations: swmsDocument.whsRegulations || [],
          high_risk_justification: swmsDocument.highRiskJustification || '',
          
          // Emergency Procedures
          emergency_contact: swmsDocument.emergencyProcedures?.emergencyContact || '',
          evacuation_procedure: swmsDocument.emergencyProcedures?.evacuationProcedure || '',
          nearest_hospital: swmsDocument.nearestHospital || '',
          first_aid_arrangements: swmsDocument.firstAidArrangements || '',
          
          // Training and Competency
          training_requirements: swmsDocument.trainingRequirements || [],
          competency_requirements: swmsDocument.competencyRequirements || [],
          permits_required: swmsDocument.permitsRequired || [],
          
          // Risk Assessment Summary
          overall_risk_level: swmsDocument.overallRiskLevel || 'Medium',
          
          // Dates
          start_date: swmsDocument.startDate || new Date().toISOString().split('T')[0],
          created_date: new Date().toISOString().split('T')[0]
        };

        console.log('Sending data to RiskTemplateBuilder:', templateBuilderData);

        // Send to our server endpoint which handles RiskTemplateBuilder integration
        const response = await fetch('/api/swms/pdf-download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateBuilderData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`PDF generation failed: ${response.status} - ${errorText}`);
        }

        // Get the PDF blob from our server
        const pdfBlob = await response.blob();
        
        if (pdfBlob.size === 0) {
          throw new Error('Empty PDF received from server');
        }

        // Download the PDF
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(swmsDocument.title || swmsDocument.jobName).replace(/[^a-z0-9]/gi, '_').toLowerCase()}_swms.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('RiskTemplateBuilder PDF download completed successfully');
        return { success: true };
      } catch (error) {
        console.error('RiskTemplateBuilder PDF download error:', error);
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

  // Deleted documents are already loaded above with the existing query

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
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/swms"] });
              refetch();
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/swms-builder">
            <Button className="bg-primary/600 hover:bg-primary/700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create New SWMS
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs for Active Documents and Recycling Bin */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Active Documents ({formattedDocuments.length})
          </TabsTrigger>
          <TabsTrigger value="deleted" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Recycling Bin ({formattedDeletedDocuments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-6">
          {/* Filters for Active Documents */}
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
        </TabsContent>

        <TabsContent value="deleted" className="mt-6 space-y-6">
          {/* 30-day deletion notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Auto-deletion Notice</span>
            </div>
            <p className="text-amber-700 mt-1 text-sm">
              Documents in the recycling bin will be permanently deleted after 30 days. 
              Restore important documents before they are automatically removed.
            </p>
          </div>

          {formattedDeletedDocuments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Recycling Bin is Empty</h3>
                  <p className="text-gray-600">No deleted SWMS documents found.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {formattedDeletedDocuments.map((doc: any) => (
                <Card key={doc.id} className="border-red-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-700 line-clamp-2">{doc.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{doc.tradeType}</p>
                      </div>
                      <Badge variant="destructive" className="ml-2 shrink-0">Deleted</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Deleted: {new Date(doc.deletedAt).toLocaleDateString()}</span>
                      </div>
                      {doc.projectLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{doc.projectLocation}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => restoreDocumentMutation.mutate(doc.id)}
                        disabled={restoreDocumentMutation.isPending}
                        className="flex-1 text-xs"
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Restore
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to permanently delete this document? This action cannot be undone.')) {
                            permanentDeleteMutation.mutate(doc.id);
                          }
                        }}
                        disabled={permanentDeleteMutation.isPending}
                        className="flex-1 text-xs"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete Forever
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}