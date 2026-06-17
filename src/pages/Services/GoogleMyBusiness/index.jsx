// ============================================
// BIT SOFTWARE — Google My Business Optimization
// ============================================

import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  MapPin, Star, Search, CheckCircle2, Send, Globe, Phone, Clock,
  ArrowLeft, ArrowRight, Sparkles, Building2, Navigation, Heart, ShieldCheck,
  ChevronDown, Award, ThumbsUp, ShieldAlert, BarChart3
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { FadeInUp } from '@/components/animations/FadeInUp';
import { COMPANY } from '@/utils/constants';
import MapPicker from './MapPicker';
import './GoogleMyBusiness.css';

const COUNTRIES = [
  { name: 'Saudi Arabia', code: 'SA', dial: '+966' },
  { name: 'United States', code: 'US', dial: '+1' },
  { name: 'United Kingdom', code: 'GB', dial: '+44' },
  { name: 'United Arab Emirates', code: 'AE', dial: '+971' },
  { name: 'Canada', code: 'CA', dial: '+1' },
  { name: 'Australia', code: 'AU', dial: '+61' },
  { name: 'Germany', code: 'DE', dial: '+49' },
  { name: 'Singapore', code: 'SG', dial: '+65' },
  { name: 'India', code: 'IN', dial: '+91' },
  { name: 'Bangladesh', code: 'BD', dial: '+880' }
];

const CATEGORIES = [
  'Restaurant / Cafe',
  'Software & IT Solution',
  'Retail Store / Shop',
  'Medical Clinic / Hospital',
  'Real Estate Agency',
  'Professional Consulting Services',
  'E-commerce Brand',
  'Local Service (Plumber, Electrician)',
  'Hair Salon & Spa',
  'Educational Institute'
];

