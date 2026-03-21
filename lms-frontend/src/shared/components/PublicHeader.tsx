
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../hooks/redux'

type Props = {
  hideBanner?: boolean
  forceSolid?: boolean
}

export default function PublicHeader({ hideBanner, forceSolid }: Props) {
  const [scrolledDown, setScrolledDown] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useAppSelector((s) => s.auth.user)
  const navigate = useNavigate()

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY || window.pageYOffset
      // Keep header colored once scrolled past 30px regardless of scroll direction
      setScrolledDown(y > 30)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Header - Transparent -> becomes primary when scrolling down */}
      <header className={`header-one w-full fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${(scrolledDown || forceSolid) ? 'bg-primary' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4 cursor-pointer">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <img src="/images/logo-white.png" alt="Recent" className="h-10" />
              </Link>
            </div>
            <div className="lg:hidden">
              <button
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileOpen((s) => !s)}
                className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
              >
                {mobileOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
            <nav className="hidden lg:flex gap-4">
              <NavLink to="/" end className={({isActive}) => `px-1 py-2 font-medium transition ${isActive ? 'text-yellow-300' : 'text-white hover:text-yellow-300'}`}>Home</NavLink>
              <NavLink to="/courses" className={({isActive}) => `px-1 py-2 font-medium transition ${isActive ? 'text-yellow-300' : 'text-white hover:text-yellow-300'}`}>Courses</NavLink>
              <NavLink to="/contact" className={({isActive}) => `px-1 py-2 font-medium transition ${isActive ? 'text-yellow-300' : 'text-white hover:text-yellow-300'}`}>Contact us</NavLink>
              <div className="flex items-center gap-2">
                {user ? (
                  <button
                    onClick={() => {
                      const base = user.role === 'admin' ? '/admin' : user.role === 'mentor' ? '/mentor' : '/app'
                      navigate(base)
                    }}
                    className="px-4 py-2 rounded-full btn-primary border-1 border-white font-medium transition"
                  >
                    Dashboard
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="px-4 py-2 rounded-full btn-primary border-1 border-white font-medium transition">Sign In</Link>
                    <Link to="/register" className="px-4 py-2 rounded-full  btn-secondary font-medium transition">Register</Link>
                  </>
                )}
              </div>
            </nav>
           
          </div>
        </div>
      </header>

      {/* Mobile navigation - appears when hamburger is toggled */}
      <div className={`lg:hidden fixed top-16 left-0 right-0 z-40 transition-transform ${mobileOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-primary/95 backdrop-blur-md text-white p-4 border-t border-white/10">
            <div className="flex flex-col gap-3">
            <NavLink to="/" end onClick={() => setMobileOpen(false)} className={({isActive}) => `px-2 py-3 rounded ${isActive ? 'bg-white/5' : 'hover:bg-white/5'}`}>Home</NavLink>
            <NavLink to="/courses" onClick={() => setMobileOpen(false)} className={({isActive}) => `px-2 py-3 rounded ${isActive ? 'bg-white/5' : 'hover:bg-white/5'}`}>Courses</NavLink>
            <NavLink to="/contact" onClick={() => setMobileOpen(false)} className={({isActive}) => `px-2 py-3 rounded ${isActive ? 'bg-white/5' : 'hover:bg-white/5'}`}>Contact us</NavLink>
            <div className="flex gap-2 pt-2">
              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    const base = user.role === 'admin' ? '/admin' : user.role === 'mentor' ? '/mentor' : '/app'
                    navigate(base)
                  }}
                  className="flex-1 text-center px-4 py-2 rounded bg-white text-primary font-semibold"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 rounded bg-white text-primary font-semibold">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 rounded border border-white">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      {!hideBanner && (
        <section className="banner-section relative text-white py-24 pt-32 overflow-hidden" style={{ backgroundColor: '#392C7D' }}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="lg:w-2/3 w-full">
            <span className="block text-lg text-red-400 font-semibold mb-3">The Leader in Online Learning</span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">Find the Best <span className="text-yellow-300">Courses</span> from the Best <span className="text-green-300">Mentors</span> Around the World</h1>
            <p className="mb-8 text-lg text-white">Our specialized online courses are designed to bring the classroom experience to you, no matter where you are.</p>
            <form className="flex items-center gap-2 mb-8 flex-wrap">
              <select className="px-4 py-3 rounded border-1 border-white text-white font-medium">
                <option>Select Category</option>
                <option>Design</option>
                <option>Programming</option>
                <option>Marketing</option>
              </select>
              <input type="text" placeholder="Search for Courses, Instructors" className="flex-1 min-w-[200px] px-4 py-3 border border-white !rounded text-white" />
              <button type="submit" className="px-6 py-3 btn-secondary bg-yellow-400 text-white font-bold rounded hover:bg-yellow-500 transition">
                Search
              </button>
            </form>
            <div className="flex gap-8 flex-wrap">
              <div className="text-center">
                <p className="!text-yellow-300 text-3xl font-bold">10K</p>
                <p className="text-sm !text-white">Online Courses</p>
              </div>
              <div className="text-center">
                <p className="!text-blue-300 text-3xl font-bold">6K</p>
                <p className="text-sm text-white">Certified Courses</p>
              </div>
              <div className="text-center">
                <p className="!text-green-300 text-3xl font-bold">2K</p>
                <p className="text-sm text-white">Experienced Tutors</p>
              </div>
            </div>
          </div>
          <div className="lg:w-1/3 w-full flex justify-center">
            <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-sm">
              <img src="/images/student.jpg" alt="Student" className="w-full h-40 object-cover rounded-lg mb-4" />
              <div className="text-center">
                <h6 className="font-bold text-lg mb-1 text-gray-800">Join thousands of learners</h6>
                <p className="text-sm text-gray-600 mb-3">Start your journey with Recent today.</p>
                <div className="flex items-center justify-center">
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-full font-medium hover:bg-gray-900 transition">Get Started</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      )}
    </>
  )
}
