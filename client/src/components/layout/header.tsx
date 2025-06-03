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
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200">
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Hard hat */}
                <path d="M25 45C25 30 35 18 50 18C65 18 75 30 75 45V50H25V45Z" fill="#1E3A5F" stroke="#1E3A5F" strokeWidth="2"/>
                <rect x="20" y="50" width="60" height="8" rx="4" fill="#1E3A5F"/>
                
                {/* Face */}
                <circle cx="50" cy="65" r="12" fill="#F5F5F5"/>
                
                {/* Eyes */}
                <circle cx="45" cy="62" r="1.5" fill="#1E3A5F"/>
                <circle cx="55" cy="62" r="1.5" fill="#1E3A5F"/>
                
                {/* Eyebrows */}
                <path d="M42 59C44 58 46 58 48 59" stroke="#1E3A5F" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M52 59C54 58 56 58 58 59" stroke="#1E3A5F" strokeWidth="1.5" strokeLinecap="round"/>
                
                {/* Beard/Face outline */}
                <path d="M38 70C38 75 42 80 50 85C58 80 62 75 62 70V65C62 65 58 68 50 68C42 68 38 65 38 65V70Z" fill="#1E3A5F"/>
                
                {/* Mouth/Mustache area */}
                <path d="M45 67C47 68 50 68 50 68C50 68 53 68 55 67" stroke="#F5F5F5" strokeWidth="1" strokeLinecap="round"/>
                
                {/* Hard hat details */}
                <rect x="48" y="22" width="4" height="12" rx="2" fill="#F5F5F5"/>
              </svg>
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