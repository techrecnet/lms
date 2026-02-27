import { useForm } from 'react-hook-form'
import { Button, Container, TextField, Typography, Paper, Stack, Box, Chip, Alert } from '@mui/material'
import { useState } from 'react'
import { api } from '../../core/api'
import { useAppDispatch } from '../../shared/hooks/redux'
import { setToken } from './authSlice'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'

type Form = { email: string; password: string }

export default function Login() {
  const { register, handleSubmit } = useForm<Form>({ defaultValues: { email: '', password: '' } })
  const dispatch = useAppDispatch()
  const nav = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: Form) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await api.post('/auth/login', data)
      // backend returns { token }
      dispatch(setToken(res.data.token))
      const token = res.data.token as string
      const payload = JSON.parse(atob(token.split('.')[1]))
      const redirect = new URLSearchParams(location.search).get('redirect')
      if (redirect && redirect.startsWith('/')) {
        nav(redirect)
      } else {
        nav(payload.role === 'admin' ? '/admin' : payload.role === 'mentor' ? '/mentor' : '/app')
      }
    } catch (err: any) {
      setError(err?.response?.data?.msg || 'Invalid email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(150deg, #f6f2eb 0%, #fdf9f4 50%, #f4efe7 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 540,
          height: 540,
          background: 'radial-gradient(circle, rgba(213,121,75,0.22), transparent 60%)',
          top: -180,
          right: -160
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 480,
          height: 480,
          background: 'radial-gradient(circle, rgba(15,61,48,0.18), transparent 60%)',
          bottom: -180,
          left: -140
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
            gap: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Stack spacing={2}>
            <Chip label="Learning Library" color="secondary" sx={{ width: 'fit-content' }} />
            <Typography variant="h3">Build a calm, capable learning space.</Typography>
            <Typography variant="body1" sx={{ maxWidth: 440 }}>
              A quiet control room for courses, cohorts, and progress. Everything curated, nothing chaotic.
            </Typography>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ p: 2.5, borderRadius: 3, backgroundColor: 'rgba(15,61,48,0.06)' }}>
                <Typography variant="subtitle2">Curate content</Typography>
                <Typography variant="body2">Design courses with clarity and structure.</Typography>
              </Box>
              <Box sx={{ p: 2.5, borderRadius: 3, backgroundColor: 'rgba(213,121,75,0.08)' }}>
                <Typography variant="subtitle2">Guide cohorts</Typography>
                <Typography variant="body2">Keep every learner on a steady path.</Typography>
              </Box>
            </Stack>
            {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Sample admin: <b>admin@example.com</b> / <b>123456</b>
            </Typography> */}
          </Stack>

          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Sign in</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField label="Email" {...register('email', { required: true })} />
                <TextField label="Password" type="password" {...register('password', { required: true })} />
                <Button variant="contained" type="submit" disabled={isSubmitting}>Login</Button>
                <Button component={RouterLink} to="/signup" color="secondary">Create an account</Button>
              </Stack>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
