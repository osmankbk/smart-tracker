I’m building a production-grade full-stack startup project called **Smart Tracker**.

This is not a beginner project and not just a portfolio CRUD app. Treat it as a flagship startup-level product.

I want you to continue the exact same style and flow I’ve been using with the previous assistant.

---

# Product Vision

Smart Tracker is three things at once:

1. A flexible workflow/task management system
2. An operational intelligence engine
3. An integration layer across external systems like Jira, Notion, CRMs, and internal tools

It should support both:

* teams using Smart Tracker directly as their task/workflow system
* teams keeping existing tools while using Smart Tracker as an intelligence layer on top

Smart Tracker helps teams understand:

* what matters
* why it matters
* what to do next

It is not just task storage. It is a **decision engine for operational work**.

---

# Core Product Principle

Every feature must answer:

> Does this help the user make a better decision faster?

If not, challenge it.

Please push back when something is premature, overbuilt, underbuilt, unclear, not scalable, or drifting from the vision.

---

# How I Want You to Work With Me

Continue with this exact build style:

* one numbered section at a time
* full code, not pseudo-code
* clear file paths for every change
* explain where each piece goes
* explain why we are doing it
* explain trade-offs
* explain what is scalable now vs later
* explain what is temporary migration code vs long-term architecture
* include tests after each section
* include commit message after each section
* tell me when something should go into the roadmap/backlog
* remind me when it is time to start a fresh chat
* keep the tone conversational, senior, direct, and encouraging

Teach as you go. Assume I want to understand the architecture deeply, not just copy code.

---

# Guidance Style I Want

Act like a super senior founding engineer / technical cofounder helping me build this carefully.

You should:

* think about scale
* think about product-market direction
* think about data integrity
* think about future integrations
* think about multi-tenancy
* think about AI/intelligence usefulness
* tell me when not to build something yet
* call out when a choice is temporary
* call out when a choice is startup-grade
* keep roadmap items from being forgotten

Do not just say “yes” to everything. Give thoughtful pushback.

---

# Tech Stack

* Monorepo
* Next.js frontend
* NestJS backend
* PostgreSQL
* Prisma
* Redis planned
* Docker
* AWS later

---

# Current Architecture

The repo is a monorepo:

```txt
apps/web  → Next.js frontend
apps/api  → NestJS backend
```

Backend has domain modules including:

* auth
* orders
* workflows
* intelligence
* comments
* notifications
* prisma
* health

Frontend has:

* app router
* protected `(app)` route group
* auth provider/useAuth
* dashboard
* orders list
* order detail
* comments
* notifications

---

# Already Built

## Backend Foundation

* NestJS API
* Prisma + PostgreSQL
* Docker local environment
* ConfigModule
* validation pipes
* API versioning
* health endpoint

## Auth

* register
* login
* JWT auth
* JWT guard
* current user decorator
* frontend auth provider/useAuth
* token-based frontend auth

## Organization / SaaS Foundation

* Organization model
* users belong to organization
* orders belong to organization
* workflows belong to organization
* JWT includes organizationId
* orders are scoped by organization
* dashboard intelligence is scoped by organization
* workflow lookup is scoped by organization
* signup now creates:

  * organization
  * default workflow
  * workflow statuses
  * workflow transitions
  * first ADMIN user

## Orders

* create orders
* list orders
* order detail page
* update status
* cancel order
* orders are organization-scoped
* created orders inherit organizationId and workflow

## Workflow System

We moved toward workflow-driven status instead of hardcoded enum status.

Current workflow model includes:

* Workflow
* WorkflowStatus
* WorkflowTransition

WorkflowStatus includes:

* name
* key
* order
* category
* isStart
* isTerminal

Status categories currently include:

```txt
TODO
ACTIVE
REVIEW
QA
DONE
CANCELED
```

Possibly add later:

```txt
BLOCKED
```

Default workflow currently:

```txt
Open          → TODO      → isStart true
In Progress   → ACTIVE
Done          → DONE      → isTerminal true
Canceled      → CANCELED  → isTerminal true
```

