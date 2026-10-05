CREATE TYPE "public"."user_role" AS ENUM('CUSTOMER', 'ADMIN');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'CUSTOMER' NOT NULL;