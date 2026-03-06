import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ENV } from '../../app/env'
import PublicHeader from '../../shared/components/PublicHeader'
import SchoolIcon from '@mui/icons-material/School'
import BookIcon from '@mui/icons-material/Book'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import StarIcon from '@mui/icons-material/Star'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export default function LandingPage() {
  const navigate = useNavigate()
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [courses, setCourses] = useState<any[]>([])
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/courses`)
        setCourses(res.data)
      } catch (error) {
        console.error('Failed to load courses:', error)
      }
    }
    loadCourses()
  }, [])

  const benefits = [
    {
      icon: BookIcon,
      title: 'Flexible Learning',
      description: 'We believe that high-quality education should be accessible to everyone. Our pricing models are designed to accommodate different budgets and learning styles.'
    },
    {
      icon: BookmarkIcon,
      title: 'Lifetime Access',
      description: 'When you enroll in our courses, you\'re not just signing up for temporary learning - you\'re making an investment in lifelong growth.'
    },
    {
      icon: TrendingUpIcon,
      title: 'Expert Instruction',
      description: 'Our instructors are seasoned professionals with years of experience in their fields, bringing real-world knowledge to every lesson.'
    }
  ]

  const howItWorks = [
    { step: '01', title: 'Sign-Up or Register', description: 'Look for the Sign-Up or Create Account button and follow the simple registration process.' },
    { step: '02', title: 'Complete Your Profile', description: 'Add your profile information to personalize your learning experience.' },
    { step: '03', title: 'Choose Courses', description: 'Browse and select from our extensive collection of quality courses.' },
    { step: '04', title: 'Access Your Account', description: 'Start learning immediately and track your progress in real-time.' }
  ]

  const testimonials = [
    {
      name: 'Brenda Slaton',
      role: 'Designer',
      image: '/user-41.jpg',
      text: 'This mentor helped me understand concepts that I had been struggling with for weeks.',
      rating: 5
    },
    {
      name: 'Adrian Dennis',
      role: 'Developer',
      image: '/user-42.webp',
      text: 'I\'ve learned so much from my mentor\'s personal experience and guidance.',
      rating: 5
    },
    {
      name: 'Adrian Coztanza',
      role: 'Architect',
      image: '/user-43.jpg',
      text: 'The advice was useful and practical for my career advancement.',
      rating: 5
    }
  ]

  const faqs = [
    { q: 'How do I enroll in a course?', a: 'Sign up for an account, browse courses, and click enroll. Payment is processed securely.' },
    { q: 'How long do I have access to a course?', a: 'You have lifetime access to all course materials after enrollment.' },
    { q: 'Will I receive a certificate after completing a course?', a: 'Yes, you\'ll receive a certificate of completion upon finishing all course requirements.' },
    { q: 'What is Dreams LMS?', a: 'Dreams LMS is a comprehensive learning management platform for organizations and individual learners.' },
    ]

  const blogPosts = [
    { title: 'Why an LMS is Essential for Modern Education', category: 'Lifestyle', date: '09 Aug 2025' },
    { title: 'The Impact of LMS on Academic Journey Education', category: 'Productivity', date: '09 Aug 2025' },
    { title: 'Maximizing Academic Success with the Right LMS', category: 'Productivity', date: '09 Aug 2025' },
    { title: 'Promoting Health & Well being in Schools', category: 'UI/UX', date: '09 Aug 2025' }
  ]

  const instructors = [
    { name: 'Joyce Pence', role: 'Lead Designer', rating: 4.8 },
    { name: 'Edith Dorsey', role: 'Accountant', rating: 5.0 },
    { name: 'Ruben Holmes', role: 'Architect', rating: 4.8 },
    { name: 'Carol Magner', role: 'Lead Designer', rating: 4.5 }
  ]

  const categories = ['Frontend Developer', 'Jira Management', 'Figma Developer', 'Framer Developer', 'Vue JS', 'Shopify']

  return (
    <div className="min-h-screen bg-white landing-page">
      {/* Header with Hero from PublicHeader */}
      <PublicHeader />

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-600 underline mb-2">Our Benefits</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Master the Skills to Drive your Career</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The right course, guided by an expert mentor, can provide invaluable insights, practical skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const IconComponent = benefit.icon
              return (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: '#E0D4F7' }}>
                      <IconComponent style={{ fontSize: 24, color: '#392C7D' }} />
                    </div>
                  </div>
                  <h5 className="font-bold text-lg mb-2 text-gray-900">{benefit.title}</h5>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      {courses.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Explore Our Courses</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse through our collection of high-quality courses
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                  onClick={() => navigate(`/courses/${course._id}`)}
                  style={{ borderColor: '#392C7D' }}
                >
                  <div className="relative bg-gray-300 h-48 overflow-hidden">
                    {course.imageUrl && (
                      <img
                        src={course.imageUrl.startsWith('/') ? `${apiBase}${course.imageUrl}` : course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                    {!course.imageUrl && (
                      <div className="w-full h-full flex items-center justify-center">
                        <SchoolIcon sx={{ fontSize: 64, color: '#9ca3af' }} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h6 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h6>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">{course.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      {course.duration && <span className="font-semibold" style={{ color: '#392C7D' }}>{course.duration}</span>}
                      {course.sectionCount > 0 && <span>{course.sectionCount} Section{course.sectionCount !== 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {courses.length > 6 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => navigate('/courses')}
                  className="px-6 py-3 btn-primary font-semibold rounded-lg transition"
                >
                  View All Courses
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 md:py-20 bg-[#FBFBFD] bg-[url('/images/bg-20.png')]" >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-600 underline mb-2">Our Categories</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Top Courses & Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The right course, guided by an expert mentor, can provide invaluable insights, practical skills
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition cursor-pointer"
                style={{ borderColor: '#392C7D' }}
              >
                <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#E0D4F7' }}>
                  <SchoolIcon sx={{ fontSize: 24, color: '#392C7D' }} />
                </div>
                <h6 className="font-semibold !text-gray-900 text-sm">{category}</h6>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="px-6 py-3 btn-primary font-semibold rounded-lg transition">
              View All Categories
            </button>
          </div>
        </div>
      </section>

      {/* Trust Section (closer to template) */}
      {/* <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="relative video-showcase aos-fade-up">
                <img src="/images/startlearning.jpg" alt="feature" className="w-full rounded-2" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <a href="https://www.youtube.com/embed/1trvO6dqQUI" className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 hover:bg-white transition shadow-lg" target="_blank" rel="noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5v14l11-7L8 5z" fill="#392C7D" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="relative aos-fade-up aos-delay-150 p-8 rounded-lg overflow-hidden" style={{ backgroundColor: '#392C7D', color: '#fff' }}>
                <img src="/images/bg-20.png" alt="bg" className="absolute -top-10 -right-10 opacity-20 pointer-events-none" />
                <h4 className="text-2xl font-bold mb-4">Trusted by the 15,000+ happy students and online users since 2000</h4>
                <p className="mb-6 text-gray-100">We're proud to have helped thousands of learners achieve their goals with high-quality courses and expert mentors.</p>
                <div className="flex gap-4 flex-wrap mb-6">
                  <button onClick={() => navigate('/login')} className="px-6 py-3 rounded btn-primary font-semibold">Enroll as Student</button>
                  <button onClick={() => navigate('/register')} className="px-6 py-3 rounded btn-secondary font-semibold">Apply as Tutor</button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 text-white">
                  <div>
                    <h4 className="text-3xl font-bold">9.8/10</h4>
                    <p>Course Approval Score</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold">13k</h4>
                    <p>Satisfied Students Worldwide</p>
                  </div>
                </div>

                <div className="mt-6 bg-white text-gray-800 p-3 rounded flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img src="/images/logo-white.svg" alt="avatar" className="w-10" />
                  </div>
                  <p className="mb-0">“All courses are incredibly helpful and assist people to achieve their goals.”</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* How It Works Section - redesigned to match template */}
      <section className="py-16 md:py-20 bg-white-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <img src="/images/startlearning.jpg" alt="how it works" className="w-full rounded-4xl" />
            </div>
            <div>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 underline mb-2">How it Works</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Start your Learning Journey Today!</h2>
                <p className="text-gray-600">Unlock Your Potential and Achieve Your Dreams with Our Comprehensive Learning Resources!</p>
              </div>

              <div className="space-y-4">
                {howItWorks.map((item, idx) => (
                  <div>
                  <div key={idx} className="flex items-start gap-4 max-h-20">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#EDE6FB] text-primary flex items-center justify-center font-bold">{item.step}</div>
                    <div>
                      <h5 className="font-bold text-lg mb-1 text-gray-900">{item.title}</h5>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  <br/>
                 
                  
                  </div>
                  <hr/>
                  </div>
                    
                  
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-medium text-gray-600 underline mb-2">Advanced Learning</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Creating a community of learners.</h2>
              <p className="text-gray-600 mb-8">
                We're dedicated to transforming education by providing a diverse range of high-quality courses that cater to learners of all levels.
              </p>

              {[
                { title: 'Learn from anywhere', desc: 'Learning from anywhere has become a transform aspect of modern education.' },
                { title: 'Expert Mentors', desc: 'Get guidance from industry experts with real-world experience.' },
                { title: 'Learn in demand skills', desc: 'In today\'s job market, learning in-demand skills is crucial.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 mb-6">
                  <div style={{ color: '#392C7D' }}>
                    <CheckCircleIcon sx={{ fontSize: 28 }} />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h5>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 mt-8">
                <button onClick={() => navigate('/login')} className="px-6 py-3 btn-primary font-semibold rounded-lg transition">
                  Enroll as Student
                </button>
                  {/* <button onClick={() => navigate('/register')} className="px-6 py-3 btn-secondary font-semibold rounded-lg transition">
                    Apply as Tutor
                  </button> */}
              </div>
            </div>
            <div className=" rounded-lg  ">
              <img src="/images/community.jpg" alt="Community" className="w-full h-full object-cover rounded-4xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Instructors Section */}
      {/* <section className="py-16 md:py-20 text-white" style={{ backgroundColor: '#392C7D' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-100 underline mb-2">Featured Instructors</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Top Class & Professional Instructors</h2>
            <p className="text-gray-100">Empowering Change: Stories from Those Who Took the Leap</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructors.map((instructor, idx) => (
              <div key={idx} className="bg-white text-gray-900 rounded-lg p-6 text-center hover:shadow-lg transition">
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h5 className="font-bold text-lg mb-1">{instructor.name}</h5>
                <p className="text-gray-600 text-sm mb-2">{instructor.role}</p>
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} sx={{ fontSize: 16, color: i < Math.floor(instructor.rating) ? '#F59E0B' : '#D1D5DB' }} />
                  ))}
                </div>
                <p className="font-semibold text-sm mt-2" style={{ color: '#392C7D' }}>{instructor.rating}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-600 underline mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">What Students Say</h2>
            <p className="text-gray-600">Words from Those Who've Experienced Real Growth</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div>
                    <h6 className="font-bold !text-gray-900">{testimonial.name}</h6>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} sx={{ fontSize: 16, color: '#F59E0B' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-white-50 ">
        <div className="max-w-6xl mx-auto px-4 ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="faq-img aos-fade-up ">
                <img className="img-fluid rounded-5" src="/images/feature-4.jpg" alt="img" />
              </div>
            <div>
              <p className="text-sm font-medium text-gray-600 underline mb-2">Your Questions Answered</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Frequently Asked Questions</h2>

              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className={`bg-white border border-gray-200 rounded-lg p-4 aos-fade-up ${idx % 2 === 1 ? 'aos-delay-150' : ''}`}>
                    <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} className="w-full text-left flex justify-between items-center font-bold text-gray-900">
                      <span>{faq.q}</span>
                      <span className="ml-2">{faqOpen === idx ? '-' : '+'}</span>
                    </button>
                    <div className={`collapse-body mt-3 ${faqOpen === idx ? 'open' : ''}`}>
                      <div className="pt-0 text-sm text-gray-600">
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-600 underline mb-2">Articles & Updates</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Our Recent Blog & Articles</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore curated content to enlighten, entertain and engage readers globally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts.map((post, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
                <div className="bg-gray-300 h-40"></div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                    <span className="px-2 py-1 rounded text-white" style={{ backgroundColor: '#392C7D' }}>{post.category}</span>
                    <span>{post.date}</span>
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h5>
                  <p className="text-gray-600 text-sm">By David Benitez</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="px-6 py-3 text-white font-semibold rounded-lg transition" style={{ backgroundColor: '#392C7D' }}>
              View All Articles
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 text-white" style={{ backgroundColor: '#392C7D' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Trusted by 15,000+ Happy Students</h3>
            <p className="text-lg !text-gray-100">
              Learn from the best and achieve your goals with our comprehensive courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-white text-5xl font-bold mb-2">9.8/10</p>
              <p className="!text-red-400 text-lg font-semibold mb-2">Course Approval Score</p>
              <p className="!text-gray-200">Achieving a complete course approval score is significant.</p>
            </div>
            <div className="text-center">
              <p className="text-white text-5xl font-bold mb-2">13K</p>
              <p className="!text-red-400 text-lg font-semibold mb-2">Satisfied Students</p>
              <p className="!text-gray-200">Students worldwide share a common thread of happiness.</p>
            </div>
            <div className="text-center">
              <p className="text-white text-5xl font-bold mb-2">20+</p>
              <p className="!text-red-400 text-lg font-semibold mb-2">Institutions</p>
              <p className="!text-gray-200">Trusted by leading institutions around the world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <div className="rounded-lg p-8 md:p-12 text-center text-white" style={{ backgroundColor: '#392C7D' }}>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg mb-8 !text-gray-100">
              Join thousands of educators and learners already using our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 bg-white font-bold rounded-lg hover:bg-gray-100 transition"
                style={{ color: '#392C7D' }}
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 btn-secondary  text-white font-bold rounded-lg transition"
               
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: '#2B2147' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SchoolIcon sx={{ fontSize: 28 }} />
                <span className="font-bold text-xl">Dreams LMS</span>
              </div>
              <p className="!text-white-300 text-sm">Platform designed to help organizations, educators, and learners manage, deliver, and track learning.</p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Support</h5>
              <ul className="space-y-2 !text-white-300 text-sm">
                <li><a href="#" className="hover:text-white transition">Education</a></li>
                <li><a href="#" className="hover:text-white transition">Enroll Course</a></li>
                <li><a href="#" className="hover:text-white transition">Payments</a></li>
                <li><a href="#" className="hover:text-white transition">Blogs</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">About</h5>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><a href="#" className="hover:text-white transition">Categories</a></li>
                <li><a href="#" className="hover:text-white transition">Courses</a></li>
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Newsletter</h5>
              <p className="text-gray-300 text-sm mb-4">Sign up to get updates & news.</p>
              <input type="email" placeholder="Email Address" className="w-full px-4 py-2 rounded text-gray-900" />
              <button className="w-full mt-2 px-4 py-2 text-white rounded font-semibold transition" style={{ backgroundColor: '#392C7D' }}>Subscribe</button>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-300 text-sm">
            <p>Copyright 2026 © Dreams LMS. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 transition">Terms & Conditions</a>
              <a href="#" className="text-gray-300 transition">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
