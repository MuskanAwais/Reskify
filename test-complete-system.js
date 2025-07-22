/**
 * COMPLETE SYSTEM TEST - Task Generation & Credit Processing
 * Tests both critical fixes: minimum 8 tasks and instant credit processing
 */

class CompleteSystemTester {
  constructor() {
    this.results = {
      taskGeneration: [],
      creditProcessing: [],
      totalTests: 0,
      passed: 0,
      failed: 0
    };
  }

  async runCompleteTest() {
    console.log('🚀 STARTING COMPLETE SYSTEM TEST');
    console.log('Testing: 1) Minimum 8 task generation, 2) Instant credit processing\n');

    // Test task generation for multiple trades
    await this.testTaskGeneration();
    
    // Test credit processing performance
    await this.testCreditProcessing();

    // Generate final report
    this.generateReport();
  }

  async testTaskGeneration() {
    console.log('📋 TESTING TASK GENERATION - MINIMUM 8 TASKS GUARANTEE');
    
    const testTrades = [
      { name: 'Tiling', expected: 9, description: 'Moderate complexity trade' },
      { name: 'Electrical', expected: 10, description: 'Complex trade' },
      { name: 'Carpentry', expected: 9, description: 'Moderate complexity trade' },
      { name: 'Plumbing', expected: 10, description: 'Complex trade' },
      { name: 'General Construction', expected: 8, description: 'Simple trade' }
    ];

    for (const trade of testTrades) {
      try {
        console.log(`\n🔧 Testing ${trade.name} (${trade.description})...`);
        
        const startTime = Date.now();
        const response = await fetch('/api/generate-swms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tradeType: trade.name,
            projectDetails: {
              jobDescription: `${trade.name.toLowerCase()} work project`,
              siteName: "Test Construction Site",
              siteAddress: "123 Test Street",
              siteSupervisor: "John Smith", 
              projectManager: "Jane Doe",
              principalContractor: "ABC Construction",
              jobNumber: "TEST001",
              jobName: `${trade.name} Test Project`
            },
            enhancedSafetyOptions: {
              siteEnvironment: "Commercial",
              state: "NSW", 
              hrcwCategories: []
            }
          })
        });

        const duration = Date.now() - startTime;

