# Smart Tracker Roadmap

## Product Direction

Smart Tracker is an AI-powered operational intelligence system that helps teams understand:

- what matters
- why it matters
- what to do next

Every feature should answer:

> Does this help the user make a better decision faster?

If not, it should not be built.

---

## Core Differentiators

### 1. Decision Engine, Not Task Storage

Smart Tracker should not only store operational work. It should interpret it.

The system should generate:

- risk signals
- bottleneck alerts
- recommended actions
- daily intelligence briefs

---

### 2. Lifecycle Intelligence

Smart Tracker tracks how work moves through a lifecycle.

Important signals:

- time in current status
- total order age
- stuck work
- repeated transitions
- skipped phases
- bottlenecks by phase
- aging work by category

---

### 3. AI-Powered Insights

AI output should include:

- what is happening
- why it may be happening
- risk level
- recommended next action

AI should not only summarize.

---

### 4. Activity Log Is Foundational

Every meaningful change should be recorded.

Examples:

- order created
- status changed
- assigned
- priority changed
- canceled
- reopened by admin
- AI recommendation generated
- escalation triggered

Activity logs will power:

- audit history
- analytics
- AI context
- daily briefing
- anomaly detection

---

### 5. Configurable Workflows

Smart Tracker should support customer-defined lifecycles.

Examples:

Software/content workflow:

- Draft
- Peer Review
- Review Passed
- In QA
- QA Passed
- Published

Delivery workflow:

- Received
- Assigned
- Picking
- Packed
- Out for Delivery
- Delivered

Cannabis/compliance workflow:

- Intake
- Compliance Review
- QA Hold
- Ready for Sale
- Published

---

## Future Workflow Model

Statuses should eventually become configurable records, not hardcoded enums.

Potential models:

```prisma
model Workflow {
  id        String @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  statuses WorkflowStatus[]
  orders   Order[]
}

model WorkflowStatus {
  id          String @id @default(cuid())
  workflowId String
  name        String
  key         String
  order       Int
  category    StatusCategory
  isStart     Boolean @default(false)
  isTerminal  Boolean @default(false)

  workflow Workflow @relation(fields: [workflowId], references: [id])
}

enum StatusCategory {
  TODO
  ACTIVE
  REVIEW
  QA
  DONE
  CANCELED
}