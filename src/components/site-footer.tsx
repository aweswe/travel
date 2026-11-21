'use client';

import Link from 'next/link';
import { ArrowUpRight, Phone, MapPin } from 'lucide-react';
import { openCookiePreferences } from '@/lib/cookie-consent';
import { telHref } from '@/lib/contact-links';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="footer-brand">collabcar<span>.</span></Link>
        <p>Less planning. More living.<br/>Your travel companion, across India.</p>
        <p style={{marginTop: 18, display: 'flex', alignItems: 'center', gap: 10}}>
          <Phone size={15}/> <a href={telHref('+91 7417545045')}>+91 7417545045</a>
        </p>
        <p style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <MapPin size={15}/> 312, Chattarpur, New Delhi
        </p>
      </div>
      <div>
        <span className="eyebrow">YOUR NEXT JOURNEY</span>
        <a href="/#enquire">Contact our travel team <ArrowUpRight size={16}/></a>
        <Link href="/planner">Build an AI itinerary</Link>
        <a href="/#destinations">Explore destinations</a>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Collabcar. All rights reserved.</span>
        <span>Affordable, reliable & fast</span>
        <button type="button" onClick={openCookiePreferences}>Cookie settings</button>
      </div>
    </footer>
  );
}
