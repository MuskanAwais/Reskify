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
    specialRiskFactors?: string[]; // Legacy field for compatibility
    hrcwCategories?: number[]; // High-Risk Construction Work categories (1-18)
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
    console.log('Generating SWMS with Riskify AI...');
    console.log(`🔍 TRADE TYPE: "${request.projectDetails.tradeType}"`);
    console.log(`🔍 JOB DESCRIPTION: "${request.plainTextDescription}"`);
      
    // Extract enhanced safety data
    const tradeName = request.projectDetails.tradeType;
    const state = request.projectDetails.state || 'NSW';
    const siteEnvironment = request.projectDetails.siteEnvironment || 'standard';
    const hrcwCategories = request.projectDetails.hrcwCategories || [];
    
    // State-specific legislation references
    const stateRegulations: { [key: string]: string } = {
      'NSW': 'NSW WHS Act 2011, WHS Regulation 2017, SafeWork NSW guidelines',
      'VIC': 'Victorian OHS Act 2004, OHS Regulations 2017, WorkSafe Victoria requirements', 
      'QLD': 'QLD WHS Act 2011, WHS Regulation 2011, Workplace Health and Safety Queensland',
      'WA': 'WA OSH Act 1984, OSH Regulations 1996, WorkSafe Western Australia',
      'SA': 'SA WHS Act 2012, WHS Regulations 2012, SafeWork SA requirements',
      'TAS': 'TAS WHS Act 2012, WHS Regulations 2012, WorkSafe Tasmania',
      'ACT': 'ACT WHS Act 2011, WHS Regulation 2011, WorkSafe ACT',
      'NT': 'NT WHS Act 2019, WHS Regulations 2019, NT WorkSafe'
    };

    // Create site-specific safety context
    const siteContext = siteEnvironment === 'commercial' 
      ? 'Commercial site with heightened safety protocols, public access considerations, and business continuity requirements'
      : siteEnvironment === 'residential'
      ? 'Residential site with occupant safety, noise restrictions, and limited space considerations'
      : siteEnvironment === 'industrial'
      ? 'Industrial site with specialized hazards, machinery interfaces, and process safety requirements'
      : 'Standard construction site with general safety protocols';

    // Create HRCW context if categories are selected
    const hrcwMap: { [key: number]: string } = {
      1: "Fall risk >2m - Include scaffolding, ladders, height work tasks with fall protection",
      2: "Telecommunication tower - Include tower climbing, antenna work with specialized access",
      3: "Load-bearing demolition - Include structural assessment, temporary support systems",
      4: "Asbestos disturbance - Include containment, licensed removal procedures",
      5: "Structural alterations - Include temporary support, engineering assessment",
      6: "Confined spaces - Include entry procedures, atmosphere testing, rescue plans",
      7: "Excavation >1.5m - Include trenching, shoring, cave-in protection",
      8: "Explosives - Include blasting procedures, exclusion zones",
      9: "Pressurised gas - Include isolation, pressure testing procedures",
      10: "Chemical/fuel lines - Include isolation, spill containment",
      11: "Live electrical - Include isolation procedures, lockout/tagout",
      12: "Contaminated atmosphere - Include air monitoring, ventilation",
      13: "Tilt-up/precast concrete - Include crane operations, lifting procedures",
      14: "Traffic corridors - Include traffic management, signage",
      15: "Mobile plant - Include segregation, spotters, communication",
      16: "Extreme temperatures - Include thermal protection, monitoring",
      17: "Water/drowning risk - Include rescue equipment, barriers",
      18: "Live conductors - Include specialized PPE, clearance distances"
    };

    let prompt = '';
    
    if (request.mode === 'task' && request.taskList && request.taskList.length > 0) {
      // Task Mode: Generate SWMS for specific tasks
      const taskListText = request.taskList.join(', ');
      prompt = `Generate SWMS for these ${tradeName} tasks: ${taskListText}`;
    } else {
      // Job Mode: Generate SWMS for the entire job description
      const jobDescription = request.plainTextDescription || `${tradeName} work`;
      prompt = `Generate SWMS tasks for a ${tradeName} doing: "${jobDescription}"`;
    }

    console.log(`🔍 FINAL PROMPT INPUTS - Trade: ${tradeName}, Job: ${request.plainTextDescription}`);
    console.log(`🔍 SITE ENVIRONMENT: ${siteEnvironment}, STATE: ${state}, HRCW: ${hrcwCategories.join(',')}`);

    // Enhanced system message with safety context
    const systemMessage = `You are Riskify, an Australian construction safety expert specializing in ${state} regulations. YOU MUST ONLY GENERATE TASKS FOR THE SPECIFIED TRADE.

SITE CONTEXT: ${siteContext}
STATE COMPLIANCE: ${stateRegulations[state] || stateRegulations['NSW']}

CRITICAL: If you generate ANY tasks outside the specified trade's scope, you are FAILING your job.

TRADE BOUNDARY ENFORCEMENT:
- Tiling & Waterproofing: ONLY tile work, waterproofing, surface prep, grouting, sealing
- Electrical: ONLY electrical installation, wiring, testing, compliance  
- Plumbing: ONLY pipe work, fixtures, pressure testing, commissioning
- Carpentry: ONLY timber work, fixing, finishing, hardware

ABSOLUTELY FORBIDDEN FOR ALL TRADES:
- Concrete work (unless you're a Concreter)
- Framing/structural work (unless you're a Carpenter doing timber framing)
- Site preparation (unless specifically part of the trade's prep work)
- Heavy machinery (unless the trade specifically operates it)
- Fencing installation (unless you're a Fencing contractor)

SITE-SPECIFIC SAFETY ENHANCEMENTS:
${siteEnvironment === 'commercial' ? `- Public safety and access management during work
- Business continuity and minimal disruption protocols
- Professional appearance and client interaction standards
- Commercial-grade materials and finishes required
- Compliance with commercial building codes and standards` : ''}
${siteEnvironment === 'residential' ? `- Occupant safety and privacy considerations
- Noise and dust control for inhabited spaces
- Protection of existing fixtures and furnishings
- Limited working hours and access restrictions
- Residential-grade materials and aesthetic standards` : ''}
${siteEnvironment === 'industrial' ? `- Integration with existing industrial processes
- Specialized hazard identification and control
- Compliance with industry-specific standards
- Coordination with facility shutdown schedules
- Industrial-grade materials and performance requirements` : ''}

VALIDATION: Before including ANY task, ask "Does this specific trade personally do this work with their standard tools?" If NO, DELETE the task.

Return structured JSON format:
{
  "activities": [
    {
      "name": "Task name",
      "description": "Brief description", 
      "riskScore": 12,
      "residualRisk": 6,
      "legislation": "WHS Act 2011",
      "hazards": [
        {
          "type": "Trade-specific hazard type",
          "description": "Risk description",
          "riskRating": 15,
          "controlMeasures": ["Control 1", "Control 2", "Control 3"],
          "residualRisk": 5
        }
      ],
      "ppe": ["Trade-appropriate PPE"],
      "tools": ["Trade-specific tools"],
      "trainingRequired": ["Trade-specific training"]
    }
  ],
  "plantEquipment": [],
  "emergencyProcedures": []
}

MANDATORY: Generate 6-8 tasks that are EXCLUSIVELY within the specified trade's scope of work. Focus on trade-specific preparation, installation, testing, and completion tasks. Each task needs 4-5 hazards with controls. Risk scores: 1-5=Low, 6-10=Medium, 11-15=High, 16-20=Extreme. Australian WHS compliance. JSON only.`;

    // Enhanced user message with safety context
    const userMessage = `ENHANCED SAFETY CONTEXT:
SITE TYPE: ${siteEnvironment.toUpperCase()} - Apply ${siteEnvironment}-specific safety protocols and considerations
STATE: ${state} - Follow ${stateRegulations[state] || stateRegulations['NSW']} requirements

${hrcwCategories.length > 0 ? `
HIGH-RISK CONSTRUCTION WORK IDENTIFIED: Categories ${hrcwCategories.join(', ')}
User has specifically selected these HRCW categories. Ensure ALL generated tasks incorporate enhanced safety measures for:
${hrcwCategories.map(id => `- Category ${id}: ${hrcwMap[id] || 'High-risk work requiring specialized procedures'}`).join('\n')}

