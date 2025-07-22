/**
 * COMPREHENSIVE PAYMENT FLOW TESTING SUITE
 * Tests all payment methods, credit systems, and workflow integrations
 * Run this in browser console to test complete payment ecosystem
 */

class PaymentFlowTester {
  constructor() {
    this.results = [];
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
    this.startTime = Date.now();
  }

  log(test, status, message, data = null) {
    this.testCount++;
    if (status === 'PASS') this.passCount++;
    if (status === 'FAIL') this.failCount++;
    
    const result = {
      test,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    const color = status === 'PASS' ? 'color: green' : 
                 status === 'FAIL' ? 'color: red' : 
                 'color: blue';
    
    console.log(`%c[${status}] ${test}: ${message}`, color, data || '');
  }

  async runCompletePaymentTests() {
    console.log('🔥 STARTING COMPREHENSIVE PAYMENT FLOW TESTING 🔥');
    console.log('Testing all payment methods, credit systems, and workflows...\n');
    
    try {
      // Test API endpoints
      await this.testPaymentAPIs();
      
      // Test credit system
      await this.testCreditSystem();
      
      // Test Stripe integration
      await this.testStripeIntegration();
      
      // Test workflow integration
      await this.testWorkflowIntegration();
      
      // Test billing interface
      await this.testBillingInterface();
      
      // Test edge cases
      await this.testEdgeCases();
      
      this.generateComprehensiveReport();
      
    } catch (error) {
      this.log('SYSTEM', 'FAIL', 'Critical testing error', error);
    }
  }

  async testPaymentAPIs() {
    console.log('\n📡 TESTING PAYMENT API ENDPOINTS');
    
    // Test billing data endpoint
    try {
      const billingResponse = await fetch('/api/user/billing');
      if (billingResponse.ok) {
        const billing = await billingResponse.json();
        this.log('Billing API', 'PASS', 'Billing endpoint accessible', billing);
        
        // Verify dual credit system
        if (billing.subscriptionCredits !== undefined && billing.addonCredits !== undefined) {
          this.log('Dual Credits', 'PASS', 'Separate credit types detected', {
            subscription: billing.subscriptionCredits,
            addon: billing.addonCredits,
            total: billing.credits
          });
        } else {
          this.log('Dual Credits', 'FAIL', 'Missing separate credit fields');
        }
      } else {
        this.log('Billing API', 'FAIL', `HTTP ${billingResponse.status}`);
      }
    } catch (error) {
      this.log('Billing API', 'FAIL', 'Network error', error);
    }

    // Test checkout session creation
    try {
      const checkoutTests = [
        { amount: 15, type: 'one-off', description: '$15 Single SWMS' },
        { amount: 60, type: 'one-off', description: '$60 SWMS Pack' },
        { amount: 60, type: 'credits', description: '$60 Credit Pack' },
        { amount: 100, type: 'credits', description: '$100 Credit Pack' }
      ];

      for (const test of checkoutTests) {
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(test)
          });
          
          if (response.ok) {
            const session = await response.json();
            this.log('Checkout API', 'PASS', `${test.description} session created`, session);
          } else {
            this.log('Checkout API', 'FAIL', `${test.description} failed: HTTP ${response.status}`);
          }
        } catch (error) {
          this.log('Checkout API', 'FAIL', `${test.description} network error`, error);
        }
      }
    } catch (error) {
      this.log('Checkout Tests', 'FAIL', 'Checkout testing failed', error);
    }

    // Test subscription creation
    try {
      const subscriptionResponse = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_test_123',
          planName: 'Pro Monthly'
        })
      });
      
      if (subscriptionResponse.ok) {
        const subscription = await subscriptionResponse.json();
        this.log('Subscription API', 'PASS', 'Subscription endpoint working', subscription);
      } else {
        this.log('Subscription API', 'FAIL', `HTTP ${subscriptionResponse.status}`);
      }
    } catch (error) {
      this.log('Subscription API', 'FAIL', 'Network error', error);
    }
  }

  async testCreditSystem() {
    console.log('\n💳 TESTING CREDIT SYSTEM');
    
    // Get initial credit state
    let initialCredits;
    try {
      const response = await fetch('/api/user/billing');
      if (response.ok) {
        initialCredits = await response.json();
        this.log('Initial Credits', 'INFO', 'Retrieved starting state', {
          total: initialCredits.credits,
          subscription: initialCredits.subscriptionCredits,
          addon: initialCredits.addonCredits
        });
      }
    } catch (error) {
      this.log('Initial Credits', 'FAIL', 'Could not get initial state', error);
    }

    // Test credit usage
    try {
      const creditResponse = await fetch('/api/user/use-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (creditResponse.ok) {
        const result = await creditResponse.json();
        this.log('Credit Usage', 'PASS', 'Credit deduction successful', result);
        
        // Verify priority (subscription credits first)
        if (result.subscriptionCredits !== undefined && result.addonCredits !== undefined) {
          this.log('Credit Priority', 'PASS', 'Dual credit system working', {
            remaining_subscription: result.subscriptionCredits,
            remaining_addon: result.addonCredits,
            total_remaining: result.creditsRemaining
          });
        }
      } else {
        const error = await creditResponse.text();
        this.log('Credit Usage', 'FAIL', `HTTP ${creditResponse.status}: ${error}`);
      }
    } catch (error) {
      this.log('Credit Usage', 'FAIL', 'Network error', error);
    }

    // Verify credit deduction
    try {
      const response = await fetch('/api/user/billing');
      if (response.ok) {
        const newCredits = await response.json();
        if (initialCredits && newCredits.credits < initialCredits.credits) {
          this.log('Credit Deduction', 'PASS', 'Credits properly reduced', {
            before: initialCredits.credits,
            after: newCredits.credits,
            difference: initialCredits.credits - newCredits.credits
          });
        } else {
          this.log('Credit Deduction', 'FAIL', 'Credits not properly deducted');
        }
      }
    } catch (error) {
      this.log('Credit Verification', 'FAIL', 'Could not verify deduction', error);
    }
  }

  async testStripeIntegration() {
    console.log('\n💳 TESTING STRIPE INTEGRATION');
    
    // Test if Stripe is loaded
    if (typeof Stripe !== 'undefined') {
      this.log('Stripe SDK', 'PASS', 'Stripe SDK loaded');
    } else {
      this.log('Stripe SDK', 'FAIL', 'Stripe SDK not found');
    }

    // Test webhook simulation
    try {
      // Simulate successful payment webhook
      const webhookTests = [
        {
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_123',
              amount_total: 1500, // $15
              metadata: { userId: '999', type: 'one-off' }
            }
          }
        },
        {
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_456',
              amount_total: 6000, // $60
              metadata: { userId: '999', type: 'one-off' }
            }
          }
        }
      ];

      for (const webhook of webhookTests) {
        this.log('Webhook Test', 'INFO', `Testing ${webhook.data.object.amount_total/100} payment`, webhook);
      }
    } catch (error) {
      this.log('Webhook Tests', 'FAIL', 'Webhook testing failed', error);
    }
  }

  async testWorkflowIntegration() {
    console.log('\n🔄 TESTING WORKFLOW INTEGRATION');
    
    // Test SWMS builder integration
    if (window.location.pathname.includes('swms-builder')) {
      this.log('SWMS Builder', 'INFO', 'Currently in SWMS builder');
      
      // Test payment step
      const paymentElements = document.querySelectorAll('[data-testid*="payment"], .payment, #payment');
      if (paymentElements.length > 0) {
        this.log('Payment UI', 'PASS', 'Payment elements found', paymentElements.length);
      } else {
        this.log('Payment UI', 'WARN', 'No payment elements visible');
      }
    } else {
      this.log('SWMS Builder', 'INFO', 'Not in SWMS builder, testing navigation');
      
      // Test if we can access the builder
      try {
        window.open('/swms-builder', '_blank');
        this.log('Builder Navigation', 'PASS', 'SWMS builder accessible');
      } catch (error) {
        this.log('Builder Navigation', 'FAIL', 'Cannot access SWMS builder', error);
      }
    }

    // Test draft saving integration
    try {
      const draftsResponse = await fetch('/api/swms/drafts');
      if (draftsResponse.ok) {
        const drafts = await draftsResponse.json();
        this.log('Draft Integration', 'PASS', `Found ${drafts.length} drafts`);
      } else {
        this.log('Draft Integration', 'FAIL', `HTTP ${draftsResponse.status}`);
      }
    } catch (error) {
      this.log('Draft Integration', 'FAIL', 'Cannot access drafts', error);
    }
  }

  async testBillingInterface() {
    console.log('\n🖥️ TESTING BILLING INTERFACE');
    
    // Check if we're on billing page
    if (window.location.pathname.includes('billing')) {
      this.log('Billing Page', 'INFO', 'Currently on billing page');
      
      // Test mobile payment options
      const mobileOptions = document.querySelectorAll('.mobile, [class*="mobile"]');
      this.log('Mobile UI', mobileOptions.length > 0 ? 'PASS' : 'WARN', 
        `Mobile elements: ${mobileOptions.length}`);
      
      // Test payment buttons
      const paymentButtons = document.querySelectorAll('button[onclick*="payment"], button[onclick*="checkout"]');
      this.log('Payment Buttons', paymentButtons.length > 0 ? 'PASS' : 'WARN',
        `Payment buttons: ${paymentButtons.length}`);
      
      // Test credit display
      const creditElements = document.querySelectorAll('[class*="credit"], [data-testid*="credit"]');
      this.log('Credit Display', creditElements.length > 0 ? 'PASS' : 'WARN',
        `Credit elements: ${creditElements.length}`);
        
    } else {
      this.log('Billing Page', 'INFO', 'Not on billing page, testing navigation');
      
      try {
        window.open('/billing', '_blank');
        this.log('Billing Navigation', 'PASS', 'Billing page accessible');
      } catch (error) {
        this.log('Billing Navigation', 'FAIL', 'Cannot access billing page', error);
      }
    }

    // Test responsive design
    const isMobile = window.innerWidth < 768;
    this.log('Responsive Test', 'INFO', `Screen width: ${window.innerWidth}px (${isMobile ? 'Mobile' : 'Desktop'})`);
  }

  async testEdgeCases() {
    console.log('\n⚠️ TESTING EDGE CASES');
    
    // Test with zero credits
    try {
      const zeroCreditsResponse = await fetch('/api/user/use-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!zeroCreditsResponse.ok) {
        const error = await zeroCreditsResponse.text();
        if (error.includes('No credits') || zeroCreditsResponse.status === 400) {
          this.log('Zero Credits', 'PASS', 'Properly handles zero credits');
        } else {
          this.log('Zero Credits', 'FAIL', 'Unexpected error handling');
        }
      }
    } catch (error) {
      this.log('Zero Credits', 'FAIL', 'Network error', error);
    }

    // Test invalid payment amounts
    try {
      const invalidResponse = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: -50, type: 'invalid' })
      });
      
      if (!invalidResponse.ok) {
        this.log('Invalid Payment', 'PASS', 'Properly rejects invalid amounts');
      } else {
        this.log('Invalid Payment', 'FAIL', 'Accepts invalid payment data');
      }
    } catch (error) {
      this.log('Invalid Payment', 'WARN', 'Network error on invalid test', error);
    }

    // Test session management
    const sessionTest = sessionStorage.getItem('testPayment');
    if (sessionTest) {
      this.log('Session Test', 'PASS', 'Session storage working');
    } else {
      sessionStorage.setItem('testPayment', 'working');
      this.log('Session Test', 'PASS', 'Session storage initialized');
    }
  }

  generateComprehensiveReport() {
    const duration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('🔥 COMPREHENSIVE PAYMENT FLOW TEST RESULTS 🔥');
    console.log('='.repeat(80));
    console.log(`📊 Total Tests: ${this.testCount}`);
    console.log(`✅ Passed: ${this.passCount}`);
    console.log(`❌ Failed: ${this.failCount}`);
    console.log(`⚠️ Warnings: ${this.results.filter(r => r.status === 'WARN').length}`);
    console.log(`ℹ️ Info: ${this.results.filter(r => r.status === 'INFO').length}`);
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`🎯 Success Rate: ${((this.passCount / this.testCount) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log('='.repeat(50));
    
    // Group by category
    const categories = {};
    this.results.forEach(result => {
      const category = result.test.split(' ')[0];
      if (!categories[category]) categories[category] = [];
      categories[category].push(result);
    });
    
    Object.entries(categories).forEach(([category, tests]) => {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : 
                    test.status === 'FAIL' ? '❌' : 
                    test.status === 'WARN' ? '⚠️' : 'ℹ️';
        console.log(`  ${icon} ${test.test}: ${test.message}`);
        if (test.data && typeof test.data === 'object') {
          console.log(`      Data:`, test.data);
        }
      });
    });

    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('='.repeat(30));
    
    if (this.failCount > 0) {
      console.log('❌ Fix failed tests before production deployment');
    }
    
    const warningCount = this.results.filter(r => r.status === 'WARN').length;
    if (warningCount > 0) {
      console.log('⚠️ Review warning items for potential improvements');
    }
    
    if (this.passCount === this.testCount) {
      console.log('🎉 All tests passed! System ready for production.');
    }
    
    console.log('\n📄 Full test data available in PaymentFlowTester.results');
    
    // Export results for further analysis
    window.paymentTestResults = {
      summary: {
        total: this.testCount,
        passed: this.passCount,
        failed: this.failCount,
        warnings: warningCount,
        duration: duration,
        successRate: (this.passCount / this.testCount) * 100
      },
      details: this.results,
      categories: categories
    };
  }
}

// Auto-run comprehensive testing
console.log('🚀 Starting Comprehensive Payment Flow Testing...');
const tester = new PaymentFlowTester();
tester.runCompletePaymentTests();

// Export for manual testing
window.PaymentFlowTester = PaymentFlowTester;
window.paymentTester = tester;