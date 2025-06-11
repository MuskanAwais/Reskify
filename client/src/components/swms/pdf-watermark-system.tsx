import React from 'react';

interface ProjectWatermarkData {
  projectName: string;
  projectNumber: string;
  projectAddress: string;
  companyName?: string;
  documentDate?: string;
}

interface PDFWatermarkSystemProps {
  projectData: ProjectWatermarkData;
  pageNumber: number;
  totalPages: number;
  includeRiskifyLogo?: boolean;
}

// Riskify Logo SVG Component
const RiskifyLogo = ({ className = "w-20 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 140 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="riskifyPdfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Shield Icon */}
    <g transform="translate(2, 2)">
      <path
        d="M12 2L20 5V12C20 16 16 19 12 22C8 19 4 16 4 12V5L12 2Z"
        fill="url(#riskifyPdfGrad)"
        stroke="#ffffff"
        strokeWidth="0.5"
      />
      <path
        d="M12 4L17 6V11C17 14 14.5 16 12 18C9.5 16 7 14 7 11V6L12 4Z"
        fill="#ffffff"
        fillOpacity="0.15"
      />
      <circle cx="12" cy="10" r="2" fill="#ffffff" fillOpacity="0.8" />
      <path
        d="M9 16C9 17 10 18 12 18C14 18 15 17 15 16H9Z"
        fill="#ffffff"
        fillOpacity="0.6"
      />
    </g>
    
    {/* RISKIFY Text */}
    <text
      x="28"
      y="18"
      fontFamily="Arial, sans-serif"
      fontSize="14"
      fontWeight="bold"
      fill="url(#riskifyPdfGrad)"
    >
      Riskify
    </text>
    
    {/* Tagline */}
    <text
      x="28"
      y="26"
      fontFamily="Arial, sans-serif"
      fontSize="7"
      fill="#666666"
    >
      Professional SWMS Builder
    </text>
  </svg>
);

export default function PDFWatermarkSystem({ 
  projectData, 
  pageNumber, 
  totalPages, 
  includeRiskifyLogo = true 
}: PDFWatermarkSystemProps) {
  
  const generateWatermarkStyles = (): React.CSSProperties => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1000,
    fontFamily: 'Arial, sans-serif'
  });

  const formatProjectInfo = (data: ProjectWatermarkData): string => {
    const parts = [];
    
    if (data.projectName) {
      parts.push(`Project: ${data.projectName}`);
    }
    
    if (data.projectNumber) {
      parts.push(`Job No: ${data.projectNumber}`);
    }
    
    if (data.projectAddress) {
      parts.push(`Address: ${data.projectAddress}`);
    }
    
    return parts.join(' | ');
  };

  const watermarkText = formatProjectInfo(projectData);

  return (
    <div style={generateWatermarkStyles()}>
      {/* Header Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '10mm',
          left: '10mm',
          right: '10mm',
          height: '15mm',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '2mm'
        }}
      >
        {/* Left side - Project Information */}
        <div
          style={{
            fontSize: '8pt',
            color: '#0F4037',
            fontWeight: 'bold',
            maxWidth: '70%',
            lineHeight: '1.2'
          }}
        >
          {watermarkText}
        </div>
        
        {/* Right side - Riskify Logo */}
        {includeRiskifyLogo && (
          <div style={{ flexShrink: 0 }}>
            <RiskifyLogo className="w-20 h-8" />
          </div>
        )}
      </div>

      {/* Footer Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: '10mm',
          left: '10mm',
          right: '10mm',
          height: '10mm',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e0e0e0',
          paddingTop: '2mm'
        }}
      >
        {/* Left side - Document info */}
        <div
          style={{
            fontSize: '7pt',
            color: '#666666'
          }}
        >
          <div>SWMS Document</div>
          {projectData.documentDate && (
            <div>Generated: {new Date(projectData.documentDate).toLocaleDateString('en-AU')}</div>
          )}
        </div>

        {/* Center - Project Reference */}
        <div
          style={{
            fontSize: '7pt',
            color: '#0F4037',
            fontWeight: 'bold',
            textAlign: 'center',
            maxWidth: '50%'
          }}
        >
          {projectData.projectNumber && (
            <div>Job: {projectData.projectNumber}</div>
          )}
          {projectData.projectName && (
            <div style={{ fontSize: '6pt', marginTop: '1mm' }}>
              {projectData.projectName}
            </div>
          )}
        </div>

        {/* Right side - Page info */}
        <div
          style={{
            fontSize: '7pt',
            color: '#666666',
            textAlign: 'right'
          }}
        >
          <div>Page {pageNumber} of {totalPages}</div>
          <div style={{ fontSize: '6pt', marginTop: '1mm' }}>
            Generated by Riskify
          </div>
        </div>
      </div>

      {/* Side Watermark (Vertical) */}
      <div
        style={{
          position: 'absolute',
          right: '2mm',
          top: '50%',
          transform: 'rotate(90deg) translateX(50%)',
          transformOrigin: 'center',
          fontSize: '6pt',
          color: '#e0e0e0',
          fontWeight: 'bold',
          letterSpacing: '2px',
          whiteSpace: 'nowrap'
        }}
      >
        {projectData.projectNumber ? `${projectData.projectNumber} | ${projectData.projectName || 'SWMS'}` : 'RISKIFY SWMS'}
      </div>

      {/* Diagonal Background Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          fontSize: '24pt',
          color: '#f5f5f5',
          fontWeight: 'bold',
          letterSpacing: '4px',
          whiteSpace: 'nowrap',
          zIndex: -1
        }}
      >
        {projectData.projectNumber || 'RISKIFY SWMS'}
      </div>
    </div>
  );
}

// CSS for print media
export const printWatermarkStyles = `
@media print {
  .watermark-container {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    pointer-events: none !important;
    z-index: 1000 !important;
  }
  
  .watermark-header {
    position: absolute !important;
    top: 10mm !important;
    left: 10mm !important;
    right: 10mm !important;
    height: 15mm !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-bottom: 1px solid #e0e0e0 !important;
    padding-bottom: 2mm !important;
    page-break-inside: avoid !important;
  }
  
  .watermark-footer {
    position: absolute !important;
    bottom: 10mm !important;
    left: 10mm !important;
    right: 10mm !important;
    height: 10mm !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-top: 1px solid #e0e0e0 !important;
    padding-top: 2mm !important;
    page-break-inside: avoid !important;
  }
  
  .watermark-project-info {
    font-size: 8pt !important;
    color: #0F4037 !important;
    font-weight: bold !important;
    max-width: 70% !important;
    line-height: 1.2 !important;
  }
  
  .watermark-page-info {
    font-size: 7pt !important;
    color: #666666 !important;
  }
  
  .watermark-background {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) rotate(-45deg) !important;
    font-size: 24pt !important;
    color: #f5f5f5 !important;
    font-weight: bold !important;
    letter-spacing: 4px !important;
    white-space: nowrap !important;
    z-index: -1 !important;
  }
}

@page {
  margin: 20mm 15mm 20mm 15mm;
  
  @top-center {
    content: "";
  }
  
  @bottom-center {
    content: "";
  }
}
`;