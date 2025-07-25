import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, createContext, useContext, useEffect } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import OnboardingTour from "@/components/ui/onboarding-tour";
import { SimpleLanguageProvider } from "@/lib/simple-language";
import Watermark from "@/components/ui/watermark";
import Dashboard from "@/pages/dashboard";
import SwmsBuilder from "@/pages/swms-builder";
import Profile from "@/pages/profile";
import ProfileSettings from "@/pages/profile-settings";

import MySwms from "@/pages/my-swms";
import SwmsEditor from "@/pages/swms-editor";
import ComprehensiveAnalytics from "@/pages/comprehensive-analytics";
import AiAssistant from "@/pages/ai-assistant";
import Settings from "@/pages/settings";
import Billing from "@/pages/billing";
import Payment from "@/pages/payment";
import PaymentSuccess from "@/pages/payment-success";
import SWMSTesting from "@/pages/swms-testing";
import PDFTest from "@/pages/pdf-test";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Demo from "@/pages/demo";
import Contact from "@/pages/contact";
import Register from "@/pages/register";
import LegalDisclaimer from "@/pages/legal-disclaimer";
import LanguageTest from "@/pages/language-test";
import LanguageDemo from "@/pages/language-demo";
import SwmsComplete from "@/pages/swms-complete";

// Admin pages
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AllContacts from "@/pages/admin/all-contacts";
import UserManagement from "@/pages/admin/user-management";
import BillingAnalytics from "@/pages/admin/billing-analytics";
import UsageAnalytics from "@/pages/admin/usage-analytics";
import AllSwms from "@/pages/admin/all-swms";
import DataManagement from "@/pages/admin/data-management";
import ContactLists from "@/pages/admin/contact-lists";
import SystemHealth from "@/pages/admin/system-health";
import SecurityMonitoring from "@/pages/admin/security-monitoring";
import SystemTesting from "@/pages/admin/system-testing";

// Innovative features - Coming Soon pages
// import SmartRiskPredictor from "@/pages/smart-risk-predictor";
// import DigitalTwinDashboard from "@/pages/digital-twin-dashboard";
// import LiveCollaboration from "@/pages/live-collaboration";
// import AISwmsGenerator from "@/pages/ai-swms-generator";



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
  const isPublicPage = ['/', '/landing', '/demo', '/contact', '/register', '/auth'].includes(location);
  
  if (isPublicPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileHeader />
        <main className="p-4">
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
        <Route path="/" component={AuthPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/register" component={Register} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/generate" component={SwmsBuilder} />
        <ProtectedRoute path="/swms-builder" component={SwmsBuilder} />
        <ProtectedRoute path="/my-swms" component={MySwms} />
        <ProtectedRoute path="/swms-editor/:id" component={SwmsEditor} />
        <ProtectedRoute path="/analytics" component={ComprehensiveAnalytics} />
        <ProtectedRoute path="/ai-assistant" component={AiAssistant} />
        <ProtectedRoute path="/profile" component={Profile} />

        <ProtectedRoute path="/billing" component={Billing} />
        <ProtectedRoute path="/payment" component={Payment} />
        <ProtectedRoute path="/payment-success" component={PaymentSuccess} />
        <ProtectedRoute path="/settings" component={Settings} />
        <Route path="/language-test" component={LanguageTest} />
        <Route path="/language-demo" component={LanguageDemo} />
        <Route path="/legal-disclaimer" component={LegalDisclaimer} />
        <Route path="/pdf-test" component={PDFTest} />
        <Route path="/swms-complete" component={SwmsComplete} />
        
        {/* Innovative Features - Coming Soon */}


        
        {/* Admin Routes */}
        <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
        <ProtectedRoute path="/admin/all-contacts" component={AllContacts} />
        <ProtectedRoute path="/admin/user-management" component={UserManagement} />
        <ProtectedRoute path="/admin/billing-analytics" component={BillingAnalytics} />
        <ProtectedRoute path="/admin/usage-analytics" component={UsageAnalytics} />
        <ProtectedRoute path="/admin/all-swms" component={AllSwms} />
        <ProtectedRoute path="/admin/data" component={DataManagement} />
        <ProtectedRoute path="/admin/security" component={SecurityMonitoring} />
        <ProtectedRoute path="/admin/health" component={SystemHealth} />
        <ProtectedRoute path="/admin/system-testing" component={SystemTesting} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  // Real user authentication - updated from login
  const [user, setUser] = useState<User | null>(null);

  // Use the persistent admin state
  const adminState = useAdminState();

  // Admin state for authenticated users - persist in localStorage
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('isAdmin');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Check user authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          if (userData.user.isAdmin) {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.log('No active session');
      }
    };
    checkAuth();
  }, []);

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
      <AuthProvider>
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
