import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WorkoutProvider } from './context/WorkoutContext';
import BottomNav from './components/BottomNav';

import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import WorkoutCategories from './pages/WorkoutCategories';
import ExerciseList from './pages/ExerciseList';
import ExerciseDetail from './pages/ExerciseDetail';
import ActiveWorkout from './pages/ActiveWorkout';
import HistoryAndProgress from './pages/HistoryAndProgress';

export default function App() {
  return (
    <WorkoutProvider>
      <Router>
        <div className="min-h-screen max-w-lg mx-auto relative bg-gym-dark shadow-2xl overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/workout" element={<WorkoutCategories />} />
            <Route path="/workout/:muscle" element={<ExerciseList />} />
            <Route path="/exercise/:id" element={<ExerciseDetail />} />
            <Route path="/active-workout" element={<ActiveWorkout />} />
            <Route path="/history" element={<HistoryAndProgress />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </WorkoutProvider>
  );
}