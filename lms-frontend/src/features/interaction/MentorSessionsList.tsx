import { useEffect, useState } from 'react'
import { api } from '../../core/api'
import { Button, Paper, Stack, Typography, Chip, Dialog, TextField, Box, LinearProgress, Autocomplete } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import GroupsIcon from '@mui/icons-material/Groups'

export default function MentorSessionsList() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialog, setCreateDialog] = useState(false)
  const [newSession, setNewSession] = useState({ courseIds: [], startTime: '', durationMinutes: 30 })

  const loadSessions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/interaction/mentor/sessions')
      setSessions(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses')
      setCourses(res.data || [])
    } catch (e) {
      console.error('Failed to load courses:', e)
    }
  }

  useEffect(() => {
    loadSessions()
    loadCourses()
  }, [])

  const handleStartSession = async (sessionId: string) => {
    try {
      await api.post(`/interaction/sessions/${sessionId}/start`)
      navigate(`/mentor/interaction/${sessionId}`)
    } catch (e) {
      alert('Failed to start session')
    }
  }

  const handleEndSession = async (sessionId: string) => {
    try {
      await api.post(`/interaction/sessions/${sessionId}/end`)
      loadSessions()
    } catch (e) {
      alert('Failed to end session')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'scheduled': return 'info'
      case 'completed': return 'default'
      default: return 'default'
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Interaction Sessions</Typography>
          <Button variant="contained" size="small" onClick={() => setCreateDialog(true)}>
            + Create Session
          </Button>
        </Stack>

        {loading ? (
          <LinearProgress />
        ) : sessions.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No sessions scheduled yet.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {sessions.map(session => (
              <Paper key={session._id} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {session.courses?.map((c: any) => c.title).join(', ')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatTime(session.startTime)} - {session.durationMinutes} mins
                      </Typography>
                    </Box>
                    <Chip label={session.status} color={getStatusColor(session.status) as any} size="small" />
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <GroupsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="caption">
                      {session.joinedUsers?.length || 0} users joined
                    </Typography>
                  </Stack>

                  {session.status === 'scheduled' && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => handleStartSession(session._id)}
                      fullWidth
                    >
                      Start Session
                    </Button>
                  )}

                  {session.status === 'active' && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/mentor/interaction/${session._id}`)}
                        fullWidth
                      >
                        Continue Session
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<StopIcon />}
                        onClick={() => handleEndSession(session._id)}
                      >
                        End
                      </Button>
                    </Stack>
                  )}

                  {session.status === 'completed' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/mentor/interaction/${session._id}/review`)}
                      fullWidth
                    >
                      Review Session
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Create Interaction Session</Typography>
          <Stack spacing={2}>
            <Autocomplete
              multiple
              options={courses}
              getOptionLabel={(option) => option.title}
              value={newSession.courseIds}
              onChange={(e, value) => setNewSession({ ...newSession, courseIds: value })}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField {...params} label="Select Courses" />
              )}
            />
            <TextField
              label="Start Time"
              type="datetime-local"
              value={newSession.startTime}
              onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={newSession.durationMinutes}
              onChange={(e) => setNewSession({ ...newSession, durationMinutes: parseInt(e.target.value) })}
              fullWidth
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" fullWidth onClick={async () => {
                if (!newSession.courseIds || newSession.courseIds.length === 0 || !newSession.startTime) {
                  alert('Please fill all fields')
                  return
                }
                try {
                  // Get current user (mentor)
                  const meRes = await api.get('/users/me')
                  await api.post('/interaction/sessions', {
                    mentor: meRes.data._id,
                    courses: newSession.courseIds.map((c: any) => c._id),
                    startTime: new Date(newSession.startTime),
                    durationMinutes: newSession.durationMinutes
                  })
                  setNewSession({ courseIds: [], startTime: '', durationMinutes: 30 })
                  setCreateDialog(false)
                  loadSessions()
                } catch (e) {
                  alert('Failed to create session: ' + (e as any).message)
                }
              }}>
                Create
              </Button>
              <Button variant="outlined" fullWidth onClick={() => setCreateDialog(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </Stack>
  )
}
