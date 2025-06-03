import { Button } from "@/components/ui/button";
import { useUser } from "@/App";
import { Link, useLocation } from "wouter";
import { HardHat, Plus, Bell, Settings, LogOut } from "lucide-react";
import CreditCounter from "@/components/ui/credit-counter";
import VoiceAssistant from "@/components/ui/voice-assistant";
import ComprehensiveLanguageSwitcher from "@/components/ui/comprehensive-language-switcher";
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
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 20C42 20 35 25 35 32V40H65V32C65 25 58 20 50 20Z" stroke="white" strokeWidth="3" fill="none"/>
                <path d="M30 40H70C72 40 74 42 74 44V46C74 48 72 50 70 50H30C28 50 26 48 26 46V44C26 42 28 40 30 40Z" fill="white"/>
                <circle cx="50" cy="60" r="15" fill="white"/>
                <circle cx="45" cy="57" r="2" fill="#3B82F6"/>
                <circle cx="55" cy="57" r="2" fill="#3B82F6"/>
                <path d="M35 70C35 75 42 80 50 80C58 80 65 75 65 70V65H35V70Z" fill="#1E40AF"/>
                <path d="M43 63C46 65 54 65 57 63" stroke="#1E40AF" strokeWidth="2" fill="none"/>
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