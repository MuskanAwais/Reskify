import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, RefreshCw, FileText, Image, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VisualPDFPreviewerProps {
  formData: any;
  isVisible?: boolean;
  className?: string;
}

export default function VisualPDFPreviewer({ 
  formData, 
  isVisible = true,
  className = "" 
}: VisualPDFPreviewerProps) {
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const { toast } = useToast();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced update function to avoid excessive API calls
  useEffect(() => {
    if (!isVisible || !formData) return;

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout for debounced update
    updateTimeoutRef.current = setTimeout(() => {
      updatePreview();
    }, 1000); // 1 second delay

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [formData, isVisible]);

  const updatePreview = async () => {
    if (!formData || Object.keys(formData).length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Transform form data to match RiskTemplateBuilder expected format
      const templateData = transformFormDataForPreview(formData);
      
      // Try to send data to RiskTemplateBuilder for visual preview
      try {
        const response = await fetch('https://risktemplatebuilder.replit.app/api/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(templateData)
        });

        if (response.ok) {
          const previewResult = await response.json();
          setPreviewData(previewResult);
          setLastUpdate(Date.now());
        } else {
          throw new Error('RiskTemplateBuilder preview not available');
        }
      } catch (previewError) {
        // Fallback to local preview generation
        setPreviewData(generateLocalPreview(formData));
        setLastUpdate(Date.now());
        setError('Using local preview (RiskTemplateBuilder preview unavailable)');
      }
    } catch (error) {
      console.error('Preview update error:', error);
      // Generate local preview as fallback
      setPreviewData(generateLocalPreview(formData));
      setError('Connected to local preview (RiskTemplateBuilder unavailable)');
      setLastUpdate(Date.now());
    } finally {
      setIsLoading(false);
    }
  };

  const transformFormDataForPreview = (data: any) => {
    return {
      projectName: data.jobName || 'Untitled Project',
      jobNumber: data.jobNumber || 'JOB-001',
      projectAddress: data.projectAddress || 'Project Location',
      swmsCreatorName: data.swmsCreatorName || 'SWMS Creator',
      swmsCreatorPosition: data.swmsCreatorPosition || 'Position',
      principalContractor: data.principalContractor || 'Principal Contractor',
      projectManager: data.projectManager || 'Project Manager',
      siteSupervisor: data.siteSupervisor || 'Site Supervisor',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      tradeType: data.tradeType || 'General Construction',
      companyLogo: data.companyLogo || null,
      companyLogoFilename: data.companyLogoFilename || null,
      activities: data.selectedActivities || [],
      riskAssessments: data.selectedActivities?.map((activity: any, index: number) => ({
        activity: activity.name || activity.activity || `Activity ${index + 1}`,
        hazards: activity.hazards || [],
        initialRisk: activity.initialRisk || 'Medium',
        controlMeasures: activity.controlMeasures || [],
        residualRisk: activity.residualRisk || 'Low',
        legislation: activity.legislation || 'WHS Act 2011'
      })) || [],
      plantEquipment: data.equipment || [],
      ppeRequirements: data.selectedPPE || [],
      hrcwCategories: data.selectedHRCW || [],
      emergencyProcedures: data.emergencyProcedures || [],
      preview: true // Flag to indicate this is for preview
    };
  };

  const generateLocalPreview = (data: any) => {
    return {
      projectInfo: {
        name: data.jobName || 'Untitled Project',
        number: data.jobNumber || 'JOB-001',
        address: data.projectAddress || 'Project Location',
        creator: data.swmsCreatorName || 'SWMS Creator',
        position: data.swmsCreatorPosition || 'Position',
        contractor: data.principalContractor || 'Principal Contractor',
        manager: data.projectManager || 'Project Manager',
        supervisor: data.siteSupervisor || 'Site Supervisor',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        trade: data.tradeType || 'General Construction'
      },
      sections: {
        activities: data.selectedActivities?.length || 0,
        equipment: data.equipment?.length || 0,
        ppe: data.selectedPPE?.length || 0,
        hrcw: data.selectedHRCW?.length || 0,
        emergency: data.emergencyProcedures?.length || 0
      },
      completeness: calculateCompleteness(data),
      lastUpdated: new Date().toLocaleTimeString()
    };
  };

  const calculateCompleteness = (data: any) => {
    const requiredFields = [
      'jobName', 'jobNumber', 'projectAddress', 'swmsCreatorName', 
      'swmsCreatorPosition', 'principalContractor', 'projectManager', 
      'siteSupervisor', 'startDate', 'tradeType'
    ];
    
    const filledFields = requiredFields.filter(field => data[field] && data[field].trim() !== '');
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  const handleRefresh = () => {
    updatePreview();
    toast({
      title: "Preview Updated",
      description: "PDF preview has been refreshed with current data",
    });
  };

  if (!isVisible) return null;

  return (
    <Card className={`mt-6 border-blue-200 bg-blue-50/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Live PDF Preview
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {previewData ? (
          <div className="space-y-4">
            {/* Project Header Preview */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {formData.companyLogo && (
                    <img 
                      src={formData.companyLogo} 
                      alt="Company Logo" 
                      className="h-12 w-auto rounded border"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {previewData.projectInfo?.name || 'Project Name'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Job #{previewData.projectInfo?.number || 'JOB-001'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {previewData.completeness || 0}% Complete
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-600 truncate">{previewData.projectInfo?.address || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Trade:</span>
                  <p className="text-gray-600">{previewData.projectInfo?.trade || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SWMS Creator:</span>
                  <p className="text-gray-600">{previewData.projectInfo?.creator || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Start Date:</span>
                  <p className="text-gray-600">{previewData.projectInfo?.startDate || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Sections Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="bg-white rounded p-3 text-center border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">
                  {previewData.sections?.activities || 0}
                </div>
                <div className="text-xs text-gray-600">Activities</div>
              </div>
              <div className="bg-white rounded p-3 text-center border border-gray-200">
                <div className="text-2xl font-bold text-green-600">
                  {previewData.sections?.equipment || 0}
                </div>
                <div className="text-xs text-gray-600">Equipment</div>
              </div>
              <div className="bg-white rounded p-3 text-center border border-gray-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {previewData.sections?.ppe || 0}
                </div>
                <div className="text-xs text-gray-600">PPE Items</div>
              </div>
              <div className="bg-white rounded p-3 text-center border border-gray-200">
                <div className="text-2xl font-bold text-red-600">
                  {previewData.sections?.hrcw || 0}
                </div>
                <div className="text-xs text-gray-600">HRCW</div>
              </div>
              <div className="bg-white rounded p-3 text-center border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">
                  {previewData.sections?.emergency || 0}
                </div>
                <div className="text-xs text-gray-600">Emergency</div>
              </div>
            </div>

            {/* Personnel Preview */}
            {(previewData.projectInfo?.contractor || previewData.projectInfo?.manager || previewData.projectInfo?.supervisor) && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Project Personnel</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Principal Contractor:</span>
                    <p className="text-gray-600">{previewData.projectInfo?.contractor || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Project Manager:</span>
                    <p className="text-gray-600">{previewData.projectInfo?.manager || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Site Supervisor:</span>
                    <p className="text-gray-600">{previewData.projectInfo?.supervisor || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Live Update Status */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Last updated: {previewData.lastUpdated || new Date().toLocaleTimeString()}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Preview Active
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Enter project details to see live preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}