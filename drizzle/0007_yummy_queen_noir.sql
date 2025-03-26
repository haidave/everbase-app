CREATE TYPE "public"."subscription_frequency" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"price" text NOT NULL,
	"currency" text DEFAULT 'CZK' NOT NULL,
	"frequency" "subscription_frequency" DEFAULT 'monthly' NOT NULL,
	"renewal_day" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;