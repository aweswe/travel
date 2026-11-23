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
    title: 'Connecting to DeepSeek AI Engine...',
    description: 'Initializing neural road intelligence stream and highway terrain data',
    icon: Wifi,
  },
  {
    title: 'Analyzing terrain & road conditions...',
    description: 'Evaluating NH highway gradients, high mountain passes & seasonal road permits',
    icon: Mountain,
  },
  {
    title: 'Configuring AITP chauffeur logistics...',
    description: 'Matching route mileage with safe driving limits, fuel & mandatory rest halts',
    icon: Car,
  },
  {
    title: 'Curating day-by-day stops & stays...',
    description: 'Sequencing morning landmarks, lunch pitstops & sunset golden hour halts',
    icon: MapPin,
  },
  {
    title: 'Finalizing transparent budget breakdown...',
    description: 'Itemizing vehicle fuel, state road taxes, tolls & driver allowances',
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
          box-shadow: 0 0 8px rgba(215, 62, 36, 0.8);
          border-radius: 1px;
        }
        .car-tracer-icon {
          animation: carTravel 3s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Heading Banner */}
      <div className="planner-heading">
        <span className="eyebrow"><Sparkles size={17} /> THE COLLABCAR AI TRIP PLANNER</span>
        <h1>Your imagination.<br /><span>A route to match.</span></h1>
        <p>Powered by DeepSeek AI: Craft realistic day-by-day road journeys with verified AITP commercial chauffeurs across 28+ Indian states.</p>
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
        {/* Left Column: Preferences Form */}
        <div className="planner-sidebar">
          {/* Quick Preset Selector */}
          <div className="presets-box">
            <div className="flex items-center justify-between mb-2.5">
              <span className="presets-label !mb-0">⚡ QUICK INSPIRATION PRESETS</span>
              <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300">1-Click Itineraries</span>
            </div>
            <div className="presets-chips">
              {POPULAR_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className={`preset-chip ${destination === p.name ? 'active' : ''}`}
                  onClick={() => applyPreset(p)}
                >
                  <span className="font-bold">{p.name}</span>
                  <span className="opacity-80 text-[10px] ml-1">({p.days}D · {p.tag})</span>
                </button>
              ))}
            </div>
          </div>

          <form className="planner-config" onSubmit={configure}>
            <span className="eyebrow">01 / YOUR TRAVEL PREFERENCES</span>
            <h2>Let’s set the direction.</h2>

            {/* Destination Input + Quick Chips */}
            <label className="space-y-1.5">
              <span className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100">
                <span>Where in India? *</span>
                <span className="text-[10px] font-normal text-stone-600 dark:text-stone-300">State, circuit, or region</span>
              </span>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                <input
                  name="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kerala, Rajasthan, Ladakh, Spiti"
                  required
                  maxLength={200}
                  className="pl-10 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-stone-600 dark:text-stone-300 font-semibold mr-1">Trending:</span>
                {DESTINATION_SUGGESTIONS.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => {
                      setDestination(dest);
                      setTitle(`${dest} · ${days} days`);
                    }}
                    className={`text-[10.5px] px-2.5 py-0.5 rounded-full border transition-all ${
                      destination === dest
                        ? 'border-red-600 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-red-300'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </label>

            {/* Departure City + Quick Hubs */}
            <label className="space-y-1.5">
              <span className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100">
                <span>Departure city *</span>
                <span className="text-[10px] font-normal text-stone-600 dark:text-stone-300">Starting base</span>
              </span>
              <div className="relative">
                <Navigation size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                <input
                  name="departure"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  placeholder="e.g. Delhi, Mumbai, Bengaluru"
                  required
                  maxLength={200}
                  className="pl-10 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-stone-600 dark:text-stone-300 font-semibold mr-1">Hubs:</span>
                {DEPARTURE_SUGGESTIONS.map((dep) => (
                  <button
                    key={dep}
                    type="button"
                    onClick={() => setDeparture(dep)}
                    className={`text-[10.5px] px-2 py-0.5 rounded-full border transition-all ${
                      departure === dep
                        ? 'border-red-600 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-red-300'
                    }`}
                  >
                    {dep}
                  </button>
                ))}
              </div>
            </label>

            {/* Start Date */}
            <label>Start date
              <input
                name="date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900"
              />
            </label>

            {/* Quick Duration Chips & Days Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 dark:text-stone-100 !mb-0">
                  Trip Duration (Days) *
                </label>
                <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                  {days} {days === 1 ? 'Day' : 'Days'}
                </span>
              </div>

              {/* Quick Duration Chips */}
              <div className="grid grid-cols-5 gap-1.5">
                {DURATION_CHIPS.map((chip) => {
                  const isActive = days === chip.days;
                  return (
                    <button
                      key={chip.days}
                      type="button"
                      onClick={() => {
                        setDays(chip.days);
                        if (destination) setTitle(`${destination} · ${chip.days} days`);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                        isActive
                          ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 dark:border-red-500 font-bold shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                      }`}
                    >
                      <span className="text-xs font-bold">{chip.label}</span>
                      <span className="text-[9px] opacity-75">{chip.sub}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-stone-600 dark:text-stone-300 whitespace-nowrap">Custom days:</span>
                <input
                  name="days"
                  required
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDays(val);
                    if (destination) setTitle(`${destination} · ${val} days`);
                  }}
                  className="!h-9 !py-1 text-center font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900"
                />
              </div>
            </div>

            {/* Travellers Selector & Chips */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 dark:text-stone-100 !mb-0">
                  Group Size (Travellers) *
                </label>
                <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                  {travellers} {travellers === 1 ? 'Person' : 'People'}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {TRAVELLER_CHIPS.map((chip) => {
                  const isActive = travellers === chip.count;
                  return (
                    <button
                      key={chip.count}
                      type="button"
                      onClick={() => setTravellers(chip.count)}
                      className={`py-1.5 px-1 rounded-lg border text-center text-xs transition-all ${
                        isActive
                          ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 dark:border-red-500 font-bold shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-stone-600 dark:text-stone-300 whitespace-nowrap">Custom group:</span>
                <input
                  name="travellers"
                  required
                  type="number"
                  min={1}
                  max={30}
                  value={travellers}
                  onChange={(e) => setTravellers(Number(e.target.value))}
                  className="!h-9 !py-1 text-center font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900"
                />
              </div>
            </div>

            {/* Budget Presets & Dynamic Per-Person Calc */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900 dark:text-stone-100 !mb-0">
                  Total Group Budget (₹) *
                </label>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{budget.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Budget Preset Chips */}
              <div className="grid grid-cols-5 gap-1.5">
                {BUDGET_PRESETS.map((preset) => {
                  const isActive = budget === preset.amount;
                  return (
                    <button
                      key={preset.amount}
                      type="button"
                      onClick={() => setBudget(preset.amount)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500 font-bold shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                      }`}
                    >
                      <span className="text-xs font-bold">{preset.label}</span>
                      <span className="text-[9px] opacity-75">{preset.tier}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Budget Input */}
              <input
                name="budget"
                type="number"
                min={1000}
                max={10000000}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
                className="text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 font-semibold"
              />

              {/* Interactive Budget Helper */}
              <div className="flex items-center justify-between text-[11px] px-3 py-2 bg-stone-100 dark:bg-stone-800/80 rounded-md text-stone-700 dark:text-stone-300">
                <span>Approx. <strong>₹{Math.round(budget / Math.max(1, travellers)).toLocaleString('en-IN')}</strong> / person</span>
                <span>•</span>
                <span>~<strong>₹{Math.round(budget / Math.max(1, days)).toLocaleString('en-IN')}</strong> / day</span>
              </div>
            </div>

            {/* Interactive Travel Pace Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-stone-900 dark:text-stone-100 !mb-0">
                Travel Pace
              </label>
              <div className="space-y-2">
                {PACE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = pace === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPace(opt.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 dark:border-red-500 shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400'
                      }`}
                    >
                      <div className={`mt-0.5 p-2 rounded-md ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs text-stone-900 dark:text-stone-100">{opt.title}</strong>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-red-600 text-white'
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}>
                            {opt.pill}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-normal">
                          {opt.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Stay Preference Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-stone-900 dark:text-stone-100 !mb-0">
                Stay Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STAY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = stay === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStay(opt.id)}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 dark:border-red-500 shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <div className={`p-1.5 rounded-md ${
                          isSelected ? 'bg-red-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}>
                          <Icon size={14} />
                        </div>
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-red-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                        }`}>
                          {opt.pill}
                        </span>
                      </div>
                      <strong className="text-xs text-stone-900 dark:text-stone-100 line-clamp-1">{opt.title}</strong>
                      <p className="text-[10px] text-stone-600 dark:text-stone-300 mt-1 leading-snug line-clamp-2">
                        {opt.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests & Special Needs with Quick Suggestion Tags */}
            <label className="space-y-1.5 pt-2">
              <span className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100">
                <span>Interests &amp; special needs</span>
                <span className="text-[10px] font-normal text-stone-600 dark:text-stone-300">Custom touch</span>
              </span>
              <textarea
                name="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                maxLength={3000}
                rows={3}
                placeholder="Culture, food, photography, mountain passes, accessibility, travelling with children…"
                className="text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {INTEREST_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addInterestTag(tag)}
                    className="text-[10px] px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 hover:border-red-300 hover:text-red-600"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </label>

            {/* Submit Action Button */}
            <button
              className="button full-width mt-4"
              disabled={busy || historyLoading || (REQUIRE_LOGIN && (!auth.isAuthed || !auth.user?.verified))}
            >
              {busy ? 'DeepSeek AI Drafting…' : 'Generate Beautiful Itinerary'}
              <Sparkles size={17} />
            </button>

            <small>AI estimates driving times &amp; route logistics using real Indian highway terrain data.</small>
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

          {/* GOAL 1: STATE-OF-THE-ART LIVE AI GENERATION & PROGRESS STATE */}
          {busy && (
            <div className="w-full flex flex-col gap-5 py-4">
              {/* Route Tracer Visual Header */}
              <div className="w-full bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 rounded-xl p-5 text-white shadow-xl border border-stone-800 overflow-hidden relative">
                {/* Background ambient glow */}
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-4">
                  {/* Top Bar with Route Name & Timer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                      </span>
                      <span className="text-[11px] font-bold tracking-wider text-red-400 uppercase">
                        DeepSeek AI Engine Live
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 bg-stone-800/80 px-2.5 py-1 rounded-full border border-stone-700">
                        <Clock size={13} className="text-amber-400 animate-spin" />
                        <span>{elapsedSeconds}s elapsed</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => controller.current?.abort()}
                        className="text-xs text-stone-400 hover:text-white px-2.5 py-1 rounded-full border border-stone-700 hover:border-red-500 transition-colors flex items-center gap-1"
                        title="Cancel generation"
                      >
                        <X size={12} /> Stop
                      </button>
                    </div>
                  </div>

                  {/* Route Heading Display */}
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                      {departure || 'Origin'} ➔ {destination || 'India Expedition'}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {days} Days · {travellers} Travellers · {pace} Pace · ₹{budget.toLocaleString('en-IN')} Budget
                    </p>
                  </div>

                  {/* Animated SVG Route Tracer Canvas */}
                  <div className="w-full bg-stone-950/80 rounded-lg p-3 border border-stone-800/80 my-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1 px-1">
                      <span className="flex items-center gap-1 text-amber-300 font-semibold">
                        <MapPin size={12} /> {departure || 'Start Point'}
                      </span>
                      <span className="text-[10px] text-stone-500 tracking-wider font-mono">
                        AITP HIGHWAY LOGISTICS TRACER
                      </span>
                      <span className="flex items-center gap-1 text-red-400 font-semibold">
                        <MapPin size={12} /> {destination || 'Destination Circuit'}
                      </span>
                    </div>

                    <div className="relative h-14 w-full flex items-center justify-center">
                      <svg
                        className="w-full h-12"
                        viewBox="0 0 360 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                      >
                        {/* Background Road Track */}
                        <path
                          d="M 20 24 C 90 6, 170 42, 260 14 C 295 4, 325 36, 340 24"
                          stroke="#334155"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        {/* Animated Flowing Route Dash */}
                        <path
                          className="route-dash-animated"
                          d="M 20 24 C 90 6, 170 42, 260 14 C 295 4, 325 36, 340 24"
                          stroke="#d73e24"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Departure Waypoint Beacon */}
                        <circle cx="20" cy="24" r="7" fill="#f59e0b" fillOpacity="0.3" className="waypoint-ping" />
                        <circle cx="20" cy="24" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />

                        {/* Destination Waypoint Beacon */}
                        <circle cx="340" cy="24" r="8" fill="#d73e24" fillOpacity="0.4" className="waypoint-ping" />
                        <circle cx="340" cy="24" r="5" fill="#d73e24" stroke="#ffffff" strokeWidth="1.5" />
                      </svg>

                      {/* Moving Car Navigation Icon */}
                      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 car-tracer-icon pointer-events-none">
                        <div className="bg-red-600 text-white p-1 rounded-full shadow-lg border border-red-400">
                          <Car size={13} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Stage Loading Stepper */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-1.5">
                      {LOADING_STAGES.map((stg, idx) => {
                        const isDone = idx < loadingStage;
                        const isCurrent = idx === loadingStage;
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col items-center text-center p-2 rounded-lg border transition-all ${
                              isCurrent
                                ? 'bg-red-950/60 border-red-500 text-white shadow-sm'
                                : isDone
                                ? 'bg-stone-900 border-emerald-600/60 text-emerald-400'
                                : 'bg-stone-950/50 border-stone-800 text-stone-500'
                            }`}
                          >
                            <div className="flex items-center justify-center w-5 h-5 rounded-full mb-1 text-[10px] font-bold">
                              {isDone ? (
                                <Check size={13} className="text-emerald-400 font-extrabold" />
                              ) : isCurrent ? (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                </span>
                              ) : (
                                <span>0{idx + 1}</span>
                              )}
                            </div>
                            <span className="text-[9px] font-semibold leading-tight line-clamp-1">
                              {stg.title.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Stage Callout */}
                    <div className="bg-stone-950/90 rounded-lg p-3 border border-stone-800 flex items-center gap-3">
                      {(() => {
                        const CurrentIcon = LOADING_STAGES[loadingStage]?.icon || Sparkles;
                        return (
                          <div className="p-2 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                            <CurrentIcon size={18} className="animate-pulse" />
                          </div>
                        );
                      })()}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{LOADING_STAGES[loadingStage]?.title}</span>
                          <span className="text-[9px] font-bold bg-red-600/30 text-red-300 px-2 py-0.5 rounded-full">
                            Step {loadingStage + 1} of 5
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                          {LOADING_STAGES[loadingStage]?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Streaming Container with Typewriter Cursor (Zero Jumpy Shifts) */}
              <div className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-md overflow-hidden flex flex-col">
                {/* Streaming Header Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 tracking-wide">
                      Live DeepSeek Token Stream
                    </span>
                    {detectedDaysCount > 0 && (
                      <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold px-2 py-0.5 rounded-full">
                        {detectedDaysCount} Days Drafted
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300">
                    <span><strong>{wordCount}</strong> words</span>
                    <span>•</span>
                    <span>Smooth Typewriter Output</span>
                  </div>
                </div>

                {/* Steady Streaming Content Area */}
                <div
                  ref={streamScrollRef}
                  className="p-5 overflow-y-auto min-h-[380px] max-h-[540px] text-stone-800 dark:text-stone-100 text-[13.5px] leading-relaxed font-sans transition-all"
                >
                  {text ? (
                    <div>
                      <div className="whitespace-pre-wrap font-sans">
                        {text}
                        <span className="typewriter-cursor" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center gap-3 text-stone-600 dark:text-stone-300">
                      <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full animate-bounce">
                        <Sparkles size={24} className="text-red-600" />
                      </div>
                      <div className="space-y-1">
                        <strong className="text-sm text-stone-800 dark:text-stone-200">
                          Collabcar AI is synthesizing highway waypoints...
                        </strong>
                        <p className="text-xs max-w-sm">
                          Analyzing route elevations, toll tax structures, hotel tiers, and certified AITP chauffeur halts.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Streaming Footer Bar */}
                <div className="px-4 py-2 bg-stone-100/70 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
                  <span>Generating verified itinerary dossier. Will switch to interactive visual view when complete.</span>
                  <button
                    type="button"
                    onClick={() => controller.current?.abort()}
                    className="text-red-600 dark:text-red-400 font-bold hover:underline"
                  >
                    Cancel Stream
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EMPTY STATE OR COMPLETED INTERACTIVE VIEWER */}
          {!busy && historyLoading ? (
            <div className="output-empty">
              <Route size={36} className="animate-spin text-stone-400" />
              <p>Loading your previous journey…</p>
            </div>
          ) : !busy && !text ? (
            <div className="output-empty">
              <Route size={48} className="text-stone-400" />
              <h2>Every great trip starts here.</h2>
              <p>
                Select a quick inspiration preset or fill your travel preferences.<br />
                DeepSeek AI will construct a complete day-by-day expedition with PDF export.
              </p>
              <span>REAL HIGHWAY DATA · AITP FLEETS · ZERO DAMAGE WORRIES</span>
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
        <div className="saved-drafts">
          <span className="eyebrow">YOUR TRAVEL NOTEBOOK</span>
          <h2>Saved journeys</h2>
          {drafts.isLoading ? (
            <p>Loading saved journeys…</p>
          ) : drafts.records.length === 0 ? (
            <p>No saved trips yet. Generate an itinerary above and click &quot;Save&quot; to keep it here.</p>
          ) : (
            drafts.records.map((d) => (
              <div className="saved-row" key={d.id}>
                <div>
                  <strong>{d.title}</strong>
                  <span>Private to your account</span>
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
