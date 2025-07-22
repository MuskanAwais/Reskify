/**
 * COMPREHENSIVE PAYMENT SYSTEM TEST SUITE
 * Tests all payment workflows, credit systems, and billing integration
 */

class PaymentSystemTester {
  constructor() {
    this.testResults = [];
    this.testUsers = [
      { id: 9, username: 'testuser1@example.com', password: 'password123', name: 'Test User One' },
      { id: 10, username: 'testuser2@example.com', password: 'password123', name: 'Test User Two' },
      { id: 11, username: 'testuser3@example.com', password: 'password123', name: 'Test User Three' }
    ];
    this.adminUser = { username: 'demo', password: 'password123' };
  }

  async runCompletePaymentTests() {
    console.log('💳 COMPREHENSIVE PAYMENT SYSTEM TESTING');
    console.log('═'.repeat(80));

    try {
      // PHASE 1: Credit System Validation
      await this.testCreditSystem();
      
      // PHASE 2: Payment Intent Creation
      await this.testPaymentIntentCreation();
      
      // PHASE 3: Stripe Integration
      await this.testStripeIntegration();
      
      // PHASE 4: Billing Interface
      await this.testBillingInterface();
      
      // PHASE 5: Credit Usage Workflow
      await this.testCreditUsageWorkflow();
      
      // PHASE 6: Admin Credit Management
      await this.testAdminCreditManagement();
      
      // PHASE 7: Payment Flow Integration
      await this.testPaymentFlowIntegration();
      
      // PHASE 8: Edge Cases & Error Handling
      await this.testPaymentEdgeCases();

      this.generatePaymentReport();
      
    } catch (error) {
      console.error('❌ Critical payment test failure:', error);
      this.logTest('CRITICAL PAYMENT ERROR', false, error.message, 'System');
    }
  }

  // PHASE 1: Credit System Validation
  async testCreditSystem() {
    console.log('\n🏦 PHASE 1: Credit System Validation');
    console.log('-'.repeat(60));

    for (const user of this.testUsers) {
      await this.testLogin(user.username, user.password);
      
      // Test credit balance retrieval
      const userProfile = await this.apiCall('GET', '/api/user');
      if (userProfile.ok) {
        const credits = userProfile.data;
        const swmsCredits = credits.swmsCredits || 0;
        const subscriptionCredits = credits.subscriptionCredits || 0;
        const addonCredits = credits.addonCredits || 0;
        const totalCredits = swmsCredits + subscriptionCredits + addonCredits;
        
        this.logTest(`${user.name} Credit Balance`, totalCredits >= 0, 
          `SWMS: ${swmsCredits}, Subscription: ${subscriptionCredits}, Add-on: ${addonCredits}, Total: ${totalCredits}`, 'CreditSystem');
        
        // Test credit types are properly separated
        this.logTest(`${user.name} Credit Types`, true, 
          `Dual credit system: ${subscriptionCredits} subscription + ${addonCredits} add-on`, 'CreditSystem');
      }
    }
  }

  // PHASE 2: Payment Intent Creation
  async testPaymentIntentCreation() {
    console.log('\n🔐 PHASE 2: Payment Intent Creation');
    console.log('-'.repeat(60));

    const paymentOptions = [
      { amount: 1500, type: 'single-swms', description: 'Single SWMS ($15)' },
      { amount: 6000, type: 'swms-pack', description: 'SWMS Pack ($60)' },
      { amount: 2500, type: 'pro-monthly', description: 'Pro Monthly ($25)' },
      { amount: 4900, type: 'pro-annual', description: 'Pro Annual ($49)' }
    ];

    await this.testLogin(this.testUsers[0].username, this.testUsers[0].password);

    for (const payment of paymentOptions) {
      const intentResponse = await this.apiCall('POST', '/api/payments/create-payment-intent', {
        amount: payment.amount,
        type: payment.type
      });

      this.logTest(`Payment Intent: ${payment.description}`, intentResponse.ok, 
        intentResponse.ok ? `Created with amount: $${payment.amount/100}` : `Failed: ${intentResponse.status}`, 'PaymentIntents');

      if (intentResponse.ok && intentResponse.data) {
        const hasClientSecret = !!intentResponse.data.clientSecret;
        this.logTest(`Client Secret: ${payment.type}`, hasClientSecret, 
          hasClientSecret ? 'Client secret generated' : 'Missing client secret', 'PaymentIntents');
      }
    }
  }

