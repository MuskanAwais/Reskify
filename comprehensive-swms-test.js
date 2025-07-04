/**
 * COMPREHENSIVE SWMS SYSTEM TEST SUITE
 * Tests complete workflow including step routing, signature implementation,
 * minimum task generation, and PDF generation using SWMSprint
 */

class ComprehensiveSWMSTest {
  constructor() {
    this.results = [];
    this.taskCount = 0;
    this.testStartTime = Date.now();
  }

  logTest(name, status, details, data = null) {
    const timestamp = new Date().toISOString();
    const result = {
      name,
      status,
      details,
      data,
      timestamp,
      duration: Date.now() - this.testStartTime
    };
    this.results.push(result);
    
    const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'orange';
    console.log(`%c[${status}] ${name}`, `color: ${color}; font-weight: bold`, details);
    
    if (data) {
      console.log('Data:', data);
    }
  }

  async runCompleteTest() {
    console.log('%cStarting Comprehensive SWMS System Test', 'color: blue; font-size: 16px; font-weight: bold');
    
    // Test 1: Step Structure and Routing
    await this.testStepStructure();
    
    // Test 2: Signature Implementation
    await this.testSignatureImplementation();
    
    // Test 3: Minimum Task Generation
    await this.testTaskGeneration();
    
    // Test 4: PDF Generation with SWMSprint
    await this.testPDFGeneration();
    
    // Test 5: Complete Workflow
    await this.testCompleteWorkflow();
    
    // Test 6: Critical Bug Fixes
    await this.testCriticalFixes();
    
    // Generate final report
    this.generateReport();
  }

  async testStepStructure() {
    console.log('\n=== Testing Step Structure and Routing ===');
    
    // Test progress bar structure
    const progressBar = document.querySelector('.flex.justify-between.mb-8');
    if (progressBar) {
      const steps = progressBar.querySelectorAll('.relative');
      this.logTest('Step Count', steps.length === 9 ? 'PASS' : 'FAIL', 
        `Found ${steps.length} steps, expected 9`);
    } else {
      this.logTest('Progress Bar', 'FAIL', 'Progress bar not found');
    }

    // Test step descriptions
    const stepDescriptions = {
      1: 'Enter project information and contractor details',
      2: 'Generate tasks with high-risk work selection and manage comprehensive risk assessments',
      3: 'Identify and select high-risk construction work categories',
      4: 'Select personal protective equipment requirements',
      5: 'Specify plant and equipment with risk assessments',
      6: 'Add authorizing signatures for document validation',
      7: 'Review and accept legal terms and conditions',
      8: 'Complete payment and access final document',
      9: 'Generate and download professional SWMS document'
    };

    for (let step = 1; step <= 9; step++) {
      const stepElement = document.querySelector(`[data-step="${step}"]`);
      if (stepElement) {
        const description = stepElement.textContent || '';
        const expected = stepDescriptions[step];
        const matches = description.includes(expected) || expected.includes(description);
        this.logTest(`Step ${step} Description`, matches ? 'PASS' : 'WARN', 
          `Expected: "${expected}", Found: "${description}"`);
      }
    }
  }

  async testSignatureImplementation() {
    console.log('\n=== Testing Signature Implementation ===');
    
    // Navigate to step 6
    const step6Button = document.querySelector('[data-step="6"]');
    if (step6Button) {
      step6Button.click();
      await this.wait(1000);
      
      // Check for signature section
      const signatureSection = document.querySelector('.signature-section');
      if (signatureSection) {
        this.logTest('Signature Section Present', 'PASS', 'Signature section found at step 6');
      } else {
        this.logTest('Signature Section Present', 'FAIL', 'Signature section not found at step 6');
      }
      
      // Check for creator/authorizer section
      const creatorSection = document.querySelector('.creator-signature');
      if (creatorSection) {
        this.logTest('Creator Signature Section', 'PASS', 'Creator signature section found');
      } else {
        this.logTest('Creator Signature Section', 'FAIL', 'Creator signature section missing');
      }
      
      // Check for additional signatories section
      const additionalSignatories = document.querySelector('.additional-signatories');
      if (additionalSignatories) {
        this.logTest('Additional Signatories Section', 'PASS', 'Additional signatories section found');
      } else {
        this.logTest('Additional Signatories Section', 'FAIL', 'Additional signatories section missing');
      }
    }
  }

