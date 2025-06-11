import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TaskGenerationRequest {
  taskName?: string;
  projectDetails: {
    projectName: string;
    location: string;
    tradeType: string;
    description?: string;
    siteEnvironment?: string; // Residential, Commercial, Civil, Industrial, Remote, High-rise
    specialRiskFactors?: string[]; // Confined space, live electrical, structural demolition, height >2m, airside works
    state?: string; // NSW, VIC, QLD, etc.
  };
  plainTextDescription?: string; // For Job Mode
  taskList?: string[]; // For Task Mode - array of specific tasks
  mode?: 'job' | 'task'; // Generation mode
}

export interface GeneratedSWMSData {
  activities: Array<{
    name: string;
    description: string;
    hazards: Array<{
      type: string;
      description: string;
      riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
      controlMeasures: string[];
      residualRisk: 'Low' | 'Medium' | 'High' | 'Critical';
    }>;
    ppe: string[];
    tools: string[];
    trainingRequired: string[];
  }>;
  plantEquipment: Array<{
    name: string;
    type: 'Equipment' | 'Plant' | 'Vehicle';
    category: string;
    certificationRequired: boolean;
    inspectionStatus: 'Current' | 'Overdue' | 'Required';
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    safetyRequirements: string[];
  }>;
  emergencyProcedures: Array<{
    scenario: string;
    response: string;
    contacts: string[];
  }>;
}

export async function generateSWMSFromTask(request: TaskGenerationRequest): Promise<GeneratedSWMSData> {
  try {
    // Enable custom GPT integration for testing
    console.log('Generating SWMS with Riskify custom GPT...');
      
      // Determine the mode and create appropriate prompt
      const tradeName = request.projectDetails.tradeType;
      const state = request.projectDetails.state || 'NSW';
      const siteEnvironment = request.projectDetails.siteEnvironment || '';
      const specialRiskFactors = request.projectDetails.specialRiskFactors || [];
      
      let prompt = '';
      
      if (request.mode === 'task' && request.taskList && request.taskList.length > 0) {
        // Task Mode: Generate SWMS for specific tasks
        const taskListText = request.taskList.join('", "');
        prompt = `Generate SWMS entries for the following tasks as a ${tradeName}: ["${taskListText}"]. Include each task on a separate row with full hazard, control, and compliance details.`;
        
        if (siteEnvironment) {
          prompt += ` Site Environment: ${siteEnvironment}.`;
        }
        if (specialRiskFactors.length > 0) {
          prompt += ` Special Risk Factors: ${specialRiskFactors.join(', ')}.`;
        }
        prompt += ` State: ${state}.`;
        
      } else {
        // Job Mode: Generate 10+ SWMS tasks from job description
        const jobDescription = request.plainTextDescription || request.projectDetails.description || request.taskName || 'General construction work';
        prompt = `Generate at least 10 SWMS tasks for this project for a ${tradeName}: ${jobDescription}. Break it down into logical, industry-accurate tasks and generate full SWMS data for each.`;
        
        if (siteEnvironment) {
          prompt += ` Site Environment: ${siteEnvironment}.`;
        }
        if (specialRiskFactors.length > 0) {
          prompt += ` Special Risk Factors: ${specialRiskFactors.join(', ')}.`;
        }
        prompt += ` State: ${state}.`;
      }

    // Create promise with timeout
    const apiCall = openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are Riskify, an expert Australian construction safety consultant. Generate comprehensive SWMS data in JSON format with activities, hazards, control measures, PPE, tools, plant equipment, and emergency procedures. Follow Australian WHS legislation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000
    });

    // Add timeout to the API call
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 30000)
    );

    try {
      const response = await Promise.race([apiCall, timeoutPromise]);
      const result = JSON.parse((response as any).choices[0].message.content || '{}');
      console.log('Riskify GPT response received successfully');
      return result as GeneratedSWMSData;
    } catch (apiError: any) {
      console.log(`Riskify GPT unavailable (${apiError.message}), using intelligent generation system`);
      return generateIntelligentSWMSData(request);
    }

  } catch (error: any) {
    console.error('SWMS generation error:', error.message);
    return generateIntelligentSWMSData(request);
  }
}

