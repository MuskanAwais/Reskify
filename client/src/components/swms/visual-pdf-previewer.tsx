import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, RefreshCw, FileText, Image, AlertCircle, ZoomIn, ZoomOut, Maximize2, ExternalLink } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const { toast } = useToast();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // RiskTemplateBuilder app URL
  const PDF_GENERATOR_URL = 'https://risktemplatebuilder.replit.app';

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

  const handleIframeLoad = () => {
    setIsIframeLoaded(true);
    // Trigger initial preview update once iframe is loaded
    setTimeout(() => updatePreview(), 100);
  };

  const handleIframeError = () => {
    setError('Failed to load PDF generator preview');
    setIsIframeLoaded(false);
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

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openPDFGeneratorInNewTab = () => {
    window.open(PDF_GENERATOR_URL, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className={`mt-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''} ${className}`}>
      <Card className={`border-blue-200 bg-blue-50/30 ${isFullscreen ? 'h-full' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Live PDF Preview
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                RiskTemplateBuilder
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="h-6 w-6 p-0"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={scale >= 2.0}
                  className="h-6 w-6 p-0"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={openPDFGeneratorInNewTab}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Full
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleFullscreen}
                className="text-xs"
              >
                <Maximize2 className="h-3 w-3 mr-1" />
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
              
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
        <CardContent className={`${isFullscreen ? 'h-full overflow-auto' : ''}`}>
          {error && (
            <div className="flex items-center gap-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm mb-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Embedded PDF Generator */}
          <div 
            ref={previewRef}
            className={`relative ${isFullscreen ? 'h-full' : 'h-[800px]'} bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg`}
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${100 / scale}%`,
              height: `${(isFullscreen ? 100 : 800) / scale}px`
            }}
          >
            <iframe
              ref={iframeRef}
              src={PDF_GENERATOR_URL}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="PDF Generator Preview"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
            
            {!isIframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading PDF Generator...</p>
                </div>
              </div>
            )}
          </div>

          {/* Live Update Status */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-4 px-2">
            <span>
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isIframeLoaded ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              {isIframeLoaded ? 'Live Preview Active' : 'Connecting...'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}