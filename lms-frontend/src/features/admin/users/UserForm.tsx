import { Button, FormControlLabel, MenuItem, Paper, Stack, Switch, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

export type UserFormValues = {
  name: string
  email: string
  rollNo: string
  batchSession: string
  instituteId: string
  role: 'user' | 'mentor'
  isActive: boolean
}

type Props = {
  title: string
  institutes: any[]
  initialValues: UserFormValues
  submitLabel: string
  onSubmit: (values: UserFormValues) => Promise<void>
  onCancel?: () => void
}

export default function UserForm({ title, institutes, initialValues, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<UserFormValues>(initialValues)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Add users with basic details and role.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <TextField label="Name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
          <TextField label="Email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
          <TextField label="Roll No" value={values.rollNo} onChange={(e) => setValues({ ...values, rollNo: e.target.value })} />
          <TextField label="Batch Session" value={values.batchSession} onChange={(e) => setValues({ ...values, batchSession: e.target.value })} />
          <TextField select label="Institute" value={values.instituteId} onChange={(e) => setValues({ ...values, instituteId: e.target.value })}>
            <MenuItem value="">None</MenuItem>
            {institutes.map((i) => <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>)}
          </TextField>
          <TextField select label="Role" value={values.role} onChange={(e) => setValues({ ...values, role: e.target.value as 'user' | 'mentor' })}>
            <MenuItem value="user">Student</MenuItem>
            <MenuItem value="mentor">Mentor</MenuItem>
          </TextField>
          <FormControlLabel
            control={<Switch checked={values.isActive} onChange={(e) => setValues({ ...values, isActive: e.target.checked })} />}
            label={values.isActive ? 'Active' : 'Inactive'}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={() => onSubmit(values)} disabled={!values.email.trim()}>
              {submitLabel}
            </Button>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel}>Cancel</Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}
