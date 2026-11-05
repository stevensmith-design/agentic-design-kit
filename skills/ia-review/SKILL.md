---
name: ia-review
description: >
  Audit the information architecture of a product — navigation structure, content hierarchy,
  labeling, grouping, and progressive disclosure. Use when reviewing a new screen or flow for
  structural clarity, when users report confusion about where things are, when navigation labels
  feel ambiguous, when the tab bar or menu structure is being designed or reconsidered, or when
  asking "why are users getting lost?". Complements ui-design-review (visual quality). Also use
  BEFORE anything is built — when a brief, feature list, or set of user tasks needs a navigation
  model, screen inventory, grouping and labels decided, or when `ui-design-principles` Step 1
  calls for structure to be settled before a visual direction is committed. Runs in three modes:
  structure design (build-time — given a brief, propose the structure), flow review (given screens
  or code, audit the structure), and label audit (naming consistency and clarity across
  navigation, headings, and CTAs).
---

# IA Review

Structural clarity skill. Covers how content is organised and labelled — not how it looks.
For visual quality, use `ui-design-review`. For implementation guardrails, use `ui-design-principles`.

---

## Review framework

Every IA review works through three layers in order.

**Layer 1 — Structure: Is the organisation logical?**
Are screens grouped by user intent? Does the navigation model match how users think about the product, not how the backend is organised? Structural problems at this layer mean users can never find things, regardless of labeling.

**Layer 2 — Labels: Are names clear and consistent?**
Navigation labels, section headings, and CTAs must be unambiguous on their own — no decoding required. Inconsistent naming (same concept, two names) is a Layer 2 failure even if the structure is sound.

**Layer 3 — Disclosure: Is complexity managed well?**
Is essential information surfaced immediately? Is secondary complexity deferred until needed? Overloaded screens and buried critical actions are Layer 3 failures.

---

## Mode detection

Read the request and pick the mode before starting.

| Signal | Mode |
|--------|------|
| A brief, feature list, or user tasks with **nothing built yet**; "how should this be structured?"; `ui-design-principles` Step 1 hands off task structure | **Structure design** |
| "Review this screen / flow", shares screens or code | **Flow review** |
| "Check the labels / navigation naming", shares nav structure | **Label audit** |
| Ambiguous | Flow review, with Label audit as a sub-step |

Mode 3 carries one **conditional** step (2.5, agentic structure) that fires when a model or an agent acts for the user. Modes 1 and 2 audit the result of that step against `references/ia-principles.md` → *Agentic structure*.

**The deciding question is whether the artifact exists.** Modes 1 and 2 audit something; Mode 3
designs it. If you are being asked to check structure that has not been built, do not audit a
sketch and do not skip the step — run Mode 3 and hand its committed structure forward. Mode 3's
output is what Mode 1 later audits against.

---

## Mode 1 — Flow review

Given: screenshots, a Figma link, screen names, or source files.

### Step 1: Map the structure

**First, ask whether a structure proposal exists.** If Mode 3 ran for this product — a *Structure
Proposal* in the repo, the brief, or an earlier session — load it and audit the shipped structure
**against it**, not only against the checklist. Each divergence is a finding in its own right, with
the proposal as Evidence and its own severity: a destination that moved, a task that lost its single
home, a disclosure decision that was reversed. Say plainly whether the divergence looks deliberate
(the build learned something) or accidental (the proposal was not followed), because those need
different responses. If no proposal exists, say so in one line and audit against the checklist alone
— an absent proposal is not a finding, but silently not looking for one is how drift goes unnoticed.

**A page added to an existing site** is checked against every page it joins: the shared navigation carries it everywhere (the same item, the same order), and older links whose labels name it now point at it. Then map what actually shipped. List every screen and its position in the navigation hierarchy. If source code is provided, search it (any code-search tool — ripgrep, grep, editor search, IDE symbol search) for route definitions, tab bar items, and screen names first — don't try to hold the structure in memory.

```
Nav structure:
├── Tab 1: [label]
│   ├── Screen A
│   └── Screen B → Screen C (modal)
├── Tab 2: [label]
└── Tab 3: [label]
```

### Step 2: Run the IA checklist

Read `references/ia-principles.md` for the full rule set. Check each category:

**Navigation model**
- [ ] The number of top-level destinations sits inside the cognitive-load budget — **3–5** (`references/ia-principles.md` → Navigation model). Below 3 reads as arbitrary; above 5 forces scanning
- [ ] Each top-level destination has a single clear purpose — no catch-all tabs
- [ ] Navigation items are parallel in scope (not mixing "Home" with a verb like "Search")
- [ ] The active section is always clear to the user
- [ ] Back navigation is unambiguous — user always knows where "back" leads

