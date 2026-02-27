import { Box, Button, Container, Grid, Paper, Stack, Typography, Card, CardMedia, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ENV } from '../../app/env'
import PublicHeader from '../../shared/components/PublicHeader'
import SchoolIcon from '@mui/icons-material/School'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import QuizIcon from '@mui/icons-material/Quiz'
import GroupsIcon from '@mui/icons-material/Groups'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AssignmentIcon from '@mui/icons-material/Assignment'

export default function LandingPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<any[]>([])
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/courses`)
        setCourses(res.data)
      } catch (error) {
        console.error('Failed to load courses:', error)
        // Silently fail if courses can't be loaded (no redirect)
      }
    }
    loadCourses()
  }, [])


  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 48, color: '#0f3d30' }} />,
      title: 'Interactive Courses',
      description: 'Comprehensive courses with rich content, videos, and assessments'
    },
    {
      icon: <AutoStoriesIcon sx={{ fontSize: 48, color: '#0f3d30' }} />,
      title: 'Topic Library',
      description: 'Reusable content library for efficient course building'
    },
    {
      icon: <QuizIcon sx={{ fontSize: 48, color: '#0f3d30' }} />,
      title: 'Smart Assessments',
      description: 'MCQ questions with instant feedback and detailed explanations'
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 48, color: '#0f3d30' }} />,
      title: 'Batch Management',
      description: 'Organize students into batches with assigned courses'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48, color: '#0f3d30' }} />,
      title: 'Progress Tracking',
      description: 'Monitor student progress and performance analytics'
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 48, color: '#0f3d30' }} />,
      title: 'Assignments & Quizzes',
      description: 'Create and manage assignments with automated grading'
    }
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Header */}
      <PublicHeader />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f3d30 0%, #1a5c47 100%)',
          color: '#fff',
          py: { xs: 8, md: 12 }
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
              }}
            >
              Transform Education with
              <br />
              Modern Learning Management
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 700,
                opacity: 0.95,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              A comprehensive platform for institutes, instructors, and students to create,
              manage, and deliver exceptional learning experiences
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{
                  bgcolor: '#fff',
                  color: '#0f3d30',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#f0f0f0'
                  }
                }}
              >
                Get Started Free
              </Button>
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
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Login to Continue
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Courses Section */}
      {courses.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Stack spacing={6}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#0f3d30' }}>
                Explore Our Courses
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600 }}>
                Browse through our collection of high-quality courses
              </Typography>
            </Stack>

            <Grid container spacing={4}>
              {courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(15, 61, 48, 0.15)',
                        borderColor: '#0f3d30'
                      }
                    }}
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    {course.imageUrl && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={course.imageUrl.startsWith('/') ? `${apiBase}${course.imageUrl}` : course.imageUrl}
                        alt={course.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    {!course.imageUrl && (
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 64, color: '#bdbdbd' }} />
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
                        {course.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {course.description}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
                        {course.duration && (
                          <Typography variant="caption" sx={{ color: '#0f3d30', fontWeight: 600 }}>
                            {course.duration}
                          </Typography>
                        )}
                        {course.sectionCount > 0 && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {course.sectionCount} Section{course.sectionCount !== 1 ? 's' : ''}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      )}

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={6}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0f3d30' }}>
              Powerful Features
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600 }}>
              Everything you need to deliver exceptional online education
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {features.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(15, 61, 48, 0.1)',
                      borderColor: '#0f3d30'
                    }
                  }}
                >
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    {feature.icon}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {feature.description}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#f5f5f5', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0f3d30 0%, #1a5c47 100%)',
              color: '#fff',
              textAlign: 'center'
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Ready to Get Started?
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: 500 }}>
                Join thousands of educators and learners already using our platform
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{
                    bgcolor: '#fff',
                    color: '#0f3d30',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#f0f0f0'
                    }
                  }}
                >
                  Create Free Account
                </Button>
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
                    '&:hover': {
                      borderColor: '#fff',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0f3d30', color: '#fff', py: 4 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
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
