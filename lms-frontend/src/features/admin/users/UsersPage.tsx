import { useEffect, useState } from 'react'
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Avatar,
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
  Chip,
  Box,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Visibility as VisibilityIcon } from '@mui/icons-material'
import { api } from '../../../core/api'
import { ENV } from '../../../app/env'
import { useNavigate } from 'react-router-dom'
import { exportToCsv } from '../../../shared/utils/exportCsv'

export default function UsersPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<any[]>([])
  const [institutes, setInstitutes] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [email, setEmail] = useState('')
  const [instituteId, setInstituteId] = useState('')
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
      const [usersRes, instRes, batchRes] = await Promise.all([
        api.get('/users', { params: { email: email || undefined, instituteId: instituteId || undefined } }),
        api.get('/institutes'),
        api.get('/batch')
      ])
      setRows(usersRes.data)
      setInstitutes(instRes.data)
      setBatches(batchRes.data)
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to fetch users'
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
      await api.delete(`/users/${deleteId}`)
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success',
      })
      setDeleteId(null)
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to delete user'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    } finally {
      setDeleting(false)
    }
  }

  const uploadCsv = async () => {
    if (!csvFile) return
    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      await api.post('/users/upload-csv', formData)
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

  const getBatchCount = (userId: string) => {
    return batches.filter((b) => (b.students || []).some((s: any) => String(s._id ?? s) === String(userId))).length
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
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Search email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField select label="Institute" value={instituteId} onChange={(e) => setInstituteId(e.target.value)} fullWidth>
                <MenuItem value="">All</MenuItem>
                {institutes.map((i) => <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Button variant="contained" onClick={load} sx={{ width: 'fit-content' }}>
                Search
              </Button>
              <Button variant="outlined" onClick={() => exportToCsv('users.csv', rows, [
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'rollNo', label: 'Roll No' },
                { key: 'batchSession', label: 'Batch Session' },
                { key: 'institute', label: 'Institute', value: (r: any) => r?.instituteId?.name || '' },
                { key: 'isActive', label: 'Active', value: (r: any) => (r?.isActive === false ? 'No' : 'Yes') }
              ])}>
                Export CSV
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* CSV Upload */}
        <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1">Upload CSV</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <Button variant="outlined" component="label">
                Select CSV
                <input hidden type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} />
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {csvFile ? csvFile.name : 'No file selected'}
              </Typography>
              <Button variant="contained" onClick={uploadCsv} disabled={!csvFile}>Upload</Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Table */}
        <Card>
          <CardHeader
            title="Users"
            subheader="Create users manually or upload a CSV to import students"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/users/new')}
              >
                Add User
              </Button>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Photo</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Roll No</TableCell>
                    <TableCell>Batch Session</TableCell>
                    <TableCell>Institute</TableCell>
                    <TableCell>Batches</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Avatar 
                            src={user.studentImage ? `${apiBase}${user.studentImage}` : undefined}
                            sx={{ width: 32, height: 32 }}
                          >
                            {!user.studentImage && user.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.rollNo || '-'}</TableCell>
                        <TableCell>{user.batchSession || '-'}</TableCell>
                        <TableCell>{user.instituteId?.name || '-'}</TableCell>
                        <TableCell>{getBatchCount(user._id)}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive === false ? 'No' : 'Yes'}
                            color={user.isActive === false ? 'error' : 'success'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            title="View"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/users/${user._id}/edit`)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(user._id)}
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
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user? This action cannot be undone.
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