**Navigation placement** — every action has exactly one correct home:
- [ ] Frequent / global actions → primary nav (tab bar, bottom nav)
- [ ] Contextual actions → screen-level (header button, FAB, inline row)
- [ ] Rare / account-level / destructive actions → settings or profile screen — never in global nav
- [ ] Flag any action placed in a catch-all menu (hamburger, "More") that belongs in one of the above categories. Common failure: logout in a hamburger nav — it belongs in account/profile settings.

**Content hierarchy**
- [ ] The most important information on each screen is above the fold on a standard phone viewport (375pt)
- [ ] Secondary information is accessible but does not compete with primary content
- [ ] Related items are grouped; unrelated items are separated by space or a divider — grouping follows user mental model, not backend or implementation structure
- [ ] Items within a group are ordered by user priority (importance, frequency of use, recency) — never by insertion order, API response order, or internal ID
- [ ] Lists are sorted by a logic the user would expect (recency, frequency, alphabetical, status) — the sort logic is explicit and consistent across similar lists

**Information scent**
- [ ] Each navigation item predicts its contents — tapping it delivers what the label implies
- [ ] Section headings describe what follows, not what the section is called internally
- [ ] Empty states explain what belongs here and how to add it — not just "Nothing here yet"
- [ ] Error states tell the user what happened and what to do next

**Progressive disclosure**
- [ ] Screens have a single primary action; secondary actions are subordinate or deferred
- [ ] Advanced or destructive actions require one additional step (confirmation, sheet, submenu)
- [ ] Onboarding complexity is deferred — users see value before being asked for input or permissions
- [ ] Forms collect only what is needed at this step; optional fields are clearly marked

**Web / SaaS structure** — browser-delivered products only; skip for native-only. Detail in `references/ia-principles.md` → Web and SaaS structure.
- [ ] Any collection that can grow past ~one screen offers a deliberate retrieval route — search, filter, sort, grouping or pagination — matched to how users actually look things up
- [ ] The user can always identify their current location (active nav state, page title naming the thing, breadcrumb below the second level)
- [ ] Nav label, page heading, breadcrumb segment and browser `<title>` agree for the same destination
- [ ] Every view worth returning to, linking or sharing has its own URL — records, filtered/sorted lists, selected tabs, wizard steps — and filter/sort/tab state lives in the URL, not only in component state
- [ ] Back, forward, refresh, deep link and open-in-new-tab each do the obvious thing and destroy no work (the persistence half hands off to `ui-design-principles` → Behaviour, states and recovery → Runtime hazards)

**Consistency**
- [ ] The same concept has the same name everywhere (nav label = page title = CTA = any reference in copy)
- [ ] Interaction patterns are consistent — if swipe-to-delete exists on one list, it exists on all similar lists
- [ ] Modal vs. push navigation is used consistently for the same types of tasks

### Step 3: Findings

Report findings by layer. Every finding uses the same schema:

- **Finding**: the specific structural/label/disclosure problem
- **Affected flow / label / screen**: where it occurs (name the screen, path, or label verbatim)
- **Evidence**: what shows it — the observed structure, the label text, the nav position (not a guess)
- **Severity**: **Blocker** (user cannot complete a core task / gets lost) · **Major** (frequent confusion or wrong turns) · **Minor** (friction or inconsistency)
- **Recommendation**: the specific fix. For a structural finding resolved here (*IA (resolve
  here)*), make it implementation-ready — name the cause in the structure, the exact-or-bounded
  change, the affected screens/labels, and a check that confirms it — the same bar the review skills
  apply via `ui-design-review/references/repair-prescriptions.md`.
- **Handoff target**: where the fix actually lands when it is not pure IA — visual hierarchy → `ui-design-review`, implementation → `ui-design-principles`, naming/token consistency → `ui-design-system`, or *IA (resolve here)* when structural

Do not report things that are subjective preferences — only findings with a clear user impact rationale.

### Output format

```
## IA Review — [Product / Screen name]

### Nav structure
[Mapped hierarchy]

### Findings
| # | Finding | Affected flow/label | Evidence | Severity | Recommendation | Handoff target |
|---|---------|--------------------|----------|----------|----------------|----------------|
| 1 | Logout buried in hamburger "More" | Global nav → More | Logout sits in a catch-all menu; account actions belong in profile | Major | Move logout to Profile/Account settings | IA (resolve here) |

### By layer
- **Layer 1 — Structure:** [findings or ✅ No structural issues]
- **Layer 2 — Labels:** [findings or ✅ Labels are clear and consistent]
- **Layer 3 — Disclosure:** [findings or ✅ Complexity is appropriately managed]

### Summary
[2–3 sentences: what is working well and what are the highest-priority fixes]
```

