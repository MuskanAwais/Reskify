// Script to create comprehensive test SWMS documents
import fetch from 'node-fetch';

const testSWMSDocuments = [
  {
    projectName: "High-Rise Commercial Building",
    projectNumber: "HRB-2025-001",
    projectAddress: "123 Collins Street, Melbourne VIC 3000",
    companyName: "Premier Construction Group",
    principalContractor: "Premier Construction Group",
    projectDescription: "Construction of 20-story commercial office building with basement parking",
    swmsData: {
      activities: [
        {
          activity: "Crane Operations for Steel Erection",
          hazards: ["Fall from height", "Struck by falling objects", "Crane collapse", "Electrical hazards"],
          likelihood: 3,
          consequence: 5,
          initialRiskScore: 15,
          controlMeasures: [
            "Licensed crane operator with current certification",
            "Daily pre-start crane inspections",
            "Establish exclusion zones with barriers",
            "Use spotters and radio communication",
            "Weather monitoring - no operation in high winds"
          ],
          residualLikelihood: 2,
          residualConsequence: 4,
          residualRiskScore: 8,
          riskLevel: "Medium",
          ppe: ["Hard hat", "Safety harness", "High-vis vest", "Safety boots", "Gloves"],
          responsible: "Crane Supervisor"
        },
        {
          activity: "Concrete Pumping to Upper Floors",
          hazards: ["High pressure equipment failure", "Chemical burns", "Manual handling", "Fall from height"],
          likelihood: 2,
          consequence: 4,
          initialRiskScore: 8,
          controlMeasures: [
            "Regular maintenance of pump equipment",
            "Use appropriate PPE for concrete handling",
            "Mechanical lifting aids for heavy components",
            "Edge protection on all elevated work areas"
          ],
          residualLikelihood: 1,
          residualConsequence: 3,
          residualRiskScore: 3,
          riskLevel: "Low",
          ppe: ["Chemical resistant gloves", "Safety glasses", "Hard hat", "Safety boots"],
          responsible: "Concrete Supervisor"
        }
      ],
      plantEquipment: [
        {
          item: "Tower Crane 400T",
          riskLevel: "High",
          controlMeasures: ["Daily inspections", "Licensed operators only", "Weather monitoring"]
        },
        {
          item: "Concrete Pump 52m",
          riskLevel: "Medium",
          controlMeasures: ["Pre-start checks", "Pressure testing", "Operator certification"]
        }
      ],
      emergencyProcedures: {
        evacuation: "Assembly point at street level car park - 123 Collins Street",
        firstAid: "Contact site first aid officer via radio Channel 1, or call 000",
        emergencyContacts: "Emergency: 000, Site Manager: 0412 345 678, Safety Officer: 0423 456 789"
      }
    },
    formData: {
      jobName: "High-Rise Commercial Building",
      jobNumber: "HRB-2025-001",
      projectLocation: "123 Collins Street, Melbourne VIC 3000",
      principalContractor: "Premier Construction Group",
      supervisorName: "Michael Johnson",
      supervisorPhone: "0412 345 678"
    },
    status: "completed",
    creditsCost: 1
  },
  {
    projectName: "Residential Subdivision Infrastructure",
    projectNumber: "RSI-2025-002", 
    projectAddress: "Oak Grove Estate, Pakenham VIC 3810",
    companyName: "Infrastructure Solutions Pty Ltd",
    principalContractor: "Infrastructure Solutions Pty Ltd",
    projectDescription: "Civil works including roads, drainage, and utility installation for 150-lot subdivision",
    swmsData: {
      activities: [
        {
          activity: "Excavation for Underground Services",
          hazards: ["Cave-in of excavation", "Underground utilities", "Heavy machinery", "Contaminated soil"],
          likelihood: 3,
          consequence: 4,
          initialRiskScore: 12,
          controlMeasures: [
            "Dial Before You Dig completed for all areas",
            "Implement trench shoring systems",
            "Use vacuum excavation near known services",
            "Soil testing completed for contamination"
          ],
          residualLikelihood: 2,
          residualConsequence: 3,
          residualRiskScore: 6,
          riskLevel: "Medium",
          ppe: ["Hard hat", "Safety boots", "High-vis vest", "Respiratory protection"],
          responsible: "Excavation Supervisor"
        },
        {
          activity: "Road Construction and Asphalting",
          hazards: ["Hot bitumen burns", "Plant vehicle interactions", "Dust exposure", "Noise exposure"],
          likelihood: 2,
          consequence: 3,
          initialRiskScore: 6,
          controlMeasures: [
            "Hot works procedures for bitumen handling",
            "Traffic management plan implementation",
            "Water spraying for dust suppression",
            "Hearing protection program"
          ],
          residualLikelihood: 1,
          residualConsequence: 2,
          residualRiskScore: 2,
          riskLevel: "Low",
          ppe: ["Heat resistant gloves", "Respirator", "Hearing protection", "UV protection"],
          responsible: "Roads Supervisor"
        }
      ],
      plantEquipment: [
        {
          item: "20T Excavator",
          riskLevel: "High",
          controlMeasures: ["Daily pre-start inspections", "Exclusion zones", "Ground conditions assessment"]
        },
        {
          item: "Asphalt Paver",
          riskLevel: "Medium",
          controlMeasures: ["Hot works permits", "Operator training", "Emergency shower stations"]
        }
      ],
      emergencyProcedures: {
        evacuation: "Muster point at site office compound - Oak Grove Drive entrance",
        firstAid: "Site first aid officer available 7am-5pm, emergency services 000",
        emergencyContacts: "Emergency: 000, Site Manager: 0434 567 890, Council: 03 5941 4444"
      }  
    },
    formData: {
      jobName: "Residential Subdivision Infrastructure",
      jobNumber: "RSI-2025-002",
      projectLocation: "Oak Grove Estate, Pakenham VIC 3810", 
      principalContractor: "Infrastructure Solutions Pty Ltd",
      supervisorName: "Sarah Thompson",
      supervisorPhone: "0434 567 890"
    },
    status: "completed",
    creditsCost: 1
  },
  {
    projectName: "Electrical Substation Upgrade",
    projectNumber: "ESU-2025-003",
    projectAddress: "45 Industrial Drive, Dandenong VIC 3175",
    companyName: "ElectroTech Services",
    principalContractor: "ElectroTech Services",
    projectDescription: "Upgrade of 66kV electrical substation including new switchgear installation",
    swmsData: {
      activities: [
        {
          activity: "High Voltage Electrical Work",
          hazards: ["Electrical shock/electrocution", "Arc flash", "Electromagnetic fields", "Working at height"],
          likelihood: 2,
          consequence: 5,
          initialRiskScore: 10,
          controlMeasures: [
            "Isolation and lockout procedures strictly followed",
            "Arc flash risk assessment completed",
            "Qualified electrical workers only",
            "Personal voltage detectors used",
            "Appropriate electrical PPE worn"
          ],
          residualLikelihood: 1,
          residualConsequence: 4,
          residualRiskScore: 4,
          riskLevel: "Medium",
          ppe: ["Arc flash suit", "Insulated gloves", "Safety helmet", "Face shield", "Insulated tools"],
          responsible: "Licensed Electrical Supervisor"
        },
        {
          activity: "Crane Lifting of Switchgear",
          hazards: ["Dropped loads", "Contact with overhead lines", "Crane instability", "Manual handling"],
          likelihood: 3,
          consequence: 4,
          initialRiskScore: 12,
          controlMeasures: [
            "Certified crane operator and rigger",
            "Minimum clearance distances from live lines",
            "Ground conditions assessment",
            "Mechanical lifting aids used"
          ],
          residualLikelihood: 2,
          residualConsequence: 3,
          residualRiskScore: 6,
          riskLevel: "Medium",
          ppe: ["Hard hat", "High-vis vest", "Safety boots", "Gloves"],
          responsible: "Crane Supervisor"
        }
      ],
      plantEquipment: [
        {
          item: "Mobile Crane 50T",
          riskLevel: "High", 
          controlMeasures: ["Electrical clearance calculations", "Insulated boom if required", "Spotters positioned"]
        },
        {
          item: "Voltage Testing Equipment",
          riskLevel: "Medium",
          controlMeasures: ["Calibration certificates current", "Proper operation training", "Regular functionality checks"]
        }
      ],
      emergencyProcedures: {
        evacuation: "Assembly area at front gate security office - minimum 50m from substation",
        firstAid: "Electrical incident procedures - do not touch victim until power confirmed off",
        emergencyContacts: "Emergency: 000, Network Control: 13 17 99, Site Manager: 0445 678 901"
      }
    },
    formData: {
      jobName: "Electrical Substation Upgrade",
      jobNumber: "ESU-2025-003",
      projectLocation: "45 Industrial Drive, Dandenong VIC 3175",
      principalContractor: "ElectroTech Services", 
      supervisorName: "David Chen",
      supervisorPhone: "0445 678 901"
    },
    status: "completed",
    creditsCost: 1
  }
];

