import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Info, AlertCircle, Lightbulb } from "lucide-react";

interface SmartTooltipProps {
  content: string;
  children: ReactNode;
  type?: "info" | "help" | "warning" | "tip";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  showIcon?: boolean;
}

export default function SmartTooltip({ 
  content, 
  children, 
  type = "info", 
  side = "top",
  className = "",
  showIcon = false
}: SmartTooltipProps) {
  const getIcon = () => {
    switch (type) {
      case "help":
        return <HelpCircle className="w-3 h-3 text-primary" />;
      case "warning":
        return <AlertCircle className="w-3 h-3 text-orange-500" />;
      case "tip":
        return <Lightbulb className="w-3 h-3 text-yellow-500" />;
      default:
        return <Info className="w-3 h-3 text-gray-500" />;
    }
  };

  const getContentClass = () => {
    switch (type) {
      case "help":
        return "bg-primary/10 border-primary/20 text-primary";
      case "warning":
        return "bg-orange-50 border-orange-200 text-orange-900";
      case "tip":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      default:
        return "bg-white border-gray-200 text-gray-900";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 ${className}`}>
            {children}
            {showIcon && getIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className={`max-w-xs p-3 text-sm ${getContentClass()}`}
        >
          <div className="flex items-start gap-2">
            {getIcon()}
            <span>{content}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}