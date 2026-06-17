// BIT SOFTWARE — Google My Business Page (with Form)
import { useState } from 'react';
import { MapPin, Star, Search, CheckCircle2, Send } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';

const CATEGORIES = ['Restaurant', 'Shop / Retail', 'Clinic / Hospital', 'Salon / Spa', 'Real Estate', 'Construction', 'Education', 'Automotive', 'Other'];
const CITIES = ['Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam', 'Khobar', 'Dhahran', 'Tabuk', 'Abha', 'Other'];

export default function GoogleMyBusiness() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ businessName: '', category: '', address: '', city: '', phone: '', whatsapp: '', website: '', hours: '', description: '', services: '', email: '', notes: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };
  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  if (submitted) {
    return (
      <>
        <SEOHead title="Google My Business" description="Get your business found on Google Maps and local search in Saudi Arabia." />
        <section className="section" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div><div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div><h2 className="h2">Application Submitted!</h2><p className="body-base" style={{ marginTop: '0.5rem' }}>We'll contact you within 24 hours to set up your Google My Business profile.</p></div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Google My Business" description="Get your business found on Google Maps and local search in Saudi Arabia." />

      {/* Hero */}
      <section className="section" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <FadeInUp>
            <div className="section-header">
              <span className="section-subtitle">Google My Business</span>
              <h1 className="h1 section-header__title">Get Found on <span className="text-gradient">Google Maps</span></h1>
              <p className="section-header__desc">Let us set up and optimize your Google My Business profile to attract local customers in Saudi Arabia.</p>
            </div>
          </FadeInUp>

          {/* Benefits */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
            {[{ icon: MapPin, text: 'Appear on Google Maps' }, { icon: Star, text: '5-Star Review Strategy' }, { icon: Search, text: 'Rank in Local Search' }, { icon: CheckCircle2, text: 'Verified Business Profile' }].map(({ icon: Icon, text }) => (
              <div key={text} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <Icon size={28} style={{ color: 'var(--color-primary)', margin: '0 auto 0.5rem' }} />
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section">
        <div className="container" style={{ maxWidth: '700px' }}>
          <FadeInUp>
            {/* Progress */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Step {step} of 3</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{progress}% Complete</span>
              </div>
              <div style={{ height: '4px', borderRadius: '2px', background: 'var(--color-border)' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-accent-gradient)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div className="card-elevated" style={{ padding: '2rem' }}>
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 className="h4">Business Information</h3>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Business Name *</label><input className="input" name="businessName" value={form.businessName} onChange={handleChange} required /></div>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Category *</label><select className="input" name="category" value={form.category} onChange={handleChange} required><option value="">Select category</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Address *</label><input className="input" name="address" value={form.address} onChange={handleChange} required /></div>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>City *</label><select className="input" name="city" value={form.city} onChange={handleChange} required><option value="">Select city</option>{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                    <button type="button" onClick={() => setStep(2)} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Next Step</button>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 className="h4">Contact Details</h3>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Phone *</label><input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="+966 5X XXX XXXX" required /></div>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>WhatsApp</label><input className="input" name="whatsapp" value={form.whatsapp} onChange={handleChange} /></div>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Google Account Email *</label><input className="input" name="email" type="email" value={form.email} onChange={handleChange} required /></div>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Website URL</label><input className="input" name="website" value={form.website} onChange={handleChange} /></div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="button" onClick={() => setStep(1)} className="btn btn-secondary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                      <button type="button" onClick={() => setStep(3)} className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>Next</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 className="h4">Business Details</h3>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Business Hours *</label><input className="input" name="hours" value={form.hours} onChange={handleChange} placeholder="e.g. Sat-Thu 9AM-9PM" required /></div>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Description *</label><textarea className="input" name="description" value={form.description} onChange={handleChange} rows={3} required style={{ resize: 'vertical' }} /></div>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Services/Products *</label><textarea className="input" name="services" value={form.services} onChange={handleChange} rows={3} required style={{ resize: 'vertical' }} /></div>
                    <div><label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Notes</label><textarea className="input" name="notes" value={form.notes} onChange={handleChange} rows={2} style={{ resize: 'vertical' }} /></div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="button" onClick={() => setStep(2)} className="btn btn-secondary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                      <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}><Send size={18} /> Submit</button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </FadeInUp>
        </div>
      </section>
    </>
  );
}