---

## Mode 2 — Label audit

Given: a list of navigation labels, section headings, screen titles, or a nav structure.

### Step 1: Extract all labels

Collect every user-visible label into a flat list: tab names, screen headings, section titles, CTAs, empty state headlines.

### Step 2: Run label checks

**Clarity**
- [ ] Each label is understandable without context — a new user could predict what it contains
- [ ] No internal jargon, product codenames, or backend terminology exposed to users
- [ ] Verbs are used for actions ("Save", "Share"), nouns for destinations ("Settings", "History")
- [ ] Labels are as short as possible without losing meaning. The binding limits are the per-surface **character** counts in `references/ia-principles.md` → Label length, not a word count — a two-word label can still overflow a tab bar

**Consistency**
- [ ] The same action/destination has the same label everywhere it appears
- [ ] Labels within the same level are parallel in form (all nouns, or all verb phrases — not mixed)
- [ ] Capitalisation is consistent (Title Case for nav, Sentence case for body — pick one and apply it)

**Ambiguity**
- [ ] No two labels could reasonably be confused for each other
- [ ] Generic labels ("More", "Other", "Misc") are absent or minimised
- [ ] Negative labels ("Don't show this") are rewritten as positive actions ("Hide")

### Output format

```
## Label Audit — [Scope]

### Labels reviewed
[Flat list of all labels audited]

### Clarity issues
[Findings or ✅ Clear]

### Consistency issues
[Findings or ✅ Consistent]

### Ambiguity issues
[Findings or ✅ Unambiguous]

### Recommended revisions
| Current | Recommended | Reason |
|---------|-------------|--------|
```

---

## Mode 3 — Structure design (build-time)

Given: a brief, a feature list, a set of user tasks, or `ui-design-principles` Step 1's task
structure. **Nothing is built yet — that is the point.** This mode produces the structure the build
then implements, so the aesthetic dresses a settled structure instead of a guessed one.

Read `references/ia-principles.md` **forward** here: in Modes 1–2 it justifies a finding; in this
mode it is the design procedure. Navigation models, the cognitive-load budget, scope parallelism,
modal-vs-push, grouping logic, information scent, progressive disclosure and the label standards are
all decisions to make now, not rules to check later.

When the user asks for a reusable IA artifact, requests examples, or the structure matches settings,
a dense operational SaaS surface, a content/knowledge site, or an agentic product, also load
`references/structure-blueprints.md`. Its blueprints are worked deliverable forms, not navigation
templates: the task inventory must still justify every destination and label.

### Step 1: Inventory the tasks, not the features

List what users need to *do*, in their words. A feature list is the backend's view; a task list is
the user's. Two features may be one task ("edit profile" + "change photo"), and one feature may be
three tasks. Mark each task **frequent · occasional · rare**, and **primary · supporting ·
administrative** — frequency drives prominence and rarity drives burial, and both are decided here
rather than discovered in review.

### Step 2: Group by user intent, then name the groups

Cluster tasks by the intent behind them, never by the data model or team ownership. Then name each
cluster with the label standards (verb vs. noun, length limits, no internal terminology). If a
cluster cannot be named in one or two plain words, the grouping is wrong — the naming difficulty is
the diagnostic, not a copywriting problem to solve later.

### Step 2.5: Map the agentic structure — conditional

**Run this only when the product's core interaction is a model producing output or an agent acting
on the user's behalf.** Skip it for a product that merely has AI somewhere inside it, and say so in
one line so the omission is visible rather than silent. Detail and the common findings are in
`references/ia-principles.md` → *Agentic structure*.

It sits here, after grouping and before the navigation model, because what it produces are
destinations: an agent accumulates objects the user did not create and was not present for, and each
needs a home before the model is chosen. **Agentic IA exists across time.** Good screens still make a
confusing product when plans, runs and approvals have nowhere to live — the screens are fine and the
user still asks "where did that go?" about work the system did.

Settle six things:

- [ ] **Actors** — user, agent, human reviewer, operator, affected third parties. Serve the *role*,
      not the person; one human often holds two roles and the structure must still work when they
      are different people.
- [ ] **Responsibility** — for each task: who initiates, decides, approves, executes, verifies, and
      **owns recovery**. Recovery ownership is the one usually left unassigned, and it decides
      whether a failed run has anywhere to be resolved.
