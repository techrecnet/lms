import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
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
  CircularProgress,
  Snackbar,
  Alert,
  Box,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { api } from '../../../core/api'
import { exportToCsv } from '../../../shared/utils/exportCsv'
import QuizEditorHelp from './QuizEditorHelp'

type QuizForm = {
  sectionId: string
  passingMarks: string
  questionsJson: string
}

export default function QuizzesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [courseId, setCourseId] = useState('')
  const [form, setForm] = useState<QuizForm>({ sectionId: '', passingMarks: '', questionsJson: '[]' })
  const [editing, setEditing] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<QuizForm>({ sectionId: '', passingMarks: '', questionsJson: '[]' })
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
      const [quizRes, courseRes] = await Promise.all([
        api.get('/quizzes'),
        api.get('/courses')
      ])
      setRows(quizRes.data)
      setCourses(courseRes.data)
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to fetch quizzes'
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

  useEffect(() => {
    if (!courseId) {
      setSections([])
      return
    }
    api.get(`/courses/${courseId}`).then((res) => setSections(res.data?.sections ?? [])).catch(() => setSections([]))
  }, [courseId])

  const create = async () => {
    let questions = [] as any[]
    try {
      questions = JSON.parse(form.questionsJson || '[]')
    } catch {
      setSnackbar({
        open: true,
        message: 'Invalid JSON format for questions',
        severity: 'error',
      })
      return
    }
    try {
      await api.post('/quizzes', {
        section: form.sectionId,
        passingMarks: Number(form.passingMarks || 0),
        questions
      })
      setForm({ sectionId: '', passingMarks: '', questionsJson: '[]' })
      setCourseId('')
      setSnackbar({
        open: true,
        message: 'Quiz created successfully',
        severity: 'success',
      })
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to create quiz'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    }
  }

  const openEdit = (quiz: any) => {
    setEditing(quiz)
    setEditForm({
      sectionId: quiz.section?._id ?? quiz.section,
      passingMarks: String(quiz.passingMarks ?? 0),
      questionsJson: JSON.stringify(quiz.questions ?? [], null, 2)
    })
  }

  const saveEdit = async () => {
    if (!editing?._id) return
    let questions = [] as any[]
    try {
      questions = JSON.parse(editForm.questionsJson || '[]')
    } catch {
      setSnackbar({
        open: true,
        message: 'Invalid JSON format for questions',
        severity: 'error',
      })
      return
    }
    try {
      await api.put(`/quizzes/${editing._id}`, {
        section: editForm.sectionId,
        passingMarks: Number(editForm.passingMarks || 0),
        questions
      })
      setEditing(null)
      setSnackbar({
        open: true,
        message: 'Quiz updated successfully',
        severity: 'success',
      })
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to update quiz'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await api.delete(`/quizzes/${deleteId}`)
      setSnackbar({
        open: true,
        message: 'Quiz deleted successfully',
        severity: 'success',
      })
      setDeleteId(null)
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to delete quiz'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    } finally {
      setDeleting(false)
    }
  }

  const formSections = useMemo(() => sections, [sections])

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
        {/* Create Quiz Form */}
        <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Create Quiz</Typography>
            <TextField select label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}
            </TextField>
            <TextField select label="Section" value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
              {formSections.map((s: any) => <MenuItem key={s._id} value={s._id}>{s.title}</MenuItem>)}
            </TextField>
            <TextField label="Passing marks" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} />
            <TextField
              label="Questions (JSON)"
              value={form.questionsJson}
              onChange={(e) => setForm({ ...form, questionsJson: e.target.value })}
              multiline
              minRows={4}
            />
            <QuizEditorHelp />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant="contained" onClick={create} disabled={!form.sectionId}>
                Create Quiz
              </Button>
              <Button variant="outlined" onClick={() => exportToCsv('quizzes.csv', rows, [
                { key: 'section', label: 'Section', value: (r: any) => r?.section?.title || '' },
                { key: 'passingMarks', label: 'Passing Marks' },
                { key: 'questionCount', label: 'Questions', value: (r: any) => r?.questions?.length ?? 0 }
              ])}>
                Export CSV
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Table */}
        <Card>
          <CardHeader
            title="Quizzes"
            subheader="Create quizzes per section with passing marks and questions"
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Section</TableCell>
                    <TableCell>Passing Marks</TableCell>
                    <TableCell>Questions</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        No quizzes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((quiz) => (
                      <TableRow key={quiz._id} hover>
                        <TableCell>{quiz.section?.title || '-'}</TableCell>
                        <TableCell>{quiz.passingMarks}</TableCell>
                        <TableCell>{quiz.questions?.length ?? 0}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(quiz)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(quiz._id)}
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

      {/* Edit Dialog */}
      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Quiz</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Section" value={editForm.sectionId} onChange={(e) => setEditForm({ ...editForm, sectionId: e.target.value })} />
            <TextField label="Passing marks" value={editForm.passingMarks} onChange={(e) => setEditForm({ ...editForm, passingMarks: e.target.value })} />
            <TextField
              label="Questions (JSON)"
              value={editForm.questionsJson}
              onChange={(e) => setEditForm({ ...editForm, questionsJson: e.target.value })}
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit} disabled={!editForm.sectionId}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this quiz? This action cannot be undone.
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
