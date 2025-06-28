import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  X, 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  Home,
  Shield,
  Library,
  User,
  DollarSign,
  ChevronDown
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUser, useAdmin } from "@/App";

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useUser();
  const { isAdminMode } = useAdmin();
  const [adminExpanded, setAdminExpanded] = useState(false);

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/swms-builder", label: "SWMS Builder", icon: FileText },
    { href: "/my-swms", label: "My SWMS", icon: FileText },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/profile", label: "Account", icon: User },
  ];

  const adminItems = [
    { href: "/admin/dashboard", label: "Admin Dashboard", icon: Settings },
    { href: "/admin/user-management", label: "User Management", icon: Users },
    { href: "/admin/billing-analytics", label: "Billing Analytics", icon: DollarSign },
    { href: "/admin/usage-analytics", label: "Usage Analytics", icon: BarChart3 },
    { href: "/admin/data", label: "Data Management", icon: Settings },
    { href: "/admin/safety-library", label: "Safety Library", icon: Library },
    { href: "/admin/team-collaboration", label: "Team Management", icon: Users },
  ];

  const isActiveRoute = (href: string) => {
    return location === href || (href !== "/dashboard" && location.startsWith(href));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          <Logo size="sm" />
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center p-4 border-b">
                <Logo size="sm" />
              </div>

              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground mb-4">
                    NAVIGATION
                  </div>
                  
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start gap-3 ${
                            isActive 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}

                  {isAdminMode && (
                    <div className="mt-6">
                      <div className="text-sm font-medium text-muted-foreground mb-4">
                        ADMINISTRATION
                      </div>
                      
                      <Collapsible open={adminExpanded} onOpenChange={setAdminExpanded}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between">
                            <div className="flex items-center gap-3">
                              <Settings className="h-4 w-4" />
                              Admin Panel
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${adminExpanded ? "rotate-180" : ""}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 mt-2">
                          {adminItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = isActiveRoute(item.href);
                            
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                              >
                                <Button
                                  variant={isActive ? "default" : "ghost"}
                                  size="sm"
                                  className={`w-full justify-start gap-3 ml-4 ${
                                    isActive 
                                      ? "bg-primary text-primary-foreground" 
                                      : "hover:bg-muted"
                                  }`}
                                >
                                  <Icon className="h-3 w-3" />
                                  {item.label}
                                </Button>
                              </Link>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}
                </div>
              </div>

              {user && (
                <div className="border-t p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{(user as any).name || user.username}</div>
                      <div className="text-xs text-muted-foreground truncate">Pro User</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}