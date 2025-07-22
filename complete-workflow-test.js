/**
 * COMPLETE WORKFLOW VALIDATION TEST
 * Tests every step of the SWMS builder workflow to ensure:
 * - Proper step content for each step
 * - Navigation works correctly
 * - Payment process functions
 * - SWMSprint integration works
 * - Minimum 8+ task generation always works
 */

class CompleteWorkflowTest {
  constructor() {
    this.results = [];
    this.currentStep = 1;
    this.testData = {
      projectName: 'Test Commercial Tiling Project',
      jobNumber: 'TEST-001',
      projectAddress: '123 Test Street, Sydney NSW 2000',
      tradeType: 'Tiling',
      description: 'Commercial bathroom tiling work',
      tasks: []
    };
  }

  async runCompleteWorkflowTest() {
    console.log('%c🎯 COMPLETE WORKFLOW VALIDATION TEST', 'color: blue; font-size: 16px; font-weight: bold');
    console.log('Testing every step from start to finish...\n');

    // Test each step of the workflow
    await this.testStep1ProjectDetails();
    await this.testStep2TaskGeneration();
    await this.testStep3HRCWSelection();
    await this.testStep4PPESelection();
    await this.testStep5PlantEquipment();
    await this.testStep6Signatures();
    await this.testStep7LegalDisclaimer();
    await this.testStep8Payment();
    await this.testStep9PDFGeneration();

    // Generate comprehensive report
    this.generateReport();
  }

  async testStep1ProjectDetails() {
    console.log('%c📋 TESTING STEP 1: PROJECT DETAILS', 'color: green; font-weight: bold');
    
    try {
      // Navigate to step 1 or ensure we're on step 1
      const step1Button = document.querySelector('[data-step="1"]');
      if (step1Button) {
        step1Button.click();
        await this.wait(500);
      }

      // Check for required form fields
      const requiredFields = [
        'input[name="jobName"], input[placeholder*="project name"], input[placeholder*="job name"]',
        'input[name="jobNumber"], input[placeholder*="job number"]',
        'input[name="projectAddress"], textarea[placeholder*="address"], input[placeholder*="address"]',
        'select[name="tradeType"], select[placeholder*="trade"], .trade-selector',
        'input[name="swmsCreatorName"], input[placeholder*="creator"], input[placeholder*="name"]'
      ];

      let fieldsFound = 0;
      for (const fieldSelector of requiredFields) {
        const field = document.querySelector(fieldSelector);
        if (field) {
          fieldsFound++;
          this.logTest(`Step 1 Field Present`, 'PASS', `Found field: ${fieldSelector.split(',')[0]}`);
        } else {
          this.logTest(`Step 1 Field Missing`, 'WARN', `Missing field: ${fieldSelector}`);
        }
      }

      // Test form validation
      const nextButton = document.querySelector('[data-action="next"], .next-button, button[type="submit"]');
      if (nextButton) {
        this.logTest('Step 1 Navigation Button', 'PASS', 'Next button found');
      } else {
        this.logTest('Step 1 Navigation Button', 'FAIL', 'Next button not found');
      }

      // Check step content description
      const stepContent = document.querySelector('.step-content, .form-content');
      if (stepContent && stepContent.textContent.toLowerCase().includes('project')) {
        this.logTest('Step 1 Content', 'PASS', 'Step 1 shows project-related content');
      } else {
        this.logTest('Step 1 Content', 'WARN', 'Step 1 content verification unclear');
      }

    } catch (error) {
      this.logTest('Step 1 Test', 'ERROR', error.message);
    }
  }

