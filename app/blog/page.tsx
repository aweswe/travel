import Link from 'next/link';
import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/data/blogs';
import { buildMetadata } from '@/lib/seo';
import { createBreadcrumbSchema, SITE_URL } from '@/lib/seo-geo-schema';
import { ArrowUpRight, Clock, Calendar, Sparkles } from 'lucide-react';

export const metadata: Metadata = buildMetadata({
  title: 'India Road Trip Guides & Travel Logistics | Collabcar Blog',
  description:
    'Comprehensive, on-the-ground travel guides for road trips across India. Himalayan passes, permits, chauffeur vs self-drive analysis, state border taxes, and route itineraries.',
  path: '/blog',
  keywords: [
    'India road trips',
    'Ladakh road trip guide',
    'Chauffeur vs self drive India',
    'Zoomcar vs Collabcar',
    'Kerala road trip itinerary',
    'Rajasthan road trip cost',
    'Spiti Valley road trip',
  ],
});

export default function BlogIndexPage() {
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guides & Blog', url: '/blog' },
  ]);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Collabcar Travel Guides & Road Logistics',
    description: 'Expert, on-the-ground road trip itineraries and chauffeur logistics across India.',
    url: `${SITE_URL}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: BLOG_POSTS.map((post, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  const featured = BLOG_POSTS[0];
  const remaining = BLOG_POSTS.slice(1);

  return (
    <div className="blog-index-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Header Banner */}
      <section className="blog-header-section section-rail">
        <div className="eyebrow" style={{ color: 'var(--red)', marginBottom: 14 }}>
          <span>●</span> ON-THE-GROUND ROAD INTELLIGENCE
        </div>
        <h1 style={{ fontSize: 'clamp(34px, 4.4vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.04em' }}>
          India Road Trip Guides &amp; <span style={{ color: 'var(--red)' }}>Logistics</span>
        </h1>
        <p style={{ maxWidth: 680, fontSize: 14, color: 'var(--quiet)', marginTop: 18, lineHeight: 1.8 }}>
          Written by high-altitude expedition leaders, highway navigators, and regional route directors. 
          Real permit rules, state border taxes, fuel checkpoints, and honest comparisons against self-drive car rentals.
        </p>
      </section>

      {/* Featured Pillar Post */}
      <section className="section-rail" style={{ paddingTop: 0 }}>
        <div className="featured-card">
          <div className="featured-img-wrap">
            <img
              src={featured.featuredImage.url}
              alt={featured.featuredImage.alt}
              className="featured-img"
              loading="eager"
            />
            <span className="featured-tag">{featured.category}</span>
          </div>
          <div className="featured-content">
            <div className="post-meta">
              <span><Calendar size={13} style={{ display: 'inline', marginRight: 4 }} /> Feb 2026</span>
              <span><Clock size={13} style={{ display: 'inline', marginRight: 4 }} /> {featured.readTime}</span>
            </div>
            <h2>
              <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
            </h2>
            <p>{featured.excerpt}</p>
            <div className="aeo-snippet-pill">
              <strong>Quick AEO Insight:</strong> &quot;{featured.aeoQuickAnswer.slice(0, 140)}...&quot;
            </div>
            <Link href={`/blog/${featured.slug}`} className="button" style={{ alignSelf: 'flex-start', marginTop: 16 }}>
              Read Full Guide <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid of Remaining 9+ Posts */}
      <section className="section-rail" style={{ paddingTop: 20 }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">CURATED REGIONAL EXPEDITIONS</div>
            <h2 style={{ fontSize: 32 }}>All Travel Guides &amp; Route Breakdowns</h2>
          </div>
          <div className="heading-aside">
            Filtered by regional feasibility, vehicle clearances, and authentic ground conditions.
          </div>
        </div>

        <div className="blog-grid">
          {remaining.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-media">
                <img
                  src={post.featuredImage.url}
                  alt={post.featuredImage.alt}
                  loading="lazy"
                />
                <span className="card-cat">{post.category}</span>
              </div>
              <div className="blog-card-body">
                <div className="post-meta">
                  <span>{post.readTime}</span>
                  <span>•</span>
                  <span>{post.tags[0]}</span>
                </div>
                <h3>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p>{post.excerpt}</p>
                <div className="blog-card-footer">
                  <span className="author-name">By {post.author.name}</span>
                  <Link href={`/blog/${post.slug}`} className="text-link">
                    Explore <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Promo AI Banner */}
      <section className="cta-band" style={{ marginTop: 60 }}>
        <div className="eyebrow">YOUR BESPOKE JOURNEY</div>
        <h2>Ready to turn these route guides into your custom road trip?</h2>
        <p>
          Input your travel dates, passenger count, and preferred pace. Collabcar’s AI crafts a day-by-day plan with verified chauffeurs and transparent state taxes.
        </p>
        <Link href="/planner" className="button">
          <Sparkles size={16} /> Launch AI Trip Planner
        </Link>
      </section>
    </div>
  );
}
