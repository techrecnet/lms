import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { ENV } from '../../../app/env'

export type InstituteFormValues = {
  name: string
  logoUrl: string
  logoFile?: File | null
  address: string
  state: string
  city: string
  type: string
  typeOther: string
  phone: string
  email: string
  website: string
}

type Props = {
  title: string
  initialValues: InstituteFormValues
  submitLabel: string
  onSubmit: (values: InstituteFormValues) => Promise<void>
  onCancel?: () => void
}

const typeOptions = ['School', 'College', 'University', 'Private Institute', 'Others']

export default function InstituteForm({ title, initialValues, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<InstituteFormValues>(initialValues)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const previewUrl = useMemo(() => {
    if (localPreview) return localPreview
    const raw = values.logoUrl?.trim()
    if (!raw) return ''
    return raw.startsWith('/') ? `${apiBase}${raw}` : raw
  }, [localPreview, values.logoUrl, apiBase])

  const updateField = (key: keyof InstituteFormValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const updateFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setValues((prev) => ({ ...prev, logoFile: file }))
  }

  useEffect(() => {
    if (!values.logoFile) {
      setLocalPreview(null)
      return
    }
    const url = URL.createObjectURL(values.logoFile)
    setLocalPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [values.logoFile])

  const submit = async () => {
    await onSubmit({
      name: values.name.trim(),
      logoUrl: values.logoUrl,
      logoFile: values.logoFile ?? null,
      address: values.address,
      state: values.state,
      city: values.city,
      type: values.type,
      typeOther: values.typeOther,
      phone: values.phone,
      email: values.email,
      website: values.website
    })
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Capture the details that define this institute.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
            gap: 3
          }}
        >
          <Stack spacing={2}>
            <TextField label="Name" value={values.name} onChange={updateField('name')} />
            <TextField label="Address" value={values.address} onChange={updateField('address')} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="State" value={values.state} onChange={updateField('state')} fullWidth />
              <TextField label="City" value={values.city} onChange={updateField('city')} fullWidth />
            </Stack>
            <TextField select label="Institute type" value={values.type} onChange={updateField('type')}>
              {typeOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
            {values.type === 'Others' && (
              <TextField label="Custom type" value={values.typeOther} onChange={updateField('typeOther')} />
            )}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Phone" value={values.phone} onChange={updateField('phone')} fullWidth />
              <TextField label="Email" value={values.email} onChange={updateField('email')} fullWidth />
            </Stack>
            <TextField label="Website" value={values.website} onChange={updateField('website')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant="contained" onClick={submit} disabled={!values.name.trim()}>
                {submitLabel}
              </Button>
              {onCancel && (
                <Button variant="outlined" onClick={onCancel}>Cancel</Button>
              )}
            </Stack>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="subtitle1">Logo</Typography>
            <Button variant="outlined" component="label" sx={{ width: 'fit-content' }}>
              Browse Logo
              <input hidden type="file" accept="image/*" onChange={updateFile} />
            </Button>
            {previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt="Institute logo"
                sx={{
                  width: '100%',
                  maxWidth: 280,
                  aspectRatio: '4 / 3',
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 280,
                  aspectRatio: '4 / 3',
                  borderRadius: 2,
                  border: '1px dashed rgba(27,26,23,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}
              >
                <Typography variant="body2">No logo selected</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Paper>
    </Stack>
  )
}
