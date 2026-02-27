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
import SchoolIcon from '@mui/icons-material/School'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import MenuBookIcon from '@mui/icons-material/MenuBook'

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Header */}
      <PublicHeader />

      {/* Course Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #0f3d30 0%, #1a5c47 100%)', color: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            {imageUrl && (
              <Box
                component="img"
                src={imageUrl}
                alt={course.title}
                sx={{
                  width: { xs: '100%', md: 400 },
                  height: 300,
                  objectFit: 'cover',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}
              />
            )}
            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff' }}>
                {course.title}
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {course.description}
              </Typography>
              {course.duration && (
                <Chip label={course.duration} sx={{ width: 'fit-content', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={4}>
          {/* Prerequisites */}
          {course.prerequisites && (
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#0f3d30' }}>
                Prerequisites
              </Typography>
              <Stack spacing={1.5}>
                {course.prerequisites.split('\n').filter((line: string) => line.trim()).map((prereq: string, index: number) => (
                  <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
                    <CheckCircleOutlineIcon sx={{ color: '#0f3d30', mt: 0.3 }} />
                    <Typography variant="body1">{prereq}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}

          {/* Outcomes */}
          {course.outcomes && (
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#0f3d30' }}>
                What You'll Learn
              </Typography>
              <Stack spacing={1.5}>
                {course.outcomes.split('\n').filter((line: string) => line.trim()).map((outcome: string, index: number) => (
                  <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
                    <CheckCircleOutlineIcon sx={{ color: '#0f3d30', mt: 0.3 }} />
                    <Typography variant="body1">{outcome}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}

          {/* Course Content */}
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <MenuBookIcon sx={{ fontSize: 32, color: '#0f3d30' }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#0f3d30' }}>
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
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0f3d30 0%, #1a5c47 100%)',
              color: '#fff',
              textAlign: 'center'
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleEnroll}
                      disabled={isEnrolling || isCheckingEnrollment}
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
                      Enroll Now
                    </Button>
                    {!user && (
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                          borderColor: '#fff',
                          color: '#fff',
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                      >
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

      {/* Footer */}
      <Box sx={{ bgcolor: '#0f3d30', color: '#fff', py: 4, mt: 6 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SchoolIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                EduTech LMS
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © 2026 EduTech LMS. All rights reserved.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
