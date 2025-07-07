import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Download, FileText, CheckCircle } from "lucide-react";
import type { SwmsFormData } from "./swms-form";

// Types for SWMSprint integration
interface DocumentPage {
  id: string;
  title: string;
  completed: boolean;
}

interface SWMSPrintGeneratorProps {
  formData: SwmsFormData;
  updateFormData: (updates: Partial<SwmsFormData>) => void;
  onComplete: () => void;
}

const initialPages: DocumentPage[] = [
  { id: 'project-info', title: 'Project Information', completed: false },
  { id: 'work-activities', title: 'Work Activities', completed: false },
  { id: 'risk-assessment', title: 'Risk Assessment', completed: false },
  { id: 'ppe-equipment', title: 'PPE & Equipment', completed: false },
  { id: 'emergency', title: 'Emergency Procedures', completed: false },
  { id: 'review', title: 'Document Review', completed: false }
];

export default function SWMSPrintGenerator({ 
  formData, 
  updateFormData, 
  onComplete 
}: SWMSPrintGeneratorProps) {
  const [currentPage, setCurrentPage] = useState<string>('project-info');
  const [pages, setPages] = useState<DocumentPage[]>(initialPages);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);

  const handleInputChange = (field: keyof SwmsFormData, value: any) => {
    updateFormData({ [field]: value });
  };

  const markPageComplete = (pageId: string) => {
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, completed: true } : page
    ));
  };

  const handleNextPage = () => {
    const currentIndex = pages.findIndex(p => p.id === currentPage);
    if (currentIndex < pages.length - 1) {
      markPageComplete(currentPage);
      setCurrentPage(pages[currentIndex + 1].id);
    }
  };

  const handlePrevPage = () => {
    const currentIndex = pages.findIndex(p => p.id === currentPage);
    if (currentIndex > 0) {
      setCurrentPage(pages[currentIndex - 1].id);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      // Generate PDF using internal SWMSprint functionality
      const response = await fetch('/api/swms/pdf-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          swmsId: formData.id,
          ...formData 
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `SWMS_${formData.projectName || 'Document'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setDownloadReady(true);
        onComplete();
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentPageData = pages.find(p => p.id === currentPage);
  const isLastPage = currentPage === pages[pages.length - 1].id;
  const currentIndex = pages.findIndex(p => p.id === currentPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-riskify-green">Riskify</div>
              <div className="ml-4 text-gray-600">SWMS Generator</div>
            </div>
            <div className="text-sm text-gray-500">Safe Work Method Statement</div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              {pages.map((page, index) => (
                <div key={page.id} className="flex items-center">
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      page.completed ? 'bg-green-500 text-white' :
                      page.id === currentPage ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {page.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${
                    page.id === currentPage ? 'text-blue-600 font-medium' :
                    page.completed ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {page.title}
                  </span>
                  {index < pages.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {currentPageData?.title}
            </h1>
            <p className="text-gray-600 mb-6">
              Complete the information below to generate your professional SWMS document
            </p>

            {/* Page Content */}
            {currentPage === 'project-info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input 
                      id="projectName" 
                      value={formData.projectName || ''}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                      className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobNumber">Job Number</Label>
                    <Input 
                      id="jobNumber" 
                      value={formData.jobNumber || ''}
                      onChange={(e) => handleInputChange('jobNumber', e.target.value)}
                      className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="projectAddress">Project Address</Label>
                    <Input 
                      id="projectAddress" 
                      value={formData.projectAddress || ''}
                      onChange={(e) => handleInputChange('projectAddress', e.target.value)}
                      className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'work-activities' && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="workDescription">Work Description</Label>
                  <Textarea 
                    id="workDescription" 
                    value={formData.workDescription || ''}
                    onChange={(e) => handleInputChange('workDescription', e.target.value)}
                    className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                    rows={4}
                    placeholder="Describe the work activities to be performed..."
                  />
                </div>
                <div>
                  <Label htmlFor="tradeType">Trade Type</Label>
                  <Input 
                    id="tradeType" 
                    value={formData.tradeType || ''}
                    onChange={(e) => handleInputChange('tradeType', e.target.value)}
                    className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                    placeholder="e.g., Electrical, Plumbing, Carpentry"
                  />
                </div>
              </div>
            )}

            {currentPage === 'review' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-green-900">
                        Document Ready for Generation
                      </h3>
                      <p className="text-green-700 mt-1">
                        All sections completed. Click below to generate your professional SWMS PDF.
                      </p>
                    </div>
                  </div>
                </div>

                {downloadReady && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-blue-900">
                          PDF Generated Successfully
                        </h3>
                        <p className="text-blue-700 mt-1">
                          Your SWMS document has been downloaded to your device.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentIndex === 0}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {isLastPage ? (
                <Button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="flex items-center bg-riskify-green hover:bg-riskify-green/90"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNextPage}
                  className="flex items-center bg-riskify-green hover:bg-riskify-green/90"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}