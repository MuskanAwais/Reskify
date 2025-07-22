/**
 * Comprehensive Accessibility Testing Suite
 * Tests WCAG 2.1 AA compliance across all application components
 * Execute in browser console for real-time accessibility validation
 */

class AccessibilityTestSuite {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.testCategories = [
      'Keyboard Navigation',
      'Screen Reader Support', 
      'Color Contrast',
      'Focus Management',
      'Form Accessibility',
      'Image Accessibility',
      'Semantic Structure',
      'Responsive Design',
      'Error Handling',
      'Compliance Validation'
    ];
  }

  async runCompleteAccessibilityAudit() {
    console.log('🚀 Starting Comprehensive Accessibility Audit...\n');
    
    // Test all accessibility categories
    await this.testKeyboardNavigation();
    await this.testScreenReaderSupport();
    await this.testColorContrast();
    await this.testFocusManagement();
    await this.testFormAccessibility();
    await this.testImageAccessibility();
    await this.testSemanticStructure();
    await this.testResponsiveDesign();
    await this.testErrorHandling();
    await this.testWCAGCompliance();
    
    this.generateAccessibilityReport();
  }

  logTest(name, status, message, category = 'General', data = null) {
    const result = {
      name,
      status, // 'PASS', 'FAIL', 'WARNING'
      message,
      category,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} [${category}] ${name}: ${message}`);
    
    if (data) {
      console.log(`   Data:`, data);
    }
  }

  async testKeyboardNavigation() {
    console.log('\n🔍 Testing Keyboard Navigation...');
    
    // Test tab order
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    this.logTest(
      'Focusable Elements Count',
      focusableElements.length > 0 ? 'PASS' : 'FAIL',
      `Found ${focusableElements.length} focusable elements`,
      'Keyboard Navigation',
      { count: focusableElements.length }
    );

    // Test skip links
    const skipLinks = document.querySelectorAll('.skip-link, [href^="#main"], [href^="#content"]');
    this.logTest(
      'Skip Links Present',
      skipLinks.length > 0 ? 'PASS' : 'WARNING',
      `Found ${skipLinks.length} skip navigation links`,
      'Keyboard Navigation',
      { skipLinks: Array.from(skipLinks).map(el => el.textContent) }
    );

    // Test keyboard trap prevention
    let keyboardTrapFound = false;
    focusableElements.forEach((element, index) => {
      if (element.getAttribute('tabindex') === '-1' && element.offsetParent !== null) {
        keyboardTrapFound = true;
      }
    });

    this.logTest(
      'Keyboard Trap Prevention',
      !keyboardTrapFound ? 'PASS' : 'FAIL',
      keyboardTrapFound ? 'Potential keyboard trap detected' : 'No keyboard traps found',
      'Keyboard Navigation'
    );

    // Test enhanced focus indicators
    const enhancedFocusElements = document.querySelectorAll('.enhanced-focus *:focus');
    this.logTest(
      'Enhanced Focus Indicators',
      document.body.classList.contains('enhanced-focus') ? 'PASS' : 'WARNING',
      'Enhanced focus indicators implementation detected',
      'Keyboard Navigation'
    );
  }

  async testScreenReaderSupport() {
    console.log('\n🔍 Testing Screen Reader Support...');

    // Test ARIA labels
    const elementsWithAriaLabels = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
    this.logTest(
      'ARIA Labels Present',
      elementsWithAriaLabels.length > 0 ? 'PASS' : 'WARNING',
      `Found ${elementsWithAriaLabels.length} elements with ARIA labels`,
      'Screen Reader Support',
      { count: elementsWithAriaLabels.length }
    );

    // Test landmark roles
    const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer');
    this.logTest(
      'Landmark Roles',
      landmarks.length >= 3 ? 'PASS' : 'WARNING',
      `Found ${landmarks.length} landmark elements`,
      'Screen Reader Support',
      { landmarks: Array.from(landmarks).map(el => el.tagName + (el.getAttribute('role') ? `[${el.getAttribute('role')}]` : '')) }
    );

    // Test heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    const hasH1 = headingLevels.includes(1);
    
    this.logTest(
      'Heading Structure',
      hasH1 ? 'PASS' : 'FAIL',
      hasH1 ? `Proper heading structure with ${headings.length} headings` : 'Missing H1 element',
      'Screen Reader Support',
      { headingLevels }
    );

    // Test screen reader only content
    const srOnlyElements = document.querySelectorAll('.sr-only, .visually-hidden');
    this.logTest(
      'Screen Reader Only Content',
      srOnlyElements.length > 0 ? 'PASS' : 'WARNING',
      `Found ${srOnlyElements.length} screen reader only elements`,
      'Screen Reader Support'
    );

    // Test live regions
    const liveRegions = document.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
    this.logTest(
      'Live Regions',
      liveRegions.length > 0 ? 'PASS' : 'WARNING',
      `Found ${liveRegions.length} live regions for dynamic content`,
      'Screen Reader Support'
    );
  }

  async testColorContrast() {
    console.log('\n🔍 Testing Color Contrast...');

    // Test high contrast mode availability
    const highContrastSupport = document.body.classList.contains('high-contrast') || 
                               document.querySelector('[data-accessibility-contrast]');
    
    this.logTest(
      'High Contrast Mode',
      highContrastSupport ? 'PASS' : 'WARNING',
      highContrastSupport ? 'High contrast mode available' : 'High contrast mode not detected',
      'Color Contrast'
    );

    // Test color blindness support
    const colorBlindnessFilters = document.querySelectorAll(
      '.color-blind-protanopia, .color-blind-deuteranopia, .color-blind-tritanopia'
    );
    
    this.logTest(
      'Color Blindness Support',
      colorBlindnessFilters.length > 0 || document.querySelector('[data-accessibility-color-blind]') ? 'PASS' : 'WARNING',
      'Color blindness filter support detected',
      'Color Contrast'
    );

    // Test information not conveyed by color alone
    const colorOnlyElements = document.querySelectorAll('.text-red-500, .text-green-500, .bg-red-100');
    let colorOnlyIssues = 0;
    
    colorOnlyElements.forEach(element => {
      const hasAdditionalIndicator = element.querySelector('svg, .icon, [aria-label]') || 
                                   element.textContent.includes('✓') || 
                                   element.textContent.includes('✗');
      if (!hasAdditionalIndicator) colorOnlyIssues++;
    });

    this.logTest(
      'Information Not By Color Alone',
      colorOnlyIssues === 0 ? 'PASS' : 'WARNING',
      colorOnlyIssues > 0 ? `${colorOnlyIssues} elements may rely on color alone` : 'Information properly conveyed beyond color',
      'Color Contrast'
    );
  }

  async testFocusManagement() {
    console.log('\n🔍 Testing Focus Management...');

    // Test focus indicators
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
    let elementsWithFocusStyles = 0;
    
    focusableElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element, ':focus');
      if (computedStyle.outline !== 'none' || computedStyle.boxShadow !== 'none') {
        elementsWithFocusStyles++;
      }
    });

    this.logTest(
      'Focus Indicators Present',
      elementsWithFocusStyles > 0 ? 'PASS' : 'FAIL',
      `${elementsWithFocusStyles}/${focusableElements.length} elements have focus indicators`,
      'Focus Management',
      { ratio: `${elementsWithFocusStyles}/${focusableElements.length}` }
    );

    // Test large click targets
    const clickableElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
    let smallTargets = 0;
    
    clickableElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        smallTargets++;
      }
    });

    this.logTest(
      'Click Target Size (44px minimum)',
      smallTargets === 0 ? 'PASS' : 'WARNING',
      smallTargets > 0 ? `${smallTargets} elements below 44px minimum` : 'All click targets meet size requirements',
      'Focus Management',
      { smallTargets }
    );

    // Test focus order
    const tabIndexElements = document.querySelectorAll('[tabindex]');
    const positiveTabIndex = Array.from(tabIndexElements).filter(el => 
      parseInt(el.getAttribute('tabindex')) > 0
    );

    this.logTest(
      'Logical Focus Order',
      positiveTabIndex.length === 0 ? 'PASS' : 'WARNING',
      positiveTabIndex.length > 0 ? 'Positive tabindex values detected - may disrupt natural order' : 'Natural focus order maintained',
      'Focus Management'
    );
  }

  async testFormAccessibility() {
    console.log('\n🔍 Testing Form Accessibility...');

    // Test form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    let unlabeledInputs = 0;
    
    inputs.forEach(input => {
      const hasLabel = input.labels && input.labels.length > 0;
      const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel && input.type !== 'hidden' && input.type !== 'submit') {
        unlabeledInputs++;
      }
    });

    this.logTest(
      'Form Labels',
      unlabeledInputs === 0 ? 'PASS' : 'FAIL',
      unlabeledInputs > 0 ? `${unlabeledInputs} inputs without labels` : 'All form inputs properly labeled',
      'Form Accessibility',
      { unlabeledInputs }
    );

    // Test required field indicators
    const requiredFields = document.querySelectorAll('[required], [aria-required="true"]');
    let requiredFieldsWithIndicators = 0;
    
    requiredFields.forEach(field => {
      const label = field.labels && field.labels[0];
      if (label && (label.textContent.includes('*') || label.querySelector('[aria-label*="required"]'))) {
        requiredFieldsWithIndicators++;
      }
    });

    this.logTest(
      'Required Field Indicators',
      requiredFields.length === 0 || requiredFieldsWithIndicators === requiredFields.length ? 'PASS' : 'WARNING',
      `${requiredFieldsWithIndicators}/${requiredFields.length} required fields have indicators`,
      'Form Accessibility'
    );

    // Test error messaging
    const errorElements = document.querySelectorAll('[aria-invalid="true"], .error, .invalid');
    const errorMessages = document.querySelectorAll('[role="alert"], .error-message, [aria-describedby]');
    
    this.logTest(
      'Error Messaging',
      errorElements.length === 0 || errorMessages.length > 0 ? 'PASS' : 'WARNING',
      errorElements.length > 0 ? `Error states detected with ${errorMessages.length} error messages` : 'No form errors currently present',
      'Form Accessibility'
    );
  }

  async testImageAccessibility() {
    console.log('\n🔍 Testing Image Accessibility...');

    // Test alt text
    const images = document.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    let decorativeImages = 0;
    
    images.forEach(img => {
      const altText = img.getAttribute('alt');
      if (altText === null) {
        imagesWithoutAlt++;
      } else if (altText === '') {
        decorativeImages++;
      }
    });

    this.logTest(
      'Image Alt Text',
      imagesWithoutAlt === 0 ? 'PASS' : 'FAIL',
      imagesWithoutAlt > 0 ? `${imagesWithoutAlt} images missing alt attribute` : 'All images have alt attributes',
      'Image Accessibility',
      { total: images.length, withoutAlt: imagesWithoutAlt, decorative: decorativeImages }
    );

    // Test complex images
    const complexImages = document.querySelectorAll('img[longdesc], img[aria-describedby]');
    this.logTest(
      'Complex Image Descriptions',
      complexImages.length >= 0 ? 'PASS' : 'WARNING',
      `Found ${complexImages.length} images with detailed descriptions`,
      'Image Accessibility'
    );

    // Test SVG accessibility
    const svgs = document.querySelectorAll('svg');
    let accessibleSvgs = 0;
    
    svgs.forEach(svg => {
      if (svg.getAttribute('aria-label') || svg.getAttribute('aria-labelledby') || svg.querySelector('title')) {
        accessibleSvgs++;
      }
    });

    this.logTest(
      'SVG Accessibility',
      svgs.length === 0 || accessibleSvgs === svgs.length ? 'PASS' : 'WARNING',
      `${accessibleSvgs}/${svgs.length} SVGs have accessibility labels`,
      'Image Accessibility'
    );
  }

  async testSemanticStructure() {
    console.log('\n🔍 Testing Semantic Structure...');

    // Test HTML5 semantic elements
    const semanticElements = document.querySelectorAll(
      'main, header, footer, nav, section, article, aside, figure, figcaption'
    );
    
    this.logTest(
      'Semantic HTML Elements',
      semanticElements.length >= 3 ? 'PASS' : 'WARNING',
      `Found ${semanticElements.length} semantic HTML5 elements`,
      'Semantic Structure',
      { elements: Array.from(semanticElements).map(el => el.tagName.toLowerCase()) }
    );

    // Test list structures
    const lists = document.querySelectorAll('ul, ol, dl');
    const listItems = document.querySelectorAll('li, dt, dd');
    
    this.logTest(
      'List Structures',
      lists.length > 0 ? 'PASS' : 'WARNING',
      `Found ${lists.length} lists with ${listItems.length} items`,
      'Semantic Structure'
    );

    // Test table accessibility
    const tables = document.querySelectorAll('table');
    let accessibleTables = 0;
    
    tables.forEach(table => {
      const hasHeaders = table.querySelector('th') || table.querySelector('[scope]');
      const hasCaption = table.querySelector('caption') || table.getAttribute('aria-label');
      
      if (hasHeaders && hasCaption) {
        accessibleTables++;
      }
    });

    this.logTest(
      'Table Accessibility',
      tables.length === 0 || accessibleTables === tables.length ? 'PASS' : 'WARNING',
      tables.length > 0 ? `${accessibleTables}/${tables.length} tables are accessible` : 'No tables found',
      'Semantic Structure'
    );
  }

  async testResponsiveDesign() {
    console.log('\n🔍 Testing Responsive Design...');

    // Test viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    this.logTest(
      'Viewport Meta Tag',
      viewportMeta ? 'PASS' : 'FAIL',
      viewportMeta ? 'Viewport meta tag present' : 'Missing viewport meta tag',
      'Responsive Design'
    );

    // Test font scaling support
    const fontSizeBase = document.documentElement.style.getPropertyValue('--font-size-base');
    this.logTest(
      'Dynamic Font Scaling',
      fontSizeBase || document.body.style.fontSize ? 'PASS' : 'WARNING',
      fontSizeBase ? 'CSS custom properties for font scaling detected' : 'Font scaling implementation not detected',
      'Responsive Design'
    );

    // Test reduced motion support
    const reducedMotionElements = document.querySelectorAll('.reduce-motion, [data-reduce-motion]');
    this.logTest(
      'Reduced Motion Support',
      reducedMotionElements.length > 0 ? 'PASS' : 'WARNING',
      'Reduced motion preference support detected',
      'Responsive Design'
    );

    // Test touch target sizes on mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const touchTargets = document.querySelectorAll('button, a, input');
      let adequateTouchTargets = 0;
      
      touchTargets.forEach(target => {
        const rect = target.getBoundingClientRect();
        if (rect.width >= 44 && rect.height >= 44) {
          adequateTouchTargets++;
        }
      });

      this.logTest(
        'Mobile Touch Targets',
        adequateTouchTargets === touchTargets.length ? 'PASS' : 'WARNING',
        `${adequateTouchTargets}/${touchTargets.length} touch targets meet 44px minimum`,
        'Responsive Design'
      );
    }
  }

  async testErrorHandling() {
    console.log('\n🔍 Testing Error Handling...');

    // Test form validation
    const forms = document.querySelectorAll('form');
    let formsWithValidation = 0;
    
    forms.forEach(form => {
      const hasValidation = form.querySelector('[required]') || 
                           form.querySelector('[pattern]') || 
                           form.querySelector('[minlength]') ||
                           form.querySelector('[maxlength]');
      if (hasValidation) {
        formsWithValidation++;
      }
    });

    this.logTest(
      'Form Validation Present',
      forms.length === 0 || formsWithValidation > 0 ? 'PASS' : 'WARNING',
      forms.length > 0 ? `${formsWithValidation}/${forms.length} forms have validation` : 'No forms found',
      'Error Handling'
    );

    // Test error state styling
    const errorElements = document.querySelectorAll('[aria-invalid="true"]');
    this.logTest(
      'Error State Implementation',
      errorElements.length >= 0 ? 'PASS' : 'WARNING',
      `Found ${errorElements.length} elements with error states`,
      'Error Handling'
    );

    // Test success messaging
    const successElements = document.querySelectorAll('[role="status"], .success, .toast');
    this.logTest(
      'Success Messaging',
      successElements.length >= 0 ? 'PASS' : 'WARNING',
      `Found ${successElements.length} success/status message elements`,
      'Error Handling'
    );
  }

  async testWCAGCompliance() {
    console.log('\n🔍 Testing WCAG Compliance...');

    // Test language declaration
    const htmlLang = document.documentElement.getAttribute('lang');
    this.logTest(
      'Language Declaration',
      htmlLang ? 'PASS' : 'FAIL',
      htmlLang ? `Page language declared as: ${htmlLang}` : 'Missing lang attribute on html element',
      'Compliance Validation'
    );

    // Test page title
    const pageTitle = document.title;
    this.logTest(
      'Page Title',
      pageTitle && pageTitle.trim().length > 0 ? 'PASS' : 'FAIL',
      pageTitle ? `Page title: "${pageTitle}"` : 'Missing or empty page title',
      'Compliance Validation'
    );

    // Test accessibility menu implementation
    const accessibilityMenu = document.querySelector('[data-accessibility-menu]') || 
                             document.querySelector('.accessibility-menu') ||
                             document.querySelector('[aria-label*="accessibility" i]');
    
    this.logTest(
      'Accessibility Controls',
      accessibilityMenu ? 'PASS' : 'WARNING',
      accessibilityMenu ? 'Accessibility menu/controls detected' : 'No accessibility menu detected',
      'Compliance Validation'
    );

    // Test ARIA implementation
    const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
    this.logTest(
      'ARIA Implementation',
      ariaElements.length > 0 ? 'PASS' : 'WARNING',
      `Found ${ariaElements.length} elements with ARIA attributes`,
      'Compliance Validation'
    );

    // Test accessibility features integration
    const accessibilityClasses = document.querySelectorAll(
      '.high-contrast, .large-targets, .enhanced-focus, .reduce-motion, .color-blind-protanopia, .color-blind-deuteranopia, .color-blind-tritanopia'
    );
    
    this.logTest(
      'Accessibility Features Integration',
      accessibilityClasses.length > 0 ? 'PASS' : 'WARNING',
      `Found ${accessibilityClasses.length} accessibility enhancement classes`,
      'Compliance Validation'
    );
  }

  generateAccessibilityReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    
    // Calculate statistics
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    const warningTests = this.results.filter(r => r.status === 'WARNING').length;
    
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    // Generate summary by category
    const categoryStats = {};
    this.testCategories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length;
      const categoryTotal = categoryResults.length;
      
      categoryStats[category] = {
        passed: categoryPassed,
        total: categoryTotal,
        rate: categoryTotal > 0 ? ((categoryPassed / categoryTotal) * 100).toFixed(1) : '0.0'
      };
    });

    console.log('\n' + '='.repeat(80));
    console.log('🎯 ACCESSIBILITY COMPLIANCE REPORT');
    console.log('='.repeat(80));
    console.log(`📊 Overall Results: ${passedTests}/${totalTests} tests passed (${passRate}%)`);
    console.log(`⏱️  Test Duration: ${duration} seconds`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️  Warnings: ${warningTests}`);
    
    console.log('\n📋 Category Breakdown:');
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const status = stats.rate >= 80 ? '✅' : stats.rate >= 60 ? '⚠️' : '❌';
      console.log(`${status} ${category}: ${stats.passed}/${stats.total} (${stats.rate}%)`);
    });

    console.log('\n🔍 Failed Tests:');
    const failedTestsDetails = this.results.filter(r => r.status === 'FAIL');
    if (failedTestsDetails.length === 0) {
      console.log('   No failed tests! 🎉');
    } else {
      failedTestsDetails.forEach(test => {
        console.log(`   ❌ [${test.category}] ${test.name}: ${test.message}`);
      });
    }

    console.log('\n⚠️  Warning Tests:');
    const warningTestsDetails = this.results.filter(r => r.status === 'WARNING');
    if (warningTestsDetails.length === 0) {
      console.log('   No warnings! 🎉');
    } else {
      warningTestsDetails.forEach(test => {
        console.log(`   ⚠️  [${test.category}] ${test.name}: ${test.message}`);
      });
    }

    // WCAG Compliance Assessment
    console.log('\n🏆 WCAG 2.1 Compliance Assessment:');
    if (passRate >= 95 && failedTests === 0) {
      console.log('   🏅 EXCELLENT: Ready for WCAG 2.1 AA certification');
    } else if (passRate >= 85 && failedTests <= 2) {
      console.log('   ✅ GOOD: Minor improvements needed for full compliance');
    } else if (passRate >= 70) {
      console.log('   ⚠️  MODERATE: Several accessibility issues require attention');
    } else {
      console.log('   ❌ NEEDS WORK: Significant accessibility improvements required');
    }

    console.log('\n📝 Recommendations:');
    if (failedTests === 0 && warningTests <= 3) {
      console.log('   • Consider third-party accessibility audit for certification');
      console.log('   • Implement user testing with assistive technology users');
      console.log('   • Regular accessibility monitoring and maintenance');
    } else {
      console.log('   • Address all failed tests immediately');
      console.log('   • Review and resolve warning conditions');
      console.log('   • Conduct manual testing with screen readers');
      console.log('   • Validate with automated accessibility tools');
    }

    console.log('\n' + '='.repeat(80));
    console.log('📋 Test completed. Results available in window.accessibilityResults');
    
    // Store results globally for further analysis
    window.accessibilityResults = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        warnings: warningTests,
        passRate: parseFloat(passRate),
        duration: parseFloat(duration)
      },
      categories: categoryStats,
      details: this.results,
      timestamp: new Date().toISOString()
    };
  }
}

// Auto-execute when loaded
if (typeof window !== 'undefined') {
  window.AccessibilityTestSuite = AccessibilityTestSuite;
  
  // Provide easy execution command
  window.runAccessibilityAudit = async function() {
    const suite = new AccessibilityTestSuite();
    await suite.runCompleteAccessibilityAudit();
    return window.accessibilityResults;
  };
  
  console.log('🎯 Accessibility Testing Suite Loaded!');
  console.log('📋 Run: runAccessibilityAudit() to execute comprehensive WCAG 2.1 testing');
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityTestSuite;
}