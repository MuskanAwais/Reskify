import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, CreditCard, Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentDetails, setPaymentDetails] = useState<{
    product: string;
    amount: number;
    credits: number;
    icon: any;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        console.log('Payment success page - Session ID:', sessionId);

        if (!sessionId) {
          console.log('No session ID found, redirecting to home');
          setTimeout(() => setLocation('/'), 3000);
          return;
        }

        // Verify payment with backend
        const verifyResponse = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ sessionId })
        });

        if (verifyResponse.ok) {
          const paymentData = await verifyResponse.json();
          
          // Set payment details for display
          let productDetails = {
            product: paymentData.product || 'SWMS Credits',
            amount: paymentData.amount || 0,
            credits: paymentData.credits || 1,
            icon: CreditCard
          };

          // Customize details based on product type
          if (paymentData.product?.includes('Credit Pack')) {
            productDetails.icon = Package;
          } else if (paymentData.product?.includes('Subscription')) {
            productDetails.icon = Shield;
          }

          setPaymentDetails(productDetails);
          setIsProcessing(false);

          // Invalidate all credit-related queries to refresh the UI
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['/api/user'] }),
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] }),
            queryClient.invalidateQueries({ queryKey: ['credits'] }),
            queryClient.invalidateQueries({ queryKey: ['billing'] })
          ]);

          toast({
            title: "Payment Successful!",
            description: `${paymentData.credits} credits added to your account`,
          });

          // Redirect back to SWMS builder payment step after showing success
          setTimeout(() => {
            console.log('Redirecting to SWMS builder payment step...');
            setLocation('/swms-builder?payment_success=true&step=6');
          }, 3000);

        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast({
          title: "Payment Verification Failed",
          description: "Please contact support if this issue persists.",
          variant: "destructive",
        });
        setTimeout(() => setLocation('/'), 3000);
      }
    };

    processPayment();
  }, [setLocation, toast, queryClient]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isProcessing ? (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle>
            {isProcessing ? 'Processing Payment' : 'Payment Successful!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {isProcessing ? (
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-gray-600">Verifying your payment...</p>
              </div>
              <p className="text-sm text-gray-500">
                Please wait while we process your payment.
              </p>
            </div>
          ) : paymentDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-lg">
                <paymentDetails.icon className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-green-900">{paymentDetails.product}</p>
                  <p className="text-sm text-green-700">
                    {formatAmount(paymentDetails.amount)} • {paymentDetails.credits} credits
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">
                  ✓ {paymentDetails.credits} credits added to your account
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  You can now use your credits to create SWMS documents
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Redirecting you back to complete your SWMS...
              </p>
            </div>
          ) : (
            <p className="text-gray-600">Payment processing complete.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}