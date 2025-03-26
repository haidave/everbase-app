ALTER TABLE "subscriptions" ALTER COLUMN "renewal_day" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "renewal_month" integer;