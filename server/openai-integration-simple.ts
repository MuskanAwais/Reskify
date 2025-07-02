import OpenAI from 'openai';
import { TaskGenerationRequest, GeneratedSWMSData } from './openai-integration';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSWMSFromTaskSimple(request: TaskGenerationRequest): Promise<GeneratedSWMSData> {
  const { projectDetails, plainTextDescription } = request;
  const { tradeType, location, state = 'NSW', siteEnvironment = 'Commercial', hrcwCategories = [] } = projectDetails;
  
  console.log(`🚀 SIMPLE AI GENERATION - Trade: ${tradeType}, Job: ${plainTextDescription}`);
  console.log(`🚀 SITE: ${siteEnvironment}, STATE: ${state}, HRCW: ${hrcwCategories.join(',')}`);

  // Super simplified prompt
  const systemMessage = `Generate 6 realistic ${tradeType} tasks for: "${plainTextDescription}"

Environment: ${siteEnvironment} site in ${state}
HRCW Categories: ${hrcwCategories.join(', ') || 'None selected'}

Return JSON:
{
  "activities": [
    {
      "name": "Task name",
      "description": "Brief description",
      "riskScore": 6,
      "residualRisk": 3,
      "legislation": "${state} WHS Reg 2017",
      "hazards": [
        {
          "type": "Physical",
          "description": "Hazard with cause and consequence",
          "riskRating": 6,
          "controlMeasures": ["Control 1", "Control 2"],
          "residualRisk": 3,
          "causeAgent": "Specific cause",
          "environmentalCondition": "${siteEnvironment} environment",
          "consequence": "Specific injury type"
        }
      ],
      "ppe": ["Hard Hat", "Safety Glasses", "Gloves"],
      "tools": ["Tool name"],
      "trainingRequired": ["Training item"],
      "hrcwReferences": [${hrcwCategories.join(', ') || ''}],
      "permitRequired": ["Permit if needed"]
    }
  ]
}`;

  try {
    console.log(`🚀 SENDING SIMPLE REQUEST WITH TIMEOUT...`);
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI request timed out after 30 seconds')), 30000);
    });
    
    // Race between OpenAI request and timeout
    const response = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: `Generate tasks for ${tradeType} work: ${plainTextDescription}` }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
      timeoutPromise
    ]);

    console.log(`🚀 RECEIVED RESPONSE`);
    
    const responseContent = response.choices[0].message.content;
    let parsedResult;
    
    try {
      // Clean up markdown code blocks if present
      const cleanedContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim();
      parsedResult = JSON.parse(cleanedContent);
      console.log(`🚀 PARSED SUCCESSFULLY - Activities: ${parsedResult.activities?.length || 0}`);
    } catch (error) {
      console.error('JSON Parse Error:', error);
      console.log('Raw response:', responseContent);
      throw new Error('Invalid JSON response from AI');
    }

    // Enhanced activities with trade-specific improvements
    const enhancedActivities = parsedResult.activities.map((activity: any) => ({
      ...activity,
      legislation: activity.legislation || `${state} WHS Regulation 2017`,
      hrcwReferences: hrcwCategories.length > 0 ? hrcwCategories : [],
      hazards: activity.hazards.map((hazard: any) => ({
        ...hazard,
        environmentalCondition: hazard.environmentalCondition || `${siteEnvironment} site environment`,
        causeAgent: hazard.causeAgent || getTradeSpecificCause(activity.name, tradeType),
        consequence: hazard.consequence || getTradeSpecificConsequence(activity.name, tradeType)
      }))
    }));

    return {
      activities: enhancedActivities,
      plantEquipment: getTradeSpecificEquipment(tradeType),
      emergencyProcedures: getBasicEmergencyProcedures()
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

function getTradeSpecificCause(taskName: string, tradeType: string): string {
  if (tradeType.includes('Tiling')) {
    return taskName.toLowerCase().includes('cutting') ? 'tile cutter blade contact' :
           taskName.toLowerCase().includes('grout') ? 'chemical adhesive exposure' :
           'tile installation tool slippage';
  }
  if (tradeType.includes('Electrical')) {
    return 'electrical contact with live conductors';
  }
  if (tradeType.includes('Plumbing')) {
    return 'pressurized pipe system failure';
  }
  return 'tool or equipment malfunction';
}

function getTradeSpecificConsequence(taskName: string, tradeType: string): string {
  if (tradeType.includes('Tiling')) {
    return taskName.toLowerCase().includes('cutting') ? 'laceration to hands/fingers' :
           taskName.toLowerCase().includes('grout') ? 'chemical burns to skin' :
           'musculoskeletal strain';
  }
  if (tradeType.includes('Electrical')) {
    return 'electric shock or electrocution';
  }
  if (tradeType.includes('Plumbing')) {
    return 'scalding or drowning';
  }
  return 'physical injury';
}

function getTradeSpecificEquipment(tradeType: string): any[] {
  if (tradeType.includes('Tiling')) {
    return [
      {
        name: 'Tile Cutting Saw',
        type: 'Equipment',
        category: 'Cutting Tools',
        certificationRequired: false,
        inspectionStatus: 'Current',
        riskLevel: 'Medium',
        safetyRequirements: ['Blade guard', 'Water cooling system', 'Emergency stop']
      },
      {
        name: 'Angle Grinder',
        type: 'Equipment', 
        category: 'Power Tools',
        certificationRequired: false,
        inspectionStatus: 'Current',
        riskLevel: 'Medium',
        safetyRequirements: ['Guard protection', 'Two-handed operation', 'Eye protection']
      }
    ];
  }
  return [
    {
      name: 'Hand Tools',
      type: 'Equipment',
      category: 'General Tools',
      certificationRequired: false,
      inspectionStatus: 'Current',
      riskLevel: 'Low',
      safetyRequirements: ['Good condition', 'Proper storage']
    }
  ];
}

function getBasicEmergencyProcedures(): any[] {
  return [
    {
      scenario: 'Personal Injury',
      response: 'Stop work immediately, provide first aid, call emergency services if required (000)',
      contacts: ['Site Supervisor', 'Emergency Services: 000', 'Company Safety Officer']
    },
    {
      scenario: 'Equipment Failure',
      response: 'Isolate equipment, secure area, notify supervisor, arrange inspection',
      contacts: ['Site Supervisor', 'Equipment Supplier', 'Safety Officer']
    }
  ];
}