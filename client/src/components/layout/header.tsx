import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/App";
import { Link, useLocation } from "wouter";
import { HardHat, Plus, Bell, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const { user } = useUser();
  const [location] = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/safety-library", label: "Safety Codes" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg border-b border-slate-700">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <HardHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SWMS Builder</h1>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">Pro</span>
                <Badge className="bg-slate-700 hover:bg-slate-700 text-white text-xs px-2 py-0.5 border-slate-600">
                  Australian Construction
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`text-sm font-medium hover:text-blue-300 transition-colors ${
                    location === item.path ? 'text-blue-300 border-b-2 border-blue-300 pb-1' : 'text-slate-300'
                  }`}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Actions and User Menu */}
          <div className="flex items-center space-x-3">
            {/* New SWMS Button */}
            <Link href="/swms-builder">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 font-medium shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                New SWMS
              </Button>
            </Link>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700 p-2">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-slate-700">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                      {user ? getInitials(user.username) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge variant="outline" className="self-start text-xs mt-1">
                    {user?.primaryTrade}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
