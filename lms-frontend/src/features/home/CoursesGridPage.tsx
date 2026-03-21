import { useEffect, useState } from 'react'
import axios from 'axios'
import { ENV } from '../../app/env'
import { Container } from '@mui/material'
import { Link } from 'react-router-dom'
import PublicHeader from '../../shared/components/PublicHeader'
import PublicFooter from '../../shared/components/PublicFooter'

export default function CoursesGridPage() {
  const [courses, setCourses] = useState<any[]>([])
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/courses`)
        setCourses(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-white pt-28">
      <PublicHeader hideBanner forceSolid />
      <Container maxWidth="lg" className="py-12">
        <h2 className="text-3xl font-bold mb-6">All Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Link to={`/courses/${c._id}`} key={c._id} className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
              <div className="h-40 bg-gray-100 rounded mb-4 overflow-hidden">
                <img src={c.imageUrl?.startsWith('/') ? `${apiBase}${c.imageUrl}` : c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
              </div>
              <h5 className="font-semibold text-gray-900 mb-2">{c.title}</h5>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{c.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-700">{c.duration}</span>
                <span className="text-sm text-gray-500">{c.sectionCount} sections</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
      <PublicFooter />
    </div>
  )
}
