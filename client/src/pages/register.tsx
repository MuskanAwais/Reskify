import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { ArrowLeft, Shield, CheckCircle, Star } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    trade: "",
    phone: "",
    plan: "pro",
    agreeTerms: false
  });

  const [currentStep, setCurrentStep] = useState(1);

  const trades = [
    "Electrical", "Plumbing", "Carpentry", "Demolition", "Excavation",
    "Concrete", "Steel Fixing", "Roofing", "Painting", "Glazing",
    "HVAC", "Landscaping", "General Construction", "Other"
  ];

  const plans = [
    {
      id: "pro",
      name: "Pro Plan", 
      price: "$50",
      period: "/month",
      credits: "10 SWMS per month",
      popular: true,
      features: ["AI-powered generation", "Visual table editor", "QR check-in", "Multi-language", "Voice control"]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$100", 
      period: "/month",
      credits: "25 SWMS per month",
      popular: false,
      features: ["Everything in Pro", "Custom branding", "API access", "Advanced analytics", "Dedicated support"]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle final registration
      console.log("Registration submitted:", formData);
    }
  };

  const selectedPlan = plans.find(p => p.id === formData.plan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Start Your Free Trial
              </h1>
              <p className="text-xl text-gray-600">
                Get started with Safety Sensei - no credit card required for 14 days
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {currentStep === 1 && "Personal Information"}
                    {currentStep === 2 && "Choose Your Plan"}
                    {currentStep === 3 && "Complete Registration"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {currentStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name *
                            </label>
                            <Input
                              required
                              value={formData.fullName}
                              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                              placeholder="John Smith"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <Input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              placeholder="john@company.com"
                            />
                          </div>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Company *
                            </label>
                            <Input
                              required
                              value={formData.company}
                              onChange={(e) => setFormData({...formData, company: e.target.value})}
                              placeholder="ABC Construction"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone
                            </label>
                            <Input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              placeholder="+61 2 1234 5678"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Trade *
                          </label>
                          <Select value={formData.trade} onValueChange={(value) => setFormData({...formData, trade: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your primary trade" />
                            </SelectTrigger>
                            <SelectContent>
                              {trades.map((trade) => (
                                <SelectItem key={trade} value={trade.toLowerCase()}>
                                  {trade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        {plans.map((plan) => (
                          <div
                            key={plan.id}
                            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.plan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setFormData({...formData, plan: plan.id})}
                          >
                            {plan.popular && (
                              <div className="absolute -top-3 left-4">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  Most Popular
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  name="plan"
                                  value={plan.id}
                                  checked={formData.plan === plan.id}
                                  onChange={(e) => setFormData({...formData, plan: e.target.value})}
                                  className="text-blue-600"
                                />
                                <div>
                                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                                  <p className="text-gray-600">{plan.credits}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                  {plan.price}<span className="text-sm text-gray-600">{plan.period}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 text-sm text-gray-600">
                              {plan.features.slice(0, 2).map((feature, index) => (
                                <span key={index} className="inline-block mr-4">• {feature}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="bg-blue-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg mb-4">Registration Summary</h3>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                            <p><span className="font-medium">Email:</span> {formData.email}</p>
                            <p><span className="font-medium">Company:</span> {formData.company}</p>
                            <p><span className="font-medium">Trade:</span> {formData.trade}</p>
                            <p><span className="font-medium">Plan:</span> {selectedPlan?.name}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={formData.agreeTerms}
                            onCheckedChange={(checked) => setFormData({...formData, agreeTerms: !!checked})}
                          />
                          <div className="text-sm text-gray-600">
                            I agree to the{" "}
                            <Link href="/terms" className="text-blue-600 hover:underline">
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-blue-600 hover:underline">
                              Privacy Policy
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex justify-between pt-6">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(currentStep - 1)}
                        >
                          Previous
                        </Button>
                      )}
                      
                      <Button
                        type="submit"
                        className="ml-auto bg-blue-600 hover:bg-blue-700"
                        disabled={currentStep === 3 && !formData.agreeTerms}
                      >
                        {currentStep === 3 ? "Start Free Trial" : "Continue"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Plan Summary Sidebar */}
            <div>
              <Card className="shadow-lg sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Your Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPlan && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedPlan.price}<span className="text-sm text-gray-600">{selectedPlan.period}</span>
                        </p>
                        <p className="text-gray-600">{selectedPlan.credits}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {selectedPlan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Star className="h-4 w-4" />
                          14-day free trial
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Shield className="h-4 w-4" />
                          Cancel anytime
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}