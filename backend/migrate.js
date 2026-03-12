const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.split('?')[0] || "postgresql://postgres.zzvewclkeqskhlsqmreq:MashaweerDb123!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('Running manual schema migrations...');
  const statements = [
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "banUntil" TIMESTAMP(3) DEFAULT NULL;`,
    `ALTER TABLE "driver_profiles" ADD COLUMN IF NOT EXISTS "personalPhotoUrl" TEXT DEFAULT NULL;`,
    `ALTER TABLE "driver_profiles" ADD COLUMN IF NOT EXISTS "identityPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[];`,
    `ALTER TABLE "driver_profiles" ADD COLUMN IF NOT EXISTS "drivingLicensePhotos" TEXT[] DEFAULT ARRAY[]::TEXT[];`,
    `ALTER TABLE "driver_profiles" ADD COLUMN IF NOT EXISTS "carLicensePhotos" TEXT[] DEFAULT ARRAY[]::TEXT[];`,
    `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "isReady" BOOLEAN NOT NULL DEFAULT false;`,
    `ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "driverReadyAt" TIMESTAMP(3) DEFAULT NULL;`
  ];

  for (const sql of statements) {
    try {
      await pool.query(sql);
      console.log(`Successfully migrated: ${sql.split('ADD COLUMN IF NOT EXISTS')[1]}`);
    } catch (err) {
      console.error(`Migration failed: ${err.message}`);
    }
  }

  console.log('Migration complete!');
  await pool.end();
}

migrate();
