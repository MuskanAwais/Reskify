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
    title: "Search Codes",
    icon: Search,
    href: "/safety-library",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  },
  {
    title: "AI Assistant",
    icon: Bot,
    href: "/ai-assistant",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
      hasAccess: subscription?.features?.safetyLibrary
    },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: User, label: "Account", href: "/billing" }
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
              onClick={() => setIsAdmin(!isAdmin)}
              className={`px-3 py-1 text-xs ${
                isAdmin 
                  ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
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
            
            const isLocked = item.requiresAccess && !item.hasAccess;
            
            if (isLocked) {
              return (
                <div key={item.href} className="relative">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-400 cursor-not-allowed opacity-60"
                    disabled
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                    <Lock className="ml-auto h-3 w-3" />
                  </Button>
                </div>
              );
            }
            
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
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Current Plan</span>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-blue-600 mb-3">
              {subscription?.plan || "Basic Plan"}
            </p>
            <div className="text-xs text-blue-700">
              <div className="flex justify-between mb-1">
                <span>Credits Used</span>
                <span>{subscription?.creditsUsed || 0}/{subscription?.creditsLimit || 10}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${((subscription?.creditsUsed || 0) / (subscription?.creditsLimit || 10)) * 100}%` 
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
