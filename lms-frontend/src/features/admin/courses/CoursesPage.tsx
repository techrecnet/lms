import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Info as InfoIcon,
  Build as BuildIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../core/api'
import { ENV } from '../../../app/env'
import { exportToCsv } from '../../../shared/utils/exportCsv'

export default function CoursesPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/courses')
      setRows(res.data)
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to fetch courses'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await api.delete(`/courses/${deleteId}`)
      setSnackbar({
        open: true,
        message: 'Course deleted successfully',
        severity: 'success',
      })
      setDeleteId(null)
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to delete course'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => { load().catch(()=>setRows([])) }, [])

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
        {/* Export */}
        <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Curate courses, manage details, and open the builder for structure.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => exportToCsv('courses.csv', rows, [
              { key: 'title', label: 'Title' },
              { key: 'description', label: 'Description' },
              { key: 'duration', label: 'Duration' },
              { key: 'sectionCount', label: 'Sections' }
            ])}>
              Export CSV
            </Button>
          </Stack>
        </Paper>

        {/* Table */}
        <Card>
          <CardHeader
            title="Courses"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/courses/new')}
              >
                Create Course
              </Button>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Image</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Sections</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        No courses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((course) => (
                      <TableRow key={course._id} hover>
                        <TableCell>
                          {course.imageUrl && (
                            <Box
                              component="img"
                              src={course.imageUrl.startsWith('/') ? `${apiBase}${course.imageUrl}` : course.imageUrl}
                              alt={course.title}
                              sx={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.description || '-'}</TableCell>
                        <TableCell>{course.duration || '-'}</TableCell>
                        <TableCell>{course.sectionCount || 0}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/courses/${course._id}`)}
                            title="Details"
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/courses/${course._id}/builder`)}
                            title="Builder"
                          >
                            <BuildIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(course._id)}
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
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this course? This action cannot be undone.
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
