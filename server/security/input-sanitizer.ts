import { z } from "zod";

// Profanity and inappropriate content filter
const PROFANITY_KEYWORDS = [
  // Add profanity detection keywords - keeping this minimal for demo
  'spam', 'scam', 'hack', 'exploit', 'illegal', 'drugs', 'weapons'
];

const SPAM_PATTERNS = [
  /(.)\1{10,}/g, // Repetitive characters (more than 10)
  /^(.{1,10})\1{5,}$/g, // Repetitive patterns
  /[A-Z]{20,}/g, // Excessive capitals
  /\d{15,}/g, // Long number sequences
  /[!@#$%^&*]{10,}/g, // Excessive special characters
];

const NON_CONSTRUCTION_KEYWORDS = [
  'dating', 'gambling', 'casino', 'lottery', 'bitcoin', 'crypto',
  'investment', 'forex', 'pharmacy', 'medical prescription',
  'weight loss', 'diet pills', 'adult content', 'pornography'
];

export interface SanitationResult {
  isValid: boolean;
  sanitizedText: string;
  violations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export class InputSanitizer {
  // Character limits for different field types
  private static readonly FIELD_LIMITS = {
    title: 200,
    description: 2000,
    jobName: 150,
    address: 300,
    generalText: 500,
    tasks: 1000,
    hazards: 800,
    controls: 800
  };

  static sanitizeInput(
    text: string, 
    fieldType: keyof typeof InputSanitizer.FIELD_LIMITS = 'generalText'
  ): SanitationResult {
    const violations: string[] = [];
    let sanitizedText = text.trim();
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Character limit check
    const limit = this.FIELD_LIMITS[fieldType];
    if (sanitizedText.length > limit) {
      violations.push(`Text exceeds ${limit} character limit`);
      sanitizedText = sanitizedText.substring(0, limit);
      riskLevel = 'medium';
    }

    // Check for empty or too short content
    if (sanitizedText.length < 3) {
      violations.push('Content too short');
      return {
        isValid: false,
        sanitizedText: '',
        violations,
        riskLevel: 'high'
      };
    }

    // Profanity filter
    const lowerText = sanitizedText.toLowerCase();
    const foundProfanity = PROFANITY_KEYWORDS.filter(word => 
      lowerText.includes(word.toLowerCase())
    );
    if (foundProfanity.length > 0) {
      violations.push(`Inappropriate content detected: ${foundProfanity.join(', ')}`);
      riskLevel = 'high';
      // Remove profanity
      foundProfanity.forEach(word => {
        const regex = new RegExp(word, 'gi');
        sanitizedText = sanitizedText.replace(regex, '[FILTERED]');
      });
    }

    // Spam pattern detection
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(sanitizedText)) {
        violations.push('Spam pattern detected');
        riskLevel = 'high';
        break;
      }
    }

    // Non-construction content detection
    const nonConstructionFound = NON_CONSTRUCTION_KEYWORDS.filter(keyword =>
      lowerText.includes(keyword.toLowerCase())
    );
    if (nonConstructionFound.length > 0) {
      violations.push(`Non-construction content detected: ${nonConstructionFound.join(', ')}`);
      riskLevel = 'high';
    }

    // HTML/Script injection protection
    if (/<script|javascript:|on\w+\s*=/i.test(sanitizedText)) {
      violations.push('Potential script injection detected');
      sanitizedText = sanitizedText.replace(/<[^>]*>/g, '');
      riskLevel = 'high';
    }

    // SQL injection patterns
    if (/('|(\\|%27)|(\\|%22))|(-|%2D){2}|union|select|insert|drop|delete|update|create|alter/i.test(sanitizedText)) {
      violations.push('Potential SQL injection detected');
      riskLevel = 'high';
    }

    return {
      isValid: violations.length === 0 || riskLevel !== 'high',
      sanitizedText,
      violations,
      riskLevel
    };
  }

  // Validation schemas for different inputs
  static getValidationSchema(fieldType: string) {
    const baseSchema = z.string().min(1).max(this.FIELD_LIMITS.generalText);
    
    switch (fieldType) {
      case 'title':
        return baseSchema.max(this.FIELD_LIMITS.title);
      case 'description':
        return baseSchema.max(this.FIELD_LIMITS.description);
      case 'jobName':
        return baseSchema.max(this.FIELD_LIMITS.jobName);
      case 'address':
        return baseSchema.max(this.FIELD_LIMITS.address);
      case 'tasks':
        return baseSchema.max(this.FIELD_LIMITS.tasks);
      case 'hazards':
        return baseSchema.max(this.FIELD_LIMITS.hazards);
      case 'controls':
        return baseSchema.max(this.FIELD_LIMITS.controls);
      default:
        return baseSchema;
    }
  }

  // Rate limiting check
  static checkRateLimit(userId: number, actionType: string): boolean {
    // Implementation would track user actions in database/cache
    // For now, return true (allow)
    return true;
  }
}

export default InputSanitizer;