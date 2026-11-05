# Component specification template

Use this template when a component is reusable, consequential, has several variants or states, or
must be handed between design and implementation. Do not create a specification for every trivial
wrapper. The component index should remain compact; link from it to this detail only when the detail
will prevent drift or duplicated interpretation.

This is a design-system artifact, not implementation documentation copied into prose. Record the
decisions that sibling screens and implementations must share. Keep framework-specific API details
in the canonical component source or Storybook.

```markdown
# [Component name]

**Status:** proposed | provisional | current | deprecated
**Owner:** [team / role]
**Canonical implementation:** [path or package]
**Replaces / replaced by:** [component or none]
**Last validated:** [date and representative contexts]

## Overview

### Purpose
[The job this component performs and the user need it serves.]

### Use when
- [Situation where this is the right primitive]

### Do not use when
- [Near-neighbour or misuse, and what to use instead]

## Anatomy

| Part | Required | Role | Content / token owner |
|---|---|---|---|
| Container | yes | hit area and grouping | component tokens |
| Label | yes | action or destination | content rule |
| Leading visual | no | recognition, not decoration | icon system |
| Supporting text | no | consequence or clarification | content rule |

[Add only real parts. Give every part one responsibility.]

## Variants and hierarchy

| Variant | Role | Use | Avoid | Distinguishing channels |
|---|---|---|---|---|
| Primary | one dominant action in scope | … | repeated peers | position, weight, value |
| Secondary | supporting action | … | destructive action | … |

Variants share an anatomy and state model. If a proposed variant requires different anatomy or
behaviour, it may be a different component rather than another style.

## States

| State | Visual signal | Behaviour | Announcement / accessibility | Recovery |
|---|---|---|---|---|
| Default | … | … | … | n/a |
| Hover | … | … | pointer-only enhancement | n/a |
| Focus-visible | … | … | visible keyboard focus | n/a |
| Active / pressed | … | … | … | n/a |
| Disabled | … | no activation | exposed correctly; reason available when needed | … |
| Loading | … | duplicate action prevented | progress communicated | cancel / wait |
| Error | … | safe state retained | error associated with component | retry / correct |
| Success | … | resulting state visible | announce only when effect is otherwise invisible | … |
| Empty | … | next action available | … | … |

Delete states that genuinely do not apply and state why. Do not omit them silently. For a stateful
component, also record combinations that matter: selected + focus-visible, loading + disabled,
error + expanded, and so on.

## Behaviour

- **Activation:** [click / tap / Enter / Space / gesture]
- **Keyboard:** [order, keys, escape behaviour]
- **Focus:** [entry, movement, return target]
- **Pointer / touch:** [target size, drag threshold, hover independence]
- **Persistence:** [what survives navigation, refresh or re-entry]
- **Async:** [pending, duplicate prevention, interruption, retry]
- **Destructive / consequential:** [confirmation, undo, approval or no extra step]
- **Motion:** [property, duration, easing, reduced-motion result]

## Content rules

- **Label grammar:** [verb phrase / noun / sentence case]
- **Length budget:** [realistic bound; include localization expansion]
- **Supporting text:** [when required and what it must explain]
- **Error structure:** [what happened + how to recover]
- **Empty structure:** [what belongs here + how to add it]
- **Numbers / dates / units:** [format and locale owner]
- **AI-generated content:** [attribution, editability and confidence language where applicable]

Include one good and one bad example when wording changes user interpretation.

## Responsive and adaptive behaviour

| Condition | Structure | Priority retained | What moves / collapses | Prohibited fallback |
|---|---|---|---|---|
| Narrow | … | … | … | horizontal clipping |
| Regular | … | … | … | … |
| Expanded | … | … | … | empty decorative width |
| Long / localized text | … | … | … | truncating the decision label |
| Zoom / large text | … | … | … | overlap or lost action |

Describe structural change, not only dimensions. If the component becomes a different interaction
primitive at another breakpoint, name the handoff.

## Accessibility contract

- **Semantic role / native element:** …
- **Accessible name and description:** …
- **State exposed to assistive technology:** …
- **Focus order and visible focus:** …
- **Target size and spacing:** …
- **Contrast pairs:** …
- **Colour independence:** …
- **Reduced motion / forced colours / high contrast:** …
- **Screen-reader result:** [expected concise announcement]

Accessibility is part of the component contract. A consuming screen should not need to repair it.

## Tokens and relationships

| Role | Token | Relationship / invariant |
|---|---|---|
| Height | `--…` | shared with sibling controls |
| Internal spacing | `--…` | icon-label gap remains one step below horizontal padding |
| Radius | `--…` | follows component family / concentric rule |
| Surface | `--…` | distinct from actual grounds |
| Text | `--…` | contrast checked on every state surface |
| Focus | `--…` | visible against component and surrounding ground |
| Motion | `--…` | duration + easing from system ramp |

Name relationships, not only values. Run the token validator whenever this specification introduces
or changes a token.

## Composition rules

- **May contain:** …
- **May be contained by:** …
- **Spacing to siblings:** …
- **Density limits:** …
- **Repeated-list behaviour:** …
- **Near-neighbours:** [what differs and why]

## Anti-patterns

- [Misuse] → [user/system harm] → [correct alternative]

## Validation matrix

| Context | Required evidence | Status |
|---|---|---|
| Representative screen | rendered component in its normal composition | pending |
| All states | state story / preview | pending |
| Narrow + expanded | rendered adaptive structure | pending |
| Long localized copy | stress fixture | pending |
| Keyboard + screen reader | interaction evidence | pending |
| Light / dark / supported themes | token and contrast evidence | pending |

## Change history

| Date | Decision | Evidence | Approval / status |
|---|---|---|---|
```

## Completion test

A component specification is ready when:

1. a designer and implementer would choose the same variant for the same situation;
2. every applicable state has behaviour, signal and recovery;
3. long content, narrow space and assistive technology do not require invention by the consumer;
4. token relationships point back to the approved system rather than forming a parallel one;
5. a canonical implementation and validation evidence are named;
6. the anti-patterns distinguish it from its nearest neighbours.

If the specification merely repeats code props, keep the information in the implementation instead.
