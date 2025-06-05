import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, createContext, useContext, useEffect } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import OnboardingTour from "@/components/ui/onboarding-tour";
import { SimpleLanguageProvider } from "@/lib/simple-language";
import Watermark from "@/components/ui/watermark";
import Dashboard from "@/pages/dashboard";
import SwmsBuilder from "@/pages/swms-builder";
import Profile from "@/pages/profile";
import SafetyLibrary from "@/pages/safety-library";
import MySwms from "@/pages/my-swms";
import Analytics from "@/pages/analytics";
import AiAssistant from "@/pages/ai-assistant";
import Settings from "@/pages/settings";
import Billing from "@/pages/billing";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Demo from "@/pages/demo";
import Contact from "@/pages/contact";
import Register from "@/pages/register";
import LegalDisclaimer from "@/pages/legal-disclaimer";
import LanguageTest from "@/pages/language-test";
import LanguageDemo from "@/pages/language-demo";

// Admin pages
import AdminDashboard from "@/pages/admin/admin-dashboard";
import UserManagement from "@/pages/admin/user-management";
import BillingAnalytics from "@/pages/admin/billing-analytics";
import UsageAnalytics from "@/pages/admin/usage-analytics";
import AllSwms from "@/pages/admin/all-swms";
import DataManagement from "@/pages/admin/data-management";
import ContactLists from "@/pages/admin/contact-lists";
import SystemHealth from "@/pages/admin/system-health";

// Innovative features
import SmartRiskPredictor from "@/pages/smart-risk-predictor";
import DigitalTwinDashboard from "@/pages/digital-twin-dashboard";
import LiveCollaboration from "@/pages/live-collaboration";
import AISwmsGenerator from "@/pages/ai-swms-generator";
import TeamCollaboration from "@/pages/team-collaboration";

// User context for demo purposes
interface User {
  id: number;
  username: string;
  email: string;
  companyName: string;
  primaryTrade: string;
}

const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser: () => {}
});

// Admin context for admin features with persistent state
const AdminContext = createContext<{
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
}>({
  isAdminMode: false,
  setIsAdminMode: () => {}
});

// Admin state hook
const useAdminState = () => {
  const [isAdminMode, setIsAdminModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('adminMode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [isTrialMode, setIsTrialModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('trialMode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const setIsAdminMode = (mode: boolean) => {
    try {
      localStorage.setItem('adminMode', mode.toString());
      setIsAdminModeState(mode);
    } catch (error) {
      console.error('Failed to save admin state:', error);
      setIsAdminModeState(mode);
    }
  };

  const setIsTrialMode = (mode: boolean) => {
    try {
      localStorage.setItem('trialMode', mode.toString());
      setIsTrialModeState(mode);
    } catch (error) {
      console.error('Failed to save trial state:', error);
      setIsTrialModeState(mode);
    }
  };

  return { isAdminMode, setIsAdminMode, isTrialMode, setIsTrialMode };
};

// Legacy admin context for compatibility
const LegacyAdminContext = createContext<{
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}>({
  isAdmin: false,
  setIsAdmin: () => {}
});

export const useUser = () => useContext(UserContext);
export const useAdmin = () => useContext(AdminContext);

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isPublicPage = ['/', '/landing', '/demo', '/contact', '/register'].includes(location);
  
  if (isPublicPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/landing" component={Landing} />
        <Route path="/demo" component={Demo} />
        <Route path="/contact" component={Contact} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/swms-builder" component={SwmsBuilder} />
        <Route path="/my-swms" component={MySwms} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/ai-assistant" component={AiAssistant} />
        <Route path="/profile" component={Profile} />
        <Route path="/safety-library" component={SafetyLibrary} />

        <Route path="/billing" component={Billing} />
        <Route path="/settings" component={Settings} />
        <Route path="/language-test" component={LanguageTest} />
        <Route path="/language-demo" component={LanguageDemo} />
        <Route path="/legal-disclaimer" component={LegalDisclaimer} />
        
        {/* Innovative Features */}
        <Route path="/smart-risk-predictor" component={SmartRiskPredictor} />
        <Route path="/digital-twin-dashboard" component={DigitalTwinDashboard} />
        <Route path="/live-collaboration" component={LiveCollaboration} />
        <Route path="/ai-swms-generator" component={AISwmsGenerator} />
        <Route path="/team-collaboration" component={TeamCollaboration} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/user-management" component={UserManagement} />
        <Route path="/admin/billing-analytics" component={BillingAnalytics} />
        <Route path="/admin/usage-analytics" component={UsageAnalytics} />
        <Route path="/admin/all-swms" component={AllSwms} />
        <Route path="/admin/data" component={DataManagement} />

        <Route path="/admin/health" component={SystemHealth} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  // Demo user - in a real app this would come from authentication
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: "John Doe",
    email: "john.doe@example.com",
    companyName: "ABC Construction",
    primaryTrade: "Electrical"
  });

  // Use the persistent admin state
  const adminState = useAdminState();

  // Admin state for temporary admin features - persist in localStorage
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('isAdmin');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Save admin state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
      console.log('Admin state saved to localStorage:', isAdmin);
    } catch (error) {
      console.error('Failed to save admin state:', error);
    }
  }, [isAdmin]);

  return (
    <QueryClientProvider client={queryClient}>
      <SimpleLanguageProvider>
        <UserContext.Provider value={{ user, setUser }}>
          <AdminContext.Provider value={adminState}>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AdminContext.Provider>
        </UserContext.Provider>
      </SimpleLanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
