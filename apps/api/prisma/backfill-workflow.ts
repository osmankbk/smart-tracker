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
  const workflow = await prisma.workflow.findFirst({
    where: { id: 'default_workflow' },
  });

  const statuses = await prisma.workflowStatus.findMany({
    where: { workflowId: workflow?.id },
  });

  const map = Object.fromEntries(statuses.map((s) => [s.key, s.id]));

  const orders = await prisma.order.findMany();

  for (const order of orders) {
    const statusId = map[order.status];

    if (!statusId) continue;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        workflowId: workflow?.id,
        statusId,
      },
    });
  }

  console.log('Backfill complete');
}

main();
