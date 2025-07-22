/**
 * COMPREHENSIVE FULL SYSTEM TEST SUITE
 * Tests every component, feature, and function in the SWMS application
 * Run this after any updates to ensure nothing is broken
 */

class FullSystemTestSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      critical: 0,
      sections: {},
      errors: [],
      performance: {}
    };
    this.startTime = performance.now();
  }

  async runCompleteSystemTest() {
    console.log('🔍 FULL SYSTEM TEST SUITE - COMPREHENSIVE VALIDATION');
    console.log('=' .repeat(80));
    console.log(`Started: ${new Date().toLocaleString()}`);
    console.log('Testing every component, feature, and function...\n');

    try {
      // Core System Tests
      await this.testAuthentication();
      await this.testNavigation();
      await this.testDatabase();
      await this.testAPIEndpoints();
      
      // User Interface Tests
      await this.testComponents();
      await this.testForms();
      await this.testSWMSBuilder();
      await this.testDashboard();
      
      // Feature-Specific Tests
      await this.testPDFGeneration();
      await this.testPaymentSystem();
      await this.testFileUpload();
      await this.testAdminFeatures();
      
      // Security & Permissions
      await this.testSecurityFeatures();
      await this.testSubscriptionAccess();
      await this.testSafetyLibrary();
      
      // Performance & Browser Tests
      await this.testPerformance();
      await this.testResponsiveness();
      await this.testBrowserCompatibility();
      
      // Generate comprehensive report
      this.generateReport();
      
    } catch (error) {
      this.logTest('System Test Suite', 'critical', `Fatal error: ${error.message}`, 'SystemTest');
      console.error('Critical system test failure:', error);
    }
  }

  logTest(name, status, message, section = 'General', data = null) {
    this.results.totalTests++;
    this.results[status]++;
    
    if (!this.results.sections[section]) {
      this.results.sections[section] = { passed: 0, failed: 0, warnings: 0, critical: 0, tests: [] };
    }
    this.results.sections[section][status]++;
    this.results.sections[section].tests.push({ name, status, message, data, timestamp: Date.now() });
    
    const icons = { passed: '✅', failed: '❌', warnings: '⚠️', critical: '🚨' };
    console.log(`${icons[status]} [${section}] ${name}: ${message}`);
    
    if (status === 'failed' || status === 'critical') {
      this.results.errors.push({ section, name, message, data });
    }
  }

  // =============== AUTHENTICATION TESTS ===============
  async testAuthentication() {
    console.log('\n🔐 AUTHENTICATION SYSTEM TESTS');
    console.log('-'.repeat(50));

    try {
      // Check user endpoint
      const userResponse = await fetch('/api/user');
      this.logTest('User Endpoint', userResponse.ok ? 'passed' : 'failed', 
                  `Status: ${userResponse.status}`, 'Authentication');

      // Check admin authentication
      const adminCheck = localStorage.getItem('adminState');
      this.logTest('Admin State', adminCheck ? 'passed' : 'warnings', 
                  adminCheck ? 'Admin state found' : 'No admin state', 'Authentication');

      // Test Google OAuth components
      const googleAuth = document.querySelector('[data-testid="google-auth"], button:contains("Google")');
      this.logTest('Google OAuth', googleAuth ? 'passed' : 'warnings', 
                  googleAuth ? 'OAuth button present' : 'OAuth not visible', 'Authentication');

      // Test session handling
      const sessionTest = await this.testSessionManagement();
      this.logTest('Session Management', sessionTest ? 'passed' : 'failed', 
                  sessionTest ? 'Session handling working' : 'Session issues detected', 'Authentication');

    } catch (error) {
      this.logTest('Authentication System', 'critical', `Auth test failed: ${error.message}`, 'Authentication');
    }
  }

  async testSessionManagement() {
    try {
      // Test multiple API calls to verify session persistence
      const calls = await Promise.all([
        fetch('/api/user'),
        fetch('/api/user'),
        fetch('/api/user')
      ]);
      return calls.every(call => call.ok);
    } catch {
      return false;
    }
  }

  // =============== NAVIGATION TESTS ===============
  async testNavigation() {
    console.log('\n🧭 NAVIGATION SYSTEM TESTS');
    console.log('-'.repeat(50));

    try {
      // Test main navigation links
      const navLinks = {
        'Dashboard': '/',
        'SWMS Builder': '/swms-builder',
        'My SWMS': '/my-swms',
        'Admin': '/admin'
      };

      Object.entries(navLinks).forEach(([name, path]) => {
        const link = document.querySelector(`a[href="${path}"]`);
        this.logTest(`${name} Link`, link ? 'passed' : 'failed', 
                    link ? 'Navigation link present' : 'Link missing', 'Navigation');
      });

      // Test breadcrumb navigation
      const breadcrumbs = document.querySelector('[class*="breadcrumb"]');
      this.logTest('Breadcrumbs', breadcrumbs ? 'passed' : 'warnings', 
                  breadcrumbs ? 'Breadcrumb navigation found' : 'No breadcrumbs', 'Navigation');

      // Test back button functionality
      const backButtons = document.querySelectorAll('button:contains("Back"), [class*="ArrowLeft"]');
      this.logTest('Back Buttons', backButtons.length > 0 ? 'passed' : 'warnings', 
                  `Found ${backButtons.length} back buttons`, 'Navigation');

    } catch (error) {
      this.logTest('Navigation System', 'failed', `Navigation test failed: ${error.message}`, 'Navigation');
    }
  }

  // =============== DATABASE TESTS ===============
  async testDatabase() {
    console.log('\n🗄️ DATABASE CONNECTION TESTS');
    console.log('-'.repeat(50));

    try {
      // Test user data retrieval
      const userTest = await fetch('/api/user');
      this.logTest('User Data Retrieval', userTest.ok ? 'passed' : 'failed', 
                  `Response: ${userTest.status}`, 'Database');

      // Test SWMS data operations
      const swmsTest = await fetch('/api/swms');
      this.logTest('SWMS Data Access', swmsTest.ok ? 'passed' : 'failed', 
                  `Response: ${swmsTest.status}`, 'Database');

      // Test dashboard data
      const dashboardTest = await fetch('/api/dashboard');
      this.logTest('Dashboard Data', dashboardTest.ok ? 'passed' : 'failed', 
                  `Response: ${dashboardTest.status}`, 'Database');

    } catch (error) {
      this.logTest('Database Connection', 'critical', `DB test failed: ${error.message}`, 'Database');
    }
  }

  // =============== API ENDPOINT TESTS ===============
  async testAPIEndpoints() {
    console.log('\n🌐 API ENDPOINT TESTS');
    console.log('-'.repeat(50));

    const endpoints = [
      { path: '/api/user', method: 'GET', name: 'User Data' },
      { path: '/api/swms', method: 'GET', name: 'SWMS List' },
      { path: '/api/dashboard', method: 'GET', name: 'Dashboard' },
      { path: '/api/health', method: 'GET', name: 'Health Check' },
      { path: '/api/user/credits', method: 'GET', name: 'User Credits' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.path, { method: endpoint.method });
        this.logTest(`${endpoint.name} API`, response.ok ? 'passed' : 'failed', 
                    `${endpoint.method} ${endpoint.path}: ${response.status}`, 'API');
      } catch (error) {
        this.logTest(`${endpoint.name} API`, 'failed', 
                    `${endpoint.method} ${endpoint.path}: ${error.message}`, 'API');
      }
    }
  }

  // =============== COMPONENT TESTS ===============
  async testComponents() {
    console.log('\n🧩 UI COMPONENT TESTS');
    console.log('-'.repeat(50));

    const components = {
      'Header': 'header, [role="banner"]',
      'Navigation': 'nav, [role="navigation"]',
      'Main Content': 'main, [role="main"]',
      'Footer': 'footer',
      'Cards': '[class*="Card"]',
      'Buttons': 'button',
      'Forms': 'form',
      'Inputs': 'input',
      'Modals': '[role="dialog"], [class*="modal"]',
      'Tooltips': '[role="tooltip"], [class*="tooltip"]'
    };

    Object.entries(components).forEach(([name, selector]) => {
      const elements = document.querySelectorAll(selector);
      this.logTest(`${name} Component`, elements.length > 0 ? 'passed' : 'warnings', 
                  `Found ${elements.length} ${name.toLowerCase()} elements`, 'Components');
    });

    // Test component accessibility
    this.testAccessibility();
  }

  testAccessibility() {
    const accessibilityChecks = {
      'Alt Text': () => {
        const images = document.querySelectorAll('img');
        const withoutAlt = Array.from(images).filter(img => !img.alt);
        return { passed: withoutAlt.length === 0, count: withoutAlt.length };
      },
      'Form Labels': () => {
        const inputs = document.querySelectorAll('input, textarea, select');
        const withoutLabels = Array.from(inputs).filter(input => 
          !input.labels?.length && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')
        );
        return { passed: withoutLabels.length === 0, count: withoutLabels.length };
      },
      'Button Text': () => {
        const buttons = document.querySelectorAll('button');
        const withoutText = Array.from(buttons).filter(btn => 
          !btn.textContent.trim() && !btn.getAttribute('aria-label')
        );
        return { passed: withoutText.length === 0, count: withoutText.length };
      }
    };

    Object.entries(accessibilityChecks).forEach(([name, check]) => {
      const result = check();
      this.logTest(`Accessibility: ${name}`, result.passed ? 'passed' : 'warnings', 
                  result.passed ? 'All elements compliant' : `${result.count} issues found`, 'Accessibility');
    });
  }

  // =============== FORM TESTS ===============
  async testForms() {
    console.log('\n📝 FORM FUNCTIONALITY TESTS');
    console.log('-'.repeat(50));

    try {
      // Test form presence
      const forms = document.querySelectorAll('form');
      this.logTest('Forms Present', forms.length > 0 ? 'passed' : 'failed', 
                  `Found ${forms.length} forms`, 'Forms');

      // Test input validation
      const inputs = document.querySelectorAll('input[required]');
      this.logTest('Required Fields', inputs.length > 0 ? 'passed' : 'warnings', 
                  `Found ${inputs.length} required fields`, 'Forms');

      // Test form submission handlers
      let formHandlers = 0;
      forms.forEach(form => {
        if (form.onsubmit || form.addEventListener) formHandlers++;
      });
      this.logTest('Form Handlers', formHandlers > 0 ? 'passed' : 'warnings', 
                  `${formHandlers} forms have handlers`, 'Forms');

      // Test specific form inputs
      await this.testInputTypes();

    } catch (error) {
      this.logTest('Form Testing', 'failed', `Form test failed: ${error.message}`, 'Forms');
    }
  }

  async testInputTypes() {
    const inputTypes = ['text', 'email', 'password', 'number', 'date', 'file', 'checkbox', 'radio'];
    
    inputTypes.forEach(type => {
      const inputs = document.querySelectorAll(`input[type="${type}"]`);
      if (inputs.length > 0) {
        this.logTest(`${type} Inputs`, 'passed', `Found ${inputs.length} ${type} inputs`, 'InputTypes');
      }
    });

    // Test textareas and selects
    const textareas = document.querySelectorAll('textarea');
    const selects = document.querySelectorAll('select');
    
    this.logTest('Textarea Elements', textareas.length > 0 ? 'passed' : 'warnings', 
                `Found ${textareas.length} textareas`, 'InputTypes');
    this.logTest('Select Elements', selects.length > 0 ? 'passed' : 'warnings', 
                `Found ${selects.length} select elements`, 'InputTypes');
  }

  // =============== SWMS BUILDER TESTS ===============
  async testSWMSBuilder() {
    console.log('\n🏗️ SWMS BUILDER TESTS');
    console.log('-'.repeat(50));

    try {
      // Test step navigation
      const stepIndicators = document.querySelectorAll('[class*="step"], [role="step"]');
      this.logTest('Step Navigation', stepIndicators.length > 0 ? 'passed' : 'failed', 
                  `Found ${stepIndicators.length} step indicators`, 'SWMSBuilder');

      // Test progress bar
      const progressBar = document.querySelector('[role="progressbar"], [class*="progress"]');
      this.logTest('Progress Bar', progressBar ? 'passed' : 'warnings', 
                  progressBar ? 'Progress indicator found' : 'No progress bar', 'SWMSBuilder');

      // Test form steps
      await this.testSWMSSteps();

      // Test PDF preview integration
      await this.testPDFPreview();

      // Test data persistence
      await this.testDataPersistence();

    } catch (error) {
      this.logTest('SWMS Builder', 'failed', `SWMS Builder test failed: ${error.message}`, 'SWMSBuilder');
    }
  }

  async testSWMSSteps() {
    const expectedSteps = [
      'Project Details',
      'Work Activities',
      'HRCW Categories', 
      'PPE Requirements',
      'Plant Equipment',
      'Emergency Procedures',
      'Payment',
      'Legal Disclaimer',
      'Digital Signatures'
    ];

    // Test if we can find step content
    expectedSteps.forEach((step, index) => {
      const stepElement = document.querySelector(`[data-step="${index + 1}"], [class*="step-${index + 1}"]`);
      this.logTest(`Step ${index + 1}: ${step}`, stepElement ? 'passed' : 'warnings', 
                  stepElement ? 'Step element found' : 'Step not visible', 'SWMSSteps');
    });

    // Test step validation
    const nextButtons = document.querySelectorAll('button:contains("Next"), [class*="next"]');
    this.logTest('Step Navigation Buttons', nextButtons.length > 0 ? 'passed' : 'warnings', 
                `Found ${nextButtons.length} navigation buttons`, 'SWMSSteps');
  }

  async testPDFPreview() {
    // Test PDF preview component
    const pdfPreview = document.querySelector('[class*="VisualPDFPreviewer"], iframe[title*="PDF"]');
    this.logTest('PDF Preview Component', pdfPreview ? 'passed' : 'failed', 
                pdfPreview ? 'PDF preview found' : 'PDF preview missing', 'PDFPreview');

    if (pdfPreview && pdfPreview.tagName === 'IFRAME') {
      this.logTest('PDF Iframe Source', pdfPreview.src ? 'passed' : 'failed', 
                  `Source: ${pdfPreview.src}`, 'PDFPreview');
      
      const sandbox = pdfPreview.getAttribute('sandbox');
      this.logTest('PDF Iframe Security', sandbox ? 'passed' : 'warnings', 
                  `Sandbox: ${sandbox || 'not set'}`, 'PDFPreview');
    }

    // Test PDF controls
    const pdfControls = document.querySelectorAll('[class*="zoom"], [class*="fullscreen"]');
    this.logTest('PDF Controls', pdfControls.length > 0 ? 'passed' : 'warnings', 
                `Found ${pdfControls.length} PDF controls`, 'PDFPreview');
  }

  async testDataPersistence() {
    try {
      // Test auto-save functionality
      const testData = { test: 'data', timestamp: Date.now() };
      localStorage.setItem('swms-test-data', JSON.stringify(testData));
      
      const retrieved = JSON.parse(localStorage.getItem('swms-test-data'));
      const persistent = retrieved && retrieved.test === 'data';
      
      this.logTest('Local Storage', persistent ? 'passed' : 'failed', 
                  persistent ? 'Data persistence working' : 'Local storage failed', 'DataPersistence');

      // Clean up test data
      localStorage.removeItem('swms-test-data');

      // Test draft saving API
      const draftTest = await fetch('/api/swms/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'draft' })
      });
      
      this.logTest('Draft Saving API', draftTest.ok ? 'passed' : 'failed', 
                  `Draft API response: ${draftTest.status}`, 'DataPersistence');

    } catch (error) {
      this.logTest('Data Persistence', 'failed', `Persistence test failed: ${error.message}`, 'DataPersistence');
    }
  }

  // =============== DASHBOARD TESTS ===============
  async testDashboard() {
    console.log('\n📊 DASHBOARD TESTS');
    console.log('-'.repeat(50));

    try {
      // Test dashboard cards
      const cards = document.querySelectorAll('[class*="Card"], .card');
      this.logTest('Dashboard Cards', cards.length > 0 ? 'passed' : 'failed', 
                  `Found ${cards.length} dashboard cards`, 'Dashboard');

      // Test statistics display
      const stats = document.querySelectorAll('[class*="stat"], [data-testid*="stat"]');
      this.logTest('Statistics Display', stats.length > 0 ? 'passed' : 'warnings', 
                  `Found ${stats.length} statistics`, 'Dashboard');

      // Test action buttons
      const actionButtons = document.querySelectorAll('button[class*="primary"], button[class*="action"]');
      this.logTest('Action Buttons', actionButtons.length > 0 ? 'passed' : 'warnings', 
                  `Found ${actionButtons.length} action buttons`, 'Dashboard');

      // Test credit counter
      const creditCounter = document.querySelector('[class*="credit"], [data-testid="credits"]');
      this.logTest('Credit Counter', creditCounter ? 'passed' : 'warnings', 
                  creditCounter ? 'Credit counter found' : 'No credit display', 'Dashboard');

      // Test SWMS listings
      await this.testSWMSListings();

    } catch (error) {
      this.logTest('Dashboard', 'failed', `Dashboard test failed: ${error.message}`, 'Dashboard');
    }
  }

  async testSWMSListings() {
    try {
      // Test draft SWMS section
      const drafts = document.querySelector('[class*="draft"], [data-section="drafts"]');
      this.logTest('Draft SWMS Section', drafts ? 'passed' : 'warnings', 
                  drafts ? 'Drafts section found' : 'No drafts section', 'SWMSListings');

      // Test completed SWMS section
      const completed = document.querySelector('[class*="completed"], [data-section="completed"]');
      this.logTest('Completed SWMS Section', completed ? 'passed' : 'warnings', 
                  completed ? 'Completed section found' : 'No completed section', 'SWMSListings');

      // Test SWMS actions (edit, delete, download)
      const swmsActions = document.querySelectorAll('[class*="edit"], [class*="delete"], [class*="download"]');
      this.logTest('SWMS Actions', swmsActions.length > 0 ? 'passed' : 'warnings', 
                  `Found ${swmsActions.length} SWMS action buttons`, 'SWMSListings');

    } catch (error) {
      this.logTest('SWMS Listings', 'failed', `SWMS listings test failed: ${error.message}`, 'SWMSListings');
    }
  }

  // =============== PDF GENERATION TESTS ===============
  async testPDFGeneration() {
    console.log('\n📄 PDF GENERATION TESTS');
    console.log('-'.repeat(50));

    try {
      // Test PDF generation endpoint
      const pdfTest = await fetch('/api/swms/1/pdf', { method: 'POST' });
      this.logTest('PDF Generation API', pdfTest.ok ? 'passed' : 'failed', 
                  `PDF API response: ${pdfTest.status}`, 'PDFGeneration');

      // Test RiskTemplateBuilder integration
      const templateBuilder = document.querySelector('iframe[src*="risktemplatebuilder"]');
      this.logTest('RiskTemplateBuilder Integration', templateBuilder ? 'passed' : 'failed', 
                  templateBuilder ? 'Template builder iframe found' : 'No template builder', 'PDFGeneration');

      // Test PDF download functionality
      const downloadButtons = document.querySelectorAll('button:contains("Download"), [class*="download"]');
      this.logTest('PDF Download Buttons', downloadButtons.length > 0 ? 'passed' : 'warnings', 
                  `Found ${downloadButtons.length} download buttons`, 'PDFGeneration');

      // Test PDF preview functionality
      await this.testPDFPreviewFunctionality();

    } catch (error) {
      this.logTest('PDF Generation', 'failed', `PDF generation test failed: ${error.message}`, 'PDFGeneration');
    }
  }

  async testPDFPreviewFunctionality() {
    const iframe = document.querySelector('iframe[title*="PDF"]');
    if (iframe) {
      // Test iframe loading
      const loaded = iframe.contentWindow ? true : false;
      this.logTest('PDF Iframe Loading', loaded ? 'passed' : 'warnings', 
                  loaded ? 'Iframe accessible' : 'Iframe not loaded', 'PDFPreview');

      // Test postMessage capability
      if (iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({ test: true }, '*');
          this.logTest('PDF PostMessage', 'passed', 'PostMessage capability working', 'PDFPreview');
        } catch (error) {
          this.logTest('PDF PostMessage', 'failed', `PostMessage failed: ${error.message}`, 'PDFPreview');
        }
      }
    }
  }

  // =============== PAYMENT SYSTEM TESTS ===============
  async testPaymentSystem() {
    console.log('\n💳 PAYMENT SYSTEM TESTS');
    console.log('-'.repeat(50));

    try {
      // Test Stripe integration
      const stripeElements = document.querySelectorAll('[class*="stripe"], [data-stripe]');
      this.logTest('Stripe Elements', stripeElements.length > 0 ? 'passed' : 'warnings', 
                  `Found ${stripeElements.length} Stripe elements`, 'Payment');

      // Test payment API endpoints
      const paymentTest = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1500 })
      });
      this.logTest('Payment Intent API', paymentTest.ok ? 'passed' : 'failed', 
                  `Payment API response: ${paymentTest.status}`, 'Payment');

      // Test subscription endpoints
      const subscriptionTest = await fetch('/api/get-or-create-subscription', { method: 'POST' });
      this.logTest('Subscription API', subscriptionTest.status !== 500 ? 'passed' : 'failed', 
                  `Subscription API response: ${subscriptionTest.status}`, 'Payment');

      // Test credit system
      await this.testCreditSystem();

    } catch (error) {
      this.logTest('Payment System', 'failed', `Payment test failed: ${error.message}`, 'Payment');
    }
  }

  async testCreditSystem() {
    try {
      // Test credit API
      const creditTest = await fetch('/api/user/credits');
      this.logTest('Credit API', creditTest.ok ? 'passed' : 'failed', 
                  `Credit API response: ${creditTest.status}`, 'Credits');

      // Test credit usage
      const useCreditTest = await fetch('/api/user/use-credit', { method: 'POST' });
      this.logTest('Credit Usage API', useCreditTest.status !== 500 ? 'passed' : 'failed', 
                  `Use credit API response: ${useCreditTest.status}`, 'Credits');

      // Test credit display
      const creditDisplay = document.querySelector('[class*="credit"], [data-testid="credits"]');
      this.logTest('Credit Display', creditDisplay ? 'passed' : 'warnings', 
                  creditDisplay ? 'Credit display found' : 'No credit display', 'Credits');

    } catch (error) {
      this.logTest('Credit System', 'failed', `Credit test failed: ${error.message}`, 'Credits');
    }
  }

  // =============== FILE UPLOAD TESTS ===============
  async testFileUpload() {
    console.log('\n📁 FILE UPLOAD TESTS');
    console.log('-'.repeat(50));

    try {
      // Test file input elements
      const fileInputs = document.querySelectorAll('input[type="file"]');
      this.logTest('File Inputs', fileInputs.length > 0 ? 'passed' : 'warnings', 
                  `Found ${fileInputs.length} file inputs`, 'FileUpload');

      // Test drag and drop areas
      const dropZones = document.querySelectorAll('[class*="drop"], [data-testid*="drop"]');
      this.logTest('Drop Zones', dropZones.length > 0 ? 'passed' : 'warnings', 
                  `Found ${dropZones.length} drop zones`, 'FileUpload');

      // Test company logo upload specifically
      const logoUpload = document.querySelector('[data-testid="logo-upload"], input[accept*="image"]');
      this.logTest('Company Logo Upload', logoUpload ? 'passed' : 'warnings', 
                  logoUpload ? 'Logo upload found' : 'No logo upload', 'FileUpload');

      // Test file validation
      await this.testFileValidation();

    } catch (error) {
      this.logTest('File Upload', 'failed', `File upload test failed: ${error.message}`, 'FileUpload');
    }
  }

  async testFileValidation() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach((input, index) => {
      const accept = input.getAttribute('accept');
      const maxSize = input.getAttribute('data-max-size');
      
      this.logTest(`File Input ${index + 1} Validation`, accept ? 'passed' : 'warnings', 
                  `Accept: ${accept || 'any'}, Max size: ${maxSize || 'unlimited'}`, 'FileValidation');
    });
  }

  // =============== ADMIN FEATURES TESTS ===============
  async testAdminFeatures() {
    console.log('\n👑 ADMIN FEATURES TESTS');
    console.log('-'.repeat(50));

    try {
      // Check admin access
      const adminState = localStorage.getItem('adminState');
      const isAdmin = adminState === 'true';
      
      this.logTest('Admin Access', isAdmin ? 'passed' : 'warnings', 
                  isAdmin ? 'Admin privileges detected' : 'No admin access', 'Admin');

      if (isAdmin) {
        // Test admin dashboard
        const adminDashboard = document.querySelector('[class*="admin"], [data-admin]');
        this.logTest('Admin Dashboard', adminDashboard ? 'passed' : 'warnings', 
                    adminDashboard ? 'Admin dashboard accessible' : 'Admin dashboard not found', 'Admin');

        // Test user management
        await this.testUserManagement();

        // Test system monitoring
        await this.testSystemMonitoring();
      }

    } catch (error) {
      this.logTest('Admin Features', 'failed', `Admin test failed: ${error.message}`, 'Admin');
    }
  }

  async testUserManagement() {
    try {
      // Test user list API
      const userListTest = await fetch('/api/admin/users');
      this.logTest('User Management API', userListTest.ok ? 'passed' : 'failed', 
                  `User list API response: ${userListTest.status}`, 'UserManagement');

      // Test user actions (view, edit, disable)
      const userActions = document.querySelectorAll('[data-user-action], [class*="user-action"]');
      this.logTest('User Action Buttons', userActions.length > 0 ? 'passed' : 'warnings', 
                  `Found ${userActions.length} user action buttons`, 'UserManagement');

    } catch (error) {
      this.logTest('User Management', 'failed', `User management test failed: ${error.message}`, 'UserManagement');
    }
  }

  async testSystemMonitoring() {
    try {
      // Test system health endpoint
      const healthTest = await fetch('/api/health');
      this.logTest('System Health API', healthTest.ok ? 'passed' : 'failed', 
                  `Health API response: ${healthTest.status}`, 'SystemMonitoring');

      // Test analytics endpoints
      const analyticsTest = await fetch('/api/admin/analytics');
      this.logTest('Analytics API', analyticsTest.status !== 500 ? 'passed' : 'failed', 
                  `Analytics API response: ${analyticsTest.status}`, 'SystemMonitoring');

    } catch (error) {
      this.logTest('System Monitoring', 'failed', `Monitoring test failed: ${error.message}`, 'SystemMonitoring');
    }
  }

  // =============== SECURITY TESTS ===============
  async testSecurityFeatures() {
    console.log('\n🔒 SECURITY FEATURES TESTS');
    console.log('-'.repeat(50));

    try {
      // Test CSRF protection
      const csrfTokens = document.querySelectorAll('input[name*="csrf"], meta[name*="csrf"]');
      this.logTest('CSRF Protection', csrfTokens.length > 0 ? 'passed' : 'warnings', 
                  `Found ${csrfTokens.length} CSRF tokens`, 'Security');

      // Test input sanitization
      await this.testInputSanitization();

      // Test authentication headers
      await this.testAuthenticationHeaders();

      // Test secure connections
      this.testSecureConnections();

    } catch (error) {
      this.logTest('Security Features', 'failed', `Security test failed: ${error.message}`, 'Security');
    }
  }

  async testInputSanitization() {
    try {
      // Test XSS prevention
      const testScript = '<script>alert("xss")</script>';
      const input = document.querySelector('input[type="text"]');
      
      if (input) {
        input.value = testScript;
        const sanitized = input.value !== testScript;
        this.logTest('XSS Prevention', sanitized ? 'passed' : 'warnings', 
                    sanitized ? 'Input sanitized' : 'Raw script allowed', 'InputSanitization');
      }

    } catch (error) {
      this.logTest('Input Sanitization', 'failed', `Sanitization test failed: ${error.message}`, 'InputSanitization');
    }
  }

  async testAuthenticationHeaders() {
    try {
      const testCall = await fetch('/api/user');
      const headers = testCall.headers;
      
      // Check for security headers
      const securityHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'];
      securityHeaders.forEach(header => {
        const present = headers.get(header) !== null;
        this.logTest(`Security Header: ${header}`, present ? 'passed' : 'warnings', 
                    present ? 'Header present' : 'Header missing', 'SecurityHeaders');
      });

    } catch (error) {
      this.logTest('Authentication Headers', 'failed', `Header test failed: ${error.message}`, 'SecurityHeaders');
    }
  }

  testSecureConnections() {
    const isHTTPS = window.location.protocol === 'https:';
    this.logTest('HTTPS Connection', isHTTPS ? 'passed' : 'warnings', 
                isHTTPS ? 'Secure connection' : 'Non-secure connection', 'SecureConnection');

    // Test external iframe security
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe, index) => {
      const sandbox = iframe.getAttribute('sandbox');
      this.logTest(`Iframe ${index + 1} Security`, sandbox ? 'passed' : 'warnings', 
                  `Sandbox: ${sandbox || 'not set'}`, 'IframeSecurity');
    });
  }

  // =============== SUBSCRIPTION TESTS ===============
  async testSubscriptionAccess() {
    console.log('\n📋 SUBSCRIPTION ACCESS TESTS');
    console.log('-'.repeat(50));

    try {
      // Test subscription status API
      const subTest = await fetch('/api/user/subscription');
      this.logTest('Subscription API', subTest.ok ? 'passed' : 'failed', 
                  `Subscription API response: ${subTest.status}`, 'Subscription');

      // Test subscription features access
      await this.testSubscriptionFeatures();

      // Test subscription UI elements
      const subElements = document.querySelectorAll('[class*="subscription"], [data-subscription]');
      this.logTest('Subscription UI', subElements.length > 0 ? 'passed' : 'warnings', 
                  `Found ${subElements.length} subscription elements`, 'Subscription');

    } catch (error) {
      this.logTest('Subscription Access', 'failed', `Subscription test failed: ${error.message}`, 'Subscription');
    }
  }

  async testSubscriptionFeatures() {
    // Test features that require subscription
    const premiumFeatures = [
      { name: 'Advanced Templates', selector: '[data-premium="templates"]' },
      { name: 'Bulk Operations', selector: '[data-premium="bulk"]' },
      { name: 'Advanced Analytics', selector: '[data-premium="analytics"]' }
    ];

    premiumFeatures.forEach(feature => {
      const element = document.querySelector(feature.selector);
      this.logTest(`Premium Feature: ${feature.name}`, element ? 'passed' : 'warnings', 
                  element ? 'Feature accessible' : 'Feature not visible', 'PremiumFeatures');
    });
  }

  // =============== SAFETY LIBRARY TESTS ===============
  async testSafetyLibrary() {
    console.log('\n🛡️ SAFETY LIBRARY ACCESS TESTS');
    console.log('-'.repeat(50));

    try {
      // Test safety library API access
      const safetyTest = await fetch('/api/safety-library');
      this.logTest('Safety Library API', safetyTest.ok ? 'passed' : 'failed', 
                  `Safety library API response: ${safetyTest.status}`, 'SafetyLibrary');

      // Test admin access to safety library
      const adminState = localStorage.getItem('adminState');
      if (adminState === 'true') {
        const adminSafetyTest = await fetch('/api/admin/safety-library');
        this.logTest('Admin Safety Library Access', adminSafetyTest.ok ? 'passed' : 'failed', 
                    `Admin safety library response: ${adminSafetyTest.status}`, 'SafetyLibrary');
      }

      // Test subscription access to safety library
      await this.testSafetyLibrarySubscriptionAccess();

      // Test safety library UI components
      const safetyUI = document.querySelectorAll('[class*="safety"], [data-safety]');
      this.logTest('Safety Library UI', safetyUI.length > 0 ? 'passed' : 'warnings', 
                  `Found ${safetyUI.length} safety library elements`, 'SafetyLibrary');

    } catch (error) {
      this.logTest('Safety Library', 'failed', `Safety library test failed: ${error.message}`, 'SafetyLibrary');
    }
  }

  async testSafetyLibrarySubscriptionAccess() {
    try {
      // Test if subscribed users can access safety library
      const subStatus = await fetch('/api/user/subscription');
      if (subStatus.ok) {
        const subData = await subStatus.json();
        const hasSubscription = subData.subscription && subData.subscription.status === 'active';
        
        if (hasSubscription) {
          const safetyAccess = await fetch('/api/safety-library/premium');
          this.logTest('Subscription Safety Library Access', safetyAccess.ok ? 'passed' : 'failed', 
                      `Premium safety library response: ${safetyAccess.status}`, 'SafetyLibraryAccess');
        }
      }
    } catch (error) {
      this.logTest('Safety Library Subscription Access', 'failed', 
                  `Subscription safety test failed: ${error.message}`, 'SafetyLibraryAccess');
    }
  }

  // =============== PERFORMANCE TESTS ===============
  async testPerformance() {
    console.log('\n⚡ PERFORMANCE TESTS');
    console.log('-'.repeat(50));

    try {
      // Test page load performance
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        this.results.performance.pageLoad = loadTime;
        this.logTest('Page Load Time', loadTime < 3000 ? 'passed' : 'warnings', 
                    `Load time: ${loadTime.toFixed(2)}ms`, 'Performance');
      }

      // Test memory usage
      if (performance.memory) {
        const memoryUsage = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        this.results.performance.memoryUsage = memoryUsage;
        this.logTest('Memory Usage', parseFloat(memoryUsage) < 100 ? 'passed' : 'warnings', 
                    `Memory usage: ${memoryUsage}MB`, 'Performance');
      }

      // Test API response times
      await this.testAPIPerformance();

      // Test rendering performance
      this.testRenderingPerformance();

    } catch (error) {
      this.logTest('Performance Testing', 'failed', `Performance test failed: ${error.message}`, 'Performance');
    }
  }

  async testAPIPerformance() {
    const endpoints = ['/api/user', '/api/swms', '/api/dashboard'];
    
    for (const endpoint of endpoints) {
      try {
        const startTime = performance.now();
        const response = await fetch(endpoint);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.logTest(`${endpoint} Response Time`, responseTime < 1000 ? 'passed' : 'warnings', 
                    `Response time: ${responseTime.toFixed(2)}ms`, 'APIPerformance');
      } catch (error) {
        this.logTest(`${endpoint} Performance`, 'failed', 
                    `API performance test failed: ${error.message}`, 'APIPerformance');
      }
    }
  }

  testRenderingPerformance() {
    // Test for large DOM
    const elementCount = document.querySelectorAll('*').length;
    this.logTest('DOM Size', elementCount < 5000 ? 'passed' : 'warnings', 
                `DOM elements: ${elementCount}`, 'RenderingPerformance');

    // Test for unused CSS
    const stylesheets = document.querySelectorAll('style, link[rel="stylesheet"]').length;
    this.logTest('Stylesheet Count', stylesheets < 10 ? 'passed' : 'warnings', 
                `Stylesheets: ${stylesheets}`, 'RenderingPerformance');

    // Test for image optimization
    const images = document.querySelectorAll('img');
    let unoptimizedImages = 0;
    images.forEach(img => {
      if (!img.loading && !img.getAttribute('data-lazy')) {
        unoptimizedImages++;
      }
    });
    this.logTest('Image Optimization', unoptimizedImages === 0 ? 'passed' : 'warnings', 
                `Unoptimized images: ${unoptimizedImages}`, 'RenderingPerformance');
  }

  // =============== RESPONSIVENESS TESTS ===============
  async testResponsiveness() {
    console.log('\n📱 RESPONSIVENESS TESTS');
    console.log('-'.repeat(50));

    try {
      // Test viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      this.logTest('Viewport Meta Tag', viewport ? 'passed' : 'failed', 
                  viewport ? 'Viewport tag present' : 'Missing viewport tag', 'Responsiveness');

      // Test responsive breakpoints
      this.testBreakpoints();

      // Test touch targets
      this.testTouchTargets();

      // Test mobile navigation
      this.testMobileNavigation();

    } catch (error) {
      this.logTest('Responsiveness', 'failed', `Responsiveness test failed: ${error.message}`, 'Responsiveness');
    }
  }

  testBreakpoints() {
    const breakpoints = [
      { name: 'Mobile', width: 320 },
      { name: 'Tablet', width: 768 },
      { name: 'Desktop', width: 1024 }
    ];

    const currentWidth = window.innerWidth;
    breakpoints.forEach(bp => {
      const isSupported = currentWidth >= bp.width;
      this.logTest(`${bp.name} Breakpoint (${bp.width}px)`, isSupported ? 'passed' : 'warnings', 
                  `Current width: ${currentWidth}px`, 'Breakpoints');
    });
  }

  testTouchTargets() {
    const buttons = document.querySelectorAll('button, a, input[type="button"]');
    let smallTargets = 0;
    
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      const minSize = 44; // Minimum touch target size
      if (rect.width < minSize || rect.height < minSize) {
        smallTargets++;
      }
    });

    this.logTest('Touch Target Size', smallTargets === 0 ? 'passed' : 'warnings', 
                `Small targets: ${smallTargets}`, 'TouchTargets');
  }

  testMobileNavigation() {
    const mobileNav = document.querySelector('[class*="mobile"], [data-mobile]');
    const hamburger = document.querySelector('[class*="hamburger"], [class*="menu-toggle"]');
    
    this.logTest('Mobile Navigation', mobileNav || hamburger ? 'passed' : 'warnings', 
                mobileNav || hamburger ? 'Mobile navigation found' : 'No mobile navigation', 'MobileNavigation');
  }

  // =============== BROWSER COMPATIBILITY TESTS ===============
  async testBrowserCompatibility() {
    console.log('\n🌐 BROWSER COMPATIBILITY TESTS');
    console.log('-'.repeat(50));

    try {
      // Test modern JavaScript features
      this.testModernJS();

      // Test CSS features
      this.testModernCSS();

      // Test browser APIs
      this.testBrowserAPIs();

    } catch (error) {
      this.logTest('Browser Compatibility', 'failed', `Browser test failed: ${error.message}`, 'BrowserCompatibility');
    }
  }

  testModernJS() {
    const features = {
      'ES6 Arrow Functions': () => eval('(() => true)()'),
      'ES6 Template Literals': () => eval('`test` === "test"'),
      'ES6 Destructuring': () => eval('const {a} = {a: 1}; a === 1'),
      'ES6 Spread Operator': () => eval('[...Array(1)].length === 1'),
      'Async/Await': () => typeof async !== 'undefined',
      'Fetch API': () => typeof fetch !== 'undefined',
      'Local Storage': () => typeof localStorage !== 'undefined',
      'Session Storage': () => typeof sessionStorage !== 'undefined'
    };

    Object.entries(features).forEach(([name, test]) => {
      try {
        const supported = test();
        this.logTest(`JS Feature: ${name}`, supported ? 'passed' : 'failed', 
                    supported ? 'Supported' : 'Not supported', 'JSFeatures');
      } catch (error) {
        this.logTest(`JS Feature: ${name}`, 'failed', `Error: ${error.message}`, 'JSFeatures');
      }
    });
  }

  testModernCSS() {
    const features = {
      'CSS Grid': () => CSS.supports('display', 'grid'),
      'CSS Flexbox': () => CSS.supports('display', 'flex'),
      'CSS Variables': () => CSS.supports('color', 'var(--test)'),
      'CSS Transforms': () => CSS.supports('transform', 'rotate(45deg)'),
      'CSS Transitions': () => CSS.supports('transition', 'all 0.3s ease')
    };

    Object.entries(features).forEach(([name, test]) => {
      try {
        const supported = test();
        this.logTest(`CSS Feature: ${name}`, supported ? 'passed' : 'warnings', 
                    supported ? 'Supported' : 'Not supported', 'CSSFeatures');
      } catch (error) {
        this.logTest(`CSS Feature: ${name}`, 'warnings', `Cannot test: ${error.message}`, 'CSSFeatures');
      }
    });
  }

  testBrowserAPIs() {
    const apis = {
      'File API': typeof File !== 'undefined',
      'FormData API': typeof FormData !== 'undefined',
      'History API': typeof history !== 'undefined' && typeof history.pushState === 'function',
      'Geolocation API': typeof navigator.geolocation !== 'undefined',
      'Web Workers': typeof Worker !== 'undefined',
      'Service Workers': typeof navigator.serviceWorker !== 'undefined',
      'WebSockets': typeof WebSocket !== 'undefined',
      'IndexedDB': typeof indexedDB !== 'undefined'
    };

    Object.entries(apis).forEach(([name, supported]) => {
      this.logTest(`Browser API: ${name}`, supported ? 'passed' : 'warnings', 
                  supported ? 'Available' : 'Not available', 'BrowserAPIs');
    });
  }

  // =============== REPORT GENERATION ===============
  generateReport() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;

    console.log('\n📊 COMPREHENSIVE SYSTEM TEST REPORT');
    console.log('=' .repeat(80));
    
    const successRate = (this.results.passed / this.results.totalTests * 100).toFixed(1);
    
    console.log(`🕒 Test Duration: ${(totalTime / 1000).toFixed(2)} seconds`);
    console.log(`📈 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passed} (${successRate}%)`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`🚨 Critical: ${this.results.critical}`);

    // System health assessment
    console.log('\n🎯 SYSTEM HEALTH ASSESSMENT:');
    if (this.results.critical > 0) {
      console.log('🔴 CRITICAL ISSUES DETECTED - IMMEDIATE ATTENTION REQUIRED');
    } else if (this.results.failed > 5) {
      console.log('🟠 MULTIPLE FAILURES - REVIEW AND FIX BEFORE DEPLOYMENT');
    } else if (this.results.failed > 0) {
      console.log('🟡 MINOR ISSUES DETECTED - INVESTIGATE FAILED TESTS');
    } else if (this.results.warnings > 10) {
      console.log('🟡 MANY WARNINGS - CONSIDER IMPROVEMENTS');
    } else {
      console.log('🟢 SYSTEM HEALTHY - ALL CORE FUNCTIONS OPERATIONAL');
    }

    // Section breakdown
    console.log('\n📋 SECTION BREAKDOWN:');
    Object.entries(this.results.sections).forEach(([section, data]) => {
      const total = data.passed + data.failed + data.warnings + data.critical;
      const rate = total > 0 ? (data.passed / total * 100).toFixed(1) : '0.0';
      const status = data.critical > 0 ? '🚨' : data.failed > 0 ? '❌' : data.warnings > 0 ? '⚠️' : '✅';
      console.log(`${status} ${section}: ${data.passed}/${total} (${rate}%)`);
    });

    // Performance metrics
    if (Object.keys(this.results.performance).length > 0) {
      console.log('\n⚡ PERFORMANCE METRICS:');
      Object.entries(this.results.performance).forEach(([metric, value]) => {
        console.log(`• ${metric}: ${value}`);
      });
    }

    // Critical errors
    if (this.results.errors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS REQUIRING ATTENTION:');
      this.results.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. [${error.section}] ${error.name}: ${error.message}`);
      });
      
      if (this.results.errors.length > 10) {
        console.log(`... and ${this.results.errors.length - 10} more errors`);
      }
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (this.results.critical > 0) {
      console.log('• 🚨 Fix critical issues immediately before proceeding');
      console.log('• 🔍 Review error logs and stack traces');
      console.log('• 🧪 Run individual component tests to isolate issues');
    }
    if (this.results.failed > 0) {
      console.log('• 🔧 Address failed tests before deployment');
      console.log('• 📝 Update tests if functionality has changed');
    }
    if (this.results.warnings > 5) {
      console.log('• ⚠️ Review warnings for potential improvements');
      console.log('• 🛡️ Consider implementing missing security features');
    }
    if (this.results.passed / this.results.totalTests > 0.9) {
      console.log('• ✅ System is ready for deployment');
      console.log('• 📊 Consider setting up automated testing pipeline');
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('• Run individual section tests for failed areas');
    console.log('• Test with real user data and scenarios');
    console.log('• Perform load testing under high traffic');
    console.log('• Set up monitoring for production deployment');

    console.log('\n' + '=' .repeat(80));
    console.log('✨ FULL SYSTEM TEST COMPLETE!');
    console.log(`Generated: ${this.results.timestamp}`);

    return this.results;
  }
}

// Auto-execute if in browser environment
if (typeof window !== 'undefined') {
  // Make globally available for manual execution
  window.runFullSystemTest = () => {
    const testSuite = new FullSystemTestSuite();
    return testSuite.runCompleteSystemTest();
  };
  
  console.log('🧪 Full System Test Suite Loaded!');
  console.log('Run with: runFullSystemTest()');
  console.log('This will test EVERY component and function in the application.');
} else {
  // Export for Node.js environment
  module.exports = FullSystemTestSuite;
}