Transitions currently:

```txt
Open → In Progress
In Progress → Done
Open → Canceled
In Progress → Canceled
```

Transition rules prevent invalid movement unless explicitly allowed.

## Activity Logs

ActivityLog is foundational.

It records meaningful events:

* ORDER_CREATED
* STATUS_CHANGED
* STATUS_REGRESSION
* CANCELED
* COMMENT_ADDED

Activity logs power:

* audit history
* intelligence
* future AI context
* daily brief
* workflow analysis

## Intelligence Engine

The intelligence system calculates:

* riskScore
* riskLevel
* orderAge
* timeInCurrentStatus
* stuck detection
* regression count
* churn count
* status change count
* reasons
* recommended actions

It uses workflow categories instead of only hardcoded enum statuses where possible.

Dashboard intelligence brief aggregates:

* total orders
* stuck orders
* high-risk orders
* critical-risk orders
* focus orders
* recommended actions

## Comments

Order comments are implemented.

Comments:

* belong to organization
* belong to order
* belong to author
* create COMMENT_ADDED activity log
* appear on order detail page

## Mentions + Notifications

Mention parsing is started.

Users can mention another user in a comment with syntax like:

```txt
@sarah
```

Notifications foundation exists:

* Notification model
* NotificationType enum
* notifications belong to organization
* notifications belong to receiving user
* optional actorId
* optional orderId
* optional commentId
* notifications page exists
* user can mark notification as read

---

# Important Roadmap / Backlog Items

Do not forget these:

## Product / Architecture

* Smart Tracker is both:

  * a better native task/workflow manager
  * an intelligence layer across external tools
* integration layer should support Jira/Notion/CRMs/internal tools later
* external IDs will likely be needed:

  * externalSource
  * externalId
* future webhooks:

  * inbound external system updates
  * outbound intelligence/action alerts

## Auth / Security

* httpOnly cookies later
* refresh tokens
* token rotation
* stronger password rules
* rate limiting
* role guards
* ownership/permission checks

## Multi-Tenancy

* organization/workspace model exists
* eventually add invite flow
* eventually add OrganizationMember if users can belong to multiple orgs
* restricted visibility based on role/permission level
* organization-level integrations

## Workflow

* eventually remove dependency on legacy OrderStatus enum
* use WorkflowStatus/statusRef as source of truth
* add fromStatusId/toStatusId to ActivityLog later
* enforce workflow validity:

  * exactly one start status
  * at least one terminal status
  * unique order per workflow
  * valid categories
* allow admin-managed workflows later
* add allowed transition UI later
* add BLOCKED category later if appropriate

## Intelligence

* improve churn detection using:

  * time windows
  * repeated same statuses
  * back-and-forth cycles
  * category changes
* add SLA thresholds by category/workflow/customer
* bottleneck detection
* anomaly detection
* AI-generated reasoning later
* daily intelligence brief should become stronger
* eventually async intelligence generation/background jobs

## Admin Override

Locked statuses:

```txt
DONE
CANCELED
```

Future admin override should:

* allow reopen with reason
* require ADMIN role
* create activity log
* preserve audit trail

## Comments / Mentions / Notifications

* improve mention parsing with user autocomplete later
* mention should eventually reference userId, not just text
* notifications should link to exact comment/order
* assignment notifications
* high-risk notifications
* stuck-order notifications

## Integrations

Smart Tracker should integrate with systems like Jira.

It should support:

* native task/workflow management
* external issue ingestion
* two-way sync later
* comments/status sync later
* intelligence pushed back into external tools

---

# Current Build Flow

We have been building section-by-section.

Recent sections:

* Section 24: Organization / Workspace Foundation
* Section 25: Comments Foundation
* Section 26: Mentions + Notifications Foundation
* Section 27: Organization Signup API

Next section should continue from here.

Before writing code, briefly explain why the section matters and how it fits the startup/product direction.

Keep explanations detailed and clear.

Continue with the same style.
