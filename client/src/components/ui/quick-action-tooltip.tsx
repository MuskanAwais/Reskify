import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MousePointer2, 
  Keyboard, 
  Zap, 
  Info, 
  Command,
  HelpCircle
} from "lucide-react";

interface QuickActionTooltipProps {
  children: ReactNode;
  title: string;
  description: string;
  shortcuts?: Array<{
    key: string;
    action: string;
  }>;
  actions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  }>;
  tips?: string[];
  category?: "editing" | "navigation" | "creation" | "safety" | "general";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
}

const categoryIcons = {
  editing: <Keyboard className="h-3 w-3" />,
  navigation: <MousePointer2 className="h-3 w-3" />,
  creation: <Zap className="h-3 w-3" />,
  safety: <Info className="h-3 w-3" />,
  general: <HelpCircle className="h-3 w-3" />
};

const categoryColors = {
  editing: "bg-primary/10 text-primary dark:text-primary",
  navigation: "bg-primary/10 text-primary dark:text-primary",
  creation: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  safety: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  general: "bg-gray-500/10 text-gray-700 dark:text-gray-300"
};

export default function QuickActionTooltip({
  children,
  title,
  description,
  shortcuts = [],
  actions = [],
  tips = [],
  category = "general",
  side = "top",
  align = "center",
  delayDuration = 300
}: QuickActionTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className="max-w-80 p-0"
          sideOffset={8}
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`${categoryColors[category]} px-2 py-1 text-xs font-medium`}
                >
                  {categoryIcons[category]}
                  <span className="ml-1 capitalize">{category}</span>
                </Badge>
              </div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mt-2">
                {title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            </div>

            {/* Quick Actions */}
            {actions.length > 0 && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Actions
                </div>
                <div className="flex flex-wrap gap-1">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={action.variant || "outline"}
                      onClick={action.onClick}
                      className="h-7 px-2 text-xs"
                    >
                      {action.icon && <span className="mr-1">{action.icon}</span>}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            {shortcuts.length > 0 && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <Command className="h-3 w-3" />
                  Shortcuts
                </div>
                <div className="space-y-1">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{shortcut.action}</span>
                      <Badge variant="outline" className="text-xs px-1 py-0.5 font-mono">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pro Tips */}
            {tips.length > 0 && (
              <div className="p-3">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Pro Tips
                </div>
                <ul className="space-y-1">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Preset tooltip configurations for common actions
export const presetTooltips = {
  addTask: {
    title: "Add New Task",
    description: "Create a new work activity with automatic risk assessment",
    category: "creation" as const,
    shortcuts: [
      { key: "Ctrl + N", action: "Quick add task" }
    ],
    tips: [
      "Choose specific activities for better risk assessments",
      "Tasks are automatically sorted by risk level",
      "Use the search function to find pre-built activities"
    ]
  },

  editTask: {
    title: "Edit Task Details",
    description: "Modify task information, hazards, and control measures",
    category: "editing" as const,
    shortcuts: [
      { key: "Enter", action: "New line in text areas" },
      { key: "Ctrl + Enter", action: "Save changes" },
      { key: "Escape", action: "Cancel editing" }
    ],
    tips: [
      "Be specific with hazards for your work environment",
      "Control measures should follow the hierarchy of controls",
      "Include task-specific PPE requirements"
    ]
  },

  riskMatrix: {
    title: "Risk Assessment Matrix",
    description: "Understand risk levels and control requirements",
    category: "safety" as const,
    tips: [
      "Red zones require immediate attention and controls",
      "Yellow zones need monitoring and standard controls",
      "Green zones are acceptable with basic precautions",
      "Always aim to reduce risks to ALARP (As Low As Reasonably Practicable)"
    ]
  },

  generatePDF: {
    title: "Generate SWMS Document",
    description: "Create professional PDF document for site use",
    category: "creation" as const,
    tips: [
      "PDFs include watermarks for document protection",
      "All selected safety codes are automatically included",
      "Documents are compliant with Australian standards"
    ]
  },

  tableEditor: {
    title: "Table Editor",
    description: "Edit risk assessments and safety information",
    category: "editing" as const,
    shortcuts: [
      { key: "Enter", action: "Add new line" },
      { key: "Ctrl + Enter", action: "Save cell" },
      { key: "Tab", action: "Next cell" },
      { key: "Shift + Tab", action: "Previous cell" }
    ],
    tips: [
      "Click any cell to edit directly",
      "Use bullet points for multiple items",
      "Be specific about risks and controls for your site"
    ]
  }
};