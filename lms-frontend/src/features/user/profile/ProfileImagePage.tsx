import { useState, useEffect } from 'react'
import { Box, Button, Paper, Stack, Typography, Avatar, Alert, Container, Card, CardContent, Fade, Divider } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PhotoIcon from '@mui/icons-material/Photo'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
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

  if (!profile) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Typography>Loading...</Typography>
    </Box>
  )

  const currentImage = profile.studentImage ? `${apiBase}${profile.studentImage}` : null

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
                    <PhotoIcon sx={{ color: '#7c3aed', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                    Profile Picture
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Upload a new profile picture (Max 5MB, JPG/PNG)
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#e5e7eb' }} />

                {success && (
                  <Alert severity="success" sx={{ borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Profile picture updated successfully!</Typography>
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{error}</Typography>
                  </Alert>
                )}

                <Stack spacing={3} alignItems="center" sx={{ py: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>
                      Current Picture
                    </Typography>
                    <Avatar
                      src={currentImage || undefined}
                      sx={{ 
                        width: 140, 
                        height: 140,
                        margin: '0 auto',
                        border: '4px solid #7c3aed',
                        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.2)',
                        fontSize: '3rem',
                        fontWeight: 700
                      }}
                    >
                      {!currentImage && profile.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </Box>

                  {preview && (
                    <Box sx={{ textAlign: 'center', pt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
                        <Divider sx={{ flex: 1 }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>NEW</Typography>
                        <Divider sx={{ flex: 1 }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>
                        Preview
                      </Typography>
                      <Avatar
                        src={preview}
                        sx={{ 
                          width: 140, 
                          height: 140,
                          margin: '0 auto',
                          border: '4px solid #10b981',
                          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)'
                        }}
                      />
                    </Box>
                  )}

                  <Stack spacing={2} sx={{ width: '100%', pt: preview ? 2 : 0 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      size="large"
                      sx={{
                        borderColor: '#7c3aed',
                        color: '#7c3aed',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderWidth: 2,
                        py: 1.3,
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: '#7c3aed',
                          backgroundColor: 'rgba(124, 58, 237, 0.08)',
                          borderWidth: 2
                        }
                      }}
                    >
                      {selectedFile ? 'Change Image' : 'Select Image'}
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
                        {uploading ? 'Uploading...' : 'Upload Picture'}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  )
}
