// FIXTURE (clean): real srcs and dynamic srcs are fine; multi-line tags not over-flagged
export function Gallery({ photo }) {
  return (
    <div>
      <img src="/assets/logo.png" alt="logo" />
      <img src={photo.url} alt={photo.label} />
      <img
        src="/assets/banner.png"
        alt="banner"
      />
    </div>
  );
}
