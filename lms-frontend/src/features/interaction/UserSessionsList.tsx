import { useEffect, useState } from 'react'
import { api } from '../../core/api'
import { Button, Paper, Stack, Typography, Chip, LinearProgress, Box, Dialog } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'

export default function UserSessionsList() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [requestedSessions, setRequestedSessions] = useState<Set<string>>(new Set())

  const loadSessions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/interaction/user/sessions')
      console.log('User sessions loaded:', res.data)
      setSessions(res.data || [])
    } catch (e: any) {
      console.error('Failed to load user sessions:', e)
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleRequestToJoin = async (sessionId: string) => {
    try {
      await api.post(`/interaction/sessions/${sessionId}/request-join`)
      setRequestedSessions(prev => new Set(prev).add(sessionId))
      alert('Join request sent to mentor')
    } catch (e) {
      alert('Failed to send join request')
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'scheduled': return 'info'
      default: return 'default'
    }
  }

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: '#f9f9f9' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          Available Mentor Sessions
        </Typography>

        {loading ? (
          <LinearProgress />
        ) : sessions.length === 0 ? (
          <Box sx={{ p: 2, backgroundColor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              No mentor sessions available for your courses at the moment.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {sessions.map(session => (
              <Paper key={session._id} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {session.courses?.map((c: any) => c.title).join(', ')}
                      </Typography>
                      <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">
                          {session.mentor?.name}
                        </Typography>
                      </Stack>
                    </Box>
                    <Chip label={session.status} color={getStatusColor(session.status) as any} size="small" />
                  </Stack>

                  <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'text.secondary' }}>
                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption">
                      {formatTime(session.startTime)} - {session.durationMinutes} mins
                    </Typography>
                  </Stack>

                  {session.status === 'active' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => navigate(`/user/interaction/${session._id}`)}
                      fullWidth
                    >
                      Join Live Session
                    </Button>
                  )}

                  {session.status === 'scheduled' && (
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={requestedSessions.has(session._id)}
                      onClick={() => handleRequestToJoin(session._id)}
                      fullWidth
                    >
                      {requestedSessions.has(session._id) ? 'Request Sent' : 'Request to Join'}
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  )
}
