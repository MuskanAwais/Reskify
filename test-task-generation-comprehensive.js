/**
 * COMPREHENSIVE TASK GENERATION TEST
 * Tests minimum 8+ task generation and duplicate prevention across all trades
 */

async function testTaskGenerationComprehensive() {
  console.log('%cCOMPREHENSIVE TASK GENERATION TEST', 'color: blue; font-size: 16px; font-weight: bold');
  
  const testTrades = [
    // Complex trades (should generate 10-12 tasks)
    { trade: 'Electrical', expected: 10, description: 'electrical installation work' },
    { trade: 'Plumbing', expected: 10, description: 'plumbing installation and repairs' },
    { trade: 'Fire Protection Systems', expected: 10, description: 'fire sprinkler system installation' },
    { trade: 'Structural Steel', expected: 10, description: 'structural steel fabrication and installation' },
    { trade: 'Concrete', expected: 10, description: 'concrete pouring and finishing' },
    { trade: 'Scaffolding', expected: 10, description: 'scaffolding erection and dismantling' },
    
    // Moderate trades (should generate 9-10 tasks)
    { trade: 'Carpentry', expected: 9, description: 'carpentry and joinery work' },
    { trade: 'Tiling', expected: 9, description: 'tiling a bathroom' },
    { trade: 'Flooring', expected: 9, description: 'flooring installation' },
    { trade: 'Plastering', expected: 9, description: 'wall plastering and rendering' },
    
    // Simple trades (should generate 8-9 tasks)
    { trade: 'General', expected: 8, description: 'general construction work' },
    { trade: 'Cleaning', expected: 8, description: 'construction site cleaning' }
  ];
  
  const results = [];
  
  for (const testCase of testTrades) {
    console.log(`\n=== Testing ${testCase.trade} ===`);
    
    try {
      const response = await fetch('/api/generate-swms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          projectDetails: {
            tradeType: testCase.trade,
            location: 'Sydney, NSW',
            state: 'NSW',
            siteEnvironment: 'Commercial',
            hrcwCategories: ['Category 15: Working at height']
          },
          plainTextDescription: testCase.description
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.activities) {
        const taskCount = data.activities.length;
        const taskNames = data.activities.map(a => a.name);
        const uniqueTaskNames = [...new Set(taskNames)];
        const duplicateCount = taskNames.length - uniqueTaskNames.length;
        
        // Test minimum task count
        const meetMinimum = taskCount >= testCase.expected;
        const noDuplicates = duplicateCount === 0;
        
        results.push({
          trade: testCase.trade,
          expected: testCase.expected,
          actual: taskCount,
          duplicates: duplicateCount,
          meetMinimum,
          noDuplicates,
          status: meetMinimum && noDuplicates ? 'PASS' : 'FAIL'
        });
        
        console.log(`%c${testCase.trade}: ${taskCount} tasks (expected: ${testCase.expected}+)`, 
          meetMinimum ? 'color: green' : 'color: red');
        console.log(`%cDuplicates: ${duplicateCount}`, 
          noDuplicates ? 'color: green' : 'color: red');
        
        if (duplicateCount > 0) {
          console.log('Duplicate task names:', taskNames.filter((name, index) => 
            taskNames.indexOf(name) !== index));
        }
        
        // Show first few task names for verification
        console.log('Generated tasks:', taskNames.slice(0, 5).map(name => `"${name}"`).join(', '));
        
      } else {
        console.log(`%cERROR: ${data.error || 'Failed to generate tasks'}`, 'color: red');
        results.push({
          trade: testCase.trade,
          expected: testCase.expected,
          actual: 0,
          duplicates: 0,
          meetMinimum: false,
          noDuplicates: false,
          status: 'ERROR'
        });
      }
    } catch (error) {
      console.log(`%cERROR: ${error.message}`, 'color: red');
      results.push({
        trade: testCase.trade,
        expected: testCase.expected,
        actual: 0,
        duplicates: 0,
        meetMinimum: false,
        noDuplicates: false,
        status: 'ERROR'
      });
    }
    
    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('TASK GENERATION TEST SUMMARY');
  console.log('='.repeat(60));
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const errorTests = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`Total Trades Tested: ${totalTests}`);
  console.log(`%cPassed: ${passedTests}`, 'color: green; font-weight: bold');
  console.log(`%cFailed: ${failedTests}`, 'color: red; font-weight: bold');
  console.log(`%cErrors: ${errorTests}`, 'color: orange; font-weight: bold');
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`%cSuccess Rate: ${successRate}%`, 'color: blue; font-weight: bold');
  
  // Detailed results
  console.log('\nDetailed Results:');
  results.forEach((result, index) => {
    const color = result.status === 'PASS' ? 'green' : result.status === 'FAIL' ? 'red' : 'orange';
    console.log(`%c${index + 1}. [${result.status}] ${result.trade}`, `color: ${color}; font-weight: bold`);
    console.log(`   Expected: ${result.expected}+, Actual: ${result.actual}, Duplicates: ${result.duplicates}`);
  });
  
  // Critical issues report
  const criticalIssues = results.filter(r => !r.meetMinimum || !r.noDuplicates);
  if (criticalIssues.length > 0) {
    console.log('\n%cCRITICAL ISSUES DETECTED:', 'color: red; font-size: 14px; font-weight: bold');
    criticalIssues.forEach(issue => {
      if (!issue.meetMinimum) {
        console.log(`%c❌ ${issue.trade}: Generated only ${issue.actual} tasks (minimum ${issue.expected} required)`, 'color: red');
      }
      if (!issue.noDuplicates) {
        console.log(`%c❌ ${issue.trade}: Found ${issue.duplicates} duplicate tasks`, 'color: red');
      }
    });
  } else {
    console.log('\n%c✅ ALL TRADES GENERATE MINIMUM REQUIRED TASKS WITH NO DUPLICATES', 'color: green; font-size: 14px; font-weight: bold');
  }
  
  return results;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.testTaskGenerationComprehensive = testTaskGenerationComprehensive;
  console.log('Task Generation Test loaded. Run with: testTaskGenerationComprehensive()');
}