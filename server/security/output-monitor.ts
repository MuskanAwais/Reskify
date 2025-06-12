import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

export interface ContentLog {
  id?: number;
  userId: number;
  contentType: 'swms_generation' | 'ai_query' | 'form_submission';
  inputContent: string;
  outputContent: string;
  riskLevel: 'low' | 'medium' | 'high';
  violations: string[];
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface SecurityAlert {
  id?: number;
  userId: number;
  alertType: 'suspicious_content' | 'rate_limit_exceeded' | 'injection_attempt' | 'non_construction_content';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

export class OutputMonitor {
  private static contentLogs: ContentLog[] = [];
  private static securityAlerts: SecurityAlert[] = [];

  // Log all generated content
  static async logContent(log: ContentLog): Promise<void> {
    try {
      log.timestamp = new Date();
      this.contentLogs.push(log);
      
      // Keep only last 1000 logs in memory
      if (this.contentLogs.length > 1000) {
        this.contentLogs = this.contentLogs.slice(-1000);
      }

      console.log(`Content logged: User ${log.userId}, Type: ${log.contentType}, Risk: ${log.riskLevel}`);
      
      // Auto-flag high-risk content
      if (log.riskLevel === 'high') {
        await this.createSecurityAlert({
          userId: log.userId,
          alertType: 'suspicious_content',
          description: `High-risk content generated: ${log.violations.join(', ')}`,
          severity: 'high',
          timestamp: new Date(),
          resolved: false
        });
      }
    } catch (error) {
      console.error('Error logging content:', error);
    }
  }

  // Create security alert
  static async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      alert.timestamp = new Date();
      this.securityAlerts.push(alert);
      
      console.log(`Security Alert: ${alert.alertType} - ${alert.description}`);
      
      // Keep only last 500 alerts in memory
      if (this.securityAlerts.length > 500) {
        this.securityAlerts = this.securityAlerts.slice(-500);
      }
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  // Monitor generation patterns
  static async detectUnusualPatterns(userId: number): Promise<boolean> {
    const userLogs = this.contentLogs.filter(log => log.userId === userId);
    const recentLogs = userLogs.filter(log => 
      Date.now() - log.timestamp.getTime() < 3600000 // Last hour
    );

    // Check for excessive generation
    if (recentLogs.length > 20) {
      await this.createSecurityAlert({
        userId,
        alertType: 'rate_limit_exceeded',
        description: `User generated ${recentLogs.length} documents in the last hour`,
        severity: 'medium',
        timestamp: new Date(),
        resolved: false
      });
      return true;
    }

    // Check for repetitive content
    const contents = recentLogs.map(log => log.inputContent);
    const uniqueContents = new Set(contents);
    if (contents.length > 5 && uniqueContents.size < contents.length * 0.3) {
      await this.createSecurityAlert({
        userId,
        alertType: 'suspicious_content',
        description: 'Repetitive content generation detected',
        severity: 'medium',
        timestamp: new Date(),
        resolved: false
      });
      return true;
    }

    return false;
  }

  // Check for non-construction content
  static async checkConstructionRelevance(content: string): Promise<{ isRelevant: boolean; confidence: number }> {
    const constructionKeywords = [
      'construction', 'building', 'safety', 'work', 'site', 'hazard', 'risk',
      'electrical', 'plumbing', 'carpentry', 'concrete', 'roofing', 'painting',
      'excavation', 'welding', 'scaffolding', 'machinery', 'tools', 'equipment',
      'ppe', 'personal protective equipment', 'hard hat', 'safety boots'
    ];

    const lowerContent = content.toLowerCase();
    const keywordMatches = constructionKeywords.filter(keyword => 
      lowerContent.includes(keyword)
    );

    const confidence = keywordMatches.length / Math.max(content.split(' ').length * 0.1, 1);
    const isRelevant = confidence > 0.1 && keywordMatches.length >= 2;

    if (!isRelevant) {
      console.log(`Non-construction content detected. Confidence: ${confidence}`);
    }

    return { isRelevant, confidence };
  }

  // Get content logs for admin review
  static getContentLogs(limit: number = 100): ContentLog[] {
    return this.contentLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get security alerts
  static getSecurityAlerts(limit: number = 50): SecurityAlert[] {
    return this.securityAlerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get user-specific logs
  static getUserLogs(userId: number, limit: number = 50): ContentLog[] {
    return this.contentLogs
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Mark alert as resolved
  static resolveAlert(alertIndex: number): boolean {
    if (alertIndex >= 0 && alertIndex < this.securityAlerts.length) {
      this.securityAlerts[alertIndex].resolved = true;
      return true;
    }
    return false;
  }

  // Get statistics
  static getStatistics() {
    const now = Date.now();
    const last24h = this.contentLogs.filter(log => now - log.timestamp.getTime() < 86400000);
    const highRisk = this.contentLogs.filter(log => log.riskLevel === 'high');
    const unresolved = this.securityAlerts.filter(alert => !alert.resolved);

    return {
      totalLogs: this.contentLogs.length,
      logsLast24h: last24h.length,
      highRiskContent: highRisk.length,
      unresolvedAlerts: unresolved.length,
      riskDistribution: {
        low: this.contentLogs.filter(log => log.riskLevel === 'low').length,
        medium: this.contentLogs.filter(log => log.riskLevel === 'medium').length,
        high: this.contentLogs.filter(log => log.riskLevel === 'high').length
      }
    };
  }
}

export default OutputMonitor;