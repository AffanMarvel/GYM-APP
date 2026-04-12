import { useState } from 'react';
import { Plus, Search, Trash2, X, Image as ImageIcon, ChevronLeft, AlertCircle, Dumbbell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { getAssetPath } from '../utils/assetPath';

const CATEGORIES = ['chest','back','legs','shoulders','biceps','triceps','abs','cardio','forearms','stretching','warmup'];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { exercises } = useWorkout();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEx, setNewEx] = useState({ name: '', category: 'chest', muscleTarget: '', image: '', instructions: [''] });

  const handleSave = () => {
    if (!newEx.name || !newEx.muscleTarget) return alert('Name and Muscle Target required!');
    const customRaw = localStorage.getItem('gym_custom_exercises');
    const custom = customRaw ? JSON.parse(customRaw) : {};
    if (!custom[newEx.category]) custom[newEx.category] = [];
    custom[newEx.category].push({ ...newEx, id: newEx.name.toLowerCase().replace(/ /g, '-'), instructions: newEx.instructions.filter(i => i.trim()) });
    localStorage.setItem('gym_custom_exercises', JSON.stringify(custom));
    setIsAdding(false);
    setNewEx({ name: '', category: 'chest', muscleTarget: '', image: '', instructions: [''] });
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
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gym-neon/10 border border-gym-neon/20 flex items-center justify-center">
            <Shield size={20} className="text-gym-neon" />
          </div>
        </header>

        <div className="p-4 rounded-2xl bg-gym-accent/10 border border-gym-accent/20 flex items-start gap-3">
          <AlertCircle size={20} className="text-gym-accent shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-gym-accent/80 uppercase tracking-widest leading-relaxed">Custom exercises are stored locally on your device.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gym-muted" size={18} />
            <input type="text" placeholder="Search custom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gym-card border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white text-xs font-bold focus:outline-none" />
          </div>
          <button onClick={() => setIsAdding(true)} className="p-4 bg-gym-neon rounded-2xl text-gym-dark active:scale-95"><Plus size={20} /></button>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1 flex items-center gap-2">
            <Dumbbell size={14} className="text-gym-neon" /> Custom ({customList.length})
          </h2>
          {customList.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
              <Dumbbell size={40} className="mx-auto mb-4 text-gym-muted" />
              <p className="text-xs font-bold uppercase tracking-widest text-gym-muted">No custom exercises yet</p>
            </div>
          ) : customList.map((ex, i) => (
            <div key={i} className="bg-gym-card rounded-2xl border border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gym-dark border border-white/5 overflow-hidden flex items-center justify-center">
                  {ex.image ? <img src={getAssetPath(ex.image)} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gym-muted" />}
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">{ex.name}</h3>
                  <p className="text-[10px] font-bold text-gym-neon uppercase tracking-widest">{ex.category}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(ex.category, ex.id)} className="p-2 text-gym-muted hover:text-gym-danger"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md p-5 flex items-end">
          <div className="w-full max-w-lg mx-auto bg-gym-card rounded-t-3xl border-t border-x border-white/10 p-6 space-y-6 max-h-[90vh] overflow-y-auto slide-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-black text-white">Add Exercise</h2>
              <button onClick={() => setIsAdding(false)} className="text-gym-muted hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" value={newEx.name} onChange={(e) => setNewEx({...newEx, name: e.target.value})}
                className="w-full bg-gym-dark border border-white/10 rounded-xl py-3 px-4 text-white font-bold" placeholder="Exercise Name" />
              <div className="grid grid-cols-2 gap-4">
                <select value={newEx.category} onChange={(e) => setNewEx({...newEx, category: e.target.value})}
                  className="bg-gym-dark border border-white/10 rounded-xl py-3 px-4 text-white font-bold">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" value={newEx.muscleTarget} onChange={(e) => setNewEx({...newEx, muscleTarget: e.target.value})}
                  className="bg-gym-dark border border-white/10 rounded-xl py-3 px-4 text-white font-bold" placeholder="Muscle Target" />
              </div>
              <input type="text" value={newEx.image} onChange={(e) => setNewEx({...newEx, image: e.target.value})}
                className="w-full bg-gym-dark border border-white/10 rounded-xl py-3 px-4 text-white font-bold" placeholder="Image URL (optional)" />
              <button onClick={handleSave} className="w-full py-4 bg-gym-neon text-gym-dark font-black text-sm uppercase tracking-widest rounded-2xl">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
