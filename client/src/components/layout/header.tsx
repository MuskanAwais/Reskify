import { Button } from "@/components/ui/button";
import { useUser } from "@/App";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { HardHat, Plus, Bell, Settings, LogOut } from "lucide-react";
import CreditCounter from "@/components/ui/credit-counter";
import VoiceAssistant from "@/components/ui/voice-assistant";
import SimpleLanguageSwitcher from "@/components/ui/simple-language-switcher";
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
  const { user: authUser, logoutMutation } = useAuth();
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
    <header className="bg-white border-b border-border shadow-sm m-4 mb-0 rounded-2xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left aligned with sidebar center */}
          <div className="flex items-center">
            <img 
              src="/assets/riskify-logo.png" 
              alt="Riskify Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>
          
          {/* Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Voice Assistant */}
            <VoiceAssistant />
            
            {/* Language Switcher */}
            <div data-tour="language-switcher">
              <SimpleLanguageSwitcher />
            </div>



            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {authUser ? getInitials(authUser.name || authUser.username) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{authUser?.name || authUser?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {authUser?.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div data-tour="contact-support">
                  <ContactForm />
                </div>
                <DropdownMenuSeparator />
                <Link href="/billing?tab=account">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
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