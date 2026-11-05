// FIXTURE (flag): emoji used as chrome — button label inside the tab bar.
// Chrome must use the SVG icon set; emoji stays in content.
export function NotifBar() {
  return (
    <div className="tab-bar">
      <button className="notif-btn">🔔</button>
    </div>
  );
}
