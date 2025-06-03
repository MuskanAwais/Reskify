import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Crown, 
  Zap, 
  Settings, 
  User, 
  Bell, 
  Lock,
  Calendar,
  TrendingUp,
  Plus,
  Check,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface BillingData {
  currentPlan: string;
  credits: number;
  monthlyLimit: number;
  billingCycle: string;
  nextBillingDate: string;
  totalSpent: number;
  creditsUsedThisMonth: number;
}

interface UserProfile {
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  subscriptionType: string;
  notificationsEnabled: boolean;
}

export default function Billing() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("billing");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user settings with real API
  const { data: userSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: () => apiRequest('GET', '/api/user/settings')
  });

  // Mock billing data - replace with real API calls
  const billingData: BillingData = {
    currentPlan: "Professional",
    credits: 8,
    monthlyLimit: 25,
    billingCycle: "monthly",
    nextBillingDate: "2025-07-03",
    totalSpent: 200,
    creditsUsedThisMonth: 17
  };

  const userProfile: UserProfile = {
    name: userSettings?.profile?.name || "John Smith",
    email: userSettings?.profile?.email || "john@constructco.com.au",
    company: userSettings?.profile?.company || "ConstructCo Pty Ltd",
    phone: userSettings?.profile?.phone || "+61 412 345 678",
    address: userSettings?.profile?.address || "123 Builder St, Sydney NSW 2000",
    subscriptionType: "professional",
    notificationsEnabled: userSettings?.notificationsEnabled ?? true
  };

  // Mutations for user settings
  const toggleNotificationsMutation = useMutation({
    mutationFn: (enabled: boolean) => 
      apiRequest('POST', '/api/user/toggle-notifications', { enabled }),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Notification preferences have been saved"
      });
      refetchSettings();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    }
  });

  const enable2FAMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/user/enable-2fa'),
    onSuccess: (data) => {
      toast({
        title: "2FA Enabled",
        description: data.message || "Two-factor authentication has been enabled"
      });
      refetchSettings();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication",
        variant: "destructive"
      });
    }
  });

  const disable2FAMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/user/disable-2fa'),
    onSuccess: (data) => {
      toast({
        title: "2FA Disabled",
        description: data.message || "Two-factor authentication has been disabled"
      });
      refetchSettings();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication",
        variant: "destructive"
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) => 
      apiRequest('POST', '/api/user/update-profile', profileData),
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated"
      });
      refetchSettings();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  const plans = [
    {
      name: "Basic",
      price: 50,
      credits: 10,
      features: [
        "10 SWMS per month",
        "Project-specific SWMS",
        "Email support",
        "Basic compliance checking"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: 100,
      credits: 25,
      features: [
        "25 SWMS per month",
        "Project-specific SWMS",
        "Priority support",
        "Advanced compliance",
        "AI enhancements",
        "Custom branding",
        "Standard practice guide access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: 200,
      credits: 60,
      features: [
        "60 SWMS per month",
        "All professional features",
        "24/7 phone support",
        "Full compliance suite",
        "Team collaboration tools",
        "Multi-user management",
        "Advanced reporting"
      ],
      popular: false
    }
  ];

  const calculateProgress = () => {
    return (billingData.creditsUsedThisMonth / billingData.monthlyLimit) * 100;
  };

  const purchaseCredits = async (amount: number) => {
    try {
      // This would integrate with Stripe payment
      toast({
        title: "Redirecting to Payment",
        description: `Processing purchase of ${amount} credits...`,
      });
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const upgradePlan = async (planName: string) => {
    try {
      toast({
        title: "Plan Upgrade",
        description: `Upgrading to ${planName} plan...`,
      });
    } catch (error) {
      toast({
        title: "Upgrade Error",
        description: "Failed to upgrade plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Account & Billing</h1>
          <p className="text-gray-600 mt-2">Manage your subscription, credits, and account settings</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-primary border-primary/20">
          <Crown className="w-4 h-4 mr-2" />
          {billingData.currentPlan}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing & Plans
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile & Settings
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Usage & Analytics
          </TabsTrigger>
        </TabsList>

        {/* Billing & Plans Tab */}
        <TabsContent value="billing" className="space-y-6">
          {/* Current Plan & Credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Credits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Credits</span>
                  <Badge variant="secondary">{billingData.credits} remaining</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{billingData.credits}</div>
                  <p className="text-sm text-muted-foreground">SWMS credits available</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used this month</span>
                    <span>{billingData.creditsUsedThisMonth}/{billingData.monthlyLimit}</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => purchaseCredits(5)} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    +5 Credits ($50)
                  </Button>
                  <Button onClick={() => purchaseCredits(10)} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    +10 Credits ($90)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Billing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Current Plan</span>
                  <span className="font-medium">{billingData.currentPlan}</span>
                </div>
                <div className="flex justify-between">
                  <span>Billing Cycle</span>
                  <span className="font-medium">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Billing</span>
                  <span className="font-medium">{billingData.nextBillingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Spent</span>
                  <span className="font-medium">${billingData.totalSpent}</span>
                </div>
                <Separator />
                <Button className="w-full" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Billing History
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Available Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Plan</CardTitle>
              <p className="text-muted-foreground">Upgrade or downgrade your subscription at any time</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative border rounded-lg p-6 ${
                      plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-4 bg-primary">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.credits} SWMS credits</p>
                      </div>

                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full"
                        variant={plan.name === billingData.currentPlan ? "outline" : "default"}
                        onClick={() => upgradePlan(plan.name)}
                        disabled={plan.name === billingData.currentPlan}
                      >
                        {plan.name === billingData.currentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile & Settings Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={userProfile.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={userProfile.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" defaultValue={userProfile.company} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue={userProfile.phone} />
                </div>
                <Button className="w-full">Save Profile Changes</Button>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates about your account</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleNotificationsMutation.mutate(!userProfile.notificationsEnabled)}
                    disabled={toggleNotificationsMutation.isPending}
                  >
                    <Bell className="w-4 h-4 mr-1" />
                    {toggleNotificationsMutation.isPending ? "Updating..." : 
                     userProfile.notificationsEnabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (userSettings?.twoFactorEnabled) {
                        disable2FAMutation.mutate();
                      } else {
                        enable2FAMutation.mutate();
                      }
                    }}
                    disabled={enable2FAMutation.isPending || disable2FAMutation.isPending}
                  >
                    <Lock className="w-4 h-4 mr-1" />
                    {enable2FAMutation.isPending || disable2FAMutation.isPending ? "Updating..." : 
                     userSettings?.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="password">Change Password</Label>
                  <Input id="password" type="password" placeholder="Enter new password" />
                  <Button variant="outline" className="w-full">Update Password</Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Company Address</Label>
                  <Input defaultValue={userProfile.address} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage & Analytics Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Credits Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{billingData.creditsUsedThisMonth}</div>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total SWMS Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">47</div>
                <p className="text-sm text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$4.26</div>
                <p className="text-sm text-muted-foreground">Per SWMS</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Basic SWMS Generation</span>
                  <span>12 credits</span>
                </div>
                <div className="flex justify-between">
                  <span>AI-Enhanced SWMS</span>
                  <span>5 credits</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Used</span>
                  <span>{billingData.creditsUsedThisMonth} credits</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}