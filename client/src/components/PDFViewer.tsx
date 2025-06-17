import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download, RefreshCw, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  onDownload?: () => void;
}

export function PDFViewer({ pdfUrl, onDownload }: PDFViewerProps) {
  const [pdfSupported, setPdfSupported] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Test if browser supports inline PDF viewing
    const testPDFSupport = () => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs8PAovVHlwZSAvUGFnZQo+Pl0KPj4KZW5kb2JqCnhyZWYKMCAyCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNyAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDIKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjY0CiUlRU9GCg==';
      
      setTimeout(() => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc || doc.querySelector('embed')) {
            setPdfSupported(false);
          }
        } catch (e) {
          setPdfSupported(false);
        }
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1000);
      
      document.body.appendChild(iframe);
    };

    testPDFSupport();
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setPdfSupported(true);
  };

  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  if (!pdfSupported || retryCount > 1) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 border rounded-lg">
        <div className="text-center p-8">
          <ExternalLink className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Preview Not Available</h3>
          <p className="text-gray-600 mb-6">
            Your browser doesn't support inline PDF viewing. Use the button below to open the PDF in a new tab.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={openInNewTab} className="gap-2">
              <Eye className="h-4 w-4" />
              Open PDF in New Tab
            </Button>
            {onDownload && (
              <Button onClick={onDownload} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <iframe
          key={retryCount} // Force reload on retry
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
          className="w-full h-full border rounded-lg"
          title="PDF Preview"
          onLoad={() => {
            console.log('PDF iframe loaded successfully');
            // Check if content is actually loaded
            setTimeout(() => {
              const iframe = document.querySelector('iframe[title="PDF Preview"]') as HTMLIFrameElement;
              if (iframe) {
                try {
                  const doc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (doc && doc.body && doc.body.children.length === 0) {
                    setPdfSupported(false);
                  }
                } catch (e) {
                  // Cross-origin access blocked, which is normal
                }
              }
            }, 2000);
          }}
          onError={() => {
            console.error('PDF iframe failed to load');
            setPdfSupported(false);
          }}
        />
        
        {/* Overlay controls */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={openInNewTab}
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          If the PDF appears blank, click the external link button to open in a new tab
        </p>
      </div>
    </div>
  );
}