CREATE TABLE "owner_application" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_name" text NOT NULL,
	"contact_number" text NOT NULL,
	"location" text NOT NULL,
	"permit_url" text NOT NULL,
	"id_url" text NOT NULL,
	"court_pic_url" text NOT NULL,
	"lobby_pic_url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "owner_application_status_check" CHECK ("owner_application"."status" IN ('pending', 'approved', 'rejected'))
);
--> statement-breakpoint
ALTER TABLE "owner_application" ADD CONSTRAINT "owner_application_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;