import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Extract session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    console.log('Payment success page - Session ID:', sessionId);

    if (sessionId) {
      // Show success message and redirect to SWMS builder
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully!",
      });
      
      // Redirect back to SWMS builder after a short delay
      setTimeout(() => {
        console.log('Redirecting to SWMS builder...');
        setLocation('/swms-builder?payment_success=true&step=7');
      }, 2000);
    } else {
      // No session ID found, redirect to home
      console.log('No session ID found, redirecting to home');
      setTimeout(() => setLocation('/'), 3000);
    }
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle>Processing Payment</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
          <p className="text-sm text-gray-500">
            You will be redirected back to your SWMS builder shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}