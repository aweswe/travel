'use client';

import Link from 'next/link';
import { ArrowUpRight, Phone, MapPin, Mail, ShieldCheck } from 'lucide-react';
import { openCookiePreferences } from '@/lib/cookie-consent';
import { telHref } from '@/lib/contact-links';

export function SiteFooter() {
  return (
    <footer className="site-footer" style={{ borderTop: '1px solid var(--line)', background: 'var(--soft)' }}>
      <div className="footer-col-1">
        <Link href="/" className="footer-brand">collabcar<span>.</span></Link>
        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--quiet)', lineHeight: 1.6 }}>
          Less planning. More living.<br/>
          Your verified chauffeured travel companion across India.
        </p>
        <p style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
          <Phone size={14} color="var(--red)"/> <a href={telHref('+91 7417545045')}>+91 7417545045</a>
        </p>
        <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, marginTop: 6 }}>
          <Mail size={14} color="var(--red)"/> <a href="mailto:support@collabcar.com">support@collabcar.com</a>
        </p>
        <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, marginTop: 6 }}>
          <MapPin size={14} color="var(--red)"/> 312, Chattarpur Heritage Lane, New Delhi 110074
        </p>
      </div>

      <div className="footer-col-2">
        <span className="eyebrow" style={{ color: 'var(--red)', marginBottom: 12 }}>EXPLORE &amp; PLAN</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
          <Link href="/planner">AI Trip Planner (Instant Draft)</Link>
          <Link href="/blog">India Road Trip Guides &amp; Blog</Link>
          <a href="/#destinations">Popular Destinations</a>
          <a href="/#how-it-works">How Chauffeured Booking Works</a>
          <Link href="/about">About Collabcar</Link>
          <Link href="/contact">Contact Our Route Team</Link>
        </div>
      </div>

      <div className="footer-col-3">
        <span className="eyebrow" style={{ color: 'var(--red)', marginBottom: 12 }}>COMPLIANCE &amp; LEGAL</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
          <Link href="/privacy-policy">Privacy Policy (DPDPA 2023)</Link>
          <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
          <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link>
          <button type="button" onClick={openCookiePreferences} style={{ textAlign: 'left', color: 'var(--quiet)', fontSize: 11 }}>
            Cookie Preferences
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Collabcar Mobility Technologies Pvt Ltd. All rights reserved.</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} color="var(--red)" /> Verified commercial permits &amp; licensed chauffeurs
        </span>
      </div>

      <style jsx>{`
        .site-footer {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 40px;
          padding: 60px 7.6% 25px;
        }
        .footer-col-1, .footer-col-2, .footer-col-3 {
          display: flex;
          flex-direction: column;
        }
        .footer-brand {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.075em;
        }
        .footer-brand span {
          color: var(--red);
        }
        .footer-col-2 a:hover, .footer-col-3 a:hover {
          color: var(--red);
        }
        .footer-bottom {
          grid-column: 1 / -1;
          border-top: 1px solid var(--line);
          padding-top: 24px;
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--quiet);
          font-size: 11px;
          flex-wrap: wrap;
          gap: 16px;
        }
        @media (max-width: 900px) {
          .site-footer {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 40px 6% 20px;
          }
        }
      `}</style>
    </footer>
  );
}
