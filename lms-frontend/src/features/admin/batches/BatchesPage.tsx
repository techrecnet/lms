import { useEffect, useState } from 'react'
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Info as InfoIcon,
  School as SchoolIcon,
  Group as GroupIcon,
} from '@mui/icons-material'
import { api } from '../../../core/api'
import { useNavigate } from 'react-router-dom'
import { exportToCsv } from '../../../shared/utils/exportCsv'

export default function BatchesPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [institutes, setInstitutes] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newInstituteId, setNewInstituteId] = useState('')
  const [newCertificateAllowed, setNewCertificateAllowed] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [courseId, setCourseId] = useState('')
  const [manageStudentsOpen, setManageStudentsOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [assignSession, setAssignSession] = useState('')
  const [assignInstituteId, setAssignInstituteId] = useState('')
  const [editingBatch, setEditingBatch] = useState<any | null>(null)
  const [editBatchName, setEditBatchName] = useState('')
  const [editInstituteId, setEditInstituteId] = useState('')
  const [editCertificateAllowed, setEditCertificateAllowed] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRollNo, setNewUserRollNo] = useState('')
  const [newUserSession, setNewUserSession] = useState('')
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
      const res = await api.get('/batch')
      setRows(res.data)
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to fetch batches'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }
  const loadCourses = async () => {
    const res = await api.get('/courses')
    setCourses(res.data)
  }
  const loadInstitutes = async () => {
    const res = await api.get('/institutes')
    setInstitutes(res.data)
  }
  const loadUsers = async () => {
    const res = await api.get('/users')
    setUsers(res.data)
  }

  const create = async () => {
    try {
      await api.post('/batch', { name: newName, instituteId: newInstituteId, certificateAllowed: newCertificateAllowed })
      setNewName('')
      setNewInstituteId('')
      setNewCertificateAllowed(false)
      setAddOpen(false)
      setSnackbar({
        open: true,
        message: 'Batch created successfully',
        severity: 'success',
      })
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to create batch'
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
      await api.delete(`/batch/${deleteId}`)
      setSnackbar({
        open: true,
        message: 'Batch deleted successfully',
        severity: 'success',
      })
      setDeleteId(null)
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to delete batch'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    } finally {
      setDeleting(false)
    }
  }

  const openAssign = (batch: any) => {
    setSelectedBatch(batch)
    setCourseId('')
    setAssignOpen(true)
  }

  const openManageStudents = (batch: any) => {
    setSelectedBatch(batch)
    setSelectedUserId('')
    setAssignSession('')
    setAssignInstituteId(batch?.instituteId?._id ?? batch?.instituteId ?? '')
    setCsvFile(null)
    setManageStudentsOpen(true)
  }

  const openEdit = (batch: any) => {
    setEditingBatch(batch)
    setEditBatchName(batch.name ?? '')
    setEditInstituteId(batch?.instituteId?._id ?? batch?.instituteId ?? '')
    setEditCertificateAllowed(batch.certificateAllowed ?? false)
  }

  const assign = async () => {
    if (!selectedBatch?._id || !courseId) return
    try {
      await api.put(`/batch/${selectedBatch._id}/assign-course`, { courseId })
      setAssignOpen(false)
      setSnackbar({
        open: true,
        message: 'Course assigned successfully',
        severity: 'success',
      })
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to assign course'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    }
  }

  const assignStudent = async () => {
    if (!selectedBatch?._id || !selectedUserId) return
    try {
      await api.put(`/batch/${selectedBatch._id}/assign-student`, {
        userId: selectedUserId,
        session: assignSession || undefined,
        instituteId: assignInstituteId || undefined
      })
      setSelectedUserId('')
      setSnackbar({
        open: true,
        message: 'Student assigned successfully',
        severity: 'success',
      })
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to assign student'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    }
  }

  const saveEdit = async () => {
    if (!editingBatch?._id) return
    try {
      await api.put(`/batch/${editingBatch._id}`, { name: editBatchName, instituteId: editInstituteId, certificateAllowed: editCertificateAllowed })
      setEditingBatch(null)
      setSnackbar({
        open: true,
        message: 'Batch updated successfully',
        severity: 'success',
      })
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to update batch'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    }
  }

  const uploadStudentsCsv = async () => {
    if (!csvFile || !selectedBatch?._id) return
    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      await api.post(`/batch/${selectedBatch._id}/upload-students-csv`, formData)
      setCsvFile(null)
      setSnackbar({
        open: true,
        message: 'CSV uploaded successfully',
        severity: 'success',
      })
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to upload CSV'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    }
  }

  const createAndAssignStudent = async () => {
    if (!newUserEmail.trim() || !selectedBatch?._id) return
    try {
      const res = await api.post('/users', {
        name: newUserName,
        email: newUserEmail,
        rollNo: newUserRollNo,
        batchSession: newUserSession,
        instituteId: assignInstituteId || undefined,
        role: 'user'
      })
      await api.put(`/batch/${selectedBatch._id}/assign-student`, {
        userId: res.data._id,
        session: newUserSession || undefined,
        instituteId: assignInstituteId || undefined
      })
      setNewUserName('')
      setNewUserEmail('')
      setNewUserRollNo('')
      setNewUserSession('')
      setSnackbar({
        open: true,
        message: 'Student created and assigned successfully',
        severity: 'success',
      })
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to create student'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    }
  }

  const removeStudent = async (userId: string) => {
    if (!selectedBatch?._id) return
    try {
      await api.delete(`/batch/${selectedBatch._id}/students/${userId}`)
      setSnackbar({
        open: true,
        message: 'Student removed successfully',
        severity: 'success',
      })
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to remove student'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    }
  }

  useEffect(() => {
    load().catch(()=>setRows([]))
    loadCourses().catch(()=>setCourses([]))
    loadInstitutes().catch(()=>setInstitutes([]))
    loadUsers().catch(()=>setUsers([]))
  }, [])

  const instituteName = (batch: any) => batch?.instituteId?.name ?? ''

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
                Organize learners into cohorts and connect them to courses.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => exportToCsv('batches.csv', rows, [
              { key: 'name', label: 'Batch' },
              { key: 'institute', label: 'Institute', value: (r: any) => r?.instituteId?.name || '' },
              { key: 'coursesCount', label: 'Courses', value: (r: any) => r?.courses?.length ?? 0 },
              { key: 'studentsCount', label: 'Students', value: (r: any) => r?.students?.length ?? 0 }
            ])}>
              Export CSV
            </Button>
          </Stack>
        </Paper>

        {/* Table */}
        <Card>
          <CardHeader
            title="Batches"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddOpen(true)}
              >
                Add Batch
              </Button>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Batch</TableCell>
                    <TableCell>Institute</TableCell>
                    <TableCell>Courses</TableCell>
                    <TableCell>Students</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No batches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((batch) => (
                      <TableRow key={batch._id} hover>
                        <TableCell>{batch.name}</TableCell>
                        <TableCell>{instituteName(batch)}</TableCell>
                        <TableCell>{batch.courses?.length ?? 0}</TableCell>
                        <TableCell>{batch.students?.length ?? 0}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/batches/${batch._id}`)}
                            title="Details"
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openAssign(batch)}
                            title="Assign Course"
                          >
                            <SchoolIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openManageStudents(batch)}
                            title="Manage Students"
                          >
                            <GroupIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(batch)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(batch._id)}
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

      {/* Assign Course Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign Course to Batch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Batch" value={selectedBatch?.name ?? ''} disabled />
            <TextField select label="Course" value={courseId} onChange={e => setCourseId(e.target.value)}>
              {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={assign} disabled={!courseId}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Students Dialog */}

      <Dialog open={manageStudentsOpen} onClose={() => setManageStudentsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Manage Students • {selectedBatch?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Assigned Courses</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {(selectedBatch?.courses ?? []).length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>No courses assigned.</Typography>
                )}
                {(selectedBatch?.courses ?? []).map((c: any) => (
                  <Chip key={c._id ?? c} label={c.title ?? c} />
                ))}
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2">Assigned Students</Typography>
              {(selectedBatch?.students ?? []).length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No students assigned.</Typography>
              )}
              {(selectedBatch?.students ?? []).map((s: any) => (
                <Stack key={s._id ?? s} direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ flexGrow: 1 }}>{s.name ?? s.email ?? s}</Typography>
                  <Button color="error" onClick={() => removeStudent(s._id ?? s)}>Remove</Button>
                </Stack>
              ))}
            </Stack>

            <Stack spacing={2}>
              <Typography variant="subtitle2">Add Student to Batch</Typography>
              <TextField select label="User" value={selectedUserId} onChange={(e) => {
                const nextUserId = e.target.value
                setSelectedUserId(nextUserId)
                const user = users.find((u) => u._id === nextUserId)
                setAssignSession(user?.batchSession ?? '')
                setAssignInstituteId(user?.instituteId?._id ?? user?.instituteId ?? '')
              }}>
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name ? `${u.name} • ${u.email}` : u.email}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Batch Session" value={assignSession} onChange={(e) => setAssignSession(e.target.value)} />
              <TextField select label="Institute" value={assignInstituteId} onChange={(e) => setAssignInstituteId(e.target.value)}>
                {institutes.map((i) => <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>)}
              </TextField>
              <Button variant="contained" onClick={assignStudent} disabled={!selectedUserId} sx={{ width: 'fit-content' }}>
                Assign Student
              </Button>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="subtitle2">Create New Student</Typography>
              <TextField label="Name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
              <TextField label="Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
              <TextField label="Roll No" value={newUserRollNo} onChange={(e) => setNewUserRollNo(e.target.value)} />
              <TextField label="Batch Session" value={newUserSession} onChange={(e) => setNewUserSession(e.target.value)} />
              <Button variant="outlined" onClick={createAndAssignStudent} disabled={!newUserEmail.trim()}>
                Create and Assign
              </Button>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="subtitle2">Upload Students CSV</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Button variant="outlined" component="label">
                  Select CSV
                  <input hidden type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} />
                </Button>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {csvFile ? csvFile.name : 'No file selected'}
                </Typography>
                <Button variant="contained" onClick={uploadStudentsCsv} disabled={!csvFile}>
                  Upload
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageStudentsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Batch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Batch name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <TextField select label="Institute" value={newInstituteId} onChange={(e) => setNewInstituteId(e.target.value)}>
              {institutes.map((i) => <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>)}
            </TextField>
            <FormControlLabel
              control={<Checkbox checked={newCertificateAllowed} onChange={(e) => setNewCertificateAllowed(e.target.checked)} />}
              label="Certificate Allowed"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={create} disabled={!newName.trim() || !newInstituteId}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={Boolean(editingBatch)} onClose={() => setEditingBatch(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Batch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Batch name" value={editBatchName} onChange={(e) => setEditBatchName(e.target.value)} />
            <TextField select label="Institute" value={editInstituteId} onChange={(e) => setEditInstituteId(e.target.value)}>
              {institutes.map((i) => <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>)}
            </TextField>
            <FormControlLabel
              control={<Checkbox checked={editCertificateAllowed} onChange={(e) => setEditCertificateAllowed(e.target.checked)} />}
              label="Certificate Allowed"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingBatch(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit} disabled={!editBatchName.trim() || !editInstituteId}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Batch</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this batch? This action cannot be undone.
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
