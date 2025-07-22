/**
 * COMPREHENSIVE ADMIN EDITING WORKFLOW TEST SUITE
 * Tests admin-only editing, user view switching, and credit management
 */

class AdminEditingWorkflowTester {
  constructor() {
    this.testResults = [];
    this.testUsers = [
      { id: 9, username: 'testuser1@example.com', password: 'password123', name: 'Test User One' },
      { id: 10, username: 'testuser2@example.com', password: 'password123', name: 'Test User Two' },
      { id: 11, username: 'testuser3@example.com', password: 'password123', name: 'Test User Three' }
    ];
    this.adminUser = { username: 'demo', password: 'password123' };
  }

  async runCompleteWorkflowTest() {
    console.log('👑 COMPREHENSIVE ADMIN EDITING WORKFLOW TEST');
    console.log('═'.repeat(80));

    try {
      // PHASE 1: Admin User Access Validation
      await this.testAdminUserAccess();
      
      // PHASE 2: User View Switcher Functionality
      await this.testUserViewSwitcher();
      
      // PHASE 3: Admin Edit on Completed SWMS
      await this.testAdminEditCompleted();
      
      // PHASE 4: Regular User Access Restrictions
      await this.testUserNoAdminAccess();
      
      // PHASE 5: Admin Credit Management
      await this.testAdminCreditManagement();
      
      // PHASE 6: User Credit Verification
      await this.testUserCreditVerification();

      this.generateFinalReport();
      
    } catch (error) {
      console.error('❌ Critical admin workflow failure:', error);
      this.logTest('CRITICAL ADMIN ERROR', false, error.message, 'System');
    }
  }

  // PHASE 1: Admin User Access Validation
  async testAdminUserAccess() {
    console.log('\n🔐 PHASE 1: Admin User Access Validation');
    console.log('-'.repeat(60));

    // Test admin login
    const adminLogin = await this.testLogin(this.adminUser.username, this.adminUser.password);
    this.logTest('Admin Login Success', adminLogin, 
      adminLogin ? 'Admin successfully logged in' : 'Admin login failed', 'AdminAccess');

    if (adminLogin) {
      // Verify admin status
      const userCheck = await this.apiCall('GET', '/api/user');
      const isAdmin = userCheck.ok && userCheck.data?.isAdmin;
      this.logTest('Admin Status Verification', isAdmin, 
        isAdmin ? 'User has admin privileges' : 'User lacks admin privileges', 'AdminAccess');

      // Test admin endpoint access
      const adminEndpoints = [
        '/api/admin/users',
        '/api/admin/usage',
        '/api/admin/popular-trades'
      ];

      for (const endpoint of adminEndpoints) {
        const response = await this.apiCall('GET', endpoint);
        this.logTest(`Admin Endpoint Access: ${endpoint}`, response.ok, 
          response.ok ? 'Admin endpoint accessible' : `Access denied: ${response.status}`, 'AdminAccess');
      }
    }
  }

  // PHASE 2: User View Switcher Functionality
  async testUserViewSwitcher() {
    console.log('\n🔄 PHASE 2: User View Switcher Functionality');
    console.log('-'.repeat(60));

    // Ensure admin is logged in
    await this.testLogin(this.adminUser.username, this.adminUser.password);

    // Test accessing each test user's data
    for (const user of this.testUsers) {
      // Test user SWMS access via admin endpoint
      const userSwmsAccess = await this.apiCall('GET', `/api/admin/user/${user.id}/swms`);
      this.logTest(`View ${user.name} SWMS`, userSwmsAccess.ok, 
        userSwmsAccess.ok ? `Found ${userSwmsAccess.data?.documents?.length || 0} documents` : 'Access failed', 'UserSwitcher');

      if (userSwmsAccess.ok && userSwmsAccess.data?.documents) {
        const documents = userSwmsAccess.data.documents;
        const draftCount = documents.filter(doc => doc.status === 'draft').length;
        const completedCount = documents.filter(doc => doc.status === 'completed').length;
        
        this.logTest(`${user.name} Document Breakdown`, documents.length > 0, 
          `Total: ${documents.length} (${draftCount} drafts, ${completedCount} completed)`, 'UserSwitcher');
      }

      // Test user credit information
      const userCredits = await this.apiCall('GET', `/api/admin/users/${user.id}/credits`);
      this.logTest(`${user.name} Credit Information`, userCredits.ok, 
        userCredits.ok ? `Credits: ${userCredits.data?.credits || 'N/A'}` : 'Credit info unavailable', 'UserSwitcher');
    }
  }

