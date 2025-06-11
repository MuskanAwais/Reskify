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
      {/* Your Actual Riskify Logo */}
      <img 
        src="/assets/riskify-logo.png" 
        alt="Riskify"
        className={`${size === 'xl' ? 'h-16' : size === 'lg' ? 'h-12' : size === 'md' ? 'h-10' : 'h-8'} w-auto object-contain`}
      />
    </div>
  );
};

export default Logo;