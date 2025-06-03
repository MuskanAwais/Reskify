import { Button } from "@/components/ui/button";
import { useUser } from "@/App";
import { Link, useLocation } from "wouter";
import { HardHat, Plus, Bell, Settings, LogOut } from "lucide-react";
import CreditCounter from "@/components/ui/credit-counter";

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



  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg shadow-sm">
              <svg className="h-6 w-6 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.92 5L12 10.07L17.08 5H6.92M6.92 19L12 13.93L17.08 19H6.92M12 12.5L9.5 10H14.5L12 12.5Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Safety Samurai</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Professional SWMS Builder</span>
              </div>
            </div>
          </div>



          {/* Credit Counter */}
          <div className="hidden md:block">
            <CreditCounter className="compact" />
          </div>

          {/* Actions and User Menu */}
          <div className="flex items-center space-x-3">
            {/* New SWMS Button */}
            <Link href="/swms-builder">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2 font-medium shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                New SWMS
              </Button>
            </Link>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent p-2">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
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