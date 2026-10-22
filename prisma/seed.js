const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EduAgent Pro database...');

  const studentHash = await bcrypt.hash('demo123', 10);
  const educatorHash = await bcrypt.hash('demo123', 10);
  const adminHash = await bcrypt.hash('Admin@123', 10);

  // 1. Seed Institution
  const institution = await prisma.institution.upsert({
    where: { domain: 'stanford.edu' },
    update: {},
    create: {
      name: 'Stanford University (Demo Campus)',
      domain: 'stanford.edu',
      seatsAllocated: 100,
      seatsUsed: 12,
      adminEmail: 'admin@eduagent.ai'
    }
  });

  // 2. Seed Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eduagent.ai' },
    update: {
      role: 'SUPER_ADMIN',
      tier: 'INSTITUTIONAL',
      institutionId: institution.id
    },
    create: {
      id: 'usr_super_admin_root',
      name: 'Super Admin',
      email: 'admin@eduagent.ai',
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
      tier: 'INSTITUTIONAL',
      institutionId: institution.id
    }
  });

  // 3. Seed Educator
  const educator = await prisma.user.upsert({
    where: { email: 'educator@eduagent.ai' },
    update: {
      role: 'EDUCATOR',
      tier: 'PRO',
      institutionId: institution.id
    },
    create: {
      id: 'usr_demo_educator_1',
      name: 'Prof. Eleanor Vance',
      email: 'educator@eduagent.ai',
      passwordHash: educatorHash,
      role: 'EDUCATOR',
      tier: 'PRO',
      institutionId: institution.id
    }
  });

  // 4. Seed Student
  const student = await prisma.user.upsert({
    where: { email: 'student@eduagent.ai' },
    update: {
      role: 'STUDENT',
      tier: 'BASIC'
    },
    create: {
      id: 'usr_demo_student_1',
      name: 'Alex Johnson',
      email: 'student@eduagent.ai',
      passwordHash: studentHash,
      role: 'STUDENT',
      tier: 'BASIC'
    }
  });

  console.log('✅ Seeding complete!');
  console.log('  Student User ID:', student.id);
  console.log('  Educator User ID:', educator.id);
  console.log('  Admin User ID:', admin.id);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
