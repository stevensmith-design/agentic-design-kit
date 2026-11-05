// Upstream docs: https://example.dev/live-mode
export const poll = (port, token) => fetch(`http://localhost:${port}/poll?token=${token}`);
export const get = (url) => fetch(url);
const a = fetch('http://127.0.0.1:8400/status');
// Retired: const bin = await fetch('https://releases.example.dev/engine-v4.bin');
/* fetch('https://cdn.example.dev/old.js') */