// Function to create SWMS documents in the database
async function createTestDocuments() {
  console.log('Creating comprehensive test SWMS documents...');
  
  for (const swmsDoc of testSWMSDocuments) {
    try {
      // Create the SWMS document
      const response = await fetch('http://localhost:5000/api/swms/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: swmsDoc.projectName,
          projectNumber: swmsDoc.projectNumber,
          projectAddress: swmsDoc.projectAddress,
          companyName: swmsDoc.companyName,
          principalContractor: swmsDoc.principalContractor,
          projectDescription: swmsDoc.projectDescription,
          swmsData: swmsDoc.swmsData,
          formData: swmsDoc.formData,
          status: swmsDoc.status,
          finalizedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✓ Created SWMS: ${swmsDoc.projectName} (ID: ${result.id})`);
        
        // Generate PDF for completed documents
        if (swmsDoc.status === 'completed') {
          const pdfResponse = await fetch('http://localhost:5000/api/swms/pdf-download', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(swmsDoc)
          });
          
          if (pdfResponse.ok) {
            console.log(`✓ PDF generated for: ${swmsDoc.projectName}`);
          }
        }
      } else {
        console.error(`Failed to create ${swmsDoc.projectName}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error creating ${swmsDoc.projectName}:`, error);
    }
  }
  
  console.log('\nTest SWMS documents creation completed!');
  console.log('Check the "My SWMS" section to view and download the generated PDFs.');
}

// Run the creation script
createTestDocuments();