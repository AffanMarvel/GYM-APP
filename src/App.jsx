import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function ProtectedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <WorkoutProvider>
      <div className="min-h-screen max-w-lg mx-auto relative shadow-2xl overflow-x-hidden" style={{ background: '#06060d' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/workout" element={<WorkoutCategories />} />
          <Route path="/workout/:muscle" element={<ExerciseList />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
          <Route path="/active-workout" element={<ActiveWorkout />} />
          <Route path="/history" element={<HistoryAndProgress />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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