        if (response.ok) {
          const result = await response.json();
          const taskCount = result.workActivities ? result.workActivities.length : 0;
          
          const passed = taskCount >= 8;
          this.logTest(`${trade.name} Task Count`, passed, 
            `Generated ${taskCount} tasks (minimum 8 required, expected ~${trade.expected})`, 
            'TaskGeneration', { taskCount, duration, trade: trade.name });

          // Verify task quality
          if (result.workActivities && result.workActivities.length > 0) {
            const firstTask = result.workActivities[0];
            const hasRequiredFields = firstTask.name && firstTask.hazards && firstTask.controlMeasures;
            this.logTest(`${trade.name} Task Quality`, hasRequiredFields,
              hasRequiredFields ? 'Tasks have required fields (name, hazards, controls)' : 'Tasks missing required fields',
              'TaskGeneration');
          }

        } else {
          const error = await response.text();
          this.logTest(`${trade.name} Generation`, false, 
            `API Error: ${response.status} - ${error}`, 'TaskGeneration');
        }

      } catch (error) {
        this.logTest(`${trade.name} Generation`, false, 
          `Network Error: ${error.message}`, 'TaskGeneration');
      }
    }
  }

  async testCreditProcessing() {
    console.log('\n💳 TESTING CREDIT PROCESSING PERFORMANCE');

    // Test credit usage endpoint speed
    try {
      console.log('Testing credit usage API performance...');
      
      const startTime = Date.now();
      const response = await fetch('/api/user/use-credit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-demo': 'true'
        },
        credentials: 'include'
      });
      const duration = Date.now() - startTime;

      if (response.ok) {
        const result = await response.json();
        const isInstant = duration < 500; // Under 500ms is considered instant
        
        this.logTest('Credit API Speed', isInstant,
          `Credit processing completed in ${duration}ms (target: <500ms)`,
          'CreditProcessing', { duration, result });

        this.logTest('Credit Deduction', result.success,
          result.success ? `Credit deducted successfully` : 'Credit deduction failed',
          'CreditProcessing', result);

      } else {
        const error = await response.text();
        this.logTest('Credit Processing', false,
          `Credit API failed: ${response.status} - ${error}`,
          'CreditProcessing');
      }

    } catch (error) {
      this.logTest('Credit Processing', false,
        `Credit API error: ${error.message}`,
        'CreditProcessing');
    }

    // Test multiple rapid credit calls (simulating user clicking multiple times)
    console.log('\nTesting rapid credit button clicks...');
    
    const rapidTests = [];
    for (let i = 0; i < 3; i++) {
      rapidTests.push(this.testSingleCreditCall(i + 1));
    }

    try {
      const results = await Promise.all(rapidTests);
      const allUnder500ms = results.every(r => r.duration < 500);
      
      this.logTest('Rapid Credit Calls', allUnder500ms,
        `3 rapid calls: ${results.map(r => r.duration + 'ms').join(', ')} (all should be <500ms)`,
        'CreditProcessing', results);

    } catch (error) {
      this.logTest('Rapid Credit Calls', false,
        `Rapid test failed: ${error.message}`,
        'CreditProcessing');
    }
  }

  async testSingleCreditCall(callNumber) {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/user/use-credit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-demo': 'true'
        },
        credentials: 'include'
      });
      
      const duration = Date.now() - startTime;
      const result = response.ok ? await response.json() : { error: response.status };
      
      return { callNumber, duration, success: response.ok, result };
    } catch (error) {
      return { callNumber, duration: Date.now() - startTime, success: false, error: error.message };
    }
  }

  logTest(testName, passed, details, category = 'General', data = null) {
    this.totalTests++;
    if (passed) this.passed++;
    else this.failed++;

    const status = passed ? '✅ PASS' : '❌ FAIL';
    const result = { testName, passed, details, category, data, timestamp: new Date().toISOString() };
    
    if (category === 'TaskGeneration') {
      this.results.taskGeneration.push(result);
    } else if (category === 'CreditProcessing') {
      this.results.creditProcessing.push(result);
    }

    console.log(`${status} ${testName}: ${details}`);
    if (data && !passed) {
      console.log('   Data:', data);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPLETE SYSTEM TEST REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Tests: ${this.totalTests}`);
    console.log(`   ✅ Passed: ${this.passed}`);
    console.log(`   ❌ Failed: ${this.failed}`);
    console.log(`   📊 Success Rate: ${((this.passed / this.totalTests) * 100).toFixed(1)}%`);

    console.log(`\n🔧 TASK GENERATION RESULTS (${this.results.taskGeneration.length} tests):`);
    const taskPassed = this.results.taskGeneration.filter(t => t.passed).length;
    console.log(`   Success Rate: ${((taskPassed / this.results.taskGeneration.length) * 100).toFixed(1)}%`);
    
    // Show task counts for each trade
    this.results.taskGeneration.forEach(test => {
      if (test.data && test.data.taskCount !== undefined) {
        const status = test.passed ? '✅' : '❌';
        console.log(`   ${status} ${test.data.trade}: ${test.data.taskCount} tasks (${test.data.duration}ms)`);
      }
    });

    console.log(`\n💳 CREDIT PROCESSING RESULTS (${this.results.creditProcessing.length} tests):`);
    const creditPassed = this.results.creditProcessing.filter(t => t.passed).length;
    console.log(`   Success Rate: ${((creditPassed / this.results.creditProcessing.length) * 100).toFixed(1)}%`);
    
    // Show performance metrics
    this.results.creditProcessing.forEach(test => {
      if (test.data && test.data.duration !== undefined) {
        const status = test.passed ? '✅' : '❌';
        console.log(`   ${status} ${test.testName}: ${test.data.duration}ms`);
      }
    });

    console.log('\n🎯 CRITICAL FIXES VERIFICATION:');
    const minTasksWorking = this.results.taskGeneration.every(t => 
      !t.data || !t.data.taskCount || t.data.taskCount >= 8
    );
    const creditSpeedWorking = this.results.creditProcessing.every(t => 
      !t.data || !t.data.duration || t.data.duration < 500
    );

    console.log(`   ${minTasksWorking ? '✅' : '❌'} Minimum 8 Tasks: ${minTasksWorking ? 'WORKING' : 'FAILED'}`);
    console.log(`   ${creditSpeedWorking ? '✅' : '❌'} Instant Credits: ${creditSpeedWorking ? 'WORKING' : 'FAILED'}`);

    console.log('\n' + '='.repeat(80));
    
    if (this.passed === this.totalTests) {
      console.log('🎉 ALL TESTS PASSED - SYSTEM READY FOR PRODUCTION! 🎉');
    } else {
      console.log(`⚠️  ${this.failed} TESTS FAILED - REVIEW REQUIRED`);
    }
    
    console.log('='.repeat(80));
  }
}

// Auto-run the test if in browser console
if (typeof window !== 'undefined') {
  console.log('🚀 Starting Complete System Test...');
  const tester = new CompleteSystemTester();
  tester.runCompleteTest().catch(error => {
    console.error('❌ Test suite failed:', error);
  });
}

// Export for manual running
if (typeof module !== 'undefined') {
  module.exports = CompleteSystemTester;
}