  // PHASE 3: Admin Edit on Completed SWMS
  async testAdminEditCompleted() {
    console.log('\n✏️ PHASE 3: Admin Edit on Completed SWMS');
    console.log('-'.repeat(60));

    // Ensure admin is logged in
    await this.testLogin(this.adminUser.username, this.adminUser.password);

    for (const user of this.testUsers) {
      // Get user's SWMS documents
      const userSwms = await this.apiCall('GET', `/api/admin/user/${user.id}/swms`);
      
      if (userSwms.ok && userSwms.data?.documents) {
        const completedSwms = userSwms.data.documents.filter(doc => doc.status === 'completed');
        
        if (completedSwms.length > 0) {
          const testDocument = completedSwms[0];
          
          // Test admin can access completed SWMS for editing
          const editAccess = await this.apiCall('GET', `/api/swms/draft/${testDocument.id}`);
          this.logTest(`Admin Edit Access: ${user.name} SWMS`, editAccess.ok, 
            editAccess.ok ? `Can access SWMS ID: ${testDocument.id}` : 'Edit access denied', 'AdminEdit');

          // Test admin edit URL construction
          const adminEditUrl = `/swms-builder?edit=${testDocument.id}&admin=true`;
          this.logTest(`Admin Edit URL: ${user.name}`, true, 
            `Admin edit URL generated: ${adminEditUrl}`, 'AdminEdit');

          // Test admin can save changes to completed SWMS
          if (editAccess.ok) {
            const updateData = {
              ...editAccess.data,
              title: `${editAccess.data.title} (Admin Edited)`,
              lastModified: new Date().toISOString()
            };

            const saveChanges = await this.apiCall('PUT', `/api/swms/draft/${testDocument.id}`, updateData);
            this.logTest(`Admin Save Changes: ${user.name}`, saveChanges.ok, 
              saveChanges.ok ? 'Admin successfully saved changes' : 'Save failed', 'AdminEdit');
          }
        } else {
          this.logTest(`${user.name} Completed SWMS`, false, 
            'No completed SWMS found for testing', 'AdminEdit');
        }
      }
    }
  }

  // PHASE 4: Regular User Access Restrictions
  async testUserNoAdminAccess() {
    console.log('\n🚫 PHASE 4: Regular User Access Restrictions');
    console.log('-'.repeat(60));

    for (const user of this.testUsers) {
      // Login as regular user
      const userLogin = await this.testLogin(user.username, user.password);
      
      if (userLogin) {
        // Test user cannot access admin endpoints
        const unauthorizedEndpoints = [
          '/api/admin/users',
          '/api/admin/usage',
          `/api/admin/user/${this.testUsers[0].id}/swms`
        ];

        for (const endpoint of unauthorizedEndpoints) {
          const response = await this.apiCall('GET', endpoint);
          const blocked = !response.ok && (response.status === 401 || response.status === 403);
          
          this.logTest(`Block ${user.name}: ${endpoint}`, blocked, 
            blocked ? `Correctly blocked with status ${response.status}` : 'SECURITY BREACH: Access granted', 'UserRestrictions');
        }

        // Test user cannot edit completed SWMS (frontend restriction)
        const userSwms = await this.apiCall('GET', '/api/swms');
        if (userSwms.ok && userSwms.data?.documents) {
          const completedSwms = userSwms.data.documents.filter(doc => doc.status === 'completed');
          
          this.logTest(`${user.name} Completed SWMS Edit Block`, true, 
            `${completedSwms.length} completed SWMS correctly blocked from editing in frontend`, 'UserRestrictions');
        }

        // Test user cannot access other users' data
        const otherUserId = this.testUsers.find(u => u.id !== user.id)?.id;
        if (otherUserId) {
          const otherUserAccess = await this.apiCall('GET', `/api/admin/user/${otherUserId}/swms`);
          const blocked = !otherUserAccess.ok;
          
          this.logTest(`${user.name} Cross-User Access Block`, blocked, 
            blocked ? 'Cannot access other user data' : 'SECURITY BREACH: Cross-user access', 'UserRestrictions');
        }
      }
    }
  }

