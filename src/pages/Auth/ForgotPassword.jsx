// ============================================
// BIT SOFTWARE — Forgot Password Page
// OTP-based recovery and reset
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Key, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { authApi } from '@/api/authApi';
import { toast } from '@/components/common/Toast/Toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      const successMsg = res.data?.message || 'OTP sent successfully to your email.';
      setSuccess(successMsg);
      toast.success(successMsg);
      // Move to step 2 after a brief delay
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 1500);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errorSources?.[0]?.message ||
        'Failed to send OTP. Please check your email and try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.warning(msg);
      return;
    }

    if (newPassword.length < 6) {
      const msg = 'Password must be at least 6 characters';
      setError(msg);
      toast.warning(msg);
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.resetPassword(email, otp, newPassword);
      const successMsg = res.data?.message || 'Password reset successful!';
      setSuccess(successMsg);
      toast.success(successMsg);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/auth/login', { replace: true });
      }, 2000);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errorSources?.[0]?.message ||
        'Password reset failed. Please check the OTP and try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead 
        title={step === 1 ? "Forgot Password" : "Reset Password"} 
        description="Reset your BIT Software password using verification code." 
      />
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
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
              {step === 1 ? <Key size={22} /> : <Lock size={22} />}
            </div>
            <h1 className="h3" style={{ fontWeight: 800 }}>
              {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </h1>
            <p className="body-sm" style={{ marginTop: '0.375rem', color: 'var(--color-text-secondary)' }}>
              {step === 1 
                ? 'Enter your email to receive an OTP verification code' 
                : `Enter the code sent to ${email} and your new password`}
            </p>
          </div>

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
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: 'var(--text-sm)',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              {success}
            </motion.div>
          )}

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

          {/* Step 1: Send OTP Form */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    disabled={isLoading}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
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
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send OTP <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verification and Reset Password Form */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    className="input"
                    type="email"
                    value={email}
                    disabled
                    style={{ paddingLeft: '2.5rem', opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Verification Code (OTP)</label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    className="input"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    required
                    disabled={isLoading}
                    style={{ paddingLeft: '2.5rem', letterSpacing: otp ? '4px' : 'normal', fontWeight: otp ? '700' : 'normal' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
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

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                </div>
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
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
                disabled={isLoading}
                style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ArrowLeft size={16} /> Resend OTP
              </button>
            </form>
          )}

          {/* Back to Login Redirect */}
          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            <Link to="/auth/login" style={{ color: 'var(--color-text-muted)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              <ArrowLeft size={14} /> Back to Sign In
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
