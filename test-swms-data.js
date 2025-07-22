// Comprehensive SWMS Test Data Generator
// This creates realistic test data to validate PDF generation and preview functionality

const testSWMSData = {
  // Project Details
  jobName: "ACE Terminal Expansion - Fitout Phase 2",
  jobNumber: "ACE-2025-001",
  projectAddress: "123 Terminal Drive, Brisbane Airport, QLD 4008",
  principalContractor: "Alinea Construction Group",
  projectManager: "Michael Davis",
  siteSupervisor: "Jason Thompson",
  startDate: "2025-06-17",
  endDate: "2025-08-15",
  
  // Selected Tasks (Carpentry & Joinery)
  selectedTasks: [
    {
      id: "carp-001",
      task: "Installation of suspended ceiling systems",
      hazards: ["Falls from height", "Manual handling", "Electrical hazards"],
      riskRating: "Medium",
      controls: [
        "Use appropriate scaffolding or elevated work platforms",
        "Ensure all electrical circuits are isolated before work",
        "Use proper lifting techniques and mechanical aids"
      ],
      ppe: ["Hard hat", "Safety harness", "Safety boots", "High-vis vest"]
    },
    {
      id: "carp-002", 
      task: "Framing and stud wall construction",
      hazards: ["Manual handling", "Cuts from tools", "Noise exposure"],
      riskRating: "Medium",
      controls: [
        "Use mechanical lifting aids for heavy materials",
        "Maintain sharp tools and use cutting guides",
        "Provide hearing protection in noisy areas"
      ],
      ppe: ["Hard hat", "Cut-resistant gloves", "Hearing protection", "Safety boots"]
    },
    {
      id: "carp-003",
      task: "Door and window frame installation", 
      hazards: ["Manual handling", "Falls from height", "Finger/hand injuries"],
      riskRating: "Medium",
      controls: [
        "Use proper lifting techniques and team lifting",
        "Secure ladders and use fall protection",
        "Wear appropriate gloves and handle materials carefully"
      ],
      ppe: ["Hard hat", "Work gloves", "Safety boots", "High-vis vest"]
    },
    {
      id: "carp-004",
      task: "Installation of timber flooring",
      hazards: ["Knee injuries", "Dust exposure", "Tool injuries"],
      riskRating: "Low",
      controls: [
        "Use knee pads and take regular breaks",
        "Use dust extraction systems and masks",
        "Maintain tools in good condition"
      ],
      ppe: ["Knee pads", "Dust mask", "Safety glasses", "Work gloves"]
    },
    {
      id: "carp-005",
      task: "Built-in cabinetry installation",
      hazards: ["Manual handling", "Tool injuries", "Chemical exposure"],
      riskRating: "Medium", 
      controls: [
        "Use mechanical aids for heavy cabinets",
        "Ensure proper tool maintenance and training",
        "Provide adequate ventilation when using adhesives"
      ],
      ppe: ["Hard hat", "Safety glasses", "Respirator", "Work gloves"]
    },
    {
      id: "carp-006",
      task: "Demolition of existing structures",
      hazards: ["Structural collapse", "Asbestos exposure", "Noise and dust"],
      riskRating: "High",
      controls: [
        "Conduct structural assessment before demolition",
        "Test for asbestos and follow removal procedures",
        "Use water suppression and hearing protection"
      ],
      ppe: ["Hard hat", "Respirator", "Hearing protection", "Coveralls"]
    },
    {
      id: "carp-007",
      task: "Scaffold erection and dismantling",
      hazards: ["Falls from height", "Struck by falling objects", "Manual handling"],
      riskRating: "High",
      controls: [
        "Use certified scaffolders and follow AS/NZS 4576",
        "Establish exclusion zones and use overhead protection",
        "Use mechanical aids and team lifting"
      ],
      ppe: ["Hard hat", "Safety harness", "Safety boots", "High-vis vest"]
    },
    {
      id: "carp-008",
      task: "Weatherproofing and sealing works",
      hazards: ["Chemical exposure", "Falls from height", "Skin irritation"],
      riskRating: "Medium",
      controls: [
        "Use appropriate ventilation and read SDS",
        "Use proper access equipment and fall protection",
        "Wear chemical-resistant gloves and clothing"
      ],
      ppe: ["Respirator", "Chemical gloves", "Safety harness", "Coveralls"]
    }
  ],

  // Plant & Equipment
  plantEquipment: [
    {
      id: "pe-001",
      equipment: "Circular Saw (Hand-held)",
      type: "Hand Tool",
      operator: "Licensed Carpenter",
      inspectionDate: "2025-06-15",
      maintenanceRequired: false,
      riskLevel: "Medium",
      safetyRequirements: [
        "Daily pre-start inspection",
        "Blade guard in place and functioning",
        "Operator training certification required"
      ]
    },
    {
      id: "pe-002", 
      equipment: "Nail Gun (Pneumatic)",
      type: "Power Tool",
      operator: "Trained Operator",
      inspectionDate: "2025-06-10",
      maintenanceRequired: false,
      riskLevel: "Medium",
      safetyRequirements: [
        "Sequential trigger mechanism",
        "Safety glasses mandatory",
        "Compressed air system inspection"
      ]
    },
    {
      id: "pe-003",
      equipment: "Mobile Scaffold System",
      type: "Access Equipment", 
      operator: "Certified Scaffolder",
      inspectionDate: "2025-06-12",
      maintenanceRequired: false,
      riskLevel: "High",
      safetyRequirements: [
        "Daily inspection checklist",
        "Tag out system for defects",
        "Fall protection attachment points"
      ]
    },
    {
      id: "pe-004",
      equipment: "Router (Electric)",
      type: "Power Tool",
      operator: "Qualified Carpenter", 
      inspectionDate: "2025-06-08",
      maintenanceRequired: true,
      riskLevel: "Medium",
      safetyRequirements: [
        "Dust extraction system connected",
        "Guards and safety switches functional",
        "Regular bit inspection and replacement"
      ]
    },
    {
      id: "pe-005",
      equipment: "Forklift (3T Capacity)",
      type: "Mobile Plant",
      operator: "Licensed Forklift Operator",
      inspectionDate: "2025-06-16",
      maintenanceRequired: false,
      riskLevel: "High", 
      safetyRequirements: [
        "Current operator license required",
        "Daily pre-start inspection",
        "Exclusion zones and spotters when required"
      ]
    }
  ],

  // Emergency Procedures
  emergencyProcedures: `EMERGENCY RESPONSE PROCEDURES

1. MEDICAL EMERGENCY
   - Call 000 immediately for serious injuries
   - Administer first aid if qualified
   - Contact site supervisor: Jason Thompson (0412 345 678)
   - Notify principal contractor: Alinea Construction (07 3456 7890)

2. FIRE EMERGENCY  
   - Evacuate area immediately
   - Call 000
   - Use appropriate fire extinguisher if safe to do so
   - Muster at designated assembly point (Car Park Area A)

3. STRUCTURAL EMERGENCY
   - Stop all work immediately
   - Evacuate affected area
   - Contact structural engineer: Smith & Associates (07 3234 5678)
   - Isolate area until assessment complete

4. ELECTRICAL EMERGENCY
   - De-energize circuits if safe to do so
   - Call 000 for serious electrical incidents
   - Contact licensed electrician: Brisbane Electrical (07 3567 8901)

5. ENVIRONMENTAL INCIDENT
   - Contain spill if safe to do so
   - Report to EPA hotline: 1300 130 372
   - Document incident and notify authorities`,

  // Emergency Contacts
  emergencyContactsList: [
    {
      id: "ec-001",
      name: "Emergency Services",
      phone: "000",
      role: "Police/Fire/Ambulance"
    },
    {
      id: "ec-002", 
      name: "Jason Thompson",
      phone: "0412 345 678",
      role: "Site Supervisor"
    },
    {
      id: "ec-003",
      name: "Michael Davis", 
      phone: "0423 456 789",
      role: "Project Manager"
    },
    {
      id: "ec-004",
      name: "Alinea Construction",
      phone: "07 3456 7890", 
      role: "Principal Contractor"
    },
    {
      id: "ec-005",
      name: "Brisbane Hospital",
      phone: "07 3646 8111",
      role: "Nearest Hospital"
    }
  ],

  // Additional fields for comprehensive testing
  weatherConditions: "Clear, 22°C, Light winds",
  workingHours: "7:00 AM - 5:00 PM Monday to Friday",
  accessRoutes: "Main entrance via Terminal Drive, secondary access via Service Road B",
  
  // Risk Assessment Summary
  overallRiskRating: "Medium",
  complianceStatus: "Compliant with AS/NZS 4801, WHS Act 2011",
  
  // Legal Disclaimer
  acceptedDisclaimer: true,
  disclaimerAcceptedBy: "Michael Davis",
  disclaimerAcceptedDate: "2025-06-16T23:45:00.000Z"
};

// Test signature data
const testSignatures = [
  {
    id: "sig-001",
    signatory: "Michael Davis",
    role: "Project Manager", 
    email: "michael.davis@alinea.com.au",
    status: "signed",
    signedAt: "2025-06-16T23:45:00.000Z",
    signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    ipAddress: "203.45.67.89"
  },
  {
    id: "sig-002",
    signatory: "Jason Thompson", 
    role: "Site Supervisor",
    email: "jason.thompson@alinea.com.au",
    status: "signed",
    signedAt: "2025-06-16T23:50:00.000Z",
    typeSignature: "Jason Thompson",
    ipAddress: "203.45.67.90"
  },
  {
    id: "sig-003",
    signatory: "David Wilson",
    role: "Safety Officer",
    email: "david.wilson@alinea.com.au", 
    status: "pending"
  }
];

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testSWMSData,
    testSignatures
  };
} else {
  window.testSWMSData = testSWMSData;
  window.testSignatures = testSignatures;
}