'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';

export function AuthForm() {
  const auth = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('signup');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email'));
    const password = String(data.get('password'));
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'reset') {
        await pb.collection('users').requestPasswordReset(email);
        setNotice('If an account exists, a password reset link has been sent. Check your inbox.');
      } else {
        if (mode === 'signup') {
          if (password !== data.get('passwordConfirm')) throw new Error('The passwords do not match.');
          await auth.signup(email, password, { name: data.get('name') });
        } else {
          await auth.login(email, password);
        }
        router.push('/planner');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not sign you in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-section">
      <div className="auth-intro">
        <span className="eyebrow"><Sparkles size={17}/> YOUR TRAVEL CO-PILOT</span>
        <h1>Good journeys<br/>start with an idea.</h1>
        <p>Create an account to draft personalised itineraries, refine them with AI, and keep your travel plans in one place.</p>
        <Link className="text-link" href="/">Explore Collabcar <ArrowUpRight size={17}/></Link>
      </div>
      <div className="auth-panel">
        {auth.isLoading ? (
          <p>Loading your account…</p>
        ) : auth.isAuthed ? (
          <>
            <h2>You’re signed in.</h2>
            <p>{auth.user?.email}</p>
            <Link className="button" href="/planner">Go to my planner <ArrowUpRight size={18}/></Link>
            <button className="text-link" type="button" onClick={auth.logout}>Sign out</button>
          </>
        ) : (
          <>
            <h2>{mode === 'signup' ? 'Your next adventure awaits.' : mode === 'reset' ? 'Let’s get you back in.' : 'Welcome back.'}</h2>
            <p>{mode === 'signup' ? 'Sign up, verify your email, and start planning.' : mode === 'reset' ? 'We’ll send a secure reset link to your email.' : 'Sign in to continue your journey.'}</p>
            <form onSubmit={submit}>
              {mode === 'signup' && (
                <label>Your name
                  <input name="name" required autoComplete="name"/>
                </label>
              )}
              <label>Email address
                <input name="email" type="email" required autoComplete="email"/>
              </label>
              {mode !== 'reset' && (
                <label>Password
                  <input name="password" type="password" minLength={8} required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}/>
                  <small>At least 8 characters.</small>
                </label>
              )}
              {mode === 'signup' && (
                <label>Confirm password
                  <input name="passwordConfirm" type="password" required minLength={8} autoComplete="new-password"/>
                </label>
              )}
              <button className="button" disabled={busy}>
                {busy ? 'Please wait…' : mode === 'signup' ? 'Create my account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
                <ArrowUpRight size={17}/>
              </button>
              {error && <p className="error" role="alert">{error}</p>}
              {notice && <p className="success" role="status">{notice}</p>}
            </form>
            <div className="auth-switch">
              <button type="button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setNotice(''); }}>
                {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
              </button>
              {mode === 'login' && (
                <button type="button" onClick={() => setMode('reset')}>Forgot your password?</button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
