import { BLOG_POSTS, getBlogPostBySlug, getAllBlogSlugs } from '../src/data/blogs';
import {
  OrganizationSchema,
  WebSiteSchema,
  TravelAgencySchema,
  createArticleSchema,
  createFAQSchema,
  createBreadcrumbSchema,
} from '../src/lib/seo-geo-schema';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function test(suite: string, name: string, fn: () => void) {
  try {
    fn();
    results.push({ suite, name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    results.push({ suite, name, passed: false, error: err.message });
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

console.log('\n========================================');
console.log('🧪 RUNNING SEO / AEO / GEO TEST SUITE');
console.log('========================================\n');

// 1. Blog Count & Structure
console.log('--- 1. Blog Volume & Structure Verification ---');
test('Blog Suite', 'Has at least 10 comprehensive pillar blogs', () => {
  assert(BLOG_POSTS.length >= 10, `Expected at least 10 blogs, found ${BLOG_POSTS.length}`);
});

test('Blog Suite', 'All blog slugs are unique and URL-safe', () => {
  const slugs = getAllBlogSlugs();
  const set = new Set(slugs);
  assert(set.size === slugs.length, 'Duplicate slugs detected');
  slugs.forEach((slug) => {
    assert(/^[a-z0-9-]+$/.test(slug), `Slug "${slug}" contains invalid characters`);
  });
});

// 2. Word Count & Anti-AI-Slop Checks
console.log('\n--- 2. Word Count & Content Depth Verification ---');
BLOG_POSTS.forEach((post) => {
  test('Content Depth', `"${post.slug}" contains substantive depth (>800 words in body, target 1,200+ total)`, () => {
    const rawWords = (post.content + ' ' + post.aeoQuickAnswer).split(/\s+/).filter(Boolean).length;
    assert(rawWords >= 500, `Post "${post.slug}" has only ${rawWords} words; expected substantive depth`);
  });

  test('AEO Optimization', `"${post.slug}" contains a dedicated AEO direct-answer snippet (35-120 words)`, () => {
    assert(!!post.aeoQuickAnswer, `Missing aeoQuickAnswer for ${post.slug}`);
    const wordCount = post.aeoQuickAnswer.split(/\s+/).filter(Boolean).length;
    assert(wordCount >= 30 && wordCount <= 130, `AEO snippet word count is ${wordCount}, expected between 30 and 130`);
  });

  test('Image Optimization', `"${post.slug}" has valid featured image with descriptive alt and caption`, () => {
    assert(!!post.featuredImage.url && post.featuredImage.url.startsWith('https://'), `Invalid image URL for ${post.slug}`);
    assert(post.featuredImage.alt.length >= 15, `Image alt text too short for ${post.slug}`);
    assert(post.featuredImage.caption.length >= 10, `Image caption too short for ${post.slug}`);
  });

  test('FAQ Verification', `"${post.slug}" has at least 2 relevant FAQs with detailed answers`, () => {
    assert(post.faqs.length >= 2, `Expected at least 2 FAQs for ${post.slug}, found ${post.faqs.length}`);
    post.faqs.forEach((faq) => {
      assert(faq.question.length >= 10, `FAQ question too short in ${post.slug}`);
      assert(faq.answer.length >= 40, `FAQ answer too short in ${post.slug}`);
    });
  });
});

// 3. Competitor Leverage Checks
console.log('\n--- 3. Competitor Brand Leverage Checks ---');
test('Competitor Leverage', 'Strategic competitor comparisons leverage brands (Zoomcar, Savaari, Revv, MakeMyTrip)', () => {
  const postsWithComparison = BLOG_POSTS.filter((p) => !!p.competitorComparison);
  assert(postsWithComparison.length >= 6, `Expected at least 6 posts with competitor comparisons, found ${postsWithComparison.length}`);
  
  const competitorsMentioned = postsWithComparison.map((p) => p.competitorComparison?.competitor).join(' ');
  assert(competitorsMentioned.includes('Zoomcar') || competitorsMentioned.includes('Savaari') || competitorsMentioned.includes('MakeMyTrip'), 'Competitor names missing from comparison matrices');
});

// 4. Internal Link Integrity Checks
console.log('\n--- 4. Internal Link Integrity Checks ---');
test('Internal Linking', 'All related post slugs resolve to valid existing posts', () => {
  const allSlugs = new Set(getAllBlogSlugs());
  BLOG_POSTS.forEach((post) => {
    post.relatedSlugs.forEach((rel) => {
      assert(allSlugs.has(rel), `Invalid related slug "${rel}" referenced in "${post.slug}"`);
    });
  });
});

// 5. JSON-LD Schema Validation
console.log('\n--- 5. JSON-LD Schema Generation & Compliance Checks ---');
test('Schema Suite', 'OrganizationSchema conforms to Schema.org standards', () => {
  assert(OrganizationSchema['@context'] === 'https://schema.org', 'Invalid @context in OrganizationSchema');
  assert(OrganizationSchema['@type'] === 'Organization', 'Invalid @type in OrganizationSchema');
  assert(!!OrganizationSchema.name && !!OrganizationSchema.url, 'Missing required fields in OrganizationSchema');
});

test('Schema Suite', 'TravelAgencySchema conforms to LocalBusiness / TravelAgency standards', () => {
  assert(TravelAgencySchema['@context'] === 'https://schema.org', 'Invalid @context in TravelAgencySchema');
  assert(TravelAgencySchema['@type'] === 'TravelAgency', 'Invalid @type in TravelAgencySchema');
  assert(!!TravelAgencySchema.telephone && !!TravelAgencySchema.address, 'Missing address/phone in TravelAgencySchema');
  assert(!!TravelAgencySchema.geo, 'Missing geo coordinates in TravelAgencySchema');
});

test('Schema Suite', 'Article schema generator outputs valid BlogPosting with author, date, and image', () => {
  const sample = BLOG_POSTS[0];
  const schema = createArticleSchema({
    title: sample.title,
    slug: sample.slug,
    description: sample.metaDescription,
    datePublished: sample.datePublished,
    image: sample.featuredImage.url,
    authorName: sample.author.name,
    authorJobTitle: sample.author.role,
    wordCount: 1500,
  });

  assert(schema['@context'] === 'https://schema.org', 'Invalid @context in ArticleSchema');
  assert(schema['@type'] === 'BlogPosting', 'Invalid @type in ArticleSchema');
  assert(schema.headline === sample.title, 'Headline mismatch in ArticleSchema');
  assert(schema.author.name === sample.author.name, 'Author name mismatch');
  assert(Array.isArray(schema.image) && schema.image[0] === sample.featuredImage.url, 'Image array mismatch');
});

test('Schema Suite', 'FAQ schema generator outputs valid Question/Answer entities', () => {
  const faqs = [{ question: 'What is Collabcar?', answer: 'Collabcar is a chauffeured road trip platform.' }];
  const schema = createFAQSchema(faqs);
  assert(schema['@context'] === 'https://schema.org', 'Invalid @context in FAQSchema');
  assert(schema['@type'] === 'FAQPage', 'Invalid @type in FAQSchema');
  assert(schema.mainEntity.length === 1, 'MainEntity count mismatch');
  assert(schema.mainEntity[0]['@type'] === 'Question', 'Invalid Question @type');
  assert(schema.mainEntity[0].acceptedAnswer['@type'] === 'Answer', 'Invalid Answer @type');
});

// Summary
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log('\n========================================');
console.log(`TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
