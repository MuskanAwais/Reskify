import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/App";
import { apiRequest } from "@/lib/queryClient";
import { generateProtectedPDF } from "@/lib/pdf-generator";
import { 
  FileText, 
  Download, 
  Eye, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  User,
  Building
} from "lucide-react";

interface DocumentPreviewProps {
  formData: any;
}

export default function DocumentPreview({ formData }: DocumentPreviewProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);

  const createSwmsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/swms", {
        ...data,
        userId: user?.id,
        status: "draft"
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedDocument(data);
      toast({
        title: "SWMS Created Successfully",
        description: "Your SWMS document has been generated and saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating SWMS",
        description: error.message || "Failed to create SWMS document",
        variant: "destructive",
      });
    }
  });

  const enhanceWithAiMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/enhance-swms", {
        tradeType: formData.tradeType,
        activities: formData.activities,
        projectDetails: {
          title: formData.title,
          location: formData.projectLocation
        }
      });
      return response.json();
    },
    onSuccess: (enhancement) => {
      const enhancedData = {
        ...formData,
        riskAssessments: enhancement.riskAssessments || [],
        safetyMeasures: enhancement.safetyMeasures || [],
        aiEnhanced: true
      };
      createSwmsMutation.mutate(enhancedData);
    },
    onError: (error: any) => {
      toast({
        title: "AI Enhancement Failed",
        description: "Creating SWMS without AI enhancement.",
        variant: "destructive",
      });
      // Fallback to creating without AI enhancement
      createSwmsMutation.mutate(formData);
    }
  });

  const handleGenerateDocument = () => {
    if (formData.activities.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one activity before generating the document.",
        variant: "destructive",
      });
      return;
    }

    // Try to enhance with AI first, then fallback to regular creation
    enhanceWithAiMutation.mutate();
  };

  const handleDownloadPDF = async () => {
    if (!generatedDocument) {
      toast({
        title: "No Document Available",
        description: "Please generate the document first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdfBlob = await generateProtectedPDF(generatedDocument, user);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SWMS-${generatedDocument.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Downloaded",
        description: "Your protected SWMS PDF has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const documentToDisplay = generatedDocument || {
    ...formData,
    id: 'preview',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'draft'
  };

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'under_review': return 'bg-amber-100 text-amber-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex space-x-4">
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <Eye className="mr-2 h-4 w-4" />
            Preview Document
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>SWMS Document Preview</span>
              <div className="flex items-center space-x-2">
                {generatedDocument && (
                  <Button 
                    onClick={handleDownloadPDF}
                    className="bg-success hover:bg-success/90 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Document Header */}
              <Card className="border-2 border-gray-300">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                      SAFE WORK METHOD STATEMENT
                    </h1>
                    <p className="text-lg text-gray-600">{documentToDisplay.title}</p>
                    
                    {/* Protection Notice */}
                    <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                      <div className="flex items-center justify-center">
                        <Shield className="mr-2 h-5 w-5 text-red-600" />
                        <p className="text-sm font-medium text-red-700">
                          <strong>PROTECTED DOCUMENT:</strong> This SWMS is digitally protected and cannot be copied or modified without authorization.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Building className="mr-2 h-5 w-5" />
                        Project Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium w-20">Trade:</span>
                          <Badge variant="secondary">{documentToDisplay.tradeType}</Badge>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium w-20">Location:</span>
                          <span className="flex-1">{documentToDisplay.projectLocation}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-20">Status:</span>
                          <Badge className={getStatusColor(documentToDisplay.status)}>
                            {documentToDisplay.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span className="font-medium">Created:</span>
                          <span className="ml-2">{new Date(documentToDisplay.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Compliance Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium">Standards:</span>
                          <span className="ml-2">AS/NZS Standards Compliant</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Regulation:</span>
                          <span className="ml-2">Model WHS Regulations</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Authority:</span>
                          <span className="ml-2">Safe Work Australia</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">AI Enhanced:</span>
                          <span className="ml-2 text-green-600">
                            {documentToDisplay.aiEnhanced ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activities Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Work Activities</h3>
                    <div className="flex flex-wrap gap-2">
                      {documentToDisplay.activities?.map((activity: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Risk Assessment Table */}
                  {documentToDisplay.riskAssessments && documentToDisplay.riskAssessments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Risk Assessment Matrix
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="border border-gray-300 p-3 text-left">Hazard</th>
                              <th className="border border-gray-300 p-3 text-left">Risk Level</th>
                              <th className="border border-gray-300 p-3 text-left">Control Measures</th>
                              <th className="border border-gray-300 p-3 text-left">Responsible Person</th>
                            </tr>
                          </thead>
                          <tbody>
                            {documentToDisplay.riskAssessments.map((risk: any, index: number) => (
                              <tr key={index}>
                                <td className="border border-gray-300 p-3">{risk.hazard}</td>
                                <td className="border border-gray-300 p-3">
                                  <Badge className={getRiskLevelColor(risk.riskLevel)}>
                                    {risk.riskLevel.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="border border-gray-300 p-3">
                                  {Array.isArray(risk.controlMeasures) 
                                    ? risk.controlMeasures.join(', ')
                                    : risk.controlMeasures
                                  }
                                </td>
                                <td className="border border-gray-300 p-3">{risk.responsiblePerson}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Compliance Codes */}
                  {documentToDisplay.complianceCodes && documentToDisplay.complianceCodes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Applicable Safety Codes</h3>
                      <div className="flex flex-wrap gap-2">
                        {documentToDisplay.complianceCodes.map((code: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {code}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Footer */}
                  <Separator className="my-6" />
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Generated by: {user?.username} ({user?.companyName})</span>
                    </div>
                    <div className="flex items-center">
                      <span>Document ID: SWM-{documentToDisplay.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Button 
        onClick={handleGenerateDocument}
        disabled={enhanceWithAiMutation.isPending || createSwmsMutation.isPending}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        {enhanceWithAiMutation.isPending || createSwmsMutation.isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            {enhanceWithAiMutation.isPending ? 'AI Enhancing...' : 'Generating...'}
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Generate SWMS
          </>
        )}
      </Button>
    </div>
  );
}
