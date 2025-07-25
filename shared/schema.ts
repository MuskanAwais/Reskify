import { pgTable, text, serial, integer, bigint, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // email or mobile number
  email: text("email"),
  password: text("password").notNull(),
  name: text("name"),
  profileImage: text("profile_image"),
  companyName: text("company_name"),
  companyLogo: text("company_logo"),
  abn: text("abn"),
  phone: text("phone"),
  address: text("address"),
  primaryTrade: text("primary_trade").notNull(),
  licenseNumber: text("license_number"),
  subscriptionType: text("subscription_type").default("trial"), // trial, pro, enterprise
  subscriptionStatus: text("subscription_status").default("trial"), // trial, active, inactive
  swmsCredits: integer("swms_credits").default(0), // Legacy field for compatibility - new accounts start with 0
  subscriptionCredits: integer("subscription_credits").default(0), // Monthly credits that reset - new accounts start with 0
  addonCredits: integer("addon_credits").default(0), // Never expire add-on credits
  swmsGenerated: integer("swms_generated").default(0),
  lastCreditReset: timestamp("last_credit_reset").defaultNow(), // Track when subscription credits were last reset
  trialUsed: boolean("trial_used").default(false),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Security settings
  notificationsEnabled: boolean("notifications_enabled").default(true),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  isAdmin: boolean("is_admin").default(false),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const swmsDocuments = pgTable("swms_documents", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // 1. Project and Document Details
  title: text("title").notNull(),
  jobName: text("job_name").notNull(),
  jobNumber: text("job_number"),
  projectAddress: text("project_address").notNull(),
  projectLocation: text("project_location").notNull(),
  startDate: text("start_date"),
  duration: text("duration"),
  projectDescription: text("project_description"),
  workDescription: text("work_description"),
  authorisingSignature: text("authorising_signature"),
  principalContractor: text("principal_contractor").notNull(),
  projectManager: text("project_manager"),
  siteSupervisor: text("site_supervisor"),
  swmsCreatorName: text("swms_creator_name"),
  swmsCreatorPosition: text("swms_creator_position"),
  signatureMethod: text("signature_method"), // 'upload' or 'type'
  signatureImage: text("signature_image"), // Base64 encoded image
  signatureText: text("signature_text"), // Typed name signature
  subcontractor: text("subcontractor"),
  principalContractorAbn: text("principal_contractor_abn"),
  subcontractorAbn: text("subcontractor_abn"),
  licenseNumber: text("license_number"),
  documentVersion: text("document_version").default("1.0"),
  responsiblePersons: jsonb("responsible_persons").notNull(),
  signatureSection: jsonb("signature_section"),
  
  // 2. High-Risk Construction Work (HRCW) Identification
  isHighRiskWork: boolean("is_high_risk_work").default(false),
  highRiskActivities: text("high_risk_activities").array(),
  whsRegulations: text("whs_regulations").array(),
  highRiskJustification: text("high_risk_justification"),
  hrcwCategories: jsonb("hrcw_categories").$type<number[]>().default([]),
  ppeRequirements: jsonb("ppe_requirements").$type<string[]>().default([]),
  
  // 3. Work Activity Breakdown
  tradeType: text("trade_type").notNull(),
  activities: text("activities").array().notNull(),
  workActivities: jsonb("work_activities").notNull(), // detailed breakdown with steps
  
  // 4. Hazard Identification and Risk Assessment
  riskAssessments: jsonb("risk_assessments").notNull(),
  
  // 5. Risk Control Measures (covered in risk assessments)
  
  // 6. Plant, Equipment and Materials Used
  plantEquipment: jsonb("plant_equipment"),
  
  // 7. PPE Requirements (covered in risk assessments)
  
  // 8. Training, Competency and Permits
  trainingRequirements: jsonb("training_requirements"),
  competencyRequirements: jsonb("competency_requirements"),
  permitsRequired: text("permits_required").array(),
  
  // 9. Emergency Procedures
  emergencyProcedures: jsonb("emergency_procedures").notNull(),
  nearestHospital: text("nearest_hospital"),
  emergencyContacts: jsonb("emergency_contacts"),
  firstAidArrangements: text("first_aid_arrangements"),
  emergencyResponseProcedures: text("emergency_response_procedures"),
  
  // 10. Review and Monitoring
  reviewProcess: jsonb("review_process"),
  monitoringRequirements: text("monitoring_requirements"),
  
  // System fields
  safetyMeasures: jsonb("safety_measures").notNull(),
  complianceCodes: text("compliance_codes").array().notNull(),
  status: text("status").notNull().default("draft"), // draft, under_review, approved, signed
  aiEnhanced: boolean("ai_enhanced").default(false),
  documentHash: text("document_hash"), // for protection against reuse
  originalCreatedAt: timestamp("original_created_at").defaultNow().notNull(), // immutable creation time
  creditsCost: integer("credits_cost").default(1), // how many credits this SWMS cost
  // Digital signature fields
  requiresSignature: boolean("requires_signature").default(false),
  signatureStatus: text("signature_status").default("unsigned"), // unsigned, pending, signed
  signedAt: timestamp("signed_at"),
  signedBy: text("signed_by"), // name of person who signed
  signatureTitle: text("signature_title"), // job title/role of signer
  signatureData: text("signature_data"), // base64 encoded signature image
  signatureHash: text("signature_hash"), // hash of signature for integrity
  witnessName: text("witness_name"),
  witnessSignature: text("witness_signature"),
  witnessSignedAt: timestamp("witness_signed_at"),
  // Recycling bin functionality
  deletedAt: timestamp("deleted_at"), // when document was moved to recycle bin
  permanentDeleteAt: timestamp("permanent_delete_at"), // when document will be permanently deleted (30 days after deletedAt)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const safetyLibrary = pgTable("safety_library", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  authority: text("authority").notNull(),
  effectiveDate: timestamp("effective_date"),
  url: text("url"),
  tags: text("tags").array().notNull(),
});

