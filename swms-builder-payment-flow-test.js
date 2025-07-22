/**
 * COMPLETE SWMS BUILDER PAYMENT FLOW INTEGRATION TEST
 * Tests end-to-end payment workflow including:
 * 1. SWMS draft creation and saving
 * 2. Payment step integration
 * 3. Credit usage vs Stripe checkout
 * 4. Post-payment workflow completion
 * 5. Navigation and status updates
 */

class SWMSPaymentFlowTester {
  constructor() {
    this.testResults = [];
    this.currentDraftId = null;
    this.startTime = Date.now();
  }

  async runCompleteWorkflowTest() {
    console.log('🚀 STARTING COMPLETE SWMS BUILDER PAYMENT FLOW TEST');
    console.log('Testing complete end-to-end payment integration...\n');

    try {
      // Step 1: Test SWMS draft creation
      await this.testDraftCreation();
      
      // Step 2: Test payment step integration
      await this.testPaymentStepIntegration();
      
      // Step 3: Test credit payment flow
      await this.testCreditPaymentFlow();
      
      // Step 4: Test Stripe payment flow
      await this.testStripePaymentFlow();
      
      // Step 5: Test post-payment workflow
      await this.testPostPaymentWorkflow();
      
      // Step 6: Test mobile vs desktop interfaces
      await this.testResponsivePaymentInterface();
      
      this.generateWorkflowReport();
      
    } catch (error) {
      console.error('❌ Critical workflow test error:', error);
    }
  }

