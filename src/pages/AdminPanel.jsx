import { useState, useRef } from 'react';
import { Plus, Search, Trash2, X, Image as ImageIcon, ChevronLeft, AlertCircle, Dumbbell, Shield, Download, Upload, Clock, RotateCcw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { getAssetPath } from '../utils/assetPath';

const CATEGORIES = ['chest','back','legs','shoulders','biceps','triceps','abs','cardio','forearms','stretching','warmup'];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { exercises } = useWorkout();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEx, setNewEx] = useState({ 
    name: '', 
    category: 'chest', 
    muscleTarget: '', 
    image: '', 
    difficulty: 'beginner',
    tutorialUrl: '',
    instructions: [''],
    tips: ['']
  });

  const fileInputRef = useRef(null);

  const handleSave = () => {
    if (!newEx.name || !newEx.muscleTarget) return alert('Name and Muscle Target required!');
    const customRaw = localStorage.getItem('gym_custom_exercises');
    const custom = customRaw ? JSON.parse(customRaw) : {};
    if (!custom[newEx.category]) custom[newEx.category] = [];
    
    // Clean up empty instructions and tips
    const cleanEx = {
      ...newEx,
      id: newEx.name.toLowerCase().replace(/ /g, '-'),
      instructions: newEx.instructions.filter(i => i.trim()),
      tips: newEx.tips.filter(t => t.trim())
    };

    custom[newEx.category].push(cleanEx);
    localStorage.setItem('gym_custom_exercises', JSON.stringify(custom));
    setIsAdding(false);
    setNewEx({ name: '', category: 'chest', muscleTarget: '', image: '', difficulty: 'beginner', tutorialUrl: '', instructions: [''], tips: [''] });
    window.location.reload();
  };

  const handleDelete = (category, id) => {
    if (!window.confirm('Delete this custom exercise?')) return;
    const customRaw = localStorage.getItem('gym_custom_exercises');
    const custom = customRaw ? JSON.parse(customRaw) : {};
    if (custom[category]) {
      custom[category] = custom[category].filter(e => e.id !== id);
      localStorage.setItem('gym_custom_exercises', JSON.stringify(custom));
      window.location.reload();
    }
  };
