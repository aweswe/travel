'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ArrowUpRight,
  Save,
  Route,
  RefreshCw,
  Trash2,
  MapPin,
  Compass,
  Calendar,
  Users,
  Coins,
  Clock,
  Car,
  Check,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Coffee,
  Zap,
  BedDouble,
  Home,
  Crown,
  Wallet,
  Navigation,
  Mountain,
  ChevronRight,
  X,
  Radio,
} from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { useAuth } from '@/hooks/use-auth';
import { usePocketbaseRecords } from '@/hooks/use-pocketbase-records';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import { sendMessage, loadChatHistory, clearChatHistory, type ChatMessage } from '@/api/integrated-ai-api';
import { REQUIRE_LOGIN } from '@/constants/ai-assistant.config';
import { parseItinerary } from './itinerary-parser';
import { ItineraryViewer } from './itinerary-viewer';

type Draft = RecordModel & { title: string; content: string };

const POPULAR_PRESETS = [
  {
    name: 'Royal Rajasthan',
    days: 6,
    departure: 'Delhi',
    budget: 45000,
    pace: 'Balanced',
    stay: 'Comfort / mid-range',
    interests: 'Forts, palaces, local bazaars, desert sunset, authentic dal baati churma',
    tag: 'Heritage & Desert',
  },
  {
    name: 'Ladakh High Passes',
    days: 7,
    departure: 'Delhi',
    budget: 65000,
    pace: 'Slow & relaxed',
    stay: 'Comfort / mid-range',
    interests: 'Acclimatization in Leh, Pangong Tso, Nubra Valley via Khardung La, monasteries',
    tag: 'High Altitude',
  },
  {
    name: 'Kerala Backwaters & Hills',
    days: 5,
    departure: 'Kochi',
    budget: 40000,
    pace: 'Slow & relaxed',
    stay: 'Comfort / mid-range',
    interests: 'Munnar tea estates, Alleppey houseboat cruise, Kathakali, coastal seafood',
    tag: 'Tropical & Ghats',
  },
  {
    name: 'Spiti Valley Rugged Trail',
    days: 8,
    departure: 'Chandigarh',
    budget: 55000,
    pace: 'Action-packed',
    stay: 'Homestays',
    interests: 'High mountain passes, Kaza, Key Monastery, Chandratal Lake, rough mountain roads',
    tag: 'Remote Offroad',
  },
  {
    name: 'Goa Coast & Western Ghats',
    days: 4,
    departure: 'Mumbai',
    budget: 35000,
    pace: 'Balanced',
    stay: 'Comfort / mid-range',
    interests: 'South Goa peaceful beaches, spice plantations, Dudhsagar falls, Portuguese architecture',
    tag: 'Coastal Bliss',
  },
];

const DURATION_CHIPS = [
  { days: 3, label: '3 Days', sub: 'Weekend' },
  { days: 5, label: '5 Days', sub: 'Short Break' },
  { days: 7, label: '7 Days', sub: '1 Week' },
  { days: 10, label: '10 Days', sub: 'Explorer' },
  { days: 14, label: '14 Days', sub: 'Grand Circuit' },
];

const TRAVELLER_CHIPS = [
  { count: 1, label: '1 Solo' },
  { count: 2, label: '2 Couple' },
  { count: 4, label: '4 Friends' },
  { count: 6, label: '6 Family' },
  { count: 10, label: '10+ Group' },
];

const BUDGET_PRESETS = [
  { amount: 35000, label: '₹35k', tier: 'Budget' },
  { amount: 50000, label: '₹50k', tier: 'Standard' },
  { amount: 75000, label: '₹75k', tier: 'Comfort' },
  { amount: 120000, label: '₹1.2L', tier: 'Premium' },
  { amount: 200000, label: '₹2L+', tier: 'Luxury' },
];

const DESTINATION_SUGGESTIONS = [
  'Ladakh',
  'Rajasthan',
  'Kerala Backwaters',
  'Spiti Valley',
  'Goa Coast',
  'Kashmir Valley',
  'Meghalaya',
  'Golden Triangle',
];

const DEPARTURE_SUGGESTIONS = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Chandigarh',
  'Kochi',
  'Kolkata',
  'Chennai',
];

const INTEREST_SUGGESTIONS = [
  'Photography',
  'High mountain passes',
  'Authentic local cuisine',
  'Historical forts & palaces',
  'Wildlife safari',
  'Houseboat backwaters',
  'Temples & spirituality',
  'Sunset golden hour stops',
];