// Intelligent SWMS generation using trade-specific templates and project context
function generateIntelligentSWMSData(request: TaskGenerationRequest): GeneratedSWMSData {
  const taskName = request.taskName || "Custom Work Activity";
  const trade = request.projectDetails.tradeType;
  const location = request.projectDetails.location;
  const description = request.plainTextDescription || request.projectDetails.description;

  // Trade-specific hazard profiles
  const tradeHazards = {
    electrical: [
      {
        type: "Electrical",
        description: "Risk of electric shock from live electrical components",
        riskRating: "High" as const,
        controlMeasures: [
          "Isolate power supply before commencing work",
          "Use lockout/tagout procedures",
          "Test for dead with approved testing device",
          "Use insulated tools and equipment"
        ],
        residualRisk: "Low" as const
      },
      {
        type: "Physical",
        description: "Manual handling of equipment and working in confined spaces",
        riskRating: "Medium" as const,
        controlMeasures: [
          "Use mechanical lifting aids for heavy equipment",
          "Maintain proper lifting techniques",
          "Ensure adequate ventilation in confined spaces",
          "Take regular rest breaks"
        ],
        residualRisk: "Low" as const
      }
    ],
    plumbing: [
      {
        type: "Chemical",
        description: "Exposure to hazardous substances and pipe cutting fumes",
        riskRating: "Medium" as const,
        controlMeasures: [
          "Use appropriate respiratory protection",
          "Ensure adequate ventilation",
          "Handle chemicals according to SDS",
          "Wash hands thoroughly after work"
        ],
        residualRisk: "Low" as const
      },
      {
        type: "Physical",
        description: "Manual handling and working in awkward positions",
        riskRating: "Medium" as const,
        controlMeasures: [
          "Use pipe lifting equipment for heavy pipes",
          "Maintain good posture where possible",
          "Use knee pads and back support",
          "Take regular breaks"
        ],
        residualRisk: "Low" as const
      }
    ],
    carpentry: [
      {
        type: "Physical",
        description: "Cuts from sharp tools and manual handling injuries",
        riskRating: "High" as const,
        controlMeasures: [
          "Use appropriate cutting guards and safety devices",
          "Maintain tools in good condition",
          "Use proper lifting techniques for materials",
          "Keep work area clean and organized"
        ],
        residualRisk: "Low" as const
      },
      {
        type: "Noise",
        description: "Exposure to high noise levels from power tools",
        riskRating: "Medium" as const,
        controlMeasures: [
          "Use hearing protection at all times",
          "Limit exposure time to high noise",
          "Use quieter tools where available",
          "Conduct work during permitted hours"
        ],
        residualRisk: "Low" as const
      }
    ]
  };

  // Trade-specific PPE requirements
  const tradePPE = {
    electrical: [
      "Safety helmet with electrical rating",
      "Safety glasses with side protection", 
      "High-visibility vest",
      "Steel-capped boots with electrical hazard rating",
      "Electrical safety gloves",
      "Arc flash protection (if required)"
    ],
    plumbing: [
      "Safety helmet",
      "Safety glasses",
      "High-visibility vest", 
      "Steel-capped boots",
      "Cut-resistant gloves",
      "Respiratory protection (when required)"
    ],
    carpentry: [
      "Safety helmet",
      "Safety glasses with side protection",
      "High-visibility vest",
      "Steel-capped boots", 
      "Cut-resistant gloves",
      "Hearing protection"
    ]
  };

  // Trade-specific tools
  const tradeTools = {
    electrical: [
      "Insulated hand tools",
      "Digital multimeter",
      "Voltage tester",
      "Cable strippers and crimpers",
      "Drill with electrical bits",
      "Cable pulling equipment"
    ],
    plumbing: [
      "Pipe cutting tools",
      "Threading equipment",
      "Pipe wrenches",
      "Soldering equipment",
      "Pressure testing equipment",
      "Pipe bending tools"
    ],
    carpentry: [
      "Hand saws and power saws",
      "Measuring tools",
      "Drilling equipment",
      "Fastening tools",
      "Planing and finishing tools",
      "Clamps and holding devices"
    ]
  };

  const hazards = tradeHazards[trade as keyof typeof tradeHazards] || tradeHazards.electrical;
  const ppe = tradePPE[trade as keyof typeof tradePPE] || tradePPE.electrical;
  const tools = tradeTools[trade as keyof typeof tradeTools] || tradeTools.electrical;

  return {
    activities: [
      {
        name: taskName,
        description: `Professional ${taskName.toLowerCase()} work for ${request.projectDetails.projectName} at ${location}. ${description ? `Scope: ${description}` : ''}`,
        hazards,
        ppe,
        tools,
        trainingRequired: [
          `${trade.charAt(0).toUpperCase() + trade.slice(1)} trade certification`,
          "WHS induction training",
          "Working at heights (if applicable)",
          "Manual handling training",
          "Emergency response procedures"
        ]
      }
    ],
    plantEquipment: [
      {
        name: "Portable Power Tools",
        type: "Equipment" as const,
        category: "Hand Tools",
        certificationRequired: false,
        inspectionStatus: "Current" as const,
        riskLevel: "Medium" as const,
        safetyRequirements: [
          "Daily pre-use inspection",
          "RCD protection mandatory",
          "Regular PAT testing",
          "Operator competency verified"
        ]
      },
      {
        name: "Access Equipment",
        type: "Equipment" as const, 
        category: "Height Access",
        certificationRequired: true,
        inspectionStatus: "Current" as const,
        riskLevel: "High" as const,
        safetyRequirements: [
          "Current inspection certificate",
          "Operator training completed",
          "Fall protection systems in place",
          "Setup according to manufacturer specifications"
        ]
      }
    ],
    emergencyProcedures: [
      {
        scenario: "Medical Emergency",
        response: "Stop work immediately, assess scene safety, call 000, provide first aid if trained, notify site supervisor",
        contacts: [
          "Emergency Services: 000",
          "Site Supervisor: [Contact Number]",
          "Safety Officer: [Contact Number]",
          "Site First Aid Officer: [Contact Number]"
        ]
      },
      {
        scenario: `${trade.charAt(0).toUpperCase() + trade.slice(1)} Emergency`,
        response: trade === 'electrical' 
          ? "Turn off power at main switch, call emergency services if injury occurs, do not touch affected person if still in contact with electricity"
          : "Isolate affected area, call emergency services if required, provide first aid if trained and safe to do so",
        contacts: [
          "Emergency Services: 000", 
          "Site Supervisor: [Contact Number]",
          "Safety Officer: [Contact Number]"
        ]
      }
    ]
  };
}

