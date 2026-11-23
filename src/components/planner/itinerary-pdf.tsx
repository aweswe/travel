'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Printer,
  Download,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  Compass,
  Car,
  MapPin,
  Calendar,
  Users,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Copy,
  Check,
  Share2,
  Sun,
  Sunset,
  Moon,
  Hotel,
  Fuel,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { LOGO } from '@/constants/brand';
import type { ParsedItinerary } from './itinerary-parser';

interface ItineraryPdfProps {
  itinerary: ParsedItinerary;
  destination: string;
  departure: string;
  days: number;
  travellers: number;
  budget: number;
}

export function ItineraryPdfView({
  itinerary,
  destination,
  departure,
  days,
  travellers,
  budget,
}: ItineraryPdfProps) {
  // Zoom & View state
  const [zoom, setZoom] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'continuous' | 'pages'>('continuous');
  const [copied, setCopied] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);

  // Stable document reference ID based on destination & days
  const dossierId = React.useMemo(() => {
    const destCode = (destination || 'IND')
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 3)
      .padEnd(3, 'X');
    const hash = Math.abs(
      (destination + departure).split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 1047)
    )
      .toString()
      .slice(-4)
      .padStart(4, '8');
    return `CC-EXP-${destCode}-${hash}`;
  }, [destination, departure]);

  // Today's formatted issue date
  const issueDate = React.useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  // Theme badges configuration
  const themeBadges = {
    mountains: {
      tag: 'Himalayan & High-Altitude Circuit',
      accentColor: '#1d4ed8',
      bgColor: '#eff6ff',
      borderColor: '#93c5fd',
      icon: '🏔️',
      subText: 'Oxygen-equipped AITP commercial fleets with high-altitude certified mountain chauffeurs.',
    },
    heritage: {
      tag: 'Royal Heritage & Cultural Corridor',
      accentColor: '#b45309',
      bgColor: '#fffbeb',
      borderColor: '#fcd34d',
      icon: '🏰',
      subText: 'Pre-cleared interstate toll corridors with verified chauffeurs fluent in historical landmark access.',
    },
    coastal: {
      tag: 'Coastal & Backwaters Expedition',
      accentColor: '#0f766e',
      bgColor: '#f0fdfa',
      borderColor: '#99f6e4',
      icon: '🌴',
      subText: 'All-weather coastal transit coordination, ferry clearances, and monsoon-rated highway vehicles.',
    },
    wildlife: {
      tag: 'Wildlife & Nature Safari Circuit',
      accentColor: '#15803d',
      bgColor: '#f0fdf4',
      borderColor: '#86efac',
      icon: '🐅',
      subText: 'Coordinated morning safari gate departures and registered forest department transit corridors.',
    },
    default: {
      tag: 'Custom India Road Expedition',
      accentColor: '#d73e24',
      bgColor: '#fff1eb',
      borderColor: '#fca5a5',
      icon: '🚗',
      subText: '100% Commercial AITP fleets with zero passenger liability and verified pan-India tourist permits.',
    },
  };

  const activeTheme = themeBadges[itinerary.destinationTheme] || themeBadges.default;

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.4, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.7, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
  };

  const handleFitWidth = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 48; // padding
    const standardDocWidth = 820;
    if (containerWidth < standardDocWidth) {
      const calculatedZoom = Math.max(0.65, Math.min(1.0, containerWidth / standardDocWidth));
      setZoom(Math.round(calculatedZoom * 100) / 100);
    } else {
      setZoom(1.0);
    }
  };

  // Print handler
  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 250);
  }, []);

  // Keyboard shortcut for Cmd/Ctrl + P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrint]);

  // Copy Dossier Summary
  const handleCopySummary = async () => {
    try {
      const text = `COLLABCARTRAVEL CO. - OFFICIAL TRAVEL DOSSIER
Reference: ${dossierId}
Destination: ${destination || 'India'}
Route: ${itinerary.overview.route || `${departure} ➔ ${destination}`}
Duration: ${days} Days | Travellers: ${travellers}
Fleet: ${itinerary.overview.vehicle || 'Toyota Innova Crysta AITP'}
Est. Budget: ₹${budget?.toLocaleString('en-IN') || 'Custom'}

DAY-BY-DAY OVERVIEW:
${itinerary.days.map((d) => `• Day ${d.dayNumber}: ${d.title}${d.transit ? ` (Transit: ${d.transit})` : ''}`).join('\n')}

Collabcar Assurance: 100% Commercial AITP Fleets • Zero Passenger Damage Liability • 24/7 Operations Desk (care@collabcar.com)`;

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Scroll to section
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Structured Budget fallback if none parsed
  const budgetList = itinerary.budget.length > 0 ? itinerary.budget : [
    {
      category: 'Commercial AITP Fleet & Fuel',
      cost: `₹${Math.round((budget || 35000) * 0.42).toLocaleString('en-IN')}`,
      details: 'Dedicated vehicle with all fuel, chauffeur allowance, and unlimited km running across route',
    },
    {
      category: 'Interstate Road Taxes & Toll Plazas',
      cost: `₹${Math.round((budget || 35000) * 0.12).toLocaleString('en-IN')}`,
      details: 'State entry commercial taxes (AITP pre-cleared) and automated NHAI FASTag charges',
    },
    {
      category: 'Chauffeur Lodging & Daily Allowance',
      cost: `₹${Math.round((budget || 35000) * 0.14).toLocaleString('en-IN')}`,
      details: 'Night halts and food allowance fully absorbed by Collabcar - zero cash gratuity required',
    },
    {
      category: 'Recommended Stays & Experiential Halts',
      cost: `₹${Math.round((budget || 35000) * 0.32).toLocaleString('en-IN')}`,
      details: 'Estimated lodging and heritage sight access (paid directly by guests or pre-booked)',
    },
    {
      category: 'Estimated Total Expedition Budget',
      cost: `₹${(budget || 35000).toLocaleString('en-IN')}`,
      details: `Comprehensive estimated budget for ${travellers} travellers across ${days} days`,
    },
  ];

  return (
    <div className="pdf-reader-container" ref={containerRef}>
      {/* SCOPED LUXURY DOSSIER STYLES */}
      <style jsx>{`
        .pdf-reader-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: #f1f5f9;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          user-select: text;
        }

        :global(.dark) .pdf-reader-container {
          background: #090d16;
          color: #f8fafc;
        }

        /* STICKY TOP TOOLBAR */
        .pdf-reader-toolbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        :global(.dark) .pdf-reader-toolbar {
          background: rgba(15, 23, 42, 0.92);
          border-bottom-color: #1e293b;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .pdf-toolbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .pdf-dossier-ref-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #0f172a;
          color: #ffffff;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        :global(.dark) .pdf-dossier-ref-pill {
          background: #1e293b;
          color: #38bdf8;
          border: 1px solid #334155;
        }

        .pdf-toolbar-doc-title {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 240px;
        }

        :global(.dark) .pdf-toolbar-doc-title {
          color: #94a3b8;
        }

        /* CENTER CONTROLS: ZOOM & VIEW MODES */
        .pdf-toolbar-center {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pdf-ctrl-group {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 2px;
        }

        :global(.dark) .pdf-ctrl-group {
          background: #1e293b;
          border-color: #334155;
        }

        .pdf-ctrl-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        :global(.dark) .pdf-ctrl-btn {
          color: #94a3b8;
        }

        .pdf-ctrl-btn:hover {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        :global(.dark) .pdf-ctrl-btn:hover {
          background: #334155;
          color: #f8fafc;
        }

        .pdf-ctrl-btn.active {
          background: #ffffff;
          color: #d73e24;
          font-weight: 700;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        :global(.dark) .pdf-ctrl-btn.active {
          background: #0f172a;
          color: #ff6b4a;
        }

        .pdf-zoom-badge {
          padding: 0 8px;
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
          min-width: 44px;
          text-align: center;
          font-variant-numeric: tabular-nums;
          cursor: pointer;
        }

        :global(.dark) .pdf-zoom-badge {
          color: #f8fafc;
        }

        /* RIGHT ACTIONS */
        .pdf-toolbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pdf-action-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        :global(.dark) .pdf-action-secondary {
          background: #1e293b;
          border-color: #334155;
          color: #e2e8f0;
        }

        .pdf-action-secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }

        :global(.dark) .pdf-action-secondary:hover {
          background: #334155;
          color: #ffffff;
        }

        .pdf-action-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 16px;
          background: linear-gradient(135deg, #d73e24 0%, #b91c1c 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(215, 62, 36, 0.35);
          transition: all 0.2s ease;
        }

        .pdf-action-primary:hover {
          background: linear-gradient(135deg, #e0482e 0%, #991b1b 100%);
          box-shadow: 0 6px 18px rgba(215, 62, 36, 0.45);
          transform: translateY(-1px);
        }

        .pdf-kbd-shortcut {
          font-size: 10px;
          padding: 1px 5px;
          background: rgba(0, 0, 0, 0.25);
          border-radius: 4px;
          font-family: inherit;
        }

        /* SECTION NAV SUB-BAR */
        .pdf-reader-subnav {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 8px 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
        }

        :global(.dark) .pdf-reader-subnav {
          background: #0f172a;
          border-bottom-color: #1e293b;
        }

        .pdf-reader-subnav::-webkit-scrollbar {
          display: none;
        }

        .pdf-nav-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .pdf-nav-chip:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        :global(.dark) .pdf-nav-chip:hover {
          background: #1e293b;
          color: #f8fafc;
        }

        .pdf-nav-chip.active {
          background: #fff1eb;
          border-color: #fca5a5;
          color: #d73e24;
        }

        :global(.dark) .pdf-nav-chip.active {
          background: rgba(215, 62, 36, 0.15);
          border-color: rgba(215, 62, 36, 0.4);
          color: #ff6b4a;
        }

        /* READER CANVAS (DESK VIEW) */
        .pdf-reader-canvas {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 36px 16px 80px 16px;
          overflow-x: auto;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* A4 SIZING & LUXURY PAPER SHEETS */
        .pdf-dossier-paper {
          width: 820px;
          max-width: 100%;
          background: #ffffff;
          color: #0f172a;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.05);
          padding: 48px 54px;
          transition: transform 0.2s ease;
          position: relative;
        }

        /* PAGED MODE (A4 SHEETS PREVIEW) */
        .pdf-paged-wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
        }

        .pdf-a4-sheet {
          width: 820px;
          max-width: 100%;
          min-height: 1160px; /* A4 aspect ratio representation */
          background: #ffffff;
          color: #0f172a;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          padding: 48px 54px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .pdf-sheet-footer-page-num {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          margin-top: 32px;
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
        }

        /* CONTINUOUS MODE PAGE BREAK INDICATOR */
        .pdf-soft-page-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 36px -54px;
          padding: 12px 54px;
          background: #f8fafc;
          border-top: 1px dashed #cbd5e1;
          border-bottom: 1px dashed #cbd5e1;
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        :global(.dark) .pdf-soft-page-divider {
          background: #f1f5f9;
        }

        /* BRAND MASTHEAD */
        .pdf-masthead {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 24px;
          margin-bottom: 28px;
        }

        .pdf-masthead-brand {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .pdf-logo-box {
          width: 140px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          overflow: hidden;
        }

        .pdf-logo-img {
          max-width: 140px;
          max-height: 48px;
          object-fit: contain;
        }

        .pdf-brand-titles h1 {
          font-size: 17px;
          font-weight: 900;
          letter-spacing: -0.01em;
          color: #d73e24;
          margin: 0;
          line-height: 1.1;
        }

        .pdf-brand-titles p {
          font-size: 10px;
          font-weight: 600;
          color: #475569;
          margin: 3px 0 0 0;
          letter-spacing: 0.02em;
        }

        .pdf-masthead-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .pdf-theme-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.02em;
          border: 1px solid;
        }

        .pdf-meta-line {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .pdf-accreditation-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 800;
          color: #166534;
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.03em;
        }

        /* TITLE & ROUTE SUMMARY */
        .pdf-title-zone {
          margin-bottom: 24px;
        }

        .pdf-dossier-headline {
          font-size: 26px;
          font-weight: 900;
          line-height: 1.2;
          color: #0f172a;
          margin: 0 0 10px 0;
          letter-spacing: -0.02em;
        }

        .pdf-route-banner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 20px;
        }

        /* 4-TO-6 POINT EXPEDITION MATRIX */
        .pdf-matrix-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .pdf-matrix-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .pdf-matrix-icon {
          color: #d73e24;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .pdf-matrix-label {
          display: block;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
          margin-bottom: 2px;
        }

        .pdf-matrix-value {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.25;
        }

        /* DESTINATION ADVISORY BANNER */
        .pdf-advisory-card {
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 28px;
          font-size: 11.5px;
          line-height: 1.5;
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .pdf-advisory-card.mountains {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e3a8a;
        }

        .pdf-advisory-card.heritage {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #78350f;
        }

        .pdf-advisory-card.coastal {
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          color: #134e4a;
        }

        .pdf-advisory-card.wildlife {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #14532d;
        }

        .pdf-advisory-card.default {
          background: #fff1eb;
          border: 1px solid #fecaca;
          color: #7f1d1d;
        }

        .pdf-advisory-title {
          font-weight: 800;
          font-size: 12px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* SECTION HEADER */
        .pdf-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 8px;
          margin: 32px 0 18px 0;
        }

        .pdf-section-title {
          font-size: 16px;
          font-weight: 900;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .pdf-section-badge {
          font-size: 10px;
          font-weight: 700;
          background: #f1f5f9;
          color: #475569;
          padding: 3px 8px;
          border-radius: 4px;
        }

        /* DAY BY DAY SCHEDULE */
        .pdf-days-container {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .pdf-day-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
          overflow: hidden;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .pdf-day-card-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .pdf-day-badge-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pdf-day-num-tag {
          background: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 900;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.04em;
        }

        .pdf-day-title-text {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .pdf-day-transit-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 3px 8px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .pdf-day-body {
          padding: 14px 16px;
        }

        /* TIMELINE MORNING / AFTERNOON / EVENING */
        .pdf-day-slots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 12px;
        }

        .pdf-slot-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
        }

        .pdf-slot-header {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .pdf-slot-header.morning { color: #d97706; }
        .pdf-slot-header.afternoon { color: #2563eb; }
        .pdf-slot-header.evening { color: #7c3aed; }

        .pdf-slot-desc {
          font-size: 11.5px;
          line-height: 1.5;
          color: #334155;
          margin: 0;
          flex: 1;
        }

        .pdf-stay-card {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: #166534;
          margin-top: 10px;
        }

        .pdf-bullets-list {
          margin: 10px 0 0 0;
          padding-left: 20px;
          font-size: 11.5px;
          color: #475569;
          line-height: 1.5;
        }

        .pdf-bullets-list li {
          margin-bottom: 4px;
        }

        /* HIGH RESOLUTION BUDGET TABLE */
        .pdf-budget-table-wrapper {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .pdf-budget-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          text-align: left;
        }

        .pdf-budget-table th {
          background: #0f172a;
          color: #ffffff;
          padding: 10px 14px;
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .pdf-budget-table td {
          padding: 10px 14px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }

        .pdf-budget-table tr:nth-child(even) td {
          background: #f8fafc;
        }

        .pdf-cost-cell {
          font-weight: 800;
          color: #0f172a;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          white-space: nowrap;
        }

        .pdf-budget-total-row td {
          background: #fff1eb !important;
          border-top: 2px solid #d73e24;
          color: #0f172a;
          font-weight: 900;
          font-size: 13px;
        }

        .pdf-budget-total-row .pdf-cost-cell {
          color: #d73e24;
          font-size: 14px;
        }

        /* COMMERCIAL INCLUSIONS GRID */
        .pdf-inclusions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 28px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .pdf-incl-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px 14px;
        }

        .pdf-incl-box h4 {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pdf-incl-box.yes h4 { color: #166534; }
        .pdf-incl-box.no h4 { color: #991b1b; }

        .pdf-incl-list {
          margin: 0;
          padding-left: 18px;
          font-size: 11px;
          color: #475569;
          line-height: 1.5;
        }

        /* CHAUFFEUR INTELLIGENCE CARDS */
        .pdf-tips-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 32px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .pdf-tip-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .pdf-tip-index {
          background: #0f172a;
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
          padding: 3px 7px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .pdf-tip-text {
          font-size: 11.5px;
          line-height: 1.5;
          color: #334155;
          margin: 0;
        }

        /* OFFICIAL ASSURANCE & SIGNATURE FOOTER */
        .pdf-official-footer {
          border-top: 2px solid #0f172a;
          padding-top: 20px;
          margin-top: 36px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .pdf-footer-assurance {
          flex: 1;
        }

        .pdf-assurance-title {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .pdf-assurance-desc {
          font-size: 10.5px;
          color: #475569;
          line-height: 1.5;
          margin: 0 0 8px 0;
        }

        .pdf-contact-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 10.5px;
          font-weight: 700;
          color: #0f172a;
        }

        .pdf-signature-block {
          text-align: right;
          min-width: 200px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .pdf-seal-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .pdf-sign-sub {
          font-size: 9.5px;
          color: #64748b;
          margin: 0;
        }

        /* RESPONSIVE SCREEN ADJUSTMENTS */
        @media (max-width: 860px) {
          .pdf-reader-toolbar {
            padding: 8px 12px;
            flex-wrap: wrap;
          }
          .pdf-dossier-paper {
            padding: 24px 20px;
          }
          .pdf-matrix-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .pdf-day-slots-grid {
            grid-template-columns: 1fr;
          }
          .pdf-inclusions-grid {
            grid-template-columns: 1fr;
          }
          .pdf-tips-grid {
            grid-template-columns: 1fr;
          }
          .pdf-official-footer {
            flex-direction: column;
          }
          .pdf-signature-block {
            align-items: flex-start;
            text-align: left;
          }
        }

        /* PRINT MEDIA ENGINE - ZERO CUTOFFS, TRUE A4 PAGES */
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }

          body,
          html {
            background: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print,
          .pdf-reader-toolbar,
          .pdf-reader-subnav,
          .pdf-soft-page-divider,
          .site-header,
          .site-footer,
          .theme-toggle,
          .cookie-banner,
          .scroll-to-top,
          .viewer-tabs-bar {
            display: none !important;
          }

          .pdf-reader-container {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            box-shadow: none !important;
          }

          .pdf-reader-canvas {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            overflow: visible !important;
          }

          .pdf-dossier-paper,
          .pdf-a4-sheet {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            transform: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }

          .pdf-paged-wrapper {
            gap: 0 !important;
          }

          .pdf-a4-sheet {
            break-after: page !important;
            page-break-after: always !important;
          }

          .pdf-a4-sheet:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }

          /* PREVENT CUTTING SECTIONS ACROSS PAGE MARGINS */
          .pdf-day-card,
          .pdf-budget-table-wrapper,
          .pdf-budget-table tr,
          .pdf-tip-card,
          .pdf-advisory-card,
          .pdf-matrix-grid,
          .pdf-inclusions-grid,
          .pdf-official-footer {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .pdf-section-header,
          .pdf-masthead,
          .pdf-title-zone {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          .pdf-slot-card {
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
          }

          .pdf-budget-table th {
            background: #0f172a !important;
            color: #ffffff !important;
          }

          .pdf-budget-total-row td {
            background: #fff1eb !important;
          }
        }
      `}</style>

      {/* TOP STICKY DOCUMENT READER TOOLBAR (SCREEN ONLY) */}
      <div className="pdf-reader-toolbar no-print">
        {/* Left: Branding & Reference */}
        <div className="pdf-toolbar-left">
          <span className="pdf-dossier-ref-pill">
            <ShieldCheck size={13} className="text-emerald-400" />
            {dossierId}
          </span>
          <span className="pdf-toolbar-doc-title">
            {itinerary.title || `${destination} Travel Dossier`}
          </span>
        </div>

        {/* Center: Zoom & View Mode Controls */}
        <div className="pdf-toolbar-center">
          {/* Zoom controls */}
          <div className="pdf-ctrl-group" title="Adjust document zoom">
            <button
              type="button"
              className="pdf-ctrl-btn"
              onClick={handleZoomOut}
              disabled={zoom <= 0.7}
              title="Zoom Out (Ctrl -)"
            >
              <ZoomOut size={14} />
            </button>
            <span
              className="pdf-zoom-badge"
              onClick={handleZoomReset}
              title="Click to reset zoom to 100%"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="pdf-ctrl-btn"
              onClick={handleZoomIn}
              disabled={zoom >= 1.4}
              title="Zoom In (Ctrl +)"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              className="pdf-ctrl-btn"
              onClick={handleFitWidth}
              title="Fit to Width"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          {/* View mode toggle */}
          <div className="pdf-ctrl-group" title="Switch layout preview">
            <button
              type="button"
              className={`pdf-ctrl-btn ${viewMode === 'continuous' ? 'active' : ''}`}
              onClick={() => setViewMode('continuous')}
              title="Continuous Document Flow"
              style={{ width: 'auto', padding: '0 8px', fontSize: '11px' }}
            >
              Continuous
            </button>
            <button
              type="button"
              className={`pdf-ctrl-btn ${viewMode === 'pages' ? 'active' : ''}`}
              onClick={() => setViewMode('pages')}
              title="A4 Multi-Page Sheet Preview"
              style={{ width: 'auto', padding: '0 8px', fontSize: '11px' }}
            >
              <Layers size={13} style={{ marginRight: 4 }} /> A4 Sheets
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="pdf-toolbar-right">
          <button
            type="button"
            className="pdf-action-secondary"
            onClick={handleCopySummary}
            title="Copy text summary to clipboard"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            type="button"
            className="pdf-action-primary"
            onClick={handlePrint}
            title="Download or Print full A4 PDF Dossier (Ctrl+P / ⌘P)"
          >
            <Printer size={15} />
            <span>{isPrinting ? 'Preparing PDF...' : 'Print / Save PDF'}</span>
            <kbd className="pdf-kbd-shortcut">⌘P</kbd>
          </button>
        </div>
      </div>

      {/* JUMP NAVIGATION SUB-BAR (SCREEN ONLY) */}
      <div className="pdf-reader-subnav no-print">
        <button
          type="button"
          className={`pdf-nav-chip ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-overview')}
        >
          <Compass size={13} /> Overview &amp; Route
        </button>
        <button
          type="button"
          className={`pdf-nav-chip ${activeSection === 'schedule' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-schedule')}
        >
          <Calendar size={13} /> Day-by-Day ({itinerary.days.length || days} Days)
        </button>
        <button
          type="button"
          className={`pdf-nav-chip ${activeSection === 'budget' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-budget')}
        >
          <Receipt size={13} /> Cost Breakdown &amp; Inclusions
        </button>
        <button
          type="button"
          className={`pdf-nav-chip ${activeSection === 'chauffeur' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-chauffeur')}
        >
          <Car size={13} /> Chauffeur Intelligence
        </button>
        <button
          type="button"
          className={`pdf-nav-chip ${activeSection === 'assurance' ? 'active' : ''}`}
          onClick={() => scrollToSection('sec-assurance')}
        >
          <ShieldCheck size={13} /> Collabcar Assurance
        </button>
      </div>

      {/* DOCUMENT READING CANVAS */}
      <main className="pdf-reader-canvas">
        {viewMode === 'continuous' ? (
          /* ========================================================================= */
          /* CONTINUOUS DOSSIER VIEW (SMOOTH FLUID READING WITH SOFT A4 PAGE DIVIDERS) */
          /* ========================================================================= */
          <article
            className="pdf-dossier-paper"
            id="printable-itinerary"
            ref={docRef}
            style={{
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: 'top center',
            }}
          >
            {/* 1. BRAND MASTHEAD */}
            <header className="pdf-masthead" id="sec-overview">
              <div className="pdf-masthead-brand">
                <div className="pdf-logo-box">
                  <img
                    src={LOGO}
                    alt="Collabcar Travel Co."
                    className="pdf-logo-img"
                    onError={(e) => {
                      // Fallback text mark if remote image fails
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="pdf-brand-titles">
                  <h1>COLLABCARTRAVEL CO.</h1>
                  <p>Verified Commercial AITP Fleets · Custom India Road Expeditions</p>
                </div>
              </div>

              <div className="pdf-masthead-meta">
                <span
                  className="pdf-theme-badge"
                  style={{
                    backgroundColor: activeTheme.bgColor,
                    color: activeTheme.accentColor,
                    borderColor: activeTheme.borderColor,
                  }}
                >
                  {activeTheme.icon} {activeTheme.tag}
                </span>
                <span className="pdf-meta-line">Ref: {dossierId}</span>
                <span className="pdf-accreditation-pill">
                  <CheckCircle2 size={10} /> Commercial AITP Authorized
                </span>
              </div>
            </header>

            {/* 2. TITLE & ROUTE SUMMARY */}
            <div className="pdf-title-zone">
              <h2 className="pdf-dossier-headline">
                {itinerary.title || `${destination} Travel Expedition Dossier`}
              </h2>
              <div className="pdf-route-banner">
                <Compass size={15} className="text-red-600" />
                <span>{itinerary.overview.route || `${departure} ➔ ${destination} Circuit`}</span>
              </div>

              {/* 4-point expedition matrix */}
              <div className="pdf-matrix-grid">
                <div className="pdf-matrix-item">
                  <MapPin size={16} className="pdf-matrix-icon" />
                  <div>
                    <span className="pdf-matrix-label">Destination</span>
                    <strong className="pdf-matrix-value">{destination || 'India'}</strong>
                  </div>
                </div>

                <div className="pdf-matrix-item">
                  <Calendar size={16} className="pdf-matrix-icon" />
                  <div>
                    <span className="pdf-matrix-label">Duration</span>
                    <strong className="pdf-matrix-value">{days} Days / {Math.max(1, days - 1)} Nights</strong>
                  </div>
                </div>

                <div className="pdf-matrix-item">
                  <Users size={16} className="pdf-matrix-icon" />
                  <div>
                    <span className="pdf-matrix-label">Travel Party</span>
                    <strong className="pdf-matrix-value">{travellers} Travellers</strong>
                  </div>
                </div>

                <div className="pdf-matrix-item">
                  <Car size={16} className="pdf-matrix-icon" />
                  <div>
                    <span className="pdf-matrix-label">Commercial Fleet</span>
                    <strong className="pdf-matrix-value">
                      {itinerary.overview.vehicle || 'Toyota Innova Crysta AITP'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. DESTINATION ADVISORY CARD */}
            {itinerary.destinationTheme === 'mountains' && (
              <div className="pdf-advisory-card mountains">
                <AlertTriangle size={20} className="flex-shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <div className="pdf-advisory-title">
                    🏔️ High-Altitude Mountain Safety &amp; Chauffeur Protocol
                  </div>
                  <p className="m-0">
                    High mountain sectors require specialized transit logistics. Collabcar provides mountain-certified
                    senior chauffeurs, compulsory 24–48h base acclimatization halts, vehicle oxygen canisters upon request,
                    and seamless union transit handoffs in protected Himalayan circuits (Leh, Spiti &amp; Nubra).
                  </p>
                </div>
              </div>
            )}

            {itinerary.destinationTheme === 'heritage' && (
              <div className="pdf-advisory-card heritage">
                <ShieldCheck size={20} className="flex-shrink-0 text-amber-700 mt-0.5" />
                <div>
                  <div className="pdf-advisory-title">
                    🏰 Royal Heritage Corridor &amp; Interstate Logistics
                  </div>
                  <p className="m-0">
                    Pre-cleared interstate commercial tourist road tax clearances across Delhi, Haryana, Rajasthan, and Uttar Pradesh.
                    Collabcar verified chauffeurs navigate direct monument access gates with zero unauthorized commercial shopping detours.
                  </p>
                </div>
              </div>
            )}

            {itinerary.destinationTheme === 'coastal' && (
              <div className="pdf-advisory-card coastal">
                <Compass size={20} className="flex-shrink-0 text-teal-700 mt-0.5" />
                <div>
                  <div className="pdf-advisory-title">
                    🌴 Coastal &amp; Backwater Transit Logistics
                  </div>
                  <p className="m-0">
                    All-weather coastal transit coordination with pre-cleared coastal highway routes and ferry transit assistance.
                    Vehicles are climate-controlled and monsoon-ready for optimum comfort.
                  </p>
                </div>
              </div>
            )}

            {/* SOFT PAGE BREAK GUIDE (SCREEN INDICATOR) */}
            <div className="pdf-soft-page-divider no-print">
              <span>Page 1 / Overview &amp; Route Matrix • Next: Day-by-Day Schedule</span>
            </div>

            {/* 4. DAY-BY-DAY EXPEDITION SCHEDULE */}
            <section className="pdf-schedule-section" id="sec-schedule">
              <div className="pdf-section-header">
                <h3 className="pdf-section-title">
                  <Compass size={18} className="text-red-600" />
                  Day-by-Day Expedition Schedule
                </h3>
                <span className="pdf-section-badge">{itinerary.days.length || days} Operational Days</span>
              </div>

              <div className="pdf-days-container">
                {itinerary.days.length > 0 ? (
                  itinerary.days.map((day) => (
                    <div key={day.dayNumber} className="pdf-day-card">
                      <div className="pdf-day-card-header">
                        <div className="pdf-day-badge-wrap">
                          <span className="pdf-day-num-tag">DAY 0{day.dayNumber}</span>
                          <h4 className="pdf-day-title-text">{day.title}</h4>
                        </div>
                        {day.transit && (
                          <div className="pdf-day-transit-badge">
                            <Car size={13} className="text-red-600" />
                            <span>{day.transit}</span>
                          </div>
                        )}
                      </div>

                      <div className="pdf-day-body">
                        {/* Time slots */}
                        <div className="pdf-day-slots-grid">
                          {day.morning && (
                            <div className="pdf-slot-card">
                              <span className="pdf-slot-header morning">
                                <Sun size={12} /> Morning
                              </span>
                              <p className="pdf-slot-desc">{day.morning}</p>
                            </div>
                          )}

                          {day.afternoon && (
                            <div className="pdf-slot-card">
                              <span className="pdf-slot-header afternoon">
                                <Sun size={12} /> Afternoon
                              </span>
                              <p className="pdf-slot-desc">{day.afternoon}</p>
                            </div>
                          )}

                          {day.evening && (
                            <div className="pdf-slot-card">
                              <span className="pdf-slot-header evening">
                                <Moon size={12} /> Evening
                              </span>
                              <p className="pdf-slot-desc">{day.evening}</p>
                            </div>
                          )}
                        </div>

                        {/* Stay Card */}
                        {day.stay && (
                          <div className="pdf-stay-card">
                            <Hotel size={14} className="flex-shrink-0" />
                            <span>
                              <strong>Recommended Stay:</strong> {day.stay} · <em>Chauffeur lodging fully covered by Collabcar</em>
                            </span>
                          </div>
                        )}

                        {/* Extra bullets */}
                        {day.otherBullets && day.otherBullets.length > 0 && (
                          <ul className="pdf-bullets-list">
                            {day.otherBullets.map((bullet, idx) => (
                              <li key={idx}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                    <pre className="whitespace-pre-wrap font-sans text-xs">{itinerary.raw}</pre>
                  </div>
                )}
              </div>
            </section>

            {/* SOFT PAGE BREAK GUIDE */}
            <div className="pdf-soft-page-divider no-print">
              <span>Page 2 / Day Schedule • Next: Financial Logistics &amp; Chauffeur Advice</span>
            </div>

            {/* 5. HIGH RESOLUTION COST & INCLUSIONS BREAKDOWN */}
            <section className="pdf-budget-section" id="sec-budget">
              <div className="pdf-section-header">
                <h3 className="pdf-section-title">
                  <Receipt size={18} className="text-red-600" />
                  Estimated Cost &amp; Commercial Coverage Breakdown
                </h3>
                <span className="pdf-section-badge">All Figures in INR (₹)</span>
              </div>

              <div className="pdf-budget-table-wrapper">
                <table className="pdf-budget-table">
                  <thead>
                    <tr>
                      <th style={{ width: '32%' }}>Expense Category</th>
                      <th style={{ width: '22%' }}>Estimated Amount</th>
                      <th style={{ width: '46%' }}>Official Collabcar Inclusions &amp; Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetList.map((item, idx) => {
                      const isTotal =
                        item.category.toLowerCase().includes('total') ||
                        idx === budgetList.length - 1;
                      return (
                        <tr key={idx} className={isTotal ? 'pdf-budget-total-row' : ''}>
                          <td>
                            <strong>{item.category}</strong>
                          </td>
                          <td className="pdf-cost-cell">{item.cost}</td>
                          <td>{item.details}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Inclusions / Exclusions Highlights */}
              <div className="pdf-inclusions-grid">
                <div className="pdf-incl-box yes">
                  <h4>
                    <CheckCircle2 size={14} /> Collabcar Package Inclusions
                  </h4>
                  <ul className="pdf-incl-list">
                    <li>Dedicated air-conditioned commercial vehicle with verified chauffeur</li>
                    <li>All interstate passenger road tax clearances (AITP pan-India)</li>
                    <li>All highway FASTag toll plaza charges &amp; parking fees</li>
                    <li>Chauffeur night halts, boarding, meals, and daily allowances</li>
                    <li>Zero security deposit &amp; zero damage liability for passengers</li>
                    <li>24/7 Roadside breakdown vehicle replacement guarantee</li>
                  </ul>
                </div>

                <div className="pdf-incl-box no">
                  <h4>
                    <AlertTriangle size={14} /> Passenger Direct Expenses
                  </h4>
                  <ul className="pdf-incl-list">
                    <li>Heritage monument entry tickets &amp; national park safari permits</li>
                    <li>Personal meals, refreshments, and hotel accommodation</li>
                    <li>Adventure sports, pony rides, boat rentals, or special local guides</li>
                    <li>Airfare / Train tickets to origin or from departure hub</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. CHAUFFEUR INTELLIGENCE & ON-ROAD TIPS */}
            {itinerary.tips.length > 0 && (
              <section className="pdf-tips-section" id="sec-chauffeur">
                <div className="pdf-section-header">
                  <h3 className="pdf-section-title">
                    <Car size={18} className="text-red-600" />
                    Collabcar Chauffeur Advice &amp; On-Road Realities
                  </h3>
                  <span className="pdf-section-badge">Verified Ground Intelligence</span>
                </div>

                <div className="pdf-tips-grid">
                  {itinerary.tips.map((tip, idx) => (
                    <div key={idx} className="pdf-tip-card">
                      <span className="pdf-tip-index">0{idx + 1}</span>
                      <p className="pdf-tip-text">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 7. OFFICIAL ASSURANCE & SIGNATURE FOOTER */}
            <footer className="pdf-official-footer" id="sec-assurance">
              <div className="pdf-footer-assurance">
                <div className="pdf-assurance-title">
                  <ShieldCheck size={18} className="text-red-600" />
                  <span>The Collabcar Assurance Guarantee</span>
                </div>
                <p className="pdf-assurance-desc">
                  This document serves as an official Collabcar Travel Dossier. All journeys are executed exclusively
                  with 100% verified All India Tourist Permit (AITP) commercial fleets, commercial passenger insurance,
                  and verified professional chauffeurs.
                </p>
                <div className="pdf-contact-bar">
                  <span className="flex items-center gap-1.5">
                    <PhoneCall size={12} className="text-red-600" />
                    24/7 Operations Desk: care@collabcar.com
                  </span>
                  <span>·</span>
                  <span>Doc Ref: {dossierId}</span>
                  <span>·</span>
                  <span>Issue Date: {issueDate}</span>
                </div>
              </div>

              <div className="pdf-signature-block">
                <div className="pdf-seal-badge">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>VERIFIED AITP COMMERCIAL DISPATCH</span>
                </div>
                <p className="pdf-sign-sub">Collabcar Travel Technologies Pvt. Ltd.</p>
                <p className="pdf-sign-sub">New Delhi · Bengaluru · Mumbai · Pan-India</p>
              </div>
            </footer>
          </article>
        ) : (
          /* ========================================================================= */
          /* PAGED A4 SHEETS PREVIEW (EXACT PHYSICAL MULTI-PAGE SHEETS PREVIEW)        */
          /* ========================================================================= */
          <div
            className="pdf-paged-wrapper"
            id="printable-itinerary"
            ref={docRef}
            style={{
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: 'top center',
            }}
          >
            {/* SHEET 1: MASTHEAD, OVERVIEW, EXPEDITION MATRIX & ADVISORY */}
            <article className="pdf-a4-sheet">
              <div>
                {/* Header */}
                <header className="pdf-masthead">
                  <div className="pdf-masthead-brand">
                    <div className="pdf-logo-box">
                      <img src={LOGO} alt="Collabcar Travel Co." className="pdf-logo-img" />
                    </div>
                    <div className="pdf-brand-titles">
                      <h1>COLLABCARTRAVEL CO.</h1>
                      <p>Verified Commercial AITP Fleets · Custom India Road Expeditions</p>
                    </div>
                  </div>

                  <div className="pdf-masthead-meta">
                    <span
                      className="pdf-theme-badge"
                      style={{
                        backgroundColor: activeTheme.bgColor,
                        color: activeTheme.accentColor,
                        borderColor: activeTheme.borderColor,
                      }}
                    >
                      {activeTheme.icon} {activeTheme.tag}
                    </span>
                    <span className="pdf-meta-line">Ref: {dossierId}</span>
                  </div>
                </header>

                {/* Title & Route */}
                <div className="pdf-title-zone">
                  <h2 className="pdf-dossier-headline">
                    {itinerary.title || `${destination} Travel Expedition Dossier`}
                  </h2>
                  <div className="pdf-route-banner">
                    <Compass size={15} className="text-red-600" />
                    <span>{itinerary.overview.route || `${departure} ➔ ${destination} Circuit`}</span>
                  </div>

                  {/* 4-point expedition matrix */}
                  <div className="pdf-matrix-grid">
                    <div className="pdf-matrix-item">
                      <MapPin size={16} className="pdf-matrix-icon" />
                      <div>
                        <span className="pdf-matrix-label">Destination</span>
                        <strong className="pdf-matrix-value">{destination || 'India'}</strong>
                      </div>
                    </div>

                    <div className="pdf-matrix-item">
                      <Calendar size={16} className="pdf-matrix-icon" />
                      <div>
                        <span className="pdf-matrix-label">Duration</span>
                        <strong className="pdf-matrix-value">{days} Days / {Math.max(1, days - 1)} Nights</strong>
                      </div>
                    </div>

                    <div className="pdf-matrix-item">
                      <Users size={16} className="pdf-matrix-icon" />
                      <div>
                        <span className="pdf-matrix-label">Travel Party</span>
                        <strong className="pdf-matrix-value">{travellers} Travellers</strong>
                      </div>
                    </div>

                    <div className="pdf-matrix-item">
                      <Car size={16} className="pdf-matrix-icon" />
                      <div>
                        <span className="pdf-matrix-label">Commercial Fleet</span>
                        <strong className="pdf-matrix-value">
                          {itinerary.overview.vehicle || 'Toyota Innova Crysta AITP'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advisory */}
                {itinerary.destinationTheme === 'mountains' && (
                  <div className="pdf-advisory-card mountains">
                    <AlertTriangle size={20} className="flex-shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <div className="pdf-advisory-title">
                        🏔️ High-Altitude Mountain Safety &amp; Chauffeur Protocol
                      </div>
                      <p className="m-0">
                        High mountain sectors require specialized transit logistics. Collabcar provides mountain-certified
                        senior chauffeurs, compulsory 24–48h base acclimatization halts, vehicle oxygen canisters upon request,
                        and seamless union transit handoffs in protected Himalayan circuits (Leh, Spiti &amp; Nubra).
                      </p>
                    </div>
                  </div>
                )}

                {itinerary.destinationTheme === 'heritage' && (
                  <div className="pdf-advisory-card heritage">
                    <ShieldCheck size={20} className="flex-shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <div className="pdf-advisory-title">
                        🏰 Royal Heritage Corridor &amp; Interstate Logistics
                      </div>
                      <p className="m-0">
                        Pre-cleared interstate commercial tourist road tax clearances across Delhi, Haryana, Rajasthan, and UP.
                        Collabcar verified chauffeurs navigate direct monument access gates with zero unauthorized commercial shopping detours.
                      </p>
                    </div>
                  </div>
                )}

                {/* Day 1 teaser on sheet 1 if available */}
                {itinerary.days.length > 0 && (
                  <div className="mt-6">
                    <div className="pdf-section-header">
                      <h3 className="pdf-section-title">
                        <Compass size={18} className="text-red-600" />
                        Expedition Commencement
                      </h3>
                      <span className="pdf-section-badge">Day 01 Highlights</span>
                    </div>
                    <div className="pdf-day-card">
                      <div className="pdf-day-card-header">
                        <div className="pdf-day-badge-wrap">
                          <span className="pdf-day-num-tag">DAY 01</span>
                          <h4 className="pdf-day-title-text">{itinerary.days[0].title}</h4>
                        </div>
                        {itinerary.days[0].transit && (
                          <div className="pdf-day-transit-badge">
                            <Car size={13} className="text-red-600" />
                            <span>{itinerary.days[0].transit}</span>
                          </div>
                        )}
                      </div>
                      <div className="pdf-day-body">
                        <div className="pdf-day-slots-grid">
                          {itinerary.days[0].morning && (
                            <div className="pdf-slot-card">
                              <span className="pdf-slot-header morning"><Sun size={12} /> Morning</span>
                              <p className="pdf-slot-desc">{itinerary.days[0].morning}</p>
                            </div>
                          )}
                          {itinerary.days[0].afternoon && (
                            <div className="pdf-slot-card">
                              <span className="pdf-slot-header afternoon"><Sun size={12} /> Afternoon</span>
                              <p className="pdf-slot-desc">{itinerary.days[0].afternoon}</p>
                            </div>
                          )}
                          {itinerary.days[0].evening && (
                            <div className="pdf-slot-card">
                              <span className="pdf-slot-header evening"><Moon size={12} /> Evening</span>
                              <p className="pdf-slot-desc">{itinerary.days[0].evening}</p>
                            </div>
                          )}
                        </div>
                        {itinerary.days[0].stay && (
                          <div className="pdf-stay-card">
                            <Hotel size={14} className="flex-shrink-0" />
                            <span><strong>Recommended Stay:</strong> {itinerary.days[0].stay}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sheet 1 Footer */}
              <div className="pdf-sheet-footer-page-num">
                <span>Collabcar Travel Dossier · {dossierId}</span>
                <span>Page 1 of {itinerary.days.length > 1 ? 3 : 2}</span>
              </div>
            </article>

            {/* SHEET 2: DAY-BY-DAY SCHEDULE */}
            {itinerary.days.length > 1 && (
              <article className="pdf-a4-sheet">
                <div>
                  {/* Running Header */}
                  <header className="pdf-masthead" style={{ marginBottom: 20, paddingBottom: 16 }}>
                    <div className="pdf-masthead-brand">
                      <div className="pdf-logo-box" style={{ width: 100, height: 36 }}>
                        <img src={LOGO} alt="Collabcar" className="pdf-logo-img" style={{ maxHeight: 36 }} />
                      </div>
                      <div className="pdf-brand-titles">
                        <h1 style={{ fontSize: 14 }}>COLLABCARTRAVEL CO.</h1>
                        <p style={{ fontSize: 9 }}>Day-by-Day Expedition Schedule · {destination}</p>
                      </div>
                    </div>
                    <div className="pdf-masthead-meta">
                      <span className="pdf-meta-line">Ref: {dossierId}</span>
                    </div>
                  </header>

                  <div className="pdf-days-container">
                    {itinerary.days.slice(1).map((day) => (
                      <div key={day.dayNumber} className="pdf-day-card">
                        <div className="pdf-day-card-header">
                          <div className="pdf-day-badge-wrap">
                            <span className="pdf-day-num-tag">DAY 0{day.dayNumber}</span>
                            <h4 className="pdf-day-title-text">{day.title}</h4>
                          </div>
                          {day.transit && (
                            <div className="pdf-day-transit-badge">
                              <Car size={13} className="text-red-600" />
                              <span>{day.transit}</span>
                            </div>
                          )}
                        </div>

                        <div className="pdf-day-body">
                          <div className="pdf-day-slots-grid">
                            {day.morning && (
                              <div className="pdf-slot-card">
                                <span className="pdf-slot-header morning"><Sun size={12} /> Morning</span>
                                <p className="pdf-slot-desc">{day.morning}</p>
                              </div>
                            )}
                            {day.afternoon && (
                              <div className="pdf-slot-card">
                                <span className="pdf-slot-header afternoon"><Sun size={12} /> Afternoon</span>
                                <p className="pdf-slot-desc">{day.afternoon}</p>
                              </div>
                            )}
                            {day.evening && (
                              <div className="pdf-slot-card">
                                <span className="pdf-slot-header evening"><Moon size={12} /> Evening</span>
                                <p className="pdf-slot-desc">{day.evening}</p>
                              </div>
                            )}
                          </div>
                          {day.stay && (
                            <div className="pdf-stay-card">
                              <Hotel size={14} className="flex-shrink-0" />
                              <span><strong>Recommended Stay:</strong> {day.stay}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sheet 2 Footer */}
                <div className="pdf-sheet-footer-page-num">
                  <span>Collabcar Travel Dossier · {dossierId}</span>
                  <span>Page 2 of 3</span>
                </div>
              </article>
            )}

            {/* SHEET 3: FINANCES, CHAUFFEUR INTELLIGENCE & OFFICIAL GUARANTEE */}
            <article className="pdf-a4-sheet">
              <div>
                {/* Running Header */}
                <header className="pdf-masthead" style={{ marginBottom: 20, paddingBottom: 16 }}>
                  <div className="pdf-masthead-brand">
                    <div className="pdf-logo-box" style={{ width: 100, height: 36 }}>
                      <img src={LOGO} alt="Collabcar" className="pdf-logo-img" style={{ maxHeight: 36 }} />
                    </div>
                    <div className="pdf-brand-titles">
                      <h1 style={{ fontSize: 14 }}>COLLABCARTRAVEL CO.</h1>
                      <p style={{ fontSize: 9 }}>Financial Logistics, Inclusions &amp; Verification</p>
                    </div>
                  </div>
                  <div className="pdf-masthead-meta">
                    <span className="pdf-meta-line">Ref: {dossierId}</span>
                  </div>
                </header>

                {/* Financial Table */}
                <div className="pdf-budget-table-wrapper">
                  <table className="pdf-budget-table">
                    <thead>
                      <tr>
                        <th style={{ width: '32%' }}>Expense Category</th>
                        <th style={{ width: '22%' }}>Estimated Amount</th>
                        <th style={{ width: '46%' }}>Official Collabcar Inclusions &amp; Coverage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetList.map((item, idx) => {
                        const isTotal =
                          item.category.toLowerCase().includes('total') ||
                          idx === budgetList.length - 1;
                        return (
                          <tr key={idx} className={isTotal ? 'pdf-budget-total-row' : ''}>
                            <td><strong>{item.category}</strong></td>
                            <td className="pdf-cost-cell">{item.cost}</td>
                            <td>{item.details}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Inclusions */}
                <div className="pdf-inclusions-grid" style={{ marginBottom: 20 }}>
                  <div className="pdf-incl-box yes">
                    <h4><CheckCircle2 size={14} /> Collabcar Package Inclusions</h4>
                    <ul className="pdf-incl-list">
                      <li>Dedicated AC commercial vehicle with verified chauffeur</li>
                      <li>All interstate passenger road tax clearances (AITP pan-India)</li>
                      <li>All highway FASTag toll plaza charges &amp; parking fees</li>
                      <li>Chauffeur boarding, meals, and night halts fully covered</li>
                      <li>Zero security deposit &amp; zero damage liability for passengers</li>
                    </ul>
                  </div>

                  <div className="pdf-incl-box no">
                    <h4><AlertTriangle size={14} /> Passenger Direct Expenses</h4>
                    <ul className="pdf-incl-list">
                      <li>Heritage monument entry tickets &amp; safari permits</li>
                      <li>Personal meals, refreshments, and hotel accommodation</li>
                      <li>Adventure sports, boat rides, or personal guide fees</li>
                    </ul>
                  </div>
                </div>

                {/* Chauffeur tips preview */}
                {itinerary.tips.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div className="pdf-section-header" style={{ margin: '16px 0 12px 0' }}>
                      <h3 className="pdf-section-title" style={{ fontSize: 13 }}>
                        <Car size={15} className="text-red-600" />
                        Chauffeur Road Intelligence
                      </h3>
                    </div>
                    <div className="pdf-tips-grid">
                      {itinerary.tips.slice(0, 4).map((tip, idx) => (
                        <div key={idx} className="pdf-tip-card">
                          <span className="pdf-tip-index">0{idx + 1}</span>
                          <p className="pdf-tip-text">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Assurance Footer */}
                <footer className="pdf-official-footer">
                  <div className="pdf-footer-assurance">
                    <div className="pdf-assurance-title">
                      <ShieldCheck size={18} className="text-red-600" />
                      <span>The Collabcar Assurance Guarantee</span>
                    </div>
                    <p className="pdf-assurance-desc">
                      100% Commercial AITP Fleets · Zero Passenger Liability · 24/7 Operations Desk (care@collabcar.com)
                    </p>
                  </div>

                  <div className="pdf-signature-block">
                    <div className="pdf-seal-badge">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>VERIFIED COMMERCIAL DISPATCH</span>
                    </div>
                    <p className="pdf-sign-sub">Collabcar Travel Technologies Pvt. Ltd.</p>
                  </div>
                </footer>
              </div>

              {/* Sheet 3 Footer */}
              <div className="pdf-sheet-footer-page-num">
                <span>Collabcar Travel Dossier · {dossierId}</span>
                <span>Page {itinerary.days.length > 1 ? 3 : 2} of {itinerary.days.length > 1 ? 3 : 2}</span>
              </div>
            </article>
          </div>
        )}
      </main>
    </div>
  );
}
