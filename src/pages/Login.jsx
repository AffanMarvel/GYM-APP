import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, Eye, EyeOff, Dumbbell, AlertCircle } from 'lucide-react';

const NEON = '#818cf8';
const ACCENT = '#a855f7';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    
    const result = await login(username, password);
    
    if (!result.success) {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #06060d 0%, #0e0e1a 40%, #0d0a1a 100%)' }}>
      <div className="w-full max-w-sm slide-up">
        
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5" style={{ background: `linear-gradient(135deg, ${NEON}, ${ACCENT})`, boxShadow: `0 0 40px rgba(129,140,248,0.3)` }}>
            <Dumbbell size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Train <span style={{ color: NEON, textShadow: '0 0 15px rgba(129,140,248,0.6)' }}>Hard</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: '#6b7280' }}>Secure Login Required</p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-xl mx-auto w-fit" style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)' }}>
          <Shield size={14} style={{ color: NEON }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: NEON }}>SHA-256 Encrypted</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#6b7280' }}>Username</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter username"
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold text-white placeholder:text-gray-600 outline-none transition-all"
                style={{ background: '#141425', border: `2px solid ${username ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.05)'}` }}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#6b7280' }}>Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                className="w-full pl-12 pr-12 py-4 rounded-2xl text-sm font-bold text-white placeholder:text-gray-600 outline-none transition-all"
                style={{ background: '#141425', border: `2px solid ${password ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.05)'}` }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: '#6b7280' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${NEON}, ${ACCENT})`, boxShadow: '0 0 25px rgba(129,140,248,0.3)' }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Lock size={16} />
                <span>Login</span>
              </div>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-8 text-[10px]" style={{ color: '#4b5563' }}>
          Protected with end-to-end encryption
        </p>
      </div>
    </div>
  );
}
