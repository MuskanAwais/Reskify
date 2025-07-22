import { db } from "./db";
import { safetyLibrary } from "@shared/schema";

// Comprehensive activity database with pre-built risk assessments
export const COMPREHENSIVE_ACTIVITIES = {
  "Electrical": {
    "Installation Work": [
      {
        activity: "Power outlet installation",
        risks: [
          {
            hazard: "Electric shock from live conductors",
            riskLevel: "high",
            controlMeasures: [
              "Isolate power supply and verify with testing equipment",
              "Use appropriate personal protective equipment",
              "Follow lockout/tagout procedures",
              "Test circuits before and after work"
            ],
            responsiblePerson: "Licensed Electrician",
            complianceCodes: ["AS/NZS 3000:2018", "WHS Act 2011"]
          },
          {
            hazard: "Fire risk from faulty connections",
            riskLevel: "medium",
            controlMeasures: [
              "Ensure proper termination techniques",
              "Use approved electrical components",
              "Conduct insulation resistance testing",
              "Install appropriate circuit protection"
            ],
            responsiblePerson: "Licensed Electrician",
            complianceCodes: ["AS/NZS 3000:2018"]
          }
        ],
        safetyMeasures: [
          {
            category: "Personal Protective Equipment",
            measures: [
              "Wear insulated gloves rated for voltage",
              "Use safety glasses with side shields",
              "Wear non-conductive footwear",
              "Use hard hat when overhead hazards present"
            ],
            equipment: ["Insulated gloves", "Safety glasses", "Safety boots", "Hard hat"],
            procedures: ["PPE inspection before use", "PPE storage in dry location"]
          },
          {
            category: "Electrical Safety",
            measures: [
              "Test all circuits before work begins",
              "Use appropriate testing equipment",
              "Maintain safe working distances",
              "Install temporary barriers around work area"
            ],
            equipment: ["Voltage tester", "Insulation tester", "Safety barriers"],
            procedures: ["Electrical isolation procedure", "Testing verification"]
          }
        ]
      },
      {
        activity: "Light fixture installation",
        risks: [
          {
            hazard: "Falls from height during installation",
            riskLevel: "high",
            controlMeasures: [
              "Use appropriate ladder or scaffold system",
              "Maintain three points of contact",
              "Ensure ladder is on stable, level surface",
              "Use fall arrest harness for heights over 2m"
            ],
            responsiblePerson: "Site Supervisor",
            complianceCodes: ["AS/NZS 1892.1:2013", "WHS Act 2011"]
          },
          {
            hazard: "Electric shock from live circuits",
            riskLevel: "high",
            controlMeasures: [
              "Isolate power at main switchboard",
              "Use lockout/tagout procedures",
              "Test circuits with approved equipment",
              "Use insulated tools and equipment"
            ],
            responsiblePerson: "Licensed Electrician",
            complianceCodes: ["AS/NZS 3000:2018"]
          }
        ],
        safetyMeasures: [
          {
            category: "Height Safety",
            measures: [
              "Inspect ladder before each use",
              "Set up ladder at correct angle (4:1 ratio)",
              "Have spotter present during ladder work",
              "Use platform ladder for extended work"
            ],
            equipment: ["Extension ladder", "Platform ladder", "Fall arrest harness"],
            procedures: ["Ladder inspection checklist", "Fall protection plan"]
          }
        ]
      }
    ],
    "Maintenance & Repair": [
      {
        activity: "Fault finding and diagnostics",
        risks: [
          {
            hazard: "Electric shock during live testing",
            riskLevel: "extreme",
            controlMeasures: [
              "Use appropriate testing equipment rated for voltage",
              "Wear full electrical PPE",
              "Work with qualified assistant",
              "Follow electrical safety procedures",
              "Use one-hand testing technique"
            ],
            responsiblePerson: "Licensed Electrician",
            complianceCodes: ["AS/NZS 3000:2018", "WHS Act 2011"]
          },
          {
            hazard: "Arc flash during switching operations",
            riskLevel: "extreme",
            controlMeasures: [
              "Conduct arc flash risk assessment",
              "Use appropriate arc-rated PPE",
              "Maintain safe approach distances",
              "Use remote switching where possible"
            ],
            responsiblePerson: "Licensed Electrician",
            complianceCodes: ["AS/NZS 3000:2018"]
          }
        ],
        safetyMeasures: [
          {
            category: "Live Work Procedures",
            measures: [
              "Obtain permit to work on live equipment",
              "Use calibrated testing equipment",
              "Work with qualified observer",
              "Have emergency response plan ready"
            ],
            equipment: ["Arc-rated suit", "Insulated testing equipment", "Emergency contact list"],
            procedures: ["Live work permit", "Emergency response procedure"]
          }
        ]
      }
    ]
  },
  "Plumbing": {
    "Water Systems": [
      {
        activity: "Hot water system installation",
        risks: [
          {
            hazard: "Burns from hot water or steam",
            riskLevel: "high",
            controlMeasures: [
              "Allow system to cool before work",
              "Use appropriate protective clothing",
              "Install temperature relief valves",
              "Test water temperature before commissioning"
            ],
            responsiblePerson: "Licensed Plumber",
            complianceCodes: ["AS/NZS 3500:2021", "WHS Act 2011"]
          },
          {
            hazard: "Gas leak during connection",
            riskLevel: "extreme",
            controlMeasures: [
              "Use approved gas detection equipment",
              "Follow gas fitting procedures",
              "Test all connections with approved methods",
              "Ensure adequate ventilation"
            ],
            responsiblePerson: "Licensed Gas Fitter",
            complianceCodes: ["AS 2885:2007", "AS/NZS 3500:2021"]
          }
        ],
        safetyMeasures: [
          {
            category: "Gas Safety",
            measures: [
              "Use gas detection equipment during work",
              "Ensure proper ventilation in work area",
              "Have emergency shutdown procedures",
              "Keep fire extinguisher readily available"
            ],
            equipment: ["Gas detector", "Fire extinguisher", "Emergency contact numbers"],
            procedures: ["Gas leak emergency procedure", "Equipment commissioning checklist"]
          }
        ]
      }
    ],
    "Drainage & Sewerage": [
      {
        activity: "Sewer line installation",
        risks: [
          {
            hazard: "Exposure to sewage and contaminants",
            riskLevel: "high",
            controlMeasures: [
              "Wear appropriate protective clothing",
              "Use respiratory protection when required",
              "Maintain good hygiene practices",
              "Have first aid facilities available"
            ],
            responsiblePerson: "Site Supervisor",
            complianceCodes: ["WHS Act 2011", "AS/NZS 3500:2021"]
          },
          {
            hazard: "Confined space entry risks",
            riskLevel: "extreme",
            controlMeasures: [
              "Obtain confined space entry permit",
              "Test atmosphere before entry",
              "Use mechanical ventilation",
              "Have rescue equipment available"
            ],
            responsiblePerson: "Confined Space Supervisor",
            complianceCodes: ["WHS Regulation 2011"]
          }
        ],
        safetyMeasures: [
          {
            category: "Biological Protection",
            measures: [
              "Wear waterproof protective clothing",
              "Use appropriate respiratory protection",
              "Wash hands thoroughly after work",
              "Change clothing before leaving site"
            ],
            equipment: ["Waterproof suit", "Respirator", "Disposable gloves", "Eye wash station"],
            procedures: ["Decontamination procedure", "Medical surveillance program"]
          }
        ]
      }
    ]
  },
  "Carpentry": {
    "Structural Work": [
      {
        activity: "Wall framing",
        risks: [
          {
            hazard: "Cuts from power tools and hand tools",
            riskLevel: "medium",
            controlMeasures: [
              "Use tools with appropriate guards",
              "Maintain sharp, well-maintained tools",
              "Use correct cutting techniques",
              "Wear cut-resistant gloves where appropriate"
            ],
            responsiblePerson: "Carpenter",
            complianceCodes: ["WHS Act 2011", "AS 1684:2010"]
          },
          {
            hazard: "Manual handling injuries from timber",
            riskLevel: "medium",
            controlMeasures: [
              "Use mechanical lifting aids where possible",
              "Employ team lifting for heavy items",
              "Plan lifting routes and clear obstacles",
              "Use proper lifting techniques"
            ],
            responsiblePerson: "Site Supervisor",
            complianceCodes: ["WHS Act 2011"]
          }
        ],
        safetyMeasures: [
          {
            category: "Tool Safety",
            measures: [
              "Inspect tools before each use",
              "Use appropriate tool for each task",
              "Keep cutting tools sharp and clean",
              "Store tools safely when not in use"
            ],
            equipment: ["Tool inspection checklist", "First aid kit", "Cut-resistant gloves"],
            procedures: ["Tool maintenance schedule", "Incident reporting procedure"]
          }
        ]
      }
    ]
  },
  "Roofing": {
    "Roof Installation": [
      {
        activity: "Tile roof installation",
        risks: [
          {
            hazard: "Falls from roof edge or through roof",
            riskLevel: "extreme",
            controlMeasures: [
              "Install perimeter edge protection",
              "Use safety harness and anchor points",
              "Install safety mesh for fragile surfaces",
              "Maintain three points of contact",
              "Use roof ladders for access"
            ],
            responsiblePerson: "Roofing Supervisor",
            complianceCodes: ["AS/NZS 1891.1:2007", "WHS Act 2011"]
          },
          {
            hazard: "Manual handling of roofing materials",
            riskLevel: "medium",
            controlMeasures: [
              "Use mechanical lifting equipment",
              "Plan material placement to minimize handling",
              "Use team lifting techniques",
              "Take regular breaks to prevent fatigue"
            ],
            responsiblePerson: "Site Supervisor",
            complianceCodes: ["WHS Act 2011"]
          }
        ],
        safetyMeasures: [
          {
            category: "Fall Protection",
            measures: [
              "Install temporary edge protection before work begins",
              "Use full body harness connected to anchor points",
              "Inspect all fall protection equipment daily",
              "Have rescue plan in place for harness users"
            ],
            equipment: ["Safety harness", "Anchor points", "Safety mesh", "Roof ladder"],
            procedures: ["Fall protection plan", "Equipment inspection checklist", "Rescue procedure"]
          }
        ]
      }
    ]
  },
  "Demolition": {
    "Structural Demolition": [
      {
        activity: "Building demolition",
        risks: [
          {
            hazard: "Structural collapse during demolition",
            riskLevel: "extreme",
            controlMeasures: [
              "Conduct structural engineering assessment",
              "Follow planned demolition sequence",
              "Monitor structural integrity continuously",
              "Establish exclusion zones around work area"
            ],
            responsiblePerson: "Demolition Supervisor",
            complianceCodes: ["AS 2601:2001", "WHS Act 2011"]
          },
          {
            hazard: "Exposure to asbestos and hazardous materials",
            riskLevel: "extreme",
            controlMeasures: [
              "Conduct pre-demolition hazardous material survey",
              "Remove hazardous materials before demolition",
              "Use appropriate respiratory protection",
              "Follow asbestos removal procedures"
            ],
            responsiblePerson: "Licensed Asbestos Removalist",
            complianceCodes: ["WHS Regulation 2011"]
          }
        ],
        safetyMeasures: [
          {
            category: "Hazardous Materials",
            measures: [
              "Conduct comprehensive site survey before work",
              "Use appropriate respiratory protection",
              "Implement decontamination procedures",
              "Monitor air quality during work"
            ],
            equipment: ["P2 respirators", "Decontamination unit", "Air monitoring equipment"],
            procedures: ["Hazardous material management plan", "Emergency response procedure"]
          }
        ]
      }
    ]
  }
};

export async function seedActivityRisks() {
  console.log("Seeding comprehensive activity risk database...");
  
  // This function would populate a dedicated activities table with pre-built risk assessments
  // For now, we'll use this data structure in the application logic
  
  console.log("Activity risk database ready with comprehensive Australian construction activities");
}