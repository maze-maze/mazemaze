ALTER TABLE "user" ADD COLUMN "user_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_user_name_unique" UNIQUE("user_name");