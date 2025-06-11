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
    // Enable demo mode for testing - remove this line for production
    return generateDemoSWMSData(request);

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert Australian construction safety consultant specializing in SWMS generation. 
          
Generate comprehensive, compliant SWMS data including:
- Detailed work activities with step-by-step breakdowns
- Complete hazard identification and risk assessments
- Appropriate control measures following hierarchy of controls
- Required PPE and tools for each activity
- Plant and equipment specifications with safety requirements
- Emergency procedures and response protocols

Follow Australian WHS legislation and industry best practices. Ensure risk ratings are realistic and control measures are practical and enforceable.

Return response in the following JSON format:
{
  "activities": [
    {
      "name": "Activity name",
      "description": "Detailed description",
      "hazards": [
        {
          "type": "Hazard category",
          "description": "Specific hazard description",
          "riskRating": "Low|Medium|High|Critical",
          "controlMeasures": ["Control measure 1", "Control measure 2"],
          "residualRisk": "Low|Medium|High|Critical"
        }
      ],
      "ppe": ["PPE item 1", "PPE item 2"],
      "tools": ["Tool 1", "Tool 2"],
      "trainingRequired": ["Training requirement 1"]
    }
  ],
  "plantEquipment": [
    {
      "name": "Equipment name",
      "type": "Equipment|Plant|Vehicle",
      "category": "Category",
      "certificationRequired": true/false,
      "inspectionStatus": "Current|Overdue|Required",
      "riskLevel": "Low|Medium|High|Critical",
      "safetyRequirements": ["Requirement 1"]
    }
  ],
  "emergencyProcedures": [
    {
      "scenario": "Emergency scenario",
      "response": "Response procedure",
      "contacts": ["Emergency contact info"]
    }
  ]
}`
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

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as GeneratedSWMSData;

  } catch (error: any) {
    console.error('Error generating SWMS data:', error);
    throw new Error(`Failed to generate SWMS data: ${error?.message || 'Unknown error'}`);
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