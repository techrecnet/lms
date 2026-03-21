import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Stack, Alert, Typography } from '@mui/material'
import { api } from '../../core/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    if (!token) setError('Reset token missing. Please use the link from your email.')
  }, [token])

  const submit = async () => {
    setError(null)
    if (!password || password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setSuccess('Password reset successful. Redirecting to login...')
      setTimeout(() => nav('/login'), 1500)
    } catch (e: any) {
      setError(e.response?.data?.msg || 'Failed to reset password')
    } finally { setLoading(false) }
  }

  return (
    <Box className="main-wrapper">
      <Box className="login-content">
        <Box sx={{ maxWidth: 480, mx: 'auto', py: 8 }}>
          <Typography variant="h4" gutterBottom>Choose a new password</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Stack spacing={2}>
            <TextField label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
            <TextField label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} fullWidth />
            <Button variant="contained" onClick={submit} disabled={loading || !!error}>{loading ? 'Resetting...' : 'Reset Password'}</Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
