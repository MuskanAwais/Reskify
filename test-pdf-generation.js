// Test script to generate and verify PDF with complete SWMS data
import fs from 'fs';
import path from 'path';

// Sample comprehensive SWMS data for testing
const testData = {
  projectName: "Commercial Office Building Construction",
  projectNumber: "COB-2025-001",
  projectAddress: "123 Collins Street, Melbourne VIC 3000",
  companyName: "ABC Construction Pty Ltd",
  principalContractor: "ABC Construction Pty Ltd",
  swmsData: {
    activities: [
      {
        activity: "Excavation and Earthworks",
        hazards: ["Fall into excavation", "Underground services", "Cave-in", "Heavy machinery"],
        likelihood: 3,
        consequence: 4,
        initialRiskScore: 12,
        controlMeasures: [
          "Implement exclusion zones around excavation",
          "Dial Before You Dig service completed",
          "Use appropriate shoring systems",
          "Daily safety briefings for operators"
        ],
        residualLikelihood: 2,
        residualConsequence: 3,
        residualRiskScore: 6,
        riskLevel: "Medium",
        ppe: ["Hard hat", "Safety boots", "High-vis vest", "Safety harness"],
        responsible: "Site Supervisor"
      },
      {
        activity: "Concrete Pouring",
        hazards: ["Chemical burns from concrete", "Manual handling", "Slips and falls", "Crane operations"],
        likelihood: 2,
        consequence: 3,
        initialRiskScore: 6,
        controlMeasures: [
          "Wear appropriate PPE including gloves",
          "Use mechanical aids for heavy lifting",
          "Maintain clean work surfaces",
          "Follow crane safety procedures"
        ],
        residualLikelihood: 1,
        residualConsequence: 2,
        residualRiskScore: 2,
        riskLevel: "Low",
        ppe: ["Safety gloves", "Hard hat", "Safety boots", "Eye protection"],
        responsible: "Concrete Supervisor"
      }
    ],
    plantEquipment: [
      {
        item: "20T Excavator",
        riskLevel: "High",
        controlMeasures: ["Daily pre-start checks", "Licensed operator only", "Exclusion zones"]
      },
      {
        item: "Concrete Pump",
        riskLevel: "Medium", 
        controlMeasures: ["Manufacturer guidelines", "Setup inspection", "Operator training"]
      }
    ],
    emergencyProcedures: {
      evacuation: "Assembly point at main gate car park",
      firstAid: "Contact trained first aid officer on site",
      emergencyContacts: "000 for emergency services"
    }
  },
  formData: {
    jobName: "Commercial Office Building Construction",
    jobNumber: "COB-2025-001",
    projectLocation: "123 Collins Street, Melbourne VIC 3000",
    principalContractor: "ABC Construction Pty Ltd",
    supervisorName: "John Smith",
    supervisorPhone: "0412 345 678"
  }
};

// Test PDF generation endpoint
async function testPDFGeneration() {
  try {
    console.log('Testing PDF generation with comprehensive SWMS data...');
    
    const response = await fetch('http://localhost:5000/api/swms/pdf-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const filename = `test_swms_${Date.now()}.pdf`;
      const filepath = path.join(process.cwd(), filename);
      
      fs.writeFileSync(filepath, Buffer.from(buffer));
      console.log(`PDF generated successfully: ${filename}`);
      console.log(`File size: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
      console.log(`File path: ${filepath}`);
      
      return filepath;
    } else {
      const error = await response.text();
      console.error('PDF generation failed:', error);
      return null;
    }
  } catch (error) {
    console.error('Test failed:', error);
    return null;
  }
}

// Run the test
testPDFGeneration().then(filepath => {
  if (filepath) {
    console.log('\n✓ PDF test completed successfully');
    console.log('Next: Review the generated PDF to verify all elements are included');
  } else {
    console.log('\n✗ PDF test failed');
  }
});