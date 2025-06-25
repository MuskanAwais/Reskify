import fs from 'fs';

async function testRiskTemplateConnection() {
  console.log('Testing RiskTemplateBuilder Connection...');
  
  const testData = {
    projectName: 'Connection Test Project',
    jobNumber: 'TEST-001',
    projectAddress: '123 Test Street, Melbourne VIC',
    swmsCreatorName: 'Test User',
    swmsCreatorPosition: 'Site Manager',
    principalContractor: 'Test Construction',
    projectManager: 'Test Manager',
    siteSupervisor: 'Test Supervisor',
    startDate: '2025-01-15',
    tradeType: 'Commercial Fitout',
    
    activities: [
      {
        activity: 'Installing partition walls',
        hazards: ['Manual handling', 'Cuts from tools'],
        initialRisk: 'Medium',
        controlMeasures: ['Use proper lifting techniques', 'Wear cut-resistant gloves'],
        residualRisk: 'Low',
        legislation: 'WHS Act 2011'
      }
    ],
    
    plantEquipment: [
      {
        equipment: 'Cordless Drill',
        riskLevel: 'Low',
        nextInspection: '2025-02-15',
        certificationRequired: 'Not Required'
      }
    ],
    
    emergencyProcedures: [
      {
        procedure: 'Emergency Contact',
        details: 'Call 000 for emergencies'
      }
    ],
    
    ppeRequirements: ['Safety helmet', 'Safety glasses'],
    hrcwCategories: [1]
  };
  
  try {
    // Test 1: Check if RiskTemplateBuilder is accessible
    console.log('1. Testing RiskTemplateBuilder accessibility...');
    const healthResponse = await fetch('https://risktemplatebuilder.replit.app/api/health', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (healthResponse.ok) {
      console.log('✅ RiskTemplateBuilder is accessible');
    } else {
      console.log('❌ RiskTemplateBuilder health check failed:', healthResponse.status);
    }
    
    // Test 2: Try PDF generation endpoint
    console.log('2. Testing PDF generation endpoint...');
    const pdfResponse = await fetch('https://risktemplatebuilder.replit.app/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      },
      body: JSON.stringify(testData)
    });
    
    if (pdfResponse.ok) {
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const filename = `risk_template_test_${Date.now()}.pdf`;
      fs.writeFileSync(filename, Buffer.from(pdfBuffer));
      console.log(`✅ PDF generated successfully: ${filename} (${pdfBuffer.byteLength} bytes)`);
      return true;
    } else {
      console.log('❌ PDF generation failed:', pdfResponse.status, pdfResponse.statusText);
    }
    
    // Test 3: Try alternative create-template endpoint
    console.log('3. Testing create-template endpoint...');
    const templateResponse = await fetch('https://risktemplatebuilder.replit.app/api/create-template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (templateResponse.ok) {
      const result = await templateResponse.json();
      console.log('✅ Template creation successful:', result);
      return true;
    } else {
      console.log('❌ Template creation failed:', templateResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
  
  return false;
}

// Test local fallback
async function testLocalFallback() {
  console.log('\n4. Testing local fallback...');
  
  const testData = {
    jobName: 'Fallback Test Project',
    jobNumber: 'FALL-001',
    projectAddress: '456 Fallback Street, Sydney NSW',
    swmsCreatorName: 'Fallback User',
    swmsCreatorPosition: 'Project Manager'
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/swms/pdf-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const pdfBuffer = await response.arrayBuffer();
      const filename = `local_fallback_test_${Date.now()}.pdf`;
      fs.writeFileSync(filename, Buffer.from(pdfBuffer));
      console.log(`✅ Local fallback working: ${filename} (${pdfBuffer.byteLength} bytes)`);
      return true;
    } else {
      console.log('❌ Local fallback failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Local fallback error:', error.message);
  }
  
  return false;
}

async function runTests() {
  console.log('🔄 Starting RiskTemplateBuilder Integration Tests');
  console.log('===============================================');
  
  const externalSuccess = await testRiskTemplateConnection();
  const localSuccess = await testLocalFallback();
  
  console.log('\n📊 Test Results:');
  console.log('=================');
  console.log(`External RiskTemplateBuilder: ${externalSuccess ? '✅ Working' : '❌ Failed'}`);
  console.log(`Local Fallback System: ${localSuccess ? '✅ Working' : '❌ Failed'}`);
  
  if (externalSuccess) {
    console.log('\n🎉 RiskTemplateBuilder integration successful!');
    console.log('All SWMS PDFs will now be generated using your external template builder.');
  } else if (localSuccess) {
    console.log('\n⚠️  Using local fallback system');
    console.log('RiskTemplateBuilder unavailable, using local PDF generation.');
  } else {
    console.log('\n❌ Both systems failed');
  }
}

runTests().catch(console.error);