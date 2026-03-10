import { useRef, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

export default function Layout() {
  const location = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    // Fade in/up every time the location changes
    gsap.fromTo(mainRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    )
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-900 dark:text-slate-100 font-display">
      <Navbar />
      <main ref={mainRef} className="pb-32 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
