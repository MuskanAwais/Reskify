import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
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
      title: "12 Languages",
      description: "Full multi-language support including English, Chinese, Spanish, French, German, Italian, and more."
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
      name: "Free Trial",
      price: "Free",
      period: "",
      credits: "1 SWMS to test",
      features: [
        "AI-powered SWMS generation",
        "Basic template access",
        "PDF export",
        "See how it works",
        "No credit card required"
      ],
      popular: false,
      trial: true
    },
    {
      name: "Pro Plan",
      price: "$50",
      period: "/month",
      credits: "10 SWMS per month",
      features: [
        "AI-powered SWMS generation",
        "Advanced AI features",
        "Visual table editor",
        "Safety library access",
        "QR check-in system",
        "Multi-language support",
        "Voice control",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$100",
      period: "/month",
      credits: "25 SWMS per month",
      features: [
        "Everything in Pro",
        "Custom branding",
        "API access",
        "Advanced analytics",
        "Team management",
        "Custom integrations",
        "Dedicated support",
        "Training sessions"
      ],
      popular: false
    }
  ];

  const stats = [
    { number: "10,000+", label: "Construction Tasks", icon: <FileText className="h-6 w-6" /> },
    { number: "500+", label: "Australian Standards", icon: <Shield className="h-6 w-6" /> },
    { number: "12", label: "Languages Supported", icon: <Globe className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime Guarantee", icon: <Zap className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section with 3D Effects */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
              className="mb-16"
            >
              {/* Big Safety Sensei Logo */}
              <div className="flex justify-center items-center mb-8">
                <img 
                  src={logoImage} 
                  alt="Safety Sensei" 
                  className="w-80 h-80 object-contain drop-shadow-2xl"
                />
              </div>
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
              <div className="w-full">
                <Button 
                  size="lg" 
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg shadow-lg"
                  onClick={() => {
                    window.location.href = '/api/auth/google';
                  }}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Sign in to get your 1 free trial SWMS
                </p>
              </div>

              {/* Divider */}
              <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Secondary Actions */}
              <div className="w-full flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="flex-1">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3"
                  >
                    Create Account
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 border-gray-300 px-6 py-3" 
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
                      <div className="text-blue-600 mb-2 flex justify-center">
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
          <FileText className="h-32 w-32 text-blue-700" />
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
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">AI Project Setup</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Activity Selection</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Risk Assessment</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">PDF Generation</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
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
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader>
                    <div className="text-blue-600 mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the plan that fits your team size and project requirements. No hidden fees.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <FloatingCard key={index} delay={index * 0.15}>
                <Card className={`h-full relative ${
                  plan.trial ? 'border-green-500 border-2 bg-gradient-to-br from-green-50 to-white' :
                  plan.popular ? 'border-blue-500 border-2 scale-105' : 'border-gray-200'
                } shadow-lg`}>
                  {plan.trial && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-600 text-white px-4 py-1">
                        Try Now
                      </Badge>
                    </div>
                  )}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className={`text-3xl font-bold ${plan.trial ? 'text-green-600' : 'text-gray-900'}`}>
                        {plan.price}
                      </span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <p className={`font-medium mt-2 ${plan.trial ? 'text-green-600' : 'text-blue-600'}`}>
                      {plan.credits}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <CheckCircle className={`h-4 w-4 flex-shrink-0 ${plan.trial ? 'text-green-500' : 'text-green-500'}`} />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link href="/register">
                      <Button 
                        className={`w-full ${
                          plan.trial ? 'bg-green-600 hover:bg-green-700' :
                          plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'
                        } text-white`}
                        size="lg"
                      >
                        {plan.trial ? 'Start Free Trial' : 'Get Started'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </FloatingCard>
            ))}
          </div>

          <AnimatedSection delay={0.6}>
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                All plans include 14-day free trial • Cancel anytime • No setup fees
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
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                  Contact Sales
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
    </div>
  );
}