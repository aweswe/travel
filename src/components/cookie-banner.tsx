'use client';

import { useCookieBanner } from '@/hooks/use-cookie-banner';

export function CookieBanner() {
  const b = useCookieBanner();
  if (!b.isOpen) return null;
  return (
    <section className="cookie-banner" role="dialog" aria-label="Cookie preferences">
      <div>
        <strong>A little about cookies</strong>
        <p>We use essential cookies to run the site. Optional cookies help us understand visits and improve your experience.</p>
      </div>
      {b.isCustomizing && (
        <fieldset>
          <legend>Optional cookies</legend>
          <label>
            <input
              type="checkbox"
              checked={b.choices.analytics}
              onChange={e => b.setChoice('analytics', e.target.checked)}
            />{' '}
            Analytics — site visitor statistics
          </label>
          <label>
            <input
              type="checkbox"
              checked={b.choices.marketing}
              onChange={e => b.setChoice('marketing', e.target.checked)}
            />{' '}
            Marketing — ad measurement and personalised ads
          </label>
          <label>
            <input
              type="checkbox"
              checked={b.choices.platformAnalytics}
              onChange={e => b.setChoice('platformAnalytics', e.target.checked)}
            />{' '}
            Platform analytics — Hostinger uses Amplitude to improve its platform without directly identifying you
          </label>
        </fieldset>
      )}
      <div className="cookie-actions">
        <button type="button" className="button outline" onClick={b.rejectOptional}>
          Reject optional
        </button>
        <button
          type="button"
          className="button outline"
          onClick={b.isCustomizing ? b.saveChoices : b.customize}
        >
          {b.isCustomizing ? 'Save choices' : 'Customize'}
        </button>
        <button type="button" className="button" onClick={b.acceptAll}>
          Accept all
        </button>
      </div>
    </section>
  );
}