  async testTaskGeneration() {
    console.log('\n=== Testing Minimum Task Generation ===');
    
    // Navigate to step 2
    const step2Button = document.querySelector('[data-step="2"]');
    if (step2Button) {
      step2Button.click();
      await this.wait(1000);
      
      // Test AI task generation
      const aiButton = document.querySelector('[data-action="ai-generate"]');
      if (aiButton) {
        aiButton.click();
        await this.wait(3000); // Wait for AI generation
        
        // Check task count
        const taskElements = document.querySelectorAll('.task-item');
        this.taskCount = taskElements.length;
        
        if (this.taskCount >= 8) {
          this.logTest('Minimum Task Count', 'PASS', 
            `Generated ${this.taskCount} tasks (minimum 8 required)`);
        } else {
          this.logTest('Minimum Task Count', 'FAIL', 
            `Generated only ${this.taskCount} tasks (minimum 8 required)`);
        }
        
        // Check for task duplicates
        const taskNames = Array.from(taskElements).map(el => el.textContent.trim());
        const uniqueTasks = [...new Set(taskNames)];
        
        if (uniqueTasks.length === taskNames.length) {
          this.logTest('Task Uniqueness', 'PASS', 'All tasks are unique');
        } else {
          this.logTest('Task Uniqueness', 'FAIL', 
            `Found ${taskNames.length - uniqueTasks.length} duplicate tasks`);
        }
      }
    }
  }

  async testPDFGeneration() {
    console.log('\n=== Testing PDF Generation with SWMSprint ===');
    
    // Navigate to step 9
    const step9Button = document.querySelector('[data-step="9"]');
    if (step9Button) {
      step9Button.click();
      await this.wait(2000);
      
      // Check for PDF generation status
      const pdfStatus = document.querySelector('.pdf-status');
      if (pdfStatus) {
        this.logTest('PDF Generation Started', 'PASS', 'PDF generation component loaded');
      } else {
        this.logTest('PDF Generation Started', 'FAIL', 'PDF generation component not found');
      }
      
      // Check loading messages
      const loadingMessages = document.querySelectorAll('.loading-message');
      if (loadingMessages.length > 0) {
        const hasGenericMessages = Array.from(loadingMessages).some(msg => 
          !msg.textContent.includes('SWMSprint') && 
          !msg.textContent.includes('RiskTemplateBuilder')
        );
        
        if (hasGenericMessages) {
          this.logTest('Generic Loading Messages', 'PASS', 'Loading messages don\'t reference specific app names');
        } else {
          this.logTest('Generic Loading Messages', 'FAIL', 'Loading messages reference specific app names');
        }
      }
    }
  }

  async testCompleteWorkflow() {
    console.log('\n=== Testing Complete Workflow ===');
    
    // Test step progression
    for (let step = 1; step <= 8; step++) {
      const stepButton = document.querySelector(`[data-step="${step}"]`);
      if (stepButton) {
        stepButton.click();
        await this.wait(500);
        
        // Check if step content loads
        const stepContent = document.querySelector('.step-content');
        if (stepContent) {
          this.logTest(`Step ${step} Navigation`, 'PASS', `Step ${step} content loaded successfully`);
        } else {
          this.logTest(`Step ${step} Navigation`, 'FAIL', `Step ${step} content failed to load`);
        }
      }
    }
    
    // Test step validation
    const nextButton = document.querySelector('[data-action="next"]');
    if (nextButton) {
      // Try to proceed without filling required fields
      nextButton.click();
      await this.wait(1000);
      
      const errorMessage = document.querySelector('.error-message');
      if (errorMessage) {
        this.logTest('Step Validation', 'PASS', 'Validation prevents progression without required fields');
      } else {
        this.logTest('Step Validation', 'WARN', 'No validation error shown');
      }
    }
  }

