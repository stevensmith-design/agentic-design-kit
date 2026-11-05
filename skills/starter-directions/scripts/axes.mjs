// The build log's axis values — the same lists as design-build/scripts/records-lib.mjs ENUMS, so a
// starter build's log entry passes check-records. tests/run.sh fails if the two disagree.
export const AXES = {
  ground: ['dark', 'mid', 'light'],
  display: ['serif', 'sans', 'slab', 'mono', 'condensed', 'rounded', 'decorative'],
  accent: ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'violet', 'pink', 'neutral'],
};
