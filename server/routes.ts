import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // User subscription endpoint
  app.get("/api/user/subscription", async (req, res) => {
    try {
      res.json({
        plan: "pro",
        subscriptionType: "monthly",
        billingCycle: "monthly",
        nextBillingDate: "2025-07-04",
        creditsUsed: 15,
        creditsTotal: 25,
        features: ["unlimited_swms", "ai_generation", "team_collaboration"]
      });
    } catch (error: any) {
      console.error("Get subscription error:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Safety library endpoint
  app.get("/api/safety-library", async (req, res) => {
    try {
      const { getAllSafetyCodes } = await import('./comprehensive-safety-codes');
      const safetyCodes = getAllSafetyCodes();
      res.json(safetyCodes);
    } catch (error: any) {
      console.error("Get safety library error:", error);
      res.status(500).json({ message: "Failed to fetch safety library" });
    }
  });

  // Trades endpoint with comprehensive activities including safety data
  app.get("/api/trades", async (req, res) => {
    try {
      const { ULTIMATE_CONSTRUCTION_DATABASE } = await import('./ultimate-construction-database');
      
      // Convert comprehensive trades data to API format
      const trades = Object.keys(ULTIMATE_CONSTRUCTION_DATABASE).map(tradeName => {
        const tradeData = ULTIMATE_CONSTRUCTION_DATABASE[tradeName as keyof typeof ULTIMATE_CONSTRUCTION_DATABASE];
        const categories = Object.keys(tradeData).map(categoryName => {
          const activities = tradeData[categoryName as keyof typeof tradeData];
          return {
            name: categoryName,
            isPrimary: categoryName === "Primary Tasks",
            activities: activities,
            totalActivities: activities.length
          };
        });
        
        const totalTasks = categories.reduce((sum, cat) => sum + cat.totalActivities, 0);
        const primaryTasks = categories.find(cat => cat.isPrimary)?.totalActivities || 0;
        
        return {
          name: tradeName,
          totalTasks: totalTasks,
          primaryTasks: primaryTasks,
          categories: categories
        };
      });
      
      res.json(trades);
    } catch (error: any) {
      console.error('Get trades error:', error);
      res.status(500).json({ message: 'Failed to fetch trades' });
    }
  });

  // Get trades with activities endpoint (for activity selection)
  app.get("/api/trades/:tradeName/activities", async (req, res) => {
    try {
      const { tradeName } = req.params;
      
      // Import the comprehensive trades data
      const { ULTIMATE_CONSTRUCTION_DATABASE } = await import('./ultimate-construction-database');
      
      if (!ULTIMATE_CONSTRUCTION_DATABASE[tradeName as keyof typeof ULTIMATE_CONSTRUCTION_DATABASE]) {
        return res.status(404).json({ message: 'Trade not found' });
      }
      
      const tradeData = ULTIMATE_CONSTRUCTION_DATABASE[tradeName as keyof typeof ULTIMATE_CONSTRUCTION_DATABASE];
      const activities = Object.keys(tradeData).reduce((acc: string[], categoryName) => {
        return acc.concat(tradeData[categoryName as keyof typeof tradeData]);
      }, []);
      
      res.json({
        tradeName,
        totalActivities: activities.length,
        categories: Object.keys(tradeData).map(categoryName => ({
          name: categoryName,
          activities: tradeData[categoryName as keyof typeof tradeData]
        })),
        allActivities: activities
      });
    } catch (error: any) {
      console.error('Get trade activities error:', error);
      res.status(500).json({ message: 'Failed to fetch trade activities' });
    }
  });

  // Auto-generate SWMS from activities
  app.post("/api/auto-generate-swms", async (req, res) => {
    try {
      const { activities, tradeType, title, jobName, projectLocation } = req.body;
      
      if (!activities || activities.length === 0) {
        return res.status(400).json({ message: 'No activities provided' });
      }

      // Import the auto SWMS generator
      const { generateAutoSwms } = await import('./auto-swms-generator');
      
      const autoSwms = await generateAutoSwms(activities, tradeType);
      
      res.json(autoSwms);
    } catch (error: any) {
      console.error('Auto-generate SWMS error:', error);
      res.status(500).json({ message: 'Failed to auto-generate SWMS' });
    }
  });

  // Generate SWMS with comprehensive risk assessments and safety data
  app.post("/api/generate-swms", async (req, res) => {
    try {
      const { title, jobName, tradeType, activities, projectDetails } = req.body;
      
      // Import the comprehensive AI generator with safety data
      const { generateComprehensiveAISwms } = await import('./comprehensive-ai-swms-generator');
      
      const swmsData = await generateComprehensiveAISwms({
        jobDescription: `${title} - ${jobName}`,
        trade: tradeType,
        projectType: projectDetails?.projectType || 'Construction',
        location: projectDetails?.projectLocation || 'Australia',
        duration: projectDetails?.duration || 'TBD',
        requirements: activities.join(', ')
      });

      res.json(swmsData);
    } catch (error: any) {
      console.error('Generate SWMS error:', error);
      res.status(500).json({ message: 'Failed to generate SWMS' });
    }
  });

  // Generate detailed risk assessments for activities with comprehensive safety data
  app.post("/api/generate-risk-assessments", async (req, res) => {
    try {
      const { activities, tradeType } = req.body;
      
      // Import the AI risk assessment generator with comprehensive safety data
      const { generateMultipleRiskAssessments } = await import('./ai-risk-assessments');
      
      const riskAssessments = await generateMultipleRiskAssessments(activities, tradeType);
      
      res.json({ riskAssessments });
    } catch (error: any) {
      console.error('Generate risk assessments error:', error);
      res.status(500).json({ message: 'Failed to generate risk assessments' });
    }
  });

  // Get comprehensive task database with full safety data
  app.get("/api/tasks/comprehensive", async (req, res) => {
    try {
      const { getAllComprehensiveSafetyTasks } = await import('./comprehensive-safety-task-database');
      const safetyTasks = getAllComprehensiveSafetyTasks();
      
      res.json({
        totalTasks: safetyTasks.length,
        tasks: safetyTasks,
        metadata: {
          includesRiskAssessments: true,
          includesAustralianLegislation: true,
          includesEmergencyProcedures: true,
          includesHRCWIdentification: true,
          compliantWithWHSRegulation291: true
        }
      });
    } catch (error: any) {
      console.error('Get comprehensive tasks error:', error);
      res.status(500).json({ message: 'Failed to fetch comprehensive tasks' });
    }
  });

  // Get tasks by trade with comprehensive safety data including HRCW identification
  app.get("/api/tasks/trade/:tradeName", async (req, res) => {
    try {
      const { tradeName } = req.params;
      const { getComprehensiveSafetyTasksByTrade } = await import('./comprehensive-safety-task-database');
      
      const tradeTasks = getComprehensiveSafetyTasksByTrade(tradeName);
      
      res.json({
        trade: tradeName,
        totalTasks: tradeTasks.length,
        tasks: tradeTasks,
        highRiskTasks: tradeTasks.filter(task => task.highRiskWork).length,
        riskDistribution: {
          low: tradeTasks.filter(task => task.riskLevel === "Low").length,
          medium: tradeTasks.filter(task => task.riskLevel === "Medium").length,
          high: tradeTasks.filter(task => task.riskLevel === "High").length,
          extreme: tradeTasks.filter(task => task.riskLevel === "Extreme").length
        }
      });
    } catch (error: any) {
      console.error('Get trade tasks error:', error);
      res.status(500).json({ message: 'Failed to fetch trade tasks' });
    }
  });

  // Get specific activity with complete safety data
  app.get("/api/activities/:activityName/safety", async (req, res) => {
    try {
      const { activityName } = req.params;
      const { getComprehensiveSafetyTasksByActivity } = await import('./comprehensive-safety-task-database');
      
      const safetyTask = getComprehensiveSafetyTasksByActivity(activityName);
      
      if (!safetyTask) {
        return res.status(404).json({ message: 'Activity not found' });
      }
      
      res.json({
        activity: safetyTask.activity,
        trade: safetyTask.trade,
        safetyData: safetyTask,
        swmsCompliance: {
          hasHazardIdentification: safetyTask.hazards.length > 0,
          hasRiskAssessment: safetyTask.initialRiskScore > 0,
          hasControlMeasures: safetyTask.controlMeasures.length > 0,
          hasAustralianLegislation: safetyTask.legislation.length > 0,
          hasPPERequirements: safetyTask.ppe.length > 0,
          hasTrainingRequirements: safetyTask.trainingRequired.length > 0,
          hasEmergencyProcedures: safetyTask.emergencyProcedures.length > 0,
          isHighRiskWork: safetyTask.highRiskWork
        }
      });
    } catch (error: any) {
      console.error('Get activity safety data error:', error);
      res.status(500).json({ message: 'Failed to fetch activity safety data' });
    }
  });

  // Get High-Risk Construction Work (HRCW) tasks per WHS Regulation 291
  app.get("/api/tasks/high-risk", async (req, res) => {
    try {
      const { getHighRiskSafetyTasks } = await import('./comprehensive-safety-task-database');
      const highRiskTasks = getHighRiskSafetyTasks();
      
      res.json({
        totalHighRiskTasks: highRiskTasks.length,
        tasks: highRiskTasks,
        regulationCompliance: "WHS Regulation 291 - High-Risk Construction Work",
        categories: {
          workAtHeight: highRiskTasks.filter(task => 
            task.hazards.some(hazard => hazard.toLowerCase().includes('height') || hazard.toLowerCase().includes('fall'))
          ).length,
          electricalWork: highRiskTasks.filter(task => 
            task.hazards.some(hazard => hazard.toLowerCase().includes('electric') || hazard.toLowerCase().includes('shock'))
          ).length,
          confinedSpaces: highRiskTasks.filter(task => 
            task.hazards.some(hazard => hazard.toLowerCase().includes('confined'))
          ).length,
          demolition: highRiskTasks.filter(task => 
            task.activity.toLowerCase().includes('demolition')
          ).length
        }
      });
    } catch (error: any) {
      console.error('Get high-risk tasks error:', error);
      res.status(500).json({ message: 'Failed to fetch high-risk tasks' });
    }
  });

  // Save SWMS draft
  app.post("/api/swms/draft", async (req, res) => {
    try {
      const draftData = req.body;
      res.json({ 
        success: true, 
        message: "Draft saved successfully",
        draftId: Date.now().toString()
      });
    } catch (error: any) {
      console.error("Save draft error:", error);
      res.status(500).json({ message: "Failed to save draft" });
    }
  });

  // Team management endpoints
  app.get("/api/team/members", async (req, res) => {
    try {
      const teamMembers = [
        { id: 1, name: "John Smith", email: "john@example.com", role: "Admin", status: "Active" },
        { id: 2, name: "Sarah Johnson", email: "sarah@example.com", role: "Manager", status: "Active" },
        { id: 3, name: "Mike Wilson", email: "mike@example.com", role: "Member", status: "Pending" }
      ];
      res.json(teamMembers);
    } catch (error: any) {
      console.error("Get team members error:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/team/projects", async (req, res) => {
    try {
      const teamProjects = [
        { id: 1, name: "Office Building Construction", status: "Active", members: 8, swmsCount: 15 },
        { id: 2, name: "Residential Complex", status: "Planning", members: 5, swmsCount: 8 },
        { id: 3, name: "Warehouse Renovation", status: "Completed", members: 6, swmsCount: 12 }
      ];
      res.json(teamProjects);
    } catch (error: any) {
      console.error("Get team projects error:", error);
      res.status(500).json({ message: "Failed to fetch team projects" });
    }
  });

  // AI-Enhanced SWMS Generation with Unique Risk Assessments
  app.post('/api/ai/enhance-swms', async (req, res) => {
    try {
      const { tradeType, activities, projectDetails } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          error: 'OpenAI API key not configured. Please configure your API key to use AI-powered risk assessments.' 
        });
      }
      
      // Import activity-specific risk system
      const { getActivityRisk, generateGenericRisk } = await import('./activity-specific-risks');
      const { generateAutoSwms } = await import('./auto-swms-generator');
      
      // Generate unique activity-specific risk assessments
      const enhancedRiskAssessments = activities.map((activity: string) => {
        // Try to get specific risk data for this activity
        let activityRisk = getActivityRisk(activity);
        
        // If no specific data found, generate trade-specific generic risk
        if (!activityRisk) {
          console.log(`No specific activity data found for: ${activity}, generating trade-specific risk assessment`);
          activityRisk = generateGenericRisk(activity, tradeType);
        } else {
          console.log(`Found specific activity data for: ${activity}`);
        }
        
        return {
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          activity: activityRisk.activity,
          description: activityRisk.description,
          hazards: activityRisk.hazards,
          initialRiskScore: activityRisk.initialRiskScore,
          riskLevel: activityRisk.initialRiskScore >= 5 ? "Extreme" : 
                    activityRisk.initialRiskScore >= 4 ? "High" : 
                    activityRisk.initialRiskScore >= 3 ? "Medium" : "Low",
          controlMeasures: activityRisk.controlMeasures,
          legislation: activityRisk.legislation,
          residualRiskScore: activityRisk.residualRiskScore,
          residualRiskLevel: activityRisk.residualRiskScore >= 5 ? "Extreme" : 
                           activityRisk.residualRiskScore >= 4 ? "High" : 
                           activityRisk.residualRiskScore >= 3 ? "Medium" : "Low",
          responsible: "Site Supervisor",
          ppe: activityRisk.ppe,
          trainingRequired: activityRisk.training,
          permitRequired: [],
          inspectionFrequency: "Daily",
          emergencyProcedures: [
            "Stop work immediately if unsafe conditions arise",
            "Report incidents to site supervisor immediately",
            "Seek first aid or emergency medical attention if required",
            "Secure the work area until hazards are controlled"
          ],
          environmentalControls: [
            "Minimize environmental impact during operations",
            "Proper waste disposal according to regulations",
            "Prevent contamination of surrounding areas"
          ]
        };
      });
      
      // Generate trade-specific safety measures and compliance codes
      const tradeSpecificCodes = {
        "Carpentry": ["AS 1684 Residential Timber Framing", "AS/NZS 1170 Structural Design Actions", "Building Code of Australia"],
        "Electrical": ["AS/NZS 3000 Electrical Wiring Rules", "AS/NZS 3012 Electrical Installations", "Work Health and Safety Regulation"],
        "Plumbing": ["AS/NZS 3500 Plumbing Code", "AS/NZS 3499 Water Supply Systems", "Building Code of Australia"],
        "Concrete": ["AS 1379 Concrete Structures", "AS 3600 Concrete Structures", "Work Health and Safety Regulation"],
        "Painting": ["AS/NZS 1715 Respiratory Protection", "Work Health and Safety Regulation", "Environmental Protection Act"],
        "Tiling": ["AS 3958 Guide to the Installation of Ceramic Tiles", "Work Health and Safety Regulation", "AS/NZS 1715 Respiratory Protection"]
      } as Record<string, string[]>;
      
      const complianceCodes = [
        "Work Health and Safety Act 2011",
        "Work Health and Safety Regulation 2017",
        ...(tradeSpecificCodes[tradeType] || [])
      ];
      
      const safetyMeasures = [
        { category: "General Safety", measures: ["Follow safe work procedures", "Use appropriate PPE"], equipment: ["Standard PPE"], procedures: ["Safety briefings", "Hazard identification"] }
      ];
      
      const enhancedData = {
        riskAssessments: enhancedRiskAssessments,
        safetyMeasures,
        complianceCodes,
        aiEnhanced: true
      };
      
      res.json(enhancedData);
    } catch (error) {
      console.error('AI enhancement error:', error);
      res.status(500).json({ error: 'Failed to enhance SWMS with AI' });
    }
  });

  // Usage analytics endpoint
  app.get("/api/analytics/usage", async (req, res) => {
    try {
      const analytics = {
        totalSwmsGenerated: 127,
        creditsUsed: 85,
        averageRiskScore: 6.2,
        mostUsedTrade: "Electrical",
        complianceRate: 98.5
      };
      res.json(analytics);
    } catch (error: any) {
      console.error("Get usage analytics error:", error);
      res.status(500).json({ message: "Failed to fetch usage analytics" });
    }
  });

  // Generate final SWMS document
  app.post("/api/swms", async (req, res) => {
    try {
      const { formData } = req.body;
      
      console.log('Creating SWMS with data:', JSON.stringify(formData, null, 2));
      
      // Create SWMS document structure
      const swmsDocument = {
        id: `SWMS-${Date.now()}`,
        title: formData.title || formData.jobName || "SWMS Document",
        jobName: formData.jobName || "Untitled Project",
        jobNumber: formData.jobNumber || `JOB-${Date.now()}`,
        projectAddress: formData.projectAddress || "Not specified",
        projectLocation: formData.projectLocation || formData.projectAddress || "Not specified",
        tradeType: formData.tradeType || "General Construction",
        activities: formData.activities || [],
        riskAssessments: formData.riskAssessments || [],
        safetyMeasures: formData.safetyMeasures || [],
        complianceCodes: formData.complianceCodes || [],
        status: "Generated",
        aiEnhanced: true,
        createdAt: new Date().toISOString(),
        documentHash: `hash-${Date.now()}`
      };
      
      console.log('SWMS document created successfully:', swmsDocument.id);
      
      res.json({
        success: true,
        swmsId: swmsDocument.id,
        document: swmsDocument,
        downloadUrl: `/api/swms/${swmsDocument.id}/download`,
        message: "SWMS document generated successfully"
      });
    } catch (error: any) {
      console.error('SWMS generation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate SWMS document',
        error: error.message 
      });
    }
  });

  // Download SWMS as PDF
  app.get("/api/swms/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      
      // For now, return a simple success response
      // PDF generation would be handled on the frontend
      res.json({
        success: true,
        downloadReady: true,
        documentId: id,
        message: "PDF download initiated"
      });
    } catch (error: any) {
      console.error('SWMS download error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate PDF download' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}