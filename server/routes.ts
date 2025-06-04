import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateComprehensiveSwms } from "./advanced-swms-generator";
import { generateUniqueRiskAssessment, generateMultipleRiskAssessments } from "./ai-risk-assessments";
import { getAllAustralianTasks, getAustralianTasksByTrade, searchAustralianTasks } from "./australian-construction-database";
import { getAllSafetyCodes, getSafetyCodesByTrade, getMandatorySafetyCodes } from "./comprehensive-safety-codes";
import { generateComprehensiveAISwms } from "./comprehensive-ai-swms-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Core SWMS generation with AI-powered risk assessments
  app.post("/api/swms/generate", async (req, res) => {
    try {
      const { activities, tradeType, projectDetails } = req.body;
      
      if (!activities || !Array.isArray(activities) || activities.length === 0) {
        return res.status(400).json({ message: "Activities are required" });
      }
      
      if (!tradeType) {
        return res.status(400).json({ message: "Trade type is required" });
      }

      // Generate comprehensive SWMS with AI-powered risk assessments
      const swmsData = await generateComprehensiveSwms(
        activities,
        tradeType,
        projectDetails || {}
      );

      // Generate unique AI risk assessments for each activity
      const aiRiskAssessments = await generateMultipleRiskAssessments(
        activities,
        tradeType
      );

      // Combine database and AI-generated content
      const response = {
        success: true,
        title: `SWMS - ${tradeType} Work`,
        projectLocation: projectDetails?.location || "Construction Site",
        selectedActivities: activities,
        riskAssessments: [
          ...swmsData.riskAssessments,
          ...aiRiskAssessments
        ],
        safetyMeasures: swmsData.safetyMeasures,
        complianceCodes: swmsData.complianceCodes,
        emergencyProcedures: swmsData.emergencyProcedures,
        generalRequirements: swmsData.generalRequirements,
        projectSpecific: swmsData.projectSpecific,
        summary: {
          totalTasks: activities.length,
          totalRiskAssessments: swmsData.riskAssessments.length + aiRiskAssessments.length,
          aiEnhanced: true
        }
      };

      res.json(response);
    } catch (error: any) {
      console.error('Generate SWMS error:', error);
      res.status(500).json({ message: 'Failed to generate SWMS' });
    }
  });

  // AI-powered comprehensive SWMS generation from job description
  app.post("/api/swms/ai-generate", async (req, res) => {
    try {
      const { jobDescription, trade, projectType, location, duration, requirements } = req.body;
      
      if (!jobDescription || !trade) {
        return res.status(400).json({ message: "Job description and trade are required" });
      }

      const aiSwms = await generateComprehensiveAISwms({
        jobDescription,
        trade,
        projectType,
        location,
        duration,
        requirements
      });

      res.json({
        success: true,
        ...aiSwms,
        aiGenerated: true
      });
    } catch (error: any) {
      console.error('AI Generate SWMS error:', error);
      res.status(500).json({ message: 'Failed to generate AI-powered SWMS' });
    }
  });

  // Get Australian construction tasks database
  app.get("/api/construction-tasks", async (req, res) => {
    try {
      const { trade, search } = req.query;
      
      let tasks;
      if (search) {
        tasks = searchAustralianTasks(search as string);
      } else if (trade) {
        tasks = getAustralianTasksByTrade(trade as string);
      } else {
        tasks = getAllAustralianTasks();
      }
      
      res.json(tasks);
    } catch (error: any) {
      console.error('Get construction tasks error:', error);
      res.status(500).json({ message: 'Failed to fetch construction tasks' });
    }
  });

  // Get safety codes and compliance requirements
  app.get("/api/safety-codes", async (req, res) => {
    try {
      const { trade, mandatory } = req.query;
      
      let codes;
      if (mandatory === 'true') {
        codes = getMandatorySafetyCodes();
      } else if (trade) {
        codes = getSafetyCodesByTrade(trade as string);
      } else {
        codes = getAllSafetyCodes();
      }
      
      res.json(codes);
    } catch (error: any) {
      console.error('Get safety codes error:', error);
      res.status(500).json({ message: 'Failed to fetch safety codes' });
    }
  });

  // Generate table data for SWMS builder
  app.post("/api/swms/generate-table", async (req, res) => {
    try {
      const { activities, tradeType, projectDetails } = req.body;
      
      if (!activities || !Array.isArray(activities)) {
        return res.status(400).json({ message: "Activities are required" });
      }

      // Generate comprehensive SWMS data
      const swmsData = await generateComprehensiveSwms(
        activities,
        tradeType || "General Construction",
        projectDetails || {}
      );

      res.json({
        success: true,
        data: swmsData.riskAssessments,
        metadata: {
          totalActivities: activities.length,
          tradeType: tradeType || "General Construction",
          projectLocation: projectDetails?.location || "Construction Site"
        }
      });
    } catch (error: any) {
      console.error('Generate SWMS table error:', error);
      res.status(500).json({ message: 'Failed to generate SWMS table data' });
    }
  });

  // User subscription information
  app.get('/api/user/subscription-info', async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        plan: user.subscriptionType || "basic",
        status: "active",
        features: {
          aiGeneration: (user.subscriptionType === "professional" || user.subscriptionType === "enterprise"),
          teamCollaboration: user.subscriptionType === "enterprise",
          customBranding: (user.subscriptionType === "professional" || user.subscriptionType === "enterprise")
        }
      });
    } catch (error: any) {
      console.error('Get subscription info error:', error);
      res.status(500).json({ message: 'Failed to fetch subscription information' });
    }
  });

  // User profile endpoints  
  app.get("/api/user/profile", async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        name: user.username,
        email: user.email,
        company: user.companyName,
        phone: user.phone || "",
        address: user.address || ""
      });
    } catch (error: any) {
      console.error('Get user profile error:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  });

  app.put("/api/user/profile", async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const { name, email, company, phone, address } = req.body;
      
      if (!name || !email || !company) {
        return res.status(400).json({ message: "Name, email, and company are required" });
      }
      
      const profileData = {
        username: name,
        email,
        companyName: company,
        phone,
        address
      };
      
      const success = await storage.updateUserProfile(userId, profileData);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        success: true, 
        message: "Profile updated successfully",
        profile: profileData
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // User settings endpoint
  app.get("/api/user/settings", async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        notificationsEnabled: user.notificationsEnabled || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        profile: {
          name: user.username,
          email: user.email,
          company: user.companyName,
          phone: user.phone || "",
          address: user.address || ""
        }
      });
    } catch (error: any) {
      console.error('Get user settings error:', error);
      res.status(500).json({ message: 'Failed to fetch user settings' });
    }
  });

  // User subscription endpoint
  app.get("/api/user/subscription", async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const subscriptionType = user.subscriptionType || "professional";
      const hasAccess = subscriptionType === "professional" || subscriptionType === "enterprise";

      res.json({
        plan: subscriptionType,
        subscriptionType,
        hasAccess,
        features: {
          standardPracticeGuide: hasAccess,
          teamCollaboration: subscriptionType === "enterprise",
          advancedReporting: hasAccess,
          aiEnhancements: hasAccess
        }
      });
    } catch (error: any) {
      console.error('Get user subscription error:', error);
      res.status(500).json({ message: 'Failed to fetch subscription details' });
    }
  });

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Log contact form submission
      console.log('Contact form submission:', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      });

      res.json({ 
        success: true, 
        message: "Thank you for your message. We'll get back to you soon!" 
      });
    } catch (error: any) {
      console.error('Contact form error:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // SWMS document management
  app.get("/api/swms/documents", async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const documents = await storage.getSwmsDocumentsByUser(userId);
      res.json(documents);
    } catch (error: any) {
      console.error("Get SWMS documents error:", error);
      res.status(500).json({ message: "Failed to fetch SWMS documents" });
    }
  });

  app.post("/api/swms/save", async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const swmsData = req.body;
      
      const document = await storage.createSwmsDocument({
        ...swmsData,
        userId,
        status: "active"
      });
      
      res.json(document);
    } catch (error: any) {
      console.error("Save SWMS error:", error);
      res.status(500).json({ message: "Failed to save SWMS document" });
    }
  });

  app.post("/api/swms/draft", async (req, res) => {
    try {
      const userId = 1; // Default user for now
      const swmsData = req.body;
      
      const draft = await storage.createSwmsDocument({
        ...swmsData,
        userId,
        status: "draft"
      });
      
      res.json(draft);
    } catch (error: any) {
      console.error("Save draft error:", error);
      res.status(500).json({ message: "Failed to save draft" });
    }
  });

  // Trades endpoint with activities for dropdown selection
  app.get("/api/trades", async (req, res) => {
    try {
      const trades = [
        { 
          name: "Electrical", 
          totalTasks: 1200, 
          primaryTasks: 15,
          categories: [
            {
              name: "Power Installation",
              isPrimary: true,
              activities: [
                "Power outlet installation",
                "Light switch installation", 
                "Ceiling fan installation",
                "Circuit breaker installation",
                "Electrical meter installation"
              ],
              totalActivities: 150
            },
            {
              name: "Wiring & Cabling",
              isPrimary: true,
              activities: [
                "Cable pulling and installation",
                "Conduit installation",
                "Junction box installation",
                "Data cable installation",
                "Fiber optic installation"
              ],
              totalActivities: 200
            }
          ]
        },
        { 
          name: "Plumbing", 
          totalTasks: 850, 
          primaryTasks: 15,
          categories: [
            {
              name: "Water Systems",
              isPrimary: true,
              activities: [
                "Water pipe installation",
                "Toilet installation",
                "Tap and fixture installation",
                "Hot water system installation",
                "Water meter installation"
              ],
              totalActivities: 120
            },
            {
              name: "Drainage",
              isPrimary: true,
              activities: [
                "Drain pipe installation",
                "Sewer line installation",
                "Stormwater drainage",
                "Septic system installation",
                "Grease trap installation"
              ],
              totalActivities: 100
            }
          ]
        },
        { 
          name: "Carpentry", 
          totalTasks: 950, 
          primaryTasks: 15,
          categories: [
            {
              name: "Structural Framing",
              isPrimary: true,
              activities: [
                "Wall framing",
                "Roof framing", 
                "Floor framing",
                "Stud wall construction",
                "Beam installation"
              ],
              totalActivities: 180
            },
            {
              name: "Doors & Windows",
              isPrimary: true,
              activities: [
                "Door installation",
                "Window installation",
                "Door frame construction",
                "Window frame installation",
                "Hardware installation"
              ],
              totalActivities: 120
            }
          ]
        },
        { 
          name: "Roofing", 
          totalTasks: 400, 
          primaryTasks: 12,
          categories: [
            {
              name: "Roof Installation",
              isPrimary: true,
              activities: [
                "Tile roof installation",
                "Metal roof installation",
                "Gutter installation",
                "Roof membrane installation",
                "Skylight installation",
                "Downpipe installation",
                "Fascia board installation",
                "Ridge capping installation",
                "Flashing installation",
                "Roof ventilation installation"
              ],
              totalActivities: 80
            },
            {
              name: "Roof Maintenance",
              isPrimary: false,
              activities: [
                "Roof cleaning",
                "Gutter cleaning",
                "Roof inspection",
                "Leak repair",
                "Tile replacement"
              ],
              totalActivities: 40
            }
          ]
        },
        { 
          name: "Concrete Work", 
          totalTasks: 350, 
          primaryTasks: 10,
          categories: [
            {
              name: "Foundation Work",
              isPrimary: true,
              activities: [
                "Foundation excavation",
                "Concrete pouring",
                "Formwork installation",
                "Reinforcement placement",
                "Concrete finishing",
                "Slab preparation",
                "Footings construction",
                "Pier construction",
                "Retaining wall construction",
                "Basement construction"
              ],
              totalActivities: 70
            },
            {
              name: "Concrete Structures",
              isPrimary: false,
              activities: [
                "Column construction",
                "Beam construction",
                "Staircase construction",
                "Precast installation",
                "Concrete repair"
              ],
              totalActivities: 50
            }
          ]
        },
        { 
          name: "Steelwork", 
          totalTasks: 450, 
          primaryTasks: 12,
          categories: [
            {
              name: "Structural Steel",
              isPrimary: true,
              activities: [
                "Steel beam installation",
                "Steel column erection",
                "Welding operations",
                "Steel fabrication",
                "Bolting operations",
                "Steel cutting",
                "Steel frame assembly",
                "Crane operations",
                "Steel fixing",
                "Joint preparation"
              ],
              totalActivities: 90
            },
            {
              name: "Steel Finishing",
              isPrimary: false,
              activities: [
                "Steel painting",
                "Galvanizing",
                "Fire protection coating",
                "Rust treatment",
                "Surface preparation"
              ],
              totalActivities: 50
            }
          ]
        },
        { 
          name: "Painting", 
          totalTasks: 300, 
          primaryTasks: 8,
          categories: [
            {
              name: "Interior Painting",
              isPrimary: true,
              activities: [
                "Wall painting",
                "Ceiling painting",
                "Trim painting",
                "Surface preparation",
                "Primer application",
                "Wallpaper installation",
                "Texture application",
                "Staining work",
                "Protective coating",
                "Touch-up work"
              ],
              totalActivities: 60
            },
            {
              name: "Exterior Painting",
              isPrimary: false,
              activities: [
                "House exterior painting",
                "Roof painting",
                "Fence painting",
                "Deck staining",
                "Pressure washing"
              ],
              totalActivities: 40
            }
          ]
        },
        { 
          name: "HVAC", 
          totalTasks: 500, 
          primaryTasks: 12,
          categories: [
            {
              name: "Air Conditioning",
              isPrimary: true,
              activities: [
                "Ducting installation",
                "Unit installation",
                "Refrigerant handling",
                "System commissioning",
                "Ventilation installation",
                "Thermostat installation",
                "Filter replacement",
                "Insulation installation",
                "Control system setup",
                "Testing and balancing"
              ],
              totalActivities: 100
            },
            {
              name: "Heating Systems",
              isPrimary: false,
              activities: [
                "Boiler installation",
                "Radiator installation",
                "Underfloor heating",
                "Heat pump installation",
                "Gas line installation"
              ],
              totalActivities: 60
            }
          ]
        },
        { 
          name: "Landscaping", 
          totalTasks: 250, 
          primaryTasks: 8,
          categories: [
            {
              name: "Garden Installation",
              isPrimary: true,
              activities: [
                "Site preparation",
                "Plant installation",
                "Irrigation installation",
                "Hardscaping",
                "Lawn installation",
                "Tree planting",
                "Garden bed preparation",
                "Mulching",
                "Path construction",
                "Retaining wall construction"
              ],
              totalActivities: 50
            },
            {
              name: "Maintenance",
              isPrimary: false,
              activities: [
                "Garden maintenance",
                "Lawn mowing",
                "Pruning",
                "Fertilizing",
                "Pest control"
              ],
              totalActivities: 30
            }
          ]
        },
        { 
          name: "Bricklaying", 
          totalTasks: 200, 
          primaryTasks: 8,
          categories: [
            {
              name: "Masonry Work",
              isPrimary: true,
              activities: [
                "Brick laying",
                "Block laying",
                "Mortar mixing",
                "Wall construction",
                "Pointing work",
                "Stone work",
                "Arch construction",
                "Pier construction",
                "Chimney construction",
                "Repair work"
              ],
              totalActivities: 40
            },
            {
              name: "Specialized Masonry",
              isPrimary: false,
              activities: [
                "Heritage restoration",
                "Repointing",
                "Cleaning",
                "Structural repair",
                "Damp proofing"
              ],
              totalActivities: 25
            }
          ]
        },
        { 
          name: "Tiling", 
          totalTasks: 180, 
          primaryTasks: 6,
          categories: [
            {
              name: "Floor & Wall Tiling",
              isPrimary: true,
              activities: [
                "Floor tile installation",
                "Wall tile installation",
                "Grouting",
                "Surface preparation",
                "Waterproofing",
                "Mosaic installation",
                "Natural stone installation",
                "Tile cutting",
                "Adhesive application",
                "Sealing"
              ],
              totalActivities: 36
            },
            {
              name: "Specialized Tiling",
              isPrimary: false,
              activities: [
                "Pool tiling",
                "Feature wall tiling",
                "Countertop tiling",
                "Outdoor tiling",
                "Repair work"
              ],
              totalActivities: 20
            }
          ]
        },
        { 
          name: "Glazing", 
          totalTasks: 150, 
          primaryTasks: 6,
          categories: [
            {
              name: "Window Installation",
              isPrimary: true,
              activities: [
                "Window glazing",
                "Glass cutting",
                "Frame installation",
                "Sealant application",
                "Security glass installation",
                "Double glazing",
                "Mirror installation",
                "Shopfront glazing",
                "Curtain wall installation",
                "Glass balustrade"
              ],
              totalActivities: 30
            },
            {
              name: "Glass Repair",
              isPrimary: false,
              activities: [
                "Glass replacement",
                "Crack repair",
                "Reglazing",
                "Frame repair",
                "Emergency glazing"
              ],
              totalActivities: 15
            }
          ]
        },
        { 
          name: "Flooring", 
          totalTasks: 220, 
          primaryTasks: 8,
          categories: [
            {
              name: "Floor Installation",
              isPrimary: true,
              activities: [
                "Timber flooring",
                "Carpet installation",
                "Vinyl flooring",
                "Subfloor preparation",
                "Floor sanding",
                "Laminate installation",
                "Polished concrete",
                "Epoxy coating",
                "Underlay installation",
                "Skirting installation"
              ],
              totalActivities: 44
            },
            {
              name: "Floor Finishing",
              isPrimary: false,
              activities: [
                "Floor polishing",
                "Staining",
                "Sealing",
                "Repair work",
                "Refinishing"
              ],
              totalActivities: 25
            }
          ]
        },
        { 
          name: "Insulation", 
          totalTasks: 120, 
          primaryTasks: 5,
          categories: [
            {
              name: "Thermal Insulation",
              isPrimary: true,
              activities: [
                "Bulk insulation installation",
                "Reflective insulation",
                "Ceiling insulation",
                "Wall insulation",
                "Acoustic insulation",
                "Underfloor insulation",
                "Roof insulation",
                "Pipe insulation",
                "Duct insulation",
                "Fire-rated insulation"
              ],
              totalActivities: 24
            },
            {
              name: "Specialized Insulation",
              isPrimary: false,
              activities: [
                "Spray foam insulation",
                "Injection insulation",
                "Marine insulation",
                "Industrial insulation",
                "Cold storage insulation"
              ],
              totalActivities: 15
            }
          ]
        },
        { 
          name: "Security Systems", 
          totalTasks: 180, 
          primaryTasks: 6,
          categories: [
            {
              name: "Security Installation",
              isPrimary: true,
              activities: [
                "CCTV installation",
                "Alarm system installation",
                "Access control installation",
                "Security lighting",
                "Intercom installation",
                "Motion sensor installation",
                "Key card system",
                "Biometric system",
                "Perimeter security",
                "Emergency systems"
              ],
              totalActivities: 36
            },
            {
              name: "Monitoring Systems",
              isPrimary: false,
              activities: [
                "Control room setup",
                "Remote monitoring",
                "System maintenance",
                "Upgrade installation",
                "Integration work"
              ],
              totalActivities: 18
            }
          ]
        },
        { 
          name: "Earthworks", 
          totalTasks: 300, 
          primaryTasks: 10,
          categories: [
            {
              name: "Excavation",
              isPrimary: true,
              activities: [
                "Site excavation",
                "Trenching",
                "Backfilling",
                "Compaction",
                "Site leveling",
                "Cut and fill",
                "Drainage installation",
                "Utility trenching",
                "Foundation excavation",
                "Road construction"
              ],
              totalActivities: 60
            },
            {
              name: "Site Preparation",
              isPrimary: false,
              activities: [
                "Site clearing",
                "Demolition",
                "Soil testing",
                "Erosion control",
                "Environmental protection"
              ],
              totalActivities: 30
            }
          ]
        },
        { 
          name: "Fire Protection", 
          totalTasks: 200, 
          primaryTasks: 8,
          categories: [
            {
              name: "Fire Systems",
              isPrimary: true,
              activities: [
                "Sprinkler installation",
                "Fire alarm installation",
                "Emergency lighting",
                "Fire extinguisher installation",
                "Exit sign installation",
                "Smoke detection",
                "Fire door installation",
                "Evacuation systems",
                "Fire pump installation",
                "Suppression systems"
              ],
              totalActivities: 40
            },
            {
              name: "Fire Safety",
              isPrimary: false,
              activities: [
                "Fire safety training",
                "System testing",
                "Maintenance",
                "Compliance inspection",
                "Emergency planning"
              ],
              totalActivities: 20
            }
          ]
        },
        { 
          name: "Scaffolding", 
          totalTasks: 150, 
          primaryTasks: 6,
          categories: [
            {
              name: "Scaffold Setup",
              isPrimary: true,
              activities: [
                "Scaffold erection",
                "Scaffold dismantling",
                "Platform installation",
                "Safety rail installation",
                "Access ladder installation",
                "Mobile scaffold setup",
                "Suspended scaffold",
                "System scaffold",
                "Tube and fitting",
                "Cantilever scaffold"
              ],
              totalActivities: 30
            },
            {
              name: "Scaffold Maintenance",
              isPrimary: false,
              activities: [
                "Inspection",
                "Repair",
                "Modification",
                "Safety compliance",
                "Documentation"
              ],
              totalActivities: 15
            }
          ]
        },
        { 
          name: "Communications", 
          totalTasks: 180, 
          primaryTasks: 6,
          categories: [
            {
              name: "Data & Communications",
              isPrimary: true,
              activities: [
                "Data cabling",
                "Phone system installation",
                "Network installation",
                "Satellite installation",
                "Antenna installation",
                "Fiber optic installation",
                "Wireless system setup",
                "Audio visual installation",
                "Public address system",
                "Internet infrastructure"
              ],
              totalActivities: 36
            },
            {
              name: "Telecommunications",
              isPrimary: false,
              activities: [
                "Tower installation",
                "Microwave installation",
                "Cable pulling",
                "Testing and commissioning",
                "Maintenance"
              ],
              totalActivities: 18
            }
          ]
        },
        { 
          name: "Pool Construction", 
          totalTasks: 100, 
          primaryTasks: 5,
          categories: [
            {
              name: "Pool Installation",
              isPrimary: true,
              activities: [
                "Pool excavation",
                "Pool lining",
                "Pool equipment installation",
                "Pool tiling",
                "Pool fencing",
                "Plumbing installation",
                "Electrical installation",
                "Filtration system",
                "Heating system",
                "Pool decking"
              ],
              totalActivities: 20
            },
            {
              name: "Pool Maintenance",
              isPrimary: false,
              activities: [
                "Pool cleaning",
                "Equipment servicing",
                "Chemical balancing",
                "Repair work",
                "Renovation"
              ],
              totalActivities: 10
            }
          ]
        },
        { 
          name: "Solar & Renewable", 
          totalTasks: 150, 
          primaryTasks: 6,
          categories: [
            {
              name: "Solar Installation",
              isPrimary: true,
              activities: [
                "Solar panel installation",
                "Inverter installation",
                "Battery installation",
                "Solar wiring",
                "System commissioning",
                "Mounting system",
                "Grid connection",
                "Monitoring system",
                "Safety shutdown",
                "Performance testing"
              ],
              totalActivities: 30
            },
            {
              name: "Renewable Energy",
              isPrimary: false,
              activities: [
                "Wind turbine installation",
                "Hydroelectric systems",
                "Geothermal systems",
                "Energy storage",
                "Smart grid integration"
              ],
              totalActivities: 15
            }
          ]
        },
        { 
          name: "Demolition", 
          totalTasks: 200, 
          primaryTasks: 8,
          categories: [
            {
              name: "Demolition Work",
              isPrimary: true,
              activities: [
                "Structural demolition",
                "Interior demolition",
                "Asbestos removal",
                "Debris removal",
                "Site cleanup",
                "Selective demolition",
                "Controlled demolition",
                "Mechanical demolition",
                "Manual demolition",
                "Waste sorting"
              ],
              totalActivities: 40
            },
            {
              name: "Hazardous Material",
              isPrimary: false,
              activities: [
                "Lead paint removal",
                "Contaminated soil removal",
                "Chemical cleanup",
                "Environmental remediation",
                "Safety monitoring"
              ],
              totalActivities: 20
            }
          ]
        }
      ];
      
      res.json(trades);
    } catch (error: any) {
      console.error('Get trades error:', error);
      res.status(500).json({ message: 'Failed to fetch trades' });
    }
  });

  // Safety library endpoint
  app.get("/api/safety-library", async (req, res) => {
    try {
      const safetyLibrary = getAllSafetyCodes();
      res.json(safetyLibrary);
    } catch (error: any) {
      console.error('Get safety library error:', error);
      res.status(500).json({ message: 'Failed to fetch safety library' });
    }
  });

  // Admin endpoints
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = [
        {
          id: 1,
          username: "John Doe",
          email: "john.doe@example.com",
          company: "ABC Construction",
          plan: "Pro Plan",
          status: "active",
          swmsCount: 23,
          lastActive: "2 hours ago",
          subscriptionType: "premium",
          creditsRemaining: 25,
          isActive: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          lastLogin: "2024-06-03T00:00:00.000Z"
        }
      ];
      res.json(users);
    } catch (error: any) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/usage-analytics", async (req, res) => {
    try {
      const mockAnalytics = {
        totalSwmsGenerated: 1847,
        generalSwmsCount: 1352,
        aiSwmsCount: 495,
        weeklyGrowth: 23.5,
        dailyData: [
          { date: 'Mon', general: 45, ai: 12, total: 57 },
          { date: 'Tue', general: 52, ai: 18, total: 70 },
          { date: 'Wed', general: 38, ai: 15, total: 53 },
          { date: 'Thu', general: 67, ai: 22, total: 89 },
          { date: 'Fri', general: 71, ai: 25, total: 96 },
          { date: 'Sat', general: 28, ai: 8, total: 36 },
          { date: 'Sun', general: 31, ai: 9, total: 40 }
        ]
      };
      res.json(mockAnalytics);
    } catch (error: any) {
      console.error("Get usage analytics error:", error);
      res.status(500).json({ message: "Failed to fetch usage analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}