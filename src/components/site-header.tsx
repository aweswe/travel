'use client';

import Link from 'next/link';
import { ArrowUpRight, Menu, X, Sparkles } from 'lucide-react';
import { LOGO } from '@/constants/brand';
import { useDisclosure } from '@/hooks/use-disclosure';

export function SiteHeader() {
  const menu = useDisclosure();
  return (
    <header className="site-header">
      <Link href="/" className="logo" aria-label="Collabcar home">
        <img src={LOGO} width={1568} height={793} alt="Collabcar — affordable, reliable & fast" />
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="/#destinations">Explore India</a>
        <Link href="/about">About us</Link>
        <a href="/#how-it-works">How it works</a>
        <Link href="/contact">Contact</Link>
        <Link href="/planner">
          <Sparkles size={15}/> AI trip planner <span className="tiny-tag">NEW</span>
        </Link>
      </nav>
      <a className="button header-cta" href="/#enquire">
        Plan my trip <ArrowUpRight size={17}/>
      </a>
      <button className="menu-toggle" {...menu.triggerProps} aria-label="Toggle navigation">
        {menu.isOpen ? <X/> : <Menu/>}
      </button>
      {menu.isOpen && (
        <nav className="mobile-nav" {...menu.panelProps} aria-label="Mobile navigation">
          <a href="/#destinations" onClick={menu.close}>Explore India</a>
          <Link href="/about" onClick={menu.close}>About us</Link>
          <a href="/#how-it-works" onClick={menu.close}>How it works</a>
          <Link href="/contact" onClick={menu.close}>Contact</Link>
          <Link href="/planner" onClick={menu.close}>AI trip planner</Link>
          <a href="/#enquire" onClick={menu.close}>Plan my trip</a>
        </nav>
      )}
    </header>
  );
}
