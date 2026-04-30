import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      activityLogs: true,
    },
  });

  for (const order of orders) {
    const hasCreatedLog = order.activityLogs.some(
      (log) => log.action === 'ORDER_CREATED',
    );

    if (hasCreatedLog) {
      continue;
    }

    await prisma.activityLog.create({
      data: {
        orderId: order.id,
        actorId: order.createdById,
        action: 'ORDER_CREATED',
        fromStatus: null,
        toStatus: order.status,
        createdAt: order.createdAt,
      },
    });

    console.log(`Backfilled ORDER_CREATED for order ${order.id}`);
  }
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
