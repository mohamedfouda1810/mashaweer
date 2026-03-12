import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as pg from 'pg';
const { Pool } = pg;
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL?.split('?')[0];
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Seeding admin accounts...');

  const admins = [
    {
      email: 'mohad@mashadm.com',
      password: 'Mkelfu256@!@',
      firstName: 'Mohamed',
      lastName: 'Admin',
    },
    {
      email: 'omaad@mashadm.com',
      password: 'Omi457ji#$#',
      firstName: 'Omaad',
      lastName: 'Admin',
    },
  ];

  for (const admin of admins) {
    const existing = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (existing) {
      console.log(`Admin ${admin.email} already exists.`);
      continue;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(admin.password, salt);

    await prisma.user.create({
      data: {
        email: admin.email,
        phone: `ADMIN_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // Required unique phone
        passwordHash,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: Role.ADMIN,
        isVerified: true,
      },
    });

    console.log(`Created admin account: ${admin.email}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
