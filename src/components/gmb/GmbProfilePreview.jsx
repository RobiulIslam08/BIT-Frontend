// ============================================
// BIT SOFTWARE — Google Business Profile Preview (mock UI)
// ============================================
import { useState } from 'react';
import {
  Search, Star, ShieldCheck, Phone, Navigation, Globe, Heart,
  MapPin, Clock,
} from 'lucide-react';
import './GmbProfilePreview.css';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const JS_DAY_TO_KEY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getHoursLine(businessHours) {
  if (!businessHours || typeof businessHours !== 'object') {
    return { openLabel: 'Hours', detail: 'Add business hours' };
  }

  const todayKey = JS_DAY_TO_KEY[new Date().getDay()];
  const today = businessHours[todayKey];

  if (today?.active && today.open && today.close) {
    return {
      openLabel: 'Open',
      detail: `Hours: ${today.open} – ${today.close}`,
    };
  }

  if (today && today.active === false) {
    const next = DAY_ORDER.find((d) => businessHours[d]?.active);
    if (next) {
      const h = businessHours[next];
      return {
        openLabel: 'Closed',
        detail: `Opens ${next} ${h.open}`,
        closed: true,
      };
    }
    return { openLabel: 'Closed', detail: 'No open hours set', closed: true };
  }

  const firstActive = DAY_ORDER.find((d) => businessHours[d]?.active);
  if (firstActive) {
    const h = businessHours[firstActive];
    return {
      openLabel: 'Hours',
      detail: `${firstActive}: ${h.open} – ${h.close}`,
    };
  }

  return { openLabel: 'Hours', detail: 'Add business hours' };
}

/**
 * @param {object} props
 * @param {object} props.profile — business fields (form or saved profile)
 * @param {boolean} [props.showBadge=true]
 * @param {boolean} [props.showMapControls=true]
 */
export default function GmbProfilePreview({
  profile = {},
  showBadge = true,
  showMapControls = true,
}) {
  const [mapZoom, setMapZoom] = useState(15);
  const hours = getHoursLine(profile.businessHours);
  const hasCoords =
    profile.hasPhysicalLocation === 'yes' &&
    typeof profile.latitude === 'number' &&
    typeof profile.longitude === 'number' &&
    !Number.isNaN(profile.latitude) &&
    !Number.isNaN(profile.longitude);

  const phoneDisplay = profile.phone
    ? profile.phone
    : profile.phoneCode
      ? `${profile.phoneCode} ${profile.phoneNumber || ''}`.trim()
      : 'Add phone number';

  return (
    <div className="gmb-profile-preview">
      {showBadge && (
        <div className="gmb-profile-preview__badge">
          Google Profile Preview
        </div>
      )}

      <div className="gmb-mock-card">
        <div className="mock-search-header">
          <div className="search-logo">Google</div>
          <div className="search-bar-mock">
            <Search size={12} className="search-icon" />
            <span>{profile.businessName || 'Your Business Name'}</span>
          </div>
        </div>

        <div className="mock-search-tabs">
          <span className="tab-item is-active">Overview</span>
          <span className="tab-item">Services</span>
          <span className="tab-item">Reviews</span>
          <span className="tab-item">About</span>
        </div>

        <div className="mock-business-card">
          {hasCoords && (
            <div className="mock-map-widget">
              <div className="mock-map-container">
                <iframe
                  title="Google Maps Location Preview"
                  width="100%"
                  height="170"
                  style={{ border: 0, borderRadius: '12px', display: 'block' }}
                  src={`https://maps.google.com/maps?q=${profile.latitude},${profile.longitude}&z=${mapZoom}&output=embed`}
                />
                {showMapControls && (
                  <div className="map-zoom-btn-group">
                    <button
                      type="button"
                      onClick={() => setMapZoom((z) => Math.min(z + 1, 20))}
                      className="map-zoom-btn"
                      title="Zoom In"
                      aria-label="Zoom In"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapZoom((z) => Math.max(z - 1, 1))}
                      className="map-zoom-btn"
                      title="Zoom Out"
                      aria-label="Zoom Out"
                    >
                      −
                    </button>
                  </div>
                )}
              </div>
              <div className="map-badge-coords">
                <span>
                  Coordinates: {Number(profile.latitude).toFixed(5)}, {Number(profile.longitude).toFixed(5)}
                </span>
              </div>
            </div>
          )}

          <div className="mock-card-header">
            <h4 className="mock-business-title">{profile.businessName || 'Your Business Name'}</h4>
            <p className="mock-business-category">{profile.category || 'Business Category'}</p>

            <div className="mock-rating-row">
              <span className="rating-value">5.0</span>
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#F4B400" stroke="#F4B400" />
                ))}
              </div>
              <span className="reviews-count">(Preview)</span>
            </div>
            <span className="mock-verification-pill">
              <ShieldCheck size={12} /> Verified Profile
            </span>
          </div>

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

          <div className="mock-details-list">
            <div className="mock-detail-item">
              <MapPin size={14} className="detail-icon" />
              <span>
                {profile.hasPhysicalLocation === 'yes' ? (
                  <>
                    {profile.streetAddress || 'Street address'}, {profile.city || 'City'}
                    {profile.country ? `, ${profile.country}` : ''}
                  </>
                ) : (
                  `Service Area: ${profile.serviceAreas || 'Multiple locations'}`
                )}
              </span>
            </div>

            <div className="mock-detail-item">
              <Clock size={14} className="detail-icon" />
              <div className="hours-preview-text">
                <strong className={hours.closed ? 'text-rose' : 'text-emerald'}>{hours.openLabel}</strong>
                {' · '}
                {hours.detail}
              </div>
            </div>

            <div className="mock-detail-item">
              <Phone size={14} className="detail-icon" />
              <span>{phoneDisplay}</span>
            </div>

            {profile.website && (
              <div className="mock-detail-item">
                <Globe size={14} className="detail-icon" />
                <span className="text-blue">{profile.website}</span>
              </div>
            )}
          </div>

          <div className="mock-desc-block">
            <h5>From the business</h5>
            <p className="mock-desc-text">
              {profile.description ||
                'Provide your business description to showcase your services on Google Local Search.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
