import "./pricing.css";

// Marketing pricing card. Featured tier gets the gradient CTA.
export function PricingCard({ tier, featured }) {
  return (
    <div className={featured ? "pricing pricing--featured" : "pricing"}>
      <h3 className="pricing__name">{tier.name}</h3>
      <div className="pricing__price">${tier.price}<span>/mo</span></div>
      <ul className="pricing__features">
        {tier.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <button className="pricing__cta">Choose {tier.name}</button>
    </div>
  );
}