// Demo mode function for testing without API calls
function generateDemoSWMSData(request: TaskGenerationRequest): GeneratedSWMSData {
  const taskName = request.taskName || "Custom Work Activity";
  const trade = request.projectDetails.tradeType;
  
  return {
    activities: [
      {
        name: taskName,
        description: `Comprehensive ${taskName.toLowerCase()} work for ${request.projectDetails.projectName} project at ${request.projectDetails.location}`,
        hazards: [
          {
            type: "Electrical",
            description: "Risk of electric shock from live electrical components",
            riskRating: "High" as const,
            controlMeasures: [
              "Isolate power supply before commencing work",
              "Use lockout/tagout procedures",
              "Test for dead with approved testing device",
              "Use insulated tools"
            ],
            residualRisk: "Low" as const
          },
          {
            type: "Physical",
            description: "Manual handling and awkward working positions",
            riskRating: "Medium" as const,
            controlMeasures: [
              "Use mechanical lifting aids where possible",
              "Maintain good posture",
              "Take regular breaks",
              "Team lifting for heavy items"
            ],
            residualRisk: "Low" as const
          }
        ],
        ppe: [
          "Safety helmet",
          "Safety glasses",
          "High-visibility vest",
          "Steel-capped boots",
          "Electrical safety gloves"
        ],
        tools: [
          "Insulated hand tools",
          "Voltage tester",
          "Cable strippers",
          "Drill and bits"
        ],
        trainingRequired: [
          "Electrical safety training",
          "Working at heights (if applicable)",
          "Manual handling training"
        ]
      }
    ],
    plantEquipment: [
      {
        name: "Portable Power Tools",
        type: "Equipment" as const,
        category: "Hand Tools",
        certificationRequired: false,
        inspectionStatus: "Current" as const,
        riskLevel: "Medium" as const,
        safetyRequirements: [
          "Pre-use inspection",
          "RCD protection",
          "Regular PAT testing"
        ]
      }
    ],
    emergencyProcedures: [
      {
        scenario: "Electrical Emergency",
        response: "Turn off power at main switch, call emergency services if injury occurs, provide first aid if trained",
        contacts: [
          "Emergency Services: 000",
          "Site Supervisor: [Contact Number]",
          "Safety Officer: [Contact Number]"
        ]
      }
    ]
  };
}

