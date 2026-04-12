import { useWorkout } from '../context/WorkoutContext';
import { 
  Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronRight,
  Dumbbell, Image, FileText, Target, Layers, ArrowLeft,
  Download, Upload, Shield, Database, Check, AlertCircle
} from 'lucide-react';

const NEON = '#818cf8';
const ACCENT = '#a855f7';
const SUCCESS = '#10b981';
const DANGER = '#ef4444';
const WARN = '#f59e0b';
const CARD = '#141425';

const CUSTOM_KEY = 'gym_custom_exercises';

// Muscle group categories
const CATEGORIES = [
  'chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 
  'abs', 'forearms', 'cardio', 'stretching', 'warmup'
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

function loadCustomExercises() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCustomExercises(data) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(data));
}

const emptyExercise = {
  name: '',
  muscle: 'chest',
  muscleTarget: '',
  difficulty: 'intermediate',
  image: '',
  tutorialUrl: '',
  instructions: [''],
  tips: [''],
  levels: {
    beginner: { sets: 3, reps: '12-15', focus: '' },
    intermediate: { sets: 4, reps: '8-12', focus: '' },
    advanced: { sets: 5, reps: '6-8', focus: '' },
  }
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exercises: customExercises, setExercises } = useWorkout();
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null); // null = list view, object = editing
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState(null);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const fileRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Get all custom exercises for a category
  const getExercisesForCategory = (cat) => customExercises[cat] || [];

  // Save exercise
  const handleSave = () => {
    if (!editingExercise?.name?.trim()) {
      showToast('Exercise name is required', 'error');
      return;
    }

    const updated = { ...customExercises };
    const category = editingExercise.muscle;
    if (!updated[category]) updated[category] = [];

    const id = editingExercise.id || editingExercise.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const exercise = { ...editingExercise, id, isCustom: true };
    
    // Clean empty instructions/tips
    exercise.instructions = exercise.instructions.filter(i => i.trim());
    exercise.tips = exercise.tips.filter(t => t.trim());
    if (exercise.instructions.length === 0) exercise.instructions = ['Perform the exercise with proper form.'];
    if (exercise.tips.length === 0) exercise.tips = ['Focus on mind-muscle connection.'];

    // Update Context (which updates local storage via effect)
    const newGlobalExercises = { ...customExercises };
    if (!newGlobalExercises[category]) newGlobalExercises[category] = [];
    
    const existingIndex = newGlobalExercises[category].findIndex(e => e.id === id);
    if (existingIndex >= 0) {
      newGlobalExercises[category][existingIndex] = exercise;
    } else {
      newGlobalExercises[category].push(exercise);
    }

    setExercises(newGlobalExercises);
    
    // Also update the dedicated custom exercises key to keep it clean for merge logic
    const customOnly = JSON.parse(localStorage.getItem('gym_custom_exercises') || '{}');
    if (!customOnly[category]) customOnly[category] = [];
    const coIndex = customOnly[category].findIndex(e => e.id === id);
    if (coIndex >= 0) customOnly[category][coIndex] = exercise;
    else customOnly[category].push(exercise);
    localStorage.setItem('gym_custom_exercises', JSON.stringify(customOnly));

    setEditingExercise(null);
    setIsNew(false);
    showToast(`${exercise.name} saved!`);
  };

  // Delete exercise
  const handleDelete = (category, id) => {
    const updated = { ...customExercises };
    if (updated[category]) {
      updated[category] = updated[category].filter(e => e.id !== id);
    }
    setExercises(updated);

    const customOnly = JSON.parse(localStorage.getItem('gym_custom_exercises') || '{}');
    if (customOnly[category]) {
      customOnly[category] = customOnly[category].filter(e => e.id !== id);
      if (customOnly[category].length === 0) delete customOnly[category];
    }
    localStorage.setItem('gym_custom_exercises', JSON.stringify(customOnly));
    
    showToast('Exercise deleted', 'error');
  };

  // Export all data
  const handleExport = () => {
    const exportData = {
      version: 2,
      exportDate: new Date().toISOString(),
      customExercises: customExercises,
      history: JSON.parse(localStorage.getItem('gym_history') || '[]'),
      goals: JSON.parse(localStorage.getItem('gym_target_goals') || '{}'),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded!');
  };

  // Import data
  const handleImport = (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.customExercises) {
        saveCustomExercises(data.customExercises);
        setCustomExercises(data.customExercises);
      }
      if (data.history) {
        // Merge history — don't overwrite, append unique
        const existing = JSON.parse(localStorage.getItem('gym_history') || '[]');
        const existingKeys = new Set(existing.map(h => `${h.date}_${h.startTime}`));
        const newEntries = data.history.filter(h => !existingKeys.has(`${h.date}_${h.startTime}`));
        localStorage.setItem('gym_history', JSON.stringify([...newEntries, ...existing]));
      }
      if (data.goals) {
        localStorage.setItem('gym_target_goals', JSON.stringify(data.goals));
      }
      setShowImport(false);
      setImportText('');
      showToast('Data imported successfully!');
    } catch (e) {
      showToast('Invalid backup file format', 'error');
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleImport(ev.target.result);
    reader.readAsText(file);
  };

  const totalCustom = Object.values(customExercises).reduce((s, arr) => s + arr.length, 0);

  // ---- RENDER ----

  // Exercise Editor Form
  if (editingExercise) {
    return (
      <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #06060d 0%, #0e0e1a 40%, #0d0a1a 100%)' }}>
        <div className="p-5 slide-up max-w-lg mx-auto space-y-4">
          <header className="flex items-center justify-between pt-2">
            <button onClick={() => { setEditingExercise(null); setIsNew(false); }} className="p-2 rounded-xl active:scale-90" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-lg font-black text-white">{isNew ? 'Add Exercise' : 'Edit Exercise'}</h1>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl font-bold text-xs active:scale-95" style={{ background: `linear-gradient(135deg, ${NEON}, ${ACCENT})`, color: '#fff' }}>
              <Save size={14} className="inline mr-1" /> Save
            </button>
          </header>

          {/* Name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6b7280' }}>Exercise Name *</label>
            <input
              value={editingExercise.name}
              onChange={e => setEditingExercise({ ...editingExercise, name: e.target.value })}
              placeholder="e.g. Barbell Curl"
              className="w-full px-4 py-3 rounded-xl text-base font-bold text-white placeholder:text-gray-600 outline-none"
              style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Category + Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6b7280' }}>Category</label>
              <select
                value={editingExercise.muscle}
                onChange={e => setEditingExercise({ ...editingExercise, muscle: e.target.value })}
                className="w-full px-3 py-3 rounded-xl text-base font-bold text-white outline-none capitalize"
                style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6b7280' }}>Difficulty</label>
              <select
                value={editingExercise.difficulty}
                onChange={e => setEditingExercise({ ...editingExercise, difficulty: e.target.value })}
                className="w-full px-3 py-3 rounded-xl text-base font-bold text-white outline-none capitalize"
                style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {DIFFICULTIES.map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
              </select>
            </div>
          </div>

          {/* Muscle Target */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6b7280' }}>Primary Target Muscle</label>
            <input
              value={editingExercise.muscleTarget}
              onChange={e => setEditingExercise({ ...editingExercise, muscleTarget: e.target.value })}
              placeholder="e.g. Upper Chest, Long Head"
              className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white placeholder:text-gray-600 outline-none"
              style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6b7280' }}>
              <Image size={10} className="inline mr-1" /> Image URL
            </label>
            <input
              value={editingExercise.image}
              onChange={e => setEditingExercise({ ...editingExercise, image: e.target.value })}
              placeholder="/assets/exercises/example.png or https://..."
              className="w-full px-4 py-3 rounded-xl text-xs font-bold text-white placeholder:text-gray-600 outline-none"
              style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Tutorial URL */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6b7280' }}>Tutorial Link</label>
            <input
              value={editingExercise.tutorialUrl}
              onChange={e => setEditingExercise({ ...editingExercise, tutorialUrl: e.target.value })}
              placeholder="https://youtube.com/..."
              className="w-full px-4 py-3 rounded-xl text-xs font-bold text-white placeholder:text-gray-600 outline-none"
              style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Levels */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#6b7280' }}>
              <Layers size={10} className="inline mr-1" /> Sets & Reps by Level
            </label>
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <div key={level} className="flex gap-2 mb-2 items-center">
                <span className="text-[9px] font-bold uppercase w-20 shrink-0 capitalize" style={{ color: NEON }}>{level}</span>
                <input
                  type="number"
                  value={editingExercise.levels[level]?.sets || ''}
                  onChange={e => setEditingExercise({
                    ...editingExercise,
                    levels: { ...editingExercise.levels, [level]: { ...editingExercise.levels[level], sets: parseInt(e.target.value) || 0 } }
                  })}
                  placeholder="Sets"
                  className="w-16 px-2 py-2 rounded-lg text-base font-bold text-white text-center outline-none"
                  style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <input
                  value={editingExercise.levels[level]?.reps || ''}
                  onChange={e => setEditingExercise({
                    ...editingExercise,
                    levels: { ...editingExercise.levels, [level]: { ...editingExercise.levels[level], reps: e.target.value } }
                  })}
                  placeholder="Reps"
                  className="w-20 px-2 py-2 rounded-lg text-base font-bold text-white text-center outline-none"
                  style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <input
                  value={editingExercise.levels[level]?.focus || ''}
                  onChange={e => setEditingExercise({
                    ...editingExercise,
                    levels: { ...editingExercise.levels, [level]: { ...editingExercise.levels[level], focus: e.target.value } }
                  })}
                  placeholder="Focus"
                  className="flex-1 px-2 py-2 rounded-lg text-base font-bold text-white outline-none"
                  style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Instructions</label>
              <button onClick={() => setEditingExercise({ ...editingExercise, instructions: [...editingExercise.instructions, ''] })} className="text-[9px] font-bold uppercase px-2 py-1 rounded-md active:scale-95" style={{ color: NEON, background: 'rgba(129,140,248,0.1)' }}>
                + Step
              </button>
            </div>
            {editingExercise.instructions.map((step, si) => (
              <div key={si} className="flex gap-2 mb-2">
                <span className="text-[10px] font-bold w-5 pt-3 shrink-0" style={{ color: NEON }}>{si + 1}.</span>
                <input
                  value={step}
                  onChange={e => {
                    const inst = [...editingExercise.instructions];
                    inst[si] = e.target.value;
                    setEditingExercise({ ...editingExercise, instructions: inst });
                  }}
                  placeholder={`Step ${si + 1}...`}
                  className="flex-1 px-3 py-2 rounded-lg text-xs text-white outline-none"
                  style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <button onClick={() => {
                  const inst = editingExercise.instructions.filter((_, i) => i !== si);
                  setEditingExercise({ ...editingExercise, instructions: inst.length ? inst : [''] });
                }} className="p-2 rounded-lg active:scale-90" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <X size={12} style={{ color: DANGER }} />
                </button>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Pro Tips</label>
              <button onClick={() => setEditingExercise({ ...editingExercise, tips: [...editingExercise.tips, ''] })} className="text-[9px] font-bold uppercase px-2 py-1 rounded-md active:scale-95" style={{ color: ACCENT, background: 'rgba(168,85,247,0.1)' }}>
                + Tip
              </button>
            </div>
            {editingExercise.tips.map((tip, ti) => (
              <div key={ti} className="flex gap-2 mb-2">
                <span className="text-[10px] pt-3 shrink-0" style={{ color: ACCENT }}>•</span>
                <input
                  value={tip}
                  onChange={e => {
                    const tips = [...editingExercise.tips];
                    tips[ti] = e.target.value;
                    setEditingExercise({ ...editingExercise, tips });
                  }}
                  placeholder={`Tip ${ti + 1}...`}
                  className="flex-1 px-3 py-2 rounded-lg text-xs text-white outline-none"
                  style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <button onClick={() => {
                  const tips = editingExercise.tips.filter((_, i) => i !== ti);
                  setEditingExercise({ ...editingExercise, tips: tips.length ? tips : [''] });
                }} className="p-2 rounded-lg active:scale-90" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <X size={12} style={{ color: DANGER }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- MAIN LIST VIEW ----
  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #06060d 0%, #0e0e1a 40%, #0d0a1a 100%)' }}>
      <div className="p-5 slide-up max-w-lg mx-auto space-y-5">
        
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl active:scale-90" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Shield size={20} style={{ color: NEON }} /> Admin
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Manage Exercises & Data</p>
            </div>
          </div>
        </header>

        {/* Data Management */}
        <div className="rounded-2xl p-4" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Database size={12} style={{ color: NEON }} /> Data Management
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleExport} className="flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform" style={{ background: 'rgba(129,140,248,0.1)', color: NEON, border: '1px solid rgba(129,140,248,0.2)' }}>
              <Download size={14} /> Export Backup
            </button>
            <div>
              <input type="file" ref={fileRef} accept=".json" onChange={handleFileImport} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform" style={{ background: 'rgba(168,85,247,0.1)', color: ACCENT, border: '1px solid rgba(168,85,247,0.2)' }}>
                <Upload size={14} /> Import Backup
              </button>
            </div>
          </div>
          <p className="text-[9px] mt-3" style={{ color: '#6b7280' }}>
            Export saves all history, goals, and custom exercises. Import merges data without overwriting existing history.
          </p>
        </div>

        {/* Add New Exercise Button */}
        <button
          onClick={() => { setEditingExercise({ ...emptyExercise }); setIsNew(true); }}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ background: `linear-gradient(135deg, ${NEON}, ${ACCENT})`, boxShadow: '0 0 25px rgba(129,140,248,0.3)' }}
        >
          <Plus size={18} /> Add New Exercise
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl text-center" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xl font-black text-white">{totalCustom}</p>
            <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: '#6b7280' }}>Custom</p>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xl font-black text-white">{CATEGORIES.length}</p>
            <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: '#6b7280' }}>Categories</p>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xl font-black text-white">{JSON.parse(localStorage.getItem('gym_history') || '[]').length}</p>
            <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: '#6b7280' }}>Sessions</p>
          </div>
        </div>

        {/* Category List */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Categories with Custom Exercises
          </h3>
          {CATEGORIES.map(cat => {
            const exercises = getExercisesForCategory(cat);
            const isExpanded = selectedCategory === cat;

            return (
              <div key={cat} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => setSelectedCategory(isExpanded ? null : cat)}
                  className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Dumbbell size={18} style={{ color: exercises.length > 0 ? NEON : '#6b7280' }} />
                    <span className="text-sm font-bold text-white capitalize">{cat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {exercises.length > 0 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ color: NEON, background: 'rgba(129,140,248,0.1)' }}>
                        {exercises.length}
                      </span>
                    )}
                    {isExpanded ? <ChevronDown size={16} style={{ color: '#6b7280' }} /> : <ChevronRight size={16} style={{ color: '#6b7280' }} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {exercises.length === 0 ? (
                      <p className="text-xs italic py-3 text-center" style={{ color: '#6b7280' }}>
                        No custom exercises yet. Click "Add New Exercise" above.
                      </p>
                    ) : (
                      exercises.map(ex => (
                        <div key={ex.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="flex items-center gap-3 min-w-0">
                            {ex.image ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                <img src={ex.image} alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(129,140,248,0.1)' }}>
                                <Dumbbell size={16} style={{ color: NEON }} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{ex.name}</p>
                              <p className="text-[9px]" style={{ color: '#6b7280' }}>{ex.muscleTarget || cat}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => { setEditingExercise({ ...emptyExercise, ...ex }); setIsNew(false); }} className="p-2 rounded-lg active:scale-90" style={{ background: 'rgba(129,140,248,0.1)' }}>
                              <Edit3 size={14} style={{ color: NEON }} />
                            </button>
                            <button onClick={() => handleDelete(cat, ex.id)} className="p-2 rounded-lg active:scale-90" style={{ background: 'rgba(239,68,68,0.1)' }}>
                              <Trash2 size={14} style={{ color: DANGER }} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl animate-bounce" style={{ background: toast.type === 'error' ? DANGER : `linear-gradient(135deg, ${NEON}, ${ACCENT})`, color: '#fff' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
