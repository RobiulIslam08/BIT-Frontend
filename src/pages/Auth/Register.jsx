// BIT SOFTWARE — Register Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SEOHead } from '@/components/common/SEOHead';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); };

  return (
    <>
      <SEOHead title="Register" description="Create your BIT Software account." />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="card-elevated" style={{ padding: '2.5rem' }}>
          <h1 className="h3" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Create Account</h1>
          <p className="body-sm" style={{ textAlign: 'center', marginBottom: '2rem' }}>Join BIT Software today</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Full Name</label>
              <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Email</label>
              <input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Password</label>
              <input className="input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.375rem', display: 'block' }}>Confirm Password</label>
              <input className="input" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Create Account</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Already have an account? <Link to="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </motion.div>
    </>
  );
}
