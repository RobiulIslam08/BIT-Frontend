// ============================================
// BIT SOFTWARE — Profile Edit (Add / Update Info)
// ============================================
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User, Building2, Briefcase, Mail, Phone, PhoneCall,
  MapPin, Globe, Save, ArrowLeft, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { selectCurrentUser, updateUser } from '@/features/auth/authSlice';
import { updateProfile } from '@/api/userApi';

const buildInitialForm = (user) => ({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  organization: user?.organization || '',
  jobTitle: user?.jobTitle || '',
  phone: user?.phone || '',
  alternatePhone: user?.alternatePhone || '',
  address1: user?.address1 || '',
  address2: user?.address2 || '',
  city: user?.city || '',
  stateProvince: user?.stateProvince || '',
  postalCode: user?.postalCode || '',
  country: user?.country || '',
});

const labelStyle = {
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  display: 'block',
  marginBottom: '0.3rem',
};

const inputStyle = { padding: '0.625rem 0.875rem', fontSize: 'var(--text-sm)' };

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label style={labelStyle}>
      {Icon && <Icon size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />}
      {label}
    </label>
    {children}
  </div>
);

export default function ProfileEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const [form, setForm] = useState(() => buildInitialForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    // Only send non-empty trimmed values.
    const payload = {};
    Object.entries(form).forEach(([key, value]) => {
      const trimmed = typeof value === 'string' ? value.trim() : value;
      if (trimmed) payload[key] = trimmed;
    });

    // Keep display name in sync with first/last name.
    const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim();
    if (fullName) payload.name = fullName;

    try {
      const res = await updateProfile(payload);
      if (res?.success) {
        dispatch(updateUser(res.data));
        setSuccess('Profile updated successfully.');
        setTimeout(() => navigate('/my-account'), 700);
      } else {
        setError(res?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SEOHead title="Edit Profile" description="Add and update your account information." />

      <div style={{ maxWidth: '860px' }}>
        <Link
          to="/my-account"
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={14} /> Back to Profile
        </Link>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="h4">Edit Profile</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
            Add or update your personal, contact, and address information.
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
          </div>
        )}
        {success && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16a34a', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> {success}
          </div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
        >
          {/* ─── Personal Information ─── */}
          <div className="card-elevated" style={{ marginBottom: '1.25rem' }}>
            <h2 className="h5" style={{ marginBottom: '1rem' }}>Personal Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <Field label="First Name" icon={User}>
                <input type="text" className="input" style={inputStyle} value={form.firstName} onChange={handleChange('firstName')} placeholder="First name" />
              </Field>
              <Field label="Last Name" icon={User}>
                <input type="text" className="input" style={inputStyle} value={form.lastName} onChange={handleChange('lastName')} placeholder="Last name" />
              </Field>
              <Field label="Organization" icon={Building2}>
                <input type="text" className="input" style={inputStyle} value={form.organization} onChange={handleChange('organization')} placeholder="Company / Organization" />
              </Field>
              <Field label="Job Title" icon={Briefcase}>
                <input type="text" className="input" style={inputStyle} value={form.jobTitle} onChange={handleChange('jobTitle')} placeholder="Job title" />
              </Field>
            </div>
          </div>

          {/* ─── Contact Information ─── */}
          <div className="card-elevated" style={{ marginBottom: '1.25rem' }}>
            <h2 className="h5" style={{ marginBottom: '1rem' }}>Contact Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <Field label="Email Address" icon={Mail}>
                <input type="email" className="input" style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} value={user?.email || ''} readOnly disabled title="Email cannot be changed here" />
              </Field>
              <Field label="Phone" icon={Phone}>
                <input type="tel" className="input" style={inputStyle} value={form.phone} onChange={handleChange('phone')} placeholder="+880 1XXX XXXXXX" />
              </Field>
              <Field label="Alternate Phone" icon={PhoneCall}>
                <input type="tel" className="input" style={inputStyle} value={form.alternatePhone} onChange={handleChange('alternatePhone')} placeholder="Optional" />
              </Field>
            </div>
          </div>

          {/* ─── Address ─── */}
          <div className="card-elevated" style={{ marginBottom: '1.5rem' }}>
            <h2 className="h5" style={{ marginBottom: '1rem' }}>Address</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <Field label="Address Line 1" icon={MapPin}>
                <input type="text" className="input" style={inputStyle} value={form.address1} onChange={handleChange('address1')} placeholder="Street address" />
              </Field>
              <Field label="Address Line 2" icon={MapPin}>
                <input type="text" className="input" style={inputStyle} value={form.address2} onChange={handleChange('address2')} placeholder="Apartment, suite, etc. (optional)" />
              </Field>
              <Field label="City" icon={MapPin}>
                <input type="text" className="input" style={inputStyle} value={form.city} onChange={handleChange('city')} placeholder="City" />
              </Field>
              <Field label="State / Province" icon={MapPin}>
                <input type="text" className="input" style={inputStyle} value={form.stateProvince} onChange={handleChange('stateProvince')} placeholder="State / Province" />
              </Field>
              <Field label="Zip / Postal Code" icon={MapPin}>
                <input type="text" className="input" style={inputStyle} value={form.postalCode} onChange={handleChange('postalCode')} placeholder="Postal code" />
              </Field>
              <Field label="Country" icon={Globe}>
                <input type="text" className="input" style={inputStyle} value={form.country} onChange={handleChange('country')} placeholder="Country" />
              </Field>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Link to="/my-account" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.form>
      </div>
    </>
  );
}
