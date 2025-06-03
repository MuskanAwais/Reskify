import { Button } from "@/components/ui/button";
import { useUser } from "@/App";
import { Link, useLocation } from "wouter";
import { HardHat, Plus, Bell, Settings, LogOut } from "lucide-react";
import CreditCounter from "@/components/ui/credit-counter";
import VoiceAssistant from "@/components/ui/voice-assistant";
import ComprehensiveLanguageSwitcher from "@/components/ui/comprehensive-language-switcher";
import ContactForm from "@/components/ui/contact-form";
import logoImage from "@assets/Untitled design-2.png";

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
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="Safety Sensei Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  console.log("Logo failed to load, showing fallback");
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              <HardHat className="w-6 h-6 text-blue-600 hidden" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Safety Sensei</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Professional SWMS Builder</span>
              </div>
            </div>
          </div>



          {/* Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Voice Assistant */}
            <VoiceAssistant />
            
            {/* Language Switcher */}
            <ComprehensiveLanguageSwitcher />



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
                <ContactForm />
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
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