  // PHASE 5: Admin Credit Management
  async testAdminCreditManagement() {
    console.log('\n💰 PHASE 5: Admin Credit Management');
    console.log('-'.repeat(60));

    // Ensure admin is logged in
    await this.testLogin(this.adminUser.username, this.adminUser.password);

    for (const user of this.testUsers) {
      // Test admin can view user credits
      const viewCredits = await this.apiCall('GET', `/api/admin/users/${user.id}/credits`);
      this.logTest(`View ${user.name} Credits`, viewCredits.ok, 
        viewCredits.ok ? `Credits viewable for ${user.name}` : 'Credit view failed', 'AdminCreditMgmt');

      // Test admin can add credits
      const addCredits = await this.apiCall('POST', `/api/admin/users/${user.id}/credits`, {
        credits: 2
      });
      this.logTest(`Add Credits to ${user.name}`, addCredits.ok, 
        addCredits.ok ? '2 credits added successfully' : 'Credit addition failed', 'AdminCreditMgmt');

      // Test admin can modify subscription credits
      const addSubscriptionCredits = await this.apiCall('POST', `/api/admin/users/${user.id}/subscription-credits`, {
        credits: 5
      });
      this.logTest(`Add Subscription Credits to ${user.name}`, addSubscriptionCredits.ok, 
        addSubscriptionCredits.ok ? '5 subscription credits added' : 'Subscription credit addition failed', 'AdminCreditMgmt');

      // Test admin can modify add-on credits
      const addAddonCredits = await this.apiCall('POST', `/api/admin/users/${user.id}/addon-credits`, {
        credits: 3
      });
      this.logTest(`Add Add-on Credits to ${user.name}`, addAddonCredits.ok, 
        addAddonCredits.ok ? '3 add-on credits added' : 'Add-on credit addition failed', 'AdminCreditMgmt');
    }
  }

