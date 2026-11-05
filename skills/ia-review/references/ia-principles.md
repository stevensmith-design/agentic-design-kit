# IA Principles Reference

Extended rationale and edge-case guidance for `ia-review`.

**Read it two ways.** In **Mode 1 (flow review)** and **Mode 2 (label audit)** it is adjudication
support — open it when a checklist item is ambiguous or a finding needs justification. In **Mode 3
(structure design)** it is the **design procedure**: navigation models, the cognitive-load budget,
scope parallelism, modal-vs-push, grouping logic, information scent, progressive disclosure and the
label standards are the decisions being made, and this file is read front-to-back before the
structure is committed rather than consulted after something exists to check.

---

## Table of contents

1. [Navigation models](#navigation-models)
2. [Content hierarchy](#content-hierarchy)
3. [Information scent](#information-scent)
4. [Progressive disclosure](#progressive-disclosure)
5. [Web and SaaS structure](#web-and-saas-structure)
6. [Label standards](#label-standards)
7. [Consistency rules](#consistency-rules)
8. [Agentic structure](#agentic-structure) — **conditional**: only when a model or an agent acts for the user

---

## Navigation models

### The cognitive load budget

Top-level navigation (tab bars, side navs, bottom navs) should have 3–5 items. Below 3 feels arbitrary. Above 5 requires the user to scan rather than recognise. If the product genuinely needs more than 5 top-level destinations, the structure should be reconsidered — typically some destinations belong one level deeper.

### Single-purpose tabs

Each top-level tab must have one purpose a user could name without ambiguity. "Home" is acceptable if it acts as a dashboard. "More" is a failure — it means "we ran out of room and gave up." If a tab holds only one item, that item should be promoted or merged.

### Scope parallelism

Navigation items at the same level must be parallel in scope. A tab bar mixing "Home" (a destination) with "Search" (a behaviour) and "Profile" (a subject) is incoherent. Acceptable patterns:
- All destinations: Home / Library / Explore / Profile
- All actions (rare, for tools): Write / Edit / Publish / Review

### Modal vs. push

Push navigation (drill-down) signals: "this is a deeper view of what you were looking at."
Modal navigation (sheet, overlay) signals: "this is a separate task; you will return."

Using modals for drill-down breaks the back model — users cannot tell where "back" leads. Using push for separate tasks (e.g., a settings screen pushed onto a product list) implies false relationship.

---

## Content hierarchy

### The fold

On a 375pt viewport with a standard tab bar and nav bar, the safe visible area is approximately 550–580pt tall. The primary value prop, primary action, and primary data must appear within this window. Content below the fold is acceptable for supplementary detail but must not contain anything the user needs before acting.

### Grouping logic

Group by: relationship (same entity, same task, same status), not by implementation (same API call, same database table, same team that owns it). Common failure: grouping "account settings" with "notification settings" with "privacy settings" because they all live in a settings microservice — fine. Grouping "order history" with "payment methods" with "addresses" because they all touch the commerce backend — not fine from a user perspective; these are different mental models.

### List ordering

Default list ordering should follow the user's most likely mental model:
- Activity feeds: reverse chronological (most recent first)
- Search results: relevance, then recency
- Settings: frequency of use (most-used near top) or categorical grouping
- People lists: alphabetical unless there is a relationship signal (friends before strangers)

Never use backend insertion order as the default sort for user-facing lists.

---

## Information scent

### Navigation prediction

Before auditing, ask: "If a new user taps this label, what do they expect to find?" Then check whether the screen delivers exactly that. Failures come in two forms:
1. **Under-delivery**: the label promises more than the screen provides ("Explore" leads to a thin feature list)
2. **Over-delivery**: the screen is richer than the label implies (a tab called "Me" that contains a full social graph, activity history, and settings)

### Empty states

An empty state is not a failure state — it is a navigation moment. Users who land on an empty screen need to understand:
1. What belongs here (the concept)
2. Why it's empty (haven't added anything yet / no results match / requires a permission)
3. How to populate it (the action)

A blank screen with a generic icon is an IA failure. An empty state with "No items yet. Tap + to add one" is acceptable. An empty state that explains the feature and surfaces the first meaningful action is excellent.

### Error states

Error copy must answer: what happened, why it matters, and what the user can do. "Something went wrong" answers none of these. "Couldn't load your orders — check your connection and try again" answers all three.

---

## Progressive disclosure

### The primary action rule

Every screen should have one thing the user is most likely to do next. That thing should be the most visually prominent interactive element. If two actions are equally prominent, the screen has not made a decision — it has deferred to the user, which increases cognitive load.

Acceptable: one solid CTA + one ghost/text secondary action
Not acceptable: three equally weighted buttons, a bottom sheet full of options at equal weight, a grid of feature tiles with no hierarchy

### Dangerous action distance

Destructive or irreversible actions (delete, cancel subscription, send to all, publish) must require at least one additional confirmation step beyond the initial tap. The confirmation must be non-trivial — a tooltip or a brief animation is not a confirmation. A sheet with a clear description of consequences + a labelled confirm button is.

Reversible actions (archive, mute, hide) do not require a confirmation step, but should offer an undo affordance for 4–6 seconds post-action.

### Permissions and onboarding

The first screen a user sees should show them value — not ask for permissions. Request permissions at the moment of relevance (camera permission when they first try to take a photo; location permission when they first search nearby; notification permission after they complete a meaningful action). Pre-emptive permission requests on launch are an IA failure regardless of conversion statistics.

---

## Web and SaaS structure

The rest of this file reasons in tab bars, sheets and a 375pt fold — a native frame. Web and SaaS
products have structural obligations that frame does not cover: the address bar is part of the
navigation model, the browser supplies navigation controls the product does not own, and collections
are routinely larger than anything a phone screen was designed to hold. Apply this section for any
browser-delivered product; skip it for native-only ones.

### Large collections are navigable, not just scrollable

Any collection that can realistically exceed roughly one screen of items needs a way to *get to* an
item other than scrolling: search, filter, sort, grouping, or pagination — chosen deliberately, not
all four by reflex. Which one depends on how users actually retrieve:
- They know the name → **search** first.
- They know a property (status, owner, date) → **filter** and **grouping**.
- They want the extremes (largest, oldest, most recent) → **sort**.
- They work through the set methodically → **pagination** with a visible position.

Infinite scroll on a work surface is usually the wrong default: it destroys position, breaks
back-navigation, and makes "the thing I saw yesterday" unreachable. A list of 12 needs none of
this; a list that grows without a ceiling needs at least one. The corresponding *rendering* rules —
empty, loading, partial and no-results states for the collection — are in `ui-design-principles`
→ *Behaviour, states and recovery* and *Data tables*. Large datasets (pagination, virtual scrolling, search and filter) are `design-refine`'s harden
verb.

### Current location is always identifiable

At any moment the user can answer "where am I?" without guessing: the active nav item is visibly
active, the page carries a title naming the thing (not the template), and hierarchies deeper than
two levels carry a breadcrumb. Modal and full-screen overlay contexts state what they belong to.
Position is a Layer 1 finding when it is missing — a user who cannot locate themselves cannot
navigate deliberately, only by trial. (See also *Information scent* → Navigation prediction: a label
that predicts its destination is what makes the location legible once you arrive.)

### One destination, one name — across four surfaces

For any given destination, four labels must agree: the **navigation item**, the **page heading**,
the **breadcrumb segment**, and the **browser `<title>`**. This is the naming-consistency rule
(under *Consistency rules*) extended to the two surfaces native apps do not have. Divergence here is
cheap to create — the `<title>` is usually set far from the heading — and expensive for the user:
tab-switching, history, and bookmarks all show the `<title>`, so a destination named one thing in
the nav and another in the tab is effectively two destinations. Audit technique: for each top-level
destination, capture all four strings side by side; any row where they are not the same word is a
Layer 2 finding.

### URLs are part of the information architecture

A URL is a name for a view, and every view a user would want to return to, link, or share deserves
one: a record, a filtered or sorted list, a selected tab, a step in a wizard, a search result set,
a date range on a dashboard. If two different screens share one URL, the product has told the user
those screens are the same place. Practical consequences:
- Filters, sorts, tabs and pagination state belong in the URL (query params), not only in component
  state — otherwise a shared link shows the recipient something different from what the sender saw.
- The URL path should read as the hierarchy it represents, using the same nouns as the labels.
- Transient UI (a hover card, a toast, a non-blocking popover) does not deserve a URL; a modal that
  holds real content usually does.

### Browser controls behave predictably and destroy nothing

The browser gives every user four controls the product did not design — **back, forward, refresh,
and open-in-new-tab** — and they will be used. Each must do the obvious thing: back leaves the
current view for the previous one (not out of the app, and not through twelve modal states); forward
returns; refresh restores the same view; open-in-new-tab opens the row, not the list. None of the
four may destroy in-progress work. The IA obligation here is that each meaningful view is
addressable and history-correct; the *implementation* obligation — that entered data survives these
events — is in `ui-design-principles` → *Behaviour, states and recovery* → Runtime hazards and → *Form and
input rules* → Behaviour under failure. Report the structural half here and hand the persistence
half to that skill.

---

## Label standards

### Verb vs. noun

- Navigation destinations: nouns or noun phrases ("Profile", "Order History", "Settings")
- Actions / CTAs: verbs or verb phrases ("Save", "Share", "Add to cart", "Start free trial")
- Section headings: nouns or participles that describe what follows ("Recent activity", "Upcoming", "In progress")

Mixed forms within the same nav or the same list are a consistency failure.

### Length limits

| Element | Max length |
|---------|-----------|
| Tab bar item | 12 characters (longer labels are truncated on small devices) |
| List section header | 24 characters |
| Screen title / page heading | 32 characters |
| CTA button | 24 characters |
| Sheet title | 40 characters |

These are display limits, not writing targets. Shorter is almost always better.

### Internal terminology

Product codenames, feature flags, backend service names, and team names must never appear in user-facing labels. Common failures: "V2 profile", "Legacy checkout", "ML recommendations", "GDPR settings" (should be "Privacy"). If auditing code, grep for labels and cross-check against this pattern.

---

## Consistency rules

### Naming consistency

A concept must have exactly one name across: the tab bar, the screen title, section headers, in-product copy, empty states, error messages, and any onboarding references. Auditing technique: pick three concepts from the nav, search the codebase for every string that references those concepts, and check for synonyms.

### Interaction consistency

If a pattern exists for one instance of a type, it must exist for all instances:
- If one list has swipe-to-delete, all similar lists must have it (or none should)
- If one card is tappable, all visually similar cards should be tappable (or there must be a clear visual signal distinguishing tappable from non-tappable)
- If one form autosaves, all forms should autosave (or there must be explicit Save buttons everywhere)

Inconsistent interactions are not a visual design problem — they are an IA trust problem. Users form mental models from the first instance; the second instance either confirms or breaks the model.

### Capitalisation

Pick one convention and apply it everywhere within a surface:
- **Title Case**: Home, Order History, My Profile — common for tab bars and headings
- **Sentence case**: Home, Order history, My profile — increasingly preferred for modern mobile UI

Mixing conventions within the same nav level is a failure. Mixing across different levels (Title Case for tabs, Sentence case for section headers) is acceptable.


---

## Agentic structure

**Conditional. This section applies only when the product's core interaction is a model producing
output or an agent acting on the user's behalf.** A product that merely has AI somewhere inside it
uses the rest of this file unchanged.

### Why agentic IA is a different problem

Ordinary IA organises *places*. Agentic IA also has to organise *time*. The agent acts while nobody
is looking, so the product accumulates objects the user did not create and was not present for — a
plan, a run in flight, a result waiting for approval, a run that failed at step six last Tuesday.
Every one of those needs a home, an address, and a way back to it.

This is where a set of individually good screens still produces a confusing product. The screens are
fine; there is simply nowhere that plans, runs and approvals live. The symptom is a user asking
"where did that go?" about work the *system* did, which is not a question ordinary navigation
review is looking for.

### What must be settled

**Actors.** Name every party the structure has to serve, not only the person at the keyboard:
the **user** who asks, the **agent** that acts, the **human reviewer** who approves (often the same
person in a different role, and the structure must serve the role, not the person), the **operator**
who configures and monitors, and **affected third parties** who never touch the product but receive
what it sends. A structure designed only for the asking-user is the common failure.

**Responsibility.** For each task, six roles, and they are not interchangeable: who **initiates**,
who **decides**, who **approves**, who **executes**, who **verifies**, and who **owns recovery** when
it goes wrong. Recovery ownership is the one most often left unassigned, and it is the one that
determines whether a failed run has anywhere to be resolved.

**Persistent objects.** These are first-class nouns in an agentic product, and each needs a home, a
lifespan, and — on the web — an address:

| Object | The question it answers |
|---|---|
| **Task** | What was asked for |
| **Plan** | What the system intends to do about it |
| **Run** | A single attempt at the plan, with a status and a duration |
| **Result** | What the run produced |
| **Source** | What the result rests on |
| **Permission** | What the agent may touch for this task |
| **Approval** | Who agreed to what, and when |
| **History** | Everything above, after the fact |

Not every product needs all eight as destinations. Every product needs to have *decided* about all
eight — a persistent object with no home reappears as a support question.

**Handoffs.** Every point where responsibility moves between actors: user → agent at initiation,
agent → reviewer at approval, agent → user on failure, agent → third party on send. Each handoff
needs a surface, a notification path, and a defined state on both sides. An unhandled handoff is
where work silently stops.

**Re-entry.** Where the user finds work later, by status: **running** (started and still going),
**completed** (finished, possibly unreviewed), **failed** (stopped and needing a decision), and
**paused** (waiting on a human). These four are different retrieval needs, and collapsing them into
one "activity" list is the same defect as collapsing first-use, user-cleared and no-results into one
empty state. Ask the plain question: the user closes the laptop mid-run and opens it tomorrow —
name the exact route back.

**Provenance.** For any result the product presents: what produced it, on what evidence, under whose
approval, and where that record lives once the session ends. This is a structural question, not a
visual one — the visual side is the generated-versus-retrieved distinction, which belongs to
`ui-design-principles` → *AI and agentic interfaces*.

### The guard — user intent stays authoritative

**Do not import a Data/Domain/Use-case model as a navigation generator.** The eight objects above
are a checklist of things that need homes, not a site map. An agentic product organised around its
own domain model produces exactly the failure this file's *Grouping logic* section already names —
navigation that mirrors the backend rather than the user's mental model, with the extra hazard that
the backend is now unusually persuasive because it has real nouns in it.

Group by user intent, as everywhere else. Then check that each persistent object has a home
somewhere in that structure. If an object has no natural home under an intent-based grouping, that
is a finding about the *product*, not a licence to add a destination named after the object. "Runs"
as a top-level tab is occasionally right and usually the domain model leaking into the nav.

### Common findings

- Approvals have no queue — they exist only as notifications, so a missed one is lost.
- Failed runs have no home; the only route back is the original chat scrollback.
- The plan is visible before execution and unreachable afterwards, so no one can check what was
  agreed against what happened.
- Permission scope is in global settings, while the decision it affects is per-task.
- History exists but is not addressable, so a result cannot be linked to or shared with the reviewer
  who needs it.
- "Activity" is one undifferentiated list mixing running, completed, failed and paused work.