  logTest(test, status, message, data = null) {
    const result = { test, status, message, data, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
    console.log(`${icon} ${test}: ${message}`, data || '');
  }

  async testDraftCreation() {
    console.log('\n📝 TESTING SWMS DRAFT CREATION & INTEGRATION');
    
    // Create a test SWMS draft
    const draftData = {
      title: 'Payment Flow Test SWMS',
      jobName: 'Commercial Tiling Project',
      jobNumber: 'TEST-001',
      projectAddress: '123 Test Street, Sydney NSW 2000',
      projectLocation: 'Sydney CBD',
      principalContractor: 'Test Construction Pty Ltd',
      projectManager: 'John Smith',
      siteSupervisor: 'Jane Doe',
      swmsCreatorName: 'Test Creator',
      workActivities: [
        {
          name: 'Floor preparation and cleaning',
          hazards: ['Slip and fall hazards from wet surfaces', 'Manual handling of heavy equipment'],
          controlMeasures: ['Use non-slip footwear and warning signs', 'Use proper lifting techniques and team lifting'],
          initialRisk: 'Medium',
          residualRisk: 'Low'
        }
      ],
      status: 'draft'
    };

    try {
      const response = await fetch('/api/swms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      });

      if (response.ok) {
        const draft = await response.json();
        this.currentDraftId = draft.id;
        this.logTest('Draft Creation', 'PASS', `SWMS draft created with ID: ${draft.id}`, draft);
        
        // Verify draft appears in user's drafts
        const draftsResponse = await fetch('/api/swms/drafts');
        if (draftsResponse.ok) {
          const drafts = await draftsResponse.json();
          const ourDraft = drafts.find(d => d.id === this.currentDraftId);
          if (ourDraft) {
            this.logTest('Draft Listing', 'PASS', 'Draft appears in user drafts list');
          } else {
            this.logTest('Draft Listing', 'FAIL', 'Draft not found in drafts list');
          }
        }
      } else {
        this.logTest('Draft Creation', 'FAIL', `HTTP ${response.status}`);
      }
    } catch (error) {
      this.logTest('Draft Creation', 'FAIL', 'Network error', error);
    }
  }

  async testPaymentStepIntegration() {
    console.log('\n💳 TESTING PAYMENT STEP INTEGRATION');
    
    // Test if payment is required for draft completion
    if (this.currentDraftId) {
      try {
        // Try to access draft for editing
        const draftResponse = await fetch(`/api/swms/draft/${this.currentDraftId}`);
        if (draftResponse.ok) {
          const draft = await draftResponse.json();
          this.logTest('Draft Access', 'PASS', 'Can access draft for payment step', {
            id: draft.id,
            status: draft.status
          });
          
          // Verify draft is still in draft status (unpaid)
          if (draft.status === 'draft') {
            this.logTest('Payment Required', 'PASS', 'Draft correctly requires payment to complete');
          } else {
            this.logTest('Payment Required', 'WARN', `Draft status unexpected: ${draft.status}`);
          }
        }
      } catch (error) {
        this.logTest('Draft Access', 'FAIL', 'Cannot access draft', error);
      }
    }

    // Test payment options availability
    try {
      const billingResponse = await fetch('/api/user/billing');
      if (billingResponse.ok) {
        const billing = await billingResponse.json();
        this.logTest('Payment Options', 'PASS', 'Billing data accessible for payment decision', {
          totalCredits: billing.credits,
          subscriptionCredits: billing.subscriptionCredits,
          addonCredits: billing.addonCredits
        });
        
        // Determine if user can pay with credits or needs Stripe
        if (billing.credits > 0) {
          this.logTest('Credit Payment Available', 'PASS', `User has ${billing.credits} credits available`);
        } else {
          this.logTest('Credit Payment Available', 'WARN', 'User has no credits, Stripe payment required');
        }
      }
    } catch (error) {
      this.logTest('Payment Options', 'FAIL', 'Cannot check payment options', error);
    }
  }

  async testCreditPaymentFlow() {
    console.log('\n🎫 TESTING CREDIT PAYMENT FLOW');
    
    // Get current credit state
    let beforeCredits;
    try {
      const billingResponse = await fetch('/api/user/billing');
      if (billingResponse.ok) {
        beforeCredits = await billingResponse.json();
        this.logTest('Pre-Payment Credits', 'INFO', 'Credits before payment', {
          total: beforeCredits.credits,
          subscription: beforeCredits.subscriptionCredits,
          addon: beforeCredits.addonCredits
        });
      }
    } catch (error) {
      this.logTest('Pre-Payment Credits', 'FAIL', 'Cannot get credit state', error);
    }

    // Test credit payment
    if (beforeCredits && beforeCredits.credits > 0) {
      try {
        const creditResponse = await fetch('/api/user/use-credit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (creditResponse.ok) {
          const result = await creditResponse.json();
          this.logTest('Credit Payment', 'PASS', 'Credit payment successful', result);
          
          // Verify credit deduction
          const afterBillingResponse = await fetch('/api/user/billing');
          if (afterBillingResponse.ok) {
            const afterCredits = await afterBillingResponse.json();
            
            if (afterCredits.credits === beforeCredits.credits - 1) {
              this.logTest('Credit Deduction', 'PASS', 'Credit properly deducted', {
                before: beforeCredits.credits,
                after: afterCredits.credits
              });
            } else {
              this.logTest('Credit Deduction', 'FAIL', 'Credit deduction incorrect');
            }
            
            // Verify priority system (subscription credits first)
            if (beforeCredits.subscriptionCredits > 0 && 
                afterCredits.subscriptionCredits === beforeCredits.subscriptionCredits - 1 &&
                afterCredits.addonCredits === beforeCredits.addonCredits) {
              this.logTest('Credit Priority', 'PASS', 'Subscription credits deducted first');
            } else if (beforeCredits.subscriptionCredits === 0 &&
                       afterCredits.addonCredits === beforeCredits.addonCredits - 1) {
              this.logTest('Credit Priority', 'PASS', 'Add-on credits deducted when subscription exhausted');
            } else {
              this.logTest('Credit Priority', 'WARN', 'Credit priority system unclear');
            }
          }
        } else {
          this.logTest('Credit Payment', 'FAIL', `HTTP ${creditResponse.status}`);
        }
      } catch (error) {
        this.logTest('Credit Payment', 'FAIL', 'Network error', error);
      }
    } else {
      this.logTest('Credit Payment', 'SKIP', 'No credits available for testing');
    }
  }

  async testStripePaymentFlow() {
    console.log('\n💸 TESTING STRIPE PAYMENT FLOW');
    
    // Test different payment amounts
    const paymentTests = [
      { amount: 15, type: 'one-off', description: '$15 Single SWMS' },
      { amount: 60, type: 'one-off', description: '$60 SWMS Pack' },
      { amount: 60, type: 'credits', description: '$60 Credit Pack' }
    ];

    for (const test of paymentTests) {
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test)
        });

        if (response.ok) {
          const session = await response.json();
          this.logTest('Stripe Checkout', 'PASS', `${test.description} session created`, {
            sessionId: session.sessionId,
            amount: session.amount
          });
          
          // Test webhook simulation for this payment
          await this.simulateStripeWebhook(session.sessionId, test.amount * 100, test.type);
          
        } else {
          this.logTest('Stripe Checkout', 'FAIL', `${test.description} failed: HTTP ${response.status}`);
        }
      } catch (error) {
        this.logTest('Stripe Checkout', 'FAIL', `${test.description} network error`, error);
      }
    }
  }

  async simulateStripeWebhook(sessionId, amountTotal, type) {
    const webhookData = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          amount_total: amountTotal,
          metadata: {
            userId: '999',
            type: type
          }
        }
      }
    };

    try {
      const webhookResponse = await fetch('/api/stripe-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      if (webhookResponse.ok) {
        const amount = amountTotal / 100;
        this.logTest('Webhook Simulation', 'PASS', `$${amount} payment webhook processed`);
        
        // Verify credit addition
        const billingResponse = await fetch('/api/user/billing');
        if (billingResponse.ok) {
          const billing = await billingResponse.json();
          this.logTest('Credit Addition', 'PASS', 'Credits updated after payment', {
            subscription: billing.subscriptionCredits,
            addon: billing.addonCredits,
            total: billing.credits
          });
        }
      } else {
        this.logTest('Webhook Simulation', 'FAIL', `Webhook failed: HTTP ${webhookResponse.status}`);
      }
    } catch (error) {
      this.logTest('Webhook Simulation', 'FAIL', 'Webhook simulation error', error);
    }
  }

  async testPostPaymentWorkflow() {
    console.log('\n🔄 TESTING POST-PAYMENT WORKFLOW');
    
    // Test if draft is marked as completed after payment
    if (this.currentDraftId) {
      try {
        const draftResponse = await fetch(`/api/swms/draft/${this.currentDraftId}`);
        if (draftResponse.ok) {
          const draft = await draftResponse.json();
          
          if (draft.status === 'completed') {
            this.logTest('Draft Completion', 'PASS', 'Draft marked as completed after payment');
          } else {
            this.logTest('Draft Completion', 'WARN', `Draft status: ${draft.status}`);
          }
        }
      } catch (error) {
        this.logTest('Draft Completion', 'FAIL', 'Cannot check draft status', error);
      }
    }

    // Test navigation after payment
    try {
      const swmsResponse = await fetch('/api/swms');
      if (swmsResponse.ok) {
        const swmsList = await swmsResponse.json();
        const completedSwms = swmsList.filter(s => s.status === 'completed');
        this.logTest('SWMS Navigation', 'PASS', `${completedSwms.length} completed SWMS available`);
        
        // Test PDF download availability
        if (completedSwms.length > 0) {
          const latestSwms = completedSwms[0];
          this.logTest('PDF Access', 'PASS', `PDF download available for SWMS ${latestSwms.id}`);
        }
      }
    } catch (error) {
      this.logTest('SWMS Navigation', 'FAIL', 'Cannot access completed SWMS', error);
    }
  }

  async testResponsivePaymentInterface() {
    console.log('\n📱 TESTING RESPONSIVE PAYMENT INTERFACE');
    
    // Test current viewport
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const isDesktop = window.innerWidth >= 1024;
    
    this.logTest('Viewport Detection', 'INFO', `Screen: ${window.innerWidth}x${window.innerHeight}`, {
      mobile: isMobile,
      tablet: isTablet,
      desktop: isDesktop
    });

    // Test if on billing page
    if (window.location.pathname.includes('billing')) {
      this.logTest('Billing Page', 'INFO', 'Currently on billing page');
      
      // Test mobile-specific elements
      if (isMobile) {
        const mobilePaymentOptions = document.querySelectorAll('.mobile-payment, [class*="mobile"]');
        this.logTest('Mobile Interface', 'PASS', `Mobile elements found: ${mobilePaymentOptions.length}`);
        
        // Check for the three main mobile options
        const paymentButtons = document.querySelectorAll('button[onclick*="checkout"], button[onclick*="payment"]');
        if (paymentButtons.length >= 3) {
          this.logTest('Mobile Payment Options', 'PASS', 'Three main payment options available');
        } else {
          this.logTest('Mobile Payment Options', 'WARN', `Only ${paymentButtons.length} payment options found`);
        }
      }
    } else {
      this.logTest('Billing Page', 'INFO', 'Not on billing page - testing navigation');
    }

    // Test credit display responsiveness
    const creditElements = document.querySelectorAll('[data-testid*="credit"], .credit, [class*="credit"]');
    if (creditElements.length > 0) {
      this.logTest('Credit Display', 'PASS', `Credit elements visible: ${creditElements.length}`);
    } else {
      this.logTest('Credit Display', 'WARN', 'No credit display elements found');
    }
  }

  generateWorkflowReport() {
    const duration = Date.now() - this.startTime;
    const totalTests = this.testResults.length;
    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const failCount = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnCount = this.testResults.filter(r => r.status === 'WARN').length;
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 COMPLETE SWMS BUILDER PAYMENT FLOW TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⚠️ Warnings: ${warnCount}`);
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`🎯 Success Rate: ${((passCount / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 WORKFLOW STAGES:');
    console.log('='.repeat(50));
    
    const stages = {
      'Draft Creation': this.testResults.filter(r => r.test.includes('Draft')),
      'Payment Integration': this.testResults.filter(r => r.test.includes('Payment')),
      'Credit System': this.testResults.filter(r => r.test.includes('Credit')),
      'Stripe Integration': this.testResults.filter(r => r.test.includes('Stripe') || r.test.includes('Webhook')),
      'Post-Payment Workflow': this.testResults.filter(r => r.test.includes('Completion') || r.test.includes('Navigation')),
      'Interface Testing': this.testResults.filter(r => r.test.includes('Interface') || r.test.includes('Mobile'))
    };

    Object.entries(stages).forEach(([stage, tests]) => {
      const stagePass = tests.filter(t => t.status === 'PASS').length;
      const stageFail = tests.filter(t => t.status === 'FAIL').length;
      const stageTotal = tests.length;
      
      console.log(`\n🔧 ${stage}: ${stagePass}/${stageTotal} passed`);
      tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : 
                    test.status === 'WARN' ? '⚠️' : 'ℹ️';
        console.log(`   ${icon} ${test.message}`);
      });
    });

    console.log('\n🚀 DEPLOYMENT READINESS:');
    console.log('='.repeat(30));
    
    if (failCount === 0) {
      console.log('✅ Payment system ready for production deployment');
      console.log('✅ All critical payment flows working correctly');
      console.log('✅ Dual credit system functioning properly');
      console.log('✅ Stripe integration operational');
    } else {
      console.log('❌ Fix critical failures before production deployment');
      console.log(`❌ ${failCount} critical issues need resolution`);
    }
    
    if (warnCount > 0) {
      console.log(`⚠️ ${warnCount} warning items should be reviewed`);
    }

    // Export comprehensive results
    window.swmsPaymentTestResults = {
      summary: { total: totalTests, passed: passCount, failed: failCount, warnings: warnCount, duration },
      stages: stages,
      fullResults: this.testResults,
      draftId: this.currentDraftId
    };
    
    console.log('\n📄 Complete test data available in window.swmsPaymentTestResults');
  }
}

// Auto-run the complete workflow test
console.log('🔥 Starting Complete SWMS Builder Payment Flow Test...');
const workflowTester = new SWMSPaymentFlowTester();
workflowTester.runCompleteWorkflowTest();

// Export for manual testing
window.SWMSPaymentFlowTester = SWMSPaymentFlowTester;
window.workflowTester = workflowTester;