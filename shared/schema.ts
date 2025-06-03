import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  companyName: text("company_name").notNull(),
  abn: text("abn"),
  phone: text("phone"),
  address: text("address"),
  primaryTrade: text("primary_trade").notNull(),
  licenseNumber: text("license_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const swmsDocuments = pgTable("swms_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  projectLocation: text("project_location").notNull(),
  tradeType: text("trade_type").notNull(),
  activities: text("activities").array().notNull(),
  riskAssessments: jsonb("risk_assessments").notNull(),
  safetyMeasures: jsonb("safety_measures").notNull(),
  complianceCodes: text("compliance_codes").array().notNull(),
  status: text("status").notNull().default("draft"), // draft, under_review, approved
  aiEnhanced: boolean("ai_enhanced").default(false),
  documentHash: text("document_hash"), // for protection
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SwmsDocument = typeof swmsDocuments.$inferSelect;
export type InsertSwmsDocument = z.infer<typeof insertSwmsSchema>;
export type SafetyLibraryItem = typeof safetyLibrary.$inferSelect;
export type InsertSafetyLibraryItem = z.infer<typeof insertSafetyLibrarySchema>;
export type AiInteraction = typeof aiInteractions.$inferSelect;
export type InsertAiInteraction = z.infer<typeof insertAiInteractionSchema>;

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
