-- Remove isReady column from Booking (client "I am ready" feature removal)
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "isReady";

-- Add payment method tracking to Booking
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'CASH';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "amountPaid" DECIMAL(10,2);

-- Add dynamic pricing fields to Trip
ALTER TABLE "Trip" ADD COLUMN IF NOT EXISTS "pricePerSeat" DECIMAL(10,2) DEFAULT 0 NOT NULL;
ALTER TABLE "Trip" ADD COLUMN IF NOT EXISTS "suggestedPricePerSeat" DECIMAL(10,2);

-- Backfill pricePerSeat for existing trips: price / totalSeats
UPDATE "Trip" SET "pricePerSeat" = ROUND("price" / "totalSeats", 2) WHERE "pricePerSeat" = 0 OR "pricePerSeat" IS NULL;
