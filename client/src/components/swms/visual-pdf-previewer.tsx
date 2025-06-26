import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, RefreshCw, ZoomIn, ZoomOut, Maximize2, ExternalLink } from 'lucide-react';
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

  // Local PDF generation endpoint - using our own server
  const PDF_GENERATOR_URL = `/api/swms/pdf-preview-embed`;

  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      updatePreview();
    }, 500); // 500ms debounce for real-time updates

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [formData]);

  const transformFormDataForAPI = (data: any) => {
    return {
      // Project Information
      jobName: data.jobName || '',
      jobNumber: data.jobNumber || '',
      projectAddress: data.projectAddress || '',
      projectLocation: data.projectLocation || '',
      startDate: data.startDate || '',
      tradeType: data.tradeType || '',
      
      // SWMS Creator fields
      swmsCreatorName: data.swmsCreatorName || '',
      swmsCreatorPosition: data.swmsCreatorPosition || '',
      
      // Personnel
      principalContractor: data.principalContractor || '',
      projectManager: data.projectManager || '',
      siteSupervisor: data.siteSupervisor || '',
      
      // Company branding
      companyLogo: data.companyLogo || null,
      
      // Activities and risk assessment
      selectedActivities: data.selectedActivities || [],
      
      // High-Risk Construction Work
      selectedHRCW: data.selectedHRCW || [],
      hrcwCategories: data.hrcwCategories || [],
      
      // PPE Requirements
      selectedPPE: data.selectedPPE || [],
      ppeRequirements: data.ppeRequirements || [],
      
      // Plant & Equipment
      equipment: data.equipment || [],
      
      // Emergency procedures
      emergencyProcedures: data.emergencyProcedures || [],
      
      // Legal and compliance
      legalDisclaimer: data.legalDisclaimer || false,
      
      // Payment status
      paidAccess: data.paidAccess || false,
      
      // Metadata
      preview: true // Flag to indicate this is for preview
    };
  };

  const updatePreview = async () => {
    if (!formData || Object.keys(formData).length === 0 || !isIframeLoaded) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Send form data to the iframe PDF generator
      const transformedData = transformFormDataForAPI(formData);
      
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Post message to the iframe with form data
        iframeRef.current.contentWindow.postMessage({
          type: 'FORM_DATA_UPDATE',
          data: transformedData
        }, window.location.origin);
      }
      
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('Preview update error:', err);
      // Don't show error for postMessage issues - iframe might still be loading
      if (isIframeLoaded) {
        setError('Failed to update preview');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIsIframeLoaded(true);
    // Trigger initial preview update once iframe is loaded
    setTimeout(() => updatePreview(), 100);
  };

  const handleIframeError = () => {
    console.log('PDF generator iframe failed to load, trying alternative approach');
    setError('PDF generator temporarily unavailable. Click "Open Full" to access the generator directly.');
    setIsIframeLoaded(false);
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

  // Fallback to local PDF preview if external service fails
  const showLocalPreview = async () => {
    try {
      const transformedData = transformFormDataForAPI(formData);
      const response = await fetch('/api/swms/pdf-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Local preview error:', err);
      toast({
        title: "Preview Unavailable",
        description: "Both live and local preview are temporarily unavailable.",
        variant: "destructive",
      });
    }
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
            <div className="flex items-center justify-between p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {error}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={showLocalPreview}
                className="text-xs bg-white hover:bg-gray-50"
              >
                Try Local Preview
              </Button>
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