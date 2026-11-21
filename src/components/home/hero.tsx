import Link from 'next/link';
import { ArrowUpRight, MapPin, Route, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import { HERO } from '@/constants/brand';

export function Hero() {
  return (
    <section className="hero">
      <img
        className="hero-image"
        src={HERO}
        srcSet={`${HERO}?width=768 768w, ${HERO}?width=1024 1024w, ${HERO} 1472w`}
        sizes="100vw"
        width={1472}
        height={640}
        alt="A red car exploring a winding road through Ladakh's Himalayan mountains"
      />
      <div className="hero-shade"/>
      <div className="hero-copy">
        <span className="eyebrow hero-label"><span/> ONE INDIA. ENDLESS POSSIBILITIES.</span>
        <h1>Your kind of trip.<br/>Our kind of <span>planning.</span></h1>
        <p>From the first idea to the last mile. Customised journeys,<br className="desktop-only"/> thoughtfully planned for you, anywhere in India.</p>
        <div className="hero-actions">
          <a className="button" href="#enquire">Let’s plan your journey <ArrowUpRight size={18}/></a>
          <Link className="hero-secondary" href="/planner">
            <Sparkles size={17}/> Try the AI trip planner <ArrowUpRight size={16}/>
          </Link>
        </div>
      </div>
      <div className="hero-caption">
        <MapPin size={16}/><span>LADAKH, INDIA</span><span className="caption-line"/> THE ROAD IS CALLING
      </div>
      <div className="hero-index">01 <span>/ YOUR NEXT CHAPTER</span></div>
      <div className="trust-strip">
        <span><SlidersHorizontal size={21}/> 100% customised to you</span>
        <span><Route size={21}/> End-to-end travel planning</span>
        <span><ShieldCheck size={21}/> One team. Every detail.</span>
        <span className="trust-last">Made for your journey, not the crowd.</span>
      </div>
    </section>
  );
}
