import Link from 'next/link';
import { BLOG_POSTS } from '@/data/blogs';
import { ArrowUpRight, Clock } from 'lucide-react';

export function LatestGuides() {
  const latestFour = BLOG_POSTS.slice(0, 3);

  return (
    <section className="section-rail" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="section-heading">
        <div>
          <div className="eyebrow" style={{ color: 'var(--red)', marginBottom: 12 }}>
            REAL HIGHWAY INSIGHTS
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)' }}>
            Latest Expedition Guides &amp; Route Logistics
          </h2>
        </div>
        <div className="heading-aside">
          Practical advice from our high-altitude and regional road directors. 
          <br />
          <Link href="/blog" className="text-link" style={{ color: 'var(--red)', marginTop: 8, display: 'inline-flex' }}>
            View all 10+ guides <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <div className="home-guides-grid">
        {latestFour.map((post) => (
          <article key={post.id} className="home-guide-card">
            <div className="guide-img-wrap">
              <img src={post.featuredImage.url} alt={post.featuredImage.alt} loading="lazy" />
              <span className="guide-cat">{post.category}</span>
            </div>
            <div className="guide-body">
              <div className="guide-meta">
                <Clock size={12} /> {post.readTime}
              </div>
              <h3>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p>{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="text-link" style={{ marginTop: 'auto', paddingTop: 12 }}>
                Read full route guide <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
