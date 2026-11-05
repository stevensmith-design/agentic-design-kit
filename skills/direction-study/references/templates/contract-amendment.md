# Contract amendment — change without rewriting history

When the person refines a direction, the base contract stays read-only and an amendment is appended.
That keeps the reasoning trail and shows what changed and what stayed valid.

```markdown
# <Direction> — amendment <NN>
Date: <date>
Applies to: <proof or route>
Base contract: <file> (preserved read-only)
Directed by: <person>

## Reason
The person's feedback, in their terms.

## Changed
- What changes, stated against the base contract's sections.

## Preserved
- What remains conceptually valid and is kept on purpose.

## Effect
One line: what kind of change this is — visual emphasis, content, motion, scope.
```

Rules: never edit the base contract to match the amendment; number amendments in order; the latest
accepted amendments plus the base are what `/design-build` receives. An amendment directed by the
agent alone is not an amendment — it is a proposal for the person.
