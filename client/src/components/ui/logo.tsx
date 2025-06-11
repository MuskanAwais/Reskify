import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = "md",
  variant = "dark" 
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  const colorClasses = {
    light: "text-white",
    dark: "text-primary"
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Riskify Logo with Icon */}
      <div className="flex items-center gap-3">
        {/* Logo Icon */}
        <div className={`${sizeClasses[size]} flex-shrink-0`}>
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <defs>
              <linearGradient id="riskifyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Shield background */}
            <path
              d="M24 4L40 10V24C40 32 32 38 24 44C16 38 8 32 8 24V10L24 4Z"
              fill="url(#riskifyGrad)"
              stroke="#ffffff"
              strokeWidth="1"
            />
            {/* Inner shield design */}
            <path
              d="M24 8L34 12V22C34 28 29 32 24 36C19 32 14 28 14 22V12L24 8Z"
              fill="#ffffff"
              fillOpacity="0.15"
            />
            {/* Safety symbol */}
            <circle cx="24" cy="20" r="4" fill="#ffffff" fillOpacity="0.8" />
            <path
              d="M24 16L26 18L24 20L22 18Z"
              fill="url(#riskifyGrad)"
            />
            {/* Hard hat outline */}
            <path
              d="M18 28C18 30 20 32 24 32C28 32 30 30 30 28H18Z"
              fill="#ffffff"
              fillOpacity="0.6"
            />
          </svg>
        </div>
        
        {/* Brand Text */}
        <div className="flex flex-col">
          <div className={`font-bold ${size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg'} ${colorClasses[variant]} tracking-tight`}>
            Riskify
          </div>
          <div className={`text-gray-500 ${size === 'xl' ? 'text-base' : size === 'lg' ? 'text-sm' : 'text-xs'} font-medium tracking-wide`}>
            Professional SWMS Builder
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo;