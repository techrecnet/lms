import { useEffect, useState } from 'react'
import { api } from '../../../core/api'
import {
  Button,
  Paper,
  Stack,
  Typography,
  Dialog,
  TextField,
  Chip,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Autocomplete,
  IconButton,
  Grid,
  Divider,
  Tabs,
  Tab
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import AnalyticsIcon from '@mui/icons-material/Analytics'

export default function InteractionSessionsManagement() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialog, setCreateDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [reportDialog, setReportDialog] = useState(false)
  const [reportSession, setReportSession] = useState<any>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportTabValue, setReportTabValue] = useState(0)
  const [mentors, setMentors] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [editingSession, setEditingSession] = useState<any>(null)
  const [cancelingSession, setCancelingSession] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [newSession, setNewSession] = useState({
    mentor: null as any,
    courses: [] as any[],
    startTime: '',
    durationMinutes: 30
  })

  const loadSessions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/interaction/sessions')
      setSessions(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  const loadMentorsAndCourses = async () => {
    try {
      const [mentorRes, courseRes] = await Promise.all([
        api.get('/mentor'),
        api.get('/courses')
      ])
      setMentors(mentorRes.data || [])
      setCourses(courseRes.data || [])
    } catch (e) {
      console.error('Failed to load mentors and courses')
    }
  }

  useEffect(() => {
    loadSessions()
    loadMentorsAndCourses()
  }, [])

  const handleCreateSession = async () => {
    if (!newSession.mentor || newSession.courses.length === 0 || !newSession.startTime) {
      alert('Please fill all required fields')
      return
    }

    try {
      await api.post('/interaction/sessions', {
        mentor: newSession.mentor._id,
        courses: newSession.courses.map(c => c._id),
        startTime: new Date(newSession.startTime),
        durationMinutes: newSession.durationMinutes
      })
      setCreateDialog(false)
      setNewSession({ mentor: null, courses: [], startTime: '', durationMinutes: 30 })
      loadSessions()
    } catch (e) {
      alert('Failed to create session: ' + (e as any).message)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await api.delete(`/interaction/sessions/${sessionId}`)
        loadSessions()
      } catch (e) {
        alert('Failed to delete session')
      }
    }
  }

  const handleEditSession = (session: any) => {
    setEditingSession({
      ...session,
      mentorObj: mentors.find(m => m._id === session.mentor._id),
      coursesObj: session.courses
    })
    setEditDialog(true)
  }

  const handleUpdateSession = async () => {
    if (!editingSession.mentorObj || editingSession.coursesObj.length === 0 || !editingSession.startTime) {
      alert('Please fill all required fields')
      return
    }

    try {
      await api.put(`/interaction/sessions/${editingSession._id}`, {
        mentor: editingSession.mentorObj._id,
        courses: editingSession.coursesObj.map((c: any) => c._id),
        startTime: new Date(editingSession.startTime),
        durationMinutes: editingSession.durationMinutes
      })
      setEditDialog(false)
      setEditingSession(null)
      loadSessions()
    } catch (e) {
      alert('Failed to update session: ' + (e as any).message)
    }
  }

  const handleCancelSession = (session: any) => {
    setCancelingSession(session)
    setCancelReason('')
    setCancelDialog(true)
  }

  const handleViewReport = async (session: any) => {
    setReportSession(session)
    setReportLoading(true)
    setReportDialog(true)
    
    try {
      const res = await api.get(`/interaction/sessions/${session._id}/report`)
      setReportData(res.data)
    } catch (e) {
      console.error('Failed to load report:', e)
      alert('Failed to load session report')
    } finally {
      setReportLoading(false)
    }
  }

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason')
      return
    }

    try {
      await api.post(`/interaction/sessions/${cancelingSession._id}/cancel`, {
        reason: cancelReason
      })
      setCancelDialog(false)
      setCancelingSession(null)
      loadSessions()
    } catch (e) {
      alert('Failed to cancel session: ' + (e as any).message)
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'scheduled':
        return 'info'
      case 'completed':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Interaction Sessions
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Create and manage mentor-student interaction sessions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            Create Session
          </Button>
        </Stack>

        {loading ? (
          <LinearProgress />
        ) : sessions.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
            No sessions created yet
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Mentor</TableCell>
                <TableCell>Courses</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined Users</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map(session => (
                <TableRow key={session._id}>
                  <TableCell>{session.mentor?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {session.courses?.map((course: any) => (
                        <Chip key={course._id} label={course.title} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>{formatTime(session.startTime)}</TableCell>
                  <TableCell>{session.durationMinutes} mins</TableCell>
                  <TableCell>
                    <Chip
                      label={session.status}
                      color={getStatusColor(session.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{session.joinedUsers?.length || 0}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {session.status === 'scheduled' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditSession(session)}
                        >
                          Edit
                        </Button>
                      )}
                      {['scheduled', 'active'].includes(session.status) && (
                        <Button
                          size="small"
                          color="warning"
                          variant="outlined"
                          startIcon={<CloseIcon />}
                          onClick={() => handleCancelSession(session)}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="small"
                        color="info"
                        variant="outlined"
                        startIcon={<AnalyticsIcon />}
                        onClick={() => handleViewReport(session)}
                      >
                        Report
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteSession(session._id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Create Interaction Session
          </Typography>
          <Stack spacing={2}>
            <Autocomplete
              options={mentors}
              getOptionLabel={(option: any) => option.name || option.email}
              value={newSession.mentor}
              onChange={(e, value) => setNewSession({ ...newSession, mentor: value })}
              renderInput={(params) => <TextField {...params} label="Select Mentor" />}
            />

            <Autocomplete
              multiple
              options={courses}
              getOptionLabel={(option: any) => option.title}
              value={newSession.courses}
              onChange={(e, value) => setNewSession({ ...newSession, courses: value })}
              renderInput={(params) => <TextField {...params} label="Select Courses" />}
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
              <Button variant="contained" fullWidth onClick={handleCreateSession}>
                Create
              </Button>
              <Button variant="outlined" fullWidth onClick={() => setCreateDialog(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Edit Interaction Session
          </Typography>
          {editingSession && (
            <Stack spacing={2}>
              <Autocomplete
                options={mentors}
                getOptionLabel={(option: any) => option.name || option.email}
                value={editingSession.mentorObj}
                onChange={(e, value) => setEditingSession({ ...editingSession, mentorObj: value })}
                renderInput={(params) => <TextField {...params} label="Select Mentor" />}
              />

              <Autocomplete
                multiple
                options={courses}
                getOptionLabel={(option: any) => option.title}
                value={editingSession.coursesObj}
                onChange={(e, value) => setEditingSession({ ...editingSession, coursesObj: value })}
                renderInput={(params) => <TextField {...params} label="Select Courses" />}
              />

              <TextField
                label="Start Time"
                type="datetime-local"
                value={editingSession.startTime?.substring(0, 16) || ''}
                onChange={(e) => setEditingSession({ ...editingSession, startTime: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Duration (minutes)"
                type="number"
                value={editingSession.durationMinutes}
                onChange={(e) => setEditingSession({ ...editingSession, durationMinutes: parseInt(e.target.value) })}
                fullWidth
              />

              <Stack direction="row" spacing={1}>
                <Button variant="contained" fullWidth onClick={handleUpdateSession}>
                  Update
                </Button>
                <Button variant="outlined" fullWidth onClick={() => setEditDialog(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Cancel Session
          </Typography>
          {cancelingSession && (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Are you sure you want to cancel this session? Please provide a reason.
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2' }}>
                {cancelingSession.courses?.map((c: any) => c.title).join(', ')} • {cancelingSession.mentor?.name}
              </Typography>
              <TextField
                label="Cancellation Reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Enter the reason for cancellation..."
              />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="error" fullWidth onClick={handleConfirmCancel}>
                  Cancel Session
                </Button>
                <Button variant="outlined" fullWidth onClick={() => setCancelDialog(false)}>
                  Keep Session
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialog} onClose={() => {setReportDialog(false); setReportTabValue(0)}} maxWidth="md" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Session Report & Analytics
          </Typography>
          
          {reportLoading ? (
            <LinearProgress />
          ) : reportData ? (
            <Box>
              <Tabs 
                value={reportTabValue} 
                onChange={(e, newValue) => setReportTabValue(newValue)}
                sx={{ mb: 2, borderBottom: '1px solid #e0e0e0' }}
              >
                <Tab label="Overview" />
                <Tab label="Attendance" />
                <Tab label="Chat" />
                <Tab label="Files" />
                <Tab label="Whiteboard" />
              </Tabs>

              <Box sx={{ minHeight: 400, overflowY: 'auto' }}>
                {/* Tab 0: Overview */}
                {reportTabValue === 0 && (
                  <Stack spacing={3}>
              {/* Basic Info */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Session Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Mentor
                    </Typography>
                    <Typography variant="body2">{reportData.mentor?.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Status
                    </Typography>
                    <Chip 
                      label={reportData.status} 
                      color={reportData.status === 'completed' ? 'success' : 'info'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Scheduled Start
                    </Typography>
                    <Typography variant="body2">
                      {new Date(reportData.scheduledStartTime).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Actual Start
                    </Typography>
                    <Typography variant="body2">
                      {reportData.actualStartTime 
                        ? new Date(reportData.actualStartTime).toLocaleString()
                        : 'Not started'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Actual End
                    </Typography>
                    <Typography variant="body2">
                      {reportData.actualEndTime
                        ? new Date(reportData.actualEndTime).toLocaleString()
                        : 'Not ended'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Actual Duration
                    </Typography>
                    <Typography variant="body2">
                      {reportData.actualDurationMinutes || 0} minutes
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Statistics */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Session Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        {reportData.totalUsersJoined}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Users Joined
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                        {reportData.totalMessages}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Messages
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#f57c00' }}>
                        {reportData.totalFilesShared}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Files Shared
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#c62828' }}>
                        {reportData.currentActiveUsers?.length || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Currently Active
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
                  </Stack>
                )}

                {/* Tab 1: Attendance */}
                {reportTabValue === 1 && (
                  <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  User Attendance
                </Typography>
                {reportData.userAttendance && reportData.userAttendance.length > 0 ? (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>User</TableCell>
                          <TableCell align="right">Join Count</TableCell>
                          <TableCell align="right">Total Duration (mins)</TableCell>
                          <TableCell>First Join</TableCell>
                          <TableCell>Last Leave</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.userAttendance.map((user: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{user.userName}</TableCell>
                            <TableCell align="right">{user.joinCount}</TableCell>
                            <TableCell align="right">{user.totalDuration}</TableCell>
                            <TableCell>
                              {user.firstJoinTime
                                ? new Date(user.firstJoinTime).toLocaleTimeString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {user.lastLeaveTime
                                ? new Date(user.lastLeaveTime).toLocaleTimeString()
                                : 'Still active'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No attendance data available
                  </Typography>
                )}
                  </Box>
                )}

                {/* Current Active Users */}
                {reportData.currentActiveUsers && reportData.currentActiveUsers.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Currently Active Users
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {reportData.currentActiveUsers.map((user: any, idx: number) => (
                          <Chip
                            key={idx}
                            label={`${user.userName} (Last active: ${new Date(user.lastActivityTime).toLocaleTimeString()})`}
                            color="success"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  </>
                )}

              {/* Tab 2: Chat */}
              {reportTabValue === 2 && (
                <Box>
                  {reportData.chatLog && reportData.chatLog.length > 0 ? (
                    <Stack spacing={1.5}>
                      {reportData.chatLog.map((msg: any, idx: number) => (
                        <Paper key={idx} sx={{ p: 1.5, backgroundColor: '#f5f5f5', borderLeft: '3px solid #1976d2' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {msg.senderName} {msg.isGroupChat ? '(Group)' : '(Private)'}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {msg.content}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                            {new Date(msg.timestamp).toLocaleString()}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No chat messages in this session
                    </Typography>
                  )}
                </Box>
              )}

              {/* Tab 3: Files */}
              {reportTabValue === 3 && (
                <Box>
                  {reportData.sharedFiles && reportData.sharedFiles.length > 0 ? (
                  <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>File Name</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell>Uploaded By</TableCell>
                          <TableCell>Uploaded At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.sharedFiles.map((file: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{file.fileName}</TableCell>
                            <TableCell>{(file.fileSize / 1024).toFixed(2)} KB</TableCell>
                            <TableCell>{file.uploadedBy}</TableCell>
                            <TableCell>{new Date(file.uploadedAt).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No files shared in this session
                    </Typography>
                  )}
                </Box>
              )}

              {/* Tab 4: Whiteboard */}
              {reportTabValue === 4 && (
              <Box>
                {reportData.whiteboardLog && reportData.whiteboardLog.length > 0 ? (
                  <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>Action</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.whiteboardLog.map((action: any, idx: number) => (
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
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No whiteboard activity in this session
                    </Typography>
                  )}
                </Box>
              )}
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No report data available
            </Typography>
          )}

          <Button 
            variant="outlined" 
            fullWidth 
            onClick={() => setReportDialog(false)} 
            sx={{ mt: 3 }}
          >
            Close
          </Button>
        </Box>
      </Dialog>
    </Stack>
  )
}
