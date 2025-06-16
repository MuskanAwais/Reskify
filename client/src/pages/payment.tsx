import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Zap, Crown, ArrowLeft, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, type }: { amount: number, type: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/swms-builder?step=6`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Redirecting to continue with your SWMS...",
      });
      setLocation("/swms-builder?step=6");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe} className="w-full">
        Pay ${amount} AUD
      </Button>
    </form>
  );
};

export default function Payment() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const { data: subscription } = useQuery({
    queryKey: ["/api/user/subscription"],
    retry: false,
  });

  // Admin demo bypass for specific phone number - check username field
  const isAdminDemo = (user as any)?.username === "0421869995" || (user as any)?.phone === "0421869995";
  
  const handleDemoBypass = () => {
    toast({
      title: "Demo Access Granted",
      description: "Proceeding with full access...",
    });
    setLocation("/swms-builder?step=6");
  };

  const handleUseCreditMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/use-credit", {
        creditType: "swms_generation",
        documentType: "swms"
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Credit Used Successfully",
        description: `1 credit deducted. ${data.remainingCredits} credits remaining.`,
      });
      setLocation("/swms-builder?step=6");
    },
    onError: (error: any) => {
      toast({
        title: "Credit Usage Failed",
        description: error.message || "Unable to use credit. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleUseCredit = () => {
    if (hasAvailableCredits) {
      handleUseCreditMutation.mutate();
    } else {
      toast({
        title: "No Credits Available",
        description: "Please purchase credits or select a payment option.",
        variant: "destructive",
      });
    }
  };

  const mockSubscription = subscription || {
    plan: "pro",
    creditsRemaining: 10,
    creditsUsed: 15,
    creditsTotal: 25,
    isActive: true
  };

  const creditsProgress = (mockSubscription as any).creditsTotal > 0 
    ? ((mockSubscription as any).creditsUsed / (mockSubscription as any).creditsTotal) * 100 
    : 0;

  const hasAvailableCredits = (mockSubscription as any).creditsRemaining > 0;

  const createPaymentIntent = useMutation({
    mutationFn: async ({ amount, type }: { amount: number, type: string }) => {
      if (type === 'subscription') {
        // Handle subscription creation differently
        const response = await apiRequest("POST", "/api/create-subscription", { 
          plan: "Pro",
          email: (user as any)?.username || "user@example.com"
        });
        return response.json();
      } else {
        // Handle one-off payments
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount, 
          type 
        });
        return response.json();
      }
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      if (data.recurring) {
        toast({
          title: "Subscription Setup",
          description: "Setting up your monthly auto-recurring subscription",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    }
  });

  const handlePurchase = (planType: string) => {
    setSelectedPlan(planType);
    
    let amount = 0;
    switch (planType) {
      case 'one-off':
        amount = 15;
        break;
      case 'credits':
        amount = 65;
        break;
      case 'subscription':
        amount = 49;
        break;
    }
    
    createPaymentIntent.mutate({ amount, type: planType });
  };

  const handleGoBack = () => {
    setLocation("/swms-builder?step=4");
  };

  const handleContinue = () => {
    // Only allow continue if user has actual credits (no bypass allowed)
    if ((mockSubscription as any).creditsRemaining > 0) {
      setLocation("/swms-builder?step=6"); // Go to step 6 (legal disclaimer)
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to SWMS Builder
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your SWMS Document
            </h1>
            <p className="text-gray-600">
              Choose your payment option to finalize and download your professional SWMS document
            </p>

          </div>
        </div>

        {/* Current Plan Status */}
        <Card className="mb-8 border-slate-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription></CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {(mockSubscription as any).isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Credits Used</span>
                <span className="font-medium">{(mockSubscription as any).creditsUsed}/{(mockSubscription as any).creditsTotal} SWMS</span>
              </div>
              <Progress value={creditsProgress} className="h-2" />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Credits Remaining</span>
                <span className="font-medium text-green-600">{(mockSubscription as any).creditsRemaining} SWMS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {hasAvailableCredits ? "Use credits or pay per SWMS document" : "Pay per SWMS document"}
              </p>
              
              {(mockSubscription as any).creditsRemaining === 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>No credits remaining.</strong> Purchase a one-off SWMS, additional credits, or upgrade to a subscription to continue.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Use Current Credits Option */}
        {hasAvailableCredits && (
          <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Use Current Credits</CardTitle>
              <CardDescription>
                You have {(mockSubscription as any).creditsRemaining} credits remaining from your {(mockSubscription as any).plan} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleUseCredit}
                disabled={handleUseCreditMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {handleUseCreditMutation.isPending ? "Processing..." : "Use 1 Credit for this SWMS"}
              </Button>
              <div className="mt-3 text-center">
                <Button variant="link" className="text-sm text-blue-600 p-0">
                  Manage Billing & Credits
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Demo Toggle */}
        {isAdminDemo && (
          <Card className="mb-6 border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Admin Demo Access</CardTitle>
              <CardDescription>Demo account detected (0421869995) - bypass payment for testing</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleDemoBypass}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue with Demo Access
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* One-Off SWMS */}
          <Card className={`relative cursor-pointer transition-all duration-200 ${
            selectedPlan === "one-off" 
              ? "ring-2 ring-primary border-primary shadow-lg scale-105" 
              : "hover:shadow-md border-slate-200 bg-white/70 backdrop-blur-sm"
          }`} onClick={() => setSelectedPlan("one-off")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CreditCard className="h-8 w-8 text-blue-600" />
                {selectedPlan === "one-off" && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardTitle className="text-xl">One-Off SWMS</CardTitle>
              <CardDescription>Perfect for single documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">$15</span>
                <span className="text-muted-foreground">/document</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  1 Professional SWMS document
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  AI-powered risk assessment
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Digital signatures
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  PDF download with watermark
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase("one-off");
                }}
                disabled={selectedPlan === "one-off"}
              >
                {selectedPlan === "one-off" ? "Selected" : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>

          {/* Credit Pack */}
          <Card className={`relative cursor-pointer transition-all duration-200 ${
            selectedPlan === "credits" 
              ? "ring-2 ring-primary border-primary shadow-lg scale-105" 
              : "hover:shadow-md border-slate-200 bg-white/70 backdrop-blur-sm"
          }`} onClick={() => setSelectedPlan("credits")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Zap className="h-8 w-8 text-orange-600" />
                {selectedPlan === "credits" && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardTitle className="text-xl">Credit Pack</CardTitle>
              <CardDescription>Best value for multiple documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">$65</span>
                <span className="text-muted-foreground">/5 credits</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  Save $10
                </Badge>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  5 SWMS documents
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  All one-off features included
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Credits never expire
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase("credits");
                }}
                disabled={selectedPlan === "credits"}
              >
                {selectedPlan === "credits" ? "Selected" : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>

          {/* Subscription */}
          <Card className={`relative cursor-pointer transition-all duration-200 ${
            selectedPlan === "subscription" 
              ? "ring-2 ring-primary border-primary shadow-lg scale-105" 
              : "hover:shadow-md border-slate-200 bg-white/70 backdrop-blur-sm"
          }`} onClick={() => setSelectedPlan("subscription")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Crown className="h-8 w-8 text-purple-600" />
                {selectedPlan === "subscription" && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardTitle className="text-xl">Subscription</CardTitle>
              <CardDescription>10 SWMS per month + credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">$49</span>
                <span className="text-muted-foreground">/month</span>
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                  Most Popular
                </Badge>
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-800 font-medium">
                    10 SWMS documents included monthly
                  </p>
                  <p className="text-xs text-green-600">
                    Additional SWMS via credit packs ($10 each)
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  10 SWMS documents per month
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Advanced AI features
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Team collaboration
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Safety library access
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Premium support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase("subscription");
                }}
                disabled={selectedPlan === "subscription"}
              >
                {selectedPlan === "subscription" ? "Selected" : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Payment Form */}
        {clientSecret && selectedPlan && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>
                Enter your payment details to proceed with your SWMS generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  amount={selectedPlan === 'one-off' ? 15 : selectedPlan === 'credits' ? 65 : 49} 
                  type={selectedPlan} 
                />
              </Elements>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Builder
          </Button>
          
          <div className="flex space-x-4">
            {(mockSubscription as any).creditsRemaining > 0 && (
              <Button variant="outline" onClick={handleContinue}>
                Use Existing Credit
              </Button>
            )}
            
            {!clientSecret && selectedPlan && (
              <Button 
                onClick={() => handlePurchase(selectedPlan)}
                className="min-w-[140px] px-6"
                size="lg"
              >
                Take to Payment
              </Button>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            🔒 Secure payment processing powered by Stripe. Your payment information is encrypted and never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}