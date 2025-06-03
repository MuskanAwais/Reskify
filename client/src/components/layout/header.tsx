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
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <HardHat className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">SWMS Builder Pro</h1>
              <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">
                Australian Construction
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`hover:text-blue-200 transition-colors ${
                    location === item.path ? 'text-blue-200 font-medium' : ''
                  }`}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          {/* Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* New SWMS Button */}
            <Link href="/swms-builder">
              <Button className="bg-secondary hover:bg-secondary/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                New SWMS
              </Button>
            </Link>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
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
