import { Button } from "@/components/ui/button";
import { useUser } from "@/App";
import { Link, useLocation } from "wouter";
import { HardHat, Plus, Bell, Settings, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
      .map(word => word.charAt(0))
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
    <header className="bg-gradient-to-r from-green-800 to-green-900 text-white shadow-lg border-b border-green-700">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <svg className="h-6 w-6 text-green-700" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.92 5L12 10.07L17.08 5H6.92M6.92 19L12 13.93L17.08 19H6.92M12 12.5L9.5 10H14.5L12 12.5Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Safety Samurai</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-100">Professional SWMS Builder</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button 
                  variant="ghost" 
                  className={`text-green-100 hover:text-white hover:bg-green-700 ${
                    location === item.path ? 'bg-green-700 text-white' : ''
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Actions and User Menu */}
          <div className="flex items-center space-x-3">
            {/* New SWMS Button */}
            <Link href="/swms-builder">
              <Button className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 font-medium shadow-sm">
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
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-600 text-white text-sm">
                      {user ? getInitials(user.username) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}