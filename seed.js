const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Creando usuario maestro...');
  
  // Encriptamos tu contraseña
  const hashedPassword = await bcrypt.hash('Tomi123.', 10);
  
  // Inyectamos el usuario en la base de datos
  const user = await prisma.user.upsert({
    where: { email: 'tomimoyanook@gmail.com' },
    update: {},
    create: {
      email: 'tomimoyanook@gmail.com',
      name: 'Tomi (Dueño)',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  
  console.log('✅ ¡Éxito! Usuario maestro creado con el email:', user.email);
}

main()
  .catch((e) => {
    console.error('❌ Hubo un error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });