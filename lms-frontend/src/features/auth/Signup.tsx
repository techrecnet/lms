import { useForm } from 'react-hook-form'
import { Button, Container, TextField, Typography, Paper, Stack, Box, Chip, Alert } from '@mui/material'
import { useState } from 'react'
import { api } from '../../core/api'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

type Form = { name: string; email: string; password: string; role?: 'admin' | 'user' }

export default function Signup() {
  const { register, handleSubmit } = useForm<Form>({ defaultValues: { role: 'user' } })
  const nav = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: Form) => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      await api.post('/auth/signup', data)
      setSuccess('Account created successfully. Redirecting to login...')
      setTimeout(() => nav('/login'), 1200)
    } catch (err: any) {
      setError(err?.response?.data?.msg || 'Signup failed. Please try again.')
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
        background: 'linear-gradient(160deg, #f6f2eb 0%, #f3efe8 35%, #fff8ef 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 520,
          height: 520,
          background: 'radial-gradient(circle, rgba(15,61,48,0.2), transparent 60%)',
          top: -200,
          left: -140
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 460,
          height: 460,
          background: 'radial-gradient(circle, rgba(213,121,75,0.2), transparent 60%)',
          bottom: -170,
          right: -130
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' },
            gap: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Create your account</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                {success && <Alert severity="success">{success}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <TextField label="Name" {...register('name', { required: true })} />
                <TextField label="Email" {...register('email', { required: true })} />
                <TextField label="Password" type="password" {...register('password', { required: true })} />
                <Button variant="contained" type="submit" disabled={isSubmitting}>Create account</Button>
                <Button component={RouterLink} to="/login" color="secondary">Back to login</Button>
              </Stack>
            </form>
          </Box>

          <Stack spacing={2}>
            <Chip label="Join the library" color="secondary" sx={{ width: 'fit-content' }} />
            <Typography variant="h3">Start curating knowledge.</Typography>
            <Typography variant="body1" sx={{ maxWidth: 420 }}>
              Bring your training, cohorts, and progress tracking into one calm, capable space.
            </Typography>
            <Stack spacing={1} sx={{ pt: 1 }}>
              <Box sx={{ p: 2.5, borderRadius: 3, backgroundColor: 'rgba(15,61,48,0.06)' }}>
                <Typography variant="subtitle2">Structured onboarding</Typography>
                <Typography variant="body2">Guide new hires with clear pathways.</Typography>
              </Box>
              <Box sx={{ p: 2.5, borderRadius: 3, backgroundColor: 'rgba(213,121,75,0.08)' }}>
                <Typography variant="subtitle2">Instant access</Typography>
                <Typography variant="body2">Give teams the tools they need fast.</Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
