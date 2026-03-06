import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../core/api'
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TextField
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'

export default function MentorHome() {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [courseSearchQuery, setCourseSearchQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const loadAssignments = async () => {
    const res = await api.get('/mentor/me/assignments')
    setAssignments(res.data || [])
  }

  useEffect(() => {
    loadAssignments().catch(() => setAssignments([]))
  }, [])

  const loadReport = async (assignment: any) => {
    setSelected(assignment)
    setReport(null)
    setSearchQuery('')
    setLoading(true)
    try {
      const res = await api.get(`/mentor/reports/${assignment.batch._id}/${assignment.course._id}`)
      setReport(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleViewStudentDetails = (student: any) => {
    navigate(`/mentor/students/${student.userId}`, {
      state: { assignment: selected }
    })
  }

  const totalStudents = report?.students?.length || 0

  const filteredStudents = useMemo(() => {
    if (!report?.students) return []
    if (!searchQuery.trim()) return report.students

    const query = searchQuery.toLowerCase()
    return report.students.filter((s: any) =>
      s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query)
    )
  }, [report?.students, searchQuery])

  const filteredAssignments = useMemo(() => {
    if (!courseSearchQuery.trim()) return assignments

    const query = courseSearchQuery.toLowerCase()
    return assignments.filter((a: any) =>
      a.course?.title?.toLowerCase().includes(query) || a.batch?.name?.toLowerCase().includes(query)
    )
  }, [assignments, courseSearchQuery])

  const distributionRows = useMemo(() => {
    const dist = report?.distribution || { 0: 0, 10: 0, 25: 0, 50: 0, 75: 0, 100: 0 }
    return [0, 10, 25, 50, 75, 100].map((key) => ({
      label: `${key}%`,
      count: dist[key] || 0
    }))
  }, [report])

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">Mentor Dashboard</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            View assigned batches and course progress reports.
          </Typography>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
        <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, minWidth: 280, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Assigned Courses
          </Typography>
          <TextField
            placeholder="Search by course name or batch..."
            size="small"
            fullWidth
            value={courseSearchQuery}
            onChange={(e) => setCourseSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Stack spacing={1.5}>
            {filteredAssignments.map((a) => (
              <Paper key={a._id} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {a.course?.title || 'Course'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Batch: {a.batch?.name || '-'}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant={selected?._id === a._id ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => loadReport(a)}
                      sx={{ flex: 1 }}
                    >
                      View Report
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/app/courses/${a.course._id}`)}
                      sx={{ flex: 1 }}
                    >
                      View Contents
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
            {assignments.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No assignments yet.
              </Typography>
            )}
            {assignments.length > 0 && filteredAssignments.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No courses match your search.
              </Typography>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, flex: 2 }}>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Course Report
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {selected ? `${selected.course?.title} • ${selected.batch?.name}` : 'Select a course to view the report.'}
              </Typography>
            </Stack>

            {loading && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Loading report...
              </Typography>
            )}

            {!loading && report && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Completion Distribution
                  </Typography>
                  <Stack spacing={1}>
                    {distributionRows.map((row) => {
                      const percent = totalStudents > 0 ? (row.count / totalStudents) * 100 : 0
                      return (
                        <Stack key={row.label} direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 48 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {row.label}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, backgroundColor: '#eef1f4', borderRadius: 999, height: 10 }}>
                            <Box
                              sx={{
                                width: `${percent}%`,
                                height: '100%',
                                backgroundColor: '#2e7d32',
                                borderRadius: 999
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ width: 36, textAlign: 'right' }}>
                            {row.count}
                          </Typography>
                        </Stack>
                      )
                    })}
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Student Progress ({filteredStudents.length})
                      </Typography>
                    </Stack>

                    <TextField
                      size="small"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                      sx={{ mb: 1 }}
                    />

                    <Table size="small" sx={{ 'tbody tr': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Completed</TableCell>
                          <TableCell>Pending</TableCell>
                          <TableCell>Percent</TableCell>
                          <TableCell>Last Checked</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                No students found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStudents.map((s: any) => (
                            <TableRow
                              key={s.userId}
                              onClick={() => handleViewStudentDetails(s)}
                              sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                            >
                              <TableCell>{s.name}</TableCell>
                              <TableCell>{s.email}</TableCell>
                              <TableCell>{s.completedSections}</TableCell>
                              <TableCell>{s.pendingSections}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={`${Math.round(s.percentComplete)}%`}
                                  color={s.percentComplete === 100 ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                {s.lastCheckedIn ? new Date(s.lastCheckedIn).toLocaleDateString() : '-'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Stack>
                </Box>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}