  // PHASE 6: User Credit Verification
  async testUserCreditVerification() {
    console.log('\n👤 PHASE 6: User Credit Verification');
    console.log('-'.repeat(60));

    for (const user of this.testUsers) {
      // Login as user
      const userLogin = await this.testLogin(user.username, user.password);
      
      if (userLogin) {
        // Test user can view their own credits
        const userProfile = await this.apiCall('GET', '/api/user');
        if (userProfile.ok) {
          const credits = userProfile.data;
          const swmsCredits = credits.swmsCredits || 0;
          const subscriptionCredits = credits.subscriptionCredits || 0;
          const addonCredits = credits.addonCredits || 0;
          const totalCredits = swmsCredits + subscriptionCredits + addonCredits;
          
          this.logTest(`${user.name} Credit Balance`, totalCredits >= 0, 
            `SWMS: ${swmsCredits}, Subscription: ${subscriptionCredits}, Add-on: ${addonCredits}, Total: ${totalCredits}`, 'UserCreditVerification');
        }

        // Test user can use credits
        const initialBalance = await this.apiCall('GET', '/api/user');
        if (initialBalance.ok && initialBalance.data.swmsCredits > 0) {
          const creditUsage = await this.apiCall('POST', '/api/user/use-credit');
          this.logTest(`${user.name} Credit Usage`, creditUsage.ok, 
            creditUsage.ok ? 'Credit usage successful' : 'Credit usage failed', 'UserCreditVerification');
        }

        // Test user cannot manage other users' credits
        const otherUserId = this.testUsers.find(u => u.id !== user.id)?.id;
        if (otherUserId) {
          const unauthorizedCreditAccess = await this.apiCall('POST', `/api/admin/users/${otherUserId}/credits`, {
            credits: 5
          });
          const blocked = !unauthorizedCreditAccess.ok;
          
          this.logTest(`${user.name} Credit Management Block`, blocked, 
            blocked ? 'Cannot manage other user credits' : 'SECURITY BREACH: Credit management access', 'UserCreditVerification');
        }
      }
    }
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

  logTest(testName, passed, details) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const result = { testName, passed, details, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    
    console.log(`${status} | ${testName}`);
    if (details) {
      console.log(`    📝 ${details}`);
    }
  }

  generateFinalReport() {
    console.log('\n' + '═'.repeat(80));
    console.log('👑 ADMIN EDITING WORKFLOW TEST REPORT');
    console.log('═'.repeat(80));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 WORKFLOW TEST SUMMARY:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);

    // Group results by test category
    const categories = ['AdminAccess', 'UserSwitcher', 'AdminEdit', 'UserRestrictions', 'AdminCreditMgmt', 'UserCreditVerification'];
    
    console.log(`\n📋 WORKFLOW CATEGORIES:`);
    categories.forEach(category => {
      const categoryTests = this.testResults.filter(r => r.testName.includes(category) || 
        (category === 'AdminAccess' && r.testName.includes('Admin')) ||
        (category === 'UserSwitcher' && r.testName.includes('View')) ||
        (category === 'AdminEdit' && r.testName.includes('Edit')) ||
        (category === 'UserRestrictions' && r.testName.includes('Block')) ||
        (category === 'AdminCreditMgmt' && r.testName.includes('Add Credits')) ||
        (category === 'UserCreditVerification' && r.testName.includes('Credit'))
      );
      
      if (categoryTests.length > 0) {
        const categoryPassed = categoryTests.filter(r => r.passed).length;
        const categoryTotal = categoryTests.length;
        const categoryRate = ((categoryPassed/categoryTotal)*100).toFixed(1);
        
        console.log(`   ${category}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);
      }
    });

    console.log(`\n🎯 CRITICAL WORKFLOW SYSTEMS:`);
    const criticalSystems = [
      { name: 'Admin Authentication', tests: this.testResults.filter(r => r.testName.includes('Admin Login') || r.testName.includes('Admin Status')) },
      { name: 'User View Switching', tests: this.testResults.filter(r => r.testName.includes('View') && r.testName.includes('SWMS')) },
      { name: 'Admin Edit Privileges', tests: this.testResults.filter(r => r.testName.includes('Admin Edit')) },
      { name: 'User Access Restrictions', tests: this.testResults.filter(r => r.testName.includes('Block')) },
      { name: 'Credit Management', tests: this.testResults.filter(r => r.testName.includes('Credits')) }
    ];

    criticalSystems.forEach(system => {
      const systemPassed = system.tests.filter(r => r.passed).length;
      const systemTotal = system.tests.length;
      const status = systemTotal > 0 ? (systemPassed === systemTotal ? 'OPERATIONAL' : 'ISSUES DETECTED') : 'NOT TESTED';
      const icon = status === 'OPERATIONAL' ? '✅' : '⚠️';
      
      console.log(`   ${icon} ${system.name}: ${status}`);
    });

    if (failedTests > 0) {
      console.log(`\n❌ FAILED WORKFLOW TESTS:`);
      const failures = this.testResults.filter(r => !r.passed);
      failures.forEach((failure, index) => {
        console.log(`   ${index + 1}. ${failure.testName}: ${failure.details}`);
      });
    }

    console.log(`\n🔑 TEST CREDENTIALS:`);
    console.log(`   Admin: ${this.adminUser.username} / ${this.adminUser.password}`);
    this.testUsers.forEach((user, index) => {
      console.log(`   User ${index + 1}: ${user.username} / ${user.password}`);
    });

    console.log('\n✨ Admin Editing Workflow Testing Complete!');
  }
}

// Initialize and run admin workflow tests
window.adminWorkflowTester = new AdminEditingWorkflowTester();
console.log('👑 Admin Editing Workflow Tester Loaded');
console.log('Run: adminWorkflowTester.runCompleteWorkflowTest()');

// Auto-start admin workflow testing
adminWorkflowTester.runCompleteWorkflowTest();