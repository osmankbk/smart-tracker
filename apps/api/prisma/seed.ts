import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@smarttracker.dev',
    },
    update: {
      passwordHash,
    },
    create: {
      name: 'Admin Demo',
      email: 'admin@smarttracker.dev',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.order.upsert({
    where: {
      id: 'demo_order_1',
    },
    update: {},
    create: {
      id: 'demo_order_1',
      title: 'First persisted Smart Tracker order',
      description: 'This order was created by the Prisma seed script.',
      priority: 'HIGH',
      createdById: admin.id,
      assigneeId: admin.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
