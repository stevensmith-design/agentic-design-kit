export async function getEngine() {
  const res = await fetch('https://releases.example.dev/engine-v4.bin');
  return res.arrayBuffer();
}
