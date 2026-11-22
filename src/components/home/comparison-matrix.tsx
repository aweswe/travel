import { CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function ComparisonMatrix() {
  return (
    <section className="section-rail comparison-home-section" style={{ paddingTop: 30, paddingBottom: 60 }}>
      <div className="section-heading">
        <div>
          <div className="eyebrow" style={{ color: 'var(--red)', marginBottom: 12 }}>
            HONEST OPERATIONAL COMPARISON
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)' }}>
            Why Travellers Choose Collabcar Over Self-Drive &amp; Tour Aggregators
          </h2>
        </div>
        <div className="heading-aside">
          Navigating Indian highways requires local experience. See how Collabcar stacks up against Zoomcar, MakeMyTrip, and Savaari.
        </div>
      </div>

      <div className="table-wrapper">
        <table className="feature-comparison-table">
          <thead>
            <tr>
              <th>Evaluation Factor</th>
              <th className="highlight-cell">Collabcar Chauffeured</th>
              <th>Self-Drive (Zoomcar / Revv)</th>
              <th>Package Aggregators (MakeMyTrip)</th>
              <th>Unvetted Street Taxis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Driver Highway Fatigue</strong></td>
              <td className="highlight-cell">
                <CheckCircle2 size={16} color="#22c55e" style={{ display: 'inline', marginRight: 6 }} />
                Zero fatigue; seasoned local chauffeurs
              </td>
              <td>
                <XCircle size={16} color="#ef4444" style={{ display: 'inline', marginRight: 6 }} />
                Renter bears 8-10h intense daily driving
              </td>
              <td>Shared bus or variable cab drivers</td>
              <td>Driver quality unknown; frequent fatigue</td>
            </tr>
            <tr>
              <td><strong>State Border Taxes &amp; Permits</strong></td>
              <td className="highlight-cell">
                <CheckCircle2 size={16} color="#22c55e" style={{ display: 'inline', marginRight: 6 }} />
                Transparently calculated &amp; assisted
              </td>
              <td>
                <XCircle size={16} color="#ef4444" style={{ display: 'inline', marginRight: 6 }} />
                Renter must queue at RTO border booths
              </td>
              <td>Billed extra or hidden in package fees</td>
              <td>Often demands unexpected cash at border</td>
            </tr>
            <tr>
              <td><strong>Accident &amp; Damage Liability</strong></td>
              <td className="highlight-cell">
                <CheckCircle2 size={16} color="#22c55e" style={{ display: 'inline', marginRight: 6 }} />
                ₹0 customer liability
              </td>
              <td>
                <XCircle size={16} color="#ef4444" style={{ display: 'inline', marginRight: 6 }} />
                Deductible up to ₹10,000 + repair downtime
              </td>
              <td>Varies by third-party operator</td>
              <td>Personal liability risks in disputes</td>
            </tr>
            <tr>
              <td><strong>Security Deposit Hold</strong></td>
              <td className="highlight-cell">
                <CheckCircle2 size={16} color="#22c55e" style={{ display: 'inline', marginRight: 6 }} />
                ₹0 security deposit locked
              </td>
              <td>
                <XCircle size={16} color="#ef4444" style={{ display: 'inline', marginRight: 6 }} />
                ₹5,000 to ₹15,000 held for weeks
              </td>
              <td>₹0 security deposit</td>
              <td>₹0 security deposit</td>
            </tr>
            <tr>
              <td><strong>High Mountain Union Access (Leh/Pahalgam)</strong></td>
              <td className="highlight-cell">
                <CheckCircle2 size={16} color="#22c55e" style={{ display: 'inline', marginRight: 6 }} />
                Pre-coordinated local union transfers
              </td>
              <td>
                <XCircle size={16} color="#ef4444" style={{ display: 'inline', marginRight: 6 }} />
                Banned from Nubra, Pangong &amp; high passes
              </td>
              <td>Standard fixed group vehicle swap</td>
              <td>Must negotiate street taxi queues</td>
            </tr>
            <tr>
              <td><strong>Itinerary Customization</strong></td>
              <td className="highlight-cell">
                <CheckCircle2 size={16} color="#22c55e" style={{ display: 'inline', marginRight: 6 }} />
                100% custom via AI planner &amp; concierges
              </td>
              <td>Flexible route, but zero logistics help</td>
              <td>Rigid fixed group itinerary schedules</td>
              <td>Route negotiated on the spot</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--quiet)' }}>
          Read our in-depth study: <Link href="/blog/chauffeur-driven-vs-self-drive-car-rental-india" className="text-link" style={{ color: 'var(--red)', fontWeight: 700 }}>Chauffeur-Driven vs Self-Drive in India (Cost, Tolls &amp; Safety) →</Link>
        </span>
        <Link href="/planner" className="button" style={{ padding: '10px 18px', minHeight: 42, fontSize: 11 }}>
          Build Custom Itinerary <ArrowUpRight size={15} />
        </Link>
      </div>
    </section>
  );
}
