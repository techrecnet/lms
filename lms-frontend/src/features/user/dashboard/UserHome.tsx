import { useEffect, useState } from 'react'
import { api } from '../../../core/api'
import { Button, Paper, Stack, Typography, LinearProgress, Box, Chip, Grid, Container, Card, CardContent, Fade } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import CompletionCertificate from '../../../shared/components/CompletionCertificate'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import BookIcon from '@mui/icons-material/Book'
import SchoolIcon from '@mui/icons-material/School'
import UserSessionsList from '../../interaction/UserSessionsList'

export default function UserHome() {
  const [courses, setCourses] = useState<any[]>([])
  const [progress, setProgress] = useState<any>({})
  const [userName, setUserName] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [certificateOpen, setCertificateOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)

  const load = async () => {
    try {
      // Load user info
      const userRes = await api.get('/users/me')
      setUserName(userRes.data.name || userRes.data.email || '')
      setUserEmail(userRes.data.email || '')
      
      // Load courses
      const res = await api.get('/users/me/courses')
      setCourses(res.data)
      
      // Load progress for each course
      const progressMap: any = {}
      for (const course of res.data) {
        try {
          const progressRes = await api.get(`/progress/courses/${course._id}`)
          progressMap[course._id] = progressRes.data
        } catch (err) {
          progressMap[course._id] = null
        }
      }
      setProgress(progressMap)
    } catch {
      const res = await api.get('/courses')
      setCourses(res.data)
    }
  }

  useEffect(() => { load().catch(()=>setCourses([])) }, [])

  const getProgressPercent = (courseId: string) => {
    const prog = progress[courseId]
    if (!prog) return 0
    const totalSections = courses.find(c => c._id === courseId)?.sections?.length || 1
    const percent = (prog.completedSections?.length || 0) / totalSections * 100
    return Math.min(percent, 100) // Cap at 100%
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Fade in={true} timeout={600}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700, color: '#1a1a2e' }}>Welcome back!</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Continue your learning journey and explore new courses
              </Typography>
            </Box>
          </Fade>

          <UserSessionsList />

          <Grid container spacing={3}>
            {courses.map(c => {
              const progressPercent = getProgressPercent(c._id)
              const courseProgress = progress[c._id]
              
              return (
                <Grid item xs={12} md={6} key={c._id}>
                  <Card sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    '&:hover': {
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-4px)'
                    }
                  }}>
                    <CardContent sx={{ pb: 0 }}>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <BookIcon sx={{ color: '#7c3aed', fontSize: 28, mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                              {c.title}
                            </Typography>
                            {c.description && (
                              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                                {c.description.length > 100 ? c.description.substring(0, 100) + '...' : c.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ py: 1, px: 1.5, backgroundColor: '#f3f4f6', borderRadius: 1.5, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>SECTIONS</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#7c3aed' }}>
                              {courseProgress?.completedSections?.length || 0}/{c.sections?.length || 0}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>TOPICS</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#06b6d4' }}>
                              {courseProgress?.completedTopics?.length || 0}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>LIBRARY</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                              {courseProgress?.completedLibraryTopics?.length || 0}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>MCQs</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#ef4444' }}>
                              {courseProgress?.completedQuestions?.length || 0}
                            </Typography>
                          </Box>
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                              Overall Progress
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: progressPercent === 100 ? '#10b981' : '#7c3aed' }}>
                              {progressPercent.toFixed(0)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={progressPercent}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: progressPercent === 100 
                                  ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                  : 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)'
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'space-between', pt: 1 }}>
                          <Button 
                            component={RouterLink} 
                            to={`/app/courses/${c._id}`}
                            variant="contained"
                            fullWidth
                            sx={{
                              background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '0.95rem',
                              py: 1,
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
                              }
                            }}
                          >
                            Continue
                          </Button>
                          {progressPercent === 100 && c.certificateAllowed && (
                            <Button
                              variant="outlined"
                              startIcon={<EmojiEventsIcon />}
                              onClick={() => {
                                setSelectedCourse(c)
                                setCertificateOpen(true)
                              }}
                              sx={{
                                borderColor: '#f59e0b',
                                color: '#f59e0b',
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                                  borderColor: '#f59e0b'
                                }
                              }}
                            >
                              Certificate
                            </Button>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>

          {courses.length === 0 && (
            <Fade in={true} timeout={800}>
              <Card sx={{
                py: 6,
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '2px dashed #e5e7eb'
              }}>
                <SchoolIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                  No courses assigned yet. Check back soon!
                </Typography>
              </Card>
            </Fade>
          )}

        </Stack>
      </Container>

      {selectedCourse && (
        <CompletionCertificate
          open={certificateOpen}
          onClose={() => {
            setCertificateOpen(false)
            setSelectedCourse(null)
          }}
          courseName={selectedCourse.title}
          userName={userName}
          userEmail={userEmail}
          completionDate={progress[selectedCourse._id]?.completedAt || new Date().toISOString()}
        />
      )}
    </Box>
  )
}
