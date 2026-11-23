import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { destinations } from '@/data/destinations';

export function Destinations() {
  return (
    <section className="destinations section-rail" id="destinations">
      <div className="section-heading">
        <div>
          <span className="eyebrow">GO SOMEWHERE THAT FEELS LIKE YOU</span>
          <h2>
            A little inspiration.
            <br />
            A lot of India.
          </h2>
        </div>
        <div className="heading-aside">
          <p>
            Mountains or coast. A quick escape or a grand adventure.
            <br />
            Every route is just a starting point. We make it yours.
          </p>
          <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
            <Link href="/planner" className="text-link" style={{ color: 'var(--red)' }}>
              <Sparkles size={15} /> Build with AI Planner <ArrowUpRight size={15} />
            </Link>
            <a href="#enquire" className="text-link">
              Talk to operations desk <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </div>

      <div className="destination-grid">
        {destinations.map((d, i) => (
          <div key={d.name} className="destination">
            <Link href={`/planner?destination=${encodeURIComponent(d.name)}`} className="destination-photo-link">
              <div className="destination-photo">
                <img
                  src={d.image}
                  srcSet={`${d.image}?width=375 375w, ${d.image}?width=768 768w, ${d.image} 896w`}
                  sizes="(min-width: 800px) 30vw, 90vw"
                  width={896}
                  height={1195}
                  alt={`${d.name} travel scenery`}
                  loading="lazy"
                />
                <span className="destination-tag">{d.tag}</span>
                <span className="destination-number">0{i + 1}</span>
                <div className="destination-overlay">
                  <h3>{d.name}</h3>
                  <span>{d.duration} · Tailored to you</span>
                  <span className="round-arrow">
                    <ArrowUpRight />
                  </span>
                </div>
              </div>
            </Link>

            <p>{d.description}</p>
            <span className="destination-route">{d.route}</span>

            <div className="destination-card-cta" style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <Link
                href={`/planner?destination=${encodeURIComponent(d.name)}`}
                className="button outline"
                style={{ padding: '8px 12px', minHeight: 36, fontSize: 11, flex: 1, gap: 6 }}
              >
                <Sparkles size={13} style={{ color: 'var(--red)' }} /> Plan with AI
              </Link>
              <a
                href={`/?destination=${encodeURIComponent(d.name)}#enquire`}
                className="text-link"
                style={{ fontSize: 11, padding: '0 8px', whiteSpace: 'nowrap' }}
              >
                Get Quote <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="destination-note">
        These are itinerary ideas, not fixed packages. Your route, stays and budget are tailored dynamically by our AI and confirmed with operations.
      </p>
    </section>
  );
}
