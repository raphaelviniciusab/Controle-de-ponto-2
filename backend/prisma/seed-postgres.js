const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar se o admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@localhost' }
    });

    if (existingAdmin) {
      console.log('✓ Admin já existe no banco de dados');
      return;
    }

    // Criar o admin
    const hashedPassword = await bcrypt.hash('senha123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@localhost',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ATIVO'
      }
    });

    console.log('✓ Usuário admin criado com sucesso!');
    console.log('  Email: admin@localhost');
    console.log('  Senha: senha123');
    console.log('  ⚠️  ALTERE A SENHA EM PRODUÇÃO!');
  } catch (error) {
    console.error('✗ Erro ao criar admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
