import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, 
  Button,
  Container,
  Typography,
  Stack,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material'
import axios from 'axios'
import { ENV } from '../../app/env'
import { useAppSelector } from '../../shared/hooks/redux'
import PublicHeader from '../../shared/components/PublicHeader'
import PublicFooter from '../../shared/components/PublicFooter'
import SchoolIcon from '@mui/icons-material/School'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import ContentRenderer from '../../shared/components/ContentRenderer'

export default function CourseDetailsPublicPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false)
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/courses/${id}`)
        setCourse(res.data)
      } catch (error) {
        console.error('Failed to load course:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCourse()
  }, [id])

  useEffect(() => {
    if (!user || user.role !== 'user' || !id) return
    const token = localStorage.getItem('accessToken')
    if (!token) return
    let active = true

    const checkEnrollment = async () => {
      setIsCheckingEnrollment(true)
      try {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`
        const res = await axios.get(`${ENV.API_BASE_URL}/users/me/courses`, {
          headers: { Authorization: authHeader }
        })
        const enrolled = Array.isArray(res.data) && res.data.some((c: any) => String(c._id) === String(id))
        if (active) setIsEnrolled(enrolled)
      } catch (error) {
        console.error('Failed to check enrollment:', error)
      } finally {
        if (active) setIsCheckingEnrollment(false)
      }
    }

    checkEnrollment()
    return () => {
      active = false
    }
  }, [id, user])

  const handleDashboard = () => {
    if (!user) return
    if (user.role === 'admin') {
      navigate('/admin')
    } else if (user.role === 'mentor') {
      navigate('/mentor')
    } else {
      navigate('/app')
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'user') {
      handleDashboard()
      return
    }
    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate('/login')
      return
    }
    if (!id) return

    setIsEnrolling(true)
    try {
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      await axios.post(
        `${ENV.API_BASE_URL}/users/me/enroll`,
        { courseId: id },
        { headers: { Authorization: authHeader } }
      )
      setIsEnrolled(true)
      navigate(`/app/courses/${id}`)
    } catch (error) {
      console.error('Failed to enroll:', error)
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleContinue = () => {
    if (!id) return
    navigate(`/app/courses/${id}`)
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (!course) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Course not found</Typography>
      </Box>
    )
  }

  const imageUrl = course.imageUrl
    ? course.imageUrl.startsWith('/')
      ? `${apiBase}${course.imageUrl}`
      : course.imageUrl
    : null

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', pt: '88px' }}>
      {/* Header (hide the big landing banner on this page) */}
      <PublicHeader hideBanner forceSolid />

      {/* Course Hero - styled to match landing page colors */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper sx={{ p: { xs: 3, md: 4 }, display: 'flex', gap: 4, alignItems: 'center', borderRadius: 3, boxShadow: 3, border: '1px solid rgba(57,44,125,0.08)' }}>
          {imageUrl && (
            <Box
              component="img"
              src={imageUrl}
              alt={course.title}
              sx={{ width: { xs: '100%', md: 420 }, height: 280, objectFit: 'cover', borderRadius: 2, boxShadow: '0 8px 30px rgba(25,118,210,0.12)', border: '2px solid rgba(25,118,210,0.06)' }}
            />
          )}
          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>
              {course.title}
            </Typography>
            <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 500 }}>
              {course.description}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {course.duration && <Chip label={course.duration} sx={{ bgcolor: 'rgba(57,44,125,0.06)', color: '#392C7D', fontWeight: 600 }} />}
              {course.sectionCount > 0 && <Chip label={`${course.sectionCount} section${course.sectionCount !== 1 ? 's' : ''}`} />}
            </Stack>
          </Stack>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* Prerequisites */}
          {course.prerequisites && (
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#392C7D' }}>
                Prerequisites
              </Typography>
              <ContentRenderer content={course.prerequisites || ''} />
            </Paper>
          )}

          {/* Outcomes */}
          {course.outcomes && (
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#392C7D' }}>
                What You'll Learn
              </Typography>
              <ContentRenderer content={course.outcomes || ''} />
            </Paper>
          )}

          {/* Course Content */}
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <MenuBookIcon sx={{ fontSize: 32, color: '#392C7D' }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#392C7D' }}>
                Course Content
              </Typography>
            </Stack>

            {course.sections && course.sections.length > 0 ? (
              <Stack spacing={2}>
                {course.sections.map((section: any, index: number) => (
                  <Accordion key={section._id} defaultExpanded={index === 0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f5f5f5' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {section.title}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {((section.topics && section.topics.length > 0) || (section.libraryTopics && section.libraryTopics.length > 0)) ? (
                        <List>
                          {section.topics?.map((topic: any, idx: number) => (
                            <Box key={`topic-${topic._id}`}>
                              <ListItem>
                                <ListItemText
                                  primary={topic.title}
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                />
                              </ListItem>
                              <Divider />
                            </Box>
                          ))}
                          {section.libraryTopics?.map((topic: any, idx: number) => (
                            <Box key={`lib-${topic._id}`}>
                              <ListItem>
                                <ListItemText
                                  primary={topic.title}
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                />
                              </ListItem>
                              {idx < (section.libraryTopics?.length || 0) - 1 && <Divider />}
                            </Box>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                          No topics yet
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No sections available
              </Typography>
            )}
          </Paper>

          {/* Enroll Now CTA */}
          <Paper sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, rgba(57,44,125,1) 0%, rgba(57,44,125,0.85) 100%)', color: '#fff', textAlign: 'center' }}>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h4" sx={{ fontWeight: 700 ,color:'white'}}>
                {isEnrolled ? 'Continue Learning' : 'Ready to Start Learning?'}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 600 }}>
                {isEnrolled
                  ? 'Pick up right where you left off in this course.'
                  : 'Join now and get access to this course along with many other benefits'}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {isEnrolled ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleContinue}
                    sx={{
                      bgcolor: '#fff',
                      color: '#0f3d30',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#f0f0f0' }
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <>
                    <Button variant="contained" size="large" onClick={handleEnroll} disabled={isEnrolling || isCheckingEnrollment} sx={{ bgcolor: '#fff', color: '#392C7D', px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600, '&:hover': { bgcolor: '#f6f5ff' } }}>
                      Enroll Now
                    </Button>
                    {!user && (
                      <Button variant="outlined" size="large" onClick={() => navigate('/login')} sx={{ borderColor: '#fff', color: '#fff', px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255, 255, 255, 0.06)' } }}>
                        Sign In
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <PublicFooter />
    </Box>
  )
}
