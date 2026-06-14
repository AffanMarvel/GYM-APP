import { useState } from 'react';
import { signUpWithEmail, signInWithEmail, SIGNUP_KEY, getAuthErrorMessage } from '../firebase/authService';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Eye, EyeOff, Dumbbell, AlertCircle, User, Weight, Key, ChevronRight } from 'lucide-react';

const NEON = '#818cf8';
const ACCENT = '#a855f7';

function InputField({ icon: Icon, type, value, onChange, placeholder, label, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#6b7280' }}>{label}</label>
      <div className="relative">
        <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
        <input
          type={isPassword && !show ? 'password' : isPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full pl-11 pr-12 py-[14px] rounded-2xl text-sm font-semibold text-white placeholder:text-gray-600 outline-none transition-all"
          style={{
            background: 'rgba(20,20,37,0.8)',
            border: `2px solid ${value ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.06)'}`,
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: '#9ca3af' }}>
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('login');  // 'login' | 'signup'

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupWeight, setSignupWeight] = useState('');
  const [signupKey, setSignupKey] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
      // AuthContext listener will handle state update
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirm || !signupWeight || !signupKey) {
      setError('Please fill in all fields.');
      return;
    }
    if (signupKey !== SIGNUP_KEY) {
      setError('Invalid signup key. Please get the key from the admin.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const weight = parseFloat(signupWeight);
    if (isNaN(weight) || weight < 20 || weight > 300) {
      setError('Please enter a valid weight (20–300 kg).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUpWithEmail(signupEmail, signupPassword, signupName, weight);
      // AuthContext listener will handle state update
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-12 pb-10 px-6 overflow-y-auto" style={{ background: 'linear-gradient(160deg, #06060d 0%, #0d0a1a 50%, #06060d 100%)' }}>
      {/* Ambient blobs */}
      <div className="fixed top-0 left-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
      <div className="fixed bottom-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-5 relative" style={{ background: 'linear-gradient(135deg, #818cf8, #a855f7)', boxShadow: '0 0 40px rgba(129,140,248,0.35), 0 0 80px rgba(129,140,248,0.1)' }}>
            <Dumbbell size={34} className="text-white" />
            <div className="absolute inset-0 rounded-[1.5rem] shimmer-beast opacity-40" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Train <span style={{ color: NEON, textShadow: '0 0 20px rgba(129,140,248,0.5)' }}>Hard</span>
          </h1>
          <p className="text-xs mt-1.5 font-medium" style={{ color: '#6b7280' }}>
            {tab === 'login' ? 'Welcome back. Log in to continue.' : 'Create your training account.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1.5 mb-7 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['login', 'signup'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
              style={{
                background: tab === t ? 'linear-gradient(135deg, #818cf8, #a855f7)' : 'transparent',
                color: tab === t ? 'white' : '#6b7280',
                boxShadow: tab === t ? '0 4px 15px rgba(129,140,248,0.3)' : 'none',
              }}>
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl mb-5 text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.18)' }}>
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── LOGIN FORM ─────────────────────────────────────── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <InputField icon={User} type="text" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setError(''); }} placeholder="Affan  or  you@example.com" label="Username or Email" autoComplete="username" />
            <InputField icon={Lock} type="password" value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setError(''); }} placeholder="Your password" label="Password" autoComplete="current-password" />

            <button type="submit" disabled={loading}
              className="w-full py-4 mt-2 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-[0.97] disabled:opacity-50 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #818cf8, #a855f7)', boxShadow: '0 8px 25px rgba(129,140,248,0.35)' }}>
              <div className="absolute inset-0 shimmer-beast opacity-30" />
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <Lock size={15} />
                  <span>Login</span>
                </div>
              )}
            </button>

            <p className="text-center text-xs pt-2" style={{ color: '#4b5563' }}>
              Don't have an account?{' '}
              <button type="button" onClick={() => setTab('signup')} style={{ color: NEON }} className="font-bold">Sign up</button>
            </p>
          </form>
        )}

        {/* ─── SIGNUP FORM ────────────────────────────────────── */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <InputField icon={User} type="text" value={signupName} onChange={e => { setSignupName(e.target.value); setError(''); }} placeholder="Your name" label="Display Name" autoComplete="name" />
            <InputField icon={Mail} type="email" value={signupEmail} onChange={e => { setSignupEmail(e.target.value); setError(''); }} placeholder="you@example.com" label="Email" autoComplete="email" />
            <InputField icon={Lock} type="password" value={signupPassword} onChange={e => { setSignupPassword(e.target.value); setError(''); }} placeholder="Min 6 characters" label="Password" autoComplete="new-password" />
            <InputField icon={Lock} type="password" value={signupConfirm} onChange={e => { setSignupConfirm(e.target.value); setError(''); }} placeholder="Repeat password" label="Confirm Password" autoComplete="new-password" />

            {/* Weight */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#6b7280' }}>Body Weight (kg)</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>
                <input type="number" value={signupWeight} onChange={e => { setSignupWeight(e.target.value); setError(''); }} placeholder="e.g. 75"
                  inputMode="decimal" min="20" max="300"
                  className="w-full pl-11 pr-4 py-[14px] rounded-2xl text-sm font-semibold text-white placeholder:text-gray-600 outline-none transition-all"
                  style={{ background: 'rgba(20,20,37,0.8)', border: `2px solid ${signupWeight ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.06)'}` }} />
              </div>
              <p className="text-[9px] mt-1.5 px-1" style={{ color: '#4b5563' }}>Used to calculate accurate calorie burn</p>
            </div>

            {/* Signup Key */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#6b7280' }}>Signup Key</label>
              <div className="relative">
                <Key size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
                <input type="password" value={signupKey} onChange={e => { setSignupKey(e.target.value); setError(''); }} placeholder="Enter the signup key"
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-[14px] rounded-2xl text-sm font-semibold text-white placeholder:text-gray-600 outline-none transition-all"
                  style={{ background: 'rgba(20,20,37,0.8)', border: `2px solid ${signupKey ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.06)'}` }} />
              </div>
              <p className="text-[9px] mt-1.5 px-1 flex items-center gap-1" style={{ color: '#4b5563' }}>
                <Shield size={10} /> Get the key from the admin to register
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 mt-2 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-[0.97] disabled:opacity-50 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #818cf8, #a855f7)', boxShadow: '0 8px 25px rgba(129,140,248,0.35)' }}>
              <div className="absolute inset-0 shimmer-beast opacity-30" />
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <ChevronRight size={15} />
                  <span>Create Account</span>
                </div>
              )}
            </button>

            <p className="text-center text-xs pt-2" style={{ color: '#4b5563' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => setTab('login')} style={{ color: NEON }} className="font-bold">Login</button>
            </p>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <Shield size={12} style={{ color: '#374151' }} />
          <p className="text-[10px]" style={{ color: '#374151' }}>Secured with Firebase Authentication</p>
        </div>
      </div>
    </div>
  );
}
