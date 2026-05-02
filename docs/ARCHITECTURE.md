# Smart Tracker — Architecture

---

## 🧭 Overview

Smart Tracker is a **multi-tenant, workflow-driven, event-based system** built to power:

* task/workflow management
* operational intelligence
* cross-system integrations

The system is designed for:

```txt
scalability
flexibility
data integrity
future AI-driven insights
```

---

## 🧱 Monorepo Structure

```txt
apps/
  web/   → Next.js frontend
  api/   → NestJS backend
```

---

## 🧠 Core Architecture Layers

### 1. Domain Layer

Core business logic modules:

```txt
auth
orders
workflows
intelligence
comments
notifications
invites
```

Each module owns:

* its data access
* its business rules
* its API endpoints

---

### 2. Data Layer

* PostgreSQL (primary database)
* Prisma ORM
* relational, strongly structured data

Key design principles:

```txt
- explicit relationships
- referential integrity
- minimal duplication (with intentional denormalization where useful)
```

---

### 3. Event Layer (CRITICAL)

Smart Tracker is **event-driven at its core**.

```txt
ActivityLog is foundational
```

All meaningful actions are recorded:

```txt
ORDER_CREATED
STATUS_CHANGED
STATUS_REGRESSION
CANCELED
COMMENT_ADDED
```

This enables:

* audit history
* intelligence computation
* future AI context
* analytics

---

### 4. Intelligence Layer

The system computes insights from raw data:

```txt
orders + activity logs → signals → intelligence
```

Current capabilities:

* risk scoring
* stuck detection
* regression detection
* churn detection
* time-in-status tracking

Output:

```txt
Dashboard Intelligence Brief
Order-level insights
Recommended actions
```

---

### 5. Collaboration Layer

Supports team interaction:

```txt
comments
mentions
notifications
invites
```

This layer feeds the intelligence system with **human context**.

---

### 6. Multi-Tenant Layer

All core entities are scoped to:

```txt
Organization
```

```txt
Organization
  → Users
  → Orders
  → Workflows
  → Comments
  → Notifications
  → Invites
```

JWT includes:

```txt
organizationId
```

All queries are scoped by organization.

---

## 🔄 Workflow System

Workflows define lifecycle behavior.

### Entities:

```txt
Workflow
WorkflowStatus
WorkflowTransition
```

### Key principles:

* statuses are configurable
* statuses have categories (system meaning)
* transitions define allowed movement
* workflows are per-organization

---

## 🔐 Auth & Security

* JWT-based authentication
* role-based access (initial: ADMIN / MEMBER)
* organization-scoped data access

Future:

```txt
role guards
ownership checks
rate limiting
token rotation
```

---

## 🔌 Integration-Ready Design

System is built to support:

```txt
external systems (Jira, Notion, CRMs)
webhooks
event ingestion
two-way sync
```

Future fields:

```txt
externalSource
externalId
```

---

## 🚀 Scalability Direction

Current system is **foundation-phase scalable**.

Future scaling layers:

```txt
Redis (caching / queues)
background jobs
read replicas
API horizontal scaling
event streaming
```

---

## 🧠 Design Philosophy

```txt
Events > State
Intelligence > Storage
Flexibility > Hardcoding
Backend enforces rules
Frontend guides users
```

---