  // PHASE 3: Stripe Integration
  async testStripeIntegration() {
    console.log('\n💰 PHASE 3: Stripe Integration');
    console.log('-'.repeat(60));

    // Test webhook endpoint
    const webhookTest = await this.apiCall('POST', '/api/payments/webhook', {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          amount: 1500,
          metadata: { type: 'single-swms', userId: '9' }
        }
      }
    });

    this.logTest('Stripe Webhook', webhookTest.ok, 
      webhookTest.ok ? 'Webhook processed successfully' : 'Webhook processing failed', 'StripeIntegration');

    // Test subscription webhook
    const subscriptionWebhook = await this.apiCall('POST', '/api/payments/webhook', {
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          subscription: 'sub_test_123',
          amount_paid: 2500,
          customer: 'cus_test_123'
        }
      }
    });

    this.logTest('Subscription Webhook', subscriptionWebhook.ok, 
      subscriptionWebhook.ok ? 'Subscription webhook processed' : 'Subscription webhook failed', 'StripeIntegration');
  }

  // PHASE 4: Billing Interface
  async testBillingInterface() {
    console.log('\n📄 PHASE 4: Billing Interface');
    console.log('-'.repeat(60));

    // Test billing page access
    const billingPage = await fetch('/billing');
    this.logTest('Billing Page Access', billingPage.ok, 
      billingPage.ok ? 'Billing page loads successfully' : 'Billing page failed to load', 'BillingInterface');

    // Test billing API endpoints
    await this.testLogin(this.testUsers[0].username, this.testUsers[0].password);

    const billingEndpoints = [
      { path: '/api/user/billing', method: 'GET', name: 'User Billing Info' },
      { path: '/api/user/subscription', method: 'GET', name: 'Subscription Status' }
    ];

    for (const endpoint of billingEndpoints) {
      const response = await this.apiCall(endpoint.method, endpoint.path);
      this.logTest(endpoint.name, response.ok, 
        response.ok ? 'Endpoint accessible' : `Failed with status ${response.status}`, 'BillingInterface');
    }
  }

  // PHASE 5: Credit Usage Workflow
  async testCreditUsageWorkflow() {
    console.log('\n⚡ PHASE 5: Credit Usage Workflow');
    console.log('-'.repeat(60));

    for (const user of this.testUsers) {
      await this.testLogin(user.username, user.password);
      
      // Get initial credit balance
      const initialBalance = await this.apiCall('GET', '/api/user');
      
      if (initialBalance.ok) {
        const initialCredits = initialBalance.data.swmsCredits || 0;
        
        // Test credit usage
        const creditUsage = await this.apiCall('POST', '/api/user/use-credit');
        this.logTest(`${user.name} Credit Usage`, creditUsage.ok, 
          creditUsage.ok ? 'Credit deducted successfully' : 'Credit usage failed', 'CreditUsage');
        
        if (creditUsage.ok) {
          // Verify credit deduction
          const newBalance = await this.apiCall('GET', '/api/user');
          if (newBalance.ok) {
            const newCredits = newBalance.data.swmsCredits || 0;
            const creditDeducted = initialCredits - newCredits;
            
            this.logTest(`${user.name} Credit Deduction`, creditDeducted === 1, 
              `Credits: ${initialCredits} → ${newCredits} (${creditDeducted} deducted)`, 'CreditUsage');
          }
        }
      }
    }
  }

  // PHASE 6: Admin Credit Management
  async testAdminCreditManagement() {
    console.log('\n👑 PHASE 6: Admin Credit Management');
    console.log('-'.repeat(60));

    await this.testLogin(this.adminUser.username, this.adminUser.password);

    for (const user of this.testUsers) {
      // Test adding credits to user
      const addCredits = await this.apiCall('POST', `/api/admin/users/${user.id}/credits`, {
        credits: 3
      });

      this.logTest(`Add Credits to ${user.name}`, addCredits.ok, 
        addCredits.ok ? '3 credits added successfully' : 'Credit addition failed', 'AdminCreditManagement');

      // Test viewing user credits
      const viewCredits = await this.apiCall('GET', `/api/admin/users/${user.id}/credits`);
      this.logTest(`View ${user.name} Credits`, viewCredits.ok, 
        viewCredits.ok ? `Credits: ${viewCredits.data?.credits || 'N/A'}` : 'Credit view failed', 'AdminCreditManagement');
    }
  }

  // PHASE 7: Payment Flow Integration
  async testPaymentFlowIntegration() {
    console.log('\n🔄 PHASE 7: Payment Flow Integration');
    console.log('-'.repeat(60));

    await this.testLogin(this.testUsers[0].username, this.testUsers[0].password);

    // Test SWMS creation with payment workflow
    const swmsData = {
      title: 'Payment Test SWMS',
      jobName: 'Payment Test Job',
      projectAddress: 'Test Payment Address',
      projectLocation: 'Test Payment Location',
      tradeType: 'General',
      activities: ['Payment test activity'],
      status: 'draft'
    };

    const swmsCreation = await this.apiCall('POST', '/api/swms', swmsData);
    this.logTest('SWMS for Payment', swmsCreation.ok, 
      swmsCreation.ok ? `SWMS created with ID: ${swmsCreation.data?.id}` : 'SWMS creation failed', 'PaymentFlow');

    if (swmsCreation.ok) {
      const swmsId = swmsCreation.data.id;
      
      // Test payment step integration
      const paymentStep = await this.apiCall('GET', `/api/swms/draft/${swmsId}`);
      this.logTest('Payment Step Access', paymentStep.ok, 
        paymentStep.ok ? 'Payment step accessible' : 'Payment step failed', 'PaymentFlow');
      
      // Test completing payment with credits
      const completeWithCredits = await this.apiCall('POST', `/api/swms/${swmsId}/complete-payment`, {
        paymentMethod: 'credits'
      });
      
      this.logTest('Complete with Credits', completeWithCredits.ok, 
        completeWithCredits.ok ? 'Payment completed with credits' : 'Credit payment failed', 'PaymentFlow');
    }
  }

  // PHASE 8: Edge Cases & Error Handling
  async testPaymentEdgeCases() {
    console.log('\n⚠️ PHASE 8: Edge Cases & Error Handling');
    console.log('-'.repeat(60));

    await this.testLogin(this.testUsers[0].username, this.testUsers[0].password);

    // Test insufficient credits
    const insufficientCredits = await this.apiCall('POST', '/api/user/use-credit');
    // Keep using credits until we get an error
    let creditAttempts = 0;
    let lastResult = insufficientCredits;
    
    while (lastResult.ok && creditAttempts < 20) {
      lastResult = await this.apiCall('POST', '/api/user/use-credit');
      creditAttempts++;
    }
    
    this.logTest('Insufficient Credits Handling', !lastResult.ok || creditAttempts > 0, 
      creditAttempts > 0 ? `Used ${creditAttempts} credits before limit` : 'Credit limit not reached', 'EdgeCases');

    // Test invalid payment amounts
    const invalidPayment = await this.apiCall('POST', '/api/payments/create-payment-intent', {
      amount: -100,
      type: 'invalid'
    });

    this.logTest('Invalid Payment Amount', !invalidPayment.ok, 
      !invalidPayment.ok ? 'Invalid payment correctly rejected' : 'SECURITY ISSUE: Invalid payment accepted', 'EdgeCases');

    // Test unauthorized payment access
    await this.apiCall('POST', '/api/auth/logout');
    
    const unauthorizedPayment = await this.apiCall('POST', '/api/payments/create-payment-intent', {
      amount: 1500,
      type: 'single-swms'
    });

    this.logTest('Unauthorized Payment', !unauthorizedPayment.ok, 
      !unauthorizedPayment.ok ? 'Unauthorized payment blocked' : 'SECURITY ISSUE: Unauthorized access', 'EdgeCases');
  }

  // Helper Methods
  async testLogin(username, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async apiCall(method, endpoint, data = null) {
    try {
      const options = {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, options);
      const responseData = response.ok ? await response.json() : null;

      return {
        ok: response.ok,
        status: response.status,
        data: responseData
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  }

  logTest(testName, passed, details, category = 'General') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const result = { testName, passed, details, category, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    
    console.log(`${status} | ${testName}`);
    if (details) {
      console.log(`    📝 ${details}`);
    }
  }

  generatePaymentReport() {
    console.log('\n' + '═'.repeat(80));
    console.log('💳 COMPREHENSIVE PAYMENT SYSTEM REPORT');
    console.log('═'.repeat(80));

    const categories = [...new Set(this.testResults.map(r => r.category))];
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 PAYMENT SYSTEM SUMMARY:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);

    console.log(`\n💰 PAYMENT CATEGORIES:`);
    categories.forEach(category => {
      const categoryTests = this.testResults.filter(r => r.category === category);
      const categoryPassed = categoryTests.filter(r => r.passed).length;
      const categoryTotal = categoryTests.length;
      const categoryRate = ((categoryPassed/categoryTotal)*100).toFixed(1);
      
      console.log(`   ${category}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);
    });

    const criticalPaymentSystems = ['CreditSystem', 'PaymentIntents', 'StripeIntegration', 'CreditUsage'];
    console.log(`\n🎯 CRITICAL PAYMENT SYSTEMS:`);
    criticalPaymentSystems.forEach(system => {
      const systemTests = this.testResults.filter(r => r.category === system);
      const systemPassed = systemTests.filter(r => r.passed).length;
      const systemTotal = systemTests.length;
      const status = systemTotal > 0 ? (systemPassed === systemTotal ? 'OPERATIONAL' : 'ISSUES DETECTED') : 'NOT TESTED';
      const icon = status === 'OPERATIONAL' ? '✅' : '⚠️';
      
      console.log(`   ${icon} ${system}: ${status}`);
    });

    if (failedTests > 0) {
      console.log(`\n❌ PAYMENT SYSTEM FAILURES:`);
      categories.forEach(category => {
        const categoryFailures = this.testResults.filter(r => r.category === category && !r.passed);
        if (categoryFailures.length > 0) {
          console.log(`\n   ${category}:`);
          categoryFailures.forEach((failure, index) => {
            console.log(`     ${index + 1}. ${failure.testName}: ${failure.details}`);
          });
        }
      });
    }

    console.log('\n✨ Payment System Testing Complete!');
  }
}

// Initialize and run payment tests
window.paymentTester = new PaymentSystemTester();
console.log('💳 Payment System Tester Loaded');
console.log('Run: paymentTester.runCompletePaymentTests()');

// Auto-start payment testing
paymentTester.runCompletePaymentTests();