MANDATORY: Every task must address how it relates to these HRCW categories with specific control measures.
` : ''}

JOB DESCRIPTION: ${prompt}

TRADE-SPECIFIC REQUIREMENT: Generate 6-8 tasks that ONLY a ${tradeName} would personally perform for this job.

FINAL VALIDATION CHECK: Before submitting your response, review EVERY SINGLE TASK and ask:
1. "Does a ${tradeName} personally do this with their standard tools?" 
2. "Would this task require a different trade license or skills?"
3. "Is this concrete, framing, fencing, or general construction work?"

If ANY task fails these checks, DELETE IT IMMEDIATELY. 

ABSOLUTE REQUIREMENT: Generate ONLY ${tradeName === 'Tiling & Waterproofing' ? 'tiling, waterproofing, surface preparation, grouting, and sealing' : 'trade-specific'} tasks. NO exceptions. NO general construction. NO other trades.`;

    console.log(`🔍 SENDING ENHANCED PROMPT WITH SAFETY OPTIONS`);

    // Create promise with timeout
    const apiCall = openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    // Timeout implementation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 30000);
    });

    const response = await Promise.race([apiCall, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion;
    
    console.log(`🔍 RAW AI RESPONSE: ${response.choices[0]?.message?.content?.substring(0, 200)}...`);
    
    if (!response.choices[0]?.message?.content) {
      throw new Error('No content received from OpenAI API');
    }

    const responseContent = response.choices[0].message.content;
    
    // Parse JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseContent);
      console.log(`🔍 PARSED RESULT: ${JSON.stringify(parsedResult).substring(0, 200)}...`);
    } catch (error) {
      console.error('Failed to parse OpenAI response as JSON:', error);
      console.error('Raw response:', responseContent);
      throw new Error('Invalid JSON response from AI');
    }
    
    // Handle different response formats
    let activities = [];
    if (parsedResult.activities) {
      activities = parsedResult.activities;
    } else if (parsedResult.tasks) {
      // Convert tasks format to activities format
      activities = parsedResult.tasks.map((task: any) => ({
        name: task.task || task.name || 'Generated Task',
        description: task.description || 'AI-generated task description',
        riskScore: 8,
        residualRisk: 4,
        legislation: `${state} WHS Act 2011`,
        hazards: [{
          type: "General",
          description: "Standard workplace hazards",
          riskRating: 6,
          controlMeasures: ["Follow safety procedures", "Use appropriate PPE"],
          residualRisk: 3
        }],
        ppe: ["Hard hat", "Safety glasses", "Steel cap boots"],
        tools: ["Standard trade tools"],
        trainingRequired: ["Trade specific training"]
      }));
    } else {
      throw new Error('No activities or tasks found in AI response');
    }

    console.log(`🔍 FINAL ACTIVITIES COUNT: ${activities.length}`);
    console.log(`🔍 FIRST ACTIVITY: ${activities[0]?.name || 'None'}`);
    
    // Return the formatted result
    return {
      activities: activities,
      plantEquipment: parsedResult.plantEquipment || [],
      emergencyProcedures: parsedResult.emergencyProcedures || []
    };
    
  } catch (error) {
    console.error('Error generating SWMS:', error);
    throw error;
  }
}