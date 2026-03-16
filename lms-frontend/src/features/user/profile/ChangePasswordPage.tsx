import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Paper, Stack, TextField, Typography, Alert, Container, Card, CardContent, Fade, Divider } from '@mui/material'
import { api } from '../../../core/api'
import LockIcon from '@mui/icons-material/Lock'

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ChangePasswordPage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, watch } = useForm<PasswordForm>()

  const onSubmit = async (data: PasswordForm) => {
    setError('')
    setSuccess(false)

    if (data.newPassword !== data.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (data.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    try {
      await api.put('/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to change password')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
      <Container maxWidth="sm">
        <Fade in={true} timeout={600}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack spacing={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ 
                    display: 'inline-flex', 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    mb: 2
                  }}>
                    <LockIcon sx={{ color: '#7c3aed', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                    Change Password
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Keep your account secure by updating your password
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#e5e7eb' }} />

                {success && (
                  <Alert severity="success" sx={{ borderRadius: 2, '& .MuiAlert-icon': { color: '#10b981' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Password changed successfully!</Typography>
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2, '& .MuiAlert-icon': { color: '#ef4444' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{error}</Typography>
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                        Current Password
                      </Typography>
                      <TextField
                        type="password"
                        placeholder="Enter your current password"
                        {...register('currentPassword', { required: 'Current password is required' })}
                        fullWidth
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#7c3aed' },
                            '&.Mui-focused fieldset': { borderColor: '#7c3aed' }
                          }
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                        New Password
                      </Typography>
                      <TextField
                        type="password"
                        placeholder="Enter your new password (min 6 characters)"
                        {...register('newPassword', { required: 'New password is required' })}
                        fullWidth
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#7c3aed' },
                            '&.Mui-focused fieldset': { borderColor: '#7c3aed' }
                          }
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                        Confirm New Password
                      </Typography>
                      <TextField
                        type="password"
                        placeholder="Confirm your new password"
                        {...register('confirmPassword', { required: 'Please confirm your password' })}
                        fullWidth
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#7c3aed' },
                            '&.Mui-focused fieldset': { borderColor: '#7c3aed' }
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ pt: 1 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth
                        size="large"
                        sx={{
                          background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '1rem',
                          py: 1.3,
                          borderRadius: 2,
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
                          }
                        }}
                      >
                        Update Password
                      </Button>
                    </Box>
                  </Stack>
                </form>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  )
}
