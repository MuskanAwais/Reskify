import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { translate } from "@/lib/language-direct";
import AccessibilityMenu from "@/components/accessibility/accessibility-menu";
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
import Logo from "@/components/ui/logo";

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
      aiGeneration: true
    },
    creditsUsed: 45,
    creditsTotal: 100
  };
  
  // Get current user data
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Force admin state to be properly recognized
  const [isAdminState, setIsAdminState] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = () => {
      // Check multiple sources for admin status
      const userIsAdmin = (user as any)?.isAdmin === true;
      const localStorageAdmin = localStorage.getItem('isAdmin') === 'true';
      const forceAdmin = window.location.pathname.startsWith('/admin');
      
      const finalAdminStatus = userIsAdmin || localStorageAdmin || forceAdmin;
      
      console.log('Admin state saved to localStorage:', userIsAdmin);
      if (userIsAdmin) {
        localStorage.setItem('isAdmin', 'true');
      }
      
      setIsAdminState(finalAdminStatus);
      
      if (!user) {
        console.log('No active session');
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  const isAdmin = isAdminState;

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
    { icon: BarChart3, labelKey: "nav.analytics", href: "/analytics", tourId: "analytics-link" },
    { icon: User, labelKey: "nav.account", href: "/billing", tourId: "account-link" }
  ];

  const innovativeFeatures = [
    { icon: Bot, label: "Smart Risk Predictor", href: "/smart-risk-predictor" },
    { icon: Activity, label: "Digital Twin Dashboard", href: "/digital-twin-dashboard" },
    { icon: Users, label: "Live Collaboration", href: "/live-collaboration" }
  ];

  const adminNavigationItems = [
    { icon: Contact, label: "All Contacts", href: "/admin/all-contacts" },
    { icon: DollarSign, label: "Billing Analytics", href: "/admin/billing-analytics" },
    { icon: TrendingUp, label: "Usage Analytics", href: "/admin/usage-analytics" }
  ];

  return (
    <aside className="w-64 bg-card shadow-md border-r min-h-screen m-4 mr-0 rounded-2xl">
      <div className="p-6 h-full">

        {/* Interface Tour Button - Hidden */}
        {false && (
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

        {/* Quick Action */}
        <div className="mb-8" data-tour="quick-actions">
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
                      ? 'bg-primary/50 text-primary hover:bg-primary/60 hover:text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {translate(item.labelKey)}
                  {(item as any).badge && (
                    <Badge variant="secondary" className="ml-auto text-xs bg-purple-100 text-purple-800">
                      {(item as any).badge}
                    </Badge>
                  )}
                  {(item as any).requiresAccess && !(item as any).hasAccess && (
                    <Lock className="ml-auto h-3 w-3 text-gray-400" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Admin Navigation - Only for specific admin account */}
        {isAdmin && (
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