- [ ] **Persistent objects** — task, plan, run, result, source, permission, approval, history. Each
      gets a home, a lifespan, and (on the web) an address. Not every product needs all eight as
      destinations; every product needs to have decided about all eight.
- [ ] **Handoffs** — every point where responsibility moves: user → agent, agent → reviewer,
      agent → user on failure, agent → third party on send. Each needs a surface, a notification
      path, and a defined state on both sides.
- [ ] **Re-entry** — where **running**, **completed**, **failed** and **paused** work is found later.
      These are four different retrieval needs; one undifferentiated "Activity" list is the same
      defect as one generic empty state. Test it plainly: the user closes the laptop mid-run and
      opens it tomorrow — name the exact route back.
- [ ] **Provenance** — for any result: what produced it, on what evidence, under whose approval, and
      where that record lives after the session ends.

**The guard — user intent stays authoritative.** Do not import a Data/Domain/Use-case model as a
navigation generator. The eight objects are a checklist of things that need homes, not a site map.
Group by user intent as in Step 2, then check that every object has a home somewhere in that
structure. An object with no natural home is a finding about the product — not a licence to add a
destination named after the object. "Runs" as a top-level tab is occasionally right and usually the
domain model leaking into the nav.

Carry the result into Step 3 as destinations to place and into Step 4 as things to disclose or bury.

### Step 3: Choose the navigation model against the budget

Pick the model and state why: tab bar, drawer, rail, breadcrumb hierarchy, single-surface with
disclosure. Check it before committing:

- [ ] Top-level destinations are within the cognitive-load budget — **3–5**, not merely ≤ 5
- [ ] Every destination has a single clear purpose — no catch-all "More"
- [ ] Destinations are parallel in scope (not mixing a place with an action)
- [ ] Every task from Step 1 has exactly one correct home, and you can name it
- [ ] Rare, account-level and destructive tasks are placed away from global nav
- [ ] Each label predicts what the user finds on arrival (information scent)
- [ ] *(agentic products)* Every persistent object from Step 2.5 has a home, and no destination exists only because the domain model has a noun for it

### Step 4: Decide disclosure before layout

For each destination, decide what is on the first screen, what is one step away, and what is
deliberately buried. Name the single primary action per screen. Decide modal vs. push per task type
and record it, because consistency here is a Mode 1 finding later. State what is deferred until the
user has seen value — permissions, optional fields, onboarding depth.

### Step 5: Commit the structure, and mark what is unresolved

Output a structure the build can implement *and* Mode 1 can later audit against. Say plainly which
decisions are committed and which are provisional — a provisional decision recorded as provisional
is fine; one silently presented as settled is what produces a confident wrong build.

### Output format

```
## Structure Proposal — [Product / Feature name]

### Task inventory
| Task (user's words) | Frequency | Priority | Home |
|---|---|---|---|

### Proposed structure
├── [Destination 1: label]
│   ├── [Screen] — primary action: [action]
│   └── [Screen] → [Screen] (modal / push)
├── [Destination 2: label]
└── [Destination 3: label]

### Decisions and rationale
| Decision | Chosen | Why | Alternative rejected |
|---|---|---|---|

### Agentic structure *(only when a model or agent acts for the user; otherwise: "not applicable")*
| Actor | Initiates | Decides | Approves | Executes | Verifies | Owns recovery |
|---|---|---|---|---|---|---|

| Persistent object | Home | Lifespan | Address |
|---|---|---|---|

- **Handoffs:** [where responsibility moves, and the surface on each side]
- **Re-entry:** running → … · completed → … · failed → … · paused → …
- **Provenance:** [what records what produced a result, and where it survives to]

### Disclosure plan
- **First screen:** …
- **One step away:** …
- **Deliberately buried:** …

### Open questions
[What is provisional, and what evidence would settle it]
```

### Worked example — filled (abridged)

The skeleton above is header-only on purpose; this is what a real one carries. A three-destination
consumer app with one agentic feature — a receipt scanner that files expenses.

