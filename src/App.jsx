// src/App.jsx — routes + AuthProvider + protected route guards + lazy loading
import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './hooks/useAuth'
import LoadingScreen from './components/LoadingScreen'
import { useState } from 'react'

const Layout = lazy(() => import('./components/Layout'))
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Subjects = lazy(() => import('./pages/Subjects'))
const Lesson = lazy(() => import('./pages/Lesson'))
const Practice = lazy(() => import('./pages/Practice'))
const Notes = lazy(() => import('./pages/Notes'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const FocusTimer = lazy(() => import('./pages/FocusTimer'))
const MindMap = lazy(() => import('./pages/MindMap'))
const AITutor = lazy(() => import('./pages/AITutor'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const AppBlocker = lazy(() => import('./pages/AppBlocker'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 text-sm font-medium tracking-widest">LOADING V2 CORE...</p>
    </div>
  </div>
)

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <AuthProvider>
      {showSplash ? (
        <LoadingScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected routes — wrapped in RequireAuth */}
            <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="subjects/:id" element={<Subjects />} />
              <Route path="lesson/:id" element={<Lesson />} />
              <Route path="practice" element={<Practice />} />
              <Route path="notes" element={<Notes />} />
              <Route path="flashcards" element={<Flashcards />} />
              <Route path="focus" element={<FocusTimer />} />
              <Route path="mindmap" element={<MindMap />} />
              <Route path="ai-tutor" element={<AITutor />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="app-blocker" element={<AppBlocker />} />
            </Route>
          </Routes>
        </Suspense>
      )}
    </AuthProvider>
  )
}
