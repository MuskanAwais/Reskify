import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Check, CreditCard, Crown, Star, Zap } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  swmsLimit: number;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'one-off',
    name: 'One-Off SWMS',
    price: 15,
    interval: 'one-time',
    swmsLimit: 1,
    icon: <Star className="h-6 w-6" />,
    features: [
      'Single SWMS document',
      'Standard templates',
      'Visual table editor',
      'PDF generation',
      'Credits never expire'
    ]
  },
  {
    id: 'subscription',
    name: 'Subscription',
    price: 50,
    interval: 'month',
    swmsLimit: 10,
    popular: true,
    icon: <Zap className="h-6 w-6" />,
    features: [
      '10 SWMS documents per month',
      'Standard templates',
      'Visual table editor',
      'Team collaboration',
      'Priority support',
      'Email support'
    ]
  }
];

interface CheckoutFormProps {
  selectedPlan: SubscriptionPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ selectedPlan, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await apiRequest('POST', '/api/subscriptions/create', {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price * 100,
      });

      const { clientSecret, subscriptionId } = await response.json();

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (error) {
        console.error('Payment failed:', error);
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription Activated!",
          description: `Welcome to Riskify ${selectedPlan.name}! Your subscription is now active.`,
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalWithGST = selectedPlan.price * 1.1;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {selectedPlan.icon}
            {selectedPlan.name} Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">${selectedPlan.price}</div>
              <div className="text-sm text-gray-600">+ ${(selectedPlan.price * 0.1).toFixed(2)} GST</div>
              <div className="text-lg font-semibold text-primary">
                Total: ${totalWithGST.toFixed(2)} AUD per month
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">What's included:</h4>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">
                Card Information
              </label>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Subscribe Now
                  </div>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              By subscribing, you agree to our Terms of Service and Privacy Policy. 
              You can cancel anytime from your account settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default function StripeSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleSubscriptionSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    window.location.reload();
  };

  const handleCancel = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  if (showCheckout && selectedPlan) {
    return (
      <Elements stripe={stripePromise}>
        <div className="max-w-md mx-auto">
          <CheckoutForm
            selectedPlan={selectedPlan}
            onSuccess={handleSubscriptionSuccess}
            onCancel={handleCancel}
          />
        </div>
      </Elements>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Riskify Plan</h2>
        <p className="text-gray-600">
          Select the perfect plan for your safety management needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.icon}
                {plan.name}
              </CardTitle>
              <div className="text-center">
                <div className="text-3xl font-bold">${plan.price}</div>
                <div className="text-sm text-gray-600">+ GST per month</div>
                <div className="text-sm font-medium text-primary">
                  {plan.swmsLimit} SWMS documents
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handlePlanSelect(plan)}
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          All plans include 30-day free trial. No setup fees. Cancel anytime.
          <br />
          Prices in AUD and include 10% GST as required by Australian law.
        </p>
      </div>
    </div>
  );
}