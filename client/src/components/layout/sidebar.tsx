import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  Lock
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
  
  // Fetch user subscription data
  const { data: subscription } = useQuery({
    queryKey: ["/api/user/subscription"],
  });

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "My SWMS", href: "/my-swms" },
    { icon: Book, label: "Safety Library", href: "/safety-library" },
    { 
      icon: BookOpen, 
      label: "Standard Practice Guide", 
      href: "/standard-practice-guide",
      requiresAccess: true,
      hasAccess: subscription?.features?.standardPracticeGuide
    },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: User, label: "Account", href: "/billing" }
  ];

  return (
    <aside className="w-64 bg-card shadow-md border-r">
      <div className="p-6">
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
      </div>
    </aside>
  );
}
