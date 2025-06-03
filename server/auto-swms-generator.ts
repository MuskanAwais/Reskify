// Comprehensive auto-SWMS generation system
export const ACTIVITY_RISK_DATABASE = {
  // ELECTRICAL WORK
  "Power outlet installation": {
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
          "Conduct insulation resistance testing"
        ],
        responsiblePerson: "Licensed Electrician",
        complianceCodes: ["AS/NZS 3000:2018"]
      }
    ],
    safetyMeasures: [
      {
        category: "Personal Protective Equipment",
        measures: ["Wear insulated gloves rated for voltage", "Use safety glasses", "Wear non-conductive footwear"],
        equipment: ["Insulated gloves", "Safety glasses", "Safety boots"],
        procedures: ["PPE inspection before use", "PPE storage in dry location"]
      }
    ]
  },
  
  "Light fixture installation": {
    risks: [
      {
        hazard: "Falls from height during installation",
        riskLevel: "high",
        controlMeasures: [
          "Use appropriate ladder or scaffold system",
          "Maintain three points of contact",
          "Use fall arrest harness for heights over 2m"
        ],
        responsiblePerson: "Site Supervisor",
        complianceCodes: ["AS/NZS 1892.1:2013", "WHS Act 2011"]
      }
    ],
    safetyMeasures: [
      {
        category: "Height Safety",
        measures: ["Inspect ladder before use", "Set up at correct angle", "Use spotter"],
        equipment: ["Extension ladder", "Fall arrest harness"],
        procedures: ["Ladder inspection checklist", "Fall protection plan"]
      }
    ]
  },

  "Switchboard installation": {
    risks: [
      {
        hazard: "Electric shock during connection",
        riskLevel: "extreme",
        controlMeasures: [
          "Isolate main supply before work",
          "Use lockout/tagout procedures",
          "Verify isolation with approved testing equipment",
          "Work with qualified assistant"
        ],
        responsiblePerson: "Licensed Electrician",
        complianceCodes: ["AS/NZS 3000:2018", "WHS Act 2011"]
      }
    ],
    safetyMeasures: [
      {
        category: "Electrical Safety",
        measures: ["Test all circuits before work", "Use insulated tools", "Maintain safe distances"],
        equipment: ["Voltage tester", "Insulated tools", "Safety barriers"],
        procedures: ["Electrical isolation procedure", "Testing verification"]
      }
    ]
  },

  // PLUMBING WORK
  "Hot water system installation": {
    risks: [
      {
        hazard: "Burns from hot water or steam",
        riskLevel: "high",
        controlMeasures: [
          "Allow system to cool before work",
          "Use appropriate protective clothing",
          "Install temperature relief valves"
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
          "Test all connections"
        ],
        responsiblePerson: "Licensed Gas Fitter",
        complianceCodes: ["AS 2885:2007"]
      }
    ],
    safetyMeasures: [
      {
        category: "Gas Safety",
        measures: ["Use gas detection equipment", "Ensure proper ventilation", "Keep fire extinguisher available"],
        equipment: ["Gas detector", "Fire extinguisher"],
        procedures: ["Gas leak emergency procedure"]
      }
    ]
  },

  "Sewer line installation": {
    risks: [
      {
        hazard: "Exposure to sewage and contaminants",
        riskLevel: "high",
        controlMeasures: [
          "Wear appropriate protective clothing",
          "Use respiratory protection when required",
          "Maintain good hygiene practices"
        ],
        responsiblePerson: "Site Supervisor",
        complianceCodes: ["WHS Act 2011", "AS/NZS 3500:2021"]
      }
    ],
    safetyMeasures: [
      {
        category: "Biological Protection",
        measures: ["Wear waterproof clothing", "Use respiratory protection", "Wash hands thoroughly"],
        equipment: ["Waterproof suit", "Respirator", "Hand sanitizer"],
        procedures: ["Decontamination procedure"]
      }
    ]
  },

  // CARPENTRY WORK
  "Wall framing": {
    risks: [
      {
        hazard: "Cuts from power tools and hand tools",
        riskLevel: "medium",
        controlMeasures: [
          "Use tools with appropriate guards",
          "Maintain sharp, well-maintained tools",
          "Use correct cutting techniques"
        ],
        responsiblePerson: "Carpenter",
        complianceCodes: ["WHS Act 2011", "AS 1684:2010"]
      }
    ],
    safetyMeasures: [
      {
        category: "Tool Safety",
        measures: ["Inspect tools before use", "Keep cutting tools sharp", "Store tools safely"],
        equipment: ["Tool inspection checklist", "First aid kit"],
        procedures: ["Tool maintenance schedule"]
      }
    ]
  },

  "Roof framing": {
    risks: [
      {
        hazard: "Falls from height during construction",
        riskLevel: "extreme",
        controlMeasures: [
          "Install perimeter edge protection",
          "Use safety harness and anchor points",
          "Install temporary flooring where required"
        ],
        responsiblePerson: "Carpenter/Site Supervisor",
        complianceCodes: ["AS/NZS 1891.1:2007", "WHS Act 2011"]
      }
    ],
    safetyMeasures: [
      {
        category: "Fall Protection",
        measures: ["Install edge protection before work", "Use full body harness", "Have rescue plan"],
        equipment: ["Safety harness", "Anchor points", "Edge protection"],
        procedures: ["Fall protection plan", "Rescue procedure"]
      }
    ]
  },

  // ROOFING WORK
  "Tile roof installation": {
    risks: [
      {
        hazard: "Falls from roof edge or through roof",
        riskLevel: "extreme",
        controlMeasures: [
          "Install perimeter edge protection",
          "Use safety harness and anchor points",
          "Install safety mesh for fragile surfaces"
        ],
        responsiblePerson: "Roofing Supervisor",
        complianceCodes: ["AS/NZS 1891.1:2007", "WHS Act 2011"]
      }
    ],
    safetyMeasures: [
      {
        category: "Fall Protection",
        measures: ["Install temporary edge protection", "Use full body harness", "Inspect equipment daily"],
        equipment: ["Safety harness", "Safety mesh", "Roof ladder"],
        procedures: ["Fall protection plan", "Equipment inspection checklist"]
      }
    ]
  },

  // DEMOLITION WORK
  "Building demolition": {
    risks: [
      {
        hazard: "Structural collapse during demolition",
        riskLevel: "extreme",
        controlMeasures: [
          "Conduct structural engineering assessment",
          "Follow planned demolition sequence",
          "Monitor structural integrity continuously"
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
          "Use appropriate respiratory protection"
        ],
        responsiblePerson: "Licensed Asbestos Removalist",
        complianceCodes: ["WHS Regulation 2011"]
      }
    ],
    safetyMeasures: [
      {
        category: "Hazardous Materials",
        measures: ["Conduct site survey before work", "Use respiratory protection", "Monitor air quality"],
        equipment: ["P2 respirators", "Air monitoring equipment"],
        procedures: ["Hazardous material management plan"]
      }
    ]
  },

  // CONCRETE WORK
  "Concrete pouring": {
    risks: [
      {
        hazard: "Chemical burns from concrete",
        riskLevel: "medium",
        controlMeasures: [
          "Wear appropriate protective clothing",
          "Use waterproof gloves and boots",
          "Wash skin immediately if contact occurs"
        ],
        responsiblePerson: "Concreter",
        complianceCodes: ["WHS Act 2011", "AS 3600:2018"]
      }
    ],
    safetyMeasures: [
      {
        category: "Chemical Protection",
        measures: ["Wear waterproof clothing", "Use eye protection", "Have eyewash station available"],
        equipment: ["Waterproof gloves", "Safety glasses", "Eyewash station"],
        procedures: ["Emergency treatment for concrete burns"]
      }
    ]
  },

  // ADDITIONAL COMPREHENSIVE ACTIVITIES
  "Steel frame erection": {
    risks: [
      {
        hazard: "Falls from height during steel erection",
        riskLevel: "extreme",
        controlMeasures: [
          "Use fall arrest systems at all times",
          "Install safety mesh and edge protection",
          "Use crane-operated man baskets where appropriate",
          "Implement controlled access zones"
        ],
        responsiblePerson: "Steel Erector",
        complianceCodes: ["AS/NZS 1891.1:2007", "AS 4100:2020"]
      },
      {
        hazard: "Crane and rigging hazards",
        riskLevel: "high",
        controlMeasures: [
          "Use qualified crane operators and riggers",
          "Conduct pre-lift planning meetings",
          "Establish exclusion zones under loads",
          "Use tag lines to control load movement"
        ],
        responsiblePerson: "Lifting Supervisor",
        complianceCodes: ["AS 2550:2011", "AS/NZS 4991:2004"]
      }
    ],
    safetyMeasures: [
      {
        category: "Height Safety",
        measures: ["Install permanent anchor points", "Use dual lanyard systems", "Conduct rescue planning"],
        equipment: ["Fall arrest harness", "Dual lanyards", "Rescue equipment"],
        procedures: ["Fall protection plan", "Emergency rescue procedure"]
      }
    ]
  },

  "Welding operations": {
    risks: [
      {
        hazard: "Arc eye and skin burns from welding",
        riskLevel: "high",
        controlMeasures: [
          "Use appropriate welding helmets and protective clothing",
          "Ensure adequate ventilation in work area",
          "Use welding screens to protect nearby workers",
          "Follow hot work permit procedures"
        ],
        responsiblePerson: "Qualified Welder",
        complianceCodes: ["AS/NZS 1554:2014", "AS 1674.1:1997"]
      }
    ],
    safetyMeasures: [
      {
        category: "Welding Safety",
        measures: ["Use auto-darkening helmets", "Wear flame-resistant clothing", "Provide adequate ventilation"],
        equipment: ["Welding helmet", "Leather welding jacket", "Ventilation equipment"],
        procedures: ["Hot work permit", "Fire watch procedures"]
      }
    ]
  },

  "Excavation work": {
    risks: [
      {
        hazard: "Cave-in of excavation walls",
        riskLevel: "extreme",
        controlMeasures: [
          "Conduct soil assessment before excavation",
          "Install appropriate shoring or battering",
          "Keep excavated material away from edges",
          "Provide safe access and egress"
        ],
        responsiblePerson: "Excavation Supervisor",
        complianceCodes: ["AS 3798:2007", "WHS Regulation 2011"]
      },
      {
        hazard: "Contact with underground utilities",
        riskLevel: "extreme",
        controlMeasures: [
          "Obtain utility location plans before digging",
          "Use hand digging near marked utilities",
          "Use non-destructive location methods",
          "Have emergency contact numbers available"
        ],
        responsiblePerson: "Site Supervisor",
        complianceCodes: ["AS/NZS 5488:2013"]
      }
    ],
    safetyMeasures: [
      {
        category: "Excavation Safety",
        measures: ["Daily inspection of excavations", "Competent person supervision", "Emergency response plan"],
        equipment: ["Shoring materials", "Safety barriers", "Communication equipment"],
        procedures: ["Excavation inspection checklist", "Emergency response procedure"]
      }
    ]
  },

  "Asbestos removal": {
    risks: [
      {
        hazard: "Inhalation of asbestos fibres",
        riskLevel: "extreme",
        controlMeasures: [
          "Use Class A licensed asbestos removalists only",
          "Implement full containment procedures",
          "Use appropriate respiratory protection",
          "Conduct air monitoring throughout work"
        ],
        responsiblePerson: "Licensed Asbestos Removalist",
        complianceCodes: ["WHS Regulation 2011", "How to Safely Remove Asbestos Code of Practice"]
      }
    ],
    safetyMeasures: [
      {
        category: "Asbestos Protection",
        measures: ["Full enclosure systems", "Negative pressure units", "Decontamination facilities"],
        equipment: ["P1/P2 respirators", "Disposable coveralls", "Air monitoring equipment"],
        procedures: ["Asbestos management plan", "Decontamination procedure", "Waste disposal procedure"]
      }
    ]
  },

  "Roof work": {
    risks: [
      {
        hazard: "Falls through fragile roof surfaces",
        riskLevel: "extreme",
        controlMeasures: [
          "Install safety mesh under fragile surfaces",
          "Use roof ladders and crawl boards",
          "Implement fall arrest systems",
          "Restrict access to roof edges"
        ],
        responsiblePerson: "Roofing Supervisor",
        complianceCodes: ["AS/NZS 1891.1:2007", "AS 1562:2018"]
      }
    ],
    safetyMeasures: [
      {
        category: "Roof Safety",
        measures: ["Pre-work roof inspection", "Weather monitoring", "Emergency rescue planning"],
        equipment: ["Safety mesh", "Roof ladders", "Industrial rope access equipment"],
        procedures: ["Roof work plan", "Weather monitoring procedure"]
      }
    ]
  }
};

