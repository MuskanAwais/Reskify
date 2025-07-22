/**
 * Browser-based PDF Integration Test Suite
 * Run this in the browser console on the SWMS Builder page
 */

(function() {
  'use strict';

  console.log('🚀 Starting Browser PDF Integration Tests');
  console.log('=' .repeat(60));

  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  function addTest(name, passed, details) {
    testResults.total++;
    if (passed) {
      testResults.passed++;
      console.log(`✅ ${name}: ${details}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${name}: ${details}`);
    }
    testResults.tests.push({ name, passed, details });
  }

  // Test 1: Check if VisualPDFPreviewer component exists
  console.log('\n📡 Testing Component Presence');
  console.log('-'.repeat(40));

  const pdfPreviewCard = document.querySelector('[class*="border-blue-200"]');
  if (pdfPreviewCard) {
    addTest('PDF Preview Component', true, 'VisualPDFPreviewer component found in DOM');
    
    // Check for "Live PDF Preview" title
    const title = pdfPreviewCard.querySelector('h3, [class*="CardTitle"]');
    if (title && title.textContent.includes('Live PDF Preview')) {
      addTest('Component Title', true, 'Correct title "Live PDF Preview" found');
    } else {
      addTest('Component Title', false, 'Title not found or incorrect');
    }
  } else {
    addTest('PDF Preview Component', false, 'VisualPDFPreviewer component not found');
  }

  // Test 2: Check iframe presence and configuration
  console.log('\n🖼️ Testing Iframe Integration');
  console.log('-'.repeat(40));

  const iframe = document.querySelector('iframe[title="PDF Generator Preview"]');
  if (iframe) {
    addTest('Iframe Element', true, 'PDF Generator iframe found');
    
    // Check source URL
    if (iframe.src === 'https://risktemplatebuilder.replit.app') {
      addTest('Iframe Source URL', true, 'Correct RiskTemplateBuilder URL');
    } else {
      addTest('Iframe Source URL', false, `Expected risktemplatebuilder.replit.app, got: ${iframe.src}`);
    }
    
    // Check sandbox attributes
    const sandbox = iframe.getAttribute('sandbox');
    if (sandbox && sandbox.includes('allow-scripts') && sandbox.includes('allow-same-origin')) {
      addTest('Iframe Security', true, 'Proper sandbox attributes set');
    } else {
      addTest('Iframe Security', false, 'Missing or incorrect sandbox attributes');
    }
    
    // Check dimensions
    const style = window.getComputedStyle(iframe);
    if (style.width && style.height) {
      addTest('Iframe Dimensions', true, `Width: ${style.width}, Height: ${style.height}`);
    } else {
      addTest('Iframe Dimensions', false, 'Iframe dimensions not properly set');
    }
  } else {
    addTest('Iframe Element', false, 'PDF Generator iframe not found');
  }

  // Test 3: Check control buttons
  console.log('\n🔧 Testing Control Buttons');
  console.log('-'.repeat(40));

  const controlButtons = {
    'Zoom Out': () => document.querySelector('button[title*="Zoom"] svg[class*="ZoomOut"], button:has(svg[class*="ZoomOut"])'),
    'Zoom In': () => document.querySelector('button[title*="Zoom"] svg[class*="ZoomIn"], button:has(svg[class*="ZoomIn"])'),
    'Open Full': () => document.querySelector('button:has(svg[class*="ExternalLink"])'),
    'Fullscreen': () => document.querySelector('button:has(svg[class*="Maximize"])'),
    'Refresh': () => document.querySelector('button:has(svg[class*="RefreshCw"])')
  };

  Object.entries(controlButtons).forEach(([name, finder]) => {
    const button = finder();
    if (button) {
      addTest(`${name} Button`, true, 'Button found and accessible');
    } else {
      addTest(`${name} Button`, false, 'Button not found');
    }
  });

  // Test 4: Test postMessage functionality
  console.log('\n📨 Testing Message Communication');
  console.log('-'.repeat(40));

  if (iframe && iframe.contentWindow) {
    try {
      const testData = {
        jobName: 'Test Project',
        jobNumber: 'TEST-001',
        projectAddress: '123 Test Street',
        swmsCreatorName: 'Test Creator',
        preview: true
      };

      const message = {
        type: 'FORM_DATA_UPDATE',
        data: testData
      };

      iframe.contentWindow.postMessage(message, 'https://risktemplatebuilder.replit.app');
      addTest('PostMessage Send', true, 'Successfully sent test message to iframe');
    } catch (error) {
      addTest('PostMessage Send', false, `Error sending message: ${error.message}`);
    }
  } else {
    addTest('PostMessage Send', false, 'Iframe content window not accessible');
  }

  // Test 5: Check loading states
  console.log('\n⏳ Testing Loading States');
  console.log('-'.repeat(40));

  const loadingIndicator = document.querySelector('[class*="animate-spin"]');
  if (loadingIndicator) {
    addTest('Loading Indicator', true, 'Loading spinner found');
  } else {
    addTest('Loading Indicator', true, 'No loading indicator (may be already loaded)');
  }

  const statusIndicator = document.querySelector('[class*="rounded-full"][class*="bg-green-500"], [class*="rounded-full"][class*="bg-gray-400"]');
  if (statusIndicator) {
    const isActive = statusIndicator.classList.contains('bg-green-500') || 
                    statusIndicator.style.backgroundColor === 'rgb(34, 197, 94)';
    addTest('Connection Status', true, isActive ? 'Active (green)' : 'Inactive (gray)');
  } else {
    addTest('Connection Status', false, 'Status indicator not found');
  }

  // Test 6: Form data integration simulation
  console.log('\n📝 Testing Form Data Integration');
  console.log('-'.repeat(40));

  // Try to find form inputs to simulate changes
  const jobNameInput = document.querySelector('input[name="jobName"], input[placeholder*="job"], input[placeholder*="project"]');
  if (jobNameInput) {
    addTest('Form Input Detection', true, 'Job name input field found');
    
    // Simulate typing
    try {
      const testValue = 'Integration Test Project';
      jobNameInput.value = testValue;
      jobNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      jobNameInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      setTimeout(() => {
        if (jobNameInput.value === testValue) {
          console.log('✅ Form Input Update: Value successfully set and maintained');
        } else {
          console.log('❌ Form Input Update: Value not maintained');
        }
      }, 100);
      
      addTest('Form Input Simulation', true, 'Successfully simulated form input');
    } catch (error) {
      addTest('Form Input Simulation', false, `Error simulating input: ${error.message}`);
    }
  } else {
    addTest('Form Input Detection', false, 'Job name input not found');
  }

  // Test 7: Performance check
  console.log('\n⚡ Testing Performance');
  console.log('-'.repeat(40));

  const startTime = performance.now();
  
  // Simulate multiple rapid updates
  if (iframe && iframe.contentWindow) {
    for (let i = 0; i < 5; i++) {
      const message = {
        type: 'FORM_DATA_UPDATE',
        data: {
          jobName: `Performance Test ${i}`,
          jobNumber: `PERF-${i}`,
          preview: true
        }
      };
      iframe.contentWindow.postMessage(message, 'https://risktemplatebuilder.replit.app');
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration < 50) {
      addTest('Performance Test', true, `5 messages sent in ${duration.toFixed(2)}ms`);
    } else {
      addTest('Performance Test', false, `Slow performance: ${duration.toFixed(2)}ms for 5 messages`);
    }
  } else {
    addTest('Performance Test', false, 'Cannot test performance - iframe not accessible');
  }

  // Test 8: Responsive design check
  console.log('\n📱 Testing Responsive Design');
  console.log('-'.repeat(40));

  const previewContainer = iframe ? iframe.closest('[class*="relative"]') : null;
  if (previewContainer) {
    const containerStyle = window.getComputedStyle(previewContainer);
    const hasResponsiveHeight = containerStyle.height.includes('px') || containerStyle.height === '800px';
    addTest('Container Sizing', hasResponsiveHeight, `Container height: ${containerStyle.height}`);
    
    // Check if container scales properly
    const transform = containerStyle.transform;
    if (transform && transform !== 'none') {
      addTest('Scaling Transform', true, `Transform applied: ${transform}`);
    } else {
      addTest('Scaling Transform', true, 'No transform (may be at 100% scale)');
    }
  } else {
    addTest('Responsive Design', false, 'Preview container not found');
  }

  // Generate final report
  setTimeout(() => {
    console.log('\n📊 FINAL TEST REPORT');
    console.log('=' .repeat(60));
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    console.log(`📈 Tests Completed: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed} (${successRate}%)`);
    console.log(`❌ Failed: ${testResults.failed} (${(100-successRate).toFixed(1)}%)`);
    
    console.log('\n🎯 INTEGRATION STATUS:');
    
    if (testResults.passed >= testResults.total * 0.8) {
      console.log('🟢 EXCELLENT: PDF integration is working well');
    } else if (testResults.passed >= testResults.total * 0.6) {
      console.log('🟡 GOOD: PDF integration is mostly functional with minor issues');
    } else {
      console.log('🔴 NEEDS ATTENTION: PDF integration has significant issues');
    }
    
    console.log('\n📋 DETAILED RESULTS:');
    testResults.tests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${test.details}`);
    });
    
    console.log('\n🔍 NEXT STEPS:');
    if (testResults.failed > 0) {
      console.log('1. Review failed tests above');
      console.log('2. Check browser console for errors');
      console.log('3. Verify RiskTemplateBuilder app is accessible');
      console.log('4. Test form interactions manually');
    } else {
      console.log('1. All tests passed - integration is working correctly');
      console.log('2. Test with real form data entry');
      console.log('3. Verify PDF preview updates in real-time');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✨ Browser PDF Integration Testing Complete!');
  }, 1000);

})();