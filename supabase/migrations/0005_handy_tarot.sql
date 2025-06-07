ALTER TABLE "recording" DROP CONSTRAINT "recording_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "recording" DROP COLUMN "user_id";