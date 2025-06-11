import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Zap, Crown, ArrowLeft, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Mock user data - replace with actual API call
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Mock subscription data - replace with actual API call
  const mockSubscription = {
    plan: "One-Off SWMS",
    creditsRemaining: 0,
    creditsUsed: 45,
    creditsTotal: 45,
    isActive: true
  };

  const creditsProgress = mockSubscription.creditsTotal > 0 
    ? (mockSubscription.creditsUsed / mockSubscription.creditsTotal) * 100 
    : 0;

  const handlePurchase = (planType: string) => {
    setSelectedPlan(planType);
    // Integrate with Stripe payment here
    console.log(`Purchasing ${planType}`);
  };

  const handleGoBack = () => {
    setLocation("/swms-builder");
  };

  const handleContinue = () => {
    // Check if admin demo mode is enabled
    const isAdminDemo = localStorage.getItem('adminDemoMode') === 'true';
    
    // Check if user has credits, selected a plan, or is in admin demo mode
    if (mockSubscription.creditsRemaining > 0 || selectedPlan || isAdminDemo) {
      setLocation("/swms-builder?step=6"); // Go to step 6 (legal disclaimer)
    }
  };

  const handleDemoToggle = () => {
    const currentDemoMode = localStorage.getItem('adminDemoMode') === 'true';
    localStorage.setItem('adminDemoMode', (!currentDemoMode).toString());
    window.location.reload();
  };

  const isAdminDemo = localStorage.getItem('adminDemoMode') === 'true';

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
            {(user as any)?.username === "michael.dewick01@gmail.com" && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDemoToggle}
                  className={isAdminDemo ? "bg-green-50 border-green-300" : ""}
                >
                  {isAdminDemo ? "Demo Mode: ON" : "Enable Demo Mode"}
                </Button>
                {isAdminDemo && (
                  <p className="text-xs text-green-600 mt-1">Admin demo mode enabled - payment bypassed</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Current Plan Status */}
        <Card className="mb-8 border-slate-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription>{mockSubscription.plan}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {mockSubscription.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Credits Used</span>
                <span className="font-medium">{mockSubscription.creditsUsed}/{mockSubscription.creditsTotal} SWMS</span>
              </div>
              <Progress value={creditsProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Pay per SWMS document
              </p>
              
              {mockSubscription.creditsRemaining === 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>No credits remaining.</strong> Purchase a one-off SWMS, additional credits, or upgrade to a subscription to continue.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
              <CardDescription>Unlimited SWMS creation</CardDescription>
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
                    Just $4.90 per SWMS for first 10 documents
                  </p>
                  <p className="text-xs text-green-600">
                    Then free for unlimited additional SWMS
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited SWMS documents
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

        <Separator className="my-8" />

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Builder
          </Button>
          
          <div className="flex space-x-4">
            {mockSubscription.creditsRemaining > 0 && (
              <Button variant="outline" onClick={handleContinue}>
                Use Existing Credit
              </Button>
            )}
            
            <Button 
              onClick={handleContinue}
              disabled={!selectedPlan && mockSubscription.creditsRemaining === 0 && !isAdminDemo}
              className="min-w-[140px] px-6"
              size="lg"
            >
              {isAdminDemo ? "Continue (Demo)" : selectedPlan ? "Pay & Continue" : "Continue"}
            </Button>
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