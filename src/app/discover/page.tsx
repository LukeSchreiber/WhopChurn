export default function Discover() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 800, margin: '40px auto', padding: 20 }}>
      <h1 style={{ color: '#e5e7eb', textAlign: 'center', marginBottom: 20, background: '#111827', padding: 16, borderRadius: 8 }}>Whop Churn – Discover</h1>
      <div style={{ background: '#1f2937', color: '#e5e7eb', padding: 20, borderRadius: 8 }}>
        <p>Reduce churn with one‑click messaging and recovery flows, embedded directly inside Whop.</p>
        <ul>
          <li>• Live tiles: total, active, canceled, at‑risk</li>
          <li>• At‑risk list with one‑click Message</li>
          <li>• Recent cancellations with one‑click Recover</li>
          <li>• Exit survey insights</li>
        </ul>
        <p style={{ marginTop: 16 }}>To install, open the app in Whop and authorize access. The embedded dashboard will appear under your Whop account.</p>
      </div>
    </div>
  );
}
