import { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Edit2, Save, X, Image as ImageIcon,
  ChevronLeft, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'chest', 'back', 'legs', 'shoulders', 'biceps', 
  'triceps', 'abs', 'cardio', 'forearms', 'stretching', 'warmup'
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('gym_custom_exercises');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [newEx, setNewEx] = useState({
    name: '',
    category: 'chest',
    muscleTarget: '',
    image: '',
    instructions: ['']
  });

  const handleSave = () => {
    if (!newEx.name) return;
    const updated = { ...exercises };
    if (!updated[newEx.category]) updated[newEx.category] = [];
    updated[newEx.category].push({ ...newEx, id: Date.now().toString() });
    setExercises(updated);
    localStorage.setItem('gym_custom_exercises', JSON.stringify(updated));
    setIsAdding(false);
  };

  const handleDelete = (category, id) => {
    const updated = { ...exercises };
    updated[category] = updated[category].filter(e => e.id !== id);
    setExercises(updated);
    localStorage.setItem('gym_custom_exercises', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#06060d] pb-28 p-5">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-gym-card rounded-xl border border-white/5">
          <ChevronLeft size={22} className="text-white" />
        </button>
        <h1 className="text-2xl font-black text-white">Admin</h1>
      </header>

      <button onClick={() => setIsAdding(true)} className="w-full py-4 bg-gym-neon text-gym-dark font-black rounded-2xl mb-6">
        Add Custom Exercise +
      </button>

      {/* Simplified List Display */}
      {Object.keys(exercises).map(cat => (
        <div key={cat} className="mb-6">
          <h2 className="text-xs font-black text-gym-muted uppercase mb-3">{cat}</h2>
          <div className="space-y-2">
            {exercises[cat].map(ex => (
              <div key={ex.id} className="bg-gym-card p-4 rounded-xl flex justify-between">
                <p className="text-white text-sm">{ex.name}</p>
                <button onClick={() => handleDelete(cat, ex.id)} className="text-gym-danger"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
