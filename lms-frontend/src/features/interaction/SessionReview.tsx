import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../core/api'
import {
  Box,
  Paper,
  Stack,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Grid
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'

export default function SessionReview() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [recording, setRecording] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [whiteboardOpen, setWhiteboardOpen] = useState(false)
  const [attendanceOpen, setAttendanceOpen] = useState(false)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await api.get(`/interaction/sessions/${id}`)
        setSession(res.data)
        
        // Load comprehensive report data
        try {
          const reportRes = await api.get(`/interaction/sessions/${id}/report`)
          setReport(reportRes.data)
        } catch (e) {
          console.error('Failed to load session report:', e)
        }
        
        // Load recording if it exists
        if (res.data.recordingFile) {
          const recordingRes = await api.get(`/interaction/recordings/${res.data.recordingFile}`)
          setRecording(recordingRes.data)
        }
      } catch (e) {
        console.error('Failed to load session', e)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [id])

  if (loading) return <LinearProgress />
  if (!session) return <Typography>Session not found</Typography>

  const handleDownloadTranscript = () => {
    const transcript = {
      sessionId: session._id,
      mentor: session.mentor?.name,
      courses: session.courses?.map(c => c.title).join(', '),
      startTime: session.startTime,
      endTime: session.updatedAt,
      participants: session.joinedUsers?.map(u => ({ name: u.name, email: u.email })),
      chatLog: session.chatLog,
      whiteboardLog: session.whiteboardLog
    }
    
    const dataStr = JSON.stringify(transcript, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `session_${session._id}_transcript.json`
    link.click()
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Session Review
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {session.courses?.map((c: any) => c.title).join(', ')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTranscript}
              size="small"
            >
              Download Transcript
            </Button>
            <Chip label={session.status} color={session.status === 'completed' ? 'success' : 'default'} />
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Mentor
            </Typography>
            <Typography variant="body2">{session.mentor?.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Scheduled Duration
            </Typography>
            <Typography variant="body2">{report?.scheduledDurationMinutes || session.durationMinutes} minutes</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Actual Duration
            </Typography>
            <Typography variant="body2">
              {report?.actualDurationMinutes ? `${report.actualDurationMinutes} minutes` : 'Not ended'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Users Joined
            </Typography>
            <Typography variant="body2">{report?.totalUsersJoined || session.joinedUsers?.length || 0}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Scheduled Start
            </Typography>
            <Typography variant="body2">{new Date(session.startTime).toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Actual Start
            </Typography>
            <Typography variant="body2">
              {report?.actualStartTime ? new Date(report.actualStartTime).toLocaleString() : 'Not started'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Total Messages
            </Typography>
            <Typography variant="body2">{report?.totalMessages || 0}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Files Shared
            </Typography>
            <Typography variant="body2">{report?.totalFilesShared || 0}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <Button
            variant="outlined"
            onClick={() => setAttendanceOpen(true)}
            fullWidth
          >
            View Attendance ({report?.userAttendance?.length || 0} users)
          </Button>
          <Button
            variant="outlined"
            onClick={() => setChatOpen(true)}
            fullWidth
          >
            View Chat Transcript ({report?.totalMessages || session.chatLog?.length || 0} messages)
          </Button>
          <Button
            variant="outlined"
            onClick={() => setWhiteboardOpen(true)}
            fullWidth
            disabled={!session.whiteboardLog || session.whiteboardLog.length === 0}
          >
            View Whiteboard Actions ({session.whiteboardLog?.length || 0} actions)
          </Button>
        </Stack>
      </Paper>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onClose={() => setChatOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Chat Transcript
          </Typography>
          <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
            {(!session.chatLog || session.chatLog.length === 0) ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No messages in this session
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {session.chatLog.map((msg: any, idx: number) => (
                  <Paper key={idx} sx={{ p: 1.5, backgroundColor: '#f5f5f5', borderLeft: '3px solid #1976d2' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {msg.senderName} {msg.isGroupChat ? '(Group)' : '(Private)'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {msg.content}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
          <Button variant="outlined" fullWidth onClick={() => setChatOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Dialog>

      {/* Whiteboard Dialog */}
      <Dialog open={whiteboardOpen} onClose={() => setWhiteboardOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Whiteboard Actions
          </Typography>
          <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Action</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {session.whiteboardLog?.map((action: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{action.action}</TableCell>
                    <TableCell>{new Date(action.timestamp).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {JSON.stringify(action.data).substring(0, 50)}...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Button variant="outlined" fullWidth onClick={() => setWhiteboardOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={attendanceOpen} onClose={() => setAttendanceOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            User Attendance Report
          </Typography>
          <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
            {(!report?.userAttendance || report.userAttendance.length === 0) ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No attendance data available
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>User</TableCell>
                    <TableCell align="right">Times Joined</TableCell>
                    <TableCell align="right">Total Duration (mins)</TableCell>
                    <TableCell>First Join Time</TableCell>
                    <TableCell>Last Leave Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.userAttendance.map((user: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{user.userName}</TableCell>
                      <TableCell align="right">{user.joinCount}</TableCell>
                      <TableCell align="right">{user.totalDuration}</TableCell>
                      <TableCell>
                        {user.firstJoinTime ? new Date(user.firstJoinTime).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {user.lastLeaveTime ? new Date(user.lastLeaveTime).toLocaleString() : 'Still active'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
          <Button variant="outlined" fullWidth onClick={() => setAttendanceOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Dialog>
    </Stack>
  )
}
