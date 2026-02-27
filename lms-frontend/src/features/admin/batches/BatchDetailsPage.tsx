import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Button, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography, Chip, Snackbar, Alert } from '@mui/material'
import { api } from '../../../core/api'
import { exportToCsv } from '../../../shared/utils/exportCsv'

export default function BatchDetailsPage() {
  const { id } = useParams()
  const [tab, setTab] = useState(0)
  const [batch, setBatch] = useState<any>(null)
  const [mentors, setMentors] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [mentorSelection, setMentorSelection] = useState<Record<string, string[]>>({})
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const load = async () => {
    if (!id) return
    const res = await api.get(`/batch/${id}`)
    setBatch(res.data)
  }

  const loadMentors = async () => {
    try {
      const res = await api.get('/mentor');
      setMentors(res.data || [])
    } catch (error) {
      setMentors([])
    }
  }

  const loadAssignments = async () => {
    if (!id) return
    try {
      const res = await api.get(`/mentor/assignments?batchId=${id}`)
      setAssignments(res.data || [])
      const selection: Record<string, string[]> = {}
      ;(res.data || []).forEach((a: any) => {
        const courseId = a.course?._id || a.course
        if (courseId && a.mentors) {
          selection[courseId] = a.mentors.map((m: any) => m._id || m)
        }
      })
      setMentorSelection(selection)
    } catch (error) {
      setAssignments([])
    }
  }

  useEffect(() => {
    load().catch(() => setBatch(null))
    loadMentors().catch(() => setMentors([]))
    loadAssignments().catch(() => setAssignments([]))
  }, [id])

  const courses = useMemo(() => batch?.courses ?? [], [batch])
  const students = useMemo(() => batch?.students ?? [], [batch])
  const unassignedCount = useMemo(() => {
    if (!courses.length) return 0
    return courses.filter((c: any) => {
      const courseId = c._id ?? c
      return !assignments.some((a) => (a.course?._id || a.course) === courseId)
    }).length
  }, [courses, assignments])

  const assignMentors = async (courseId: string) => {
    if (!id) return
    const mentorIds = mentorSelection[courseId]
    if (!mentorIds || mentorIds.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one mentor', severity: 'error' })
      return
    }
    try {
      await api.post('/mentor/assignments', { mentorIds, batchId: id, courseId })
      setSnackbar({ open: true, message: 'Mentors assigned successfully', severity: 'success' })
      await loadAssignments()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.msg || 'Failed to assign mentors', severity: 'error' })
    }
  }

  const toggleMentor = (courseId: string, mentorId: string) => {
    setMentorSelection(prev => {
      const current = prev[courseId] || []
      const updated = current.includes(mentorId)
        ? current.filter(id => id !== mentorId)
        : [...current, mentorId]
      return { ...prev, [courseId]: updated }
    })
  }

  if (!batch) return <Typography>Batch not found.</Typography>

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">{batch.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {batch?.instituteId?.name || 'Batch details'}
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label={`Courses (${courses.length})`} />
          <Tab label={`Students (${students.length})`} />
          <Tab label="Mentors" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => exportToCsv(`batch-${batch?.name || 'courses'}.csv`, courses, [
                { key: 'title', label: 'Course', value: (r: any) => r?.title ?? r },
                { key: 'duration', label: 'Duration', value: (r: any) => r?.duration ?? '' },
                { key: 'sectionCount', label: 'Sections', value: (r: any) => r?.sections?.length ?? 0 }
              ])}
            >
              Export CSV
            </Button>
            <Stack spacing={1}>
              {courses.map((c: any) => (
                <Paper key={c._id ?? c} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2">{c.title ?? c}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Duration: {c.duration || '-'}
                  </Typography>
                </Paper>
              ))}
              {courses.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No courses assigned.
                </Typography>
              )}
            </Stack>
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => exportToCsv(`batch-${batch?.name || 'students'}.csv`, students, [
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'rollNo', label: 'Roll No' },
                { key: 'batchSession', label: 'Batch Session' },
                { key: 'institute', label: 'Institute', value: (r: any) => r?.instituteId?.name || '' }
              ])}
            >
              Export CSV
            </Button>
            <Stack spacing={1}>
              {students.map((s: any) => (
                <Paper key={s._id ?? s} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2">{s.name || s.email || s}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {s.email || '-'} • {s.rollNo || '-'} • {s.batchSession || '-'}
                  </Typography>
                </Paper>
              ))}
              {students.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No students assigned.
                </Typography>
              )}
            </Stack>
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Unassigned courses: {unassignedCount}
            </Typography>
            {courses.map((c: any) => {
              const courseId = c._id ?? c
              const assigned = assignments.find((a) => (a.course?._id || a.course) === courseId)
              const selectedMentors = mentorSelection[courseId] || []
              return (
                <Paper key={courseId} sx={{ p: 2, borderRadius: 2 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">{c.title ?? c}</Typography>
                    
                    {/* Display currently assigned mentors */}
                    {assigned?.mentors && assigned.mentors.length > 0 && (
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Assigned Mentors:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {assigned.mentors.map((m: any) => (
                            <Chip
                              key={m._id}
                              label={m.name || m.email}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Stack>
                    )}

                    {/* Multi-select mentors */}
                    <Stack spacing={1}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Select Mentors:
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
                        {mentors.map((m) => (
                          <Chip
                            key={m._id}
                            label={m.name || m.email}
                            onClick={() => toggleMentor(courseId, m._id)}
                            variant={selectedMentors.includes(m._id) ? 'filled' : 'outlined'}
                            color={selectedMentors.includes(m._id) ? 'primary' : 'default'}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </Stack>

                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => assignMentors(courseId)}
                      disabled={selectedMentors.length === 0}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Save Mentors
                    </Button>
                  </Stack>
                </Paper>
              )
            })}
            {courses.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No courses assigned.
              </Typography>
            )}
          </Stack>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Stack>
  )
}
