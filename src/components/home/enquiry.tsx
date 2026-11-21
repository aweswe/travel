'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import { telHref } from '@/lib/contact-links';

function EnquiryContent() {
  const searchParams = useSearchParams();
  const destinationParam = searchParams.get('destination') ?? '';
  const itineraryParam = searchParams.get('itinerary') ?? '';
  const [itinerary, setItinerary] = useState(itineraryParam);

  useEffect(() => {
    // Also check sessionStorage for passed draft itinerary from planner
    if (!itineraryParam && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('collabcar_draft_itinerary');
      if (stored) {
        setItinerary(stored);
        sessionStorage.removeItem('collabcar_draft_itinerary');
      }
    } else if (itineraryParam) {
      setItinerary(itineraryParam);
    }
  }, [itineraryParam]);

  const form = useFormSubmission({
    submit: (_values, data) => {
      data.set('consent', 'true');
      return pb.collection('travel_enquiries').create(data);
    },
  });

  return (
    <section className="enquiry-section" id="enquire">
      <div className="enquiry-copy">
        <span className="eyebrow">LET’S TURN “SOMEDAY” INTO A PLAN</span>
        <h2>Your next story<br/>starts <span>here.</span></h2>
        <p>Tell us a little about your dream trip. Our travel team will help put together a journey that fits you, not the other way around.</p>
        <div className="enquiry-note">
          <span>PERSONAL PLANNING. NO PRESSURE.</span>
          <p>Custom routes. Clear proposals.<br/>A real team behind every journey.</p>
          <p style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Phone size={14}/> <a href={telHref('+91 7417545045')}>+91 7417545045</a>
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={14}/> 312, Chattarpur, New Delhi
          </p>
        </div>
      </div>
      <form className="enquiry-form" onSubmit={form.onSubmit}>
        <input {...form.honeypotProps}/>
        <div className="form-title">
          <h3>A few details. Endless possibilities.</h3>
          <span>Tell us what you have in mind.</span>
        </div>
        <div className="form-grid">
          <label>Your name *
            <input name="name" required maxLength={150} placeholder="How should we call you?"/>
          </label>
          <label>Email address *
            <input name="email" required type="email" placeholder="you@example.com"/>
          </label>
          <label>Phone number *
            <input name="phone" required type="tel" pattern="[+0-9 ()-]{7,30}" placeholder="+91 Your phone number"/>
          </label>
          <label>Where do you want to go? *
            <input key={destinationParam} defaultValue={destinationParam} name="destination" required placeholder="A destination, or surprise me"/>
          </label>
          <label>Starting from
            <input name="departure" placeholder="Your departure city"/>
          </label>
          <label>Travel date
            <input name="travel_date" type="date"/>
          </label>
          <label>Number of days *
            <input name="days" type="number" min={1} max={90} defaultValue={5} required/>
          </label>
          <label>Travellers *
            <input name="travellers" type="number" min={1} max={100} defaultValue={2} required/>
          </label>
          <label>Total trip budget
            <select name="budget">
              <option>Help me decide</option>
              <option>Under ₹25,000</option>
              <option>₹25,000–₹50,000</option>
              <option>₹50,000–₹1,00,000</option>
              <option>Above ₹1,00,000</option>
            </select>
          </label>
          <label>Your travel style
            <select name="travel_style">
              <option>A bit of everything</option>
              <option>Family holiday</option>
              <option>Couple getaway</option>
              <option>Friends & road trips</option>
              <option>Solo exploration</option>
              <option>Adventure</option>
              <option>Luxury & relaxation</option>
            </select>
          </label>
          <label className="full-field">Anything else we should know?
            <textarea
              key={itinerary}
              defaultValue={itinerary}
              name="notes"
              rows={3}
              maxLength={10000}
              placeholder="Must-see places, preferred stays, accessibility needs, or paste your AI itinerary…"
            />
          </label>
        </div>
        <label className="consent-label">
          <input name="consent" type="checkbox" required/> I agree that Collabcar may use these details to contact me about this travel enquiry. My details are not shown publicly.
        </label>
        <button className="button submit-button" disabled={form.isSubmitting}>
          {form.isSubmitting ? 'Sending your enquiry…' : 'Let’s create my trip'}
          <ArrowUpRight size={18}/>
        </button>
        <div aria-live="polite">
          {form.isSuccess && (
            <p className="success">
              <CheckCircle2 size={18}/> Your enquiry is saved. Our travel team can now review your trip preferences.
            </p>
          )}
          {form.isError && (
            <p className="error">We couldn’t send your enquiry. Please check your details and connection, then try again.</p>
          )}
          {Object.entries(form.fieldErrors).map(([name, error]) => (
            <p className="error" key={name}>{name}: {error}</p>
          ))}
        </div>
        <span className="form-footnote">An enquiry is not a booking. Final arrangements are confirmed with our team.</span>
      </form>
    </section>
  );
}

export function Enquiry() {
  return (
    <Suspense fallback={null}>
      <EnquiryContent />
    </Suspense>
  );
}
