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
    dark: "text-blue-600"
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Brand Text Only */}
      <div className="flex flex-col">
        <div className={`font-bold ${size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg'} ${colorClasses[variant]} tracking-tight`}>
          Safety Sensei
        </div>
        <div className={`text-gray-500 ${size === 'xl' ? 'text-base' : size === 'lg' ? 'text-sm' : 'text-xs'} font-medium tracking-wide`}>
          SWMS Builder for Australia
        </div>
      </div>
    </div>
  );
};

export default Logo;