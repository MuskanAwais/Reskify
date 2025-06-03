import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAdmin } from "@/App";
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
  Activity
} from "lucide-react";

const quickActions = [
  {
    title: "Create SWMS",
    icon: FileText,
    href: "/swms-builder",
    className: "bg-primary text-white hover:bg-primary/90"
  },
  {
    title: "AI SWMS Generator",
    icon: Bot,
    href: "/ai-swms-generator",
    className: "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { isAdmin, setIsAdmin } = useAdmin();
  
  // Fetch user subscription data
  const { data: subscription } = useQuery({
    queryKey: ["/api/user/subscription"],
  });

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "My SWMS", href: "/my-swms" },
    { 
      icon: Book, 
      label: "Safety Library", 
      href: "/safety-library",
      requiresAccess: true,
      hasAccess: subscription?.features?.safetyLibrary || isAdmin
    },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: User, label: "Account", href: "/billing" }
  ];

  const innovativeFeatures = [
    { icon: Bot, label: "Smart Risk Predictor", href: "/smart-risk-predictor" },
    { icon: Activity, label: "Digital Twin Dashboard", href: "/digital-twin-dashboard" },
    { icon: Users, label: "Live Collaboration", href: "/live-collaboration" }
  ];

  const adminNavigationItems = [
    { icon: Shield, label: "Admin Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "User Management", href: "/admin/users" },
    { icon: DollarSign, label: "Billing Analytics", href: "/admin/billing" },
    { icon: TrendingUp, label: "Usage Analytics", href: "/admin/analytics" },
    { icon: Database, label: "Data Management", href: "/admin/data" },
    { icon: Contact, label: "Contact Lists", href: "/admin/contacts" },
    { icon: Archive, label: "All SWMS", href: "/admin/swms" },
    { icon: Activity, label: "System Health", href: "/admin/health" }
  ];

  return (
    <aside className="w-64 bg-card shadow-md border-r">
      <div className="p-6">
        {/* Admin Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Admin Mode</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newState = !isAdmin;
                console.log('Admin button clicked, setting state to:', newState);
                setIsAdmin(newState);
                // Force re-render by triggering state update
                setTimeout(() => {
                  console.log('Admin state after update:', newState);
                }, 100);
              }}
              className={`px-3 py-1 text-xs transition-all duration-200 ${
                isAdmin 
                  ? 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100' 
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Shield className="mr-1 h-3 w-3" />
              {isAdmin ? 'ON' : 'OFF'}
            </Button>
          </div>
          {isAdmin && (
            <Badge variant="destructive" className="mt-2 text-xs">
              Administrative Access
            </Badge>
          )}
        </div>

        <Separator className="mb-6" />

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Button className={`w-full justify-start ${action.className}`}>
                    <Icon className="mr-3 h-4 w-4" />
                    {action.title}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Navigation */}
        <nav className="space-y-2">
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
                  variant="ghost"
                  className={`w-full justify-start ${
                    isActive 
                      ? 'bg-blue-50 text-primary hover:bg-blue-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Admin Navigation */}
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

        {/* Subscription Status */}
        <Separator className="my-6" />
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Current Plan</span>
              <CreditCard className="h-4 w-4 text-slate-500" />
            </div>
            <p className="text-xs text-slate-600 mb-3">
              {subscription?.plan || "Basic Plan"}
            </p>
            <div className="text-xs text-slate-600">
              <div className="flex justify-between mb-1">
                <span>Credits Used</span>
                <span>{subscription?.creditsUsed || 0}/{subscription?.creditsTotal || 10}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${((subscription?.creditsUsed || 0) / (subscription?.creditsTotal || 10)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
