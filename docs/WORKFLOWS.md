# Smart Tracker — Workflow System

---

## 🧭 Overview

The workflow system defines how work moves through its lifecycle.

It replaces hardcoded status logic with a **flexible, configurable system**.

---

## 🧱 Core Entities

### Workflow

Represents a lifecycle.

Example:

```txt
Default Workflow
```

---

### WorkflowStatus

Each step in the lifecycle.

Fields:

```txt
name       → user-facing label
key        → system identifier
order      → position in lifecycle
category   → system meaning
isStart    → entry point
isTerminal → end state
```

---

### WorkflowTransition

Defines allowed movement between statuses.

```txt
fromStatus → toStatus
```

---

## 🧠 Status Categories

Categories give system-level meaning.

```txt
TODO
ACTIVE
REVIEW
QA
DONE
CANCELED
```

Future:

```txt
BLOCKED
```

---

## 🔄 Default Workflow

```txt
Open         → TODO      (start)
In Progress  → ACTIVE
Done         → DONE      (terminal)
Canceled     → CANCELED  (terminal)
```

---

## 🔁 Default Transitions

```txt
Open → In Progress
In Progress → Done
Open → Canceled
In Progress → Canceled
```

---

## ⚠️ Transition Rules

Transitions are enforced:

```txt
invalid movement is blocked
```

Example:

```txt
Done → Open ❌
In Progress → Open ❌
```

---

## 🔁 Regression Detection

Backward movement is tracked:

```txt
IN_PROGRESS → OPEN
```

Logged as:

```txt
STATUS_REGRESSION
```

---

## 🔄 Churn Detection

Frequent switching:

```txt
OPEN → IN_PROGRESS → OPEN → IN_PROGRESS
```

Signals instability.

---

## ✅ Workflow Validation Rules

Each workflow must:

```txt
- have exactly one start status
- have at least one terminal status
- have unique order values
- use valid categories
```

---

## 🧠 Why this system matters

This enables:

```txt
flexible workflows per organization
accurate lifecycle tracking
intelligence computation
future automation
```

---
