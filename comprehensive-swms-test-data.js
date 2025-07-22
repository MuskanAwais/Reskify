/**
 * COMPREHENSIVE SWMS TEST DATA FOR STEP-BY-STEP COMPLETION
 * This script will guide filling out every field to test SWMSprint integration
 */

// Step 1: Complete Project & Contractor Details
const step1Data = {
  jobName: "Commercial Office Electrical Installation - SWMSprint Test",
  jobNumber: "ELEC-2025-TEST-001",
  projectAddress: "Level 15, 123 Collins Street, Melbourne VIC 3000",
  projectLocation: "Office Tower A, Collins Street Precinct",
  startDate: "2025-01-15",
  duration: "4 weeks",
  projectDescription: "Complete electrical fit-out for new commercial office space including power distribution, lighting systems, data cabling, emergency systems, and fire alarm integration for 500 sqm modern office environment",
  workDescription: "Installation of electrical infrastructure including 240V power circuits, LED lighting systems, structured data cabling, emergency lighting, exit signs, fire alarm integration, and electrical safety testing",
  
  // Personnel
  swmsCreatorName: "John Smith",
  swmsCreatorPosition: "Licensed Electrician A-Class",
  principalContractor: "ABC Construction Pty Ltd",
  principalContractorAbn: "12 345 678 901",
  projectManager: "Sarah Wilson",
  siteSupervisor: "Mike Johnson", 
  subcontractor: "Elite Electrical Services",
  subcontractorAbn: "98 765 432 109",
  
  // Trade
  tradeType: "Electrical"
};

console.log("STEP 1 DATA TO FILL:");
console.log("Job Name:", step1Data.jobName);
console.log("Job Number:", step1Data.jobNumber);
console.log("Project Address:", step1Data.projectAddress);
console.log("Project Location:", step1Data.projectLocation);
console.log("Start Date:", step1Data.startDate);
console.log("Duration:", step1Data.duration);
console.log("Project Description:", step1Data.projectDescription);
console.log("Work Description:", step1Data.workDescription);
console.log("SWMS Creator Name:", step1Data.swmsCreatorName);
console.log("SWMS Creator Position:", step1Data.swmsCreatorPosition);
console.log("Principal Contractor:", step1Data.principalContractor);
console.log("Principal Contractor ABN:", step1Data.principalContractorAbn);
console.log("Project Manager:", step1Data.projectManager);
console.log("Site Supervisor:", step1Data.siteSupervisor);
console.log("Subcontractor:", step1Data.subcontractor);
console.log("Subcontractor ABN:", step1Data.subcontractorAbn);
console.log("Trade Type:", step1Data.tradeType);

// Step 2: Work Activities (AI Generated)
const step2Instructions = `
STEP 2: Click "Describe Job (AI-Powered)" and enter:
"Commercial office electrical installation including power distribution boards, LED lighting systems, data cabling, emergency lighting, exit signs, and fire alarm integration for 500 sqm office space"

This will generate comprehensive electrical activities with risk assessments.
`;

// Step 3: HRCW Categories to Select
const step3Data = {
  hrcwCategories: [
    "Electrical Work - High voltage electrical installation",
    "Use of Chemicals - Electrical cleaning solvents and compounds"
  ]
};

// Step 4: PPE Requirements (Auto-detected + Manual)
const step4Data = {
  standardPPE: [
    "Safety Helmet", "Safety Boots", "High-Vis Vest", "Safety Glasses"
  ],
  taskSpecificPPE: [
    "Insulated Gloves", "Arc Flash Suit", "Voltage Detector", "Insulated Tools"
  ]
};

// Step 5: Plant & Equipment
const step5Data = {
  equipment: [
    {
      name: "Elevated Work Platform (EWP)",
      type: "Access Equipment",
      riskLevel: "High",
      certificationRequired: "Required",
      nextInspectionDue: "2025-02-01"
    },
    {
      name: "Cable Pulling System",
      type: "Installation Equipment",
      riskLevel: "Medium", 
      certificationRequired: "Not Required",
      nextInspectionDue: "2025-03-01"
    },
    {
      name: "Multimeter Testing Equipment",
      type: "Testing Equipment",
      riskLevel: "Low",
      certificationRequired: "Required", 
      nextInspectionDue: "2025-01-20"
    }
  ]
};

// Step 6: Emergency Procedures
const step6Data = {
  emergencyContacts: [
    { name: "Site Supervisor", phone: "0400 123 456", role: "Primary Contact" },
    { name: "Electrical Safety Officer", phone: "0400 789 012", role: "Technical Support" },
    { name: "Emergency Services", phone: "000", role: "Emergency Response" }
  ],
  nearestHospital: "Royal Melbourne Hospital - 300 Grattan Street, Parkville VIC 3050",
  firstAidArrangements: "Qualified first aid officer on site during all work hours. First aid kit located in site office and mobile first aid kit with electrical work crew.",
  emergencyResponseProcedures: "In case of electrical incident: 1) Ensure area is safe, 2) Call 000 if required, 3) Notify site supervisor, 4) Isolate electrical supply if safe to do so, 5) Administer first aid if qualified, 6) Document incident"
};

// Step 7: Legal Disclaimer - Standard acceptance

// Step 8: Payment - Use credits

// Step 9: Document Generation - Test SWMSprint integration

console.log("\n=== COMPREHENSIVE TEST PLAN ===");
console.log("1. Fill Step 1 with complete project details");
console.log("2. Generate AI activities in Step 2");
console.log("3. Select HRCW categories in Step 3");
console.log("4. Configure PPE in Step 4");
console.log("5. Add plant & equipment in Step 5");
console.log("6. Set emergency procedures in Step 6");
console.log("7. Accept legal disclaimer in Step 7");
console.log("8. Use credits for payment in Step 8");
console.log("9. Generate PDF with SWMSprint in Step 9");
console.log("\nThis will test all 79 mapped fields with your SWMSprint app!");