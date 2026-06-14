import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkout, formatTime } from '../context/WorkoutContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Weight, LogOut, Flame, Clock, Dumbbell,
  Activity, ChevronLeft, Edit2, Check, X, Shield,
  Database, DownloadCloud, UploadCloud, RefreshCw
} from 'lucide-react';
import { exportUserData, importUserData } from '../firebase/firestoreService';

const NEON = '#818cf8';
const ACCENT = '#a855f7';

function StatCard({ icon, value, label, color }) {
  return (
    <div className="glass-beast rounded-3xl p-5 border-white/5 shadow-beast relative overflow-hidden">
      <div className="absolute top-0 right-0 w-12 h-12 rounded-full -mr-4 -mt-4 blur-xl opacity-20" style={{ background: color }} />
      <div className="w-10 h-10 rounded-2xl glass-beast flex items-center justify-center mb-3" style={{ boxShadow: `0 0 15px ${color}30` }}>
        {icon}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: '#6b7280' }}>{label}</p>
    </div>
  );
}

export default function Profile() {
  const { user, userProfile, logout, saveProfile, isAdmin } = useAuth();
  const { history } = useWorkout();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [tempName, setTempName] = useState(userProfile?.displayName || user?.displayName || '');
  const [tempWeight, setTempWeight] = useState(String(userProfile?.weight || 75));
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Data import/export state
  const [dataStatus, setDataStatus] = useState(null); // null | 'exporting' | 'importing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    if (!user?.uid) return;
    setDataStatus('exporting');
    try {
      const data = await exportUserData(user.uid);
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `gym_tracker_backup_${userProfile?.displayName || 'user'}_${new Date().toISOString().split('T')[0]}.json`;

      // Try Share API first (Capacitor/Mobile-friendly)
      if (navigator.share) {
        try {
          const file = new File([jsonString], fileName, { type: 'application/json' });
          await navigator.share({
            files: [file],
            title: 'Gym Tracker Backup',
            text: 'My workout logs and config cloud backup.'
          });
          setDataStatus(null);
          return;
        } catch (err) {
          if (err.name === 'AbortError') {
            setDataStatus(null);
            return;
          }
        }
      }

      // Browser fallback
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      setDataStatus(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to fetch and package your cloud data.');
      setDataStatus('error');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;
    setDataStatus('importing');
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        await importUserData(user.uid, parsed);
        setDataStatus('success');
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Invalid or corrupt backup JSON file.');
        setDataStatus('error');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the selected backup file.');
      setDataStatus('error');
    };
    reader.readAsText(file);
  };

  // Lifetime stats
  const totalWorkouts = history.length;
  const totalCalories = history.reduce((s, h) => s + (h.totalCalories || 0), 0);
  const totalSeconds = history.reduce((s, h) => s + (h.durationSeconds || 0), 0);
  const totalSets = history.reduce((s, h) => s + (h.totalSets || 0), 0);

  const saveName = async () => {
    if (!tempName.trim()) return;
    setSaving(true);
    await saveProfile({ displayName: tempName.trim() });
    setSaving(false);
    setEditingName(false);
  };

  const saveWeight = async () => {
    const w = parseFloat(tempWeight);
    if (isNaN(w) || w < 20 || w > 300) return;
    setSaving(true);
    await saveProfile({ weight: w });
    setSaving(false);
    setEditingWeight(false);
  };

  return (
    <div className="min-h-screen pb-36">
      <div className="p-5 slide-up max-w-lg mx-auto space-y-7">

        {/* Header */}
        <header className="flex items-center justify-between pt-6">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter">
              MY <span className="text-gym-neon text-glow-beast">PROFILE</span>
            </h1>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Training Identity</p>
          </div>
          {isAdmin && (
            <button onClick={() => navigate('/admin')} className="p-3 glass-beast rounded-2xl border-white/10">
              <Shield size={20} className="text-gym-neon" />
            </button>
          )}
        </header>

        {/* Avatar + Info Card */}
        <div className="glass-beast rounded-[2.5rem] p-7 border-white/5 shadow-beast-heavy relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-3xl -mr-20 -mt-20" style={{ background: 'linear-gradient(135deg, #818cf8, #a855f7)' }} />

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-7">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center font-black text-3xl text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #818cf8, #a855f7)', boxShadow: '0 0 30px rgba(129,140,248,0.3)' }}>
              {(userProfile?.displayName || user?.displayName || 'U')[0].toUpperCase()}
              <div className="absolute inset-0 shimmer-beast opacity-30" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{userProfile?.displayName || user?.displayName || 'Trainer'}</p>
              <p className="text-xs font-medium mt-1" style={{ color: '#6b7280' }}>{user?.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest"
                  style={{ background: 'rgba(129,140,248,0.15)', color: NEON, border: '1px solid rgba(129,140,248,0.25)' }}>
                  <Shield size={8} /> Admin
                </span>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">

            {/* Display Name */}
            <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <User size={16} style={{ color: '#6b7280' }} />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Display Name</p>
                  {editingName ? (
                    <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveName()}
                      className="text-sm font-bold text-white bg-transparent outline-none border-b border-gym-neon/40 mt-0.5 w-36" />
                  ) : (
                    <p className="text-sm font-bold text-white mt-0.5">{userProfile?.displayName || user?.displayName}</p>
                  )}
                </div>
              </div>
              {editingName ? (
                <div className="flex gap-2">
                  <button onClick={saveName} disabled={saving} className="p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                    {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
                  </button>
                  <button onClick={() => setEditingName(false)} className="p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setEditingName(true); setTempName(userProfile?.displayName || user?.displayName || ''); }}
                  className="p-2 rounded-xl opacity-50 hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                  <Edit2 size={15} />
                </button>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Mail size={16} style={{ color: '#6b7280' }} />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Email</p>
                <p className="text-sm font-bold text-white mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Body Weight */}
            <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Body Weight</p>
                  {editingWeight ? (
                    <input autoFocus type="number" value={tempWeight} onChange={e => setTempWeight(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveWeight()}
                      inputMode="decimal" min="20" max="300"
                      className="text-sm font-bold text-white bg-transparent outline-none border-b border-gym-neon/40 mt-0.5 w-20" />
                  ) : (
                    <p className="text-sm font-bold text-white mt-0.5">{userProfile?.weight || 75} kg</p>
                  )}
                </div>
              </div>
              {editingWeight ? (
                <div className="flex gap-2">
                  <button onClick={saveWeight} disabled={saving} className="p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                    {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
                  </button>
                  <button onClick={() => setEditingWeight(false)} className="p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setEditingWeight(true); setTempWeight(String(userProfile?.weight || 75)); }}
                  className="p-2 rounded-xl opacity-50 hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                  <Edit2 size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-2">Lifetime Stats</p>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<Dumbbell size={18} style={{ color: NEON }} />} value={totalWorkouts} label="Workouts" color={NEON} />
            <StatCard icon={<Flame size={18} style={{ color: '#f97316' }} />} value={totalCalories.toLocaleString()} label="Calories Burned" color="#f97316" />
            <StatCard icon={<Clock size={18} style={{ color: '#22d3ee' }} />} value={formatTime(totalSeconds)} label="Total Time" color="#22d3ee" />
            <StatCard icon={<Activity size={18} style={{ color: ACCENT }} />} value={totalSets} label="Total Sets" color={ACCENT} />
          </div>
        </section>

        {/* Data Portal */}
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-2">Data Management</p>
          <div className="glass-beast rounded-[2.5rem] p-7 border-white/5 shadow-beast relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl pointer-events-none" style={{ background: '#22d3ee' }} />
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl glass-beast flex items-center justify-center shrink-0" style={{ boxShadow: '0 0 15px rgba(34,211,238,0.15)' }}>
                <Database size={22} className="text-gym-cyan" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Backup & Recovery</h3>
                <p className="text-[10px] font-medium text-gym-muted mt-1 leading-relaxed">
                  Export your cloud profile, custom exercises, and entire training history to a JSON file, or restore from a previous backup.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={dataStatus !== null}
                className="flex-1 py-4 bg-gym-cyan/10 hover:bg-gym-cyan/20 border border-gym-cyan/25 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <DownloadCloud size={16} className="text-gym-cyan" />
                <span className="text-[9.5px] font-black uppercase tracking-wider text-white">Export JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={dataStatus !== null}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <UploadCloud size={16} className="text-gym-muted" />
                <span className="text-[9.5px] font-black uppercase tracking-wider text-white">Import File</span>
              </button>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest border-2 transition-all active:scale-95 relative overflow-hidden group"
          style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.25)', color: '#ef4444' }}>
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-center gap-3 relative z-10">
            <LogOut size={18} />
            <span>Log Out</span>
          </div>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-end p-5 animate-in fade-in">
          <div className="w-full max-w-lg mx-auto glass-beast-floating rounded-[2.5rem] p-8 border-white/10 shadow-beast-heavy slide-up">
            <p className="text-xl font-black text-white text-center mb-2">Log Out?</p>
            <p className="text-xs text-center mb-8 font-medium" style={{ color: '#6b7280' }}>Your data is saved to the cloud. You can log back in anytime.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-white/60 glass-beast border-white/10 transition-all active:scale-95">
                Cancel
              </button>
              <button onClick={logout}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 8px 20px rgba(239,68,68,0.3)' }}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Status Modal */}
      {dataStatus && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-sm glass-beast-floating rounded-[2.5rem] p-8 border border-white/10 shadow-beast-heavy text-center space-y-6">
            
            {dataStatus === 'exporting' && (
              <>
                <div className="w-16 h-16 rounded-full bg-gym-cyan/15 flex items-center justify-center mx-auto border border-gym-cyan/25 animate-pulse">
                  <DownloadCloud size={28} className="text-gym-cyan" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">Exporting Legacies</h3>
                  <p className="text-xs text-gym-muted">Compiling training telemetry from the cloud...</p>
                </div>
              </>
            )}

            {dataStatus === 'importing' && (
              <>
                <div className="w-16 h-16 rounded-full bg-gym-cyan/15 flex items-center justify-center mx-auto border border-gym-cyan/25">
                  <RefreshCw size={28} className="text-gym-cyan animate-spin" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">Importing Legacy Data</h3>
                  <p className="text-xs text-gym-muted">Merging workouts and cloud variables. Please wait...</p>
                </div>
              </>
            )}

            {dataStatus === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto border border-green-500/25">
                  <Check size={28} className="text-green-400" strokeWidth={3} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">Legacy Sync Success!</h3>
                  <p className="text-xs text-gym-muted">Your backups have been successfully synced with Firestore.</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
                >
                  Reload Application
                </button>
              </>
            )}

            {dataStatus === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto border border-red-500/25">
                  <X size={28} className="text-red-400" strokeWidth={3} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">Import Failed</h3>
                  <p className="text-xs text-red-400 font-semibold">{errorMsg || 'The selected backup file is invalid or corrupted.'}</p>
                </div>
                <button
                  onClick={() => setDataStatus(null)}
                  className="w-full py-3.5 bg-white/5 border border-white/5 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                >
                  Close Window
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
