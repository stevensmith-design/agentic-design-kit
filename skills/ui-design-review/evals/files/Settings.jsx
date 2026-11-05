import { Button } from "../ui/Button";
import { Tabs, Tab } from "../ui/Tabs";

// Account settings screen. Rendered at /settings.
export function Settings({ user }) {
  return (
    <div className="settings">
      <h1 className="settings__title">Settings</h1>

      <Tabs value="account">
        <Tab id="account">Account</Tab>
        <Tab id="billing">Billing</Tab>
        <Tab id="security">Security</Tab>
        <Tab id="notifications">Notifications</Tab>
      </Tabs>

      <section className="settings__group">
        <Row label="Display name" value={user.name}>
          <Button variant="primary">Edit</Button>
        </Row>
        <Row label="Email" value={user.email}>
          <Button variant="primary">Edit</Button>
        </Row>
        <Row label="Password" value="••••••••">
          <Button variant="primary">Change</Button>
        </Row>
        <Row label="Two-factor auth" value="Off">
          <Button variant="primary">Enable</Button>
        </Row>
        <Row label="Language" value="English">
          <Button variant="primary">Edit</Button>
        </Row>
      </section>

      <div className="settings__footer">
        <Button variant="primary">Save changes</Button>
        <Button variant="primary">Delete account</Button>
      </div>
    </div>
  );
}

function Row({ label, value, children }) {
  return (
    <div className="row">
      <div className="row__label">{label}</div>
      <div className="row__value">{value}</div>
      <div className="row__action">{children}</div>
    </div>
  );
}
