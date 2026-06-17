// BIT SOFTWARE — Login Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo login
    dispatch(setCredentials({ user: { name: 'Admin', email }, token: 'demo-token' }));
    navigate('/dashboard');
  };

  return (
    <>
      <SEOHead title="Login" description="Sign in to your BIT Software account." />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="card-elevated" style={{ padding: '2.5rem' }}>
          <h1 className="h3" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p className="body-sm" style={{ textAlign: 'center', marginBottom: '2rem' }}>Sign in to your account</p>

          {/* Social Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Google</button>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Facebook</button>
          </div>

          <div className="divider" style={{ margin: '1.5rem 0', textAlign: 'center', position: 'relative' }}>
            <span style={{ background: 'var(--color-surface-elevated)', padding: '0 0.75rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', position: 'relative', zIndex: 1 }}>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input className="input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Sign In</button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Don't have an account? <Link to="/auth/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </>
  );
}
