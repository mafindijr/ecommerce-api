CREATE TABLE "product_variants" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "productId" integer NOT NULL,
    "color" varchar(50),
    "size" varchar(50),
    "sku" varchar(100) NOT NULL,
    CONSTRAINT "product_variants_sku_unique" UNIQUE ("sku"),
    CONSTRAINT "product_variants_product_color_size_unique"
        UNIQUE ("productId", "color", "size"),
    CONSTRAINT "product_variants_productId_products_id_fk"
        FOREIGN KEY ("productId")
        REFERENCES "public"."products"("id")
);

INSERT INTO "product_variants" ("productId", "color", "size", "sku")
SELECT p."id", NULL, NULL, 'DEFAULT-' || p."id"::text
FROM "products" p;

ALTER TABLE "cart_items"
ADD COLUMN "variantId" integer;

UPDATE "cart_items" ci
SET "variantId" = pv."id"
FROM "product_variants" pv
WHERE pv."productId" = ci."productId"
  AND pv."sku" = 'DEFAULT-' || ci."productId"::text;

ALTER TABLE "cart_items"
ALTER COLUMN "variantId" SET NOT NULL;

ALTER TABLE "cart_items"
ADD CONSTRAINT "cart_items_variantId_product_variants_id_fk"
FOREIGN KEY ("variantId")
REFERENCES "public"."product_variants"("id");

ALTER TABLE "cart_items"
DROP CONSTRAINT "cart_items_cart_product_unique";

ALTER TABLE "cart_items"
DROP CONSTRAINT "cart_items_productId_products_id_fk";

ALTER TABLE "cart_items"
DROP COLUMN "productId";

ALTER TABLE "cart_items"
ADD CONSTRAINT "cart_items_cart_variant_unique"
UNIQUE ("cartId", "variantId");