export async function generateAutoSwms(activities: string[], tradeType: string) {
  const risks: any[] = [];
  const safetyMeasures: any[] = [];
  const complianceCodes: string[] = [];

  // Process each selected activity
  for (const activity of activities) {
    const activityData = ACTIVITY_RISK_DATABASE[activity as keyof typeof ACTIVITY_RISK_DATABASE];
    
    if (activityData) {
      // Add risks for this activity
      risks.push(...activityData.risks);
      
      // Add safety measures for this activity
      safetyMeasures.push(...activityData.safetyMeasures);
      
      // Collect compliance codes
      activityData.risks.forEach(risk => {
        risk.complianceCodes.forEach((code: string) => {
          if (!complianceCodes.includes(code)) {
            complianceCodes.push(code);
          }
        });
      });
    }
  }

  // Add trade-specific compliance codes
  const tradeSpecificCodes = getTradeSpecificCodes(tradeType);
  tradeSpecificCodes.forEach(code => {
    if (!complianceCodes.includes(code)) {
      complianceCodes.push(code);
    }
  });

  return {
    risks,
    safetyMeasures,
    complianceCodes
  };
}

function getTradeSpecificCodes(tradeType: string): string[] {
  const tradeCodes: { [key: string]: string[] } = {
    "Electrical": ["AS/NZS 3000:2018", "AS/NZS 3012:2010"],
    "Plumbing": ["AS/NZS 3500:2021", "AS 2885:2007"],
    "Carpentry": ["AS 1684:2010", "AS/NZS 1170:2002"],
    "Roofing": ["AS/NZS 1891.1:2007", "AS 1562:2018"],
    "Demolition": ["AS 2601:2001", "AS/NZS 1892.1:2013"],
    "Concrete Work": ["AS 3600:2018", "AS 1379:2007"],
    "Steelwork": ["AS 4100:2020", "AS/NZS 1554:2014"],
    "Painting": ["AS/NZS 2311:2009", "AS 4548:2014"],
    "Landscaping": ["AS 4970:2009", "AS/NZS 3500.1:2021"],
    "Bricklaying": ["AS 3700:2018", "AS/NZS 4455:2018"],
    "Tiling": ["AS 3958.1:2007", "AS/NZS 3740:2021"],
    "HVAC": ["AS 1668.2:2012", "AS/NZS 3000:2018"],
    "Glazing": ["AS 1288:2021", "AS 2047:2014"],
    "Flooring": ["AS/NZS 1080:2012", "AS 1884:2012"],
    "Insulation": ["AS/NZS 4859.1:2018", "AS 3999:2015"],
    "Security Systems": ["AS 2201.1:2007", "AS 1670.1:2018"],
    "Earthworks": ["AS 3798:2007", "AS/NZS 2566.1:2019"],
    "Fire Protection": ["AS 2118.1:2017", "AS 1851:2012"],
    "Scaffolding": ["AS/NZS 4576:1995", "AS/NZS 1891.4:2009"],
    "Communications": ["AS/CA S009:2013", "AS/NZS 3080:2013"],
    "Pool Construction": ["AS 1926.1:2012", "AS 1926.2:2007"],
    "Solar & Renewable": ["AS/NZS 5033:2021", "AS/NZS 2712:2007"]
  };

  return tradeCodes[tradeType] || ["WHS Act 2011", "WHS Regulation 2011"];
}