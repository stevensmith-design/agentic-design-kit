# Structure blueprints — worked IA forms, not product templates

Load this reference in Mode 3 when the user asks for a reusable IA deliverable or when a worked
comparison would help choose among structures. These are **forms and examples**, not approved
navigation patterns. The task inventory and product evidence must still produce the structure.

Start with the common blueprint, then borrow only the specialist tables the product needs.

## Common blueprint

```markdown
# IA Blueprint — [Product / scope]

## Scope and actors
- **Scope:** …
- **Primary users:** …
- **Affected roles:** …
- **Core outcome:** …

## Task-to-destination matrix
| User task | Frequency | Consequence | Starting context | Destination | Completion / return |
|---|---|---|---|---|---|

## Navigation model
| Level | Destination | Purpose | Entry routes | Address / state owner |
|---|---|---|---|---|

## Screen hierarchy
├── [Destination]
│   ├── [Collection / overview]
│   ├── [Object detail]
│   └── [Task flow] → [modal / panel / route]

## Disclosure
| Screen | Primary information/action | Supporting | One step away | Deliberately buried |
|---|---|---|---|---|

## Vocabulary
| Concept | Canonical label | Avoid | Why / destination promise |
|---|---|---|---|

## State and URL ownership
| State | URL / persistent owner | Back / refresh result | Shareable? |
|---|---|---|---|

## Responsive structure still owed
| Condition | Navigation | Content order | Action placement | Lost capability? |
|---|---|---|---|---|

## Decisions
| Decision | Status | Evidence | Alternative rejected | Revisit when |
|---|---|---|---|---|
```

The “responsive structure still owed” table is a handoff into `ui-design-principles`; Mode 3 does
not silently decide it. It makes the missing answer visible.

## Blueprint A — settings and administration

Use when most tasks change durable preferences, access, billing or account state.

Additional inventory:

```markdown
| Setting / task | Scope | Actor allowed | Frequency | Consequence | Apply model | Home |
|---|---|---|---|---|---|---|
| Profile name | personal | member | rare | low | immediate | Personal |
| Default approval rule | workspace | admin | occasional | high | explicit Save | Workflow |
| Delete workspace | workspace | owner | very rare | irreversible | confirm + re-auth | Danger zone |
```

Check:

- Personal, workspace and organisation scopes are not mixed without labels.
- Categories follow user intent, not backend service ownership.
- Immediate toggles and explicit-save forms do not create an ambiguous mixed commit model.
- Permissions explain why an unavailable setting cannot be changed.
- Destructive and security tasks are separated from routine preferences.
- Search is offered only when the inventory is large enough and labels are stable enough to find.

Example structure:

```text
Settings
├── Personal
│   ├── Profile
│   └── Notifications
├── Workspace
│   ├── Members & roles
│   ├── Workflow
│   └── Integrations
├── Billing
└── Security
    ├── Authentication
    └── Danger zone
```

This is illustrative. A two-setting product does not need four destinations.

## Blueprint B — dense SaaS or operational workbench

Use when users repeatedly retrieve, compare and act on many records.

Additional inventory:

```markdown
| Object / queue | Primary question | Retrieval route | Common action | Bulk action | Detail depth |
|---|---|---|---|---|---|
| Orders | What needs attention? | status + owner + age | assign | reassign | route detail |
```

Check:

- The navigation names work domains; filters name temporary views inside them.
- Saved views, filters, sort, pagination and selected tabs have explicit URL/state ownership.
- Collection → detail → next-item supports repeated work without returning to the dashboard.
- Global creation is not confused with contextual action on selected records.
- Alerts lead to the affected object and preserve the user's prior queue context.
- Admin/configuration is separated from the daily workbench.

Example structure:

```text
Operations
├── Work queue `/work?view=needs-attention`
│   ├── Saved views
│   └── Item detail `/work/:id` → next item preserves queue
├── Customers `/customers`
│   └── Customer detail `/customers/:id`
├── Reports `/reports`
└── Settings `/settings`
```

The example demonstrates URL and return-path decisions; “Work queue” is not a universal label.

## Blueprint C — content, documentation or knowledge site

Use when the primary job is finding, understanding and returning to information.

Additional inventory:

```markdown
| Audience question | Entry route | Content type | Canonical home | Related / next | Freshness signal |
|---|---|---|---|---|---|
```

Check:

- Organisation follows audience questions or durable topics, not the publishing team.
- Each page has one canonical home even when reached through search, collections or campaigns.
- Search, browse and cross-linking are complementary retrieval routes.
- Breadcrumbs express hierarchy; related links express association. Do not make either impersonate
  the other.
- Version, applicability and update status appear where they change interpretation.
- Long documents expose local navigation without competing with global navigation.

Example structure:

```text
Knowledge
├── Get started
├── Guides
│   ├── [Topic]
│   └── [Guide] → local table of contents
├── Reference
│   └── [Object / API]
├── Troubleshooting
└── Search results → canonical page
```

## Blueprint D — AI or agentic product

Use in addition to Mode 3 Step 2.5, not instead of it.

Additional inventory:

```markdown
| Task | Asking user | Agent | Reviewer | Affected party | Recovery owner |
|---|---|---|---|---|---|

| Persistent object | Created when | Home | Re-entry states | Provenance retained | Address |
|---|---|---|---|---|---|

| Handoff | Trigger | Sending surface | Receiving surface | Notification | Failure state |
|---|---|---|---|---|---|
```

Check:

- The navigation follows the user's work, not the internal task/plan/run object model.
- Proposals, approvals and executed effects are distinguishable states with durable homes.
- Running, paused, failed and completed work have different retrieval and recovery needs.
- A reviewer can understand consequence, source and changed fields without reading an opaque trace.
- Permissions and autonomy belong near the task they govern, with a scoped administration home.
- The affected third party is represented wherever a send, publish, charge or change reaches them.

Example structure for a review-first support agent:

```text
Support
├── Inbox `/inbox`
│   ├── Needs review `/inbox?state=review`
│   ├── In progress `/inbox?state=running`
│   └── Conversation `/inbox/:id`
│       ├── source message
│       ├── proposed reply + evidence
│       ├── approval / edit / reject
│       └── execution and recovery history
├── Knowledge `/knowledge`
└── Settings `/settings`
    ├── Mailboxes
    ├── Approval rules
    └── Permissions
```

There is no top-level “Runs” destination because users return to conversations. If operational
monitoring later becomes a frequent task for a distinct operator role, that evidence may justify
one; it is not added merely because runs exist in the domain model.

## Blueprint selection test

Before borrowing an example, answer:

1. Is the product's primary job actually the same shape?
2. Which example labels are placeholders rather than verified vocabulary?
3. Which specialist table exposes a decision the common blueprint misses?
4. What project evidence changes the example structure?
5. Can every destination be traced back to a user task rather than the example?

If question 5 fails, return to Mode 3 Step 1. The blueprint has become a template instead of a
reasoning aid.