const PACE_OPTIONS = [
  {
    id: 'Slow & relaxed',
    title: 'Slow & relaxed',
    subtitle: '2–4 hrs drive/day · Unrushed mornings · Ample photo & tea pauses',
    icon: Coffee,
    pill: 'Leisurely',
  },
  {
    id: 'Balanced',
    title: 'Balanced',
    subtitle: '4–6 hrs drive/day · Ideal mix of monuments, highways & rest halts',
    icon: Compass,
    pill: 'Most Popular',
  },
  {
    id: 'Action-packed',
    title: 'Action-packed',
    subtitle: '6+ hrs drive/day · Dawn starts · Maximize ground & high mountain trails',
    icon: Zap,
    pill: 'High Energy',
  },
];

const STAY_OPTIONS = [
  {
    id: 'Comfort / mid-range',
    title: 'Comfort / mid-range',
    subtitle: 'Verified 3–4★ hotels & boutique stays with AC, parking & driver room',
    icon: BedDouble,
    pill: 'Recommended',
  },
  {
    id: 'Homestays',
    title: 'Homestays',
    subtitle: 'Authentic local family estates with regional homemade delicacies',
    icon: Home,
    pill: 'Cultural',
  },
  {
    id: 'Luxury',
    title: 'Luxury',
    subtitle: '5★ palace resorts, heritage havelis & luxury glamping tea estates',
    icon: Crown,
    pill: 'Heritage 5★',
  },
  {
    id: 'Budget-friendly',
    title: 'Budget-friendly',
    subtitle: 'Clean highway dhabas, value hotels & traveler hostels',
    icon: Wallet,
    pill: 'Value',
  },
];

const LOADING_STAGES = [
  {
    title: 'Connecting to Collabcar AI Engine...',
    description: 'Searching live highway corridors, expressway conditions & real-time travel hours',
    icon: Wifi,
  },
  {
    title: 'Analyzing terrain & road conditions...',
    description: 'Evaluating NH highway gradients, high mountain passes & seasonal road permits',
    icon: Mountain,
  },
  {
    title: 'Configuring AITP chauffeur logistics...',
    description: 'Matching route mileage with safe driving limits, verified pitstops & rest halts',
    icon: Car,
  },
  {
    title: 'Curating day-by-day stops & stays...',
    description: 'Sequencing morning landmarks, authentic dhabas & handpicked heritage stays',
    icon: MapPin,
  },
  {
    title: 'Finalizing transparent budget breakdown...',
    description: 'Itemizing vehicle fuel, interstate road taxes, FASTag tolls & driver allowances',
    icon: Coins,
  },
];

