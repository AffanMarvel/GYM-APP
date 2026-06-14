import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WorkoutProvider } from './context/WorkoutContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import WorkoutCategories from './pages/WorkoutCategories';
import ExerciseList from './pages/ExerciseList';
import ExerciseDetail from './pages/ExerciseDetail';
import ActiveWorkout from './pages/ActiveWorkout';
import HistoryAndProgress from './pages/HistoryAndProgress';
import AdminPanel from './pages/AdminPanel';
import AllWorkouts from './pages/AllWorkouts';
import Profile from './pages/Profile';

function ProtectedApp() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <WorkoutProvider>
      <div className="min-h-screen max-w-lg mx-auto relative perspective-1000 overflow-hidden shadow-beast-heavy" style={{ background: '#06060d' }}>
        {/* Dynamic Beast Background */}
        <div className="beast-bg-mesh fixed inset-0 pointer-events-none opacity-40" />

        <div className="relative z-10 min-h-screen preserve-3d">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/workout" element={<WorkoutCategories />} />
            <Route path="/workout/:muscle" element={<ExerciseList />} />
            <Route path="/exercise/:id" element={<ExerciseDetail />} />
            <Route path="/active-workout" element={<ActiveWorkout />} />
            <Route path="/history" element={<HistoryAndProgress />} />
            <Route path="/profile" element={<Profile />} />
            {/* Admin only for Affan */}
            <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/" replace />} />
            <Route path="/all-workouts" element={<AllWorkouts />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </WorkoutProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}