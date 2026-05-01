import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole, StatusCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { WorkflowValidationService } from 'src/workflows/workflow-validation.service';

const validator = new WorkflowValidationService();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

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

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@smarttracker.dev',
    },
    update: {
      organizationId: organization.id,
      passwordHash,
    },
    create: {
      name: 'Demo Admin',
      email: 'admin@smarttracker.dev',
      passwordHash,
      role: UserRole.ADMIN,
      organizationId: organization.id,
    },
  });

  const defaultWorkflow = await prisma.workflow.upsert({
    where: {
      id: 'default_workflow',
    },
    update: {
      organizationId: organization.id,
    },
    create: {
      id: 'default_workflow',
      name: 'Default Workflow',
      organizationId: organization.id,
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

  validator.validateStatuses(statuses);

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

  const workflowStatuses = await prisma.workflowStatus.findMany({
    where: {
      workflowId: defaultWorkflow.id,
    },
  });

  const statusByKey = Object.fromEntries(
    workflowStatuses.map((status) => [status.key, status]),
  );

  const transitions = [
    ['OPEN', 'IN_PROGRESS'],
    ['IN_PROGRESS', 'DONE'],
    ['OPEN', 'CANCELED'],
    ['IN_PROGRESS', 'CANCELED'],
  ];

  for (const [fromKey, toKey] of transitions) {
    const fromStatus = statusByKey[fromKey];
    const toStatus = statusByKey[toKey];

    if (!fromStatus || !toStatus) {
      continue;
    }

    await prisma.workflowTransition.upsert({
      where: {
        workflowId_fromStatusId_toStatusId: {
          workflowId: defaultWorkflow.id,
          fromStatusId: fromStatus.id,
          toStatusId: toStatus.id,
        },
      },
      update: {},
      create: {
        workflowId: defaultWorkflow.id,
        fromStatusId: fromStatus.id,
        toStatusId: toStatus.id,
      },
    });
  }

  const startStatus = await prisma.workflowStatus.findFirst({
    where: {
      workflowId: defaultWorkflow.id,
      isStart: true,
    },
  });

  if (!startStatus) {
    throw new Error('No start status found for default workflow');
  }

  await prisma.order.upsert({
    where: {
      id: 'demo_order_1',
    },
    update: {
      organizationId: organization.id,
    },
    create: {
      id: 'demo_order_1',
      title: 'First persisted Smart Tracker order',
      description: 'This order was created by the Prisma seed script.',
      priority: 'HIGH',
      createdById: admin.id,
      assigneeId: admin.id,
      organizationId: organization.id,
      workflowId: defaultWorkflow.id,
      statusId: startStatus.id,
      status: 'OPEN',
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
