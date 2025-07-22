import OpenAI from "openai";

// Initialize OpenAI client - will be undefined if no API key
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : undefined;

export interface TaskGenerationRequest {
  taskName?: string;
  projectDetails: {
    projectName: string;
    location: string;
    tradeType: string;
    description?: string;
    siteEnvironment?: string;
    specialRiskFactors?: string[];
    hrcwCategories?: number[];
    state?: string;
  };
  plainTextDescription?: string;
  taskList?: string[];
  mode?: 'job' | 'task';
}

export interface GeneratedSWMSData {
  activities: Array<{
    name: string;
    description: string;
    riskScore: number;
    residualRisk: number;
    legislation: string;
    hazards: Array<{
      type: string;
      description: string;
      riskRating: number;
      controlMeasures: string[];
      residualRisk: number;
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
    console.log('🔍 SWMS generation request received:', request);
    console.log(`🔍 TRADE TYPE: "${request.projectDetails.tradeType}"`);
    console.log(`🔍 JOB DESCRIPTION: "${request.plainTextDescription}"`);

    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const tradeName = request.projectDetails.tradeType;
    const jobDescription = request.plainTextDescription || 'General construction work';

    console.log(`🔍 FINAL PROMPT INPUTS - Trade: ${tradeName}, Job: ${jobDescription}`);

    // Simple, direct prompt that matches what worked in ChatGPT
    const prompt = `Generate SWMS tasks for a ${tradeName} doing: "${jobDescription}"

ONLY generate tasks that a ${tradeName} tradesperson would personally perform with their standard tools.

NO concrete work, NO framing, NO general construction, NO fencing.

For ${tradeName === 'Tiling & Waterproofing' ? 'tiling jobs' : tradeName + ' jobs'}, generate ONLY:
${tradeName === 'Tiling & Waterproofing' ? `
- Surface preparation and cleaning
- Waterproofing membrane application  
- Tile measurement and cutting
- Tile adhesive application and laying
- Grouting and sealing
- Quality checks and finishing` : `
- Trade-specific preparation
- Material installation using trade tools
- Testing and quality checks
- Trade-specific cleanup`}

Generate 6 tasks in JSON format.`;

    console.log(`🔍 SENDING PROMPT: ${prompt.substring(0, 200)}...`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an Australian construction safety expert. Generate ONLY trade-specific tasks. Return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const rawContent = response.choices[0].message.content || '{}';
    console.log(`🔍 RAW AI RESPONSE: ${rawContent.substring(0, 300)}...`);

    const result = JSON.parse(rawContent);
    console.log(`🔍 PARSED RESULT:`, result);

    // Handle different response formats
    let activities = [];
    if (result.activities) {
      activities = result.activities;
    } else if (result.tasks) {
      // Convert tasks format to activities format
      activities = result.tasks.map((task: any) => ({
        name: task.taskName || task.task || task.name || 'Unknown Task',
        description: task.description || '',
        riskScore: 8,
        residualRisk: 4,
        legislation: 'WHS Act 2011',
        hazards: [{
          type: 'General',
          description: 'Standard workplace hazards',
          riskRating: 6,
          controlMeasures: ['Follow safety procedures', 'Use appropriate PPE'],
          residualRisk: 3
        }],
        ppe: ['Hard hat', 'Safety glasses', 'Steel cap boots'],
        tools: task.toolsRequired || ['Standard trade tools'],
        trainingRequired: ['Trade specific training']
      }));
    }

    console.log(`🔍 FINAL ACTIVITIES COUNT: ${activities.length}`);
    if (activities.length > 0) {
      console.log(`🔍 FIRST ACTIVITY: ${activities[0].name}`);
    }

    return {
      activities: activities,
      plantEquipment: result.plantEquipment || [],
      emergencyProcedures: result.emergencyProcedures || []
    };

  } catch (error: any) {
    console.error('❌ OpenAI generation error:', error.message);
    throw new Error(`Failed to generate SWMS: ${error.message}`);
  }
}