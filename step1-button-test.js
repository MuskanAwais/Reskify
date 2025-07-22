/**
 * STEP 1 CONTINUE BUTTON TEST
 * Tests the continue button functionality on Step 1 to identify and fix the "wigging out" issue
 */

class Step1ButtonTester {
  constructor() {
    this.testResults = [];
  }

  logTest(name, status, details) {
    const result = { name, status, details, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${name}: ${details}`);
    
    return result;
  }

  async testStep1ButtonFunctionality() {
    console.log('🧪 TESTING STEP 1 CONTINUE BUTTON FUNCTIONALITY');
    console.log('================================================');

    // Test 1: Check if SWMS builder page loads correctly
    if (window.location.pathname.includes('/swms-builder')) {
      this.logTest('Page Load', 'PASS', 'SWMS builder page is accessible');
    } else {
      this.logTest('Page Load', 'FAIL', 'Not on SWMS builder page');
      return;
    }

    // Test 2: Find the continue button
    const continueButton = document.querySelector('button[class*="bg-primary"]:not([disabled])') ||
                          document.querySelector('button:contains("Continue")') ||
                          document.querySelector('[data-action="next"]');

    if (continueButton) {
      this.logTest('Button Detection', 'PASS', 'Continue button found');
    } else {
      this.logTest('Button Detection', 'FAIL', 'Continue button not found');
      return;
    }

    // Test 3: Check button disabled state
    const isDisabled = continueButton.disabled || continueButton.getAttribute('disabled') !== null;
    this.logTest('Button State', isDisabled ? 'INFO' : 'PASS', 
                `Button is ${isDisabled ? 'disabled' : 'enabled'}`);

    // Test 4: Check form validation fields
    const requiredFields = {
      jobName: document.querySelector('input[id="jobName"], input[name="jobName"]'),
      tradeType: document.querySelector('select[name="tradeType"], select[id="tradeType"]'),
      swmsCreatorName: document.querySelector('input[id="swmsCreatorName"], input[name="swmsCreatorName"]'),
      projectInfo: document.querySelector('input[id="projectAddress"], input[name="projectAddress"], input[id="jobNumber"]'),
      personnel: document.querySelector('input[id="principalContractor"], input[name="principalContractor"]')
    };

    let fieldsFound = 0;
    Object.entries(requiredFields).forEach(([fieldName, element]) => {
      if (element) {
        fieldsFound++;
        this.logTest(`Field ${fieldName}`, 'PASS', `Field found: ${element.tagName.toLowerCase()}`);
      } else {
        this.logTest(`Field ${fieldName}`, 'WARN', `Field not found: ${fieldName}`);
      }
    });

    // Test 5: Fill out minimal required fields for testing
    if (requiredFields.jobName) {
      requiredFields.jobName.value = 'Test Project';
      requiredFields.jobName.dispatchEvent(new Event('input', { bubbles: true }));
      this.logTest('Job Name Fill', 'PASS', 'Job name field filled');
    }

    if (requiredFields.tradeType) {
      requiredFields.tradeType.value = 'General';
      requiredFields.tradeType.dispatchEvent(new Event('change', { bubbles: true }));
      this.logTest('Trade Type Fill', 'PASS', 'Trade type field filled');
    }

    if (requiredFields.swmsCreatorName) {
      requiredFields.swmsCreatorName.value = 'Test Creator';
      requiredFields.swmsCreatorName.dispatchEvent(new Event('input', { bubbles: true }));
      this.logTest('Creator Name Fill', 'PASS', 'Creator name field filled');
    }

    // Test 6: Wait for any auto-save to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 7: Test button click behavior
    let clickCount = 0;
    const originalOnClick = continueButton.onclick;
    
    continueButton.addEventListener('click', (e) => {
      clickCount++;
      console.log(`Button click #${clickCount} detected`);
      
      if (clickCount > 1 && clickCount < 4) {
        this.logTest('Multiple Clicks', 'WARN', 
                    `Button clicked ${clickCount} times - this indicates the wigging out issue`);
      }
    });

    // Test 8: Simulate the problematic clicking behavior
    console.log('🔄 Testing button click responsiveness...');
    
    const clickPromises = [];
    for (let i = 0; i < 3; i++) {
      clickPromises.push(
        new Promise(resolve => {
          setTimeout(() => {
            if (!continueButton.disabled) {
              continueButton.click();
              resolve(`Click ${i + 1} executed`);
            } else {
              resolve(`Click ${i + 1} blocked - button disabled`);
            }
          }, i * 200); // Rapid clicks 200ms apart
        })
      );
    }

    const clickResults = await Promise.all(clickPromises);
    clickResults.forEach((result, index) => {
      this.logTest(`Rapid Click ${index + 1}`, 'INFO', result);
    });

    // Test 9: Check validation errors
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const toastError = document.querySelector('[class*="toast"], [role="alert"]');
    if (toastError) {
      this.logTest('Validation Error', 'INFO', 
                  `Toast message found: ${toastError.textContent?.trim()}`);
    } else {
      this.logTest('Validation Error', 'PASS', 'No validation error toast displayed');
    }

    // Test 10: Check if step actually advanced
    const currentStepIndicator = document.querySelector('[class*="bg-primary"][class*="ring"]') ||
                                document.querySelector('[aria-current="step"]');
    
    if (currentStepIndicator) {
      const stepText = currentStepIndicator.textContent || 
                      currentStepIndicator.getAttribute('aria-label') || 
                      'Unknown';
      this.logTest('Step Progression', 'INFO', `Current step indicator: ${stepText}`);
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 STEP 1 BUTTON TEST REPORT');
    console.log('============================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnings = this.testResults.filter(r => r.status === 'WARN').length;
    
    console.log(`✅ Tests Passed: ${passed}`);
    console.log(`❌ Tests Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`📝 Total Tests: ${this.testResults.length}`);
    
    if (failed === 0 && warnings < 3) {
      console.log('\n🎉 STEP 1 BUTTON APPEARS TO BE WORKING CORRECTLY');
    } else if (warnings > 2) {
      console.log('\n🔧 STEP 1 BUTTON ISSUES DETECTED - NEEDS FIXING');
      console.log('Issues found:');
      this.testResults
        .filter(r => r.status === 'FAIL' || r.status === 'WARN')
        .forEach(r => console.log(`  - ${r.name}: ${r.details}`));
    }
    
    return {
      passed,
      failed,
      warnings,
      total: this.testResults.length,
      results: this.testResults
    };
  }
}

// Auto-run test if on SWMS builder page
if (window.location.pathname.includes('/swms-builder')) {
  const tester = new Step1ButtonTester();
  tester.testStep1ButtonFunctionality();
} else {
  console.log('🔍 To run Step 1 button test, navigate to /swms-builder first');
  console.log('Then run: new Step1ButtonTester().testStep1ButtonFunctionality()');
}