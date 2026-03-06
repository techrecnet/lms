import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Paper, Stack, Tab, Tabs, Typography } from '@mui/material'
import { api } from '../../../core/api'
import { ENV } from '../../../app/env'
import { exportToCsv } from '../../../shared/utils/exportCsv'

export default function InstituteDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [institute, setInstitute] = useState<any>(null)
  const [batches, setBatches] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])

  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  const load = async () => {
    if (!id) return
    const [instRes, batchRes, courseRes] = await Promise.all([
      api.get(`/institutes/${id}`),
      api.get('/batch'),
      api.get('/courses')
    ])
    setInstitute(instRes.data)
    setBatches(batchRes.data.filter((b: any) => b?.instituteId?._id === id || b?.instituteId === id))
    setCourses(courseRes.data)
  }

  useEffect(() => { load().catch(() => setInstitute(null)) }, [id])

  const logoUrl = institute?.logoUrl?.startsWith('/')
    ? `${apiBase}${institute.logoUrl}`
    : institute?.logoUrl

  const assignedCourses = useMemo(() => institute?.courses ?? [], [institute])

  if (!institute) return <Typography>Institute not found.</Typography>

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5">{institute.name}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {institute.city || institute.state ? `${institute.city ?? ''} ${institute.state ?? ''}`.trim() : 'Institute details'}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate(`/admin/institutes/${id}/edit`)}>
            Edit Institute
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="Details" />
          <Tab label={`Batches (${batches.length})`} />
          <Tab label="Courses" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {logoUrl && (
              <Box
                component="img"
                src={logoUrl}
                alt={institute.name}
                sx={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 2 }}
              />
            )}
            <Typography variant="body2">Address: {institute.address || '-'} </Typography>
            <Typography variant="body2">Type: {institute.type}{institute.type === 'Others' && institute.typeOther ? ` (${institute.typeOther})` : ''}</Typography>
            <Typography variant="body2">Phone: {institute.phone || '-'}</Typography>
            <Typography variant="body2">Email: {institute.email || '-'}</Typography>
            <Typography variant="body2">Website: {institute.website || '-'}</Typography>
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => exportToCsv(`institute-${institute?.name || 'batches'}.csv`, batches, [
                { key: 'name', label: 'Batch' },
                { key: 'coursesCount', label: 'Courses', value: (r: any) => r?.courses?.length ?? 0 },
                { key: 'studentsCount', label: 'Students', value: (r: any) => r?.students?.length ?? 0 }
              ])}
            >
              Export CSV
            </Button>
            <Stack spacing={1}>
              {batches.map((b) => (
                <Paper key={b._id} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2">{b.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Courses: {b.courses?.length ?? 0} • Students: {b.students?.length ?? 0}
                  </Typography>
                </Paper>
              ))}
              {batches.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No batches yet.
                </Typography>
              )}
            </Stack>
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => exportToCsv(`institute-${institute?.name || 'courses'}.csv`, assignedCourses, [
                { key: 'title', label: 'Course', value: (r: any) => r?.title ?? r },
                { key: 'duration', label: 'Duration', value: (r: any) => r?.duration ?? '' },
                { key: 'sectionCount', label: 'Sections', value: (r: any) => r?.sections?.length ?? 0 }
              ])}
            >
              Export CSV
            </Button>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {assignedCourses.map((c: any) => (
                <Chip
                  key={c._id ?? c}
                  label={c.title ?? c}
                />
              ))}
              {assignedCourses.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No courses assigned.
                </Typography>
              )}
            </Stack>
          </Stack>
        )}
      </Paper>
    </Stack>
  )
}
