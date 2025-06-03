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
                    
                    {/* Legal Disclaimer and Liability Notice */}
                    <div className="mt-4 space-y-3">
                      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                        <div className="flex items-start">
                          <Shield className="mr-2 h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-red-700">
                            <p className="font-bold mb-2">IMPORTANT LEGAL DISCLAIMER</p>
                            <p className="mb-2">
                              <strong>Safety Samurai and its operators are NOT LIABLE</strong> for any incidents, accidents, injuries, or damages arising from the use of this SWMS document.
                            </p>
                            <p className="mb-2">
                              This document is a <strong>TEMPLATE ONLY</strong> and must be reviewed, modified, and approved by qualified safety professionals before use.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="mr-2 h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-amber-700">
                            <p className="font-bold mb-2">CONTRACTOR RESPONSIBILITY</p>
                            <p className="mb-1">• You are responsible for ensuring this SWMS complies with all applicable laws and regulations</p>
                            <p className="mb-1">• You must conduct your own risk assessments and site-specific safety evaluations</p>
                            <p className="mb-1">• You must verify all control measures are appropriate for your specific work conditions</p>
                            <p>• You must obtain proper approvals from relevant authorities before commencing work</p>
                          </div>
                        </div>
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

                  {/* Risk Assessment Table - Task-based format */}
                  {documentToDisplay.riskAssessments && documentToDisplay.riskAssessments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Risk Assessment Matrix
                      </h3>
                      <div className="overflow-x-auto" style={{ minWidth: '1200px' }}>
                        <table className="w-full border-collapse border border-gray-300 text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 p-2 text-left font-medium" style={{ width: '15%' }}>
                                Activity / Item
                              </th>
                              <th className="border border-gray-300 p-2 text-left font-medium" style={{ width: '20%' }}>
                                Hazards / Risks
                              </th>
                              <th className="border border-gray-300 p-2 text-center font-medium" style={{ width: '8%' }}>
                                Initial Risk Score
                              </th>
                              <th className="border border-gray-300 p-2 text-left font-medium" style={{ width: '30%' }}>
                                Control Measures / Risk Treatment
                              </th>
                              <th className="border border-gray-300 p-2 text-left font-medium" style={{ width: '19%' }}>
                                Legislation, Codes of Practice, and Guidelines
                              </th>
                              <th className="border border-gray-300 p-2 text-center font-medium" style={{ width: '8%' }}>
                                Residual Risk Score
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {documentToDisplay.riskAssessments.map((assessment: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-2 align-top">
                                  <div className="font-medium text-xs">
                                    {assessment.activity}
                                  </div>
                                </td>
                                <td className="border border-gray-300 p-2 align-top">
                                  <div className="space-y-1">
                                    {assessment.hazards?.map((hazard: string, hIndex: number) => (
                                      <div key={hIndex} className="text-xs">• {hazard}</div>
                                    ))}
                                  </div>
                                </td>
                                <td className="border border-gray-300 p-2 text-center align-top">
                                  <div className="flex flex-col items-center">
                                    <span className="font-bold text-lg">{assessment.initialRiskScore}</span>
                                    <Badge 
                                      variant={
                                        assessment.riskLevel === "High" || assessment.riskLevel === "Extreme" ? "destructive" : 
                                        assessment.riskLevel === "Medium" ? "default" : 
                                        "secondary"
                                      }
                                      className="text-xs mt-1"
                                    >
                                      {assessment.riskLevel}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="border border-gray-300 p-2 align-top">
                                  <div className="space-y-1">
                                    {assessment.controlMeasures?.map((measure: string, mIndex: number) => (
                                      <div key={mIndex} className="text-xs">• {measure}</div>
                                    ))}
                                  </div>
                                  {assessment.ppe && assessment.ppe.length > 0 && (
                                    <div className="mt-2 p-1 bg-blue-50 rounded">
                                      <div className="font-medium text-xs text-blue-700">PPE Required:</div>
                                      <div className="text-xs text-blue-600">{assessment.ppe.join(', ')}</div>
                                    </div>
                                  )}
                                  {assessment.responsible && (
                                    <div className="mt-2 p-1 bg-green-50 rounded">
                                      <div className="font-medium text-xs text-green-700">Responsible:</div>
                                      <div className="text-xs text-green-600">{assessment.responsible}</div>
                                    </div>
                                  )}
                                </td>
                                <td className="border border-gray-300 p-2 align-top">
                                  <div className="space-y-1">
                                    {assessment.legislation?.map((law: string, lIndex: number) => (
                                      <div key={lIndex} className="text-xs">• {law}</div>
                                    ))}
                                  </div>
                                </td>
                                <td className="border border-gray-300 p-2 text-center align-top">
                                  <div className="flex flex-col items-center">
                                    <span className="font-bold text-lg">{assessment.residualRiskScore}</span>
                                    <Badge 
                                      variant={
                                        assessment.residualRiskLevel === "High" || assessment.residualRiskLevel === "Extreme" ? "destructive" : 
                                        assessment.residualRiskLevel === "Medium" ? "default" : 
                                        "secondary"
                                      }
                                      className="text-xs mt-1"
                                    >
                                      {assessment.residualRiskLevel}
                                    </Badge>
                                  </div>
                                </td>
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

                  {/* Document Footer with Legal Disclaimers */}
                  <Separator className="my-6" />
                  
                  {/* Final Legal Notice */}
                  <div className="mb-6 p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                    <div className="text-center">
                      <h4 className="font-bold text-gray-800 mb-3">FINAL LEGAL NOTICE & DISCLAIMER</h4>
                      <div className="text-xs text-gray-700 space-y-2">
                        <p><strong>NO LIABILITY:</strong> Safety Samurai, its operators, developers, and affiliates accept NO LIABILITY for any incidents, accidents, injuries, property damage, or fatalities arising from the use of this SWMS document.</p>
                        <p><strong>TEMPLATE ONLY:</strong> This document is a TEMPLATE and must be reviewed, modified, and approved by qualified safety professionals and relevant authorities before use.</p>
                        <p><strong>CONTRACTOR RESPONSIBILITY:</strong> The contractor using this document is solely responsible for ensuring compliance with all applicable laws, regulations, Australian Standards, and workplace safety requirements.</p>
                        <p><strong>SITE-SPECIFIC REQUIREMENTS:</strong> This document must be adapted to site-specific conditions, hazards, and requirements. Generic control measures may not be adequate for all situations.</p>
                        <p><strong>PROFESSIONAL REVIEW REQUIRED:</strong> A qualified safety professional must review and approve this SWMS before work commences.</p>
                        <p><strong>INDEMNIFICATION:</strong> By using this document, you agree to indemnify and hold harmless Safety Samurai from any claims, damages, or liabilities.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Generated by: {user?.username}</span>
                    </div>
                    <div className="flex items-center">
                      <span>Document ID: SWM-{documentToDisplay.id} | Generated: {new Date().toLocaleDateString('en-AU')}</span>
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
