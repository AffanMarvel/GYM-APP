import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { ChevronLeft, Plus, PlayCircle, Info, Zap, Target, HelpCircle, Trophy, Activity, Flame, TrendingUp } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exercises, addToPlan, history = [] } = useWorkout();
  const [exercise, setExercise] = useState(null);
  const [activeTab, setActiveTab] = useState('instructions');

  useEffect(() => {
    let found = null;
    Object.values(exercises).forEach(cat => {
      const ex = cat.find(e => e.id === id);
      if (ex) found = ex;
    });
    setExercise(found);
  }, [id, exercises]);

  const [chartMetric, setChartMetric] = useState('maxWeight');

  // Compute history for the specific exercise
  const exerciseHistory = useMemo(() => {
    if (!exercise) return [];
    const data = [];
    [...history].reverse().forEach(session => {
      const exLog = session.logs?.find(log => log.id === id || log.name?.toLowerCase() === exercise.name?.toLowerCase());
      if (exLog && exLog.sets && exLog.sets.length > 0) {
        const weights = exLog.sets.map(s => Number(s.weight) || 0);
        const reps = exLog.sets.map(s => Number(s.reps) || 0);
        const maxWeight = Math.max(...weights);
        const maxReps = Math.max(...reps);
        const totalVolume = exLog.sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        
        const oneRepMaxes = exLog.sets.map(s => {
          const w = Number(s.weight) || 0;
          const r = Number(s.reps) || 0;
          if (r <= 1) return w;
          return Math.round(w * (1 + r / 30));
        });
        const max1RM = Math.max(...oneRepMaxes, 0);

        let dateLabel = session.date;
        try {
          const parts = session.date.split('/');
          if (parts.length >= 2) {
            dateLabel = `${parts[1]}/${parts[0]}`;
          } else {
            const d = new Date(session.date);
            if (!isNaN(d.getTime())) {
              dateLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
          }
        } catch (e) {
          // ignore
        }

        data.push({
          date: dateLabel,
          timestamp: session.id || new Date(session.date).getTime(),
          maxWeight,
          maxReps,
          max1RM,
          volume: totalVolume,
        });
      }
    });
    return data.sort((a, b) => a.timestamp - b.timestamp);
  }, [history, id, exercise]);

  const prStats = useMemo(() => {
    if (exerciseHistory.length === 0) return { maxWeight: 0, maxReps: 0, maxVolume: 0, max1RM: 0 };
    return {
      maxWeight: Math.max(...exerciseHistory.map(d => d.maxWeight)),
      maxReps: Math.max(...exerciseHistory.map(d => d.maxReps)),
      maxVolume: Math.max(...exerciseHistory.map(d => d.volume)),
      max1RM: Math.max(...exerciseHistory.map(d => d.max1RM)),
    };
  }, [exerciseHistory]);

  if (!exercise) return <div className="p-10 text-center text-white">Exercise not found</div>;

  return (
    <div className="min-h-screen pb-32" style={{ background: '#06060d' }}>
      {/* Hero Image Section */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img src={getAssetPath(exercise.image)} alt={exercise.name} className="w-full h-full object-cover sm:object-contain bg-black/40"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06060d] via-transparent to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl active:scale-90 transition-all">
          <ChevronLeft size={22} />
        </button>
        
        {exercise.tutorialUrl && (
          <a href={exercise.tutorialUrl} target="_blank" rel="noopener noreferrer" 
            className="absolute bottom-6 right-6 p-4 bg-gym-neon text-gym-dark rounded-2xl shadow-lg shadow-gym-neon/30 active:scale-95 transition-all flex items-center gap-2">
            <PlayCircle size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-widest">Tutorial</span>
          </a>
        )}
      </div>

      <div className="px-6 -mt-10 relative z-10 space-y-8">
        {/* Title & Difficulty Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gym-neon/10 text-gym-neon text-[9px] font-black uppercase rounded-lg border border-gym-neon/20 tracking-widest">
              {exercise.category || exercise.muscle}
            </span>
            {exercise.difficulty && (
              <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border tracking-widest ${
                exercise.difficulty === 'beginner' ? 'bg-gym-cyan/10 text-gym-cyan border-gym-cyan/20' :
                exercise.difficulty === 'intermediate' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {exercise.difficulty}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">{exercise.name}</h1>
          <div className="flex items-center gap-2 text-gym-muted">
            <Target size={14} className="text-gym-neon opacity-70" />
            <p className="text-xs font-bold uppercase tracking-wider">{exercise.muscleTarget}</p>
          </div>
        </div>

        {/* Action Button */}
        <button onClick={() => addToPlan(exercise)}
          className="w-full py-5 bg-gradient-to-r from-gym-neon to-[#a5b4fc] text-gym-dark font-black text-sm uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-gym-neon/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
          <Plus size={22} strokeWidth={3} /> Add To Workout
        </button>

        {/* Progression Levels / Recommended Volume */}
        {exercise.levels && (
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 px-1">
              <Zap size={14} className="text-gym-neon" /> Recommended Progression
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
              {Object.entries(exercise.levels).map(([level, data]) => (
                <div key={level} className="min-w-[160px] flex-1 p-4 bg-[#141425] rounded-3xl border border-white/5 space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gym-neon/80">{level}</p>
                  <div>
                    <p className="text-xl font-black text-white">{data.sets}x{data.reps}</p>
                    <p className="text-[9px] font-bold text-gym-muted mt-1 uppercase truncate">{data.focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabbed Content: Instructions & Tips */}
        <div className="space-y-6">
          <div className="flex gap-8 border-b border-white/5">
            <button onClick={() => setActiveTab('instructions')}
              className={`text-[10px] font-black uppercase tracking-widest pb-3 relative transition-colors ${activeTab === 'instructions' ? 'text-white' : 'text-gym-muted'}`}>
              Theories
              {activeTab === 'instructions' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gym-neon rounded-full" />}
            </button>
            <button onClick={() => setActiveTab('tips')}
              className={`text-[10px] font-black uppercase tracking-widest pb-3 relative transition-colors ${activeTab === 'tips' ? 'text-white' : 'text-gym-muted'}`}>
              Pro Tips
              {activeTab === 'tips' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gym-neon rounded-full" />}
            </button>
            <button onClick={() => setActiveTab('progress')}
              className={`text-[10px] font-black uppercase tracking-widest pb-3 relative transition-colors ${activeTab === 'progress' ? 'text-white' : 'text-gym-muted'}`}>
              Progression
              {activeTab === 'progress' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gym-neon rounded-full" />}
            </button>
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'progress' ? (
              <div className="space-y-6 animate-fade-in">
                {exerciseHistory.length > 0 ? (
                  <>
                    {/* PR Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Max Weight', val: `${prStats.maxWeight} kg`, icon: <Trophy size={16} className="text-gym-neon" />, bg: 'bg-gym-neon/5 border-gym-neon/10' },
                        { label: 'Max Reps', val: `${prStats.maxReps} reps`, icon: <Activity size={16} className="text-gym-cyan" />, bg: 'bg-gym-cyan/5 border-gym-cyan/10' },
                        { label: 'Est. 1-Rep Max', val: `${prStats.max1RM} kg`, icon: <Flame size={16} className="text-gym-fire" />, bg: 'bg-gym-fire/5 border-gym-fire/10' },
                        { label: 'Peak Volume', val: `${prStats.maxVolume} kg`, icon: <TrendingUp size={16} className="text-gym-gold" />, bg: 'bg-gym-gold/5 border-gym-gold/10' },
                      ].map((item, i) => (
                        <div key={i} className={`p-4 rounded-2xl border ${item.bg} flex items-center justify-between`}>
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gym-muted/80">{item.label}</p>
                            <p className="text-lg font-black text-white mt-1">{item.val}</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.03]">
                            {item.icon}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Metric Selector */}
                    <div className="glass-beast p-1 rounded-2xl border-white/5 flex">
                      {[
                        { id: 'maxWeight', label: 'Max Weight' },
                        { id: 'max1RM', label: 'Est. 1RM' },
                        { id: 'volume', label: 'Volume' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setChartMetric(m.id)}
                          className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                            chartMetric === m.id ? 'bg-gym-neon text-gym-dark shadow-md font-black' : 'text-gym-muted hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Progression Chart */}
                    <div className="glass-beast p-5 rounded-3xl border-white/5 shadow-beast h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={exerciseHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={8} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={8} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{ background: '#141425', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                            labelStyle={{ color: '#818cf8', fontWeight: 'bold', fontSize: '10px' }}
                            itemStyle={{ color: '#fff', fontSize: '10px' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey={chartMetric} 
                            name={chartMetric === 'maxWeight' ? 'Max Weight (kg)' : chartMetric === 'max1RM' ? 'Est. 1RM (kg)' : 'Volume (kg)'}
                            stroke="#818cf8" 
                            strokeWidth={3} 
                            dot={{ fill: '#818cf8', strokeWidth: 2, r: 4 }} 
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#22d3ee' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="p-10 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10 space-y-4">
                    <Trophy size={40} className="mx-auto text-gym-muted opacity-25" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white uppercase tracking-wider">No progression data</p>
                      <p className="text-[10px] font-bold text-gym-muted leading-relaxed uppercase">
                        Complete this exercise in a logged workout to generate progression telemetry.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'instructions' ? (
              <ul className="space-y-4">
                {(exercise.instructions || []).map((step, i) => (
                  <li key={i} className="flex gap-4 p-5 bg-[#141425]/50 rounded-3xl border border-white/[0.03] group hover:border-gym-neon/30 transition-all">
                    <span className="text-gym-neon font-black text-xs opacity-30 group-hover:opacity-100 transition-opacity pt-1">0{i + 1}</span>
                    <p className="text-sm font-medium text-white/80 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-4">
                {(exercise.tips && exercise.tips.length > 0) ? (
                  exercise.tips.map((tip, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-gym-neon/5 rounded-3xl border border-gym-neon/10">
                      <Zap size={18} className="text-gym-neon shrink-0 mt-1" />
                      <p className="text-sm font-bold text-gym-neon/90 leading-relaxed italic">"{tip}"</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <HelpCircle size={32} className="mx-auto text-gym-muted opacity-30 mb-3" />
                    <p className="text-xs font-bold text-gym-muted uppercase tracking-widest">No expert tips logged yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
