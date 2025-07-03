import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface EmbeddedCheckoutProps {
  amount: number;
  plan: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ amount, plan, onSuccess, onCancel }: EmbeddedCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?return_to=${encodeURIComponent(window.location.href)}`,
        },
      });

      if (error) {
        setError(error.message || 'An error occurred during payment');
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment succeeded - this won't execute because user is redirected
        // But we'll handle success in the return URL
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed...",
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: "Payment Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Payment
        </CardTitle>
        <p className="text-sm text-gray-600">
          {plan === 'one-off' ? 'One-Off SWMS' : 'Credit Pack'} - ${amount}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={!stripe || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${amount}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function EmbeddedCheckout(props: EmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            amount: props.amount,
            type: props.plan
          })
        });

        if (response.ok) {
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('Failed to create payment intent');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [props.amount, props.plan]);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Setting up payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={props.onCancel} variant="outline">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600 mb-4">Unable to initialize payment</p>
          <Button onClick={props.onCancel} variant="outline">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm {...props} />
    </Elements>
  );
}