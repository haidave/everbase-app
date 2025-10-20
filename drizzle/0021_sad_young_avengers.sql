ALTER TABLE "budget_items" ALTER COLUMN "amount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "budget_items" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "budget_items" ALTER COLUMN "amount_paid" SET NOT NULL;