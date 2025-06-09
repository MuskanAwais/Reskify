import React from 'react';
import StripeSubscription from '@/components/stripe-subscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, Zap, Crown } from 'lucide-react';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Riskify Subscriptions</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional SWMS creation and safety management for Australian construction industry
          </p>
          <div className="mt-6">
            <Badge variant="secondary" className="text-sm">
              All plans include 30-day free trial • Australian GST included • Cancel anytime
            </Badge>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">What's Included Across All Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Australian Compliance</h3>
                  <p className="text-sm text-gray-600">WHS Act 2011 & AS/NZS standards</p>
                </div>
                <div className="text-center">
                  <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Risk Assessment</h3>
                  <p className="text-sm text-gray-600">AI-powered risk identification</p>
                </div>
                <div className="text-center">
                  <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Digital Signatures</h3>
                  <p className="text-sm text-gray-600">Secure signature collection</p>
                </div>
                <div className="text-center">
                  <Crown className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">PDF Generation</h3>
                  <p className="text-sm text-gray-600">Professional documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        <StripeSubscription />

        {/* Trust & Security */}
        <div className="mt-12 text-center">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Secure Payments</h3>
                  <p className="text-sm text-gray-600">256-bit SSL encryption via Stripe</p>
                </div>
                <div>
                  <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold">Australian Hosted</h3>
                  <p className="text-sm text-gray-600">Data stored in Australian servers</p>
                </div>
                <div>
                  <Crown className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold">24/7 Support</h3>
                  <p className="text-sm text-gray-600">Expert safety consultants available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            All prices in Australian Dollars (AUD) including 10% GST as required by law.
            <br />
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            <br />
            Riskify Pty Ltd • ABN: 12 345 678 901 • Australian Construction Safety Solutions
          </p>
        </div>
      </div>
    </div>
  );
}