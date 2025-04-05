ALTER TABLE "tasks" RENAME COLUMN "text" TO "title";--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "description" text;