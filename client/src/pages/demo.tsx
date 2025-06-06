import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Play, CheckCircle } from "lucide-react";

export default function Demo() {
  const demoSteps = [
    {
      title: "Create New SWMS",
      description: "Start with AI-powered project details or select from templates",
      video: "/demo/step1.mp4"
    },
    {
      title: "Select Activities",
      description: "Choose from 10,000+ construction activities with intelligent suggestions",
      video: "/demo/step2.mp4"
    },
    {
      title: "Visual Risk Assessment",
      description: "Edit risk levels, controls, and compliance codes with interactive tables",
      video: "/demo/step3.mp4"
    },
    {
      title: "Generate PDF",
      description: "Export professional SWMS documents with digital signatures",
      video: "/demo/step4.mp4"
    }
  ];

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
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              See Safety Sensei in Action
            </h1>
            <p className="text-xl text-gray-600">
              Watch how easy it is to create professional SWMS documents in minutes
            </p>
          </div>

          <div className="grid gap-8">
            {demoSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary/600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Demo Video Coming Soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-primary/100 mb-6">
                  Join thousands of construction professionals using Safety Sensei
                </p>
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="bg-white text-primary/600 hover:bg-gray-100">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}