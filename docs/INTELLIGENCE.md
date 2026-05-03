# Smart Tracker — Intelligence Layer

---

## 🧭 Overview

The Intelligence Layer is the core differentiator of Smart Tracker.

It transforms raw operational data into:

```txt
signals
insights
recommended actions
```

Smart Tracker is designed to help teams answer:

```txt
What matters?
Why does it matter?
What should we do next?
Who should own it?
```

It elevates the system from a task tracker into a:

```txt
decision engine for operational work
```

---

## 🧠 Core Intelligence Model

```txt
orders + activity logs + workflow metadata + assignments
→ signals
→ risk scoring
→ insights
→ recommendations
→ user decisions
```

The system evaluates not just state, but behavior over time:

```txt
movement
duration
regressions
ownership
team distribution
```

---

## 🧱 Intelligence Inputs

### 1. Order Data
```txt
status
priority
timestamps
assignee
```

### 2. Activity Logs (CRITICAL)
```txt
STATUS_CHANGED
STATUS_REGRESSION
COMMENT_ADDED
ASSIGNEE_CHANGED
```

Used for:
```txt
churn detection
regression detection
time-in-status
history tracking
```

### 3. Workflow Metadata
```txt
status categories (TODO / ACTIVE / REVIEW / QA / DONE / CANCELED)
```

### 4. Organization Context
```txt
members
assignments
workload distribution
```

---

## 🔍 Order Intelligence

Each order produces:

```txt
riskScore (0–100)
riskLevel
isStuck
reasons
recommendedActions
```

---

## 📈 Risk Scoring

Signals contributing to risk:

```txt
time in status
priority
regressions
churn
lack of activity
assignment state
```

### Risk Levels

```txt
LOW       → 0–24
MEDIUM    → 25–49
HIGH      → 50–79
CRITICAL  → 80–100
```

---

## ⚠️ Stuck Detection

```txt
HIGH priority + 12h
TODO + 24h
ACTIVE + 48h
REVIEW / QA + 36h
```

---

## 🔁 Regression & Churn

```txt
Regression = backward movement
Churn = excessive movement
```

Both increase risk due to instability.

---

## 👤 Assignment Awareness

```txt
Unassigned → increased risk
Unassigned + stuck → critical signal
```

---

## 👥 Workload Intelligence

```txt
orders per user
average workload
distribution across team
```

### ⚖️ Imbalance Detection

```txt
max workload - avg workload ≥ threshold
```

---

## 🤖 Smart Assignment Suggestions

The system recommends assignees for unassigned risk-bearing work.

### Inputs

```txt
workload
availability
order risk
```

### Logic (v1)

```txt
lower workload → higher score
zero workload → bonus
higher risk → stronger weighting
```

### Output

```txt
order
suggested assignee
reason
```

### Design Principle

```txt
System suggests.
Human decides.
```

---

## 📊 Dashboard Intelligence

Provides system-wide awareness:

### Metrics

```txt
total orders
stuck
high risk
critical risk
unassigned
high-risk unassigned
```

### Focus Orders

```txt
top risk + stuck orders
sorted by riskScore
```

### Summary

```txt
human-readable operational insight
```

### Recommended Actions

```txt
assign ownership
review critical items
rebalance workload
resolve blockers
```

---

## 🧠 Design Philosophy

```txt
Events > State
Signals > Raw Data
Insights > Storage
Guidance > Information
Explainability > Black Box
```

---

## ⚖️ Current Limitations

```txt
no capacity planning
no SLA weighting
no availability modeling
no skill matching
no historical velocity
no auto-assignment
```

---

## 🚀 Evolution Path

### Phase 1 (Current)
```txt
risk scoring
assignment awareness
workload visibility
assignment suggestions
```

### Phase 2 (Next)
```txt
structured recommendations
improved reasoning
better churn detection
```

### Phase 3
```txt
capacity planning (points, SLA, availability)
```

### Phase 4
```txt
skill-based assignment
predictive intelligence
AI-assisted insights
```

---

## ✅ Summary

Smart Tracker transforms operational data into:

```txt
risk awareness
ownership clarity
workload visibility
actionable decisions
```

The goal is not to replace human judgment.

The goal is to:

```txt
help teams make better decisions faster
```