export function TripPlanner() {
  const searchParams = useSearchParams();
  const auth = useAuth();

  const [destination, setDestination] = useState(searchParams?.get('destination') || '');
  const [departure, setDeparture] = useState(searchParams?.get('departure') || 'Delhi');
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState(Number(searchParams?.get('days')) || 5);
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState(50000);
  const [pace, setPace] = useState('Balanced');
  const [stay, setStay] = useState('Comfort / mid-range');
  const [interests, setInterests] = useState('');

  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [title, setTitle] = useState('My India journey');
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState('');
  const [loadingStage, setLoadingStage] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const outputRef = useRef<HTMLDivElement>(null);
  const streamScrollRef = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const drafts = usePocketbaseRecords<Draft>('itinerary_drafts', { sort: '-updated', enabled: auth.isAuthed });
  const userId = auth.user?.id;

  // Sync destination if provided via query param
  useEffect(() => {
    const paramDest = searchParams?.get('destination');
    if (paramDest && !destination) {
      setDestination(paramDest);
      setTitle(`${paramDest} · ${days} days`);
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      return () => { active = false; };
    }
    setHistoryLoading(true);
    loadChatHistory()
      .then(history => {
        if (!active) return;
        setMessages(history);
        const last = [...history].reverse().find(m => m.role === 'assistant');
        if (last && !text) {
          setText(last.content);
          setImages(last.images ?? []);
        }
      })
      .catch(() => {
        if (active) setError('Your previous conversation could not be loaded. You can still start a new trip.');
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => {
      active = false;
      controller.current?.abort();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const refresh = () => {
      if (pb.authStore.isValid) void pb.collection('users').authRefresh().catch(() => {});
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [userId]);

  // Stage progression timer during generation
  useEffect(() => {
    if (busy) {
      setLoadingStage(0);
      setElapsedSeconds(0);

      // Elapsed seconds counter
      const startMs = Date.now();
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startMs) / 1000));
      }, 1000);

      // Multi-stage progression if text hasn't arrived
      stageTimerRef.current = setInterval(() => {
        setLoadingStage(prev => {
          if (prev < 2) return prev + 1;
          return prev;
        });
      }, 2000);
    } else {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }

    return () => {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [busy]);

  // Dynamic stage detection based on streamed content
  useEffect(() => {
    if (busy && text.length > 0) {
      if (text.toLowerCase().includes('budget') || text.length > 2200) {
        setLoadingStage(4);
      } else if (text.toLowerCase().includes('day 1') || text.length > 500) {
        setLoadingStage(3);
      } else if (text.length > 100) {
        setLoadingStage(2);
      }
    }
  }, [busy, text]);

  // Smooth auto-scroll while streaming
  useEffect(() => {
    if (busy && streamScrollRef.current) {
      const el = streamScrollRef.current;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
      if (isNearBottom) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [text, busy]);

  async function generate(prompt: string) {
    if ((REQUIRE_LOGIN && !auth.isAuthed) || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    setText('');
    setImages([]);
    setDraftId('');
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    controller.current = new AbortController();

    outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      const result = await sendMessage({
        text: prompt,
        signal: controller.current.signal,
        onText: chunk => setText(prev => prev + chunk),
        onImage: url => setImages(prev => [...prev, url]),
      });
      setText(result.content);
      setMessages(prev => [...prev, result]);
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        setError(err instanceof Error ? err.message : 'The itinerary could not be generated. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  function configure(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const destName = destination.trim() || 'India';
    setTitle(`${destName} · ${days} days`);
    void generate(
      `Draft a new India itinerary with these preferences: destination ${destName}; departure city ${departure}; start date ${startDate || 'flexible'}; ${days} days; ${travellers} travellers; total group budget INR ${budget}; travel pace ${pace}; stay preference ${stay}; interests and needs: ${interests || 'Scenic views, cultural landmarks, authentic regional cuisine, relaxed photo stops'}. Include a practical day-by-day route, vehicle recommendation and approximate group budget. This is a draft, not a booking.`
    );
  }

  function applyPreset(preset: typeof POPULAR_PRESETS[0]) {
    setDestination(preset.name);
    setDays(preset.days);
    setDeparture(preset.departure);
    setBudget(preset.budget);
    setPace(preset.pace);
    setStay(preset.stay);
    setInterests(preset.interests);
    setTitle(`${preset.name} · ${preset.days} days`);
  }

  function addInterestTag(tag: string) {
    if (!interests.toLowerCase().includes(tag.toLowerCase())) {
      setInterests(prev => (prev ? `${prev}, ${tag}` : tag));
    }
  }

  async function save() {
    if (!text || !auth.user) return;
    setSaving(true);
    setNotice('');
    setError('');
    try {
      if (draftId) {
        await drafts.update(draftId, { title, content: text });
      } else {
        const record = await drafts.create({ owner: auth.user.id, title, content: text });
        setDraftId(record.id);
      }
      setNotice('Your itinerary is saved to your account.');
    } catch {
      setError('Your draft could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!window.confirm('Clear your current itinerary and start fresh?')) return;
    try {
      await clearChatHistory();
      setMessages([]);
      setText('');
      setImages([]);
      setDraftId('');
      setNotice('Ready for a new journey.');
    } catch {
      setText('');
      setImages([]);
      setDraftId('');
    }
  }

  // Count detected days in streaming text
  const detectedDaysCount = (text.match(/Day\s*\d+/gi) || []).length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const parsedItinerary = parseItinerary(text, destination);

  return (
    <section className="planner-section section-rail">
      {/* Embedded CSS for animations and interactive selectors */}
      <style>{`
        @keyframes tracerDash {
          to { stroke-dashoffset: -40; }
        }
        @keyframes pulseWaypoint {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.35); opacity: 0.4; }
        }
        @keyframes typewriterGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        @keyframes carTravel {
          0% { transform: translate(30px, 30px); }
          50% { transform: translate(170px, 15px); }
          100% { transform: translate(310px, 30px); }
        }
        .route-dash-animated {
          stroke-dasharray: 8 6;
          animation: tracerDash 1.4s linear infinite;
        }
        .waypoint-ping {
          animation: pulseWaypoint 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .typewriter-cursor {
          display: inline-block;
          width: 8px;
          height: 18px;
          background: #d73e24;
          margin-left: 4px;
          vertical-align: middle;
          animation: typewriterGlow 0.9s infinite;
          border-radius: 2px;
        }
        .car-tracer-icon {
          animation: carTravel 3s ease-in-out infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .route-dash-animated,
          .waypoint-ping,
          .typewriter-cursor,
          .car-tracer-icon {
            animation: none !important;
          }
        }
      `}</style>

      {/* Heading Banner */}
      <div className="planner-heading">
        <span className="eyebrow"><Sparkles size={17} /> THE COLLABCAR AI TRIP PLANNER</span>
        <h1 className="text-balance">Your imagination.<br /><span>A route to match.</span></h1>
        <p className="text-pretty">Powered by Collabcar Route Intelligence: Craft realistic day-by-day road journeys with verified AITP commercial chauffeurs across 28+ Indian states.</p>
      </div>

      {/* Account Status Strip */}
      <div className="planner-account">
        {auth.isLoading ? 'Checking your account…' : auth.isAuthed ? (
          <>
            <span>Planning as <strong>{auth.user?.name || auth.user?.email}</strong></span>
            <button type="button" onClick={auth.logout} disabled={busy} className="signout-btn">Sign out</button>
          </>
        ) : (
          <>
            <span>🌟 Public Mode: Anyone can generate, customize &amp; export PDF itineraries immediately!</span>
            <Link className="button mini-btn" href="/login">Sign in to save <ArrowUpRight size={14} /></Link>
          </>
        )}
      </div>

      {auth.isAuthed && !auth.user?.verified && (
        <div className="verification">
          <strong>Check your inbox before your first trip draft.</strong>
          <p>Verify your email to save to your account. Returning to this tab refreshes your verification status.</p>
        </div>
      )}

      <div className="planner-layout">
        {/* Left Column: Clean & Minimal Preferences Form */}
        <div className="planner-sidebar">
          <form className="planner-config rounded-xl" onSubmit={configure}>
            <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
              <span className="eyebrow block text-stone-500">TRIP DETAILS</span>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight text-balance">
                Where would you like to go?
              </h2>
            </div>

            {/* Popular Curated Circuit Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider text-stone-500 uppercase block">
                Popular Curated Circuits
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_PRESETS.map((p) => {
                  const isSelected = destination === p.name && days === p.days;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-red-400'
                      }`}
                    >
                      {p.name} <span className="tabular-nums text-[10px] opacity-75">({p.days}D)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destination Input */}
            <label className="space-y-1.5 block">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Destination in India *
              </span>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                <input
                  name="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Rajasthan, Kerala, Ladakh, Spiti Valley"
                  required
                  maxLength={200}
                  className="pl-10 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl h-11 w-full focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all"
                />
              </div>
            </label>

            {/* Starting City */}
            <label className="space-y-1.5 block">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Starting City *
              </span>
              <div className="relative">
                <Navigation size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                <input
                  name="departure"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  placeholder="e.g. Delhi, Mumbai, Bengaluru, Chandigarh"
                  required
                  maxLength={200}
                  className="pl-10 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl h-11 w-full focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all"
                />
              </div>
            </label>

            {/* 2-Column Grid: Duration & Travellers */}
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Duration (Days) *
                </span>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl h-11 px-3 w-full font-semibold tabular-nums focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all"
                >
                  <option value={3}>3 Days (Weekend)</option>
                  <option value={4}>4 Days</option>
                  <option value={5}>5 Days (Short Break)</option>
                  <option value={6}>6 Days</option>
                  <option value={7}>7 Days (1 Week)</option>
                  <option value={8}>8 Days</option>
                  <option value={9}>9 Days</option>
                  <option value={10}>10 Days (Explorer)</option>
                  <option value={12}>12 Days</option>
                  <option value={14}>14 Days (Grand Circuit)</option>
                </select>
                <div className="flex gap-1 pt-0.5">
                  {DURATION_CHIPS.map((chip) => (
                    <button
                      key={chip.days}
                      type="button"
                      onClick={() => setDays(chip.days)}
                      className={`text-[10px] py-0.5 px-1.5 rounded-lg border font-semibold tabular-nums transition-all ${
                        days === chip.days
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900'
                          : 'bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {chip.days}D
                    </button>
                  ))}
                </div>
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Travellers *
                </span>
                <input
                  name="travellers"
                  required
                  type="number"
                  min={1}
                  max={30}
                  value={travellers}
                  onChange={(e) => setTravellers(Number(e.target.value))}
                  className="text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl h-11 px-3 w-full font-semibold tabular-nums focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all"
                />
                <div className="flex gap-1 pt-0.5">
                  {[1, 2, 4, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setTravellers(count)}
                      className={`text-[10px] py-0.5 px-1.5 rounded-lg border font-semibold tabular-nums transition-all ${
                        travellers === count
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900'
                          : 'bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            {/* 2-Column Grid: Budget & Pace */}
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Total Budget (₹) *
                </span>
                <input
                  name="budget"
                  type="number"
                  min={10000}
                  max={10000000}
                  step={5000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                  className="text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl h-11 px-3 w-full font-semibold tabular-nums focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all"
                />
                <div className="flex gap-1 pt-0.5 flex-wrap">
                  {BUDGET_PRESETS.slice(0, 4).map((bp) => (
                    <button
                      key={bp.amount}
                      type="button"
                      onClick={() => setBudget(bp.amount)}
                      className={`text-[9.5px] py-0.5 px-1.5 rounded-lg border font-semibold tabular-nums transition-all ${
                        budget === bp.amount
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900'
                          : 'bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {bp.label}
                    </button>
                  ))}
                </div>
              </label>

              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Travel Pace
                </span>
                <select
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  className="text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl h-11 px-3 w-full font-semibold focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all"
                >
                  <option value="Balanced">Balanced (4–6 hrs/day)</option>
                  <option value="Slow & relaxed">Leisurely (2–4 hrs/day)</option>
                  <option value="Action-packed">Action-Packed (6+ hrs/day)</option>
                </select>
              </label>
            </div>

            {/* Stay Preference */}
            <label className="space-y-1.5 block">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Accommodation Preference
              </span>
              <select
                value={stay}
                onChange={(e) => setStay(e.target.value)}
                className="text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl h-11 px-3 w-full font-semibold focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all"
              >
                <option value="Comfort / mid-range">Comfort / Mid-Range (Verified 3–4★)</option>
                <option value="Homestays">Homestays (Authentic Regional Stays)</option>
                <option value="Luxury">Luxury (5★ Palace Resorts & Havelis)</option>
                <option value="Budget-friendly">Budget-Friendly (Clean Value Stays)</option>
              </select>
            </label>

            {/* Notes / Special Requests */}
            <label className="space-y-1.5 block">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Notes &amp; Interests (Optional)
              </span>
              <textarea
                name="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                maxLength={1000}
                rows={2}
                placeholder="e.g. Scenic mountain passes, traveling with kids, authentic local food..."
                className="text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl p-3 w-full text-xs focus:ring-2 focus:ring-red-600/30 focus:border-red-600 outline-none transition-all"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {INTEREST_SUGGESTIONS.slice(0, 4).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addInterestTag(tag)}
                    className="text-[10px] px-2 py-0.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:border-red-400 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </label>

            {/* Submit Action Button */}
            <button
              className="button full-width mt-2 font-bold flex items-center justify-center gap-2 h-12 text-sm rounded-xl shadow-sm transition-all"
              disabled={busy || historyLoading || (REQUIRE_LOGIN && (!auth.isAuthed || !auth.user?.verified))}
            >
              {busy ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Generating Itinerary...
                </>
              ) : (
                <>
                  Generate Itinerary
                  <Sparkles size={16} />
                </>
              )}
            </button>

            <small className="text-pretty">AI estimates driving times &amp; route logistics using real Indian highway terrain data.</small>
          </form>
        </div>

        {/* Right Column: Output / Generation Live Area */}
        <div className="planner-output" ref={outputRef}>
          <div className="output-heading">
            <span className="eyebrow">02 / YOUR ITINERARY</span>
            {text && !busy && (
              <button type="button" onClick={reset} disabled={busy} className="text-link">
                <RefreshCw size={14} /> Start fresh
              </button>
            )}
          </div>

          {/* MINIMAL CALM LOADER - NO LIVE TEXT STREAMING */}
          {busy && (
            <div className="w-full flex flex-col items-center justify-center min-h-[460px] p-8 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm transition-all my-2">
              <div className="relative flex items-center justify-center size-16 mb-5">
                <div className="size-16 rounded-full border-2 border-stone-200 dark:border-stone-800 border-t-red-600 dark:border-t-red-500 animate-spin" />
                <Sparkles size={22} className="absolute text-red-600 dark:text-red-400" />
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2 tracking-tight text-balance">
                We are working on your itinerary...
              </h3>

              {/* Multi-stage progressive loader cue */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 mb-4">
                <span className="size-2 rounded-full bg-red-600 animate-pulse" />
                <span>{LOADING_STAGES[loadingStage]?.title || 'Planning your journey...'}</span>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed mb-6 text-pretty">
                Planning your <span className="tabular-nums font-semibold">{days}</span>-day road trip from <strong>{departure || 'your starting city'}</strong> to <strong>{destination || 'India'}</strong>. Designing daily legs, certified chauffeur allocations, and budget breakdowns.
              </p>

              <div className="w-full max-w-xs h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(15, (loadingStage + 1) * 20))}%` }}
                />
              </div>

              <span className="text-xs text-stone-600 dark:text-stone-300 text-pretty">
                Your complete PDF dossier will display here automatically once ready.
              </span>

              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-mono tabular-nums text-stone-600 dark:text-stone-300">
                  {elapsedSeconds}s elapsed
                </span>
                <button
                  type="button"
                  onClick={() => controller.current?.abort()}
                  className="text-xs text-stone-600 hover:text-red-600 dark:text-stone-300 dark:hover:text-red-400 font-semibold underline transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!busy && historyLoading ? (
            <div className="output-empty rounded-xl">
              <Route size={36} className="animate-spin text-stone-400" />
              <p className="text-pretty">Loading your previous journey…</p>
            </div>
          ) : !busy && !text ? (
            <div className="output-empty p-8 text-center flex flex-col items-center justify-center min-h-[460px] rounded-xl">
              <div className="size-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 mb-4">
                <Route size={28} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2 text-balance">
                Your PDF itinerary will appear here
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed text-pretty">
                Fill in your destination and route preferences on the left, then click <strong>Generate Itinerary</strong>. Your official Collabcar dossier will be generated and displayed directly as a downloadable PDF format.
              </p>
            </div>
          ) : !busy && text ? (
            <ItineraryViewer
              itinerary={parsedItinerary}
              destination={destination}
              departure={departure}
              days={days}
              travellers={travellers}
              budget={budget}
              rawText={text}
              onRawTextChange={setText}
              busy={busy}
              onRefine={(prompt) => {
                void generate(
                  `Please refine this itinerary based on my request: ${prompt}. Maintain the structured day-by-day format, budget breakdown, and vehicle recommendations. Current itinerary draft:\n\n${text}`
                );
              }}
              onSave={save}
              saving={saving}
              draftId={draftId}
              isAuthed={auth.isAuthed}
            />
          ) : null}

          {error && <p className="error mt-3">{error}</p>}
          {notice && <p className="success mt-3">{notice}</p>}
        </div>
      </div>

      {/* Saved Drafts Notebook for logged in users */}
      {auth.isAuthed && (
        <div className="saved-drafts rounded-xl">
          <span className="eyebrow">YOUR TRAVEL NOTEBOOK</span>
          <h2 className="text-balance">Saved journeys</h2>
          {drafts.isLoading ? (
            <p className="text-pretty">Loading saved journeys…</p>
          ) : drafts.records.length === 0 ? (
            <p className="text-pretty">No saved trips yet. Generate an itinerary above and click &quot;Save&quot; to keep it here.</p>
          ) : (
            drafts.records.map((d) => (
              <div className="saved-row rounded-xl" key={d.id}>
                <div>
                  <strong className="text-balance">{d.title}</strong>
                  <span className="text-pretty">Private to your account</span>
                </div>
                <button
                  type="button"
                  className="text-link"
                  disabled={busy}
                  onClick={() => {
                    setTitle(d.title);
                    setText(d.content);
                    setDraftId(d.id);
                    setImages([]);
                    outputRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Open itinerary <ArrowUpRight size={17} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${d.title}`}
                  disabled={busy}
                  onClick={async () => {
                    if (!window.confirm('Delete this saved itinerary?')) return;
                    try {
                      await drafts.remove(d.id);
                      if (draftId === d.id) setDraftId('');
                    } catch {
                      setError('The saved draft could not be deleted.');
                    }
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
