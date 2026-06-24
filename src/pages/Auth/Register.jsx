// ============================================
// BIT SOFTWARE — Register Page
// Real API integration with backend
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { authApi } from '@/api/authApi';
import { toast } from '@/components/common/Toast/Toast';
import { useGoogleLogin } from '@react-oauth/google';

// SVG Official Icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(''); // typing শুরু করলে error clear হবে
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const token = tokenResponse.access_token;
      const res = await authApi.googleVerify(token);
      const { data } = res.data; // { accessToken, user }

      setSuccess('Account logged in successfully with Google! Redirecting...');
      toast.success('Registration/Login successful! Welcome.');

      dispatch(
        setCredentials({
          user: data.user,
          token: data.accessToken,
        })
      );

      setTimeout(() => {
        const redirectTo = data.user.role === 'admin' ? '/dashboard' : '/';
        navigate(redirectTo, { replace: true });
      }, 1000);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Google login failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      toast.error('Google Sign-In was cancelled or failed.');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (form.password !== form.confirmPassword) {
      const msg = 'Passwords do not match. Please try again.';
      setError(msg);
      toast.warning(msg);
      return;
    }

    if (form.password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setError(msg);
      toast.warning(msg);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        // role default 'user' হবে backend এ
      };

      const res = await authApi.register(payload);
      const { data } = res.data; // { accessToken, user }

      const successMsg = 'Account created successfully! Redirecting...';
      setSuccess(successMsg);
      toast.success('Registration successful! Welcome.');

      // Redux store এবং localStorage এ credentials সেট করা
      dispatch(
        setCredentials({
          user: data.user,
          token: data.accessToken,
          // refreshToken cookie-তে set হয়ে যাবে backend থেকে
        })
      );

      // Registration এর পর role অনুযায়ী redirect
      setTimeout(() => {
        const redirectTo = data.user.role === 'admin' ? '/dashboard' : '/';
        navigate(redirectTo, { replace: true });
      }, 1000);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errorSources?.[0]?.message ||
        'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Register" description="Create your BIT Software account and start building." />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="card-elevated" style={{ padding: '2.5rem 2rem', width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-primary-muted)',
              border: '1px solid var(--color-primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--color-primary)',
            }}>
              <UserPlus size={22} />
            </div>
            <h1 className="h3" style={{ fontWeight: 800 }}>Create Account</h1>
            <p className="body-sm" style={{ marginTop: '0.375rem', color: 'var(--color-text-secondary)' }}>
              Join BIT Software and start managing your projects
            </p>
          </div>

          {/* Social Auth Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              disabled={isLoading}
              className="btn btn-secondary btn-md"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 'var(--text-xs)', opacity: isLoading ? 0.7 : 1 }}
            >
              <GoogleIcon /> Google
            </button>
            {/* <button
              type="button"
              className="btn btn-secondary btn-md"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 'var(--text-xs)' }}
            >
              <FacebookIcon /> Facebook
            </button> */}
          </div>

          {/* Separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.75rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>or sign up with email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: 'var(--text-sm)',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                color: '#22c55e',
                fontSize: 'var(--text-sm)',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              {success}
            </motion.div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  className="input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  disabled={isLoading}
                  minLength={2}
                  maxLength={100}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  className="input"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  className="input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  disabled={isLoading}
                  minLength={6}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  className="input"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password match indicator */}
              {form.confirmPassword && (
                <p style={{
                  marginTop: '0.375rem',
                  fontSize: 'var(--text-xs)',
                  color: form.password === form.confirmPassword ? '#22c55e' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  {form.password === form.confirmPassword ? (
                    <><CheckCircle size={12} /> Passwords match</>
                  ) : (
                    <><AlertCircle size={12} /> Passwords do not match</>
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.6s linear infinite',
                    marginRight: '8px',
                  }} />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </>
              )}
            </button>
          </form>

          {/* Login Redirect */}
          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
