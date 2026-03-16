import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { api } from '../../core/api'
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Dialog,
  IconButton,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import DeleteIcon from '@mui/icons-material/Delete'
import DrawIcon from '@mui/icons-material/Draw'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FolderIcon from '@mui/icons-material/Folder'


export default function InteractionBoard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUser = useSelector((state: any) => state.auth.user)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'mentor' | 'user' | 'admin'>('user')
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [recordingAudio, setRecordingAudio] = useState(false)
  const [whiteboardOpen, setWhiteboardOpen] = useState(false)
  const [sessionError, setSessionError] = useState<string>('')
  const [filesOpen, setFilesOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showStartNotification, setShowStartNotification] = useState(true)
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null)
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // Helper to safely get audio permission from plain object (comes as object from JSON, not Map)
  const hasAudioPermission = (userId: string) => {
    // Admin always has audio permission
    if (userRole === 'admin') return true
    if (!session?.audioPermissions) return false
    return session.audioPermissions[userId] === true
  }

  useEffect(() => {
    const loadSession = async () => {
      try {
        setSessionError('')
        const res = await api.get(`/interaction/sessions/${id}`)
        setSession(res.data)
        setMessages(res.data.chatLog || [])
        
        // Check if session is active and show notification if started early
        if (res.data.status === 'active' && showStartNotification) {
          const scheduledTime = new Date(res.data.startTime).getTime()
          const currentTime = new Date().getTime()
          if (currentTime < scheduledTime) {
            // Session started before scheduled time
            alert(`⏰ Mentor has started the session early!`)
            setShowStartNotification(false)
          }
        }
        
        // Determine if current user is mentor by comparing IDs
        // currentUser.id could be either a User ID or Mentor ID depending on user role
        const mentorId = res.data.mentor?._id || res.data.mentor
        let isMentor = false
        if (currentUser?.id === mentorId) {
          setUserRole('mentor')
          isMentor = true
        } else if (currentUser?.role === 'admin') {
          setUserRole('admin')
        } else {
          setUserRole('user')
        }
        
        // If user is not mentor and session is active, automatically join the session
        if (!isMentor && res.data.status === 'active') {
          try {
            const joinRes = await api.post(`/interaction/sessions/${id}/join`)
            console.log('User joined session')
            // Update session with the populated data from join response
            if (joinRes.data) {
              setSession(joinRes.data)
            }
          } catch (joinError) {
            console.error('Failed to auto-join session:', joinError)
            // Don't prevent loading if join fails
          }
        }
      } catch (e: any) {
        console.error('Failed to load session', e)
        if (e.response?.status === 404) {
          setSessionError('Session not found. It may have been deleted or does not exist.')
        } else if (e.response?.status === 401) {
          setSessionError('Unauthorized. Please log in again.')
        } else {
          setSessionError('Failed to load session. Please check your connection and try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (!id) {
      setSessionError('No session ID provided')
      setLoading(false)
      return
    }

    loadSession()
    // Poll for updates every 2 seconds
    const interval = setInterval(loadSession, 2000)
    return () => clearInterval(interval)
  }, [id, currentUser?.id, showStartNotification])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Load whiteboard image when dialog opens
    if (whiteboardOpen && session?.whiteboardImage) {
      const timer = setTimeout(() => loadWhiteboardImage(), 50)
      return () => clearTimeout(timer)
    }
  }, [whiteboardOpen, session?.whiteboardImage])

  const handleSendMessage = async () => {
    if (audioEnabled && recordingAudio) {
      // Stop recording and send audio
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        return; // Will be handled by ondataavailable
      }
    } else if (audioEnabled && !recordingAudio) {
      // Start recording
      startAudioRecording()
      return
    }
    
    // Send text message
    if (!newMessage.trim()) return

    try {
      await api.post(`/interaction/sessions/${id}/chat`, {
        type: 'text',
        content: newMessage,
        isGroupChat: !selectedUser,
        recipient: selectedUser
      })
      setNewMessage('')
      // Reload messages
      const res = await api.get(`/interaction/sessions/${id}`)
      setMessages(res.data.chatLog || [])
    } catch (e) {
      alert('Failed to send message')
    }
  }

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        // Convert blob to base64
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64Audio = reader.result as string
          try {
            await api.post(`/interaction/sessions/${id}/chat`, {
              type: 'audio',
              content: 'Sent audio message',
              audioUrl: base64Audio,
              isGroupChat: !selectedUser,
              recipient: selectedUser
            })
            // Reload messages
            const res = await api.get(`/interaction/sessions/${id}`)
            setMessages(res.data.chatLog || [])
            setNewMessage('')
          } catch (e) {
            alert('Failed to send audio message')
          }
        }
        reader.readAsDataURL(audioBlob)
        
        // Stop the audio stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecordingAudio(true)
    } catch (error) {
      alert('Failed to access microphone. Please check permissions.')
      console.error('Microphone access error:', error)
    }
  }

  const handleMuteUser = async (userId: string, mute: boolean) => {
    try {
      await api.post(`/interaction/sessions/${id}/mute`, {
        userId,
        mute
      })
      const res = await api.get(`/interaction/sessions/${id}`)
      setSession(res.data)
    } catch (e) {
      alert('Failed to mute user')
    }
  }

  const handleAudioPermission = async (userId: string, allow: boolean) => {
    try {
      await api.post(`/interaction/sessions/${id}/audio-permission`, {
        userId,
        allow
      })
      const res = await api.get(`/interaction/sessions/${id}`)
      setSession(res.data)
    } catch (e) {
      alert('Failed to update audio permission')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      await api.post(`/interaction/sessions/${id}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Reload session to get updated file list
      const res = await api.get(`/interaction/sessions/${id}`)
      setSession(res.data)
      alert('File uploaded successfully!')
    } catch (e) {
      alert('Failed to upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDownloadFile = (filePath: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = filePath
    link.download = fileName
    link.click()
  }

  const handleDrawStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (userRole !== 'mentor' || !canvasRef.current) return
    
    setIsDrawing(true)
    const ctx = canvasRef.current.getContext('2d')
    if (ctx) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (ctx) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#000'
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const handleDrawEnd = () => {
    setIsDrawing(false)
    // Save whiteboard drawing to database
    if (canvasRef.current && userRole === 'mentor') {
      const imageData = canvasRef.current.toDataURL('image/png')
      api.post(`/interaction/sessions/${id}/whiteboard`, {
        action: 'draw',
        data: { timestamp: new Date() },
        imageData
      }).catch(err => console.error('Failed to save whiteboard:', err))
    }
  }

  const handleClearWhiteboard = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        // Save clear action
        api.post(`/interaction/sessions/${id}/whiteboard`, {
          action: 'clear',
          data: { timestamp: new Date() }
        }).catch(err => console.error('Failed to clear whiteboard:', err))
      }
    }
  }

  const loadWhiteboardImage = () => {
    if (session?.whiteboardImage && canvasRef.current) {
      const img = new Image()
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
        }
      }
      img.src = session.whiteboardImage
    }
  }

  const handleWhiteboardDialogOpen = () => {
    setWhiteboardOpen(true)
    // Load saved whiteboard image when dialog opens
    setTimeout(() => loadWhiteboardImage(), 100)
  }



  const getDisplayMessages = () => {
    if (!selectedUser) {
      // Show group chat
      return messages.filter(m => m.isGroupChat === true)
    } else {
      // Show personal chat with selected user
      return messages.filter(m =>
        m.isGroupChat === false &&
        (m.sender === selectedUser || m.recipient === selectedUser)
      )
    }
  }

  if (loading) return <LinearProgress />

  if (!session && !sessionError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Session not found</Typography>
      </Box>
    )
  }

  if (sessionError) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography color="error" variant="h6">
          Unable to Load Session
        </Typography>
        <Typography color="textSecondary">
          {sessionError}
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', backgroundColor: '#f5f5f5' }}>
      {/* Main chat area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper sx={{ p: 2, borderRadius: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                {session.courses?.map((c: any) => c.title).join(', ')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Mentor: {session.mentor?.name}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DrawIcon />}
                onClick={handleWhiteboardDialogOpen}
              >
                Whiteboard
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FolderIcon />}
                onClick={() => setFilesOpen(true)}
                disabled={!session?.sharedFiles || session.sharedFiles.length === 0}
              >
                Files ({session?.sharedFiles?.length || 0})
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFileUpload}
              />
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setLeaveConfirmOpen(true)}
              >
                Leave
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Chat messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <Stack spacing={1.5}>
            {getDisplayMessages().length === 0 ? (
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                {selectedUser ? 'No messages with this user yet' : 'No group messages yet'}
              </Typography>
            ) : (
              getDisplayMessages().map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender === (session.mentor?._id || session.mentor) ? 'flex-start' : 'flex-end',
                    mb: 1
                  }}
                >
                  <Paper
                    sx={{
                      maxWidth: '60%',
                      p: 1.5,
                      backgroundColor: msg.sender === (session.mentor?._id || session.mentor) ? '#e3f2fd' : '#c8e6c9'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {msg.senderName}
                    </Typography>
                    {msg.type === 'audio' && msg.audioUrl ? (
                      <Box sx={{ mt: 0.5 }}>
                        <audio controls style={{ width: '100%', maxWidth: '200px' }}>
                          <source src={msg.audioUrl} type="audio/wav" />
                          Your browser does not support the audio element.
                        </audio>
                      </Box>
                    ) : (
                      <Typography variant="body2">{msg.content}</Typography>
                    )}
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        {/* Message input */}
        <Paper sx={{ p: 2, borderRadius: 0 }}>
          <Stack spacing={1}>
            {selectedUser && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption">Chatting with: {selectedUser}</Typography>
                <Button size="small" onClick={() => setSelectedUser(null)}>Clear</Button>
              </Box>
            )}
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                placeholder={selectedUser ? 'Personal message...' : 'Group message...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !recordingAudio && handleSendMessage()}
                disabled={recordingAudio}
                size="small"
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && !recordingAudio}
              >
                {recordingAudio ? 'Recording...' : 'Send'}
              </Button>
            </Stack>

            {(userRole === 'user' || userRole === 'admin') && (
              <Button
                variant={audioEnabled || recordingAudio ? 'contained' : 'outlined'}
                startIcon={recordingAudio ? <MicIcon /> : audioEnabled ? <MicIcon /> : <MicOffIcon />}
                size="small"
                onClick={() => {
                  if (recordingAudio) {
                    // Stop recording and send
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                      mediaRecorderRef.current.stop()
                      setRecordingAudio(false)
                      setAudioEnabled(false)
                    }
                  } else if (audioEnabled) {
                    // Toggle off
                    setAudioEnabled(false)
                  } else {
                    // Toggle on
                    setAudioEnabled(true)
                  }
                }}
                disabled={!hasAudioPermission(currentUser?.id || session.mentor?._id || session.mentor)}
                sx={{
                  color: recordingAudio ? '#d32f2f' : undefined,
                  animation: recordingAudio ? 'pulse 0.6s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 }
                  }
                }}
              >
                {recordingAudio ? 'Stop & Send' : audioEnabled ? 'Ready' : 'Start Audio'}
              </Button>
            )}
          </Stack>
        </Paper>
      </Box>

      {/* Right sidebar - Users list (only for mentors) */}
      {userRole === 'mentor' && (
      <Box sx={{ width: 320, borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        {/* Users list */}
        <Paper sx={{ p: 2, flex: 1, overflowY: 'auto', borderRadius: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Joined Users
          </Typography>
          <List dense sx={{ p: 0 }}>
            {session.joinedUsers?.map((user: any) => (
                <ListItem
                  key={user._id}
                  disablePadding
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleAudioPermission(user._id, !hasAudioPermission(user._id))}
                        title={hasAudioPermission(user._id) ? 'Revoke audio' : 'Allow audio'}
                      >
                        {hasAudioPermission(user._id) ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleMuteUser(user._id, !session.mutedUsers?.includes(user._id))}
                        title={session.mutedUsers?.includes(user._id) ? 'Unmute' : 'Mute'}
                      >
                        {session.mutedUsers?.includes(user._id) ? <VolumeOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemButton 
                    onClick={() => {
                      setSelectedUser(user._id)
                      setSelectedUserDetails(user)
                      setUserDetailsOpen(true)
                    }} 
                    selected={selectedUser === user._id}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32 }}>{user.name?.[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user.name} secondary={user.email} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </Paper>
      </Box>
      )}

      {/* Whiteboard Dialog */}
      <Dialog open={whiteboardOpen} onClose={() => setWhiteboardOpen(false)} maxWidth="lg" fullWidth>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Whiteboard (Shared with all participants)
            </Typography>
            {userRole === 'mentor' && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleClearWhiteboard}
              >
                Clear
              </Button>
            )}
          </Stack>
          <Box
            sx={{
              width: '100%',
              height: 600,
              border: '2px solid #ccc',
              borderRadius: 1,
              backgroundColor: '#fff',
              cursor: userRole === 'mentor' ? 'crosshair' : 'default',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <canvas
              ref={canvasRef}
              width={1200}
              height={600}
              onMouseDown={userRole === 'mentor' ? handleDrawStart : undefined}
              onMouseMove={userRole === 'mentor' ? handleDrawMove : undefined}
              onMouseUp={userRole === 'mentor' ? handleDrawEnd : undefined}
              onMouseLeave={userRole === 'mentor' ? handleDrawEnd : undefined}
              style={{
                display: 'block',
                cursor: userRole === 'mentor' ? 'crosshair' : 'default',
                touchAction: 'none',
                width: '100%',
                height: '100%'
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
            {userRole === 'mentor'
              ? 'Draw on the whiteboard. Your drawings are saved and visible to all participants.'
              : 'Viewing whiteboard. Updates every 2 seconds.'}
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setWhiteboardOpen(false)}>
              Close
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* Files Dialog */}
      <Dialog open={filesOpen} onClose={() => setFilesOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          {/* Shared Files Section */}
          <Typography variant="h6" sx={{ mb: 2 }}>Shared Files</Typography>
          {session?.sharedFiles && session.sharedFiles.length > 0 ? (
            <List>
              {session.sharedFiles.map((file: any, idx: number) => (
                <ListItem
                  key={idx}
                  secondaryAction={
                    <Button
                      size="small"
                      startIcon={<FileDownloadIcon />}
                      onClick={() => handleDownloadFile(file.filePath, file.fileName)}
                    >
                      Download
                    </Button>
                  }
                >
                  <ListItemText
                    primary={file.fileName}
                    secondary={`${(file.fileSize / 1024).toFixed(2)} KB`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              No files shared yet
            </Typography>
          )}

          {/* Pending Files Section - Only for Mentors */}
          {userRole === 'mentor' && session?.pendingFiles && session.pendingFiles.length > 0 && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Pending Approvals ({session.pendingFiles.length})
              </Typography>
              <List>
                {session.pendingFiles.map((file: any, idx: number) => (
                  <Paper key={idx} sx={{ p: 2, mb: 1, backgroundColor: '#fff3e0' }}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {file.fileName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {file.uploaderName} • {(file.fileSize / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={async () => {
                            try {
                              await api.post(`/interaction/sessions/${id}/approve-file`, { fileIndex: idx })
                              const res = await api.get(`/interaction/sessions/${id}`)
                              setSession(res.data)
                              alert('File approved')
                            } catch (e) {
                              alert('Failed to approve file')
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={async () => {
                            try {
                              await api.post(`/interaction/sessions/${id}/reject-file`, { fileIndex: idx })
                              const res = await api.get(`/interaction/sessions/${id}`)
                              setSession(res.data)
                              alert('File rejected')
                            } catch (e) {
                              alert('Failed to reject file')
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </List>
            </Box>
          )}

          {/* User Upload Status */}
          {userRole === 'user' && session?.pendingFiles && session.pendingFiles.length > 0 && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#e3f2fd', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Your Uploads Pending Approval
              </Typography>
              <List dense>
                {session.pendingFiles
                  .filter((file: any) => file.uploadedBy === currentUser?.id)
                  .map((file: any, idx: number) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={file.fileName}
                        secondary={`Waiting for mentor approval • ${(file.fileSize / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
              </List>
            </Box>
          )}

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setFilesOpen(false)}
          >
            Close
          </Button>
        </Box>
      </Dialog>

      {/* User details dialog */}
      <Dialog open={userDetailsOpen} onClose={() => setUserDetailsOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            User Details
          </Typography>
          {selectedUserDetails && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 64, height: 64 }}>
                  {selectedUserDetails.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {selectedUserDetails.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {selectedUserDetails.email}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  USER ID
                </Typography>
                <Typography variant="body2">{selectedUserDetails._id}</Typography>
              </Box>
              {selectedUserDetails.phone && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    PHONE
                  </Typography>
                  <Typography variant="body2">{selectedUserDetails.phone}</Typography>
                </Box>
              )}
              {selectedUserDetails.institute && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    INSTITUTE
                  </Typography>
                  <Typography variant="body2">{selectedUserDetails.institute}</Typography>
                </Box>
              )}
            </Stack>
          )}
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={() => setUserDetailsOpen(false)} 
            sx={{ mt: 3 }}
          >
            Close
          </Button>
        </Box>
      </Dialog>

      {/* Leave confirmation dialog */}
      <Dialog open={leaveConfirmOpen} onClose={() => setLeaveConfirmOpen(false)} maxWidth="xs" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Leave Session?
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Are you sure you want to leave this session? You can rejoin later if the session is still active.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={async () => {
                try {
                  // Call the leave endpoint to log the user leaving
                  await api.post(`/interaction/sessions/${id}/leave`)
                } catch (e) {
                  console.error('Error leaving session:', e)
                }
                setLeaveConfirmOpen(false)
                navigate(userRole === 'mentor' ? '/mentor' : '/app')
              }}
            >
              Leave
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setLeaveConfirmOpen(false)}
            >
              Stay
            </Button>
          </Stack>
        </Box>
      </Dialog>

    </Box>
  )
}
