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
  Smartphone
} from "lucide-react";

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
      name: "Starter Plan",
      price: "$29",
      period: "/month",
      credits: "5 SWMS per month",
      features: [
        "AI-powered SWMS generation",
        "Basic template library",
        "PDF export",
        "Email support",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Pro Plan",
      price: "$50",
      period: "/month",
      credits: "10 SWMS per month",
      features: [
        "Everything in Starter",
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
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-3 rounded-full font-medium">
                <Shield className="h-5 w-5" />
                Safety Sensei - Australian SWMS Builder
              </div>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  Watch Demo
                </Button>
              </Link>
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

        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 opacity-20"
        >
          <Shield className="h-24 w-24 text-blue-600" />
        </motion.div>

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
              <FloatingCard key={index} delay={index * 0.2}>
                <Card className={`h-full relative ${plan.popular ? 'border-blue-500 border-2 scale-105' : 'border-gray-200'} shadow-lg`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <p className="text-blue-600 font-medium mt-2">{plan.credits}</p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
                      size="lg"
                    >
                      Get Started
                    </Button>
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