// ... rest of the component logic stays similar ...

  // --- Internal Backup History System (Android Friendly) ---
  const getBackups = () => {
    const raw = localStorage.getItem('gym_backups');
    return raw ? JSON.parse(raw) : [];
  };

  const createBackup = () => {
    const currentData = {
      timestamp: new Date().getTime(),
      label: new Date().toLocaleString(),
      payload: {
        history: localStorage.getItem('gym_history'),
        goals: localStorage.getItem('gym_goals'),
        custom: localStorage.getItem('gym_custom_exercises'),
        plan: localStorage.getItem('gym_active_plan'),
        session: localStorage.getItem('gym_active_session')
      }
    };
    
    const backups = getBackups();
    // Keep only last 7 backups to save storage
    const updatedBackups = [currentData, ...backups].slice(0, 7);
    localStorage.setItem('gym_backups', JSON.stringify(updatedBackups));
    alert('System state captured in backup history!');
    window.location.reload();
  };

  const restoreBackup = (backup) => {
    if (!window.confirm(`Restore data from ${backup.label}? Current data will be overwritten.`)) return;
    
    const { payload } = backup;
    if (payload.history) localStorage.setItem('gym_history', payload.history);
    if (payload.goals) localStorage.setItem('gym_goals', payload.goals);
    if (payload.custom) localStorage.setItem('gym_custom_exercises', payload.custom);
    if (payload.plan) localStorage.setItem('gym_active_plan', payload.plan);
    if (payload.session) {
      localStorage.setItem('gym_active_session', payload.session);
    } else {
      localStorage.removeItem('gym_active_session');
    }
    
    alert('Data restored successfully!');
    window.location.reload();
  };

  const deleteBackup = (timestamp) => {
    const backups = getBackups().filter(b => b.timestamp !== timestamp);
    localStorage.setItem('gym_backups', JSON.stringify(backups));
    window.location.reload();
  };

  const backups = getBackups();

  const customRaw = localStorage.getItem('gym_custom_exercises');
  const customData = customRaw ? JSON.parse(customRaw) : {};
  const customList = [];
  Object.keys(customData).forEach(cat => {
    customData[cat].forEach(ex => {
      if (ex.name.toLowerCase().includes(searchTerm.toLowerCase())) customList.push({ ...ex, category: cat });
    });
  });

  return (
    <div className="min-h-screen bg-[#06060d] pb-28">
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/')} className="p-2.5 bg-gym-card rounded-xl border border-white/5">
              <ChevronLeft size={22} className="text-white" />
            </button>
            <h1 className="text-2xl font-black text-white">Admin Module</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gym-neon/10 border border-gym-neon/20 flex items-center justify-center">
            <Shield size={20} className="text-gym-neon" />
          </div>
        </header>

        {/* New Android-Friendly Backup Timeline */}
        <div className="p-5 rounded-3xl bg-gym-card border border-white/5 space-y-4">
           <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
             <Clock size={14} className="text-gym-neon" /> System Snapshots
           </h2>
           <p className="text-xs font-medium text-gym-muted">Backups are stored internally. Create a snapshot before making big changes or to save your previous day's history.</p>
           
           <button onClick={createBackup} className="w-full py-4 bg-gym-neon/10 hover:bg-gym-neon/20 rounded-2xl border border-gym-neon/20 flex items-center justify-center gap-2 transition-all group">
             <Plus size={18} className="text-gym-neon group-hover:rotate-90 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white">Capture Current State</span>
           </button>

           {backups.length > 0 && (
             <div className="space-y-2 pt-2">
               {backups.map((b) => (
                 <div key={b.timestamp} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between gap-3 group">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-gym-dark flex items-center justify-center">
                       <RotateCcw size={14} className="text-gym-cyan" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-white leading-none">{b.label.split(',')[0]}</p>
                       <p className="text-[8px] font-bold text-gym-muted uppercase mt-1 tracking-tighter">{b.label.split(',')[1]}</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => restoreBackup(b)} className="px-3 py-1.5 bg-gym-cyan/10 text-gym-cyan text-[8px] font-bold uppercase rounded-lg border border-gym-cyan/20">Restore</button>
                     <button onClick={() => deleteBackup(b.timestamp)} className="p-1.5 text-gym-danger hover:bg-gym-danger/10 rounded-lg"><Trash2 size={14} /></button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gym-muted" size={18} />
            <input type="text" placeholder="Search custom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gym-card border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white text-xs font-bold focus:outline-none" />
          </div>
          <button onClick={() => setIsAdding(true)} className="p-4 bg-gym-neon rounded-2xl text-gym-dark active:scale-95 shadow-[0_0_15px_rgba(129,140,248,0.3)]">
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1 flex items-center gap-2">
            <Dumbbell size={14} className="text-gym-neon" /> Custom Library ({customList.length})
          </h2>
          {customList.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
              <Dumbbell size={40} className="mx-auto mb-4 text-gym-muted" />
              <p className="text-xs font-bold uppercase tracking-widest text-gym-muted">No custom exercises yet</p>
            </div>
          ) : customList.map((ex, i) => (
            <div key={i} className="bg-gym-card rounded-2xl border border-white/5 p-4 flex flex-col gap-3 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gym-dark border border-white/5 overflow-hidden flex items-center justify-center relative">
                    {ex.image ? <img src={getAssetPath(ex.image)} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gym-muted relative z-10" />}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">{ex.name}</h3>
                    <p className="text-[10px] font-bold text-gym-neon uppercase tracking-widest">{ex.category}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(ex.category, ex.id)} className="p-2.5 bg-white/5 rounded-xl text-gym-muted hover:text-gym-danger hover:bg-gym-danger/10 transition-colors"><Trash2 size={16} /></button>
              </div>
              
              {/* Added Detail Expansion in UI */}
              <div className="bg-gym-dark/50 p-3 rounded-xl border border-white/[0.02]">
                <p className="text-[10px] font-bold text-gym-muted/80">{ex.instructions?.length || 0} Theory Steps Logged</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md p-5 flex items-end">
          <div className="w-full max-w-lg mx-auto bg-gym-card rounded-t-3xl border-t border-x border-white/10 p-6 space-y-6 max-h-[90vh] overflow-y-auto slide-up scrollbar-hide">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 sticky top-0 bg-gym-card z-10 pt-2">
              <div>
                <h2 className="text-xl font-black text-white">Advanced Builder</h2>
                <p className="text-[10px] text-gym-muted font-bold tracking-widest uppercase">Forge new exercises</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-gym-dark rounded-full text-gym-muted hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gym-neon">Core Details</label>
                <input type="text" value={newEx.name} onChange={(e) => setNewEx({...newEx, name: e.target.value})}
                  className="w-full bg-gym-dark border border-white/10 rounded-xl py-3.5 px-4 text-white font-bold" placeholder="Exercise Name (e.g. Incline Press)" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={newEx.category} onChange={(e) => setNewEx({...newEx, category: e.target.value})}
                    className="bg-gym-dark border border-white/10 rounded-xl py-3.5 px-4 text-white font-bold">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newEx.difficulty} onChange={(e) => setNewEx({...newEx, difficulty: e.target.value})}
                    className="bg-gym-dark border border-white/10 rounded-xl py-3.5 px-4 text-white font-bold">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert / Advanced</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={newEx.muscleTarget} onChange={(e) => setNewEx({...newEx, muscleTarget: e.target.value})}
                    className="bg-gym-dark border border-white/10 rounded-xl py-3.5 px-4 text-white font-bold" placeholder="Target (e.g. Upper Chest)" />
                  <input type="text" value={newEx.tutorialUrl} onChange={(e) => setNewEx({...newEx, tutorialUrl: e.target.value})}
                    className="bg-gym-dark border border-white/10 rounded-xl py-3.5 px-4 text-white font-bold" placeholder="YouTube URL (optional)" />
                </div>
                <input type="text" value={newEx.image} onChange={(e) => setNewEx({...newEx, image: e.target.value})}
                  className="w-full bg-gym-dark border border-white/10 rounded-xl py-3.5 px-4 text-white font-bold" placeholder="Reference Image URL (optional)" />
              </div>

              {/* Dynamic Theories System */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase text-gym-neon tracking-widest">Execution Theories</label>
                {newEx.instructions.map((inst, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-12 flex items-center justify-center font-black text-gym-muted/40">{idx + 1}</div>
                    <textarea 
                      value={inst} 
                      onChange={(e) => {
                        const newInst = [...newEx.instructions];
                        newInst[idx] = e.target.value;
                        setNewEx({...newEx, instructions: newInst});
                      }}
                      className="flex-1 bg-gym-dark border border-white/10 rounded-xl p-3 text-white text-xs leading-relaxed font-medium min-h-[60px]"
                      placeholder={`Step ${idx + 1} technique...`}
                    />
                    <button onClick={() => {
                        const newInst = newEx.instructions.filter((_, i) => i !== idx);
                        setNewEx({...newEx, instructions: newInst});
                      }} className="text-gym-danger/50 hover:text-gym-danger self-start mt-3">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button onClick={() => setNewEx({...newEx, instructions: [...newEx.instructions, '']})} 
                  className="w-full py-3 border border-dashed border-white/10 text-white/40 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-gym-neon hover:border-gym-neon transition-all">
                  + Add Theory Step
                </button>
              </div>

              {/* Dynamic Tips System */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black uppercase text-gym-cyan tracking-widest">Expert Pro Tips</label>
                {newEx.tips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-10 flex items-center justify-center font-black text-gym-muted/20"><Zap size={14} /></div>
                    <input type="text"
                      value={tip} 
                      onChange={(e) => {
                        const newTips = [...newEx.tips];
                        newTips[idx] = e.target.value;
                        setNewEx({...newEx, tips: newTips});
                      }}
                      className="flex-1 bg-gym-dark border border-white/10 rounded-xl px-4 text-white text-xs font-medium"
                      placeholder="Pro Tip (e.g. Keep spine neutral)"
                    />
                    <button onClick={() => {
                        const newTips = newEx.tips.filter((_, i) => i !== idx);
                        setNewEx({...newEx, tips: newTips});
                      }} className="text-gym-danger/50 hover:text-gym-danger self-center">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button onClick={() => setNewEx({...newEx, tips: [...newEx.tips, '']})} 
                  className="w-full py-3 border border-dashed border-white/10 text-white/40 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-gym-cyan hover:border-gym-cyan transition-all">
                  + Add Pro Tip
                </button>
              </div>

              <button onClick={handleSave} className="w-full py-5 bg-gradient-to-r from-gym-neon to-gym-accent text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-[0_0_20px_rgba(129,140,248,0.3)] mt-6 active:scale-95 transition-all">
                Publish Master Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