export default function GoogleMyBusiness() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({
    businessName: '',
    category: '',
    hasPhysicalLocation: 'yes',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Saudi Arabia',
    latitude: 24.7136,
    longitude: 46.6753,
    serviceAreas: '',
    phoneCode: '+966',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    description: '',
    servicesList: ''
  });

  const [activeHours, setActiveHours] = useState({
    Mon: { active: true, open: '09:00', close: '18:00' },
    Tue: { active: true, open: '09:00', close: '18:00' },
    Wed: { active: true, open: '09:00', close: '18:00' },
    Thu: { active: true, open: '09:00', close: '18:00' },
    Fri: { active: false, open: '09:00', close: '18:00' },
    Sat: { active: false, open: '09:00', close: '18:00' },
    Sun: { active: true, open: '09:00', close: '18:00' }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Sync dial code if country changes
      if (name === 'country') {
        const countryObj = COUNTRIES.find((c) => c.name === value);
        if (countryObj) {
          updated.phoneCode = countryObj.dial;
        }
      }
      return updated;
    });
  };

  const handleHoursToggle = (day) => {
    setActiveHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active }
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setActiveHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleAddressUpdate = (addressObj) => {
    setForm((prev) => ({
      ...prev,
      streetAddress: addressObj.streetAddress || prev.streetAddress,
      city: addressObj.city || prev.city,
      state: addressObj.state || prev.state,
      postalCode: addressObj.postalCode || prev.postalCode,
      country: addressObj.country || prev.country
    }));
  };

  const handleLocationSelect = ({ lat, lng }) => {
    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleNext = () => {
    // Basic validation per step
    if (step === 1) {
      if (!form.businessName || !form.category) {
        alert('Please enter your business name and category.');
        return;
      }
    } else if (step === 2) {
      if (form.hasPhysicalLocation === 'yes') {
        if (!form.streetAddress || !form.city || !form.postalCode) {
          alert('Please fill out all address fields.');
          return;
        }
      } else {
        if (!form.serviceAreas) {
          alert('Please specify your service areas.');
          return;
        }
      }
    } else if (step === 3) {
      if (!form.phone || !form.email) {
        alert('Please fill out contact phone and email.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const progressPercentage = (step / 4) * 100;

  if (submitted) {
    return (
      <>
        <SEOHead
          title="Profile Submitted — Google My Business Setup"
          description="Your Google Business Profile details have been submitted for optimization."
        />
        <section className="gmb-success-section">
          <div className="container gmb-success-container">
            <motion.div
              className="gmb-success-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="gmb-success-icon-wrap">
                <CheckCircle2 size={48} className="success-icon" />
              </div>
              <h2 className="h2 success-title">Google Profile Configured!</h2>
              <p className="body-base success-desc">
                Thank you! Our local SEO experts will contact you at <strong>{form.email}</strong> within 24 hours to initiate your official Google Maps validation and start your Local SEO ranking campaign.
              </p>
              <div className="success-summary">
                <h4>Submission Summary</h4>
                <ul>
                  <li><strong>Business:</strong> {form.businessName}</li>
                  <li><strong>Category:</strong> {form.category}</li>
                  <li><strong>Location:</strong> {form.hasPhysicalLocation === 'yes' ? `${form.city}, ${form.country}` : `Service Area: ${form.serviceAreas}`}</li>
                  <li><strong>Verification Contact:</strong> {form.phoneCode} {form.phone}</li>
                </ul>
              </div>
              <button onClick={() => { setStep(1); setSubmitted(false); }} className="btn btn-primary">
                Configure Another Business
              </button>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Google My Business (GBP) Setup — International Local SEO"
        description="Launch your Google Maps listing globally. Follows official Google business onboarding system for international & local audiences."
      />

      {/* Hero Section */}
      <section className="gmb-hero">
        <div className="gmb-hero__bg">
          <div className="gmb-orb gmb-orb-blue" />
          <div className="gmb-orb gmb-orb-red" />
          <div className="gmb-orb gmb-orb-yellow" />
          <div className="gmb-orb gmb-orb-green" />
        </div>

        <div className="container">
          <FadeInUp>
            <div className="gmb-hero__content">
              <div className="gmb-google-badge">
                <div className="google-dots">
                  <span className="g-dot blue" />
                  <span className="g-dot red" />
                  <span className="g-dot yellow" />
                  <span className="g-dot green" />
                </div>
                <span>Google Business Profile System</span>
              </div>
              <h1 className="h1 gmb-hero__title">
                Get Discovered Globally on <span className="text-gradient">Google Maps</span>
              </h1>
              <p className="gmb-hero__desc">
                Setup your Google Business Profile according to Google's international guidelines. Fill out the verification form below to build your optimized, customer-ready local presence.
              </p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Main Form & Preview Workspace */}
      <section className="gmb-workspace">
        <div className="container gmb-workspace-grid">
          {/* Left Column: Multi-Step Setup Form */}
          <div className="gmb-form-container">
            {/* Steps Progress Header */}
            <div className="gmb-progress-card">
              <div className="progress-text">
                <span className="step-label">STEP {step} OF 4</span>
                <span className="step-desc">
                  {step === 1 && 'Business Core Identity'}
                  {step === 2 && 'Location Details'}
                  {step === 3 && 'Contact & Channels'}
                  {step === 4 && 'Operational Details'}
                </span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="gmb-interactive-form">
              {/* STEP 1: Core Business Identity */}
              {step === 1 && (
                <div className="form-step-content">
                  <h3 className="form-step-title">Let's start with your business basics</h3>
                  <p className="form-step-subtitle">This helps customers find your listing when looking for similar products or services.</p>

                  <div className="form-group">
                    <label className="form-label">Business Name *</label>
                    <input
                      type="text"
                      className="input"
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Tech Solutions"
                      required
                    />
                    <span className="form-tip">Use your official business name without adding keyword stuffing.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Business Category *</label>
                    <select
                      className="input"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose a primary category...</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span className="form-tip">Select a category that best describes your core business activity.</span>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={handleNext} className="btn btn-primary btn-lg full-width">
                      Next Step <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Location Details */}
              {step === 2 && (
                <div className="form-step-content">
                  <h3 className="form-step-title">Do you want to add a location customers can visit?</h3>
                  <p className="form-step-subtitle">Like a store, office, or physical workshop.</p>

                  <div className="location-toggle-group">
                    <label className={`location-toggle-card ${form.hasPhysicalLocation === 'yes' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="hasPhysicalLocation"
                        value="yes"
                        checked={form.hasPhysicalLocation === 'yes'}
                        onChange={handleChange}
                      />
                      <Building2 size={24} />
                      <div className="toggle-text">
                        <strong>Yes, add location</strong>
                        <span>I have a storefront, office, or workspace customers can visit.</span>
                      </div>
                    </label>

                    <label className={`location-toggle-card ${form.hasPhysicalLocation === 'no' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="hasPhysicalLocation"
                        value="no"
                        checked={form.hasPhysicalLocation === 'no'}
                        onChange={handleChange}
                      />
                      <Navigation size={24} />
                      <div className="toggle-text">
                        <strong>No, service area only</strong>
                        <span>I deliver or visit customers directly (Online/Service area only).</span>
                      </div>
                    </label>
                  </div>

                  {form.hasPhysicalLocation === 'yes' ? (
                    <div className="address-fields animate-fade-in">
                      <div className="form-group">
                        <label className="form-label">Search & Pin Precise Map Location *</label>
                        <MapPicker
                          latitude={form.latitude}
                          longitude={form.longitude}
                          countryName={form.country}
                          onLocationSelect={handleLocationSelect}
                          onAddressUpdate={handleAddressUpdate}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Country / Region</label>
                        <select
                          className="input"
                          name="country"
                          value={form.country}
                          onChange={handleChange}
                        >
                          {COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Street Address *</label>
                        <input
                          type="text"
                          className="input"
                          name="streetAddress"
                          value={form.streetAddress}
                          onChange={handleChange}
                          placeholder="e.g. 123 Business Avenue, Suite 400"
                          required
                        />
                      </div>

                      <div className="grid-3col">
                        <div className="form-group">
                          <label className="form-label">City *</label>
                          <input
                            type="text"
                            className="input"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="e.g. Riyadh or London"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">State / Region</label>
                          <input
                            type="text"
                            className="input"
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            placeholder="e.g. California or Riyadh Dist."
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Postal / ZIP Code *</label>
                          <input
                            type="text"
                            className="input"
                            name="postalCode"
                            value={form.postalCode}
                            onChange={handleChange}
                            placeholder="e.g. 12211"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="address-fields animate-fade-in">
                      <div className="form-group">
                        <label className="form-label">Service Areas *</label>
                        <input
                          type="text"
                          className="input"
                          name="serviceAreas"
                          value={form.serviceAreas}
                          onChange={handleChange}
                          placeholder="e.g. Worldwide, London, Middle East, GCC"
                          required
                        />
                        <span className="form-tip">Specify countries, cities, or regions where you provide services.</span>
                      </div>
                    </div>
                  )}

                  <div className="form-actions row-gap">
                    <button type="button" onClick={handleBack} className="btn btn-secondary btn-lg">
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button type="button" onClick={handleNext} className="btn btn-primary btn-lg">
                      Next Step <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Contact & Channels */}
              {step === 3 && (
                <div className="form-step-content">
                  <h3 className="form-step-title">Provide your contact information</h3>
                  <p className="form-step-subtitle">This helps customers reach you directly and verifies your listing.</p>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <div className="phone-input-wrap">
                      <select
                        className="phone-code-select"
                        name="phoneCode"
                        value={form.phoneCode}
                        onChange={handleChange}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.dial}>
                            {c.code} ({c.dial})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        className="input phone-number-field"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="e.g. 50 123 4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp (Optional)</label>
                    <input
                      type="text"
                      className="input"
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={handleChange}
                      placeholder="e.g. +966501234567"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Google Account Email *</label>
                    <input
                      type="email"
                      className="input"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="yourbusiness@gmail.com"
                      required
                    />
                    <span className="form-tip">We will use this email to request owner verification rights for you.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Website URL (Optional)</label>
                    <input
                      type="url"
                      className="input"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-actions row-gap">
                    <button type="button" onClick={handleBack} className="btn btn-secondary btn-lg">
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button type="button" onClick={handleNext} className="btn btn-primary btn-lg">
                      Next Step <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Operational Details */}
              {step === 4 && (
                <div className="form-step-content">
                  <h3 className="form-step-title">Specify hours and details</h3>
                  <p className="form-step-subtitle">Help customers know exactly when your business is open for sales.</p>

                  <div className="form-group">
                    <label className="form-label">Business Hours</label>
                    <div className="hours-picker-list">
                      {Object.keys(activeHours).map((day) => (
                        <div key={day} className="hours-day-row">
                          <label className="checkbox-wrap">
                            <input
                              type="checkbox"
                              checked={activeHours[day].active}
                              onChange={() => handleHoursToggle(day)}
                            />
                            <span className="day-name">{day}</span>
                          </label>

                          {activeHours[day].active ? (
                            <div className="time-selects">
                              <input
                                type="time"
                                className="time-picker"
                                value={activeHours[day].open}
                                onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                              />
                              <span className="time-separator">to</span>
                              <input
                                type="time"
                                className="time-picker"
                                value={activeHours[day].close}
                                onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                              />
                            </div>
                          ) : (
                            <span className="closed-label">Closed</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Business Description *</label>
                    <textarea
                      className="input"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe what your business does, your values, and special offerings..."
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Services List / Keywords (Comma separated)</label>
                    <input
                      type="text"
                      className="input"
                      name="servicesList"
                      value={form.servicesList}
                      onChange={handleChange}
                      placeholder="e.g. Web Development, Custom Software Development, ERP Installation"
                    />
                  </div>

                  <div className="form-actions row-gap">
                    <button type="button" onClick={handleBack} className="btn btn-secondary btn-lg">
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button type="submit" className="btn btn-primary btn-lg">
                      <Send size={18} /> Submit Application
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Google Maps Realtime Search Preview Card */}
          <div className="gmb-preview-sticky">
            <div className="preview-label-badge">
              <Sparkles size={14} /> Realtime Google Profile Preview
            </div>

            <div className="gmb-mock-card">
              {/* Google Search Mock */}
              <div className="mock-search-header">
                <div className="search-logo">Google</div>
                <div className="search-bar-mock">
                  <Search size={12} className="search-icon" />
                  <span>{form.businessName || 'Your Business Name'}</span>
                </div>
              </div>

              {/* Business Overview Card */}
              <div className="mock-business-card">
                {form.hasPhysicalLocation === 'yes' && (
                  <div className="mock-map-widget">
                    <iframe
                      title="Google Maps Location Preview"
                      width="100%"
                      height="150"
                      style={{ border: 0, borderRadius: '12px', marginBottom: '1.25rem', display: 'block' }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.longitude - 0.008}%2C${form.latitude - 0.004}%2C${form.longitude + 0.008}%2C${form.latitude + 0.004}&layer=mapnik&marker=${form.latitude}%2C${form.longitude}`}
                    />
                    <div className="map-badge-coords">
                      <span>Coordinates: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</span>
                    </div>
                  </div>
                )}

                <div className="mock-card-header">
                  <h4 className="mock-business-title">{form.businessName || 'Your Business Name'}</h4>
                  <p className="mock-business-category">{form.category || 'Software & IT Solutions'}</p>

                  <div className="mock-rating-row">
                    <span className="rating-value">5.0</span>
                    <div className="stars-row">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#F4B400" stroke="#F4B400" />
                      ))}
                    </div>
                    <span className="reviews-count">(99+ Reviews)</span>
                  </div>
                  <span className="mock-verification-pill">
                    <ShieldCheck size={12} /> Verified Profile
                  </span>
                </div>

                {/* Quick Action Buttons */}
                <div className="mock-actions-row">
                  <div className="mock-action-btn">
                    <div className="icon-circle"><Phone size={14} /></div>
                    <span>Call</span>
                  </div>
                  <div className="mock-action-btn">
                    <div className="icon-circle"><Navigation size={14} /></div>
                    <span>Directions</span>
                  </div>
                  <div className="mock-action-btn">
                    <div className="icon-circle"><Globe size={14} /></div>
                    <span>Website</span>
                  </div>
                  <div className="mock-action-btn">
                    <div className="icon-circle"><Heart size={14} /></div>
                    <span>Save</span>
                  </div>
                </div>

                <hr className="mock-divider" />

                {/* Detail Information Fields */}
                <div className="mock-details-list">
                  <div className="mock-detail-item">
                    <MapPin size={14} className="detail-icon" />
                    <span>
                      {form.hasPhysicalLocation === 'yes' ? (
                        <>
                          {form.streetAddress || '123 Business Street'}, {form.city || 'Riyadh'}, {form.country}
                        </>
                      ) : (
                        `Service Area: ${form.serviceAreas || 'Global / Multiple locations'}`
                      )}
                    </span>
                  </div>

                  <div className="mock-detail-item">
                    <Clock size={14} className="detail-icon" />
                    <div className="hours-preview-text">
                      <strong className="text-emerald">Open</strong> · Hours: 09:00 AM - 06:00 PM
                    </div>
                  </div>

                  <div className="mock-detail-item">
                    <Phone size={14} className="detail-icon" />
                    <span>{form.phone ? `${form.phoneCode} ${form.phone}` : 'Add phone number'}</span>
                  </div>

                  {form.website && (
                    <div className="mock-detail-item">
                      <Globe size={14} className="detail-icon" />
                      <span className="text-blue">{form.website}</span>
                    </div>
                  )}
                </div>

                {/* Description Shimmer */}
                <div className="mock-desc-block">
                  <h5>From the business</h5>
                  <p className="mock-desc-text">
                    {form.description || 'Provide your business description to showcase your services and company mission on Google Local Search.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Guidelines Warning Box */}
            <div className="gmb-guidelines-box">
              <h5>Google Guidelines Compliance</h5>
              <ul>
                <li>Your listing matches Google Search & Google Maps specifications.</li>
                <li>Email address will be used to invite ownership.</li>
                <li>Phone number will receive Google SMS verification.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: GMB Value Prop & Features */}
      <section className="gmb-features-section">
        <div className="container">
          <FadeInUp>
            <div className="section-header text-center">
              <span className="section-subtitle">Local Search Dominance</span>
              <h2 className="h2 section-header__title">Complete Google Maps Optimization</h2>
              <p className="body-lg gmb-features-subtitle">
                We optimize every aspect of your Google Business Profile to ensure your business stands out, builds credibility, and dominates local search results.
              </p>
            </div>
          </FadeInUp>

          <div className="gmb-features-grid">
            <FadeInUp delay={0.1}>
              <div className="gmb-feature-card animate-fade-in">
                <div className="gmb-feature-icon-wrapper blue">
                  <Award size={24} />
                </div>
                <h3 className="h4 gmb-feature-title">Google Maps 3-Pack</h3>
                <p className="body-sm gmb-feature-desc">
                  Rank in the coveted top 3 local pack where over 70% of local search clicks happen daily.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.15}>
              <div className="gmb-feature-card animate-fade-in">
                <div className="gmb-feature-icon-wrapper green">
                  <ThumbsUp size={24} />
                </div>
                <h3 className="h4 gmb-feature-title">Review Strategy Setup</h3>
                <p className="body-sm gmb-feature-desc">
                  Implement custom review routing and quick-response templates to multiply five-star rankings.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <div className="gmb-feature-card animate-fade-in">
                <div className="gmb-feature-icon-wrapper red">
                  <Search size={24} />
                </div>
                <h3 className="h4 gmb-feature-title">Local Keyword Targeting</h3>
                <p className="body-sm gmb-feature-desc">
                  Analyze localized search volumes in Riyadh, Jeddah, or global target cities to direct high-intent traffic.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.25}>
              <div className="gmb-feature-card animate-fade-in">
                <div className="gmb-feature-icon-wrapper yellow">
                  <Globe size={24} />
                </div>
                <h3 className="h4 gmb-feature-title">NAP Citation Consistency</h3>
                <p className="body-sm gmb-feature-desc">
                  Register your business details accurately across directories to build trust with Google's ranking algorithm.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.3}>
              <div className="gmb-feature-card animate-fade-in">
                <div className="gmb-feature-icon-wrapper purple">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="h4 gmb-feature-title">Spam & Competitor Clean</h3>
                <p className="body-sm gmb-feature-desc">
                  Audit local map results to identify, report, and delete fake competitor pins that steal your customers.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.35}>
              <div className="gmb-feature-card animate-fade-in">
                <div className="gmb-feature-icon-wrapper orange">
                  <BarChart3 size={24} />
                </div>
                <h3 className="h4 gmb-feature-title">Performance Tracking</h3>
                <p className="body-sm gmb-feature-desc">
                  Receive comprehensive monthly reports showing views, searches, directions request, and phone calls.
                </p>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* SECTION 3: Why GMB Matters (Stats Section) */}
      <section className="gmb-stats-section">
        <div className="container">
          <div className="gmb-stats-layout">
            <FadeInUp className="gmb-stats-content">
              <span className="section-subtitle">Local Impact</span>
              <h2 className="h2 gmb-stats-title">Why Google Maps is Your Highest ROI Sales Channel</h2>
              <p className="body-base gmb-stats-desc">
                Local buyers have immediate purchasing intent. They aren't browsing; they are searching for a solution right now. Optimization places you in front of them exactly when they are ready to buy.
              </p>

              <div className="gmb-stats-grid">
                <div className="gmb-stat-box">
                  <span className="gmb-stat-number text-gradient">88%</span>
                  <span className="gmb-stat-label">Mobile searches for local businesses call or visit within 24 hours.</span>
                </div>
                <div className="gmb-stat-box">
                  <span className="gmb-stat-number text-gradient">4.5x</span>
                  <span className="gmb-stat-label">Average call & inquiry increase after complete profile optimization.</span>
                </div>
                <div className="gmb-stat-box">
                  <span className="gmb-stat-number text-gradient">56%</span>
                  <span className="gmb-stat-label">Of searches result in direct clicks to the website or map directions.</span>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2} className="gmb-comparison-card glass">
              <h3 className="h4 comparison-title">Local SEO vs Organic SEO</h3>
              <div className="comparison-row">
                <div className="comp-item">
                  <span className="comp-label">Local Map Pack</span>
                  <div className="comp-bar-bg"><div className="comp-bar primary-color" style={{ width: '85%' }}>2 - 4 Weeks</div></div>
                </div>
                <div className="comp-item">
                  <span className="comp-label">Traditional SEO</span>
                  <div className="comp-bar-bg"><div className="comp-bar grey-color" style={{ width: '35%' }}>6+ Months</div></div>
                </div>
              </div>
              <ul className="comparison-bullets">
                <li><CheckCircle2 size={16} className="bullet-icon-check" /> Direct phone call and directions triggers.</li>
                <li><CheckCircle2 size={16} className="bullet-icon-check" /> High conversion from mobile users on the go.</li>
                <li><CheckCircle2 size={16} className="bullet-icon-check" /> Saudi local market dominance with Arabic RTL search support.</li>
              </ul>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* SECTION 4: Optimization Process */}
      <section className="gmb-process-section">
        <div className="container">
          <FadeInUp>
            <div className="section-header text-center">
              <span className="section-subtitle">Our Method</span>
              <h2 className="h2 section-header__title">Our 4-Step Optimization Process</h2>
              <p className="body-lg gmb-process-subtitle">
                We make the setup and ranking process smooth, transparent, and compliant with all Google Guidelines.
              </p>
            </div>
          </FadeInUp>

          <div className="gmb-process-grid">
            <FadeInUp delay={0.1} className="gmb-process-card">
              <div className="gmb-process-number">01</div>
              <h3 className="h4 gmb-process-title">Local Audit & Keyword Study</h3>
              <p className="body-sm">
                We analyze your business sector, discover high-converting search volumes, and study competitor strategies.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.15} className="gmb-process-card">
              <div className="gmb-process-number">02</div>
              <h3 className="h4 gmb-process-title">Claiming & Verification</h3>
              <p className="body-sm">
                We handle the setup, verify ownership credentials, and resolve listing suspensions or pending postcard verifications.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.2} className="gmb-process-card">
              <div className="gmb-process-number">03</div>
              <h3 className="h4 gmb-process-title">Profile Enhancement</h3>
              <p className="body-sm">
                We craft an optimized business description, load geo-targeted photos, customize open hours, and align service pages.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.25} className="gmb-process-card">
              <div className="gmb-process-number">04</div>
              <h3 className="h4 gmb-process-title">Rank Tracking & Growth</h3>
              <p className="body-sm">
                We track keywords, monitor local ranking grids, post business updates, and deliver comprehensive monthly audits.
              </p>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQs */}
      <section className="gmb-faq-section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <FadeInUp>
            <div className="section-header text-center">
              <span className="section-subtitle">Got Questions?</span>
              <h2 className="h2 section-header__title">Frequently Asked Questions</h2>
            </div>
          </FadeInUp>

          <div className="gmb-faq-list">
            {[
              {
                q: "What is the Google Maps 3-Pack and why is it important?",
                a: "The Google Maps 3-Pack is the block of three local business listings that appear at the top of Google search results for local queries. Being in the 3-Pack gets your business premium visibility and captures the vast majority of local search clicks."
              },
              {
                q: "Do I need a physical storefront address to list on Google Maps?",
                a: "No. If you deliver services to customers directly or operate online (such as plumbing, consulting, or e-commerce), we can configure you as a 'Service Area Business' without displaying your physical home/office address."
              },
              {
                q: "How long does GMB optimization take to show results?",
                a: "For new listings, it usually takes 2 to 4 weeks after verification for Google's index to crawl and display the location. For existing profiles, optimizations can trigger rank improvement in as little as 7-14 days."
              },
              {
                q: "What is NAP consistency and why is it critical?",
                a: "NAP stands for Name, Address, and Phone. Google compares this data across hundreds of directory websites. If your details mismatch (e.g. different phone number or street name), Google loses trust in your listing and your rank drops. We resolve this for you."
              },
              {
                q: "How do you handle fake competitor reviews or spam listings?",
                a: "We actively audit the Google Maps area for your keywords, identify competitors using spam tactics (fake reviews, keyword stuffing, or multiple fake map pins), and submit official redressal forms to Google to have them removed."
              }
            ].map((faq, i) => (
              <FadeInUp key={i} delay={i * 0.05} className="gmb-faq-card">
                <button
                  type="button"
                  className="gmb-faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', outline: 'none' }}
                >
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} className="gmb-faq-icon" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="gmb-faq-answer" style={{ marginTop: '0.75rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{faq.a}</p>
                </motion.div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>



    </>
  );
}
