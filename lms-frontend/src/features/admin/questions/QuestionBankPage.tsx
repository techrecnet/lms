import { useEffect, useState } from 'react'
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
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
  Box,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { api } from '../../../core/api'
import { useNavigate } from 'react-router-dom'
import { exportToCsv } from '../../../shared/utils/exportCsv'

export default function QuestionBankPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [courseId, setCourseId] = useState('')
  const [type, setType] = useState('')
  const [level, setLevel] = useState('')
  const [keyword, setKeyword] = useState('')
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
      const [questRes, courseRes] = await Promise.all([
        api.get('/questions', {
          params: {
            courseId: courseId || undefined,
            type: type || undefined,
            level: level || undefined,
            keyword: keyword || undefined
          }
        }),
        api.get('/courses')
      ])
      setRows(questRes.data)
      setCourses(courseRes.data)
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to fetch questions'
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
      await api.delete(`/questions/${deleteId}`)
      setSnackbar({
        open: true,
        message: 'Question deleted successfully',
        severity: 'success',
      })
      setDeleteId(null)
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to delete question'
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

  return (
    <Box sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Search Filters */}
        <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <TextField select label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)} fullWidth>
                <MenuItem value="">All</MenuItem>
                {courses.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}
              </TextField>
              <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value)} fullWidth>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="MCQ">MCQ</MenuItem>
                <MenuItem value="Subjective">Subjective</MenuItem>
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <TextField select label="Level" value={level} onChange={(e) => setLevel(e.target.value)} fullWidth>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </TextField>
              <TextField label="Search keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Button variant="contained" onClick={load} sx={{ width: 'fit-content' }}>
                Search
              </Button>
              <Button variant="outlined" onClick={() => exportToCsv('questions.csv', rows, [
                { key: 'title', label: 'Question' },
                { key: 'course', label: 'Course', value: (r: any) => r?.courseId?.title || '' },
                { key: 'type', label: 'Type' },
                { key: 'level', label: 'Level' },
                { key: 'keywords', label: 'Keywords', value: (r: any) => (r?.keywords ?? []).join(', ') }
              ])}>
                Export CSV
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Table */}
        <Card>
          <CardHeader
            title="Question Bank"
            subheader="Create and manage questions for courses and quizzes"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/questions/new')}
              >
                Add Question
              </Button>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Question</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Keywords</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        No questions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((question) => (
                      <TableRow key={question._id} hover>
                        <TableCell>{question.title}</TableCell>
                        <TableCell>{question.courseId?.title || '-'}</TableCell>
                        <TableCell>{question.type || '-'}</TableCell>
                        <TableCell>{question.level || '-'}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {(question.keywords ?? []).map((k: string) => (
                              <Chip key={k} label={k} size="small" />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/questions/${question._id}/edit`)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(question._id)}
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
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this question? This action cannot be undone.
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
