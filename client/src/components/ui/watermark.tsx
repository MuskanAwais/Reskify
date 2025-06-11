import React from 'react';

interface WatermarkProps {
  companyName?: string;
  projectName?: string;
  projectNumber?: string;
  projectAddress?: string;
  brandName?: string;
  className?: string;
}

export default function Watermark({ 
  companyName = "Test Company",
  projectName = "Office Renovation Project",
  projectNumber = "PRJ-2025-001", 
  projectAddress = "123 Construction Lane, Sydney NSW 2000",
  brandName = "Riskify",
  className = ""
}: WatermarkProps) {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{ 
        background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 100px,
          rgba(59, 130, 246, 0.03) 100px,
          rgba(59, 130, 246, 0.03) 200px
        )`
      }}
    >
      {/* Main watermark pattern */}
      <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-32 p-16">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="text-center transform rotate-12 select-none"
            style={{
              color: 'rgba(59, 130, 246, 0.08)',
              fontSize: 'clamp(1rem, 3vw, 2rem)',
              fontWeight: '700',
              lineHeight: '1.3',
              textShadow: '0 0 10px rgba(59, 130, 246, 0.1)'
            }}
          >
            <div className="text-2xl font-bold mb-1">
              {companyName}
            </div>
            <div className="text-lg font-semibold mb-1 opacity-80">
              {projectName}
            </div>
            <div className="text-sm font-medium mb-1 opacity-70">
              {projectNumber}
            </div>
            <div className="text-xs font-medium mb-1 opacity-60">
              {projectAddress}
            </div>
            <div className="text-sm font-medium opacity-70">
              {brandName}
            </div>
          </div>
        ))}
      </div>
      
      {/* Corner watermarks for better coverage */}
      <div 
        className="absolute top-8 right-8 text-center transform rotate-12 select-none"
        style={{
          color: 'rgba(59, 130, 246, 0.1)',
          fontSize: '1rem',
          fontWeight: '700',
          lineHeight: '1.3'
        }}
      >
        <div className="text-lg font-bold mb-1">
          {companyName}
        </div>
        <div className="text-sm font-semibold mb-1 opacity-80">
          {projectName}
        </div>
        <div className="text-xs font-medium mb-1 opacity-70">
          {projectNumber}
        </div>
        <div className="text-xs font-medium mb-1 opacity-60">
          {projectAddress}
        </div>
        <div className="text-xs font-medium opacity-70">
          {brandName}
        </div>
      </div>
      
      <div 
        className="absolute bottom-8 left-8 text-center transform rotate-12 select-none"
        style={{
          color: 'rgba(59, 130, 246, 0.1)',
          fontSize: '1rem',
          fontWeight: '700',
          lineHeight: '1.3'
        }}
      >
        <div className="text-lg font-bold mb-1">
          {companyName}
        </div>
        <div className="text-sm font-semibold mb-1 opacity-80">
          {projectName}
        </div>
        <div className="text-xs font-medium mb-1 opacity-70">
          {projectNumber}
        </div>
        <div className="text-xs font-medium mb-1 opacity-60">
          {projectAddress}
        </div>
        <div className="text-xs font-medium opacity-70">
          {brandName}
        </div>
      </div>
    </div>
  );
}