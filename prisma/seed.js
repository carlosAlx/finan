const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  const alice = await prisma.user.upsert({
    where: { email: 'carlos@example.com' },
    update: { name: 'carlos' },
    create: {
      email: 'carlos@example.com',
      name: 'carlos',
      passwordHash: bcrypt.hashSync('carlos123', 10),
      balanceCents: 0,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: { name: 'Bob' },
    create: {
      email: 'bob@example.com',
      name: 'Bob',
      passwordHash: bcrypt.hashSync('bob123', 10),
      balanceCents: 0,
    },
  });

  const txCount = await prisma.transaction.count();
  if (txCount === 0) {
    console.log('Criando transações iniciais...');
    await prisma.transaction.create({
      data: { type: 'DEPOSIT', amountCents: 10000, toUserId: alice.id },
    });
    await prisma.transaction.create({
      data: { type: 'DEPOSIT', amountCents: 5000, toUserId: bob.id },
    });
    await prisma.transaction.create({
      data: { type: 'TRANSFER', amountCents: 2000, fromUserId: alice.id, toUserId: bob.id },
    });

    await prisma.user.update({ where: { id: alice.id }, data: { balanceCents: 8000 } });
    await prisma.user.update({ where: { id: bob.id }, data: { balanceCents: 7000 } });
  } else {
    console.log('Transações já existem. Ignorando seed de transações.');
  }

  console.log('Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });