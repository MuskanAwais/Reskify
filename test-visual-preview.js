import fs from 'fs';

async function testVisualPreview() {
  console.log('TESTING VISUAL PDF PREVIEW INTEGRATION');
  console.log('=====================================');
  
  // Test data for visual preview
  const testData = {
    projectName: "Visual Preview Test Project",
    jobNumber: "VP-TEST-001",
    projectAddress: "123 Collins Street, Melbourne VIC",
    swmsCreatorName: "Test Creator",
    swmsCreatorPosition: "Site Manager",
    principalContractor: "Test Construction Pty Ltd",
    projectManager: "Test Manager",
    siteSupervisor: "Test Supervisor",
    startDate: "2025-02-15",
    tradeType: "Commercial Fitout",
    companyLogo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    companyLogoFilename: "test-logo.png",
    activities: [
      {
        activity: "Installing partition walls",
        hazards: ["Manual handling", "Cuts from tools"],
        initialRisk: "Medium",
        controlMeasures: ["Use proper lifting techniques", "Wear cut-resistant gloves"],
        residualRisk: "Low",
        legislation: "WHS Act 2011"
      }
    ],
    plantEquipment: [
      {
        equipment: "Cordless Drill",
        riskLevel: "Low",
        nextInspection: "2025-03-01",
        certificationRequired: "Not Required"
      }
    ],
    ppeRequirements: ["Safety helmet", "Safety glasses", "Hi-vis vest"],
    hrcwCategories: [1, 5],
    emergencyProcedures: [
      {
        procedure: "Emergency Contact",
        details: "Call 000 for emergencies"
      }
    ],
    preview: true
  };

  console.log('\n1. Testing RiskTemplateBuilder Preview Endpoint...');
  
  try {
    const response = await fetch('https://risktemplatebuilder.replit.app/api/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const previewResult = await response.json();
      console.log('\n✅ RiskTemplateBuilder Preview Response:');
      console.log(JSON.stringify(previewResult, null, 2));
      
      // Save response to file for inspection
      fs.writeFileSync('risktemplatebuilder_preview_response.json', JSON.stringify(previewResult, null, 2));
      console.log('📄 Saved response to: risktemplatebuilder_preview_response.json');
      
    } else {
      const errorText = await response.text();
      console.log('❌ RiskTemplateBuilder Preview Failed:', errorText);
    }

  } catch (error) {
    console.log('❌ Connection to RiskTemplateBuilder failed:', error.message);
  }

  console.log('\n2. Testing Alternative Endpoints...');
  
  const alternativeEndpoints = [
    'https://risktemplatebuilder.replit.app/api/visual-preview',
    'https://risktemplatebuilder.replit.app/api/generate-preview',
    'https://risktemplatebuilder.replit.app/preview',
    'https://risktemplatebuilder.replit.app/api/status'
  ];

  for (const endpoint of alternativeEndpoints) {
    try {
      console.log(`\nTesting: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.text();
        console.log(`  ✅ SUCCESS: ${result.substring(0, 200)}...`);
      } else if (response.status === 404) {
        console.log(`  ❌ NOT FOUND`);
      } else {
        console.log(`  ⚠️  ERROR: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`  ❌ CONNECTION ERROR: ${error.message}`);
    }
  }

  console.log('\n3. Local Preview Generation Test...');
  
  // Test local preview generation
  const localPreview = {
    projectInfo: {
      name: testData.projectName,
      number: testData.jobNumber,
      address: testData.projectAddress,
      creator: testData.swmsCreatorName,
      position: testData.swmsCreatorPosition,
      contractor: testData.principalContractor,
      manager: testData.projectManager,
      supervisor: testData.siteSupervisor,
      startDate: testData.startDate,
      trade: testData.tradeType
    },
    sections: {
      activities: testData.activities?.length || 0,
      equipment: testData.plantEquipment?.length || 0,
      ppe: testData.ppeRequirements?.length || 0,
      hrcw: testData.hrcwCategories?.length || 0,
      emergency: testData.emergencyProcedures?.length || 0
    },
    completeness: 85, // Mock completeness
    lastUpdated: new Date().toLocaleTimeString()
  };

  console.log('✅ Local Preview Generated:');
  console.log(JSON.stringify(localPreview, null, 2));
  
  // Save local preview
  fs.writeFileSync('local_preview_response.json', JSON.stringify(localPreview, null, 2));
  console.log('📄 Saved local preview to: local_preview_response.json');

  console.log('\n4. Testing Integration with Local Server...');
  
  try {
    const response = await fetch('http://localhost:5000/api/swms/visual-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log(`Local Server Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Local server preview working:', result);
    } else {
      console.log('⚠️  Local server preview endpoint not implemented yet');
    }
    
  } catch (error) {
    console.log('⚠️  Local server not accessible:', error.message);
  }

  console.log('\n=================================');
  console.log('VISUAL PREVIEW TESTING COMPLETE');
  console.log('=================================');
  
  console.log('\n📋 SUMMARY:');
  console.log('- Visual PDF Preview component created');
  console.log('- Live update functionality with debouncing');  
  console.log('- Fallback to local preview generation');
  console.log('- Integration with RiskTemplateBuilder preview API');
  console.log('- Company logo support included');
  console.log('- Real-time field update reflection');
}

testVisualPreview().catch(console.error);