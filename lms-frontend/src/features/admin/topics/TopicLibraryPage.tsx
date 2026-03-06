import { useEffect, useState, useRef } from 'react'
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { api } from '../../../core/api'
import { parseCsv } from '../../../shared/utils/parseCsv'
import { useNavigate } from 'react-router-dom'
import { exportToCsv } from '../../../shared/utils/exportCsv'

export default function TopicLibraryPage() {
    const [selected, setSelected] = useState<string[]>([])
  const navigate = useNavigate()
  const [rows, setRows] = useState<any[]>([])
  const [bulkDialog, setBulkDialog] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [courseId, setCourseId] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  const load = async () => {
    setLoading(true)
    try {
      const [topicRes, courseRes] = await Promise.all([
        api.get('/api/topics-lib', {
          params: { courseId: courseId || undefined }
        }),
        api.get('/courses')
      ])
      setRows(topicRes.data)
      setCourses(courseRes.data)
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to fetch topics'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load().catch(() => setRows([])) }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await api.delete(`/api/topics-lib/${deleteId}`)
      setSnackbar({
        open: true,
        message: 'Topic deleted successfully',
        severity: 'success',
      })
      setDeleteId(null)
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to delete topic'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  const handleBulkFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkError(null)
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    let parsed
    try {
      parsed = parseCsv(text)
    } catch (err) {
      setBulkError('Failed to parse CSV')
      return
    }
    // Map course titles to IDs
    const courseTitleToId: Record<string, string> = {}
    courses.forEach(c => { courseTitleToId[c.title] = c._id })
    const topics = parsed.map(row => ({
      title: row.title,
      content: row.content || '',
      aiSummary: row.aiSummary || '',
      courseIds: (row.courses || '').split(',').map(t => courseTitleToId[t.trim()]).filter(Boolean)
    }))
    setBulkLoading(true)
    try {
      const res = await api.post('/api/topics-lib/bulk', topics)
      setSnackbar({ open: true, message: `Imported ${res.data.imported} topics`, severity: 'success' })
      setBulkDialog(false)
      load()
    } catch (err: any) {
      setBulkError(err.response?.data?.msg || 'Bulk import failed')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(rows.map(r => r._id))
    } else {
      setSelected([])
    }
  }

  const handleSelectOne = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const handleBulkDelete = async () => {
    if (selected.length === 0) return
    if (!window.confirm(`Delete ${selected.length} topics? This cannot be undone.`)) return
    try {
      await Promise.all(selected.map(id => api.delete(`/api/topics-lib/${id}`)))
      setSnackbar({ open: true, message: `Deleted ${selected.length} topics`, severity: 'success' })
      setSelected([])
      load()
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Bulk delete failed', severity: 'error' })
    }
  }

  return (
    <Box sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Search Filter */}
        <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <TextField select label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)} fullWidth>
              <MenuItem value="">All</MenuItem>
              {courses.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}
            </TextField>
            <Button variant="contained" onClick={load} sx={{ width: 'fit-content' }}>
              Search
            </Button>
            <Button variant="outlined" onClick={() => exportToCsv('topics.csv', rows, [
              { key: 'title', label: 'Topic' },
              { key: 'courses', label: 'Courses', value: (r: any) => r?.courseIds?.map((c: any) => c.title).join(', ') || '' }
            ])}>
              Export CSV
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setBulkDialog(true)}>
              Bulk Import
            </Button>
          </Stack>
        </Paper>

        {/* Table */}
        <Card>
          <CardHeader
            title="Topic Library"
            subheader="Create and manage reusable topics for courses"
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/topics-lib/new')}
                >
                  Add Topic
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setBulkDialog(true)}>
                  Bulk Import
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={selected.length === 0}
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </Stack>
            }
          />
          <CardContent>
                  {/* Bulk Import Dialog */}
                  <Dialog open={bulkDialog} onClose={() => setBulkDialog(false)}>
                    <DialogTitle>Bulk Import Topics (CSV)</DialogTitle>
                    <DialogContent>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Upload a CSV file with columns: <b>title, content, aiSummary, courses</b>.<br />
                        Courses should be comma-separated course titles.
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        disabled={bulkLoading}
                        sx={{ mb: 2 }}
                      >
                        Select CSV File
                        <input
                          type="file"
                          accept=".csv"
                          hidden
                          ref={fileInputRef}
                          onChange={handleBulkFile}
                        />
                      </Button>
                      {bulkLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                      {bulkError && <Alert severity="error" sx={{ mt: 2 }}>{bulkError}</Alert>}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setBulkDialog(false)} disabled={bulkLoading}>Cancel</Button>
                    </DialogActions>
                  </Dialog>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selected.length === rows.length && rows.length > 0}
                        onChange={handleSelectAll}
                        aria-label="Select all topics"
                      />
                    </TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell>Courses</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        No topics found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((topic) => (
                      <TableRow key={topic._id} hover selected={selected.includes(topic._id)}>
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            checked={selected.includes(topic._id)}
                            onChange={() => handleSelectOne(topic._id)}
                            aria-label={`Select topic ${topic.title}`}
                          />
                        </TableCell>
                        <TableCell>{topic.title}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {topic.courseIds?.map((c: any) => (
                              <Chip 
                                key={c._id} 
                                label={c.title} 
                                size="small" 
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/topics-lib/${topic._id}/edit`)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(topic._id)}
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Topic</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this topic? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}
