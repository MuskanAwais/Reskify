import OpenAI from "openai";

// Enhanced AI-powered risk assessment generator
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface UniqueRiskAssessment {
  activity: string;
  id: string;
  hazards: string[];
  initialRiskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Extreme";
  controlMeasures: string[];
  legislation: string[];
  residualRiskScore: number;
  residualRiskLevel: "Low" | "Medium" | "High" | "Extreme";
  responsible: string;
  ppe: string[];
  trainingRequired: string[];
  permitRequired: string[];
  inspectionFrequency: string;
  emergencyProcedures: string[];
  environmentalControls: string[];
}

function getRiskLevel(score: number): "Low" | "Medium" | "High" | "Extreme" {
  if (score >= 16) return "Extreme";
  if (score >= 11) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

export async function generateUniqueRiskAssessment(
  activity: string,
  tradeType: string,
  projectContext?: string
): Promise<UniqueRiskAssessment> {
  try {
    const prompt = `Generate a comprehensive, unique risk assessment for the specific construction activity: "${activity}" in the ${tradeType} trade.

PROJECT CONTEXT: ${projectContext || 'General construction project in Australia'}

Requirements:
1. Identify specific hazards unique to this exact activity
2. Calculate initial risk score (1-20 scale: Consequence x Likelihood)
3. Provide detailed control measures following hierarchy of controls
4. List all applicable Australian legislation and standards
5. Calculate residual risk score after controls
6. Include specific PPE requirements
7. Specify training requirements
8. List any permits required
9. Define inspection frequency
10. Emergency procedures specific to this activity
11. Environmental controls

Respond in JSON format with this structure:
{
  "hazards": ["specific hazard 1", "specific hazard 2", ...],
  "initialRiskScore": number (1-20),
  "controlMeasures": ["specific control 1", "specific control 2", ...],
  "legislation": ["Work Health and Safety Act 2011", "specific standard", ...],
  "residualRiskScore": number (1-20),
  "responsible": "specific role",
  "ppe": ["specific ppe item 1", "specific ppe item 2", ...],
  "trainingRequired": ["specific training 1", "specific training 2", ...],
  "permitRequired": ["permit type if needed"],
  "inspectionFrequency": "specific frequency",
  "emergencyProcedures": ["specific emergency step 1", "specific emergency step 2", ...],
  "environmentalControls": ["specific environmental control 1", ...]
}

Make this assessment highly specific to "${activity}" - not generic. Reference real Australian construction standards and legislation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Australian construction safety professional with deep knowledge of WHS legislation, Australian Standards, and trade-specific safety requirements. Generate accurate, detailed, and legally compliant risk assessments."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const aiResult = JSON.parse(response.choices[0].message.content || '{}');
    
    // Generate unique ID
    const uniqueId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate and structure the response
    const riskAssessment: UniqueRiskAssessment = {
      activity,
      id: uniqueId,
      hazards: Array.isArray(aiResult.hazards) ? aiResult.hazards : [`Manual handling risks from ${activity}`, "Tool and equipment hazards", "Workplace hazards"],
      initialRiskScore: typeof aiResult.initialRiskScore === 'number' ? Math.min(20, Math.max(1, aiResult.initialRiskScore)) : 9,
      riskLevel: getRiskLevel(aiResult.initialRiskScore || 9),
      controlMeasures: Array.isArray(aiResult.controlMeasures) ? aiResult.controlMeasures : [`Follow safe work procedures for ${activity}`, "Use appropriate tools and equipment", "Conduct safety briefing"],
      legislation: Array.isArray(aiResult.legislation) ? aiResult.legislation : ["Work Health and Safety Act 2011", "Work Health and Safety Regulation 2017"],
      residualRiskScore: typeof aiResult.residualRiskScore === 'number' ? Math.min(20, Math.max(1, aiResult.residualRiskScore)) : 4,
      residualRiskLevel: getRiskLevel(aiResult.residualRiskScore || 4),
      responsible: typeof aiResult.responsible === 'string' ? aiResult.responsible : "Site Supervisor",
      ppe: Array.isArray(aiResult.ppe) ? aiResult.ppe : ["Safety glasses", "Hard hat", "Safety boots", "High-vis clothing"],
      trainingRequired: Array.isArray(aiResult.trainingRequired) ? aiResult.trainingRequired : ["Site induction", "Tool operation training"],
      permitRequired: Array.isArray(aiResult.permitRequired) ? aiResult.permitRequired : [],
      inspectionFrequency: typeof aiResult.inspectionFrequency === 'string' ? aiResult.inspectionFrequency : "Daily",
      emergencyProcedures: Array.isArray(aiResult.emergencyProcedures) ? aiResult.emergencyProcedures : ["Stop work immediately", "Call emergency services: 000", "Notify site supervisor"],
      environmentalControls: Array.isArray(aiResult.environmentalControls) ? aiResult.environmentalControls : ["Proper waste disposal", "Dust control measures"]
    };

    return riskAssessment;

  } catch (error) {
    console.error(`AI risk assessment failed for ${activity}:`, error);
    
    // Fallback to detailed generic assessment
    return generateDetailedFallbackAssessment(activity, tradeType);
  }
}

function generateDetailedFallbackAssessment(activity: string, tradeType: string): UniqueRiskAssessment {
  const uniqueId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Trade-specific detailed assessments
  const tradeSpecificData = getTradeSpecificRiskData(tradeType, activity);
  
  return {
    activity,
    id: uniqueId,
    hazards: tradeSpecificData.hazards,
    initialRiskScore: tradeSpecificData.initialRiskScore,
    riskLevel: getRiskLevel(tradeSpecificData.initialRiskScore),
    controlMeasures: tradeSpecificData.controlMeasures,
    legislation: tradeSpecificData.legislation,
    residualRiskScore: tradeSpecificData.residualRiskScore,
    residualRiskLevel: getRiskLevel(tradeSpecificData.residualRiskScore),
    responsible: tradeSpecificData.responsible,
    ppe: tradeSpecificData.ppe,
    trainingRequired: tradeSpecificData.trainingRequired,
    permitRequired: tradeSpecificData.permitRequired,
    inspectionFrequency: tradeSpecificData.inspectionFrequency,
    emergencyProcedures: tradeSpecificData.emergencyProcedures,
    environmentalControls: tradeSpecificData.environmentalControls
  };
}

function getTradeSpecificRiskData(tradeType: string, activity: string) {
  const baseData = {
    hazards: [`Manual handling injuries from ${activity}`, "Tool and equipment hazards", "Slips, trips and falls", "Noise exposure"],
    initialRiskScore: 9,
    controlMeasures: [`Follow safe work procedures for ${activity}`, "Use appropriate PPE", "Conduct pre-work safety briefing", "Maintain clear work areas"],
    legislation: ["Work Health and Safety Act 2011", "Work Health and Safety Regulation 2017", "Building Code of Australia"],
    residualRiskScore: 4,
    responsible: "Site Supervisor",
    ppe: ["Safety glasses", "Hard hat", "Safety boots", "High-vis clothing"],
    trainingRequired: ["Site induction", "Tool operation training"],
    permitRequired: [] as string[],
    inspectionFrequency: "Daily",
    emergencyProcedures: ["Stop work immediately", "Call emergency services: 000", "Notify site supervisor", "Provide first aid if trained"],
    environmentalControls: ["Proper waste disposal", "Dust control measures"]
  };

  switch (tradeType) {
    case 'Electrical':
      return {
        ...baseData,
        hazards: [`Electrical shock and electrocution from ${activity}`, "Arc flash and burns", "Falls from height during electrical work", "Contact with energized equipment"],
        initialRiskScore: 16,
        controlMeasures: [`Isolate and lock out electrical supply before ${activity}`, "Test electrical circuits before work", "Use insulated tools", "Maintain safe distances from live equipment", "Use appropriate fall protection"],
        legislation: [...baseData.legislation, "AS/NZS 3000:2018", "AS/NZS 3012:2019"],
        residualRiskScore: 6,
        responsible: "Licensed Electrician",
        ppe: ["Insulated gloves", "Arc flash suit", "Voltage rated safety boots", "Face shield", "Hard hat with chin strap"],
        trainingRequired: ["Electrical license", "Arc flash awareness", "Confined space entry", "Working at height"],
        permitRequired: ["Electrical isolation permit", "Hot work permit if applicable"],
        inspectionFrequency: "Before each use and daily",
        emergencyProcedures: ["De-energize electrical source", "Call emergency services: 000", "Provide CPR if qualified", "Treat for electrical burns"],
        environmentalControls: ["Proper disposal of electrical waste", "Containment of hazardous materials"]
      };

    case 'Plumbing':
      return {
        ...baseData,
        hazards: [`Water damage and flooding from ${activity}`, "Exposure to contaminated water", "Chemical exposure from cleaning agents", "Back strain from heavy lifting", "Confined space entry"],
        initialRiskScore: 12,
        controlMeasures: [`Shut off water supply before ${activity}`, "Use water detection equipment", "Wear appropriate chemical resistant gloves", "Use mechanical lifting aids", "Test atmosphere in confined spaces"],
        legislation: [...baseData.legislation, "Australian Standards AS 3500", "AS 2865:2009"],
        residualRiskScore: 5,
        responsible: "Licensed Plumber",
        ppe: ["Chemical resistant gloves", "Waterproof clothing", "Knee pads", "Safety boots", "Respiratory protection"],
        trainingRequired: ["Plumbing license", "Confined space entry", "Chemical handling"],
        permitRequired: ["Confined space permit if applicable", "Excavation permit"],
        inspectionFrequency: "Daily and after each connection",
        emergencyProcedures: ["Shut off main water supply", "Evacuate if gas leak suspected", "Call emergency services: 000", "Provide decontamination if exposed"],
        environmentalControls: ["Prevent water contamination", "Proper disposal of waste water", "Chemical spill containment"]
      };

    case 'Carpentry':
      return {
        ...baseData,
        hazards: [`Cuts and lacerations from ${activity}`, "Wood dust exposure", "Nail gun injuries", "Falls from scaffolds and ladders", "Manual handling of timber"],
        initialRiskScore: 10,
        controlMeasures: [`Use sharp, well-maintained tools for ${activity}`, "Install dust extraction systems", "Follow nail gun safety procedures", "Inspect scaffolds before use", "Use mechanical lifting for heavy timber"],
        legislation: [...baseData.legislation, "Australian Standards AS 1100"],
        residualRiskScore: 4,
        responsible: "Qualified Carpenter",
        ppe: ["Safety glasses", "Dust mask P2", "Cut-resistant gloves", "Hard hat", "Steel-capped boots"],
        trainingRequired: ["Carpentry apprenticeship", "Working at height", "Manual handling", "Tool operation"],
        permitRequired: ["Scaffold handover certificate", "Crane permit if applicable"],
        inspectionFrequency: "Daily and before each use",
        emergencyProcedures: ["Apply direct pressure to cuts", "Call emergency services: 000", "Remove from dust exposure", "Stabilize fall injuries"],
        environmentalControls: ["Dust suppression", "Proper timber waste disposal", "Noise control measures"]
      };

    case 'Painting':
      return {
        ...baseData,
        hazards: [`Chemical exposure from paint fumes during ${activity}`, "Eye and skin irritation", "Falls from ladders and scaffolds", "Fire and explosion from solvents", "Respiratory issues from overspray"],
        initialRiskScore: 11,
        controlMeasures: [`Ensure adequate ventilation during ${activity}`, "Use low-VOC paints where possible", "Inspect fall protection equipment", "Store solvents safely away from ignition sources", "Use spray booth or outdoor areas"],
        legislation: [...baseData.legislation, "Australian Standards AS 1100 - Technical drawing"],
        residualRiskScore: 5,
        responsible: "Qualified Painter",
        ppe: ["Respirator with appropriate cartridges", "Chemical resistant gloves", "Coveralls", "Safety harness", "Non-slip footwear"],
        trainingRequired: ["Paint application training", "Chemical handling", "Working at height", "Respiratory protection"],
        permitRequired: ["Hot work permit", "Confined space permit if applicable"],
        inspectionFrequency: "Daily and before each application",
        emergencyProcedures: ["Move to fresh air", "Remove contaminated clothing", "Flush eyes with water", "Call emergency services: 000"],
        environmentalControls: ["Contain paint overspray", "Proper disposal of paint waste", "Prevent contamination of water sources"]
      };

    case 'HVAC':
      return {
        ...baseData,
        hazards: [`Refrigerant exposure during ${activity}`, "Electrical hazards from HVAC equipment", "Falls from roof and ceiling work", "Asbestos exposure in old systems", "Confined space entry"],
        initialRiskScore: 13,
        controlMeasures: [`Use refrigerant detection equipment during ${activity}`, "Lock out electrical systems", "Use appropriate fall protection", "Test for asbestos before disturbance", "Monitor atmosphere in confined spaces"],
        legislation: [...baseData.legislation, "AS/NZS 3000:2018", "AS 2865:2009"],
        residualRiskScore: 6,
        responsible: "Licensed HVAC Technician",
        ppe: ["Self-contained breathing apparatus", "Electrical rated gloves", "Full body harness", "Disposable coveralls", "Safety boots"],
        trainingRequired: ["HVAC license", "Refrigerant handling", "Confined space entry", "Asbestos awareness"],
        permitRequired: ["Electrical isolation permit", "Confined space permit", "Asbestos permit if applicable"],
        inspectionFrequency: "Daily and before system startup",
        emergencyProcedures: ["Evacuate area if refrigerant leak", "De-energize electrical systems", "Call emergency services: 000", "Provide oxygen if available"],
        environmentalControls: ["Refrigerant recovery and recycling", "Proper disposal of old equipment", "Air quality monitoring"]
      };

    default:
      return baseData;
  }
}

export async function generateMultipleRiskAssessments(
  activities: string[],
  tradeType: string,
  projectContext?: string
): Promise<UniqueRiskAssessment[]> {
  const assessments: UniqueRiskAssessment[] = [];
  
  console.log(`Generating ${activities.length} unique risk assessments for ${tradeType}`);
  
  // Process each activity individually to ensure uniqueness
  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    console.log(`Processing activity ${i + 1}/${activities.length}: "${activity}"`);
    
    try {
      const assessment = await generateUniqueRiskAssessment(activity, tradeType, projectContext);
      assessments.push(assessment);
      console.log(`Generated unique assessment for "${activity}"`);
      
      // Small delay to avoid rate limiting
      if (i < activities.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Failed to generate assessment for "${activity}":`, error);
      // Add fallback assessment
      assessments.push(generateDetailedFallbackAssessment(activity, tradeType));
    }
  }
  
  console.log(`Generated ${assessments.length} total risk assessments`);
  return assessments;
}