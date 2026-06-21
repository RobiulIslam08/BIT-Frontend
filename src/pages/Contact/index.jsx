// ============================================
// BIT SOFTWARE — Contact Page (Premium Redesign)
// ============================================

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { COMPANY } from '@/utils/constants';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Production: contactApi.submit(form)
  };

  return (
    <>
      <SEOHead title="Contact Us" description="Get in touch with BIT Software & IT Solution. We're ready to discuss your project and provide a free consultation." />

      {/* Hero */}
      <section className="page-hero">
        <div className="container">
          <FadeInUp>
            <div className="page-hero__content">
              <span className="section-subtitle">Contact Us</span>
              <h1 className="h1 page-hero__title">Let's Start a <span className="text-gradient">Conversation</span></h1>
              <p className="page-hero__desc">Have a project in mind? We'd love to hear from you. Get in touch and let's discuss how we can help.</p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info Cards */}
            <FadeInUp delay={0.1}>
              <div className="contact-info-stack">
                {[
                  { icon: Phone, label: 'Phone', value: COMPANY.phone, href: `tel:${COMPANY.phone}` },
                  { icon: Mail, label: 'Email', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
                  { icon: MapPin, label: 'Location', value: COMPANY.address },
                  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us on WhatsApp', href: COMPANY.whatsapp },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="contact-info-card">
                    <div className="contact-info-card__icon">
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="contact-info-card__label">{label}</div>
                      <div className="contact-info-card__value">
                        {href ? (
                          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{value}</a>
                        ) : (
                          value
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInUp>

            {/* Form */}
            <FadeInUp delay={0.2}>
              <div className="card-elevated">
                {submitted ? (
                  <div className="success-state">
                    <div className="success-state__icon">✅</div>
                    <h3 className="h4" style={{ marginBottom: '0.5rem' }}>Message Sent Successfully!</h3>
                    <p className="body-sm">We'll get back to you within 24 hours. Thank you for reaching out.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
                      </div>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="+966 5X XXX XXXX" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Subject *</label>
                        <input className="input" name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea className="input" name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your project, goals, and timeline..." rows={5} required style={{ resize: 'vertical' }} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                      <Send size={18} /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <FadeInUp>
            <div className="cta-section__inner">
              <h2 className="h2 cta-section__title">Prefer a Quick Chat?</h2>
              <p className="body-lg cta-section__desc">Reach us directly via WhatsApp for instant response during business hours.</p>
              <div className="cta-section__buttons">
                <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg"><MessageCircle size={18} /> WhatsApp Us</a>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}
