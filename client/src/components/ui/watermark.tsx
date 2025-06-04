import React from 'react';

interface WatermarkProps {
  companyName?: string;
  brandName?: string;
  className?: string;
}

export default function Watermark({ 
  companyName = "Test Company", 
  brandName = "Safety Sensei",
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
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            className="text-center transform rotate-12 select-none"
            style={{
              color: 'rgba(59, 130, 246, 0.08)',
              fontSize: 'clamp(1.5rem, 4vw, 3rem)',
              fontWeight: '700',
              lineHeight: '1.2',
              textShadow: '0 0 10px rgba(59, 130, 246, 0.1)'
            }}
          >
            <div className="text-4xl font-bold mb-1">
              {companyName}
            </div>
            <div className="text-lg font-medium opacity-70">
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
          fontSize: '1.8rem',
          fontWeight: '700',
          lineHeight: '1.2'
        }}
      >
        <div className="text-2xl font-bold">
          {companyName}
        </div>
        <div className="text-sm font-medium opacity-70">
          {brandName}
        </div>
      </div>
      
      <div 
        className="absolute bottom-8 left-8 text-center transform rotate-12 select-none"
        style={{
          color: 'rgba(59, 130, 246, 0.1)',
          fontSize: '1.8rem',
          fontWeight: '700',
          lineHeight: '1.2'
        }}
      >
        <div className="text-2xl font-bold">
          {companyName}
        </div>
        <div className="text-sm font-medium opacity-70">
          {brandName}
        </div>
      </div>
    </div>
  );
}