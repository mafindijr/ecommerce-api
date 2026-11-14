CREATE TYPE "public"."reservation_status" AS ENUM('ACTIVE', 'CONSUMED', 'EXPIRED', 'RELEASED');--> statement-breakpoint
CREATE TABLE "stock_reservations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stock_reservations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderId" integer NOT NULL,
	"status" "reservation_status" DEFAULT 'ACTIVE' NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_reservations_order_unique" UNIQUE("orderId")
);
--> statement-breakpoint
CREATE TABLE "stock_reservation_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stock_reservation_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"reservationId" integer NOT NULL,
	"variantId" integer NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "stock_reservation_items_unique" UNIQUE("reservationId","variantId"),
	CONSTRAINT "stock_reservation_items_quantity_positive" CHECK ("stock_reservation_items"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "reservedStock" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_reservation_items" ADD CONSTRAINT "stock_reservation_items_reservationId_stock_reservations_id_fk" FOREIGN KEY ("reservationId") REFERENCES "public"."stock_reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_reservation_items" ADD CONSTRAINT "stock_reservation_items_variantId_product_variants_id_fk" FOREIGN KEY ("variantId") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_reserved_stock_check" CHECK ("product_variants"."reservedStock" <= "product_variants"."stock");--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_stock_non_negative" CHECK ("product_variants"."stock" >= 0);--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_reserved_stock_non_negative" CHECK ("product_variants"."reservedStock" >= 0);