import { useState, useRef } from 'react';
import { Plus, Search, Trash2, X, Image as ImageIcon, ChevronLeft, AlertCircle, Dumbbell, Shield, Zap, Share2, Upload, DownloadCloud, Check, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { getAssetPath } from '../utils/assetPath';
import { exportUserData, importUserData } from '../firebase/firestoreService';

const CATEGORIES = ['chest','back','legs','shoulders','biceps','triceps','abs','cardio','forearms','stretching','warmup'];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { customExercises, addCustomExercise, deleteCustomExercise } = useWorkout();
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom modals/errors states
  const [deletingEx, setDeletingEx] = useState(null); // null | { category, id, name }
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [dataStatus, setDataStatus] = useState(null); // null | 'exporting' | 'importing' | 'success' | 'error'
  const [fileErrorMsg, setFileErrorMsg] = useState('');

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

  const handleSave = async () => {
    if (!newEx.name || !newEx.muscleTarget) {
      setErrorMsg('Name and Muscle Target required!');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      await addCustomExercise(newEx);
      setIsAdding(false);
      setNewEx({ name: '', category: 'chest', muscleTarget: '', image: '', difficulty: 'beginner', tutorialUrl: '', instructions: [''], tips: [''] });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save custom exercise to cloud.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingEx) return;
    try {
      await deleteCustomExercise(deletingEx.category, deletingEx.id);
      setDeletingEx(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileExport = async () => {
    if (!user?.uid) return;
    setDataStatus('exporting');
    setFileErrorMsg('');
    try {
      const data = await exportUserData(user.uid);
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `gym_backup_${new Date().toISOString().split('T')[0]}.json`;

      if (navigator.share) {
        try {
          const file = new File([jsonString], fileName, { type: 'application/json' });
          await navigator.share({
            files: [file],
            title: 'Gym Tracker Backup',
            text: 'My workout data backup file.'
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
      setFileErrorMsg('Failed to package cloud data.');
      setDataStatus('error');
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;
    setDataStatus('importing');
    setFileErrorMsg('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        await importUserData(user.uid, parsed);
        setDataStatus('success');
      } catch (err) {
        console.error(err);
        setFileErrorMsg(err.message || 'Invalid or corrupt backup JSON file.');
        setDataStatus('error');
      }
    };
    reader.onerror = () => {
      setFileErrorMsg('Failed to read the selected backup file.');
      setDataStatus('error');
    };
    reader.readAsText(file);
  };

  const customList = [];
  Object.keys(customExercises || {}).forEach(cat => {
    (customExercises[cat] || []).forEach(ex => {
      if (ex.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        customList.push({ ...ex, category: cat });
      }
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

        {/* Global Transfer Section (Cross-Device Cloud Sync) */}
        <div className="p-5 rounded-3xl bg-gym-card border border-white/5 space-y-4">
           <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
             <Share2 size={14} className="text-gym-neon" /> Cloud Backup Transfer
           </h2>
           <p className="text-[10px] font-medium text-gym-muted">Export your cloud backup or import legacy data (support both localStorage and firestore formats).</p>
           
           <div className="flex gap-3">
             <button onClick={handleFileExport} className="flex-1 py-4 bg-gym-neon/10 hover:bg-gym-neon/20 rounded-2xl border border-gym-neon/20 flex flex-col items-center justify-center gap-2 transition-all group active:scale-95">
               <Share2 size={20} className="text-gym-neon group-hover:scale-110 transition-transform" />
               <span className="text-[9px] font-black uppercase tracking-widest text-white">Share Backup</span>
             </button>
             
             <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 transition-all group active:scale-95">
               <Upload size={20} className="text-gym-muted group-hover:text-white transition-colors" />
               <span className="text-[9px] font-black uppercase tracking-widest text-white">Import File</span>
             </button>
             <input type="file" accept=".json" onChange={handleFileImport} ref={fileInputRef} className="hidden" />
           </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gym-muted" size={18} />
            <input type="text" placeholder="Search custom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gym-card border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white text-xs font-bold focus:outline-none" />
          </div>
          <button onClick={() => { setIsAdding(true); setErrorMsg(''); }} className="p-4 bg-gym-neon rounded-2xl text-gym-dark active:scale-95 shadow-[0_0_15px_rgba(129,140,248,0.3)]">
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
            <div key={ex.id || i} className="bg-gym-card rounded-2xl border border-white/5 p-4 flex flex-col gap-3 group">
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
                <button onClick={() => setDeletingEx({ category: ex.category, id: ex.id, name: ex.name })} className="p-2.5 bg-white/5 rounded-xl text-gym-muted hover:text-gym-danger hover:bg-gym-danger/10 transition-colors"><Trash2 size={16} /></button>
              </div>
              
              <div className="bg-gym-dark/50 p-3 rounded-xl border border-white/[0.02]">
                <p className="text-[10px] font-bold text-gym-muted/80">{ex.instructions?.length || 0} Theory Steps Logged</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Builder Drawer Modal */}
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
              {errorMsg && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.18)' }}>
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

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

              <button onClick={handleSave} disabled={saving} className="w-full py-5 bg-gradient-to-r from-gym-neon to-gym-accent text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-[0_0_20px_rgba(129,140,248,0.3)] mt-6 active:scale-95 transition-all flex items-center justify-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />}
                <span>Publish Master Exercise</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Custom Exercise Confirmation Modal */}
      {deletingEx && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end p-5 animate-in fade-in">
          <div className="w-full max-w-lg mx-auto glass-beast-floating rounded-[2.5rem] p-8 border border-white/10 shadow-beast-heavy slide-up">
            <div className="w-16 h-16 rounded-full bg-gym-danger/15 flex items-center justify-center mx-auto border border-gym-danger/25 mb-4 animate-pulse">
              <Trash2 size={28} className="text-gym-danger" />
            </div>
            <p className="text-xl font-black text-white text-center mb-2">Delete Custom Exercise?</p>
            <p className="text-xs text-center mb-8 font-medium text-gym-muted">Are you sure you want to delete "{deletingEx.name}"? This will remove it from all training libraries.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingEx(null)}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-white/60 glass-beast border-white/10 transition-all active:scale-95">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 8px 20px rgba(239,68,68,0.3)' }}>
                Delete
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
                  <h3 className="text-lg font-black text-white">Exporting Backup</h3>
                  <p className="text-xs text-gym-muted">Compiling cloud data...</p>
                </div>
              </>
            )}

            {dataStatus === 'importing' && (
              <>
                <div className="w-16 h-16 rounded-full bg-gym-cyan/15 flex items-center justify-center mx-auto border border-gym-cyan/25">
                  <RefreshCw size={28} className="text-gym-cyan animate-spin" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">Importing Backup File</h3>
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
                  <h3 className="text-lg font-black text-white">Import Success!</h3>
                  <p className="text-xs text-gym-muted">Your database has been successfully restored.</p>
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
                  <h3 className="text-lg font-black text-white">Sync Failed</h3>
                  <p className="text-xs text-red-400 font-semibold">{fileErrorMsg || 'The selected backup file is invalid.'}</p>
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
