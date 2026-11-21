'use client';

import { ArrowUpRight, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { pocketbaseClient as pb } from '@/lib/pocketbase-client';
import { telHref } from '@/lib/contact-links';

export function ContactSection() {
  const form = useFormSubmission({
    submit: (_values, data) => {
      data.set('consent', 'true');
      return pb.collection('contact_messages').create(data);
    },
  });

  return (
    <>
      <section className="section-rail page-intro">
        <span className="eyebrow">CONTACT US</span>
        <h1>Let’s talk about<br/>your <span style={{ color: 'var(--red)' }}>next journey.</span></h1>
        <p>Questions, ideas, or ready to start planning? Send us a message and our travel team will get back to you.</p>
      </section>
      <section className="enquiry-section" id="contact">
        <div className="enquiry-copy">
          <span className="eyebrow">REACH THE COLLABCAR TEAM</span>
          <h2>We’re here to<br/>help you <span>travel.</span></h2>
          <p>Whether it’s a quick question or a full itinerary, reach out and we’ll take it from there.</p>
          <div className="enquiry-note">
            <span>GET IN TOUCH</span>
            <p style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
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
            <h3>Send us a message.</h3>
            <span>We’ll reply as soon as we can.</span>
          </div>
          <div className="form-grid">
            <label>Your name *
              <input name="name" required maxLength={150} placeholder="How should we call you?"/>
            </label>
            <label>Email address *
              <input name="email" required type="email" placeholder="you@example.com"/>
            </label>
            <label>Phone number
              <input name="phone" type="tel" pattern="[+0-9 ()-]{7,30}" placeholder="+91 Your phone number"/>
            </label>
            <label>Subject
              <select name="subject">
                <option>General enquiry</option>
                <option>Customised package</option>
                <option>AI trip planner</option>
                <option>Feedback</option>
              </select>
            </label>
            <label className="full-field">Your message *
              <textarea name="message" required rows={5} maxLength={5000} placeholder="Tell us what you have in mind…"/>
            </label>
          </div>
          <label className="consent-label">
            <input name="consent" type="checkbox" required/> I agree that Collabcar may use these details to contact me about my enquiry. My details are not shown publicly.
          </label>
          <button className="button submit-button" disabled={form.isSubmitting}>
            {form.isSubmitting ? 'Sending your message…' : 'Send message'}
            <ArrowUpRight size={18}/>
          </button>
          <div aria-live="polite">
            {form.isSuccess && (
              <p className="success">
                <CheckCircle2 size={18}/> Thank you. Your message is on its way — our team will be in touch.
              </p>
            )}
            {form.isError && (
              <p className="error">We couldn’t send your message. Please check your details and connection, then try again.</p>
            )}
            {Object.entries(form.fieldErrors).map(([name, error]) => (
              <p className="error" key={name}>{name}: {error}</p>
            ))}
          </div>
          <span className="form-footnote">Sending a message is not a booking. Final arrangements are confirmed with our team.</span>
        </form>
      </section>
    </>
  );
}
