import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Paper, Stack, Typography, Avatar, Chip, Button, LinearProgress, Grid, CircularProgress } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { api } from '../../../core/api'
import { ENV } from '../../../app/env'

export default function StudentDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')
  
  // Get assignment info from query params for back button
  const assignmentId = searchParams.get('assignmentId')
  const batchId = searchParams.get('batchId')

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/users/${id}/progress`)
      setData(res.data)
    } catch (err: any) {
      console.error('Failed to load user details', err.response?.data || err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data) {
    return (
      <Stack spacing={3}>
        <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
          <Button 
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Unable to load student details
          </Typography>
        </Paper>
      </Stack>
    )
  }

  const { user, progress } = data
  const imageUrl = user.studentImage ? `${apiBase}${user.studentImage}` : null

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Button 
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Report
        </Button>
        <Typography variant="h5" sx={{ mb: 1 }}>Student Details</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          View student profile and course progress
        </Typography>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }}>
          <Avatar
            src={imageUrl || undefined}
            sx={{ width: 120, height: 120 }}
          >
            {!imageUrl && user.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          
          <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
            <Box>
              <Typography variant="h5">{user.name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Roll Number</Typography>
                <Typography variant="body1">{user.rollNo || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Batch/Session</Typography>
                <Typography variant="body1">{user.batchSession || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Institute</Typography>
                <Typography variant="body1">{user.instituteId?.name || user.institute || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Status</Typography>
                <Typography variant="body1">
                  <Chip 
                    label={user.isActive ? 'Active' : 'Inactive'}
                    size="small" 
                    color={user.isActive ? 'success' : 'error'}
                    sx={{ mt: 0.5 }}
                  />
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Course Progress</Typography>
        {progress.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No courses assigned to this student yet.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {progress.map((item: any) => {
              const totalContent = item.completedTopics + item.completedLibraryTopics + item.completedQuestions
              const progressPercent = item.totalSections > 0 
                ? (item.completedSections / item.totalSections) * 100 
                : 0

              return (
                <Box key={item.course._id} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.course.title}
                      </Typography>
                      {item.course.description && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {item.course.description}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
                      <Chip 
                        label={`${item.completedSections} / ${item.totalSections} Sections`}
                        size="small"
                        color={item.completedSections === item.totalSections ? 'success' : 'default'}
                      />
                      <Chip 
                        label={`${item.completedTopics} Topics`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        label={`${item.completedLibraryTopics} Library Topics`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        label={`${item.completedQuestions} MCQs`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Overall Progress
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {progressPercent.toFixed(0)}%
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={progressPercent} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Button 
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/app/courses/${item.course._id}`)}
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                    >
                      View Contents
                    </Button>
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        )}
      </Paper>
    </Stack>
  )
}
