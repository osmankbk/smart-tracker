# Smart Tracker — Product & Engineering Roadmap

---

## 🎯 Product Vision

Smart Tracker is an **AI-powered operational intelligence system**.

It helps teams understand:

* what matters
* why it matters
* what to do next

> Smart Tracker is not a task manager.
> It is a **decision engine for operational work**.

---

## 🔑 Core Principle

Every feature must answer:

> **Does this help the user make a better decision faster?**

If not, it should not be built.

---

## 🧠 Core Differentiators

### 1. Decision Engine, Not Task Storage

Traditional tools:

* store tasks
* display status

Smart Tracker:

* interprets work
* detects risk
* recommends action

---

### 2. Lifecycle Intelligence

Smart Tracker tracks **how work evolves over time**, not just its current state.

Key signals:

* time in current status
* total order age
* status transitions
* regressions (backward movement)
* churn (too many changes)
* inactivity
* bottlenecks by phase

---

### 3. AI-Powered Insights (Future Layer)

System must provide:

* what is happening
* why it is happening
* risk level
* recommended action

Not just summaries — **explanations + actions**

---

### 4. Activity Log Is Foundational

Every meaningful change must be recorded.

Examples:

* order created
* status changed
* status regression
* canceled
* assigned (future)
* comment added (future)
* mention triggered (future)

This powers:

* intelligence engine
* audit history
* AI context
* analytics
* daily brief

---

### 5. Workflow-Driven System

Orders follow workflows:

```txt
Workflow → WorkflowStatus → Order
```

Workflows are:

* configurable
* ordered
* categorized

---

## 🧱 Workflow System

### Workflow

```txt
Represents a lifecycle (e.g. content, delivery, QA)
```

### WorkflowStatus

Each status includes:

* name (user-facing)
* key (system identifier)
* order (position in lifecycle)
* category (system meaning)
* isStart
* isTerminal

---

## 🧠 Status Categories (System Meaning)

```ts
TODO
ACTIVE
REVIEW
QA
DONE
CANCELED
// Future:
BLOCKED
```

### Why categories exist

They allow intelligence to work across custom workflows.

Example:

| Custom Status    | Category |
| ---------------- | -------- |
| Peer Review      | REVIEW   |
| Manager Approval | REVIEW   |
| In QA            | QA       |
| Published        | DONE     |

---

## 🔄 Lifecycle Behavior Signals

### Status Change

Normal forward movement

### Regression

Backward movement:

```txt
IN_PROGRESS → OPEN
```

Tracked as:

```txt
STATUS_REGRESSION
```

### Churn

Too many movements:

```txt
OPEN → IN_PROGRESS → OPEN → IN_PROGRESS
```

Indicates instability.

---

## ⚠️ Risk Scoring System

Risk is computed from:

* priority
* time in status
* order age
* inactivity
* regressions
* churn

Risk levels:

```txt
LOW
MEDIUM
HIGH
CRITICAL
```

---

## 📊 Dashboard Intelligence Brief

System generates:

* summary of what matters today
* key metrics
* high-risk orders
* stuck work
* recommended actions

---

## 🧠 Intelligence Pipeline

```txt
Raw Data → Activity Logs → Signals → Intelligence → Actions
```

---

## 🧩 Future Systems (Planned)

---

### 1. Organization / Workspace Model

```txt
Organization
  → Users
  → Roles / Permissions
  → Orders
```

Behavior:

* users belong to an organization
* users can access org work by default
* visibility controlled by role/permissions

---

### 2. Roles & Permissions

Examples:

```txt
ADMIN
MANAGER
MEMBER
VIEWER
```

Controls:

* visibility
* editing
* overrides
* workflow configuration

---

### 3. Comments System

Users can:

* add comments to orders
* discuss work
* provide updates

---

### 4. Mentions (@username)

Users can:

```txt
@mention teammates in comments
```

System will:

* notify mentioned users
* link directly to the order/comment

---

### 5. Notifications System

Triggers:

* mentions
* assignment (future)
* high-risk alerts (future)
* stuck work alerts (future)

---

### 6. Admin Override Flow

Locked states:

```txt
DONE
CANCELED
```

Admins can:

```txt
reopen orders with required reason
```

This must:

* be logged
* preserve audit trail

---

### 7. Activity Log Enhancements

Future improvements:

* fromStatusId / toStatusId
* metadata field
* action normalization
* shared constants across services

---

### 8. Workflow Validation Rules

System should enforce:

* exactly one start status
* at least one terminal status
* valid category assignment
* ordered lifecycle

---

### 9. Transition Rules (Future)

Optional:

```txt
Allowed transitions between statuses
```

Example:

```txt
OPEN → IN_PROGRESS → REVIEW → DONE
```

Not:

```txt
DONE → IN_PROGRESS (unless override)
```

---

### 10. Advanced Intelligence (Future)

* regression pattern detection
* churn cycles
* bottleneck detection
* SLA violations
* category-based aging
* cross-order analysis

---

### 11. Autopilot Actions (Future)

System may:

* auto-escalate stuck work
* suggest reassignment
* suggest next status
* prioritize tasks dynamically

---

### 12. AI Layer (Future)

Use OpenAI to:

* explain risks
* summarize activity
* recommend actions
* generate daily brief narratives

---

## 🧠 Engineering Philosophy

* data > UI
* events > state
* interpretation layer > raw storage
* extensibility over shortcuts
* backward compatibility during migrations
* explicit over implicit logic

---

## 🚀 Long-Term Direction

Smart Tracker evolves into:

```txt
Operational Intelligence Platform
```

Not:

```txt
Task Tracker
```

---

## ✅ Completed — Core SaaS Foundation

### Multi-Tenancy

* Organization model
* Users scoped to organization
* Orders scoped to organization
* Workflows scoped to organization
* JWT includes organizationId

### Workflow System

* Workflow / Status / Transition models
* Status categories
* Transition enforcement
* Regression detection
* Churn detection
* Workflow validation rules

### Intelligence Engine

* risk scoring
* stuck detection
* regression tracking
* churn tracking
* dashboard intelligence brief

### Collaboration

* comments
* mentions
* notifications

### Organization Growth

* invite system
* invite acceptance flow
* admin role assignment

---

