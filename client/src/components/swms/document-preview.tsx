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
  Target,
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
      // Format data to match current database schema
      console.log('Original formData:', data);
      
      const formattedData = {
        title: data.title || data.jobName || "Untitled Project",
        jobName: data.jobName || data.title || "Untitled Project", 
        jobNumber: data.jobNumber || "AUTO-" + Date.now(),
        projectAddress: data.projectAddress || data.projectLocation || "",
        projectLocation: data.projectLocation || data.projectAddress || "",
        tradeType: data.tradeType || "",
        activities: Array.isArray(data.activities) ? data.activities : [],
        riskAssessments: data.riskAssessments || [],
        safetyMeasures: data.safetyMeasures || [],
        complianceCodes: Array.isArray(data.complianceCodes) ? data.complianceCodes : [],
        userId: user?.id,
        status: "draft",
        aiEnhanced: data.aiEnhanced || false
      };
      
      console.log('Formatted data for SWMS creation:', formattedData);
      
      console.log('Creating SWMS with data:', formattedData);
      
      const response = await apiRequest("POST", "/api/swms", formattedData);
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
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-hidden">
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
                    <div className="relative">
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        SAFE WORK METHOD STATEMENT
                      </h1>
                      <p className="text-lg text-gray-600">{documentToDisplay.title}</p>
                      
                      {/* Watermark - Safety Samurai with Project Details */}
                      <div className="absolute top-0 right-0 opacity-10 text-3xl font-bold text-blue-600 transform rotate-12 pointer-events-none">
                        <div className="text-center">
                          <div className="text-2xl">Safety Samurai</div>
                          <div className="text-sm mt-1">{documentToDisplay.jobName || documentToDisplay.projectDetails?.jobName || "Project Name Required"}</div>
                          <div className="text-xs mt-1">Job: {documentToDisplay.jobNumber || documentToDisplay.projectDetails?.jobNumber || "N/A"}</div>
                          <div className="text-xs mt-1">{documentToDisplay.projectAddress || documentToDisplay.projectDetails?.projectAddress || "Address Required"}</div>
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
                        Document Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium">Generated By:</span>
                          <span className="ml-2">Safety Samurai Platform</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Standards:</span>
                          <span className="ml-2">AS/NZS Standards Compliant</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Document ID:</span>
                          <span className="ml-2">SWM-{documentToDisplay.id}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Version:</span>
                          <span className="ml-2">1.0</span>
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

                  {/* Risk Matrices Reference */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Target className="mr-2 h-5 w-5" />
                      Risk Assessment Reference Matrices
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Risk Matrix */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">Construction Control Risk Matrix</h4>
                        <div className="text-xs">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-1 bg-gray-100">Consequence</th>
                                <th className="border p-1 bg-green-200">Likely</th>
                                <th className="border p-1 bg-yellow-200">Possible</th>
                                <th className="border p-1 bg-orange-200">Unlikely</th>
                                <th className="border p-1 bg-red-200">Very Rare</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border p-1 bg-red-100 font-medium">Extreme</td>
                                <td className="border p-1 bg-red-500 text-white text-center">16</td>
                                <td className="border p-1 bg-red-400 text-white text-center">14</td>
                                <td className="border p-1 bg-orange-400 text-white text-center">11</td>
                                <td className="border p-1 bg-yellow-400 text-center">7</td>
                              </tr>
                              <tr>
                                <td className="border p-1 bg-orange-100 font-medium">High</td>
                                <td className="border p-1 bg-red-400 text-white text-center">15</td>
                                <td className="border p-1 bg-orange-400 text-white text-center">12</td>
                                <td className="border p-1 bg-yellow-400 text-center">8</td>
                                <td className="border p-1 bg-green-400 text-center">4</td>
                              </tr>
                              <tr>
                                <td className="border p-1 bg-yellow-100 font-medium">Medium</td>
                                <td className="border p-1 bg-orange-400 text-white text-center">13</td>
                                <td className="border p-1 bg-yellow-400 text-center">9</td>
                                <td className="border p-1 bg-green-400 text-center">5</td>
                                <td className="border p-1 bg-green-500 text-white text-center">2</td>
                              </tr>
                              <tr>
                                <td className="border p-1 bg-green-100 font-medium">Low</td>
                                <td className="border p-1 bg-yellow-400 text-center">10</td>
                                <td className="border p-1 bg-green-400 text-center">6</td>
                                <td className="border p-1 bg-green-500 text-white text-center">3</td>
                                <td className="border p-1 bg-green-600 text-white text-center">1</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Hierarchy of Controls */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">Hierarchy of Controls</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center bg-green-600 text-white p-2 rounded">
                            <span className="font-medium w-20">1. Elimination</span>
                            <span className="ml-2 text-xs">Physically remove the hazard</span>
                          </div>
                          <div className="flex items-center bg-green-500 text-white p-2 rounded">
                            <span className="font-medium w-20">2. Substitution</span>
                            <span className="ml-2 text-xs">Replace the hazard</span>
                          </div>
                          <div className="flex items-center bg-yellow-500 text-white p-2 rounded">
                            <span className="font-medium w-20">3. Engineering</span>
                            <span className="ml-2 text-xs">Isolate people from hazard</span>
                          </div>
                          <div className="flex items-center bg-orange-500 text-white p-2 rounded">
                            <span className="font-medium w-20">4. Administrative</span>
                            <span className="ml-2 text-xs">Change work practices</span>
                          </div>
                          <div className="flex items-center bg-red-500 text-white p-2 rounded">
                            <span className="font-medium w-20">5. PPE</span>
                            <span className="ml-2 text-xs">Personal protective equipment</span>
                          </div>
                        </div>
                      </div>
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

                  {/* Document Footer */}
                  <Separator className="my-6" />
                  
                  <div className="flex justify-between items-center text-sm text-gray-600 relative">
                    <div className="flex items-center">
                      <span>Company Logo Space</span>
                      <div className="ml-4 w-16 h-8 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs">
                        LOGO
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <span>Document ID: SWM-{documentToDisplay.id}</span>
                      <br />
                      <span>Generated: {new Date().toLocaleDateString('en-AU')} | Safety Samurai Platform</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {documentToDisplay.jobName || documentToDisplay.projectDetails?.jobName || "Project Name Required"}
                        {` - Job: ${documentToDisplay.jobNumber || documentToDisplay.projectDetails?.jobNumber || "Job Number Required"}`}
                      </div>
                    </div>
                    <div className="flex items-center opacity-30">
                      <span className="text-xs font-bold text-blue-600">Safety Samurai</span>
                    </div>
                  </div>

                  {/* Additional Document Protection Watermarks */}
                  <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 transform -rotate-45 text-2xl font-bold text-blue-600">
                      Safety Samurai
                      {documentToDisplay.projectDetails?.jobNumber && (
                        <div className="text-sm">Job: {documentToDisplay.projectDetails.jobNumber}</div>
                      )}
                    </div>
                    <div className="absolute top-3/4 right-1/4 transform rotate-45 text-2xl font-bold text-blue-600">
                      Safety Samurai
                      {documentToDisplay.projectDetails?.jobName && (
                        <div className="text-sm">{documentToDisplay.projectDetails.jobName}</div>
                      )}
                    </div>
                    <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 rotate-12 text-xl font-bold text-blue-600">
                      © Safety Samurai {new Date().getFullYear()}
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
