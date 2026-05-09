CREATE TYPE "public"."activity_status" AS ENUM('pending', 'confirmed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('shield', 'unshield', 'send', 'subscribe', 'cancel_subscription', 'pause_subscription', 'resume_subscription', 'card_created', 'card_linked', 'card_unlinked', 'payment_received');--> statement-breakpoint
CREATE TYPE "public"."billing_attempt_status" AS ENUM('pending', 'confirmed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle_status" AS ENUM('draft', 'open', 'paid', 'uncollectible', 'void');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'incomplete', 'active', 'past_due', 'unpaid', 'paused', 'canceled', 'incomplete_expired');--> statement-breakpoint
CREATE TABLE "billing_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_address" text NOT NULL,
	"subscription_id" text NOT NULL,
	"billing_cycle_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"idempotency_key" text,
	"requested_amount_ref" text NOT NULL,
	"pulled_amount_ref" text,
	"user_op_hash" text,
	"tx_hash" text,
	"status" "billing_attempt_status" DEFAULT 'pending' NOT NULL,
	"failure_class" text,
	"failure_reason" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "billing_cycles" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_address" text NOT NULL,
	"subscription_id" text NOT NULL,
	"cycle_start" timestamp DEFAULT now() NOT NULL,
	"cycle_end" timestamp DEFAULT now() NOT NULL,
	"status" "billing_cycle_status" DEFAULT 'draft' NOT NULL,
	"attempt_count" integer DEFAULT 0,
	"next_attempt_at" timestamp,
	"last_failure_class" text,
	"last_failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_address" text NOT NULL,
	"card_address" text,
	"type" "activity_type" NOT NULL,
	"status" "activity_status" DEFAULT 'confirmed' NOT NULL,
	"amount" text,
	"token" text,
	"counterparty" text,
	"merchant_address" text,
	"plan_name" text,
	"subscription_id" text,
	"tx_hash" text,
	"user_op_hash" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "merchant_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_address" text NOT NULL,
	"plan_ref" text,
	"name" text NOT NULL,
	"description" text,
	"interval" text NOT NULL,
	"billing_interval_seconds" integer NOT NULL,
	"amount_ref_micros" text NOT NULL,
	"status" "plan_status" DEFAULT 'active' NOT NULL,
	"checkout_slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_address" text NOT NULL,
	"subscription_ref" text,
	"plan_ref" text,
	"plan_id" text NOT NULL,
	"customer_card_address" text NOT NULL,
	"customer_smart_wallet" text,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp DEFAULT now() NOT NULL,
	"current_period_end" timestamp DEFAULT now() NOT NULL,
	"next_charge_at" timestamp,
	"last_charge_at" timestamp,
	"failure_count" integer DEFAULT 0,
	"max_allowance_ref_micros" text,
	"max_allowance_handle" text,
	"cancel_at_period_end" integer DEFAULT 0,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_attempts_merchant" ON "billing_attempts" USING btree ("merchant_address");--> statement-breakpoint
CREATE INDEX "idx_attempts_cycle" ON "billing_attempts" USING btree ("billing_cycle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_attempts_txhash" ON "billing_attempts" USING btree ("tx_hash");--> statement-breakpoint
CREATE INDEX "idx_cycles_merchant" ON "billing_cycles" USING btree ("merchant_address");--> statement-breakpoint
CREATE INDEX "idx_cycles_subscription" ON "billing_cycles" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_activities_wallet" ON "customer_activities" USING btree ("wallet_address","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activities_card" ON "customer_activities" USING btree ("card_address","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_plans_merchant" ON "merchant_plans" USING btree ("merchant_address");--> statement-breakpoint
CREATE INDEX "idx_subs_merchant" ON "subscriptions" USING btree ("merchant_address");--> statement-breakpoint
CREATE INDEX "idx_subs_card" ON "subscriptions" USING btree ("customer_card_address");--> statement-breakpoint
CREATE INDEX "idx_subs_status" ON "subscriptions" USING btree ("status");