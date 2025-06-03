import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, createContext, useContext } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import SwmsBuilder from "@/pages/swms-builder";
import Profile from "@/pages/profile";
import SafetyLibrary from "@/pages/safety-library";
import MySwms from "@/pages/my-swms";
import Analytics from "@/pages/analytics";
import AiAssistant from "@/pages/ai-assistant";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

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

export const useUser = () => useContext(UserContext);

function Layout({ children }: { children: React.ReactNode }) {
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
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/swms-builder" component={SwmsBuilder} />
        <Route path="/my-swms" component={MySwms} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/ai-assistant" component={AiAssistant} />
        <Route path="/profile" component={Profile} />
        <Route path="/safety-library" component={SafetyLibrary} />
        <Route path="/settings" component={Settings} />
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

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={{ user, setUser }}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
