// src/App.jsx — routes + AuthProvider + protected route guards
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './hooks/useAuth'
import Layout    from './components/Layout'
import Login     from './pages/Login'
import SignUp    from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Subjects  from './pages/Subjects'
import Lesson    from './pages/Lesson'
import Practice  from './pages/Practice'
import Notes     from './pages/Notes'
import Flashcards from './pages/Flashcards'
import FocusTimer from './pages/FocusTimer'
import MindMap   from './pages/MindMap'
import AITutor   from './pages/AITutor'
import Analytics from './pages/Analytics'
import Profile   from './pages/Profile'
import Settings  from './pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/"       element={<Navigate to="/login" replace />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes — wrapped in RequireAuth */}
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="subjects"    element={<Subjects />} />
          <Route path="subjects/:id" element={<Subjects />} />
          <Route path="lesson/:id"  element={<Lesson />} />
          <Route path="practice"    element={<Practice />} />
          <Route path="notes"       element={<Notes />} />
          <Route path="flashcards"  element={<Flashcards />} />
          <Route path="focus"       element={<FocusTimer />} />
          <Route path="mindmap"     element={<MindMap />} />
          <Route path="ai-tutor"    element={<AITutor />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="profile"     element={<Profile />} />
          <Route path="settings"    element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