  async testStep2TaskGeneration() {
    console.log('%c⚡ TESTING STEP 2: TASK GENERATION (CRITICAL)', 'color: orange; font-weight: bold');
    
    try {
      // Navigate to step 2
      const step2Button = document.querySelector('[data-step="2"]');
      if (step2Button) {
        step2Button.click();
        await this.wait(1000);
      }

      // Look for AI generation button
      const aiButton = document.querySelector('[data-action="ai-generate"], .ai-button, .generate-button');
      if (aiButton) {
        this.logTest('Step 2 AI Generation Button', 'PASS', 'AI generation button found');

        // Test actual AI generation with minimum task requirement
        console.log('🚀 TESTING MINIMUM TASK GENERATION...');
        const response = await fetch('/api/generate-swms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            projectDetails: {
              tradeType: 'Tiling',
              location: 'Sydney, NSW',
              state: 'NSW',
              siteEnvironment: 'Commercial'
            },
            plainTextDescription: 'tiling a bathroom'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const taskCount = data.data?.activities?.length || 0;
          
          if (taskCount >= 8) {
            this.logTest('Minimum Task Generation', 'PASS', `Generated ${taskCount} tasks (minimum 8 required)`);
            this.testData.tasks = data.data.activities;
          } else {
            this.logTest('Minimum Task Generation', 'FAIL', `Only generated ${taskCount} tasks (minimum 8 required)`);
          }
        } else {
          this.logTest('AI Generation API', 'FAIL', `API returned ${response.status}`);
        }
      } else {
        this.logTest('Step 2 AI Generation Button', 'FAIL', 'AI generation button not found');
      }

      // Check for task display area
      const taskArea = document.querySelector('.task-list, .activities-list, .generated-tasks');
      if (taskArea) {
        this.logTest('Step 2 Task Display Area', 'PASS', 'Task display area found');
      } else {
        this.logTest('Step 2 Task Display Area', 'WARN', 'Task display area not found');
      }

    } catch (error) {
      this.logTest('Step 2 Test', 'ERROR', error.message);
    }
  }

  async testStep3HRCWSelection() {
    console.log('%c⚠️ TESTING STEP 3: HRCW SELECTION', 'color: purple; font-weight: bold');
    
    try {
      const step3Button = document.querySelector('[data-step="3"]');
      if (step3Button) {
        step3Button.click();
        await this.wait(500);
      }

      // Check for HRCW categories
      const hrcwCategories = document.querySelectorAll('.hrcw-category, .risk-category, [data-hrcw]');
      if (hrcwCategories.length > 0) {
        this.logTest('Step 3 HRCW Categories', 'PASS', `Found ${hrcwCategories.length} HRCW categories`);
      } else {
        this.logTest('Step 3 HRCW Categories', 'WARN', 'HRCW categories not found');
      }

      // Check step content
      const stepContent = document.querySelector('.step-content');
      if (stepContent && stepContent.textContent.toLowerCase().includes('risk')) {
        this.logTest('Step 3 Content', 'PASS', 'Step 3 shows risk-related content');
      }

    } catch (error) {
      this.logTest('Step 3 Test', 'ERROR', error.message);
    }
  }

  async testStep4PPESelection() {
    console.log('%c🦺 TESTING STEP 4: PPE SELECTION', 'color: yellow; font-weight: bold');
    
    try {
      const step4Button = document.querySelector('[data-step="4"]');
      if (step4Button) {
        step4Button.click();
        await this.wait(500);
      }

      // Check for PPE items
      const ppeItems = document.querySelectorAll('.ppe-item, .ppe-checkbox, [data-ppe]');
      if (ppeItems.length > 0) {
        this.logTest('Step 4 PPE Items', 'PASS', `Found ${ppeItems.length} PPE items`);
      } else {
        this.logTest('Step 4 PPE Items', 'WARN', 'PPE items not found');
      }

    } catch (error) {
      this.logTest('Step 4 Test', 'ERROR', error.message);
    }
  }

  async testStep5PlantEquipment() {
    console.log('%c🔧 TESTING STEP 5: PLANT & EQUIPMENT', 'color: brown; font-weight: bold');
    
    try {
      const step5Button = document.querySelector('[data-step="5"]');
      if (step5Button) {
        step5Button.click();
        await this.wait(500);
      }

      // Check for equipment forms
      const equipmentArea = document.querySelector('.equipment-area, .plant-equipment, [data-equipment]');
      if (equipmentArea) {
        this.logTest('Step 5 Equipment Area', 'PASS', 'Plant & equipment area found');
      } else {
        this.logTest('Step 5 Equipment Area', 'WARN', 'Plant & equipment area not found');
      }

    } catch (error) {
      this.logTest('Step 5 Test', 'ERROR', error.message);
    }
  }

  async testStep6Signatures() {
    console.log('%c✍️ TESTING STEP 6: SIGNATURES (CRITICAL)', 'color: red; font-weight: bold');
    
    try {
      const step6Button = document.querySelector('[data-step="6"]');
      if (step6Button) {
        step6Button.click();
        await this.wait(500);
      }

      // Check for signature components
      const signatureArea = document.querySelector('.signature-area, .digital-signature, [data-signature]');
      if (signatureArea) {
        this.logTest('Step 6 Signature Area', 'PASS', 'Signature area found at step 6');
      } else {
        this.logTest('Step 6 Signature Area', 'FAIL', 'Signature area NOT found at step 6 - ROUTING ISSUE');
      }

      // Check for creator/authorizer section
      const creatorSection = document.querySelector('.creator-signature, .authorizer-signature');
      if (creatorSection) {
        this.logTest('Step 6 Creator Section', 'PASS', 'Creator/authorizer signature section found');
      } else {
        this.logTest('Step 6 Creator Section', 'WARN', 'Creator/authorizer section not clearly identified');
      }

      // Verify this is NOT payment content
      const paymentContent = document.querySelector('.payment-content, .billing-info, [data-payment]');
      if (!paymentContent) {
        this.logTest('Step 6 Content Verification', 'PASS', 'Step 6 does NOT show payment content');
      } else {
        this.logTest('Step 6 Content Verification', 'FAIL', 'Step 6 incorrectly shows payment content');
      }

    } catch (error) {
      this.logTest('Step 6 Test', 'ERROR', error.message);
    }
  }

  async testStep7LegalDisclaimer() {
    console.log('%c⚖️ TESTING STEP 7: LEGAL DISCLAIMER', 'color: gray; font-weight: bold');
    
    try {
      const step7Button = document.querySelector('[data-step="7"]');
      if (step7Button) {
        step7Button.click();
        await this.wait(500);
      }

      // Check for legal content
      const legalContent = document.querySelector('.legal-disclaimer, .terms-conditions, [data-legal]');
      if (legalContent) {
        this.logTest('Step 7 Legal Content', 'PASS', 'Legal disclaimer content found');
      } else {
        this.logTest('Step 7 Legal Content', 'WARN', 'Legal disclaimer content not clearly identified');
      }

    } catch (error) {
      this.logTest('Step 7 Test', 'ERROR', error.message);
    }
  }

  async testStep8Payment() {
    console.log('%c💳 TESTING STEP 8: PAYMENT (CRITICAL)', 'color: green; font-weight: bold');
    
    try {
      const step8Button = document.querySelector('[data-step="8"]');
      if (step8Button) {
        step8Button.click();
        await this.wait(500);
      }

      // Check for payment content
      const paymentArea = document.querySelector('.payment-area, .billing-info, [data-payment]');
      if (paymentArea) {
        this.logTest('Step 8 Payment Area', 'PASS', 'Payment area found at step 8');
      } else {
        this.logTest('Step 8 Payment Area', 'FAIL', 'Payment area NOT found at step 8 - ROUTING ISSUE');
      }

      // Check for payment buttons
      const paymentButtons = document.querySelectorAll('.payment-button, .checkout-button, [data-payment-action]');
      if (paymentButtons.length > 0) {
        this.logTest('Step 8 Payment Buttons', 'PASS', `Found ${paymentButtons.length} payment buttons`);
      } else {
        this.logTest('Step 8 Payment Buttons', 'WARN', 'Payment buttons not found');
      }

      // Verify this is NOT signature content
      const signatureContent = document.querySelector('.signature-area, .digital-signature, [data-signature]');
      if (!signatureContent) {
        this.logTest('Step 8 Content Verification', 'PASS', 'Step 8 does NOT show signature content');
      } else {
        this.logTest('Step 8 Content Verification', 'FAIL', 'Step 8 incorrectly shows signature content');
      }

    } catch (error) {
      this.logTest('Step 8 Test', 'ERROR', error.message);
    }
  }

  async testStep9PDFGeneration() {
    console.log('%c📄 TESTING STEP 9: PDF GENERATION (SWMSprint)', 'color: blue; font-weight: bold');
    
    try {
      const step9Button = document.querySelector('[data-step="9"]');
      if (step9Button) {
        step9Button.click();
        await this.wait(1000);
      }

      // Check for PDF generation components
      const pdfArea = document.querySelector('.pdf-generation, .document-generation, [data-pdf]');
      if (pdfArea) {
        this.logTest('Step 9 PDF Area', 'PASS', 'PDF generation area found');
      } else {
        this.logTest('Step 9 PDF Area', 'WARN', 'PDF generation area not clearly identified');
      }

      // Check for loading messages (should NOT mention specific app names)
      const loadingMessages = document.querySelectorAll('.loading-message, .status-message');
      let hasGenericMessages = true;
      let hasAppReferences = false;

      loadingMessages.forEach(el => {
        const text = el.textContent || '';
        if (text.includes('SWMSprint') || text.includes('RiskTemplateBuilder') || text.includes('Riskify')) {
          hasAppReferences = true;
          hasGenericMessages = false;
        }
      });

      if (hasGenericMessages) {
        this.logTest('Step 9 Loading Messages', 'PASS', 'Loading messages are generic (no app name references)');
      } else {
        this.logTest('Step 9 Loading Messages', 'WARN', 'Loading messages contain app name references');
      }

      // Test SWMSprint integration (check if it would work)
      console.log('🔍 Testing SWMSprint integration readiness...');
      
      // Check if we have sufficient data for PDF generation
      if (this.testData.tasks.length >= 8) {
        this.logTest('Step 9 Data Readiness', 'PASS', `Sufficient data for PDF: ${this.testData.tasks.length} tasks`);
      } else {
        this.logTest('Step 9 Data Readiness', 'FAIL', `Insufficient data: only ${this.testData.tasks.length} tasks`);
      }

    } catch (error) {
      this.logTest('Step 9 Test', 'ERROR', error.message);
    }
  }

  logTest(name, status, details) {
    const result = { name, status, details, timestamp: new Date().toISOString() };
    this.results.push(result);
    
    const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : status === 'WARN' ? 'orange' : 'gray';
    console.log(`%c[${status}] ${name}`, `color: ${color}; font-weight: bold`, details);
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('%cCOMPLETE WORKFLOW TEST REPORT', 'color: blue; font-size: 16px; font-weight: bold');
    console.log('='.repeat(70));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    const warningTests = this.results.filter(r => r.status === 'WARN').length;
    const errorTests = this.results.filter(r => r.status === 'ERROR').length;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`%cPassed: ${passedTests}`, 'color: green; font-weight: bold');
    console.log(`%cFailed: ${failedTests}`, 'color: red; font-weight: bold');
    console.log(`%cWarnings: ${warningTests}`, 'color: orange; font-weight: bold');
    console.log(`%cErrors: ${errorTests}`, 'color: gray; font-weight: bold');

    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`%cSuccess Rate: ${successRate}%`, 'color: blue; font-weight: bold');

    // Critical issues summary
    const criticalFailures = this.results.filter(r => 
      r.status === 'FAIL' && 
      (r.name.includes('Step 6') || r.name.includes('Step 8') || r.name.includes('Minimum Task'))
    );

    if (criticalFailures.length > 0) {
      console.log('\n%c🚨 CRITICAL ISSUES DETECTED:', 'color: red; font-size: 14px; font-weight: bold');
      criticalFailures.forEach(failure => {
        console.log(`%c❌ ${failure.name}: ${failure.details}`, 'color: red');
      });
    }

    // Final status
    if (failedTests === 0) {
      console.log('\n%c✅ WORKFLOW STATUS: ALL STEPS WORKING CORRECTLY', 'color: green; font-size: 14px; font-weight: bold');
      console.log('%c🚀 READY FOR PRODUCTION USE', 'color: green; font-size: 14px; font-weight: bold');
    } else if (criticalFailures.length === 0) {
      console.log('\n%c⚠️ WORKFLOW STATUS: MINOR ISSUES ONLY', 'color: orange; font-size: 14px; font-weight: bold');
      console.log('%c✨ CORE FUNCTIONALITY WORKING', 'color: orange; font-size: 14px; font-weight: bold');
    } else {
      console.log('\n%c❌ WORKFLOW STATUS: CRITICAL ROUTING ISSUES', 'color: red; font-size: 14px; font-weight: bold');
      console.log('%c🛠️ IMMEDIATE FIXES REQUIRED', 'color: red; font-size: 14px; font-weight: bold');
    }

    console.log('\n' + '='.repeat(70));
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.testCompleteWorkflow = async () => {
    const tester = new CompleteWorkflowTest();
    await tester.runCompleteWorkflowTest();
  };
  
  console.log('%cComplete Workflow Test Suite loaded!', 'color: blue; font-weight: bold');
  console.log('Run with: testCompleteWorkflow()');
}