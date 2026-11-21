import Link from 'next/link';
import { ArrowUpRight, Sparkles, MapPin, Check, Route } from 'lucide-react';

export function PlannerPromo() {
  return (
    <section className="planner-promo">
      <div className="promo-copy">
        <span className="eyebrow"><Sparkles size={16}/> MEET YOUR AI TRAVEL CO-PILOT</span>
        <h2>A big travel idea.<br/>A plan in minutes.</h2>
        <p>Tell us where you want to go, what you love, and what you want to spend. Our AI planner connects the dots into a day-by-day itinerary you can make your own.</p>
        <Link className="button" href="/planner">Build my itinerary <ArrowUpRight size={18}/></Link>
        <span className="promo-note">Your ideas + a little AI + our on-ground expertise.</span>
      </div>
      <div className="itinerary-preview">
        <div className="preview-top">
          <span><Sparkles size={18}/> YOUR JOURNEY, DRAFTED</span>
          <span className="preview-status">A little inspiration</span>
        </div>
        <h3>Five days. A whole new perspective.</h3>
        <span className="preview-sub"><MapPin size={14}/> Kochi → Munnar → Alleppey</span>
        <div className="preview-day">
          <span>01</span>
          <div>
            <strong>Hello, Kochi</strong>
            <p>Fort Kochi lanes, local flavours & a sunset by the sea.</p>
          </div>
          <Check size={16}/>
        </div>
        <div className="preview-day">
          <span>02</span>
          <div>
            <strong>Into the hills</strong>
            <p>A scenic drive to Munnar. Tea gardens at your pace.</p>
          </div>
          <Check size={16}/>
        </div>
        <div className="preview-day">
          <span>03</span>
          <div>
            <strong>A slower kind of morning</strong>
            <p>Mountain views, a gentle walk & time to unwind.</p>
          </div>
          <Route size={17}/>
        </div>
        <div className="preview-footer">Your pace. Your preferences. Your plan. <Sparkles size={15}/></div>
      </div>
    </section>
  );
}
