import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Building, HardHat } from "lucide-react";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const tradeOptions = [
  "General Construction",
  "Electrical",
  "Plumbing",
  "Carpentry", 
  "Roofing",
  "Excavation",
  "Concreting",
  "Painting",
  "Tiling",
  "Glazing",
  "HVAC",
  "Scaffolding",
  "Demolition",
  "Landscaping",
  "Other"
];

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(1, "Username is required").refine(
    (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^(\+61|04)[0-9]{8,9}$/;
      return emailRegex.test(val) || mobileRegex.test(val);
    },
    "Username must be a valid email or Australian mobile number (04xxxxxxxx or +61xxxxxxxxx)"
  ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  companyName: z.string().min(1, "Company name is required"),
  primaryTrade: z.string().min(1, "Primary trade is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      companyName: "",
      primaryTrade: "",
      email: "",
      phone: "",
    },
  });

  const onLogin = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);
      setLocation("/");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      const registerData = {
        ...data,
        email: data.username.includes('@') ? data.username : data.email,
        phone: !data.username.includes('@') ? data.username : data.phone,
      };
      await registerMutation.mutateAsync(registerData);
      setLocation("/");
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100 dark:bg-green-900/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <img 
                src="/assets/riskify-logo.png" 
                alt="Riskify"
                className="h-28 w-auto object-contain drop-shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full blur-xl -z-10"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Riskify</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Professional safety documentation for Australian construction</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-blue-500/10">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Get Started</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Sign in to your account or create a new one to start building professional SWMS documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 mb-6">
                <TabsTrigger 
                  value="login" 
                  className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Email or Mobile Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="email@example.com or 04xxxxxxxx" 
                              className="h-12 px-4 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password"
                              className="h-12 px-4 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="space-y-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Smith" 
                                className="h-11 px-4 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="ABC Construction Pty Ltd" 
                                className="h-11 px-4 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Email or Mobile Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="email@example.com or 04xxxxxxxx" 
                              className="h-11 px-4 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Create a secure password"
                              className="h-11 px-4 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="primaryTrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Trade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 px-4 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                <SelectValue placeholder="Select your primary trade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tradeOptions.map((trade) => (
                                <SelectItem key={trade} value={trade}>
                                  {trade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creating account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-8 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{" "}
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Secure & Encrypted</span>
            <span>•</span>
            <span>Australian Compliance</span>
            <span>•</span>
            <span>Professional Grade</span>
          </div>
        </div>
      </div>
    </div>
  );
}