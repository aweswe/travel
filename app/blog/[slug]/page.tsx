import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPostBySlug, getAllBlogSlugs, BLOG_POSTS } from '@/data/blogs';
import { buildMetadata } from '@/lib/seo';
import {
  createArticleSchema,
  createFAQSchema,
  createBreadcrumbSchema,
  SITE_URL,
} from '@/lib/seo-geo-schema';
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: 'Guide Not Found' };

  return buildMetadata({
    title: post.seoTitle,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
    image: post.featuredImage.url,
    type: 'article',
    keywords: post.tags,
    publishedTime: post.datePublished,
    modifiedTime: post.dateModified,
    authors: [post.author.name],
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guides & Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const articleSchema = createArticleSchema({
    title: post.title,
    slug: post.slug,
    description: post.metaDescription,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    image: post.featuredImage.url,
    authorName: post.author.name,
    authorJobTitle: post.author.role,
    wordCount: post.content.split(/\s+/).length + post.aeoQuickAnswer.split(/\s+/).length + 400,
    keywords: post.tags,
  });

  const faqSchema = createFAQSchema(post.faqs);

  const relatedPosts = BLOG_POSTS.filter((p) => post.relatedSlugs.includes(p.slug));

  return (
    <article className="blog-post-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb Nav */}
      <nav aria-label="Breadcrumb" className="post-breadcrumb section-rail">
        <Link href="/">Home</Link>
        <ChevronRight size={13} />
        <Link href="/blog">Guides &amp; Blog</Link>
        <ChevronRight size={13} />
        <span aria-current="page">{post.category}</span>
      </nav>

      {/* Hero Header */}
      <header className="post-header section-rail">
        <div className="eyebrow" style={{ color: 'var(--red)', marginBottom: 14 }}>
          <span>●</span> {post.category.toUpperCase()}
        </div>
        <h1>{post.title}</h1>
        <p className="post-excerpt">{post.excerpt}</p>

        <div className="author-bar">
          <img src={post.author.avatar} alt={post.author.name} className="author-img" />
          <div className="author-details">
            <span className="author-name">{post.author.name}</span>
            <span className="author-role">{post.author.role}</span>
          </div>
          <div className="post-meta-details">
            <span>
              <Calendar size={13} /> {new Date(post.datePublished).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span>
              <Clock size={13} /> {post.readTime}
            </span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="post-featured-media section-rail" style={{ paddingTop: 0, paddingBottom: 30 }}>
        <figure style={{ margin: 0 }}>
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            className="featured-post-img"
          />
          <figcaption className="img-caption">{post.featuredImage.caption}</figcaption>
        </figure>
      </div>

      {/* Main Content Layout */}
      <div className="post-layout section-rail" style={{ paddingTop: 0 }}>
        {/* Sidebar Sticky ToC & Planner Promo */}
        <aside className="post-sidebar">
          <div className="toc-box">
            <span className="toc-title">ON THIS PAGE</span>
            <ul className="toc-list">
              {post.tableOfContents.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-promo">
            <Sparkles size={20} color="var(--red)" />
            <h4>Draft this route in 60s</h4>
            <p>Our AI builds a custom itinerary based on this exact highway corridor with verified chauffeurs.</p>
            <Link href="/planner" className="button" style={{ width: '100%', fontSize: 11 }}>
              Start AI Planner <ArrowUpRight size={14} />
            </Link>
          </div>
        </aside>

        {/* Content Body */}
        <div className="post-content-container">
          {/* AEO Quick Answer Block */}
          <div id="aeo-summary" className="aeo-answer-block">
            <div className="aeo-header">
              <Sparkles size={16} />
              <span>DIRECT ANSWER / EXPERT ROUTE SUMMARY</span>
            </div>
            <p>{post.aeoQuickAnswer}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="key-metrics-grid">
            {post.keyStats.map((stat, i) => (
              <div key={i} className="metric-card">
                <span className="metric-label">{stat.label}</span>
                <strong className="metric-value">{stat.value}</strong>
              </div>
            ))}
          </div>

          {/* Competitor Comparison Matrix (if available) */}
          {post.competitorComparison && (
            <div id="self-drive-vs-chauffeured" className="comparison-section">
              <div className="comparison-heading">
                <AlertCircle size={18} color="var(--red)" />
                <h3>Road Logistics Comparison: Collabcar vs. {post.competitorComparison.competitor}</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--quiet)', marginBottom: 18 }}>
                Before committing to rental deposits or unvetted aggregators, compare the operational differences on remote Indian highways:
              </p>
              <div className="table-responsive">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Factor</th>
                      <th className="highlight-col">Collabcar Chauffeured</th>
                      <th>{post.competitorComparison.competitor}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {post.competitorComparison.points.map((pt, idx) => (
                      <tr key={idx}>
                        <td><strong>{pt.feature}</strong></td>
                        <td className="highlight-col">
                          <CheckCircle2 size={14} color="#22c55e" style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                          {pt.collabcar}
                        </td>
                        <td style={{ color: 'var(--quiet)' }}>{pt.competitor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Core Post Markdown / HTML Content */}
          <div className="post-prose">
            {post.content.split('\n\n').map((paragraph, idx) => {
              const trimmed = paragraph.trim();
              if (trimmed.startsWith('### ')) {
                const headingText = trimmed.replace('### ', '');
                const anchorId = headingText
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, '');
                return <h2 key={idx} id={anchorId}>{headingText}</h2>;
              }
              if (trimmed.startsWith('- ')) {
                const items = trimmed.split('\n- ').map((s) => s.replace(/^- /, ''));
                return (
                  <ul key={idx}>
                    {items.map((item, i) => (
                      <li key={i}>
                        {item.includes('**') ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                            }}
                          />
                        ) : (
                          item
                        )}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ')) {
                const items = trimmed.split('\n').filter(Boolean);
                return (
                  <ol key={idx}>
                    {items.map((item, i) => (
                      <li key={i}>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: item.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                          }}
                        />
                      </li>
                    ))}
                  </ol>
                );
              }
              if (trimmed.startsWith('|')) {
                // Render table
                const rows = trimmed.split('\n').map((r) =>
                  r.split('|').map((c) => c.trim()).filter(Boolean)
                );
                const headers = rows[0];
                const dataRows = rows.slice(2);
                return (
                  <div key={idx} className="table-responsive my-6">
                    <table className="comparison-table">
                      <thead>
                        <tr>
                          {headers.map((h, hi) => (
                            <th key={hi}>{h.replace(/\*\*/g, '')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataRows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci} dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return (
                <p
                  key={idx}
                  dangerouslySetInnerHTML={{
                    __html: trimmed
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-link" style="color:var(--red);text-decoration:underline;">$1</a>'),
                  }}
                />
              );
            })}
          </div>

          {/* FAQ Accordion Section */}
          <div id="faqs" className="faq-block">
            <div className="faq-heading">
              <HelpCircle size={20} color="var(--red)" />
              <h2>Frequently Asked Questions</h2>
            </div>
            <div className="faq-accordion">
              {post.faqs.map((faq, index) => (
                <details key={index} className="faq-item" open={index === 0}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Internal Links & CTA Box */}
          <div className="article-cta-box">
            <div className="cta-content">
              <h3>Customise this exact route with Collabcar</h3>
              <p>
                Get transparent pricing, chauffeured vehicle allocation, stay reservations, and permit handling across India with zero stress.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/planner" className="button">
                Build My Itinerary <ArrowUpRight size={16} />
              </Link>
              <Link href="/contact" className="button outline">
                Speak with an Expert
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Pillar Articles */}
      {relatedPosts.length > 0 && (
        <section className="section-rail" style={{ borderTop: '1px solid var(--line)', marginTop: 60, paddingTop: 60 }}>
          <div className="eyebrow" style={{ color: 'var(--red)', marginBottom: 12 }}>
            CONTINUE EXPLORING
          </div>
          <h2 style={{ fontSize: 28, marginBottom: 30 }}>Related Expedition Guides</h2>
          <div className="related-grid">
            {relatedPosts.map((rel) => (
              <div key={rel.id} className="related-card">
                <img src={rel.featuredImage.url} alt={rel.featuredImage.alt} />
                <div className="related-body">
                  <span className="related-cat">{rel.category}</span>
                  <h4>
                    <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                  </h4>
                  <Link href={`/blog/${rel.slug}`} className="text-link" style={{ fontSize: 11 }}>
                    Read guide <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
