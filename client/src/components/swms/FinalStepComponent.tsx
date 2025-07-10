import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Download, FileText, ArrowRight, Clock, Users, Shield, Award } from 'lucide-react';

interface FinalStepComponentProps {
  formData: any;
  onDataChange: (data: any) => void;
  onNext?: () => void;
}

const FinalStepComponent: React.FC<FinalStepComponentProps> = ({ formData, onDataChange, onNext }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [documentReady, setDocumentReady] = useState(false);

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate document generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setDocumentReady(true);
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDownload = () => {
    // Trigger document download
    console.log('Downloading document...', formData);
    // Navigate to SwmsComplete interface
    if (onNext) onNext();
  };

  // Document summary stats
  const documentStats = {
    pages: '8 pages',
    activities: formData.workActivities?.length || 0,
    hazards: formData.workActivities?.reduce((acc: number, activity: any) => acc + (activity.hazards?.length || 0), 0) || 0,
    controls: formData.workActivities?.reduce((acc: number, activity: any) => acc + (activity.controlMeasures?.length || 0), 0) || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {documentReady ? 'Your SWMS is Ready!' : 'Complete Your SWMS'}
          </h1>
          <p className="text-gray-600 text-lg">
            {documentReady 
              ? 'Your professional SWMS document has been generated and is ready for download.'
              : 'Review your document details and generate your professional SWMS.'}
          </p>
        </div>

        {/* Document Summary Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-6 w-6" />
              {formData.jobName || 'SWMS Document'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{documentStats.pages}</div>
                <div className="text-sm text-gray-600">Document Length</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{documentStats.activities}</div>
                <div className="text-sm text-gray-600">Work Activities</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{documentStats.hazards}</div>
                <div className="text-sm text-gray-600">Identified Hazards</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{documentStats.controls}</div>
                <div className="text-sm text-gray-600">Control Measures</div>
              </div>
            </div>

            {/* Document Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Project Details</h3>
                  <p className="text-sm text-gray-600">{formData.jobName || 'Unnamed Project'}</p>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {formData.tradeType || 'General'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Location</h3>
                  <p className="text-sm text-gray-600">{formData.projectAddress || 'Not specified'}</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {formData.siteEnvironment || 'Commercial'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Created By</h3>
                  <p className="text-sm text-gray-600">{formData.swmsCreatorName || 'Not specified'}</p>
                </div>
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                  Professional
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generation Progress or Ready State */}
        {!documentReady && !isGenerating && (
          <Card className="mb-8 shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
                <p className="text-gray-600 mb-6">
                  Your SWMS document is ready to be generated. Click the button below to create your professional document.
                </p>
                <Button 
                  onClick={handleGenerateDocument}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Generate SWMS Document
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isGenerating && (
          <Card className="mb-8 shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 animate-pulse">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Generating Your SWMS</h3>
                <p className="text-gray-600 mb-6">
                  Please wait while we create your professional document...
                </p>
                <div className="max-w-md mx-auto">
                  <Progress value={generationProgress} className="mb-2" />
                  <p className="text-sm text-gray-500">{generationProgress}% Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {documentReady && (
          <Card className="mb-8 shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Document Generated Successfully!</h3>
                <p className="text-gray-600 mb-6">
                  Your professional SWMS document is ready for download and use.
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={handleDownload}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download & View
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      // Navigate to edit interface
                      if (onNext) onNext();
                    }}
                    className="px-8 py-3"
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Edit & Customize
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compliance Notice */}
        <Card className="shadow-lg border-0 bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-amber-600 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Compliance Notice</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  This SWMS document is generated based on your inputs and Australian safety standards. 
                  Please review and customize the document to ensure it meets your specific workplace requirements 
                  and complies with all applicable regulations before implementation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinalStepComponent;