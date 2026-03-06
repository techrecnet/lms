import { useState, useEffect } from 'react'
import { Box, Button, Paper, Stack, Typography, Avatar, Alert } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { api } from '../../../core/api'
import { ENV } from '../../../app/env'
import { useAppDispatch } from '../../../shared/hooks/redux'
import { fetchUserProfile } from '../../auth/authSlice'

export default function ProfileImagePage() {
  const dispatch = useAppDispatch()
  const [profile, setProfile] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    setError('')
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError('')
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const res = await api.post('/users/me/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setProfile(res.data.user)
      setSuccess(true)
      setSelectedFile(null)
      setPreview(null)
      dispatch(fetchUserProfile() as any)
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  if (!profile) return <Typography>Loading...</Typography>

  const currentImage = profile.studentImage ? `${apiBase}${profile.studentImage}` : null

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Update Profile Picture</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Upload a new profile picture (Max 5MB, JPG/PNG)
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile picture updated successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3} alignItems="center">
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Picture</Typography>
            <Avatar
              src={currentImage || undefined}
              sx={{ width: 120, height: 120 }}
            >
              {!currentImage && profile.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Box>

          {preview && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>New Picture Preview</Typography>
              <Avatar
                src={preview}
                sx={{ width: 120, height: 120 }}
              />
            </Box>
          )}

          <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              Select Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Button>

            {selectedFile && (
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploading}
                fullWidth
              >
                {uploading ? 'Uploading...' : 'Upload Picture'}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}
