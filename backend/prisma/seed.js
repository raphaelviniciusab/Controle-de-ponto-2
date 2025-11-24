const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const passwordHash = await bcrypt.hash('senha123', 10); // troque depois
  await prisma.user.upsert({
    where: { email: 'admin@localhost' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@localhost',
      password: passwordHash,
      role: 'ADMIN'
    }
  });
  console.log('Seed complete');
  await prisma.$disconnect();
})();
