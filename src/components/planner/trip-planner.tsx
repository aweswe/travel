'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowUpRight, Download, Save, Route, RefreshCw, Trash2 } from 'lucide-react';
import type { RecordModel } from 'pocketbase';
import { useAuth } from '@/hooks/use-auth';
import { usePocketbaseRecords } from '@/hooks/use-pocketbase-records';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import { sendMessage, loadChatHistory, clearChatHistory, type ChatMessage } from '@/api/integrated-ai-api';
import { REQUIRE_LOGIN } from '@/constants/ai-assistant.config';

type Draft = RecordModel & { title: string; content: string };

export function TripPlanner() {
  const auth = useAuth();
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
  const outputRef = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);

  const drafts = usePocketbaseRecords<Draft>('itinerary_drafts', { sort: '-updated', enabled: auth.isAuthed });
  const userId = auth.user?.id;

  useEffect(() => {
    let active = true;
    if (!userId) {
      setText('');
      setImages([]);
      setMessages([]);
      return () => { active = false; };
    }
    setHistoryLoading(true);
    loadChatHistory()
      .then(history => {
        if (!active) return;
        setMessages(history);
        const last = [...history].reverse().find(m => m.role === 'assistant');
        if (last) {
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
    const d = new FormData(e.currentTarget);
    setTitle(`${d.get('destination')} · ${d.get('days')} days`);
    void generate(
      `Draft a new India itinerary with these preferences: destination ${d.get('destination')}; departure city ${d.get('departure')}; start date ${d.get('date') || 'flexible'}; ${d.get('days')} days; ${d.get('travellers')} travellers; total group budget INR ${d.get('budget')}; travel pace ${d.get('pace')}; stay preference ${d.get('stay')}; interests and needs: ${d.get('interests')}. Include a practical day-by-day route and approximate group budget. This is a draft, not a booking.`
    );
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

  function download() {
    const url = URL.createObjectURL(new Blob([title + '\n\n' + text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collabcar-itinerary.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function reset() {
    if (!window.confirm('Clear your AI conversation and start fresh? Saved itineraries will remain.')) return;
    try {
      await clearChatHistory();
      setMessages([]);
      setText('');
      setImages([]);
      setDraftId('');
      setNotice('Ready for a new journey.');
    } catch {
      setError('Your conversation could not be cleared. Try again.');
    }
  }

  async function resend() {
    setError('');
    try {
      await pb.collection('users').requestVerification(String(auth.user?.email));
      setNotice('Verification email sent. Check your inbox, then return here.');
    } catch {
      setError('The email could not be sent. Please wait and try again.');
    }
  }

  return (
    <section className="planner-section section-rail">
      <div className="planner-heading">
        <span className="eyebrow"><Sparkles size={17}/> THE COLLABCAR AI TRIP PLANNER</span>
        <h1>Your imagination.<br/><span>A route to match.</span></h1>
        <p>Make a first draft, change the details, and let your next India journey take shape.</p>
      </div>
      <div className="planner-account">
        {auth.isLoading ? 'Loading your account…' : auth.isAuthed ? (
          <>
            <span>Planning as {auth.user?.name || auth.user?.email}</span>
            <button type="button" onClick={auth.logout} disabled={busy}>Sign out</button>
          </>
        ) : (
          <>
            <span>Sign up and verify your email to generate and save your itinerary.</span>
            <Link className="button" href="/login">Sign in / Create account <ArrowUpRight size={16}/></Link>
          </>
        )}
      </div>
      {auth.isAuthed && !auth.user?.verified && (
        <div className="verification">
          <strong>Check your inbox before your first trip draft.</strong>
          <p>Verify your email to use AI. Returning to this tab refreshes your verification status.</p>
          <button type="button" className="text-link" onClick={resend}>Resend verification email</button>
        </div>
      )}
      <div className="planner-layout">
        <form className="planner-config" onSubmit={configure}>
          <span className="eyebrow">01 / YOUR TRAVEL PREFERENCES</span>
          <h2>Let’s set the direction.</h2>
          <label>Where in India? *
            <input name="destination" placeholder="e.g. Kerala, Rajasthan, Ladakh" required maxLength={200}/>
          </label>
          <label>Departure city *
            <input name="departure" placeholder="e.g. Delhi" required maxLength={200}/>
          </label>
          <label>Start date
            <input name="date" type="date"/>
          </label>
          <div className="form-grid">
            <label>Days *
              <input name="days" required type="number" min={1} max={30} defaultValue={5}/>
            </label>
            <label>Travellers *
              <input name="travellers" required type="number" min={1} max={30} defaultValue={2}/>
            </label>
          </div>
          <label>Total group budget (₹) *
            <input name="budget" type="number" min={1000} max={10000000} step={500} defaultValue={50000} required/>
          </label>
          <div className="form-grid">
            <label>Travel pace
              <select name="pace">
                <option>Balanced</option>
                <option>Slow & relaxed</option>
                <option>Action-packed</option>
              </select>
            </label>
            <label>Stay preference
              <select name="stay">
                <option>Comfort / mid-range</option>
                <option>Budget-friendly</option>
                <option>Luxury</option>
                <option>Homestays</option>
              </select>
            </label>
          </div>
          <label>Interests & special needs
            <textarea name="interests" maxLength={3000} rows={3} placeholder="Culture, food, nature, adventure, accessibility, travelling with children…"/>
          </label>
          <button className="button" disabled={busy || historyLoading || auth.isLoading || (REQUIRE_LOGIN && (!auth.isAuthed || !auth.user?.verified))}>
            {busy ? 'Mapping your journey…' : 'Generate my itinerary'}<Sparkles size={17}/>
          </button>
          {REQUIRE_LOGIN && !auth.isAuthed && (
            <Link className="text-link" href="/login">Create an account to get started <ArrowUpRight size={16}/></Link>
          )}
          <small>AI costs and routes are estimates. Verify availability and local conditions before travel.</small>
        </form>
        <div className="planner-output" ref={outputRef}>
          <div className="output-heading">
            <span className="eyebrow">02 / YOUR ITINERARY</span>
            <button type="button" onClick={reset} disabled={busy || !auth.isAuthed} className="text-link">
              <RefreshCw size={14}/> New journey
            </button>
          </div>
          {historyLoading ? (
            <div className="output-empty"><Route size={36}/><p>Loading your previous journey…</p></div>
          ) : !text && !busy ? (
            <div className="output-empty">
              <Route size={48}/>
              <h2>Every great trip starts here.</h2>
              <p>Add your preferences to the left.<br/>We’ll help you connect the dots.</p>
              <span>DESTINATION → DISCOVERY → MEMORIES</span>
            </div>
          ) : (
            <>
              <label className="draft-title">Trip title
                <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} required/>
              </label>
              <label className="itinerary-label">Your draft — edit any detail
                <textarea
                  className="itinerary-editor"
                  aria-label="Editable itinerary"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  readOnly={busy}
                  rows={22}
                />
              </label>
              {busy && (
                <div className="generating" role="status">
                  <Sparkles size={16}/> Drafting your journey…{' '}
                  <button type="button" className="text-link" onClick={() => controller.current?.abort()}>Stop</button>
                </div>
              )}
              {images.map((url, i) => (
                <img key={url} src={url} alt={`Generated trip inspiration ${i + 1}`} className="generated-image"/>
              ))}
              <div className="draft-actions">
                <button
                  className="button"
                  type="button"
                  disabled={busy || saving || !text.trim() || !title.trim()}
                  onClick={save}
                >
                  <Save size={16}/>{saving ? 'Saving…' : draftId ? 'Update saved draft' : 'Save itinerary'}
                </button>
                <button className="button outline" type="button" onClick={download} disabled={busy || !text}>
                  <Download size={16}/> Download
                </button>
                <Link
                  className="text-link"
                  href={`/?destination=${encodeURIComponent(title)}#enquire`}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('collabcar_draft_itinerary', text.slice(0, 10000));
                    }
                  }}
                >
                  Get a team-reviewed proposal <ArrowUpRight size={16}/>
                </Link>
              </div>
              <form className="refine-form" onSubmit={e => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                void generate(`Please refine this itinerary based on my request: ${d.get('refinement')}. Current edited itinerary: ${text}`);
                e.currentTarget.reset();
              }}>
                <label>Make it more you
                  <input name="refinement" required placeholder="e.g. Add a rest day and family-friendly stays" maxLength={2000}/>
                </label>
                <button className="button" disabled={busy || (REQUIRE_LOGIN && !auth.user?.verified)} aria-label="Refine itinerary">
                  <ArrowUpRight size={18}/>
                </button>
              </form>
            </>
          )}
          <div aria-live="polite">
            {error && <p className="error">{error}</p>}
            {notice && <p className="success">{notice}</p>}
          </div>
          {messages.length > 0 && (
            <details className="conversation-history">
              <summary>Your AI conversation ({messages.length} messages)</summary>
              {messages.map((m, i) => (
                <div key={i}>
                  <strong>{m.role === 'user' ? 'You' : 'Collabcar AI'}</strong>
                  <p>{m.content}</p>
                  {m.images?.map(url => <img key={url} src={url} alt="Trip inspiration" className="generated-image"/>)}
                </div>
              ))}
            </details>
          )}
        </div>
      </div>
      {auth.isAuthed && (
        <div className="saved-drafts">
          <span className="eyebrow">YOUR TRAVEL NOTEBOOK</span>
          <h2>Saved journeys</h2>
          {drafts.isLoading ? (
            <p>Loading saved journeys…</p>
          ) : drafts.error ? (
            <p className="error">
              Saved journeys could not be loaded.{' '}
              <button type="button" onClick={() => void drafts.reload()}>Try again</button>
            </p>
          ) : drafts.records.length === 0 ? (
            <p>No saved trips yet. Save your first draft above to keep it here.</p>
          ) : (
            drafts.records.map(d => (
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
                  Open itinerary <ArrowUpRight size={17}/>
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
                  <Trash2 size={17}/>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
