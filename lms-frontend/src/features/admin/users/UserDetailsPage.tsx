import { useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { Box, Paper, Stack, Typography, Avatar, Chip, Button, LinearProgress, Grid } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { api } from '../../../core/api'
import { ENV } from '../../../app/env'

export default function UserDetailsPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    try {
      const res = await api.get(`/users/${id}/progress`)
      setData(res.data)
    } catch (err) {
      console.error('Failed to load user details', err)
    }
  }

  if (!data) return <Typography>Loading...</Typography>

  const { user, progress } = data
  const imageUrl = user.studentImage ? `${apiBase}${user.studentImage}` : null

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Button 
          component={RouterLink} 
          to="/admin/users" 
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Users
        </Button>
        <Typography variant="h5" sx={{ mb: 1 }}>User Details</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          View user profile and course progress
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
                    label="Active" 
                    size="small" 
                    color="success" 
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
            No courses assigned to this user yet.
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
