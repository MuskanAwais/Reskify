import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RiskTemplateButtonProps {
  swmsData: any;
  label?: string;
  variant?: "default" | "outline" | "secondary";
}

export default function RiskTemplateButton({ 
  swmsData, 
  label = "Generate with RiskTemplate", 
  variant = "outline" 
}: RiskTemplateButtonProps) {
  const { toast } = useToast();
  
  const sendToRiskTemplate = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/risk-template/send", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success && result.pdfUrl) {
        toast({
          title: "PDF Generated",
          description: "Your SWMS has been generated with RiskTemplateBuilder",
        });
        // Open PDF in new tab
        window.open(result.pdfUrl, '_blank');
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate PDF with RiskTemplateBuilder",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: "Could not connect to RiskTemplateBuilder. Using local generation.",
        variant: "destructive",
      });
    }
  });
  
  const handleClick = () => {
    if (!swmsData.jobName || !swmsData.projectAddress) {
      toast({
        title: "Incomplete Data",
        description: "Please complete the project details before generating PDF",
        variant: "destructive",
      });
      return;
    }
    
    sendToRiskTemplate.mutate(swmsData);
  };
  
  return (
    <Button 
      variant={variant}
      onClick={handleClick}
      disabled={sendToRiskTemplate.isPending}
      className="gap-2"
    >
      {sendToRiskTemplate.isPending ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          Generating...
        </>
      ) : (
        <>
          <ExternalLink className="w-4 h-4" />
          {label}
        </>
      )}
    </Button>
  );
}