export const aiInteractions = pgTable("ai_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  swmsId: integer("swms_id").references(() => swmsDocuments.id),
  query: text("query").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentAnalytics = pgTable("document_analytics", {
  id: serial("id").primaryKey(),
  swmsId: integer("swms_id").references(() => swmsDocuments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  eventType: text("event_type").notNull(), // 'created', 'viewed', 'edited', 'downloaded', 'shared'
  eventData: jsonb("event_data"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complianceTracking = pgTable("compliance_tracking", {
  id: serial("id").primaryKey(),
  swmsId: integer("swms_id").references(() => swmsDocuments.id).notNull(),
  complianceScore: integer("compliance_score").notNull(), // 0-100
  missingRequirements: text("missing_requirements").array(),
  recommendedImprovements: text("recommended_improvements").array(),
  complianceCodes: text("compliance_codes").array(),
  riskLevel: text("risk_level").notNull(), // 'low', 'medium', 'high', 'extreme'
  lastAssessment: timestamp("last_assessment").defaultNow().notNull(),
  assessmentType: text("assessment_type").notNull(), // 'auto', 'manual', 'ai_enhanced'
  assessmentData: jsonb("assessment_data"),
});

export const practiceCodeDownloads = pgTable("practice_code_downloads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  codeId: text("code_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  fileType: text("file_type").notNull(), // 'pdf', 'doc', 'html'
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
  fileSize: integer("file_size"),
  authority: text("authority").notNull(),
});

// Team collaboration tables for multi-trade projects
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  projectName: text("project_name").notNull(),
  projectLocation: text("project_location").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  status: text("status").default("active"), // active, completed, archived
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // project_manager, trade_supervisor, safety_officer, worker
  tradeSpecialty: text("trade_specialty"), // their primary trade
  permissions: text("permissions").array().default([]), // view, edit, approve, manage
  joinedAt: timestamp("joined_at").defaultNow(),
  status: text("status").default("active"), // active, inactive, pending
});

export const projectSwms = pgTable("project_swms", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  swmsId: integer("swms_id").references(() => swmsDocuments.id).notNull(),
  assignedTrades: text("assigned_trades").array().default([]),
  status: text("status").default("draft"), // draft, under_review, approved, active, completed
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("medium"), // low, medium, high, critical
});

export const swmsComments = pgTable("swms_comments", {
  id: serial("id").primaryKey(),
  swmsId: integer("swms_id").references(() => swmsDocuments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  parentId: integer("parent_id"), // for replies - self-reference added later
  content: text("content").notNull(),
  commentType: text("comment_type").default("general"), // general, risk_concern, suggestion, approval
  activityReference: text("activity_reference"), // specific activity being commented on
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const swmsApprovals = pgTable("swms_approvals", {
  id: serial("id").primaryKey(),
  swmsId: integer("swms_id").references(() => swmsDocuments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  approvalType: text("approval_type").notNull(), // trade_review, safety_review, final_approval
  status: text("status").notNull(), // pending, approved, rejected, requires_changes
  comments: text("comments"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityAssignments = pgTable("activity_assignments", {
  id: serial("id").primaryKey(),
  swmsId: integer("swms_id").references(() => swmsDocuments.id).notNull(),
  activity: text("activity").notNull(),
  assignedTo: integer("assigned_to").references(() => users.id).notNull(),
  assignedTrade: text("assigned_trade").notNull(),
  status: text("status").default("assigned"), // assigned, in_progress, completed, reviewed
  startDate: timestamp("start_date"),
  completionDate: timestamp("completion_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSwmsSchema = createInsertSchema(swmsDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  documentHash: true,
});

export const insertSafetyLibrarySchema = createInsertSchema(safetyLibrary).omit({
  id: true,
});

export const insertAiInteractionSchema = createInsertSchema(aiInteractions).omit({
  id: true,
  createdAt: true,
});

// Team collaboration schemas
export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertProjectSwmsSchema = createInsertSchema(projectSwms).omit({
  id: true,
});

export const insertSwmsCommentSchema = createInsertSchema(swmsComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSwmsApprovalSchema = createInsertSchema(swmsApprovals).omit({
  id: true,
  createdAt: true,
});

export const insertActivityAssignmentSchema = createInsertSchema(activityAssignments).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SwmsDocument = typeof swmsDocuments.$inferSelect;
export type InsertSwmsDocument = z.infer<typeof insertSwmsSchema>;
export type SafetyLibraryItem = typeof safetyLibrary.$inferSelect;
export type InsertSafetyLibraryItem = z.infer<typeof insertSafetyLibrarySchema>;
export type AiInteraction = typeof aiInteractions.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;

// Team collaboration types
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type ProjectSwms = typeof projectSwms.$inferSelect;
export type InsertProjectSwms = z.infer<typeof insertProjectSwmsSchema>;
export type SwmsComment = typeof swmsComments.$inferSelect;
export type InsertSwmsComment = z.infer<typeof insertSwmsCommentSchema>;
export type SwmsApproval = typeof swmsApprovals.$inferSelect;
export type InsertSwmsApproval = z.infer<typeof insertSwmsApprovalSchema>;
export type ActivityAssignment = typeof activityAssignments.$inferSelect;
export type InsertActivityAssignment = z.infer<typeof insertActivityAssignmentSchema>;

// Risk assessment schema
export const riskAssessmentSchema = z.object({
  hazard: z.string(),
  riskLevel: z.enum(["low", "medium", "high", "extreme"]),
  controlMeasures: z.string(),
  responsiblePerson: z.string(),
});

// Safety measure schema
export const safetyMeasureSchema = z.object({
  category: z.string(),
  measures: z.array(z.string()),
  equipment: z.array(z.string()),
  procedures: z.array(z.string()),
});

export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;
export type SafetyMeasure = z.infer<typeof safetyMeasureSchema>;

// SwmsFormData schemas for the frontend
export const riskLevelSchema = z.object({
  level: z.enum(['extreme', 'high', 'medium', 'low']),
  score: z.number()
});

export const emergencyContactSchema = z.object({
  name: z.string(),
  phone: z.string(),
});

export const highRiskActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  selected: z.boolean(),
  riskLevel: z.enum(['extreme', 'high', 'medium', 'low']).optional(),
});

export const ppeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  selected: z.boolean(),
  category: z.string().optional(),
  required: z.boolean().optional(),
});

export const workActivitySchema = z.object({
  id: z.string(),
  activity: z.string(),
  hazards: z.array(z.string()),
  initialRisk: z.union([
    z.string(),
    riskLevelSchema
  ]),
  controlMeasures: z.array(z.string()),
  residualRisk: z.union([
    z.string(),
    riskLevelSchema
  ]),
  legislation: z.array(z.string()),
});

export const plantEquipmentSchema = z.object({
  id: z.string(),
  equipment: z.string(),
  model: z.string(),
  serialNumber: z.string(),
  riskLevel: z.enum(['high', 'medium', 'low']),
  nextInspection: z.string(),
  certificationRequired: z.boolean(),
  hazards: z.array(z.string()).default([]),
  initialRisk: riskLevelSchema,
  controlMeasures: z.array(z.string()).default([]),
  residualRisk: riskLevelSchema,
  legislation: z.array(z.string()).default([]),
  operator: z.string().optional(),
});

export const signInEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string(),
  position: z.string(),
  date: z.string(),
  timeIn: z.string(),
  timeOut: z.string(),
  signature: z.string(),
  inductionComplete: z.boolean(),
  number: z.number().optional()
});

export const msdsDocumentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  customTitle: z.string(),
  fileData: z.string(),
  uploadDate: z.string(),
  selected: z.boolean().default(false),
});

export const swmsFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  projectName: z.string().min(1, "Project name is required"),
  projectNumber: z.string().min(1, "Project number is required"),
  projectAddress: z.string().min(1, "Project address is required"),
  jobName: z.string().min(1, "Job name is required"),
  jobNumber: z.string().min(1, "Job number is required"),
  startDate: z.string().min(1, "Start date is required"),
  duration: z.string().min(1, "Duration is required"),
  dateCreated: z.string().min(1, "Date created is required"),
  principalContractor: z.string().min(1, "Principal contractor is required"),
  projectManager: z.string().min(1, "Project manager is required"),
  siteSupervisor: z.string().min(1, "Site supervisor is required"),
  authorisingPerson: z.string().min(1, "Authorising person is required"),
  authorisingPosition: z.string().min(1, "Authorising position is required"),
  scopeOfWorks: z.string().min(1, "Scope of works is required"),
  reviewAndMonitoring: z.string().min(1, "Review and monitoring is required"),
  companyLogo: z.string().optional(),
  emergencyContacts: z.array(emergencyContactSchema),
  emergencyProcedures: z.string(),
  emergencyMonitoring: z.string(),
  highRiskActivities: z.array(highRiskActivitySchema),
  workActivities: z.array(workActivitySchema),
  ppeItems: z.array(ppeItemSchema),
  plantEquipment: z.array(plantEquipmentSchema),
  signInEntries: z.array(signInEntrySchema),
  msdsDocuments: z.array(msdsDocumentSchema),
  authorisingSignature: z.string().optional(),
  authorisingSignatureName: z.string().optional(),
});

