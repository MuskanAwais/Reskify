import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  Shield,
  FileText, 
  Bot, 
  CheckCircle, 
  Star,
  ArrowRight,
  Users,
  Clock,
  Award,
  Zap,
  Globe,
  Lock,
  Download,
  Camera,
  Mic,
  Languages,
  Smartphone,
  Play
} from "lucide-react";
import Logo from "@/components/ui/logo";
import logoImage from "@assets/Untitled design-2.png";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { EnhancedTooltip, TooltipProvider } from "@/components/ui/tooltip-enhanced";
import { FeatureWalkthrough, useFeatureWalkthrough } from "@/components/ui/feature-walkthrough";

const AnimatedSection = ({ children, className = "", delay = 0 }: any) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FloatingCard = ({ children, delay = 0 }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Redirect to dashboard when user is authenticated
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);
  const { 
    isActive: isWalkthroughActive, 
    startWalkthrough, 
    completeWalkthrough, 
    skipWalkthrough,
    hasSeenWalkthrough 
  } = useFeatureWalkthrough();

  // Walkthrough steps for first-time users
  const walkthroughSteps = [
    {
      id: 'hero',
      title: 'Welcome to Safety Sensei',
      description: 'Your AI-powered SWMS builder designed specifically for Australian construction safety compliance.',
      target: '[data-walkthrough="hero"]',
      position: 'bottom' as const,
      highlight: true
    },
    {
      id: 'features',
      title: 'Powerful Features',
      description: 'Explore our comprehensive suite of tools including AI generation, visual editing, and multi-language support.',
      target: '[data-walkthrough="features"]',
      position: 'top' as const,
      highlight: true
    },
    {
      id: 'pricing',
      title: 'Choose Your Plan',
      description: 'Start with a free trial or select a subscription plan that fits your needs.',
      target: '[data-walkthrough="pricing"]',
      position: 'top' as const,
      highlight: true
    },
    {
      id: 'get-started',
      title: 'Get Started',
      description: 'Click here to sign in with Google and begin creating your first SWMS document.',
      target: '[data-walkthrough="get-started"]',
      position: 'top' as const,
      highlight: true
    }
  ];

  const handleGetStarted = () => {
    setLocation("/auth");
  };

  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI-Powered Generation",
      description: "Generate comprehensive SWMS documents using advanced AI technology trained on Australian safety standards."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Visual Table Editor",
      description: "Edit risk assessments directly with interactive dropdowns, real-time validation, and intelligent suggestions."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Australian Compliance",
      description: "Built specifically for Australian construction with comprehensive coverage of AS/NZS standards and regulations."
    },
    {
      icon: <Languages className="h-8 w-8" />,
      title: "15 Languages",
      description: "Full multi-language support including English, Chinese, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Arabic, Hindi, Dutch, Swedish, and Norwegian."
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Voice Control",
      description: "Hands-free SWMS creation and editing with advanced voice recognition and mobile optimization."
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: "QR Check-in System",
      description: "Digital worker check-ins with GPS location tracking and real-time safety compliance monitoring."
    }
  ];

  const pricing = [
    {
      name: "One-Off SWMS",
      type: "one-off",
      price: "$15",
      period: " + GST/SWMS",
      credits: "Single SWMS document",
      features: [
        "Single SWMS document",
        "Standard templates",
        "Visual table editor",
        "PDF generation",
        "Credits never expire"
      ],
      popular: false
    },
    {
      name: "Subscription",
      type: "subscription",
      price: billingPeriod === 'yearly' ? "$540" : "$50",
      period: billingPeriod === 'yearly' ? " + GST/year" : " + GST/month",
      credits: "10 SWMS per month",
      originalPrice: billingPeriod === 'yearly' ? "$600" : null,
      discount: billingPeriod === 'yearly' ? "Save 10%" : null,
      features: [
        "10 SWMS per month",
        "Standard templates",
        "Visual table editor",
        "Team collaboration",
        "Priority support",
        "Email support"
      ],
      popular: true
    }
  ];

  const stats = [
    { number: "200+", label: "Construction Tasks", icon: <FileText className="h-6 w-6" /> },
    { number: "50+", label: "Australian Standards", icon: <Shield className="h-6 w-6" /> },
    { number: "15", label: "Languages Supported", icon: <Globe className="h-6 w-6" /> },
    { number: "AI-Powered", label: "Risk Assessment", icon: <Zap className="h-6 w-6" /> }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Floating Background Safety Sensei Logo */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <motion.img
          src={logoImage}
          alt="Safety Sensei Background"
          className="absolute w-[48rem] h-[48rem] object-contain opacity-5"
          animate={{
            x: [100, -100, 100],
            y: [50, -50, 50],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            top: "30%",
            left: "20%",
          }}
        />
      </motion.div>

      {/* Hero Section with 3D Effects */}
      <section data-walkthrough="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden z-10">
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-blue-800/10"
        />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-12"
            >
              <Logo size="xl" className="justify-center" />
            </motion.div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
              Professional SWMS
              <br />
              <span className="text-4xl md:text-6xl">Built for Australia</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Create comprehensive Safe Work Method Statements with AI-powered technology. 
              Fully compliant with Australian standards, featuring voice control, multi-language support, 
              and intelligent safety recommendations.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.6}>
            <div className="flex flex-col gap-6 justify-center items-center max-w-md mx-auto">
              {/* Primary Action - Sign In with Google */}
              <div className="w-full" data-walkthrough="get-started">
                <EnhancedTooltip content="Sign in with Google to start creating professional SWMS documents with AI assistance">
                  <Button 
                    size="lg" 
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg shadow-lg"
                    onClick={handleGetStarted}
                    disabled={isLoading}
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    Get Started Now
                  </Button>
                </EnhancedTooltip>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Create your account to get started with professional SWMS documents
                </p>
              </div>

              {/* Divider */}
              <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Secondary Actions */}
              <div className="w-full flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/auth" className="flex-1">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full border-primary/600 text-primary/600 hover:bg-primary/50 px-6 py-3"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full border-primary text-primary hover:bg-primary/5 px-6 py-3"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full border-gray-300 px-6 py-3" 
                  onClick={() => {
                    document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.8}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <FloatingCard key={index} delay={index * 0.1}>
                  <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="text-primary/600 mb-2 flex justify-center">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                </FloatingCard>
              ))}
            </div>
          </AnimatedSection>
        </div>



        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-10 opacity-20"
        >
          <FileText className="h-32 w-32 text-primary/700" />
        </motion.div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                See Safety Sensei in Action
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Watch how easy it is to create professional SWMS documents in under 5 minutes
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="max-w-4xl mx-auto">
              <Card className="overflow-hidden shadow-2xl border-0">
                <div className="relative bg-gradient-to-br from-blue-900 to-blue-700 aspect-video flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer"
                  >
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="h-12 w-12 text-white ml-1" />
                    </div>
                  </motion.div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Complete SWMS Creation Demo</h3>
                    <p className="text-white/80">From project setup to PDF generation - 4:32</p>
                  </div>
                </div>
              </Card>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">See the complete workflow:</p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <span className="bg-primary/100 text-primary/800 px-3 py-1 rounded-full">AI Project Setup</span>
                  <span className="bg-primary/100 text-primary/800 px-3 py-1 rounded-full">Activity Selection</span>
                  <span className="bg-primary/100 text-primary/800 px-3 py-1 rounded-full">Risk Assessment</span>
                  <span className="bg-primary/100 text-primary/800 px-3 py-1 rounded-full">PDF Generation</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section data-walkthrough="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Powerful Features for Modern Construction
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to create, manage, and maintain world-class safety documentation
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FloatingCard key={index} delay={index * 0.1}>
                <EnhancedTooltip content={`Learn more about ${feature.title}: ${feature.description}`} side="top">
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 cursor-pointer">
                    <CardHeader>
                      <div className="text-primary/600 mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </EnhancedTooltip>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section data-walkthrough="pricing" className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Choose the plan that fits your team size and project requirements. No hidden fees.
              </p>
              
              {/* Billing Period Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    billingPeriod === 'yearly' ? 'bg-primary/600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                  Yearly
                </span>
                {billingPeriod === 'yearly' && (
                  <Badge className="bg-green-100 text-green-800 ml-2">
                    Save 10%
                  </Badge>
                )}
              </div>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <FloatingCard key={index} delay={index * 0.15}>
                <EnhancedTooltip content={`${plan.name} plan includes: ${plan.features.join(', ')}. Perfect for ${plan.name === 'Basic' ? 'small teams getting started' : plan.name === 'Pro Plan' ? 'medium teams with advanced needs' : 'large enterprises with full requirements'}.`} side="top">
                  <Card className={`h-full relative cursor-pointer ${
                    plan.popular ? 'border-primary/500 border-2 scale-105' : 'border-gray-200'
                  } shadow-lg hover:shadow-xl transition-all duration-300`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary/600 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      {plan.originalPrice && billingPeriod === 'yearly' && (
                        <div className="text-sm text-gray-500 line-through mb-1">
                          {plan.originalPrice} + GST/year
                        </div>
                      )}
                      <span className="text-3xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600">{plan.period}</span>
                      {plan.discount && billingPeriod === 'yearly' && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          {plan.discount}
                        </div>
                      )}
                    </div>
                    <p className="font-medium mt-2 text-primary/600">
                      {plan.credits}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link href="/register">
                      <Button 
                        className={`w-full ${
                          plan.popular ? 'bg-primary/600 hover:bg-primary/700' : 'bg-gray-900 hover:bg-gray-800'
                        } text-white`}
                        size="lg"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                </EnhancedTooltip>
              </FloatingCard>
            ))}
          </div>

          <AnimatedSection delay={0.6}>
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                Cancel anytime • No setup fees • Australian Owned
              </p>
              <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Secure Payments
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Australian Owned
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  24/7 Support
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Safety Documentation?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join thousands of Australian construction professionals using Safety Sensei to create 
              professional SWMS documents in minutes, not hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg bg-white text-primary/600 hover:bg-gray-100">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary/600">
                  View Pricing
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Instant PDF Export
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile Optimized
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Save 80% Time
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Feature Walkthrough Component */}
      <FeatureWalkthrough
        steps={walkthroughSteps}
        isActive={isWalkthroughActive}
        onComplete={completeWalkthrough}
        onSkip={skipWalkthrough}
      />
    </div>
    </TooltipProvider>
  );
}