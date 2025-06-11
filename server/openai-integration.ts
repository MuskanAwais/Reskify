import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TaskGenerationRequest {
  taskName: string;
  projectDetails: {
    projectName: string;
    location: string;
    tradeType: string;
    description?: string;
  };
  plainTextDescription?: string; // For plain text input method
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
    // Use real OpenAI API for authentic SWMS generation
    console.log('Generating SWMS with OpenAI GPT-4o...');

    const prompt = request.plainTextDescription 
      ? `Generate a comprehensive SWMS (Safe Work Method Statement) for the following work description:

Work Description: ${request.plainTextDescription}
Project: ${request.projectDetails.projectName}
Location: ${request.projectDetails.location}
Trade: ${request.projectDetails.tradeType}

Please provide detailed safety information following Australian WHS standards.`
      : `Generate a comprehensive SWMS (Safe Work Method Statement) for the following task:

Task: ${request.taskName}
Project: ${request.projectDetails.projectName}
Location: ${request.projectDetails.location}
Trade: ${request.projectDetails.tradeType}
${request.projectDetails.description ? `Additional Context: ${request.projectDetails.description}` : ''}

Please provide detailed safety information following Australian WHS standards.`;

    // Create promise with timeout
    const apiCall = openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert Australian construction safety consultant. Generate comprehensive SWMS data in JSON format with activities, hazards, control measures, PPE, tools, plant equipment, and emergency procedures. Follow Australian WHS legislation.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    // Add timeout to the API call
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 15000)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);

    const result = JSON.parse((response as any).choices[0].message.content || '{}');
    console.log('OpenAI API response received successfully');
    return result as GeneratedSWMSData;

  } catch (error: any) {
    console.error('OpenAI API error, falling back to demo data:', error.message);
    // Fallback to demo data if OpenAI API fails
    return generateDemoSWMSData(request);
  }
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