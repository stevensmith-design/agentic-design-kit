// FIXTURE (clean): emoji as CONTENT — mood categories and user posts.
// A documented content-emoji system (JP consumer convention) is legitimate;
// only emoji in chrome (buttons/nav/tab bar) is a violation.
const CATEGORIES = [
  { id: 'happy', jp: 'うれしい', emoji: '😊' },
  { id: 'calm', jp: 'おだやか', emoji: '🍀' },
];
export function CategoryChip({ c }) {
  return <span className="chip-text">{c.emoji} {c.jp}</span>;
}
export function Post({ mood }) {
  return <p className="post-body">きょうは {mood.emoji} でした</p>;
}
