import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../../../core/api'

export default function AdminHome() {
  const [courseCount, setCourseCount] = useState(0)
  const [batchCount, setBatchCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      const [coursesRes, batchesRes] = await Promise.all([
        api.get('/courses'),
        api.get('/batch')
      ])
      setCourseCount(coursesRes.data.length)
      setBatchCount(batchesRes.data.length)
    }
    load().catch(() => {
      setCourseCount(0)
      setBatchCount(0)
    })
  }, [])

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: 'linear-gradient(130deg, rgba(15,61,48,0.08), rgba(213,121,75,0.12))',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: { xs: -60, md: -20 },
            top: { xs: -40, md: -20 },
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(213,121,75,0.18), transparent 60%)'
          }}
        />
        <Stack spacing={2} sx={{ position: 'relative' }}>
          <Typography variant="h4">RECNET Dashboard</Typography>
          <Typography variant="body1" sx={{ maxWidth: 560 }}>
            Curate learning paths, organize cohorts, and keep momentum visible at a glance.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" component={RouterLink} to="/admin/courses">Browse Courses</Button>
            <Button variant="outlined" component={RouterLink} to="/admin/batches">Manage Batches</Button>
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2
        }}
      >
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>Active Programs</Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>{courseCount}</Typography>
          <Typography variant="body2">Total courses available.</Typography>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>Active Batches</Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>{batchCount}</Typography>
          <Typography variant="body2">Cohorts running now.</Typography>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>Completion Rate</Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>86%</Typography>
          <Typography variant="body2">Last 30 days average.</Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Next steps</Typography>
        <Stack spacing={1}>
          <Typography variant="body2">1. Review new institute requests.</Typography>
          <Typography variant="body2">2. Publish the Q1 onboarding course.</Typography>
          <Typography variant="body2">3. Assign mentors to new batches.</Typography>
        </Stack>
      </Paper>
    </Stack>
  )
}
