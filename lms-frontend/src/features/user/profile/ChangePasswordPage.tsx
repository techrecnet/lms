import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Paper, Stack, TextField, Typography, Alert } from '@mui/material'
import { api } from '../../../core/api'

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
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Change Password</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Update your account password
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password changed successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5} sx={{ maxWidth: 500 }}>
            <TextField
              label="Current Password"
              type="password"
              {...register('currentPassword', { required: true })}
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              {...register('newPassword', { required: true })}
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type="password"
              {...register('confirmPassword', { required: true })}
              fullWidth
            />
            <Box>
              <Button type="submit" variant="contained" size="large">
                Change Password
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
