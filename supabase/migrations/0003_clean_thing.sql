ALTER TABLE "comment" RENAME COLUMN "user_id" TO "user_name";--> statement-breakpoint
ALTER TABLE "episode" RENAME COLUMN "user_id" TO "user_name";--> statement-breakpoint
ALTER TABLE "reaction" RENAME COLUMN "user_id" TO "user_name";--> statement-breakpoint
ALTER TABLE "comment" DROP CONSTRAINT "comment_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "episode" DROP CONSTRAINT "episode_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "reaction" DROP CONSTRAINT "reaction_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_name_user_user_name_fk" FOREIGN KEY ("user_name") REFERENCES "public"."user"("user_name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episode" ADD CONSTRAINT "episode_user_name_user_user_name_fk" FOREIGN KEY ("user_name") REFERENCES "public"."user"("user_name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reaction" ADD CONSTRAINT "reaction_user_name_user_user_name_fk" FOREIGN KEY ("user_name") REFERENCES "public"."user"("user_name") ON DELETE cascade ON UPDATE no action;