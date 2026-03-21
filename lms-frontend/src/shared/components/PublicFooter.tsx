import React from 'react'
import { Link } from 'react-router-dom'
// footer uses the logo image

export default function PublicFooter() {
  return (
    <footer className="text-white py-12" style={{ backgroundColor: '#2B2147' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/logo-white.png" alt="Recent" className="h-10" />
            </div>
            <p className="!text-white-300 text-sm">Platform designed to help organizations, educators, and learners manage, deliver, and track learning.</p>
          </div>
          <div>
            <h5 className="font-bold mb-4 text-white">Support</h5>
            <ul className="space-y-2 !text-white-300 text-sm">
              <li><Link to="/" className="hover:text-white transition">Education</Link></li>
              <li><Link to="/courses" className="hover:text-white transition">Enroll Course</Link></li>
              <li><Link to="/" className="hover:text-white transition">Payments</Link></li>
              <li><Link to="/blog" className="hover:text-white transition">Blogs</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4 text-white">About</h5>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/" className="hover:text-white transition">Categories</Link></li>
              <li><Link to="/courses" className="hover:text-white transition">Courses</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4 text-white">Newsletter</h5>
            <p className="text-gray-300 text-sm mb-4">Sign up to get updates & news.</p>
            <input type="email" placeholder="Email Address" className="w-full px-4 py-2 rounded text-gray-900" />
            <button className="w-full mt-2 px-4 py-2 text-white rounded font-semibold transition" style={{ backgroundColor: '#392C7D' }}>Subscribe</button>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-300 text-sm">
          <p>Copyright 2026 © Recent. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-gray-300 transition">Terms & Conditions</Link>
            <Link to="/privacy" className="text-gray-300 transition">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
