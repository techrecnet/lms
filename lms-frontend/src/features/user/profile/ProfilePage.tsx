import { useEffect, useState } from 'react'
import { Paper, Stack, TextField, Typography, Grid, Avatar, Box } from '@mui/material'
import { api } from '../../../core/api'
import { ENV } from '../../../app/env'
import { useAppSelector } from '../../../shared/hooks/redux'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const user = useAppSelector(s => s.auth.user)
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await api.get('/users/me')
      setProfile(res.data)
    } catch (err) {
      console.error('Failed to load profile', err)
    }
  }

  if (!profile) return <Typography>Loading...</Typography>

  const imageUrl = profile.studentImage ? `${apiBase}${profile.studentImage}` : null

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>My Profile</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          View your profile information
        </Typography>

        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar
              src={imageUrl || undefined}
              sx={{ width: 120, height: 120 }}
            >
              {!imageUrl && profile.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile.name || 'Not set'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                Email
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                Roll Number
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile.rollNo || 'Not set'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                Batch/Session
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile.batchSession || 'Not set'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                Class
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile.class || 'Not set'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                Institute
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile.instituteId?.name || profile.institute || 'Not set'}
              </Typography>
            </Grid>
          </Grid>
        </Stack>
      </Paper>
    </Stack>
  )
}
