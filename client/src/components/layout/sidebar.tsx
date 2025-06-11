import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { translate } from "@/lib/language-direct";
import { 
  FileText, 
  Search, 
  Bot, 
  BarChart3, 
  User, 
  Book, 
  Settings, 
  Home,
  CreditCard,
  BookOpen,
  Lock,
  Shield,
  Users,
  DollarSign,
  Database,
  Contact,
  TrendingUp,
  Archive,
  UserCheck,
  Activity,
  Play
} from "lucide-react";
import { Tour } from "@/components/ui/tour";

const quickActions = [
  {
    titleKey: "nav.swms-builder",
    icon: FileText,
    href: "/swms-builder",
    className: "bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 hover:border-primary/30"
  },

];

export default function Sidebar() {
  const [location] = useLocation();
  
  // Mock subscription data for TypeScript compatibility
  const mockSubscription = {
    plan: "Pro",
    features: {
      safetyLibrary: true,
      aiGeneration: true,
      teamCollaboration: false
    },
    creditsUsed: 45,
    creditsTotal: 100
  };
  
  // Get current user data
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Check if current user is the specific admin account
  const isAdmin = user?.username === "0421869995";

  const [demoMode, setDemoMode] = useState(() => {
    try {
      return localStorage.getItem('demoMode') === 'true';
    } catch {
      return false;
    }
  });

  const [enterpriseMode, setEnterpriseMode] = useState(() => {
    try {
      return localStorage.getItem('enterpriseMode') === 'true';
    } catch {
      return false;
    }
  });



  const toggleDemoMode = () => {
    const newMode = !demoMode;
    setDemoMode(newMode);
    try {
      localStorage.setItem('demoMode', newMode.toString());
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('demoModeChanged', { detail: { enabled: newMode } }));
    } catch (error) {
      console.error('Failed to save demo state:', error);
    }
  };

  const toggleEnterpriseMode = () => {
    const newMode = !enterpriseMode;
    setEnterpriseMode(newMode);
    try {
      localStorage.setItem('enterpriseMode', newMode.toString());
    } catch (error) {
      console.error('Failed to save enterprise state:', error);
    }
  };

  // Tour functionality
  const [showTour, setShowTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(() => {
    try {
      return localStorage.getItem('interface-tour-completed') === 'true';
    } catch {
      return false;
    }
  });
  
  const tourSteps = [
    {
      target: '[data-tour="quick-actions"]',
      title: 'Quick Actions',
      content: 'Start creating SWMS documents or use the AI generator from here. These are your main entry points for creating safety documentation.',
      position: 'right' as const,
      spotlight: true
    },
    {
      target: '[data-tour="navigation"]',
      title: 'Navigation Menu',
      content: 'Access all features including your SWMS documents, safety library, analytics, and account settings. The lock icons show features that require upgrades.',
      position: 'right' as const,
      spotlight: true
    },
    {
      target: '[data-tour="dashboard-link"]',
      title: 'Dashboard',
      content: 'Your main overview showing recent SWMS documents, quick stats, and activity summary.',
      position: 'right' as const,
      spotlight: true
    },
    {
      target: '[data-tour="my-swms-link"]',
      title: 'My SWMS',
      content: 'View and manage all your SWMS documents. Search, filter, and organize your safety documentation.',
      position: 'right' as const,
      spotlight: true
    },
    {
      target: '[data-tour="safety-library-link"]',
      title: 'Safety Library',
      content: 'Access comprehensive safety resources, regulations, and templates. Available with Pro and Enterprise plans.',
      position: 'right' as const,
      spotlight: true
    },
    {
      target: '[data-tour="team-tab"]',
      title: 'Team Collaboration',
      content: 'Enterprise feature for managing team members and collaborative SWMS projects. Includes real-time editing and approval workflows.',
      position: 'right' as const,
      spotlight: true
    },
    {
      target: '[data-tour="analytics-link"]',
      title: 'Analytics & Reports',
      content: 'Track your safety performance with detailed analytics, compliance reports, and usage statistics.',
      position: 'right' as const,
      spotlight: true
    },
    {
      target: '[data-tour="account-link"]',
      title: 'Account & Billing',
      content: 'Manage your subscription, billing details, and account preferences. Upgrade plans for more features.',
      position: 'right' as const,
      spotlight: true
    },
    {
      target: '[data-tour="subscription-status"]',
      title: 'Subscription Status',
      content: 'Monitor your current plan and credit usage. Demo mode is limited to 2 SWMS documents.',
      position: 'right' as const,
      spotlight: true
    },
    {
      target: '[data-tour="language-switcher"]',
      title: 'Language Settings',
      content: 'Change the interface language between English, Spanish, and French. Your language preference is saved automatically.',
      position: 'left' as const,
      spotlight: true
    },
    {
      target: '[data-tour="contact-support"]',
      title: 'Contact Support',
      content: 'Get help with any questions or issues. Our support team can assist with technical problems, billing, or general usage questions.',
      position: 'left' as const,
      spotlight: true
    }
  ];

  const startTour = () => {
    setShowTour(true);
    // Mark tour as completed once it's started
    try {
      localStorage.setItem('interface-tour-completed', 'true');
      setTourCompleted(true);
    } catch (error) {
      console.error('Failed to save tour completion state:', error);
    }
  };

  const completeTour = () => {
    setShowTour(false);
  };

  const skipTour = () => {
    setShowTour(false);
  };
  


  const navigationItems = [
    { icon: Home, labelKey: "nav.dashboard", href: "/dashboard", tourId: "dashboard-link" },
    { icon: FileText, labelKey: "nav.my-swms", href: "/my-swms", tourId: "my-swms-link" },
    { 
      icon: Book, 
      labelKey: "nav.safety-library", 
      href: "/safety-library",
      requiresAccess: true,
      hasAccess: mockSubscription?.features?.safetyLibrary || adminMode,
      tourId: "safety-library-link"
    },
    { 
      icon: Users, 
      labelKey: "nav.team", 
      href: "/team-collaboration",
      requiresAccess: true,
      hasAccess: mockSubscription?.plan === "Enterprise" || adminMode || enterpriseMode,
      badge: mockSubscription?.plan === "Enterprise" || enterpriseMode ? "Enterprise" : null,
      tourId: "team-tab"
    },
    { icon: BarChart3, labelKey: "nav.analytics", href: "/analytics", tourId: "analytics-link" },
    { icon: User, labelKey: "nav.account", href: "/billing", tourId: "account-link" }
  ];

  const innovativeFeatures = [
    { icon: Bot, label: "Smart Risk Predictor", href: "/smart-risk-predictor" },
    { icon: Activity, label: "Digital Twin Dashboard", href: "/digital-twin-dashboard" },
    { icon: Users, label: "Live Collaboration", href: "/live-collaboration" }
  ];

  const adminNavigationItems = [
    { icon: Users, label: "User Management", href: "/admin/user-management" },
    { icon: DollarSign, label: "Billing Analytics", href: "/admin/billing-analytics" },
    { icon: TrendingUp, label: "Usage Analytics", href: "/admin/usage-analytics" },
    { icon: Database, label: "Data Management", href: "/admin/data" },
    { icon: Archive, label: "All SWMS", href: "/admin/all-swms" },
    { icon: Activity, label: "System Health", href: "/admin/health" }
  ];

  return (
    <aside className="w-64 bg-card shadow-md border-r">
      <div className="p-6">
        {/* Admin Toggle - Only visible for admin users */}
        {isAdmin && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Admin Mode</span>
              <Button
                data-tour="admin-toggle"
                variant={adminMode ? "default" : "outline"}
                size="sm"
                onClick={toggleAdminMode}
                className={`px-3 py-1 text-xs ${
                  adminMode 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Shield className="mr-1 h-3 w-3" />
                {adminMode ? 'ON' : 'OFF'}
              </Button>
            </div>

            {adminMode && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Demo Mode</span>
                  <Button
                    data-tour="demo-toggle"
                    variant={demoMode ? "default" : "outline"}
                    size="sm"
                    onClick={toggleDemoMode}
                    className={`px-3 py-1 text-xs ${
                      demoMode 
                        ? 'bg-primary/600 text-white hover:bg-primary/700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Bot className="mr-1 h-3 w-3" />
                    {demoMode ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enterprise Mode</span>
                  <Button
                    data-tour="enterprise-toggle"
                    variant={enterpriseMode ? "default" : "outline"}
                    size="sm"
                    onClick={toggleEnterpriseMode}
                    className={`px-3 py-1 text-xs ${
                      enterpriseMode 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Users className="mr-1 h-3 w-3" />
                    {enterpriseMode ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Start Tour Button - Hidden after first use */}
        {!tourCompleted && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={startTour}
              className="w-full px-3 py-1 text-xs bg-primary/50 text-primary/700 border-primary/200 hover:bg-primary/100"
            >
              <Play className="mr-1 h-3 w-3" />
              Start Interface Tour
            </Button>
          </div>
        )}

        <Separator className="mb-6" />

        {/* Quick Actions */}
        <div className="mb-8" data-tour="quick-actions">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{translate('quickActions')}</h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Button className={`w-full justify-start ${action.className}`}>
                    <Icon className="mr-3 h-4 w-4" />
                    {translate(action.titleKey)}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Navigation */}
        <nav className="space-y-2" data-tour="navigation">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </h3>
          
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href === "/dashboard" && location === "/");
            
            // Safety Library should always be accessible to show lock content
            // when not authorized, rather than greying out the navigation
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  data-tour={item.tourId}
                  variant="ghost"
                  className={`w-full justify-start ${
                    isActive 
                      ? 'bg-primary/50 text-primary hover:bg-primary/50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {translate(item.labelKey)}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs bg-purple-100 text-purple-800">
                      {item.badge}
                    </Badge>
                  )}
                  {item.requiresAccess && !item.hasAccess && (
                    <Lock className="ml-auto h-3 w-3 text-gray-400" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Admin Navigation */}
        {adminMode && (
          <>
            <Separator className="my-6" />
            <nav className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Administration
              </h3>
              
              {adminNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        isActive 
                          ? 'bg-red-50 text-red-600 hover:bg-red-50' 
                          : 'text-gray-600 hover:bg-red-50'
                      }`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </>
        )}

        {/* Subscription Status */}
        <Separator className="my-6" />
        <Card className="bg-slate-50 border-slate-200" data-tour="subscription-status">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Current Plan</span>
              <CreditCard className="h-4 w-4 text-slate-500" />
            </div>
            <p className="text-xs text-slate-600 mb-3">
              {mockSubscription?.plan === 'subscription' ? 'Subscription Plan' : 'One-Off SWMS'}
            </p>
            <div className="text-xs text-slate-600">
              <div className="flex justify-between items-center mb-1">
                <span>Credits Used</span>
                <span className="font-medium">
                  {mockSubscription?.creditsUsed || 2}/{mockSubscription?.plan === 'subscription' ? 10 : 'Per SWMS'}
                </span>
              </div>
              {mockSubscription?.plan === 'subscription' && (
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${((mockSubscription?.creditsUsed || 2) / 10) * 100}%` 
                    }}
                  ></div>
                </div>
              )}
              {mockSubscription?.plan !== 'subscription' && (
                <p className="text-xs text-slate-500 mt-1">Pay per SWMS document</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tour Component */}
      <Tour 
        steps={tourSteps}
        isActive={showTour}
        onComplete={completeTour}
        onSkip={skipTour}
      />
    </aside>
  );
}
