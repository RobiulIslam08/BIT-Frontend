// ============================================
// BIT SOFTWARE — Contact Page
// ============================================

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
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
    // In production: POST to /api/v1/leads/contact
  };

  return (
    <>
      <SEOHead title="Contact Us" description="Get in touch with BIT Software & IT Solution. We're ready to discuss your project." />

      <section className="section">
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Contact Us</span>
              <h1 className="h1 section-header__title">Let's Start a <span className="text-gradient">Conversation</span></h1>
              <p className="section-header__desc">Have a project in mind? We'd love to hear from you.</p>
            </div>
          </FadeInUp>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Contact Info */}
            <FadeInUp delay={0.1}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { icon: Phone, label: 'Phone', value: COMPANY.phone, href: `tel:${COMPANY.phone}` },
                  { icon: Mail, label: 'Email', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
                  { icon: MapPin, label: 'Location', value: COMPANY.address },
                  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: COMPANY.whatsapp },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                    <div className="service-card__icon" style={{ marginBottom: 0, flexShrink: 0 }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
                      {href ? (
                        <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{value}</a>
                      ) : (
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </FadeInUp>

            {/* Form */}
            <FadeInUp delay={0.2}>
              <div className="card-elevated">
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3 className="h4" style={{ marginBottom: '0.5rem' }}>Message Sent!</h3>
                    <p className="body-sm">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Full Name *</label>
                        <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Email *</label>
                        <input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Phone</label>
                        <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="+966 5X XXX XXXX" />
                      </div>
                      <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Subject *</label>
                        <input className="input" name="subject" value={form.subject} onChange={handleChange} placeholder="Project inquiry" required />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Message *</label>
                      <textarea className="input" name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your project..." rows={5} required style={{ resize: 'vertical' }} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                      <Send size={18} /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>
    </>
  );
}
