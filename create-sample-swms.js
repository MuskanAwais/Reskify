// Create sample SWMS documents from watermark discussion period

const sampleSWMSDocuments = [
  {
    id: 201,
    projectName: "Sydney CBD High-Rise Construction",
    projectAddress: "123 George Street, Sydney NSW 2000",
    principalContractor: "Elite Construction Group",
    jobNumber: "SYD-CBD-2025-001",
    tradeType: "High Rise Construction",
    projectDescription: "40-story commercial tower with mixed-use development",
    userId: 999,
    status: "completed",
    createdAt: new Date('2025-06-10'),
    updatedAt: new Date('2025-06-10'),
    workActivities: [
      {
        activity: "Tower Crane Installation & Operation",
        hazards: "Falls from height, Falling objects, Structural failure, Weather exposure",
        initialRisk: "E (20)",
        controlMeasures: "Licensed crane operators, Pre-installation inspections, Load charts compliance, Weather monitoring protocols, Exclusion zones",
        legislation: "WHS Regulation 2017, AS 1418.1, Crane Safety COP 2020, Falls Prevention COP 2021",
        residualRisk: "M (6)"
      },
      {
        activity: "Structural Steel Erection",
        hazards: "Falls from height, Falling objects, Arc welding hazards, Manual handling",
        initialRisk: "H (15)",
        controlMeasures: "Fall protection systems, Safety nets, Welding permits, Mechanical lifting aids, Competent persons",
        legislation: "WHS Regulation 2017, AS/NZS 1891.1, Welding Safety COP 2019, Manual Handling COP 2018",
        residualRisk: "L (4)"
      },
      {
        activity: "Concrete Pumping & Placement",
        hazards: "Pump line failure, Vehicle movement, Concrete burns, Noise exposure",
        initialRisk: "H (12)",
        controlMeasures: "Pump inspections, Traffic management, Chemical-resistant PPE, Hearing protection, Trained operators",
        legislation: "WHS Act 2011, Concrete Pumping COP 2018, Noise Management COP 2020",
        residualRisk: "L (3)"
      }
    ]
  },
  {
    id: 202,
    projectName: "Melbourne Hospital Expansion",
    projectAddress: "456 Collins Street, Melbourne VIC 3000",
    principalContractor: "MedBuild Construction",
    jobNumber: "MEL-HOSP-2025-002",
    tradeType: "Healthcare Construction",
    projectDescription: "5-story hospital wing with specialized medical facilities",
    userId: 999,
    status: "completed",
    createdAt: new Date('2025-06-11'),
    updatedAt: new Date('2025-06-11'),
    workActivities: [
      {
        activity: "Asbestos Removal & Remediation",
        hazards: "Asbestos exposure, Respiratory hazards, Contamination spread",
        initialRisk: "E (25)",
        controlMeasures: "Licensed asbestos removalists, Negative pressure enclosures, Class A PPE, Air monitoring, Decontamination procedures",
        legislation: "WHS Regulation 2017, Asbestos Removal COP 2019, AS 2601:2001",
        residualRisk: "L (3)"
      },
      {
        activity: "Medical Gas Installation",
        hazards: "Gas leaks, Fire/explosion, Working in ceiling spaces, Electrical hazards",
        initialRisk: "H (15)",
        controlMeasures: "Licensed gas fitters, Leak testing procedures, Confined space permits, Hot work permits, Electrical isolation",
        legislation: "AS/NZS 2896, Medical Gas Installation COP 2020, Confined Spaces COP 2019",
        residualRisk: "M (6)"
      },
      {
        activity: "Infection Control Measures",
        hazards: "Cross-contamination, Biological hazards, Chemical exposure",
        initialRisk: "H (12)",
        controlMeasures: "Isolation barriers, HEPA filtration, Chemical-resistant PPE, Waste management protocols",
        legislation: "Infection Control Guidelines 2019, Biosafety Standards AS/NZS 2243",
        residualRisk: "L (4)"
      }
    ]
  },
  {
    id: 203,
    projectName: "Brisbane Infrastructure Upgrade",
    projectAddress: "789 Queen Street, Brisbane QLD 4000",
    principalContractor: "InfraBuild Queensland",
    jobNumber: "BNE-INFRA-2025-003",
    tradeType: "Civil Infrastructure",
    projectDescription: "Underground utilities and road reconstruction project",
    userId: 999,
    status: "completed",
    createdAt: new Date('2025-06-12'),
    updatedAt: new Date('2025-06-12'),
    workActivities: [
      {
        activity: "Underground Service Location",
        hazards: "Striking utilities, Electrocution, Gas leaks, Excavation hazards",
        initialRisk: "E (20)",
        controlMeasures: "Dial before you dig, Service location surveys, Hand digging near services, Emergency response plans",
        legislation: "WHS Regulation 2017, Excavation Work COP 2015, AS 5488:2013",
        residualRisk: "M (6)"
      },
      {
        activity: "Road Closure & Traffic Management",
        hazards: "Vehicle strikes, Public safety, Equipment damage, Communication failures",
        initialRisk: "H (15)",
        controlMeasures: "Traffic management plans, Certified traffic controllers, Barrier systems, Emergency communication protocols",
        legislation: "Traffic Management COP 2019, Road Safety Standards, Emergency Management Procedures",
        residualRisk: "L (4)"
      },
      {
        activity: "Heavy Plant Operations",
        hazards: "Crushing, Rollover, Noise exposure, Visibility issues",
        initialRisk: "H (12)",
        controlMeasures: "Licensed operators, Pre-start inspections, Spotters, Hearing protection, Visibility aids",
        legislation: "WHS Regulation 2017, Plant COP 2019, Noise Management COP 2020",
        residualRisk: "L (3)"
      }
    ]
  },
  {
    id: 204,
    projectName: "Perth Mining Facility Maintenance",
    projectAddress: "321 Hay Street, Perth WA 6000",
    principalContractor: "WestMine Services",
    jobNumber: "PER-MINE-2025-004",
    tradeType: "Mining & Industrial",
    projectDescription: "Maintenance and upgrade of mineral processing equipment",
    userId: 999,
    status: "completed",
    createdAt: new Date('2025-06-13'),
    updatedAt: new Date('2025-06-13'),
    workActivities: [
      {
        activity: "Confined Space Entry - Processing Tanks",
        hazards: "Oxygen deficiency, Toxic gases, Engulfment, Heat stress",
        initialRisk: "E (25)",
        controlMeasures: "Atmospheric testing, Continuous monitoring, Retrieval systems, Emergency response teams, Entry permits",
        legislation: "WHS Regulation 2017, Confined Spaces COP 2019, Mining Safety Standards",
        residualRisk: "M (6)"
      },
      {
        activity: "Chemical Handling & Storage",
        hazards: "Chemical burns, Inhalation, Spills, Fire/explosion",
        initialRisk: "H (15)",
        controlMeasures: "Chemical-resistant PPE, Spill containment, Emergency showers, Ventilation systems, Safe handling procedures",
        legislation: "Dangerous Goods Regulation 2017, Chemical Safety COP 2020, AS 1940:2017",
        residualRisk: "L (4)"
      },
      {
        activity: "Electrical Maintenance - High Voltage",
        hazards: "Electrocution, Arc flash, Burns, Equipment damage",
        initialRisk: "E (20)",
        controlMeasures: "Lockout/tagout procedures, Arc flash PPE, Electrical safety permits, Authorized persons only",
        legislation: "AS/NZS 3000:2018, Electrical Safety Regulation 2013, High Voltage COP 2019",
        residualRisk: "L (3)"
      }
    ]
  },
  {
    id: 205,
    projectName: "Adelaide Stadium Renovation",
    projectAddress: "654 North Terrace, Adelaide SA 5000",
    principalContractor: "SportsBuild Adelaide",
    jobNumber: "ADL-SPORT-2025-005",
    tradeType: "Sports & Entertainment",
    projectDescription: "Major renovation of 50,000 capacity sports stadium",
    userId: 999,
    status: "draft",
    createdAt: new Date('2025-06-14'),
    updatedAt: new Date('2025-06-14'),
    workActivities: [
      {
        activity: "Roof Structure Modifications",
        hazards: "Falls from height, Weather exposure, Structural collapse, Falling objects",
        initialRisk: "E (20)",
        controlMeasures: "Fall protection systems, Weather monitoring, Structural engineering oversight, Safety nets, Exclusion zones",
        legislation: "WHS Regulation 2017, AS/NZS 1891.1, Structural Work COP 2020, Falls Prevention COP 2021",
        residualRisk: "M (6)"
      },
      {
        activity: "Public Area Coordination",
        hazards: "Public interference, Security risks, Emergency access, Crowd management",
        initialRisk: "H (12)",
        controlMeasures: "Security coordination, Public barriers, Emergency protocols, Crowd management plans, Communication systems",
        legislation: "Public Safety Guidelines 2019, Emergency Management Standards, Crowd Control COP 2020",
        residualRisk: "L (4)"
      },
      {
        activity: "Audio-Visual Installation",
        hazards: "Electrical hazards, Working at heights, Heavy lifting, Technology integration",
        initialRisk: "H (15)",
        controlMeasures: "Electrical safety permits, Fall protection, Mechanical lifting aids, Technology specialists, Testing protocols",
        legislation: "AS/NZS 3000:2018, Working at Heights COP 2021, Technology Installation Standards",
        residualRisk: "L (3)"
      }
    ]
  }
];

async function createSampleSWMS() {
  console.log('Creating sample SWMS documents...');
  
  for (const swms of sampleSWMSDocuments) {
    try {
      const response = await fetch('http://localhost:5000/api/swms/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swms)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✓ Created SWMS: ${swms.projectName} (ID: ${result.id})`);
      } else {
        console.error(`✗ Failed to create: ${swms.projectName}`);
      }
    } catch (error) {
      console.error(`Error creating ${swms.projectName}:`, error);
    }
  }
  
  console.log('Sample SWMS creation completed!');
}

createSampleSWMS();