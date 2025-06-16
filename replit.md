# Riskify - Professional SWMS Builder

## Overview

Riskify is a comprehensive SWMS (Safe Work Method Statement) builder application designed specifically for the Australian construction industry. The application combines AI-powered risk assessment generation with compliance validation against Australian safety standards. It features a full-stack architecture with React frontend, Express.js backend, and PostgreSQL database using Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: Radix UI with Tailwind CSS styling
- **State Management**: React Query for server state, React Context for application state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **Component Library**: Custom shadcn/ui components with consistent design system

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy and Google OAuth2
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o for SWMS generation and risk assessment
- **Security**: Comprehensive input sanitization and output monitoring systems
- **File Handling**: Multer for document uploads with support for 500+ files

### Database Schema
- **Users Table**: User authentication, subscription management, admin roles
- **SWMS Documents**: Comprehensive SWMS data with project details, risk assessments, compliance tracking
- **Activity Assignments**: Task delegation and team collaboration features
- **Analytics & Monitoring**: Content logs, security alerts, compliance tracking

## Key Components

### SWMS Generation System
- **AI-Powered Generation**: Uses OpenAI GPT-4o with 4000 token limit for comprehensive SWMS creation
- **Task Database**: 10,000+ construction tasks organized by trade with pre-built risk assessments
- **Risk Assessment Engine**: Australian compliance validation with AS/NZS standards integration
- **Trade-Specific Content**: Specialized content for Electrical, Plumbing, Carpentry, and 40+ other trades

### Security System
- **Input Sanitizer**: Multi-layer content validation with profanity filtering, spam detection, and construction relevance checking
- **Output Monitor**: Real-time content logging with security alert generation
- **Admin Dashboard**: Security monitoring interface with risk statistics and alert management

### Compliance & Risk Management
- **Risk Score Validation**: Automated compliance checking against Australian risk matrix
- **Standards Database**: Integration with Australian Standards (AS/NZS codes) by trade
- **Legislation Compliance**: WHS Act 2011 and WHS Regulation 2017 validation
- **Digital Signatures**: Canvas-based signature system with email notifications

### User Management
- **Multi-tier Authentication**: Local username/password and Google OAuth
- **Subscription System**: Trial, Pro, and Enterprise tiers with Stripe integration
- **Admin Controls**: User management, billing analytics, system health monitoring
- **Team Collaboration**: Activity assignments and real-time collaboration features

## Data Flow

1. **User Authentication**: Users authenticate via local credentials or Google OAuth
2. **SWMS Creation**: Users select trade type and activities from comprehensive database
3. **AI Enhancement**: OpenAI processes requests with construction-specific prompts
4. **Security Validation**: All inputs/outputs pass through sanitization and monitoring
5. **Compliance Checking**: Generated content validated against Australian standards
6. **Document Management**: SWMS stored with digital signatures and team assignments
7. **Analytics**: User activity tracked for insights and compliance reporting

## External Dependencies

### AI Services
- **OpenAI GPT-4o**: Primary AI engine for SWMS generation and risk assessment
- **Token Management**: 4000 token limit with robust JSON parsing and error handling

### Payment Processing
- **Stripe**: Subscription management and payment processing
- **Webhook Integration**: Real-time subscription status updates

### Authentication
- **Google OAuth2**: Social authentication integration
- **Passport.js**: Authentication middleware with session management

### Email Services
- **SendGrid**: Email notifications for digital signatures and alerts
- **SMTP Integration**: Professional email templates for signature requests

### Database
- **Neon Database**: PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and migrations

## Deployment Strategy

### Development Environment
- **Replit Integration**: Full development environment with hot reloading
- **Vite Dev Server**: Fast development builds with HMR
- **Environment Variables**: Secure configuration management for API keys

### Production Deployment
- **Build Process**: Vite production build with tree shaking and optimization
- **Server Bundling**: esbuild for server-side code compilation
- **Static Assets**: Served from attached_assets directory
- **Database Migrations**: Automated schema updates via Drizzle

### Infrastructure
- **Autoscale Deployment**: Automatic scaling based on traffic
- **Health Monitoring**: System health endpoints and error tracking
- **Security Monitoring**: Real-time security alerts and content logging

## Changelog

- June 16, 2025. Fixed multiple critical user-reported issues:
  * Enhanced manual address entry with improved Australian address validation patterns
  * Added "Other" trade type option with custom input field
  * Fixed draft SWMS storage to properly save in "MY SWMS" section via database
  * Improved residual risk score calculation and display in risk assessment
  * Enhanced control measures rendering to prevent React object errors
  * Updated risk assessment section to show proper scoring with reduction indicators
  * Reorganized SWMS builder steps: Risk Assessment now in dedicated Step 3, Plant Equipment in Step 4
  * Fixed equipment risk level calculations - measuring tools, brooms, cleaning equipment now correctly classified as low risk
  * Added auto-populating control measures based on hazards with "Auto-Fill" button
  * Fixed payment navigation issue - demo access now properly progresses through steps
  * Corrected legal disclaimer validation to match new 8-step structure
  * Updated database schema to support all required SWMS document fields
- June 16, 2025. Added comprehensive risk assessment matrix to SWMS builder and final documents with Australian standards compliance
- June 15, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.