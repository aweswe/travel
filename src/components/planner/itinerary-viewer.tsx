'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Users,
  Compass,
  MapPin,
  Car,
  Clock,
  Printer,
  Copy,
  Check,
  Save,
  ArrowUpRight,
  ShieldCheck,
  Edit3,
  Eye,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronsDownUp,
  Sunrise,
  Sunset,
  UtensilsCrossed,
  BedDouble,
  Navigation,
  Share2,
} from 'lucide-react';
import type { ParsedItinerary } from './itinerary-parser';
import { ItineraryPdfView } from './itinerary-pdf';

interface ItineraryViewerProps {
  itinerary: ParsedItinerary;
  destination: string;
  departure: string;
  days: number;
  travellers: number;
  budget: number;
  rawText: string;
  onRawTextChange: (val: string) => void;
  busy: boolean;
  onRefine: (prompt: string) => void;
  onSave?: () => void;
  saving?: boolean;
  draftId?: string;
  isAuthed: boolean;
}

export function ItineraryViewer({
  itinerary,
  destination,
  departure,
  days,
  travellers,
  budget,
  rawText,
  onRawTextChange,
  busy,
  onRefine,
  onSave,
  saving = false,
  draftId = '',
  isAuthed,
}: ItineraryViewerProps) {
  // Directly show PDF format as primary default view
  const [activeTab, setActiveTab] = useState<'visual' | 'pdf' | 'editor'>('pdf');
  const [copied, setCopied] = useState(false);
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [customRefinement, setCustomRefinement] = useState('');

  // Enhanced collapsible days state
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});

  // Initialize expanded days: all open if <= 4 days; first 3 open if > 4 days
  useEffect(() => {
    if (itinerary.days.length > 0) {
      const initial: Record<number, boolean> = {};
      const defaultAll = itinerary.days.length <= 4;
      itinerary.days.forEach((d, idx) => {
        initial[d.dayNumber] = defaultAll || idx < 3;
      });
      setExpandedDays(initial);
    }
  }, [itinerary.days]);

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  const areAllExpanded = itinerary.days.length > 0 && itinerary.days.every((d) => expandedDays[d.dayNumber]);

  const toggleExpandAll = () => {
    const nextState = !areAllExpanded;
    const updated: Record<number, boolean> = {};
    itinerary.days.forEach((d) => {
      updated[d.dayNumber] = nextState;
    });
    setExpandedDays(updated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDay = (dayNum: number, dayContent: string) => {
    navigator.clipboard.writeText(dayContent);
    setCopiedDay(dayNum);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  const scrollToDay = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: true }));
    const el = document.getElementById(`day-card-${dayNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const quickRefinements = [
    { label: '🌿 Relaxed Pace & Leisure', prompt: 'Make this itinerary more relaxed and slow-paced with extra time to unwind and fewer rushed stops.' },
    { label: '👨‍👩‍👧 Family & Kid Friendly', prompt: 'Adjust this itinerary to be family and child-friendly with comfortable pacing, child-friendly activities, and easy dining options.' },
    { label: '📸 Scenic Sunset & Photography', prompt: 'Highlight the best scenic photography viewpoints, golden hour sunset spots, and picturesque mountain or heritage halts.' },
    { label: '🏰 Luxury Heritage Stays', prompt: 'Upgrade the stay recommendations to top-rated heritage havelis, luxury tea estates, or 5-star palace resorts.' },
    { label: '💰 Budget Optimization', prompt: 'Optimize the route and recommend cost-effective homestays, smart route planning to save on fuel and state taxes.' },
  ];

  const destinationThemes = {
    mountains: {
      badge: 'Himalayan Mountain Route',
      heroBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      accentColor: '#38bdf8',
      tagline: 'High-Altitude Acclimatization & Mountain Passes Covered',
    },
    heritage: {
      badge: 'Royal Heritage & Forts Trail',
      heroBg: 'linear-gradient(135deg, #451a03 0%, #291205 100%)',
      accentColor: '#f59e0b',
      tagline: 'Historic Havelis, Palace Views & Interstate FastPass Included',
    },
    coastal: {
      badge: 'Coastal & Tropical Backwaters',
      heroBg: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      accentColor: '#34d399',
      tagline: 'Scenic Coastal Drives, Houseboats & Fresh Coast Flavours',
    },
    wildlife: {
      badge: 'Wildlife Sanctuary Safari Trail',
      heroBg: 'linear-gradient(135deg, #14532d 0%, #052e16 100%)',
      accentColor: '#4ade80',
      tagline: 'National Park Buffer Zones & Morning Forest Drives',
    },
    default: {
      badge: 'Curated India Road Journey',
      heroBg: 'linear-gradient(135deg, #182228 0%, #0f171c 100%)',
      accentColor: '#f87171',
      tagline: 'AITP Commercial Fleet with Verified Chauffeur',
    },
  };

  const currentTheme = destinationThemes[itinerary.destinationTheme] || destinationThemes.default;

  return (
    <div className="itinerary-viewer-container">
      {/* Top Banner with Dynamic Theming */}
      <div
        className="viewer-hero-banner rounded-xl"
        style={{
          background: currentTheme.heroBg,
          borderLeft: `4px solid ${currentTheme.accentColor}`,
        }}
      >
        <div className="viewer-hero-content">
          <div className="viewer-hero-eyebrow">
            <span
              className="theme-pill rounded-lg"
              style={{ color: currentTheme.accentColor, borderColor: currentTheme.accentColor }}
            >
              {currentTheme.badge}
            </span>
            <span className="ai-verified-tag">
              <Sparkles size={13} /> Collabcar AI Crafted
            </span>
          </div>

          <h2 className="viewer-hero-title text-balance">{itinerary.title || `${destination} Custom Road Itinerary`}</h2>
          <p className="viewer-hero-route">
            <MapPin size={15} style={{ color: currentTheme.accentColor }} />
            <span>{itinerary.overview.route || `${departure || 'Departure City'} ➔ ${destination} Circuit`}</span>
          </p>
          <p className="viewer-hero-tagline text-pretty">{currentTheme.tagline}</p>
        </div>

        {/* Quick Summary Pill Grid */}
        <div className="viewer-stats-strip">
          <div className="viewer-stat-item">
            <Calendar size={14} />
            <span>Duration:</span>
            <strong className="tabular-nums">{days} Days</strong>
          </div>
          <div className="viewer-stat-item">
            <Users size={14} />
            <span>Travellers:</span>
            <strong className="tabular-nums">{travellers} People</strong>
          </div>
          <div className="viewer-stat-item">
            <Car size={14} />
            <span>Recommended:</span>
            <strong>{itinerary.overview.vehicle || 'Innova Crysta AITP'}</strong>
          </div>
          <div className="viewer-stat-item">
            <ShieldCheck size={14} />
            <span>Safety:</span>
            <strong>Verified Chauffeur Included</strong>
          </div>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className="viewer-tabs-bar">
        <div className="tabs-group">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'pdf' ? 'active' : ''}`}
            onClick={() => setActiveTab('pdf')}
          >
            <Printer size={15} /> PDF Dossier
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            <Eye size={15} /> Visual Breakdown
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <Edit3 size={15} /> Raw Notes
          </button>
        </div>

        {/* Action Buttons */}
        <div className="viewer-quick-actions flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="action-btn"
            title="Copy Itinerary to clipboard"
            aria-label="Copy entire itinerary to clipboard"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('pdf');
              setTimeout(() => window.print(), 250);
            }}
            className="action-btn primary-action"
            title="Download or Print official Collabcar PDF"
            aria-label="Download or Print official Collabcar PDF"
          >
            <Printer size={14} /> <span>Download PDF</span>
          </button>

          {isAuthed && onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="action-btn"
              title="Save to your private Collabcar account"
              aria-label="Save to your account"
            >
              <Save size={14} /> <span>{saving ? 'Saving…' : draftId ? 'Update Draft' : 'Save'}</span>
            </button>
          )}

          <Link
            href={`/?destination=${encodeURIComponent(destination || itinerary.title)}#enquire`}
            className="action-btn quote-action whitespace-nowrap"
            aria-label="Book journey with verified AITP chauffeur"
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('collabcar_draft_itinerary', rawText.slice(0, 10000));
              }
            }}
          >
            <span>Book with Chauffeur</span> <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* TAB 1: VISUAL JOURNEY VIEW */}
      {activeTab === 'visual' && (
        <div className="visual-journey-body space-y-6">
          {/* Timeline Controls & Quick Day Navigator */}
          {itinerary.days.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-stone-50 dark:bg-stone-900/80 rounded-xl border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mr-1">
                  <Navigation size={14} className="text-red-600" />
                  Jump to Day:
                </span>
                {itinerary.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => scrollToDay(day.dayNumber)}
                    className={`text-xs px-2.5 py-1 rounded-lg border tabular-nums transition-all ${
                      expandedDays[day.dayNumber]
                        ? 'bg-red-600 text-white border-red-600 font-bold shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-red-400'
                    }`}
                  >
                    D{day.dayNumber}
                  </button>
                ))}
              </div>

              {/* Expand All / Collapse All Toggle */}
              <button
                type="button"
                onClick={toggleExpandAll}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 transition-colors shrink-0"
              >
                {areAllExpanded ? (
                  <>
                    <ChevronsDownUp size={14} /> Collapse All Days
                  </>
                ) : (
                  <>
                    <ChevronsUpDown size={14} /> Expand All Days
                  </>
                )}
              </button>
            </div>
          )}

          {/* Enhanced Day-by-Day Timeline Cards with Collapsible Details */}
          <div className="timeline-cards-list relative">
            {/* Visual Timeline Connector Line (Clean Neutral Accent) */}
            <div className="absolute left-[37px] top-6 bottom-6 w-0.5 bg-stone-200 dark:bg-stone-800 hidden md:block pointer-events-none" />

            {itinerary.days.length > 0 ? (
              itinerary.days.map((day) => {
                const isExpanded = !!expandedDays[day.dayNumber];
                const dayPlainText = `Day ${day.dayNumber}: ${day.title}\nTransit: ${day.transit || 'Local sightseeing'}\nMorning: ${day.morning || 'Sightseeing'}\nAfternoon: ${day.afternoon || 'Lunch & exploration'}\nEvening: ${day.evening || 'Sunset & dinner'}\nStay: ${day.stay || 'Included hotel'}`;

                return (
                  <div
                    key={day.dayNumber}
                    id={`day-card-${day.dayNumber}`}
                    className={`day-card relative rounded-xl transition-all duration-200 ${
                      isExpanded
                        ? 'shadow-md ring-1 ring-stone-200 dark:ring-stone-800'
                        : 'opacity-95 hover:opacity-100 hover:shadow-sm'
                    }`}
                  >
                    {/* Collapsible Header */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleDay(day.dayNumber)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleDay(day.dayNumber);
                        }
                      }}
                      className="day-card-header cursor-pointer select-none group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        {/* Day Number Badge */}
                        <div className="day-number-badge shrink-0 rounded-lg">
                          <span>Day</span>
                          <strong className="tabular-nums">0{day.dayNumber}</strong>
                        </div>

                        {/* Title & Transit Summary */}
                        <div className="day-header-info flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="day-title text-stone-900 dark:text-stone-100 group-hover:text-red-600 transition-colors text-balance">
                              {day.title}
                            </h3>
                            {day.dayNumber === 1 && (
                              <span className="text-[9.5px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-lg">
                                Departure Kickoff
                              </span>
                            )}
                            {day.dayNumber === itinerary.days.length && (
                              <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-lg">
                                Final Return Circuit
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mt-1 flex-wrap">
                            {day.transit && (
                              <div className="day-transit-tag flex items-center gap-1">
                                <Car size={13} className="text-red-500" />
                                <span>{day.transit}</span>
                              </div>
                            )}

                            {/* Sneak peek text when collapsed */}
                            {!isExpanded && day.stay && (
                              <span className="hidden sm:inline-block text-[11px] text-stone-400 truncate max-w-xs text-pretty">
                                🏨 {day.stay}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Collapsible Toggle Indicator & Quick Copy */}
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyDay(day.dayNumber, dayPlainText);
                          }}
                          className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                          title="Copy Day Summary"
                          aria-label={`Copy Day ${day.dayNumber} summary`}
                        >
                          {copiedDay === day.dayNumber ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>

                        <div className="flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 group-hover:bg-red-50 dark:group-hover:bg-red-950/40 group-hover:text-red-600 transition-colors">
                          <span className="hidden sm:inline">{isExpanded ? 'Less' : 'Details'}</span>
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Body */}
                    {isExpanded && (
                      <div className="day-card-body border-t border-stone-200 dark:border-stone-800/80 animate-in fade-in-50 duration-200">
                        {/* Time Slots 3-Column Grid */}
                        <div className="time-slots-grid">
                          {day.morning && (
                            <div className="time-slot-card morning bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 rounded-lg">
                              <div className="slot-title text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5">
                                <Sunrise size={16} />
                                <span>Morning Sightseeing</span>
                              </div>
                              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 leading-relaxed text-pretty">
                                {day.morning}
                              </p>
                            </div>
                          )}

                          {day.afternoon && (
                            <div className="time-slot-card afternoon bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 rounded-lg">
                              <div className="slot-title text-sky-700 dark:text-sky-400 font-bold flex items-center gap-1.5">
                                <UtensilsCrossed size={16} />
                                <span>Afternoon &amp; Lunch</span>
                              </div>
                              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 leading-relaxed text-pretty">
                                {day.afternoon}
                              </p>
                            </div>
                          )}

                          {day.evening && (
                            <div className="time-slot-card evening bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 rounded-lg">
                              <div className="slot-title text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1.5">
                                <Sunset size={16} />
                                <span>Evening &amp; Sunset</span>
                              </div>
                              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 leading-relaxed text-pretty">
                                {day.evening}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Recommended Stay Card */}
                        {day.stay && (
                          <div className="day-stay-box bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-3">
                            <span className="stay-label text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 mb-1">
                              <BedDouble size={15} /> Recommended Night Stay &amp; Rest:
                            </span>
                            <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-medium text-pretty">
                              {day.stay}
                            </p>
                          </div>
                        )}

                        {/* Extra Sightseeing Bullets */}
                        {day.otherBullets.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                              Key Highlights &amp; Chauffeur Advice:
                            </span>
                            <ul className="day-extra-bullets space-y-1.5">
                              {day.otherBullets.map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300">
                                  <MapPin size={13} className="text-red-500 shrink-0 mt-0.5" />
                                  <span className="text-pretty">{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="raw-stream-view p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{rawText}</pre>
              </div>
            )}
          </div>

          {/* Budget Breakdown Table */}
          {itinerary.budget.length > 0 && (
            <div className="visual-budget-section mt-8 rounded-xl">
              <div className="section-title-bar">
                <span className="eyebrow">TRANSPARENT COSTS</span>
                <h3 className="text-balance">Estimated Group Budget &amp; Inclusions (₹)</h3>
              </div>
              <div className="budget-table-wrapper rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                <table className="budget-table">
                  <thead>
                    <tr>
                      <th>Expense Category</th>
                      <th>Estimated Amount</th>
                      <th>What Is Included</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itinerary.budget.map((item, idx) => {
                      const isTotal = item.category.toLowerCase().includes('total');
                      return (
                        <tr key={idx} className={isTotal ? 'total-row' : ''}>
                          <td><strong>{item.category}</strong></td>
                          <td className="cost-cell tabular-nums font-mono">{item.cost}</td>
                          <td className="details-cell text-pretty">{item.details || 'Standard Collabcar coordination'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Chauffeur On-Road Advice */}
          {itinerary.tips.length > 0 && (
            <div className="chauffeur-tips-section mt-8 rounded-xl">
              <div className="section-title-bar">
                <span className="eyebrow">CHAUFFEUR INSIGHTS</span>
                <h3 className="text-balance">On-Road Advice &amp; Safety Realities</h3>
              </div>
              <div className="tips-cards-grid">
                {itinerary.tips.map((tip, idx) => (
                  <div key={idx} className="tip-card rounded-xl">
                    <span className="tip-index rounded-lg tabular-nums">0{idx + 1}</span>
                    <p className="text-pretty">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PDF PRINT DOCUMENT VIEW */}
      {activeTab === 'pdf' && (
        <div className="pdf-tab-wrapper">
          <ItineraryPdfView
            itinerary={itinerary}
            destination={destination}
            departure={departure}
            days={days}
            travellers={travellers}
            budget={budget}
          />
        </div>
      )}

      {/* TAB 3: EDITABLE RAW TEXT VIEW */}
      {activeTab === 'editor' && (
        <div className="editor-tab-wrapper">
          <div className="editor-header">
            <span className="text-xs text-stone-500 dark:text-stone-400 text-pretty">
              You can edit any line of this markdown itinerary. Changes will immediately sync to the Visual and PDF views.
            </span>
          </div>
          <textarea
            className="itinerary-editor-enhanced text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 rounded-xl p-4 text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-red-600/30"
            value={rawText}
            onChange={(e) => onRawTextChange(e.target.value)}
            disabled={busy}
            rows={22}
          />
        </div>
      )}

      {/* Quick AI Refinements Section */}
      <div className="refinement-container mt-8 rounded-xl">
        <span className="eyebrow">POWERED BY COLLABCAR AI</span>
        <h4 className="text-balance">Refine &amp; Customize This Route</h4>

        <div className="quick-chips-wrapper">
          {quickRefinements.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="refinement-chip rounded-lg"
              disabled={busy}
              onClick={() => onRefine(chip.prompt)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Custom refinement input */}
        <form
          className="custom-refine-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!customRefinement.trim()) return;
            onRefine(customRefinement);
            setCustomRefinement('');
          }}
        >
          <input
            type="text"
            placeholder="Type your custom adjustment (e.g., 'Add a sunset boat ride in Alleppey and 1 extra rest day')..."
            value={customRefinement}
            onChange={(e) => setCustomRefinement(e.target.value)}
            disabled={busy}
            maxLength={1000}
            className="text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 rounded-xl h-11 px-4 text-xs focus:ring-2 focus:ring-red-600/30 outline-none"
          />
          <button type="submit" className="button rounded-xl h-11 px-5 font-bold" disabled={busy || !customRefinement.trim()}>
            {busy ? 'Refining…' : 'Refine with AI'} <Sparkles size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
