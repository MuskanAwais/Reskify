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
      const { COMPREHENSIVE_TRADES_DATA } = await import('./comprehensive-trades-data');
      
      // Convert comprehensive trades data to API format
      const trades = Object.keys(COMPREHENSIVE_TRADES_DATA).map(tradeName => {
        const tradeData = COMPREHENSIVE_TRADES_DATA[tradeName];
        const categories = Object.keys(tradeData).map(categoryName => {
          const activities = tradeData[categoryName];
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
      const { COMPREHENSIVE_TRADES_DATA } = await import('./comprehensive-trades-data');
      
      if (!COMPREHENSIVE_TRADES_DATA[tradeName]) {
        return res.status(404).json({ message: 'Trade not found' });
      }
      
      const tradeData = COMPREHENSIVE_TRADES_DATA[tradeName];
      const activities = Object.keys(tradeData).reduce((acc, categoryName) => {
        return acc.concat(tradeData[categoryName]);
      }, []);
      
      res.json({
        tradeName,
        totalActivities: activities.length,
        categories: Object.keys(tradeData).map(categoryName => ({
          name: categoryName,
          activities: tradeData[categoryName]
        })),
        allActivities: activities
      });
    } catch (error: any) {
      console.error('Get trade activities error:', error);
      res.status(500).json({ message: 'Failed to fetch trade activities' });
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

  // Get comprehensive task database with safety data
  app.get("/api/tasks/comprehensive", async (req, res) => {
    try {
      const { getAllAustralianTasks } = await import('./australian-construction-database');
      const australianTasks = getAllAustralianTasks();
      
      res.json({
        totalTasks: australianTasks.length,
        tasks: australianTasks
      });
    } catch (error: any) {
      console.error('Get comprehensive tasks error:', error);
      res.status(500).json({ message: 'Failed to fetch comprehensive tasks' });
    }
  });

  // Get tasks by trade with comprehensive safety data
  app.get("/api/tasks/trade/:tradeName", async (req, res) => {
    try {
      const { tradeName } = req.params;
      const { getAustralianTasksByTrade } = await import('./australian-construction-database');
      
      const tradeTasks = getAustralianTasksByTrade(tradeName);
      
      res.json({
        trade: tradeName,
        totalTasks: tradeTasks.length,
        tasks: tradeTasks
      });
    } catch (error: any) {
      console.error('Get trade tasks error:', error);
      res.status(500).json({ message: 'Failed to fetch trade tasks' });
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