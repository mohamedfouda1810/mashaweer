const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const pool = new Pool({ connectionString: 'postgresql://postgres.zzvewclkeqskhlsqmreq:MashaweerDb123%21@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require' });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Connecting...");
  await prisma.$connect();
  console.log("Connected!");
  const users = await prisma.user.findMany({ take: 1 });
  console.log("Successfully fetched users:", users.length);
  await prisma.$disconnect();
}
main().catch(console.error);
