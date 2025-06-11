CREATE TABLE "activity_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"swms_id" integer NOT NULL,
	"activity" text NOT NULL,
	"assigned_to" integer NOT NULL,
	"assigned_trade" text NOT NULL,
	"status" text DEFAULT 'assigned',
	"start_date" timestamp,
	"completion_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"swms_id" integer,
	"query" text NOT NULL,
	"response" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"swms_id" integer NOT NULL,
	"compliance_score" integer NOT NULL,
	"missing_requirements" text[],
	"recommended_improvements" text[],
	"compliance_codes" text[],
	"risk_level" text NOT NULL,
	"last_assessment" timestamp DEFAULT now() NOT NULL,
	"assessment_type" text NOT NULL,
	"assessment_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "document_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"swms_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_code_downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"code_id" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"file_type" text NOT NULL,
	"downloaded_at" timestamp DEFAULT now() NOT NULL,
	"file_size" integer,
	"authority" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_swms" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"swms_id" integer NOT NULL,
	"assigned_trades" text[] DEFAULT '{}',
	"status" text DEFAULT 'draft',
	"approved_by" integer,
	"approved_at" timestamp,
	"due_date" timestamp,
	"priority" text DEFAULT 'medium'
);
--> statement-breakpoint
CREATE TABLE "safety_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"authority" text NOT NULL,
	"effective_date" timestamp,
	"url" text,
	"tags" text[] NOT NULL,
	CONSTRAINT "safety_library_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "swms_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"swms_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"approval_type" text NOT NULL,
	"status" text NOT NULL,
	"comments" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "swms_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"swms_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"parent_id" integer,
	"content" text NOT NULL,
	"comment_type" text DEFAULT 'general',
	"activity_reference" text,
	"resolved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "swms_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"job_name" text NOT NULL,
	"job_number" text,
	"project_address" text NOT NULL,
	"project_location" text NOT NULL,
	"project_description" text,
	"principal_contractor" text NOT NULL,
	"subcontractor" text,
	"principal_contractor_abn" text,
	"subcontractor_abn" text,
	"license_number" text,
	"document_version" text DEFAULT '1.0',
	"responsible_persons" jsonb NOT NULL,
	"signature_section" jsonb,
	"is_high_risk_work" boolean DEFAULT false,
	"high_risk_activities" text[],
	"whs_regulations" text[],
	"high_risk_justification" text,
	"trade_type" text NOT NULL,
	"activities" text[] NOT NULL,
	"work_activities" jsonb NOT NULL,
	"risk_assessments" jsonb NOT NULL,
	"plant_equipment" jsonb,
	"training_requirements" jsonb,
	"competency_requirements" jsonb,
	"permits_required" text[],
	"emergency_procedures" jsonb NOT NULL,
	"nearest_hospital" text,
	"emergency_contacts" jsonb,
	"first_aid_arrangements" text,
	"review_process" jsonb,
	"monitoring_requirements" jsonb,
	"safety_measures" jsonb NOT NULL,
	"compliance_codes" text[] NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"ai_enhanced" boolean DEFAULT false,
	"document_hash" text,
	"original_created_at" timestamp DEFAULT now() NOT NULL,
	"credits_cost" integer DEFAULT 1,
	"requires_signature" boolean DEFAULT false,
	"signature_status" text DEFAULT 'unsigned',
	"signed_at" timestamp,
	"signed_by" text,
	"signature_title" text,
	"signature_data" text,
	"signature_hash" text,
	"witness_name" text,
	"witness_signature" text,
	"witness_signed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"trade_specialty" text,
	"permissions" text[] DEFAULT '{}',
	"joined_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"project_name" text NOT NULL,
	"project_location" text NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"password" text NOT NULL,
	"name" text,
	"profile_image" text,
	"company_name" text NOT NULL,
	"abn" text,
	"phone" text,
	"address" text,
	"primary_trade" text NOT NULL,
	"license_number" text,
	"subscription_type" text DEFAULT 'trial',
	"subscription_status" text DEFAULT 'trial',
	"swms_credits" integer DEFAULT 1,
	"swms_generated" integer DEFAULT 0,
	"trial_used" boolean DEFAULT false,
	"subscription_expires_at" timestamp,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"notifications_enabled" boolean DEFAULT true,
	"two_factor_enabled" boolean DEFAULT false,
	"two_factor_secret" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "activity_assignments" ADD CONSTRAINT "activity_assignments_swms_id_swms_documents_id_fk" FOREIGN KEY ("swms_id") REFERENCES "public"."swms_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_assignments" ADD CONSTRAINT "activity_assignments_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_swms_id_swms_documents_id_fk" FOREIGN KEY ("swms_id") REFERENCES "public"."swms_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_tracking" ADD CONSTRAINT "compliance_tracking_swms_id_swms_documents_id_fk" FOREIGN KEY ("swms_id") REFERENCES "public"."swms_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_analytics" ADD CONSTRAINT "document_analytics_swms_id_swms_documents_id_fk" FOREIGN KEY ("swms_id") REFERENCES "public"."swms_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_analytics" ADD CONSTRAINT "document_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_code_downloads" ADD CONSTRAINT "practice_code_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_swms" ADD CONSTRAINT "project_swms_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_swms" ADD CONSTRAINT "project_swms_swms_id_swms_documents_id_fk" FOREIGN KEY ("swms_id") REFERENCES "public"."swms_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_swms" ADD CONSTRAINT "project_swms_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swms_approvals" ADD CONSTRAINT "swms_approvals_swms_id_swms_documents_id_fk" FOREIGN KEY ("swms_id") REFERENCES "public"."swms_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swms_approvals" ADD CONSTRAINT "swms_approvals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swms_comments" ADD CONSTRAINT "swms_comments_swms_id_swms_documents_id_fk" FOREIGN KEY ("swms_id") REFERENCES "public"."swms_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swms_comments" ADD CONSTRAINT "swms_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swms_comments" ADD CONSTRAINT "swms_comments_parent_id_swms_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."swms_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swms_documents" ADD CONSTRAINT "swms_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;