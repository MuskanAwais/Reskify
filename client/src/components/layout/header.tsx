import { Button } from "@/components/ui/button";
import { useUser } from "@/App";
import { Link, useLocation } from "wouter";
import { HardHat, Plus, Bell, Settings, LogOut } from "lucide-react";
import CreditCounter from "@/components/ui/credit-counter";
import VoiceAssistant from "@/components/ui/voice-assistant";
import LanguageSwitcher from "@/components/ui/language-switcher";
import ContactForm from "@/components/ui/contact-form";

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
              <svg className="h-6 w-6 text-primary-foreground" viewBox="0 0 500 500" fill="currentColor">
                <path d="M365.5 183.5c-8.5-76.8-69.5-137.8-146.5-146.5V15h-37v22c-77 8.7-138 69.7-146.5 146.5H15v37h22c8.5 77 69.5 138 146.5 146.5v22h37v-22c77-8.5 138-69.5 146.5-146.5h22v-37h-22zm-146.5 148c-71.3 0-129-57.7-129-129s57.7-129 129-129 129 57.7 129 129-57.7 129-129 129z"/>
                <path d="M295 112c-12-12-31.5-12-43.5 0l-6.5 6.5V85c0-17-13.5-30.5-30.5-30.5S184 68 184 85v33.5L177.5 112c-12-12-31.5-12-43.5 0s-12 31.5 0 43.5l6.5 6.5H107c-17 0-30.5 13.5-30.5 30.5S90 223 107 223h33.5l-6.5 6.5c-12 12-12 31.5 0 43.5s31.5 12 43.5 0l6.5-6.5V300c0 17 13.5 30.5 30.5 30.5S245 317 245 300v-33.5l6.5 6.5c12 12 31.5 12 43.5 0s12-31.5 0-43.5l-6.5-6.5H322c17 0 30.5-13.5 30.5-30.5S339 162 322 162h-33.5l6.5-6.5c12-12 12-31.5 0-43.5z"/>
                <circle cx="195" cy="210" r="15"/>
                <circle cx="265" cy="210" r="15"/>
                <path d="M195 245c5.5 0 10-4.5 10-10s-4.5-10-10-10-10 4.5-10 10 4.5 10 10 10z"/>
                <path d="M250 265c0 8.5-6.5 15-15 15h-20c-8.5 0-15-6.5-15-15s6.5-15 15-15h20c8.5 0 15 6.5 15 15z"/>
                <path d="M215 300c15 25 45 25 60 0l-30-15-30 15z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Sensei</h1>
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
            <LanguageSwitcher />



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