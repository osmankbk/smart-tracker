import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole, StatusCategory } from '@prisma/client';
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

  const defaultWorkflow = await prisma.workflow.upsert({
    where: {
      id: 'default_workflow',
    },
    update: {},
    create: {
      id: 'default_workflow',
      name: 'Default Workflow',
    },
  });

  const statuses = [
    {
      key: 'OPEN',
      name: 'Open',
      order: 1,
      category: StatusCategory.TODO,
      isStart: true,
      isTerminal: false,
    },
    {
      key: 'IN_PROGRESS',
      name: 'In Progress',
      order: 2,
      category: StatusCategory.ACTIVE,
      isStart: false,
      isTerminal: false,
    },
    {
      key: 'DONE',
      name: 'Done',
      order: 3,
      category: StatusCategory.DONE,
      isStart: false,
      isTerminal: true,
    },
    {
      key: 'CANCELED',
      name: 'Canceled',
      order: 4,
      category: StatusCategory.CANCELED,
      isStart: false,
      isTerminal: true,
    },
  ];

  for (const status of statuses) {
    await prisma.workflowStatus.upsert({
      where: {
        workflowId_key: {
          workflowId: defaultWorkflow.id,
          key: status.key,
        },
      },
      update: {
        name: status.name,
        order: status.order,
        category: status.category,
        isStart: status.isStart,
        isTerminal: status.isTerminal,
      },
      create: {
        workflowId: defaultWorkflow.id,
        key: status.key,
        name: status.name,
        order: status.order,
        category: status.category,
        isStart: status.isStart,
        isTerminal: status.isTerminal,
      },
    });
  }
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
