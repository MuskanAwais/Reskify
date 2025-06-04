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
        creditsTotal: 100,
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

  const httpServer = createServer(app);
  return httpServer;
}