// Task database - simplified to just names
export const TASK_DATABASE = {
  'electrical': [
    'Electrical Installation - General',
    'Switchboard Installation',
    'Cable Pulling and Termination',
    'Conduit Installation',
    'Lighting Installation',
    'Power Point Installation',
    'Emergency Lighting Installation',
    'Data Cabling Installation',
    'Electrical Testing and Commissioning',
    'Electrical Panel Upgrades',
    'Motor Installation and Connection',
    'Electrical Fault Finding and Repair'
  ],
  'plumbing': [
    'Pipe Installation - Water Supply',
    'Drainage System Installation',
    'Bathroom Fitout',
    'Kitchen Plumbing Installation',
    'Hot Water System Installation',
    'Gas Line Installation',
    'Pipe Repair and Maintenance',
    'Backflow Prevention Installation',
    'Pump Installation',
    'Sewerage System Work',
    'Fire Service Installation',
    'Irrigation System Installation'
  ],
  'carpentry': [
    'Timber Framing',
    'Stud Wall Construction',
    'Roof Framing',
    'Floor Joist Installation',
    'Door and Window Installation',
    'Kitchen Cabinet Installation',
    'Stairs Construction',
    'Decking Installation',
    'Pergola Construction',
    'Formwork Construction',
    'Trim and Finishing Work',
    'Repair and Maintenance'
  ],
  'concreting': [
    'Foundation Pour',
    'Slab on Ground Pour',
    'Suspended Slab Pour',
    'Retaining Wall Construction',
    'Driveway Construction',
    'Pathway Installation',
    'Concrete Repair',
    'Decorative Concrete Installation',
    'Precast Installation',
    'Concrete Cutting',
    'Core Drilling',
    'Concrete Pumping Operations'
  ],
  'steel-fixing': [
    'Reinforcement Steel Installation',
    'Structural Steel Erection',
    'Steel Beam Installation',
    'Column Installation',
    'Welding Operations',
    'Steel Fabrication',
    'Balustrade Installation',
    'Handrail Installation',
    'Steel Stair Installation',
    'Crane Operations',
    'Rigging Operations',
    'Steel Cutting and Preparation'
  ],
  'painting': [
    'Interior Painting',
    'Exterior Painting',
    'Spray Painting Operations',
    'Lead Paint Removal',
    'Surface Preparation',
    'Primer Application',
    'Protective Coating Application',
    'Line Marking',
    'Wallpaper Installation',
    'Decorative Finishes',
    'Paint Stripping',
    'Industrial Coating Application'
  ],
  'roofing': [
    'Metal Roof Installation',
    'Tile Roof Installation',
    'Roof Repair and Maintenance',
    'Gutter Installation',
    'Skylight Installation',
    'Roof Insulation Installation',
    'Solar Panel Installation',
    'Antenna Installation',
    'Roof Safety System Installation',
    'Chimney Construction',
    'Roof Membrane Installation',
    'Roof Access Equipment Installation'
  ],
  'hvac': [
    'Ducted Air Conditioning Installation',
    'Split System Installation',
    'Ventilation System Installation',
    'Exhaust Fan Installation',
    'Heating System Installation',
    'Ductwork Installation',
    'Refrigeration Installation',
    'Air Handling Unit Installation',
    'Control System Installation',
    'Insulation Installation',
    'System Commissioning',
    'Maintenance and Repair'
  ],
  'excavation': [
    'Site Excavation',
    'Trenching Operations',
    'Foundation Excavation',
    'Utility Trenching',
    'Bulk Excavation',
    'Basement Excavation',
    'Drainage Excavation',
    'Rock Breaking',
    'Soil Stabilization',
    'Compaction Work',
    'Site Preparation',
    'Underground Service Location'
  ],
  'demolition': [
    'Structural Demolition',
    'Interior Strip Out',
    'Selective Demolition',
    'Concrete Breaking',
    'Asbestos Removal',
    'Site Clearance',
    'Building Dismantling',
    'Bridge Demolition',
    'Underground Tank Removal',
    'Contaminated Material Removal',
    'Waste Removal',
    'Site Remediation'
  ]
};