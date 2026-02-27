import { useEffect, useState } from 'react'
import {
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Info as InfoIcon } from '@mui/icons-material'
import { api } from '../../../core/api'
import { useNavigate } from 'react-router-dom'
import { exportToCsv } from '../../../shared/utils/exportCsv'
import { ENV } from '../../../app/env'

export default function InstitutesPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<any[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
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
      const res = await api.get('/institutes', {
        params: {
          name: name || undefined,
          type: type || undefined,
          state: state || undefined,
          city: city || undefined
        }
      })
      setRows(res.data)
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to fetch institutes'
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
      await api.delete(`/institutes/${deleteId}`)
      setSnackbar({
        open: true,
        message: 'Institute deleted successfully',
        severity: 'success',
      })
      setDeleteId(null)
      load()
    } catch (error: any) {
      const message = error.response?.data?.msg || 'Failed to delete institute'
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      })
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => { load().catch(() => setRows([])) }, [])

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
              <TextField label="Search name" value={name} onChange={e => setName(e.target.value)} fullWidth />
              <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value)} fullWidth>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="School">School</MenuItem>
                <MenuItem value="College">College</MenuItem>
                <MenuItem value="University">University</MenuItem>
                <MenuItem value="Private Institute">Private Institute</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <TextField label="State" value={state} onChange={(e) => setState(e.target.value)} fullWidth />
              <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Button variant="contained" onClick={load} sx={{ width: 'fit-content' }}>
                Search
              </Button>
              <Button variant="outlined" onClick={() => exportToCsv('institutes.csv', rows, [
                { key: 'name', label: 'Name' },
                { key: 'type', label: 'Type' },
                { key: 'state', label: 'State' },
                { key: 'city', label: 'City' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'website', label: 'Website' }
              ])}>
                Export CSV
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Table */}
        <Card>
          <CardHeader
            title="Institutes"
            subheader="Add and manage partner institutes in your learning library"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/institutes/new')}
              >
                Add Institute
              </Button>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Logo</TableCell>
                    <TableCell>Institute</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        No institutes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((institute) => (
                      <TableRow key={institute._id} hover>
                        <TableCell>
                          {institute.logoUrl && (
                            <Box
                              component="img"
                              src={institute.logoUrl.startsWith('/') ? `${apiBase}${institute.logoUrl}` : institute.logoUrl}
                              alt={institute.name}
                              sx={{ width: 42, height: 32, objectFit: 'cover', borderRadius: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{institute.name}</TableCell>
                        <TableCell>{institute.type || '-'}</TableCell>
                        <TableCell>{institute.state || '-'}</TableCell>
                        <TableCell>{institute.city || '-'}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/institutes/${institute._id}`)}
                            title="Details"
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/institutes/${institute._id}/edit`)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(institute._id)}
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
        <DialogTitle>Delete Institute</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this institute? This action cannot be undone.
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
