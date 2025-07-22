/**
 * Test SWMSprint API Connection
 * Run this to test if the SWMSprint API is accessible
 */

const SWMSPRINT_URL = 'https://79937ff1-cac5-4736-b2b2-1df5354fb4b3-00-1bbtav2oqagxg.spock.replit.dev';

async function testSWMSprintConnection() {
  console.log('Testing SWMSprint API connection...');
  console.log('URL:', SWMSPRINT_URL);
  
  try {
    // Test 1: Basic connectivity
    console.log('\n1. Testing basic connectivity...');
    const response = await fetch(SWMSPRINT_URL);
    console.log('Basic connectivity status:', response.status);
    console.log('Basic connectivity OK:', response.ok);
    
    // Test 2: Health endpoint
    console.log('\n2. Testing health endpoint...');
    const healthResponse = await fetch(`${SWMSPRINT_URL}/api/health`);
    console.log('Health endpoint status:', healthResponse.status);
    console.log('Health endpoint OK:', healthResponse.ok);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('Health response:', healthData);
    }
    
    // Test 3: PDF generation endpoint availability
    console.log('\n3. Testing PDF generation endpoint...');
    const pdfResponse = await fetch(`${SWMSPRINT_URL}/api/swms/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobName: 'Test Job',
        projectName: 'Test Project'
      })
    });
    
    console.log('PDF endpoint status:', pdfResponse.status);
    console.log('PDF endpoint OK:', pdfResponse.ok);
    
    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.log('PDF endpoint error:', errorText);
    }
    
    console.log('\n✅ Connection test completed');
    
  } catch (error) {
    console.error('❌ Connection test failed:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Check if it's a network issue
    if (error.message.includes('Load failed') || error.message.includes('Network')) {
      console.log('\n🔍 This appears to be a network connectivity issue.');
      console.log('Possible causes:');
      console.log('- SWMSprint app is not running');
      console.log('- URL is incorrect');
      console.log('- Network/firewall blocking the connection');
      console.log('- App is sleeping (Replit apps sleep after inactivity)');
    }
  }
}

// Run the test
testSWMSprintConnection();