import { useEffect, useState } from 'react'
import { Paper, Stack, TextField, Typography, Grid, Avatar, Box, Container, Card, CardContent, Divider, Fade } from '@mui/material'
import { api } from '../../../core/api'
import { ENV } from '../../../app/env'
import { useAppSelector } from '../../../shared/hooks/redux'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import BadgeIcon from '@mui/icons-material/Badge'
import SchoolIcon from '@mui/icons-material/School'

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

  if (!profile) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Typography>Loading...</Typography>
    </Box>
  )

  const imageUrl = profile.studentImage ? `${apiBase}${profile.studentImage}` : null

  const profileFields = [
    { label: 'Name', value: profile.name, icon: PersonIcon },
    { label: 'Email', value: profile.email, icon: EmailIcon },
    { label: 'Roll Number', value: profile.rollNo, icon: BadgeIcon },
    { label: 'Batch/Session', value: profile.batchSession, icon: SchoolIcon },
    { label: 'Class', value: profile.class, icon: null },
    { label: 'Institute', value: profile.instituteId?.name || profile.institute, icon: null }
  ]

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
      <Container maxWidth="md">
        <Fade in={true} timeout={600}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                    My Profile
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    View and manage your profile information
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#e5e7eb' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    src={imageUrl || undefined}
                    sx={{ 
                      width: 140, 
                      height: 140,
                      border: '4px solid #7c3aed',
                      boxShadow: '0 4px 16px rgba(124, 58, 237, 0.2)',
                      fontSize: '3rem',
                      fontWeight: 700
                    }}
                  >
                    {!imageUrl && profile.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 600, color: '#1a1a2e' }}>
                    {profile.name || 'User Profile'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {profile.email}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#e5e7eb' }} />

                <Grid container spacing={3}>
                  {profileFields.map((field, idx) => {
                    const IconComponent = field.icon
                    return (
                      <Grid item xs={12} sm={6} key={idx}>
                        <Box sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                            borderColor: '#d1d5db'
                          },
                          transition: 'all 0.2s ease'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            {IconComponent && (
                              <IconComponent sx={{ color: '#7c3aed', fontSize: 20 }} />
                            )}
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                              {field.label}
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e', ml: IconComponent ? 3.5 : 0 }}>
                            {field.value || 'Not set'}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  )
}
