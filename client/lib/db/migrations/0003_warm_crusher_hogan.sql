CREATE TABLE "court_closed_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"court_id" uuid NOT NULL,
	"closed_date" date NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "court_operating_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"court_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" time,
	"close_time" time,
	"is_open" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "day_of_week_check" CHECK ("court_operating_hours"."day_of_week" >= 0 AND "court_operating_hours"."day_of_week" <= 6)
);
--> statement-breakpoint
ALTER TABLE "court" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "court_closed_dates" ADD CONSTRAINT "court_closed_dates_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."court"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "court_operating_hours" ADD CONSTRAINT "court_operating_hours_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."court"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "court_closed_dates_unique" ON "court_closed_dates" USING btree ("court_id","closed_date");--> statement-breakpoint
CREATE UNIQUE INDEX "court_operating_hours_unique" ON "court_operating_hours" USING btree ("court_id","day_of_week");--> statement-breakpoint
ALTER TABLE "court" ADD CONSTRAINT "court_status_check" CHECK ("court"."status" IN ('active', 'maintenance', 'hidden'));