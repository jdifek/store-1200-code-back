const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'givotkov11@gmail.com';
  const plainPassword = '123456'; // пароль, который ты введёшь при логине
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin created:', email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());