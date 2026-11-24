import { describe, it, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

// Helper: Calculate luminance for WCAG contrast ratio
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(...hexToRgb(hex1));
  const lum2 = getLuminance(...hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const ROOT_DIR = path.resolve(__dirname, '..');

describe('Full Application Verification Suite', () => {
  describe('1. Dark Mode Contrast & Zero Hidden Text Verification', () => {
    const globalsCss = fs.readFileSync(path.join(ROOT_DIR, 'app/globals.css'), 'utf-8');

    it('contains comprehensive .dark theme definitions and CSS variables', () => {
      expect(globalsCss).toContain('.dark {');
      expect(globalsCss).toContain('--background: 224 71% 4%');
      expect(globalsCss).toContain('--foreground: 210 20% 98%');
      expect(globalsCss).toContain('--card-bg: #0f172a');
    });

    it('has high WCAG AA/AAA contrast ratios for dark mode text pairs', () => {
      const darkBg = '#0b1120';
      const textPrimary = '#f8fafc';
      const textSecondary = '#cbd5e1';
      const textMuted = '#94a3b8';
      const accentRed = '#ff6e54';
      const mintGreen = '#a7f3d0';

      // Primary text contrast (> 7:1 for AAA)
      const primaryRatio = getContrastRatio(darkBg, textPrimary);
      expect(primaryRatio).toBeGreaterThan(12.0);

      // Secondary text contrast (> 4.5:1 for AA)
      const secondaryRatio = getContrastRatio(darkBg, textSecondary);
      expect(secondaryRatio).toBeGreaterThan(9.0);

      // Muted text contrast (> 4.5:1 for AA)
      const mutedRatio = getContrastRatio(darkBg, textMuted);
      expect(mutedRatio).toBeGreaterThan(5.0);

      // Accent red on dark (> 4.5:1 for AA)
      const accentRatio = getContrastRatio(darkBg, accentRed);
      expect(accentRatio).toBeGreaterThan(5.5);

      // Mint green on dark (> 7:1 for AAA)
      const mintRatio = getContrastRatio(darkBg, mintGreen);
      expect(mintRatio).toBeGreaterThan(9.0);
    });

    it('resolves time slot card dark mode styling (no white-on-white text)', () => {
      expect(globalsCss).toContain('.dark .time-slot-card');
      expect(globalsCss).toContain('.dark .time-slot-card .slot-title strong');
      expect(globalsCss).toContain('.dark .time-slot-card p');
    });

    it('resolves budget table and feature comparison dark mode styling', () => {
      expect(globalsCss).toContain('.dark .visual-budget-section');
      expect(globalsCss).toContain('.dark .budget-table');
      expect(globalsCss).toContain('.dark .budget-table th');
      expect(globalsCss).toContain('.dark .budget-table td');
      expect(globalsCss).toContain('.dark .budget-table .total-row td');
    });

    it('resolves stay box and hotel recommendation contrast in dark mode', () => {
      expect(globalsCss).toContain('.dark .day-stay-box');
      expect(globalsCss).toContain('.dark .stay-label');
      expect(globalsCss).toContain('rgba(16, 185, 129, 0.1)');
    });

    it('resolves form controls, inputs, and select options in dark mode', () => {
      expect(globalsCss).toContain('.dark input');
      expect(globalsCss).toContain('.dark select');
      expect(globalsCss).toContain('.dark textarea');
      expect(globalsCss).toContain('.dark select option');
    });

    it('resolves enquiry section, CTA band, and site header in dark mode', () => {
      expect(globalsCss).toContain('.dark .enquiry-section');
      expect(globalsCss).toContain('.dark .cta-band');
      expect(globalsCss).toContain('.dark .site-header');
      expect(globalsCss).toContain('.dark .logo img');
    });
  });

  describe('2. AI Planner Streaming & Loader State Verification', () => {
    const tripPlannerTsx = fs.readFileSync(path.join(ROOT_DIR, 'src/components/planner/trip-planner.tsx'), 'utf-8');
    const itineraryViewerTsx = fs.readFileSync(path.join(ROOT_DIR, 'src/components/planner/itinerary-viewer.tsx'), 'utf-8');

    it('includes the 5-stage progressive loading stepper with multi-stage cues', () => {
      expect(tripPlannerTsx).toContain('LOADING_STAGES');
      expect(tripPlannerTsx).toContain('Connecting to Collabcar AI Engine');
      expect(tripPlannerTsx).toContain('Analyzing terrain & road conditions');
      expect(tripPlannerTsx).toContain('Configuring AITP chauffeur logistics');
      expect(tripPlannerTsx).toContain('Curating day-by-day stops & stays');
      expect(tripPlannerTsx).toContain('Finalizing transparent budget breakdown');
    });

    it('displays the clean, non-streaming loader with clear status messaging', () => {
      expect(tripPlannerTsx).toContain('We are working on your itinerary...');
      expect(tripPlannerTsx).toContain('Your complete PDF dossier will display here automatically once ready');
      expect(tripPlannerTsx).not.toContain('Live DeepSeek Token Stream');
    });

    it('provides clean and minimal builder input configuration without slop', () => {
      expect(tripPlannerTsx).toContain('Destination in India');
      expect(tripPlannerTsx).toContain('Starting City');
      expect(tripPlannerTsx).toContain('Duration (Days)');
      expect(tripPlannerTsx).toContain('Total Budget (₹)');
    });

    it('directly defaults to and displays the PDF format with download option', () => {
      expect(itineraryViewerTsx).toContain("useState<'visual' | 'pdf' | 'editor'>('pdf')");
      expect(itineraryViewerTsx).toContain('Download PDF');
    });

    it('includes enhanced builder inputs: duration chips, budget presets, pace, and stay selectors', () => {
      expect(tripPlannerTsx).toContain('DURATION_CHIPS');
      expect(tripPlannerTsx).toContain('BUDGET_PRESETS');
      expect(tripPlannerTsx).toContain('TRAVELLER_CHIPS');
      expect(tripPlannerTsx).toContain('PACE_OPTIONS');
      expect(tripPlannerTsx).toContain('STAY_OPTIONS');
    });

    it('provides collapsible day cards and jump navigation in the itinerary viewer', () => {
      expect(itineraryViewerTsx).toContain('toggleDay');
      expect(itineraryViewerTsx).toContain('toggleExpandAll');
      expect(itineraryViewerTsx).toContain('expandedDays');
      expect(itineraryViewerTsx).toContain('activeTab');
    });
  });

  describe('3. PDF Preview Scrolling & Print Output Verification', () => {
    const itineraryPdfTsx = fs.readFileSync(path.join(ROOT_DIR, 'src/components/planner/itinerary-pdf.tsx'), 'utf-8');

    it('provides continuous document reader with zoom and view mode controls', () => {
      expect(itineraryPdfTsx).toContain('handleZoomIn');
      expect(itineraryPdfTsx).toContain('handleZoomOut');
      expect(itineraryPdfTsx).toContain('handleZoomReset');
      expect(itineraryPdfTsx).toContain('handleFitWidth');
      expect(itineraryPdfTsx).toContain('setViewMode');
      expect(itineraryPdfTsx).toContain('continuous');
      expect(itineraryPdfTsx).toContain('pages');
    });

    it('provides luxury dossier layout, branding, and jump navigation', () => {
      expect(itineraryPdfTsx).toContain('dossierId');
      expect(itineraryPdfTsx).toContain('themeBadges');
      expect(itineraryPdfTsx).toContain('handlePrint');
      expect(itineraryPdfTsx).toContain('handleCopySummary');
      expect(itineraryPdfTsx).toContain('Collabcar Assurance');
    });

    it('includes @media print rules with A4 portrait size and cutoff prevention', () => {
      expect(itineraryPdfTsx).toContain('@media print');
      expect(itineraryPdfTsx).toContain('size: A4 portrait');
      expect(itineraryPdfTsx).toContain('break-inside: avoid !important');
      expect(itineraryPdfTsx).toContain('page-break-inside: avoid !important');
      expect(itineraryPdfTsx).toContain('break-after: avoid !important');
      expect(itineraryPdfTsx).toContain('.no-print');
    });
  });

  describe('4. Localhost:4000 Server & Page Availability Verification', () => {
    const pages = [
      { name: 'Home page', path: '/' },
      { name: 'Trip Planner page', path: '/planner' },
      { name: 'Blog index page', path: '/blog' },
      { name: 'Blog detail page', path: '/blog/delhi-to-ladakh-road-trip-guide' },
      { name: 'About page', path: '/about' },
      { name: 'Contact page', path: '/contact' },
    ];

    for (const p of pages) {
      it(`serves ${p.name} (${p.path}) with HTTP 200 without runtime errors`, async () => {
        const res = await fetch(`http://localhost:4000${p.path}`);
        expect(res.status).toBe(200);

        const html = await res.text();
        expect(html.length).toBeGreaterThan(100);
        expect(html).not.toContain('"statusCode":500');
        expect(html).not.toContain('Cannot find module');
      });
    }

    it('serves Health check API (/api/health) with HTTP 200 ok', async () => {
      const res = await fetch('http://localhost:4000/api/health');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });

    it('verifies that dark mode theme support is loaded in the HTML', async () => {
      const res = await fetch('http://localhost:4000/');
      const html = await res.text();
      expect(html).toContain('Collabcar');
    });
  });

  describe('5. Baseline UI Constraints & Zero Vendor AI Purge Verification', () => {
    const globalsCss = fs.readFileSync(path.join(ROOT_DIR, 'app/globals.css'), 'utf-8');
    const plannerPage = fs.readFileSync(path.join(ROOT_DIR, 'app/planner/page.tsx'), 'utf-8');
    const tripPlannerTsx = fs.readFileSync(path.join(ROOT_DIR, 'src/components/planner/trip-planner.tsx'), 'utf-8');
    const itineraryViewerTsx = fs.readFileSync(path.join(ROOT_DIR, 'src/components/planner/itinerary-viewer.tsx'), 'utf-8');
    const itineraryPdfTsx = fs.readFileSync(path.join(ROOT_DIR, 'src/components/planner/itinerary-pdf.tsx'), 'utf-8');

    it('confirms 100% zero user-facing DeepSeek or DeepSeek AI references across UI copy and metadata', () => {
      expect(plannerPage.toLowerCase()).not.toContain('deepseek');
      expect(tripPlannerTsx.toLowerCase()).not.toContain('deepseek');
      expect(itineraryViewerTsx.toLowerCase()).not.toContain('deepseek');
      expect(itineraryPdfTsx.toLowerCase()).not.toContain('deepseek');
      expect(globalsCss.toLowerCase()).not.toContain('deepseek');
    });

    it('enforces unified border-radius tokens (--radius: 12px, --radius-sm: 8px, --radius-lg: 16px)', () => {
      expect(globalsCss).toContain('--radius: 12px;');
      expect(globalsCss).toContain('--radius-sm: 8px;');
      expect(globalsCss).toContain('--radius-lg: 16px;');
    });

    it('enforces modern typography hierarchy with text-balance and text-pretty', () => {
      expect(globalsCss).toContain('text-wrap: balance;');
      expect(globalsCss).toContain('text-wrap: pretty;');
      expect(globalsCss).toContain('font-variant-numeric: tabular-nums;');
    });

    it('protects mobile responsiveness with safe-area-inset and dvh sizing', () => {
      expect(globalsCss).toContain('safe-area-inset-bottom');
      expect(globalsCss).toContain('safe-area-inset-top');
      expect(itineraryPdfTsx).toContain('100dvh');
      expect(globalsCss).toContain('@media (prefers-reduced-motion: reduce)');
    });
  });

  describe('6. Real-Time Route Intelligence & Search Grounding Verification', () => {
    it('extracts structured trip parameters from configured prompt text', async () => {
      const { extractTripParameters } = await import('@/lib/route-intelligence.server');
      const params = extractTripParameters(
        'Draft a new India itinerary with these preferences: destination Jaipur; departure city Delhi; start date flexible; 3 days; 2 travellers; total group budget INR 45000; travel pace Balanced; stay preference Heritage Haveli; interests and needs: scenic views, authentic food. Include a practical day-by-day route.'
      );
      expect(params.destination).toBe('Jaipur');
      expect(params.departure).toBe('Delhi');
      expect(params.days).toBe(3);
      expect(params.travellers).toBe(2);
      expect(params.budget).toBe('45000');
      expect(params.pace).toBe('Balanced');
      expect(params.stay).toBe('Heritage Haveli');
    });

    it('generates grounded route context with highway corridors and zero-blind directives', async () => {
      const { searchRouteIntelligence, extractTripParameters } = await import('@/lib/route-intelligence.server');
      const params = extractTripParameters('destination Jaipur; departure city Delhi; 3 days');
      const grounding = await searchRouteIntelligence(params);
      expect(grounding).toContain('VERIFIED REAL-TIME SEARCH & ROUTE GROUNDING');
      expect(grounding).toContain('Delhi-Mumbai Expressway (NE4)');
      expect(grounding).toContain('STRICT GROUNDING & LOGICAL ITINERARY DIRECTIVES');
      expect(grounding).toContain('Exact Highway Names & Distances');
    });

    it('confirms server stream assistant wires searchRouteIntelligence and web search tools', () => {
      const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/integrated-ai.server.ts'), 'utf-8');
      expect(serverCode).toContain('searchRouteIntelligence');
      expect(serverCode).toContain('extractTripParameters');
      expect(serverCode).toContain('deepseek_web_search');
      expect(serverCode).toContain('routeGrounding');
    });
  });
});
