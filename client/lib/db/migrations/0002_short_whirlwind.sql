CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"court_id" uuid NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_status_check" CHECK ("booking"."status" IN ('pending', 'confirmed', 'cancelled', 'no_show'))
);
--> statement-breakpoint
ALTER TABLE "invoice" DROP CONSTRAINT "invoice_status_check";--> statement-breakpoint
ALTER TABLE "invoice" DROP CONSTRAINT "invoice_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "invoice" DROP CONSTRAINT "invoice_court_id_court_id_fk";
--> statement-breakpoint
ALTER TABLE "invoice" ALTER COLUMN "status" SET DEFAULT 'unpaid';--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "booking_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."court"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "invoice" DROP COLUMN "court_id";--> statement-breakpoint
ALTER TABLE "invoice" DROP COLUMN "start_at";--> statement-breakpoint
ALTER TABLE "invoice" DROP COLUMN "end_at";--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_status_check" CHECK ("invoice"."status" IN ('unpaid', 'paid', 'refunded'));