
import { useEffect, useRef, useState } from 'react'

export default function PublicHeader() {
  const [scrolledDown, setScrolledDown] = useState(false)

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
      <header className={`header-one w-full fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolledDown ? 'bg-primary' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4 cursor-pointer">
              <img src="/images/logo-white.png" alt="Logo" className="h-10" />
            </div>
            <nav className="hidden lg:flex gap-4">
              <a href="#" className="px-1 py-2 text-white hover:text-yellow-300 font-medium transition">Home</a>
              <a href="#" className="px-1 py-2 text-white hover:text-yellow-300 font-medium transition">Courses</a>
              <a href="#" className="px-1 py-2 text-white hover:text-yellow-300 font-medium transition">Contact us</a>
              <div className="flex items-center gap-2">
              <a href="/login" className="px-4 py-2 rounded-full btn-primary border-1 border-white font-medium transition">Sign In</a>
              <a href="/register" className="px-4 py-2 rounded-full  btn-secondary font-medium transition">Register</a>
            </div>
            </nav>
           
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
              <div className="bg-gray-300 rounded-lg h-40 mb-4 flex items-center justify-center text-gray-500">
                <span>Course Image</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <span className="font-medium text-gray-800">David Benitz</span>
                </div>
                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">Productivity</span>
              </div>
              <h6 className="font-bold text-lg mb-2 text-gray-800">The Complete Business and Management Course</h6>
              <p className="flex items-center text-yellow-500 mb-4">★ 5.0 (210 Reviews)</p>
              <div className="flex items-center justify-between">
                <span className="text-purple-700 font-bold text-lg">$168</span>
                <button className="bg-gray-800 text-white px-4 py-2 rounded font-medium hover:bg-gray-900 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
