import { useEffect, useState } from 'react'
import { api } from '../../../core/api'
import { Button, Paper, Stack, Typography, LinearProgress, Box, Chip, Grid } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import CompletionCertificate from '../../../shared/components/CompletionCertificate'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

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
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>My Courses</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          View your enrolled courses and track your progress
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {courses.map(c => {
          const progressPercent = getProgressPercent(c._id)
          const courseProgress = progress[c._id]
          
          return (
            <Grid item xs={12} md={6} key={c._id}>
              <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%', mr: 1 }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {c.title}
                    </Typography>
                    {c.description && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {c.description.length > 80 ? c.description.substring(0, 80) + '...' : c.description}
                      </Typography>
                    )}
                  </Box>

                  <Grid container spacing={1}>
                    <Grid item xs={6} md={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.3 }}>
                        Sections
                      </Typography>
                      <Chip 
                        label={`${courseProgress?.completedSections?.length || 0} / ${c.sections?.length || 0}`}
                        color={progressPercent === 100 ? 'success' : 'default'}
                        variant={progressPercent === 100 ? 'filled' : 'outlined'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.3 }}>
                        Topics
                      </Typography>
                      <Chip 
                        label={courseProgress?.completedTopics?.length || 0}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.3 }}>
                        Library
                      </Typography>
                      <Chip 
                        label={courseProgress?.completedLibraryTopics?.length || 0}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6} md={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.3 }}>
                        MCQs
                      </Typography>
                      <Chip 
                        label={courseProgress?.completedQuestions?.length || 0}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Progress
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f3d30' }}>
                        {progressPercent.toFixed(0)}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressPercent}
                      sx={{ height: 6, borderRadius: 3, backgroundColor: '#e0e0e0' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button 
                      component={RouterLink} 
                      to={`/app/courses/${c._id}`}
                      variant="contained"
                      size="small"
                    >
                      Open
                    </Button>
                    {progressPercent === 100 && c.certificateAllowed && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EmojiEventsIcon />}
                        onClick={() => {
                          setSelectedCourse(c)
                          setCertificateOpen(true)
                        }}
                      >
                        Certificate
                      </Button>
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {courses.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary' }}>
            No courses assigned yet.
          </Typography>
        </Paper>
      )}

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
    </Stack>
  )
}
