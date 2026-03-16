import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { api } from '../../core/api'
import {
  Box,
  Fab,
  Menu,
  MenuItem,
  Badge,
  Typography,
  Divider,
  Stack,
  Chip,
  Button
} from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

export default function SessionFAB() {
  const navigate = useNavigate()
  const currentUser = useSelector((state: any) => state.auth.user)
  const [sessions, setSessions] = useState<any[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)

  const loadSessions = async () => {
    setLoading(true)
    try {
      // Determine if user is mentor or regular user based on role
      let endpoint = '/interaction/user/sessions'
      if (currentUser?.role === 'mentor') {
        endpoint = '/interaction/mentor/sessions'
      }
      
      const res = await api.get(endpoint)
      const allSessions = res.data || []
      
      // Filter to only show scheduled and active sessions
      const activeSessions = allSessions.filter((s: any) => 
        s.status === 'scheduled' || s.status === 'active'
      )
      setSessions(activeSessions)
    } catch (e) {
      console.error('Failed to load sessions:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
    
    // Refresh sessions every 30 seconds
    const interval = setInterval(loadSessions, 30000)
    return () => clearInterval(interval)
  }, [currentUser?.role])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleJoinSession = async (sessionId: string) => {
    try {
      // Check if user is already in joined users
      const sessionRes = await api.get(`/interaction/sessions/${sessionId}`)
      const session = sessionRes.data
      const isAlreadyJoined = session.joinedUsers?.some((u: any) => u._id === currentUser?.id)
      
      if (!isAlreadyJoined && currentUser?.role !== 'mentor') {
        // For regular users who haven't joined, join the session first
        await api.post(`/interaction/sessions/${sessionId}/join`)
      }
      
      handleMenuClose()
      // Navigate to correct path based on user role
      if (currentUser?.role === 'mentor') {
        navigate(`/mentor/interaction/${sessionId}`)
      } else {
        navigate(`/user/interaction/${sessionId}`)
      }
    } catch (e) {
      console.error('Failed to join session:', e)
      alert('Failed to join session: ' + (e as any).message)
    }
  }

  const getSessionStatus = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'LIVE', color: 'error' as const }
      case 'scheduled':
        return { label: 'SCHEDULED', color: 'info' as const }
      default:
        return { label: status.toUpperCase(), color: 'default' as const }
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!sessions || sessions.length === 0) {
    return null // Don't show FAB if no sessions available
  }

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        onClick={handleMenuClick}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#1565c0'
          }
        }}
      >
        <Badge badgeContent={sessions.length} color="error">
          <ChatIcon sx={{ color: 'white' }} />
        </Badge>
      </Fab>

      {/* Sessions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            maxWidth: 350,
            maxHeight: 500,
            borderRadius: 2
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Available Sessions ({sessions.length})
          </Typography>
          <Divider />
        </Box>

        {sessions.map((session, idx) => {
          const statusInfo = getSessionStatus(session.status)
          return (
            <Box key={idx} sx={{ px: 2, py: 1 }}>
              <Stack spacing={1} sx={{ mb: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                    {session.courses?.map((c: any) => c.title).join(', ')}
                  </Typography>
                  <Chip 
                    label={statusInfo.label} 
                    size="small" 
                    color={statusInfo.color}
                    variant="filled"
                  />
                </Stack>
                
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  🕐 {formatTime(session.startTime)}
                  {session.status === 'active' && (
                    <Box component="span" sx={{ display: 'block', color: '#d32f2f', fontWeight: 500 }}>
                      ● Session is LIVE
                    </Box>
                  )}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleJoinSession(session._id)}
                  >
                    {session.status === 'active' ? 'Join Now' : 'Enter'}
                  </Button>
                </Stack>
              </Stack>
              
              {idx < sessions.length - 1 && <Divider />}
            </Box>
          )
        })}
      </Menu>
    </>
  )
}
