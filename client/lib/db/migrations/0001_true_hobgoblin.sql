ALTER TABLE "profiles" DROP CONSTRAINT "profiles_role_check";--> statement-breakpoint
ALTER TABLE "court" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "court" ADD COLUMN "price_per_hour" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "court" ADD COLUMN "court_type" text;--> statement-breakpoint
ALTER TABLE "court" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "court" ADD CONSTRAINT "court_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "court" ADD CONSTRAINT "court_type_check" CHECK ("court"."court_type" IS NULL OR "court"."court_type" IN ('indoor', 'outdoor'));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_role_check" CHECK ("profiles"."role" IN ('user', 'admin', 'owner'));