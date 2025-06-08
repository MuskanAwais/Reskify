import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Printer, 
  Download, 
  FileText, 
  Check, 
  Settings,
  Eye,
  PenTool
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PDFPrintSystemProps {
  swmsId: string;
  swmsTitle: string;
  formData: any;
  signatures: any[];
  isCompliant: boolean;
}

export default function PDFPrintSystem({ 
  swmsId, 
  swmsTitle, 
  formData, 
  signatures, 
  isCompliant 
}: PDFPrintSystemProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    includeSignatures: true,
    includeLegislation: true,
    includeRiskMatrix: true,
    includeCompliance: true,
    paperSize: 'A4',
    orientation: 'portrait',
    copies: 1
  });

  const generatePDF = async (download = true) => {
    try {
      setIsGenerating(true);
      
      const response = await apiRequest('POST', `/api/swms/${swmsId}/generate-pdf`, {
        includeSignatures: printOptions.includeSignatures,
        includeLegislation: printOptions.includeLegislation,
        includeRiskMatrix: printOptions.includeRiskMatrix,
        includeCompliance: printOptions.includeCompliance,
        formData,
        signatures,
        printOptions
      });
      
      if (download) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${swmsTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_complete.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "PDF Generated",
          description: "Your SWMS document has been downloaded successfully",
        });
      }
      
      return response;
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const printDocument = async () => {
    try {
      setIsPrinting(true);
      
      // Generate PDF for printing
      const response = await generatePDF(false);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        try {
          // Print the document
          iframe.contentWindow?.print();
          
          toast({
            title: "Print Initiated",
            description: "Your document has been sent to the printer",
          });
          
          // Clean up after a delay
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.URL.revokeObjectURL(url);
          }, 1000);
        } catch (error) {
          toast({
            title: "Print Failed",
            description: "Unable to print document. Please try downloading instead.",
            variant: "destructive",
          });
          document.body.removeChild(iframe);
          window.URL.revokeObjectURL(url);
        }
      };
    } catch (error) {
      toast({
        title: "Print Failed",
        description: "Failed to prepare document for printing",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const previewDocument = async () => {
    try {
      const response = await generatePDF(false);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open PDF in new tab for preview
      window.open(url, '_blank');
      
      // Clean up URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000); // Clean up after 1 minute
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Failed to generate document preview",
        variant: "destructive",
      });
    }
  };

  const allSigned = signatures.length > 0 && signatures.every(s => s.status === 'signed');
  const readyForFinalOutput = isCompliant && allSigned;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Output Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Check */}
            <Alert variant={readyForFinalOutput ? "default" : "destructive"}>
              <Check className="h-4 w-4" />
              <AlertDescription>
                {readyForFinalOutput 
                  ? "Document is ready for final output with all signatures and compliance requirements met."
                  : `Document status: ${!isCompliant ? 'Compliance validation required. ' : ''}${!allSigned ? `${signatures.length - signatures.filter(s => s.status === 'signed').length} signatures pending.` : ''}`
                }
              </AlertDescription>
            </Alert>

            {/* Print Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Include in Document</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="signatures"
                      checked={printOptions.includeSignatures}
                      onCheckedChange={(checked) => 
                        setPrintOptions(prev => ({ ...prev, includeSignatures: !!checked }))
                      }
                    />
                    <label htmlFor="signatures" className="text-sm">Digital Signatures</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="legislation"
                      checked={printOptions.includeLegislation}
                      onCheckedChange={(checked) => 
                        setPrintOptions(prev => ({ ...prev, includeLegislation: !!checked }))
                      }
                    />
                    <label htmlFor="legislation" className="text-sm">Legislation References</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="riskMatrix"
                      checked={printOptions.includeRiskMatrix}
                      onCheckedChange={(checked) => 
                        setPrintOptions(prev => ({ ...prev, includeRiskMatrix: !!checked }))
                      }
                    />
                    <label htmlFor="riskMatrix" className="text-sm">Risk Assessment Matrix</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="compliance"
                      checked={printOptions.includeCompliance}
                      onCheckedChange={(checked) => 
                        setPrintOptions(prev => ({ ...prev, includeCompliance: !!checked }))
                      }
                    />
                    <label htmlFor="compliance" className="text-sm">Compliance Report</label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Print Settings</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">Paper Size</label>
                    <Select
                      value={printOptions.paperSize}
                      onValueChange={(value) => 
                        setPrintOptions(prev => ({ ...prev, paperSize: value }))
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Orientation</label>
                    <Select
                      value={printOptions.orientation}
                      onValueChange={(value) => 
                        setPrintOptions(prev => ({ ...prev, orientation: value }))
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Number of Copies</label>
                    <Select
                      value={String(printOptions.copies)}
                      onValueChange={(value) => 
                        setPrintOptions(prev => ({ ...prev, copies: parseInt(value) }))
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,10].map(num => (
                          <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button
                onClick={previewDocument}
                variant="outline"
                disabled={isGenerating}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Button
                onClick={() => generatePDF(true)}
                disabled={isGenerating}
                variant="default"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
              
              <Button
                onClick={printDocument}
                disabled={isPrinting || isGenerating}
                variant="secondary"
              >
                <Printer className="h-4 w-4 mr-2" />
                {isPrinting ? "Printing..." : "Print Document"}
              </Button>
            </div>

            {/* Send for Signature Option */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Need Signatures?
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                If you need to collect digital signatures on this document, you can send it for signature after generating the PDF.
              </p>
              <Button
                onClick={() => {
                  // Navigate to signature step or open signature modal
                  window.dispatchEvent(new CustomEvent('openSignatureWorkflow', {
                    detail: { swmsId, swmsTitle, formData }
                  }));
                }}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Send for Signature
              </Button>
            </div>

            {/* Print Instructions */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-sm mb-2">Printing Instructions:</h5>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Ensure your printer is connected and has sufficient paper</li>
                <li>• For best results, use {printOptions.paperSize} {printOptions.orientation} paper</li>
                <li>• High-quality printing recommended for signatures and compliance documentation</li>
                <li>• Keep printed copies in a secure location as per workplace safety requirements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}