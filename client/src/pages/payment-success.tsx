import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Extract session ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully. You can now access your SWMS.",
      });
    }
  }, [sessionId, toast]);

  const handleContinue = () => {
    setLocation("/swms-builder?step=6");
  };

  const handleDashboard = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
            <CardDescription>
              Your payment has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              <p>Thank you for your purchase. You now have access to create and download your SWMS documents.</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleContinue} 
                className="w-full"
                size="lg"
              >
                Continue to SWMS Builder
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button 
                onClick={handleDashboard} 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </div>

            {sessionId && (
              <div className="text-xs text-gray-500 text-center">
                <p>Session ID: {sessionId.substring(0, 20)}...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}