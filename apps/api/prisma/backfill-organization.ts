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
  const organization = await prisma.organization.upsert({
    where: {
      slug: 'demo-org',
    },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
    },
  });

  await prisma.user.updateMany({
    where: {
      organizationId: null,
    },
    data: {
      organizationId: organization.id,
    },
  });

  await prisma.workflow.updateMany({
    where: {
      organizationId: null,
    },
    data: {
      organizationId: organization.id,
    },
  });

  await prisma.order.updateMany({
    where: {
      organizationId: null,
    },
    data: {
      organizationId: organization.id,
    },
  });

  console.log(`Backfilled organization: ${organization.name}`);
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
