import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-900 dark:text-slate-100 font-display">
      <Navbar />
      <main className="pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
