CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'on_hold', 'done');--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "status" "task_status" DEFAULT 'todo' NOT NULL;