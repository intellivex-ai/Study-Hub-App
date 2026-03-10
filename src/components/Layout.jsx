import { useRef, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import NavigationProgress, { PageTransitionWrapper } from './NavigationProgress'

export default function Layout() {
  const location = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    // Premium fade in/up with blur every time the location changes
    gsap.fromTo(mainRef.current,
      { opacity: 0, y: 12, filter: 'blur(4px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' }
    )
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-900 dark:text-slate-100 font-display">
      <NavigationProgress />
      <Navbar />
      <main ref={mainRef} className="pb-32 pt-4">
        <PageTransitionWrapper>
          <Outlet />
        </PageTransitionWrapper>
      </main>
      <BottomNav />
    </div>
  )
}
