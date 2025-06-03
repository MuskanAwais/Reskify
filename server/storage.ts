import { 
  users, 
  swmsDocuments, 
  safetyLibrary, 
  aiInteractions,
  type User, 
  type InsertUser,
  type SwmsDocument,
  type InsertSwmsDocument,
  type SafetyLibraryItem,
  type InsertSafetyLibraryItem,
  type AiInteraction,
  type InsertAiInteraction
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // User settings and security
  updateUserNotifications(userId: number, enabled: boolean): Promise<boolean>;
  updateUser2FA(userId: number, enabled: boolean, secret: string | null): Promise<boolean>;
  updateUserPassword(userId: number, newPassword: string): Promise<boolean>;
  updateUserProfile(userId: number, profileData: Partial<InsertUser>): Promise<boolean>;

  // SWMS document management
  getSwmsDocument(id: number): Promise<SwmsDocument | undefined>;
  getSwmsDocumentsByUser(userId: number): Promise<SwmsDocument[]>;
  createSwmsDocument(swms: InsertSwmsDocument): Promise<SwmsDocument>;
  updateSwmsDocument(id: number, updates: Partial<InsertSwmsDocument>): Promise<SwmsDocument | undefined>;
  deleteSwmsDocument(id: number): Promise<boolean>;

  // Safety library
  getSafetyLibraryItems(): Promise<SafetyLibraryItem[]>;
  searchSafetyLibrary(query: string, category?: string): Promise<SafetyLibraryItem[]>;
  getSafetyLibraryItem(id: number): Promise<SafetyLibraryItem | undefined>;
  createSafetyLibraryItem(item: InsertSafetyLibraryItem): Promise<SafetyLibraryItem>;

  // AI interactions
  getAiInteractionsByUser(userId: number): Promise<AiInteraction[]>;
  getAiInteractionsBySwms(swmsId: number): Promise<AiInteraction[]>;
  createAiInteraction(interaction: InsertAiInteraction): Promise<AiInteraction>;

  // Digital signatures
  signSwmsDocument(id: number, signatureData: any): Promise<SwmsDocument | undefined>;
  addWitnessSignature(id: number, witnessData: any): Promise<SwmsDocument | undefined>;

  // Analytics and admin methods
  getSwmsCount(): Promise<number>;
  getGeneralSwmsCount(): Promise<number>;
  getAiSwmsCount(): Promise<number>;
  getAllUsers(): Promise<User[]>;
  getUserCount(): Promise<number>;
  getDailySwmsStats(): Promise<any[]>;
  getTradeUsageStats(): Promise<any[]>;
  getSubscriptionStats(): Promise<any>;
  getAllSwmsWithUserInfo(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private swmsDocuments: Map<number, SwmsDocument>;
  private safetyLibrary: Map<number, SafetyLibraryItem>;
  private aiInteractions: Map<number, AiInteraction>;
  private currentUserId: number;
  private currentSwmsId: number;
  private currentSafetyId: number;
  private currentAiId: number;

  constructor() {
    this.users = new Map();
    this.swmsDocuments = new Map();
    this.safetyLibrary = new Map();
    this.aiInteractions = new Map();
    this.currentUserId = 1;
    this.currentSwmsId = 1;
    this.currentSafetyId = 1;
    this.currentAiId = 1;
    this.initializeSafetyLibrary();
  }

  private initializeSafetyLibrary() {
    // Initialize with common Australian safety codes
    const safetyItems: Omit<SafetyLibraryItem, 'id'>[] = [
      {
        code: "AS/NZS 3000:2018",
        title: "Electrical installations (Australian/New Zealand Wiring Rules)",
        description: "This Standard applies to electrical installations in buildings, structures, and premises.",
        category: "Electrical",
        authority: "Standards Australia",
        effectiveDate: new Date("2018-04-27"),
        url: "https://www.standards.org.au/standards-catalogue/sa-snz/electrotechnology/te-001/as-slash-nzs-3000-colon-2018",
        tags: ["electrical", "wiring", "installation", "safety"]
      },
      {
        code: "AS/NZS 1891.1:2007",
        title: "Industrial fall-arrest systems and devices - Harnesses and ancillary equipment",
        description: "This Standard specifies requirements for full body harnesses and ancillary equipment for industrial fall-arrest systems.",
        category: "Height Safety",
        authority: "Standards Australia",
        effectiveDate: new Date("2007-12-07"),
        url: "https://www.standards.org.au/standards-catalogue/sa-snz/other/sf-010/as-slash-nzs-1891-dot-1-colon-2007",
        tags: ["fall-arrest", "harness", "height", "safety", "equipment"]
      },
      {
        code: "SWA-COP-PLANT",
        title: "Managing risks of plant in the workplace",
        description: "This Code provides practical guidance on how to manage risks associated with plant in the workplace.",
        category: "General Safety",
        authority: "Safe Work Australia",
        effectiveDate: new Date("2021-06-01"),
        url: "https://www.safeworkaustralia.gov.au/resources-and-publications/guidance-materials/model-codes-practice",
        tags: ["plant", "machinery", "risk", "management", "workplace"]
      },
      {
        code: "AS 2865:2009",
        title: "Confined spaces",
        description: "This Standard provides requirements for safe work in confined spaces.",
        category: "Confined Spaces",
        authority: "Standards Australia",
        effectiveDate: new Date("2009-09-04"),
        url: "https://www.standards.org.au/standards-catalogue/sa-snz/other/sf-001/as-2865-colon-2009",
        tags: ["confined", "spaces", "entry", "safety", "atmosphere"]
      },
      {
        code: "AS/NZS 4801:2001",
        title: "Occupational health and safety management systems",
        description: "This Standard specifies requirements for an occupational health and safety management system.",
        category: "Management Systems",
        authority: "Standards Australia",
        effectiveDate: new Date("2001-10-19"),
        url: "https://www.standards.org.au/standards-catalogue/sa-snz/other/ob-007/as-slash-nzs-4801-colon-2001",
        tags: ["management", "system", "ohs", "workplace", "safety"]
      }
    ];

    safetyItems.forEach(item => {
      const id = this.currentSafetyId++;
      this.safetyLibrary.set(id, { ...item, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserNotifications(userId: number, enabled: boolean): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    const updatedUser = { ...user, notificationsEnabled: enabled };
    this.users.set(userId, updatedUser);
    return true;
  }

  async updateUser2FA(userId: number, enabled: boolean, secret: string | null): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    const updatedUser = { 
      ...user, 
      twoFactorEnabled: enabled,
      twoFactorSecret: secret
    };
    this.users.set(userId, updatedUser);
    return true;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    const updatedUser = { ...user, passwordHash: newPassword };
    this.users.set(userId, updatedUser);
    return true;
  }

  async updateUserProfile(userId: number, profileData: Partial<InsertUser>): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    const updatedUser = { ...user, ...profileData };
    this.users.set(userId, updatedUser);
    return true;
  }

  async getSwmsDocument(id: number): Promise<SwmsDocument | undefined> {
    return this.swmsDocuments.get(id);
  }

  async getSwmsDocumentsByUser(userId: number): Promise<SwmsDocument[]> {
    return Array.from(this.swmsDocuments.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async createSwmsDocument(insertSwms: InsertSwmsDocument): Promise<SwmsDocument> {
    const id = this.currentSwmsId++;
    const now = new Date();
    const swms: SwmsDocument = {
      ...insertSwms,
      id,
      createdAt: now,
      updatedAt: now,
      documentHash: `swms-${id}-${Date.now()}`
    };
    this.swmsDocuments.set(id, swms);
    return swms;
  }

  async updateSwmsDocument(id: number, updates: Partial<InsertSwmsDocument>): Promise<SwmsDocument | undefined> {
    const swms = this.swmsDocuments.get(id);
    if (!swms) return undefined;
    
    const updatedSwms = { 
      ...swms, 
      ...updates, 
      updatedAt: new Date()
    };
    this.swmsDocuments.set(id, updatedSwms);
    return updatedSwms;
  }

  async deleteSwmsDocument(id: number): Promise<boolean> {
    return this.swmsDocuments.delete(id);
  }

  async getSafetyLibraryItems(): Promise<SafetyLibraryItem[]> {
    return Array.from(this.safetyLibrary.values());
  }

  async searchSafetyLibrary(query: string, category?: string): Promise<SafetyLibraryItem[]> {
    const items = Array.from(this.safetyLibrary.values());
    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => {
      const matchesQuery = 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.code.toLowerCase().includes(lowerQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      
      const matchesCategory = !category || item.category === category;
      
      return matchesQuery && matchesCategory;
    });
  }

  async getSafetyLibraryItem(id: number): Promise<SafetyLibraryItem | undefined> {
    return this.safetyLibrary.get(id);
  }

  async createSafetyLibraryItem(insertItem: InsertSafetyLibraryItem): Promise<SafetyLibraryItem> {
    const id = this.currentSafetyId++;
    const item: SafetyLibraryItem = { ...insertItem, id };
    this.safetyLibrary.set(id, item);
    return item;
  }

  async getAiInteractionsByUser(userId: number): Promise<AiInteraction[]> {
    return Array.from(this.aiInteractions.values())
      .filter(interaction => interaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAiInteractionsBySwms(swmsId: number): Promise<AiInteraction[]> {
    return Array.from(this.aiInteractions.values())
      .filter(interaction => interaction.swmsId === swmsId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAiInteraction(insertInteraction: InsertAiInteraction): Promise<AiInteraction> {
    const id = this.currentAiId++;
    const interaction: AiInteraction = {
      ...insertInteraction,
      id,
      createdAt: new Date()
    };
    this.aiInteractions.set(id, interaction);
    return interaction;
  }
}

import { users, swmsDocuments, safetyLibrary, aiInteractions, type User, type InsertUser, type SwmsDocument, type InsertSwmsDocument, type SafetyLibraryItem, type InsertSafetyLibraryItem, type AiInteraction, type InsertAiInteraction } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        address: insertUser.address || null,
        abn: insertUser.abn || null,
        phone: insertUser.phone || null,
        licenseNumber: insertUser.licenseNumber || null
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        address: updates.address || null,
        abn: updates.abn || null,
        phone: updates.phone || null,
        licenseNumber: updates.licenseNumber || null
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserNotifications(userId: number, enabled: boolean): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ notificationsEnabled: enabled })
      .where(eq(users.id, userId));
    return (result.rowCount || 0) > 0;
  }

  async updateUser2FA(userId: number, enabled: boolean, secret: string | null): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ 
        twoFactorEnabled: enabled,
        twoFactorSecret: secret
      })
      .where(eq(users.id, userId));
    return (result.rowCount || 0) > 0;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ passwordHash: newPassword })
      .where(eq(users.id, userId));
    return (result.rowCount || 0) > 0;
  }

  async updateUserProfile(userId: number, profileData: Partial<InsertUser>): Promise<boolean> {
    const result = await db
      .update(users)
      .set({
        ...profileData,
        abn: profileData.abn || null,
        phone: profileData.phone || null,
        address: profileData.address || null,
        licenseNumber: profileData.licenseNumber || null
      })
      .where(eq(users.id, userId));
    return (result.rowCount || 0) > 0;
  }

  async getSwmsDocument(id: number): Promise<SwmsDocument | undefined> {
    const [document] = await db.select().from(swmsDocuments).where(eq(swmsDocuments.id, id));
    return document || undefined;
  }

  async getSwmsDocumentsByUser(userId: number): Promise<SwmsDocument[]> {
    return await db.select().from(swmsDocuments).where(eq(swmsDocuments.userId, userId));
  }

  async createSwmsDocument(insertSwms: InsertSwmsDocument): Promise<SwmsDocument> {
    const [document] = await db
      .insert(swmsDocuments)
      .values({
        ...insertSwms,
        status: insertSwms.status || 'draft',
        aiEnhanced: insertSwms.aiEnhanced || false,
        documentHash: insertSwms.documentHash || null
      })
      .returning();
    return document;
  }

  async updateSwmsDocument(id: number, updates: Partial<InsertSwmsDocument>): Promise<SwmsDocument | undefined> {
    const [document] = await db
      .update(swmsDocuments)
      .set({
        ...updates,
        status: updates.status || 'draft',
        aiEnhanced: updates.aiEnhanced || false,
        documentHash: updates.documentHash || null
      })
      .where(eq(swmsDocuments.id, id))
      .returning();
    return document || undefined;
  }

  async deleteSwmsDocument(id: number): Promise<boolean> {
    const result = await db.delete(swmsDocuments).where(eq(swmsDocuments.id, id));
    return result.rowCount > 0;
  }

  async signSwmsDocument(id: number, signatureData: any): Promise<SwmsDocument | undefined> {
    const [document] = await db
      .update(swmsDocuments)
      .set({
        signedBy: signatureData.signedBy,
        signatureTitle: signatureData.signatureTitle,
        signatureData: signatureData.signatureData,
        signatureHash: signatureData.signatureHash,
        signedAt: signatureData.signedAt,
        signatureStatus: signatureData.signatureStatus
      })
      .where(eq(swmsDocuments.id, id))
      .returning();
    return document || undefined;
  }

  async addWitnessSignature(id: number, witnessData: any): Promise<SwmsDocument | undefined> {
    const [document] = await db
      .update(swmsDocuments)
      .set({
        witnessName: witnessData.witnessName,
        witnessSignature: witnessData.witnessSignature,
        witnessSignedAt: witnessData.witnessSignedAt
      })
      .where(eq(swmsDocuments.id, id))
      .returning();
    return document || undefined;
  }

  async getSafetyLibraryItems(): Promise<SafetyLibraryItem[]> {
    return await db.select().from(safetyLibrary);
  }

  async searchSafetyLibrary(query: string, category?: string): Promise<SafetyLibraryItem[]> {
    // Implement search logic here
    return await db.select().from(safetyLibrary);
  }

  async getSafetyLibraryItem(id: number): Promise<SafetyLibraryItem | undefined> {
    const [item] = await db.select().from(safetyLibrary).where(eq(safetyLibrary.id, id));
    return item || undefined;
  }

  async createSafetyLibraryItem(insertItem: InsertSafetyLibraryItem): Promise<SafetyLibraryItem> {
    const [item] = await db
      .insert(safetyLibrary)
      .values({
        ...insertItem,
        url: insertItem.url || null,
        effectiveDate: insertItem.effectiveDate || null
      })
      .returning();
    return item;
  }

  async getAiInteractionsByUser(userId: number): Promise<AiInteraction[]> {
    return await db.select().from(aiInteractions).where(eq(aiInteractions.userId, userId));
  }

  async getAiInteractionsBySwms(swmsId: number): Promise<AiInteraction[]> {
    return await db.select().from(aiInteractions).where(eq(aiInteractions.swmsId, swmsId));
  }

  async createAiInteraction(insertInteraction: InsertAiInteraction): Promise<AiInteraction> {
    const [interaction] = await db
      .insert(aiInteractions)
      .values({
        ...insertInteraction,
        swmsId: insertInteraction.swmsId || null
      })
      .returning();
    return interaction;
  }

  // Analytics and admin methods
  async getSwmsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(swmsDocuments);
    return result[0]?.count || 0;
  }

  async getGeneralSwmsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(swmsDocuments).where(eq(swmsDocuments.aiEnhanced, false));
    return result[0]?.count || 0;
  }

  async getAiSwmsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(swmsDocuments).where(eq(swmsDocuments.aiEnhanced, true));
    return result[0]?.count || 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0]?.count || 0;
  }

  async getDailySwmsStats(): Promise<any[]> {
    // Return mock data for now - in production this would query actual database with date aggregation
    return [
      { date: 'Mon', general: 45, ai: 12, total: 57 },
      { date: 'Tue', general: 52, ai: 18, total: 70 },
      { date: 'Wed', general: 38, ai: 15, total: 53 },
      { date: 'Thu', general: 67, ai: 22, total: 89 },
      { date: 'Fri', general: 71, ai: 25, total: 96 },
      { date: 'Sat', general: 28, ai: 8, total: 36 },
      { date: 'Sun', general: 31, ai: 9, total: 40 }
    ];
  }

  async getTradeUsageStats(): Promise<any[]> {
    // Return trade usage based on actual database
    const result = await db.select({
      trade: swmsDocuments.primaryTrade,
      count: sql<number>`count(*)`
    })
    .from(swmsDocuments)
    .groupBy(swmsDocuments.primaryTrade)
    .orderBy(sql`count(*) desc`);

    const total = result.reduce((sum, item) => sum + item.count, 0);
    
    return result.map(item => ({
      trade: item.trade || 'Unknown',
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100 * 10) / 10 : 0
    }));
  }

  async getSubscriptionStats(): Promise<any> {
    const userCount = await this.getUserCount();
    // Return subscription analytics with real user count
    return {
      totalRevenue: userCount * 50, // Estimate based on user count
      monthlyRevenue: userCount * 50,
      activeCount: userCount,
      churnRate: 3.2,
      monthlyData: [
        { month: 'Jan', revenue: Math.floor(userCount * 0.6 * 50), subscriptions: Math.floor(userCount * 0.6) },
        { month: 'Feb', revenue: Math.floor(userCount * 0.7 * 50), subscriptions: Math.floor(userCount * 0.7) },
        { month: 'Mar', revenue: Math.floor(userCount * 0.8 * 50), subscriptions: Math.floor(userCount * 0.8) },
        { month: 'Apr', revenue: Math.floor(userCount * 0.85 * 50), subscriptions: Math.floor(userCount * 0.85) },
        { month: 'May', revenue: Math.floor(userCount * 0.9 * 50), subscriptions: Math.floor(userCount * 0.9) },
        { month: 'Jun', revenue: userCount * 50, subscriptions: userCount }
      ],
      planDistribution: [
        { plan: 'Basic', users: Math.floor(userCount * 0.4), revenue: Math.floor(userCount * 0.4 * 30) },
        { plan: 'Pro', users: Math.floor(userCount * 0.5), revenue: Math.floor(userCount * 0.5 * 50) },
        { plan: 'Enterprise', users: Math.floor(userCount * 0.1), revenue: Math.floor(userCount * 0.1 * 100) }
      ]
    };
  }

  async getAllSwmsWithUserInfo(): Promise<any[]> {
    // Join SWMS documents with user information
    const result = await db.select({
      id: swmsDocuments.id,
      title: swmsDocuments.projectName,
      type: sql<string>`CASE WHEN ${swmsDocuments.aiEnhanced} = true THEN 'AI SWMS' ELSE 'General SWMS' END`,
      user: users.username,
      company: users.companyName,
      trade: swmsDocuments.primaryTrade,
      createdAt: sql<string>`DATE(${swmsDocuments.createdAt})`,
      status: swmsDocuments.status,
      riskLevel: sql<string>`CASE 
        WHEN ${swmsDocuments.overallRiskLevel} >= 4 THEN 'High'
        WHEN ${swmsDocuments.overallRiskLevel} >= 3 THEN 'Medium' 
        ELSE 'Low' END`
    })
    .from(swmsDocuments)
    .leftJoin(users, eq(swmsDocuments.userId, users.id))
    .orderBy(sql`${swmsDocuments.createdAt} desc`);

    return result;
  }
}

export const storage = new DatabaseStorage();
