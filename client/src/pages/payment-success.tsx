import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Extract session ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsVerifying(false);
        return;
      }

      try {
        // Verify payment with backend
        const response = await apiRequest('GET', `/api/verify-payment/${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setPaymentDetails(data);
          
          // Invalidate user and billing queries to refresh credit balance
          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
          queryClient.invalidateQueries({ queryKey: ['/api/user/billing'] });
          
          toast({
            title: "Payment Verified",
            description: `Your payment has been processed successfully. Updated credit balance: ${data.credits}`,
          });
        } else {
          toast({
            title: "Payment Processing",
            description: "Payment is still being processed. Please check your account in a few minutes.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast({
          title: "Verification Error",
          description: "Unable to verify payment status. Please contact support if needed.",
          variant: "destructive"
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast, queryClient]);

  const handleContinue = () => {
    setLocation("/swms-builder?step=6");
  };

  const handleDashboard = () => {
    setLocation("/dashboard");
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl text-blue-800">Verifying Payment...</CardTitle>
              <CardDescription>
                Please wait while we confirm your payment
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

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

            {paymentDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-sm text-green-800">
                  <p className="font-semibold">Current Credit Balance: {paymentDetails.credits}</p>
                  <p className="text-xs text-green-600 mt-1">Credits have been added to your account</p>
                </div>
              </div>
            )}
            
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