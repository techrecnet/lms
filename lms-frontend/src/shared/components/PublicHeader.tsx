import { useEffect } from 'react'
import { Box, Button, Container, Stack, Typography, Avatar } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { logout, fetchUserProfile } from '../../features/auth/authSlice'
import { ENV } from '../../app/env'
import SchoolIcon from '@mui/icons-material/School'

export default function PublicHeader() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  useEffect(() => {
    if (user && (user.role === 'user' || user.role === 'mentor') && !user.name) {
      dispatch(fetchUserProfile() as any)
    }
  }, [user?.id, user?.role, user?.name, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

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

  return (
    <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0', py: 2 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <SchoolIcon sx={{ fontSize: 32, color: '#0f3d30' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f3d30' }}>
              EduTech LMS
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            {user ? (
              <>
              <Button
                  variant="outlined"
                  onClick={handleDashboard}
                  sx={{
                    borderColor: '#0f3d30',
                    color: '#0f3d30',
                    '&:hover': {
                      borderColor: '#0a2920',
                      bgcolor: 'rgba(15, 61, 48, 0.05)'
                    }
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="contained"
                  onClick={handleLogout}
                  sx={{
                    bgcolor: '#0f3d30',
                    '&:hover': {
                      bgcolor: '#0a2920'
                    }
                  }}
                >
                  Logout
                </Button>
                
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pr: 1 }}>
                  <Avatar
                    src={user.studentImage ? `${apiBase}${user.studentImage}` : undefined}
                    sx={{ width: 40, height: 40, bgcolor: 'rgba(15, 61, 48, 0.12)' }}
                  >
                    {!user.studentImage && (user.name?.charAt(0) || user.email?.charAt(0) || '').toUpperCase()}
                  </Avatar>
                  <Stack sx={{ display: { xs: 'none', sm: 'flex' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name || user.email}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                  </Stack>
                </Stack>
                
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: '#0f3d30',
                    color: '#0f3d30',
                    '&:hover': {
                      borderColor: '#0a2920',
                      bgcolor: 'rgba(15, 61, 48, 0.05)'
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/signup')}
                  sx={{
                    bgcolor: '#0f3d30',
                    '&:hover': {
                      bgcolor: '#0a2920'
                    }
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
