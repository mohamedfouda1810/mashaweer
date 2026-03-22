import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminAccounts = [
    {
      email: 'mohad@mashadm.com',
      password: 'Mkelfu256@!@',
      firstName: 'Mohamed',
      lastName: 'Admin',
      phone: '01000000001',
    },
    {
      email: 'omaad@mashadm.com',
      password: 'Omi457ji#$#',
      firstName: 'Omar',
      lastName: 'Admin',
      phone: '01000000002',
    },
  ];

  for (const admin of adminAccounts) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(admin.password, salt);

    await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        role: 'ADMIN',
        isVerified: true,
        passwordHash,
      },
      create: {
        email: admin.email,
        phone: admin.phone,
        passwordHash,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: 'ADMIN',
        isVerified: true,
        wallet: {
          create: { balance: 0 },
        },
      },
    });

    console.log(`✅ Admin account ready: ${admin.email}`);
  }

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
