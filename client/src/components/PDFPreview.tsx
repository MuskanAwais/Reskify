import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, Loader2 } from 'lucide-react';

interface PDFPreviewProps {
  swmsData: any;
  swmsId?: number;
  onDownload?: () => void;
  buttonText?: string;
  variant?: 'outline' | 'default' | 'secondary';
}

export function PDFPreview({ swmsData, onDownload, buttonText = "Preview PDF", variant = "outline" }: PDFPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generatePreview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/swms/pdf-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swmsData),
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        console.log('PDF blob size:', blob.size, 'type:', blob.type);
        
        if (blob.size > 0 && blob.type === 'application/pdf') {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } else {
          console.error('Invalid PDF blob received:', blob.size, blob.type);
        }
      } else {
        console.error('PDF preview failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error generating PDF preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!pdfUrl) {
      generatePreview();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      try {
        const response = await fetch('/api/swms/pdf-download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(swmsData),
          credentials: 'include'
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${swmsData.title || 'SWMS'}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} onClick={handleOpen} className="gap-2">
          <Eye className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>PDF Preview - {swmsData.title || 'SWMS Document'}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generatePreview}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Refresh Preview
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Generating PDF preview...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="w-full h-full">
              <object
                data={pdfUrl}
                type="application/pdf"
                className="w-full h-full border rounded-lg"
              >
                <div className="flex items-center justify-center h-full bg-gray-50 border rounded-lg">
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">PDF preview not supported in this browser</p>
                    <Button
                      onClick={() => window.open(pdfUrl, '_blank')}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Open PDF in New Tab
                    </Button>
                  </div>
                </div>
              </object>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Click "Refresh Preview" to generate PDF preview</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}