export type SwmsFormData = z.infer<typeof swmsFormSchema>;

export const defaultSwmsData: SwmsFormData = {
  companyName: "Riskify Construction",
  projectName: "Office Building Construction",
  projectNumber: "PRJ-2025-001",
  projectAddress: "123 Construction Ave, Sydney NSW",
  jobName: "Foundation & Concrete Works",
  jobNumber: "JOB-001",
  startDate: "1st July 2025",
  duration: "6 weeks",
  dateCreated: "24th June 2025",
  principalContractor: "BuildCorp Construction Ltd",
  projectManager: "John Smith",
  siteSupervisor: "Jane Doe",
  authorisingPerson: "Sarah Wilson",
  authorisingPosition: "WHS Manager",
  scopeOfWorks: `Foundation excavation and concrete pouring works including:
• Site preparation and excavation to specified depths
• Installation of formwork and reinforcement steel
• Concrete pouring and finishing
• Quality control and testing procedures
• Site safety measures and emergency procedures`,
  companyLogo: undefined,
  reviewAndMonitoring: "This SWMS will be reviewed and updated whenever changes occur to scope, method, or risk levels. The site supervisor is responsible for initiating this review. All workers will be consulted on this SWMS during the pre-start meeting. Updates will be communicated verbally and via toolbox talks.",
  emergencyContacts: [
    { name: "Emergency Contact 01 Name", phone: "0499 999 999" },
    { name: "Emergency Contact 02 Name", phone: "0499 999 999" },
    { name: "Emergency Contact 03 Name", phone: "0499 999 999" },
  ],
  emergencyProcedures: "Sample procedure information here",
  emergencyMonitoring: "Emergency procedures will be reviewed monthly and updated as needed. Site supervisor will conduct weekly checks of emergency equipment and contact details. All personnel will be trained on emergency procedures during induction and refresher training every 6 months.",
  highRiskActivities: [
    { id: "1", title: "Work on a telecommunication tower", description: "", selected: true },
    { id: "2", title: "Risk of a person falling more than 2 metres", description: "", selected: true, riskLevel: 'high' as const },
    { id: "3", title: "Work involving demolition of an element that is load-bearing", description: "", selected: true },
    { id: "4", title: "Work involving the disturbance of asbestos", description: "", selected: true },
  ],
  workActivities: [
    {
      id: "1",
      activity: "Site preparation and excavation",
      hazards: ["Manual handling", "Equipment hazards", "Fall risks"],
      initialRisk: { level: 'high' as const, score: 12 },
      controlMeasures: ["Use mechanical aids", "Proper PPE", "Safety barriers"],
      residualRisk: { level: 'medium' as const, score: 6 },
      legislation: ["WHS Act 2011", "Construction Work COP"]
    }
  ],
  ppeItems: [
    { id: "1", name: "Hard Hat", description: "Safety helmet", selected: true },
    { id: "2", name: "Safety Boots", description: "Steel-capped boots", selected: true },
  ],
  plantEquipment: [],
  signInEntries: [],
  msdsDocuments: [],
  authorisingSignature: undefined,
  authorisingSignatureName: undefined,
};
