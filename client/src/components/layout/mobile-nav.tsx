import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Menu, X, FileText, Shield, BookOpen, CreditCard, Settings, Bot } from "lucide-react";
import LanguageSelector from "@/components/ui/language-selector";

interface MobileNavProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function MobileNav({ currentLanguage, onLanguageChange }: MobileNavProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Settings },
    { name: 'SWMS Builder', href: '/swms-builder', icon: FileText },
    { name: 'AI Generator', href: '/ai-swms-generator', icon: Bot },
    { name: 'My SWMS', href: '/my-swms', icon: Shield },
    { name: 'Safety Library', href: '/safety-library', icon: BookOpen },
    { name: 'Subscription', href: '/subscription', icon: CreditCard }
  ];

  const closeSheet = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Safety Sensei</h2>
                  <p className="text-xs text-gray-500">SWMS Builder</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={closeSheet}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== '/' && location.startsWith(item.href));
                
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-12"
                      onClick={closeSheet}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                      {item.name === 'AI Generator' && (
                        <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          AI
                        </Badge>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Language Selector */}
            <div className="p-4 border-t">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Language</h3>
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onLanguageChange={onLanguageChange}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}