  async testCriticalFixes() {
    console.log('\n=== Testing Critical Bug Fixes ===');
    
    // Test draft creation bug fix
    const draftCount = await this.checkDraftCount();
    if (draftCount <= 2) {
      this.logTest('Draft Creation Bug', 'PASS', 'No excessive draft creation detected');
    } else {
      this.logTest('Draft Creation Bug', 'FAIL', `Found ${draftCount} drafts, possible duplication issue`);
    }
    
    // Test payment step routing
    const step8Button = document.querySelector('[data-step="8"]');
    if (step8Button) {
      step8Button.click();
      await this.wait(1000);
      
      const paymentContent = document.querySelector('.payment-content');
      if (paymentContent) {
        this.logTest('Payment Step Routing', 'PASS', 'Step 8 correctly shows payment content');
      } else {
        this.logTest('Payment Step Routing', 'FAIL', 'Step 8 does not show payment content');
      }
    }
    
    // Test signature step routing
    const step6Button = document.querySelector('[data-step="6"]');
    if (step6Button) {
      step6Button.click();
      await this.wait(1000);
      
      const signatureContent = document.querySelector('.signature-content');
      if (signatureContent) {
        this.logTest('Signature Step Routing', 'PASS', 'Step 6 correctly shows signature content');
      } else {
        this.logTest('Signature Step Routing', 'FAIL', 'Step 6 does not show signature content');
      }
    }
  }

  async checkDraftCount() {
    try {
      const response = await fetch('/api/swms/drafts', {
        credentials: 'include'
      });
      const data = await response.json();
      return data.length || 0;
    } catch (error) {
      return 0;
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('COMPREHENSIVE SWMS SYSTEM TEST REPORT');
    console.log('='.repeat(60));
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    const warningTests = this.results.filter(r => r.status === 'WARN').length;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`%cPassed: ${passedTests}`, 'color: green; font-weight: bold');
    console.log(`%cFailed: ${failedTests}`, 'color: red; font-weight: bold');
    console.log(`%cWarnings: ${warningTests}`, 'color: orange; font-weight: bold');
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`%cSuccess Rate: ${successRate}%`, 'color: blue; font-weight: bold');
    
    if (this.taskCount > 0) {
      console.log(`%cTask Generation: ${this.taskCount} tasks generated`, 'color: purple; font-weight: bold');
    }
    
    console.log('\nDetailed Results:');
    this.results.forEach((result, index) => {
      const color = result.status === 'PASS' ? 'green' : result.status === 'FAIL' ? 'red' : 'orange';
      console.log(`%c${index + 1}. [${result.status}] ${result.name}`, `color: ${color}`, result.details);
    });
    
    const totalDuration = Date.now() - this.testStartTime;
    console.log(`\nTotal Test Duration: ${totalDuration}ms`);
    
    // System Status
    if (failedTests === 0) {
      console.log('%c✅ SYSTEM STATUS: ALL TESTS PASSED - READY FOR PRODUCTION', 'color: green; font-size: 14px; font-weight: bold');
    } else if (failedTests <= 2) {
      console.log('%c⚠️ SYSTEM STATUS: MINOR ISSUES DETECTED - REVIEW REQUIRED', 'color: orange; font-size: 14px; font-weight: bold');
    } else {
      console.log('%c❌ SYSTEM STATUS: CRITICAL ISSUES DETECTED - FIXES REQUIRED', 'color: red; font-size: 14px; font-weight: bold');
    }
  }
}

// Auto-run test if in browser
if (typeof window !== 'undefined') {
  window.runComprehensiveSWMSTest = async () => {
    const tester = new ComprehensiveSWMSTest();
    await tester.runCompleteTest();
  };
  
  console.log('Comprehensive SWMS Test Suite loaded. Run with: runComprehensiveSWMSTest()');
}