```markdown
### Task inventory
| Task (user's words) | Frequency | Priority | Home |
|---|---|---|---|
| "snap a receipt" | frequent | primary | Capture (the default surface) |
| "check what it filed" | frequent | primary | Activity → needs review |
| "fix one it got wrong" | occasional | primary | Activity → item detail |
| "export last month" | occasional | supporting | Reports |
| "change my card" | rare | administrative | Profile → Billing |

### Decisions and rationale
| Decision | Chosen | Why | Alternative rejected |
|---|---|---|---|
| Nav model | 3-tab bar | Three parallel destinations, all frequent | Drawer — hides the whole product behind a tap |
| Scan results | Inside Activity, not a tab | It is a *state* of an expense, not a place | "Scans" tab — the domain model leaking into nav |
| Failed scans | Same list, filtered | Users look for the receipt, not the failure | A "Failures" destination nobody visits on purpose |

### Agentic structure
| Task | Initiates | Decides | Approves | Executes | Verifies | Owns recovery |
|---|---|---|---|---|---|---|
| Categorise a receipt | agent (on upload) | agent | user, only above ¥10,000 | agent | user, in Activity | **user** — and the route is Activity → needs review |

| Persistent object | Home | Lifespan | Address |
|---|---|---|---|
| Scan (run) | Activity | 90 days | `/activity/:scanId` |
| Expense (result) | Activity → detail | permanent | `/expenses/:id` |
| Source image | inside the expense | permanent | not separately addressable — deliberate |

- **Re-entry:** running → Capture shows an inline progress row · completed → Activity, default filter
  · failed → Activity, "needs review" filter, badged · paused → not applicable, scans do not pause
- **Provenance:** each expense stores which model version filed it and the source image; survives
  export as a column

### Disclosure plan
- **First screen:** the camera. Nothing else.
- **One step away:** Activity's needs-review filter; the category override.
- **Deliberately buried:** model settings, export format, anything in Billing.

### Open questions
- The ¥10,000 approval threshold is **provisional** — chosen to match the finance team's existing
  policy, not from usage. Settled by: the rate of user overrides above and below it after a month.
```

Two things the example demonstrates that the skeleton cannot. **Recovery ownership is named and
routed** — "user, and the route is Activity → needs review" — rather than left blank, which is the
field Step 2.5 says is usually unassigned. And the **provisional decision is labelled provisional
with the evidence that would settle it**, per Step 5; a threshold presented as settled is exactly
the confident wrong build that step exists to prevent.

### Handing off

Return the committed structure to `ui-design-principles` Step 1 as the task-structure answer, then
build.

**Name what this mode does not answer.** Step 1's task-structure question has eight sub-answers and
this mode produces five of them — the primary action, information priority, user frequency/expertise,
page vs. panel vs. modal, and progressive disclosure. Three are **out of scope here and still owed**:
the *interaction primitive*, *irreversibility / consequences*, and *responsive structural behaviour*.
State that explicitly when handing off. They are decided in `ui-design-principles` Step 1 with the
structure in hand, and an agent that treats this proposal as a complete task-structure answer leaves
them silently unanswered — which surfaces later as an irreversible action nobody scoped. After the build, **Mode 1 audits the result against this proposal** — divergence between the
committed structure and the shipped one is itself a finding, the same way `ui-design-system`'s Drift
mode checks code against a committed system.

---

## After the fixes — re-checking

An IA review is not finished when the report is written; it is finished when someone can tell whether
the fixes worked. Structural fixes move things, and moving things is exactly what creates the next
structural problem — a label clarified in the nav that no longer matches the page title, a task
rehomed into a destination that now has two purposes.

When the team reports the findings addressed:

1. **Re-map the structure** (Mode 1 Step 1). Do not diff against the old report's prose — diff
   against the structure as it now stands, or you will confirm a fix that was described rather than
   made.
2. **Re-run only the checklist sections the fixes touched**, plus **Consistency**, which is the one
   that breaks as a side effect of someone else's fix.
3. **Re-issue the by-layer verdict, or state plainly that it stands.** A finding that was Blocker
   and is now resolved is recorded as resolved; a finding whose fix introduced a new one is recorded
   as both. Never quietly drop a finding from the second report — that reads as fixed.

If the fixes came from a Mode 3 proposal, this is also when the proposal is updated: a structure
that has been changed in the build and not in the proposal makes the next Mode 1 audit diff against
a document that no longer describes the intent.

---

## What this skill does not cover

- Visual design quality / visual hierarchy → `ui-design-review`
- Implementation guardrails → `ui-design-principles`
- Naming/label tokens, design-system consistency → `ui-design-system`
- Accessibility (WCAG) → `ui-design-review` checklist / dedicated a11y audit
- User research / usability testing → use a research skill or conduct user sessions
- Product decisions (what features to build, what to cut) — IA review surfaces confusion; product decisions require business context this skill does not have

If a finding feels like a product decision, flag it as "worth discussing with the team" rather than a definitive recommendation.
