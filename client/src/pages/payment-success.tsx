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
    // Extract payment intent from URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    const returnTo = urlParams.get('return_to');

    if (paymentIntent) {
      // Verify payment and redirect back to SWMS builder
      const verifyPayment = async () => {
        try {
          const response = await fetch('/api/verify-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ paymentIntentId: paymentIntent })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              toast({
                title: "Payment Successful",
                description: "Your payment has been processed successfully!",
              });
              
              // Redirect back to SWMS builder with success
              if (returnTo) {
                window.location.href = returnTo + '&payment_success=true';
              } else {
                setLocation('/swms-builder?payment_success=true');
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } else {
            throw new Error('Could not verify payment');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast({
            title: "Payment Issue",
            description: "There was an issue verifying your payment. Please contact support.",
            variant: "destructive",
          });
          
          // Redirect anyway to allow manual resolution
          if (returnTo) {
            window.location.href = returnTo + '&payment_error=true';
          } else {
            setLocation('/swms-builder?payment_error=true');
          }
        }
      };

      verifyPayment();
    } else {
      // No payment intent found, redirect to home
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