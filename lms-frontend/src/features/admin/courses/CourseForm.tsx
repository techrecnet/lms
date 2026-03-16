import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { ENV } from '../../../app/env'

export type CourseFormValues = {
  title: string
  description: string
  imageUrl: string
  imageFile?: File | null
  duration: string
  prerequisites: string
  outcomes: string
}

type Props = {
  title: string
  initialValues: CourseFormValues
  submitLabel: string
  onSubmit: (values: CourseFormValues) => Promise<void>
  onCancel?: () => void
}

export default function CourseForm({ title, initialValues, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<CourseFormValues>(initialValues)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')
  const previewUrl = useMemo(() => {
    if (localPreview) return localPreview
    const raw = values.imageUrl.trim()
    if (!raw) return ''
    return raw.startsWith('/') ? `${apiBase}${raw}` : raw
  }, [localPreview, values.imageUrl, apiBase])

  const updateField = (key: keyof CourseFormValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const updateFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setValues((prev) => ({ ...prev, imageFile: file }))
  }

  useEffect(() => {
    if (!values.imageFile) {
      setLocalPreview(null)
      return
    }
    const url = URL.createObjectURL(values.imageFile)
    setLocalPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [values.imageFile])

  const submit = async () => {
    await onSubmit({
      title: values.title.trim(),
      description: values.description,
      imageUrl: values.imageUrl,
      imageFile: values.imageFile ?? null,
      duration: values.duration,
      prerequisites: values.prerequisites,
      outcomes: values.outcomes
    })
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image', 'clean']
    ]
  }

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'blockquote', 'code-block', 'indent', 'color', 'background', 'align', 'link', 'image'
  ]

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Capture the details that shape a learner's journey.
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
            <TextField label="Title" value={values.title} onChange={updateField('title')} />
            <TextField label="Description" value={values.description} onChange={updateField('description')} multiline minRows={4} />
            <TextField label="Duration" value={values.duration} onChange={updateField('duration')} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Prerequisites</Typography>
              <Box sx={{ '& .ql-editor': { minHeight: 160 } }}>
                <ReactQuill value={values.prerequisites} onChange={(content) => setValues((prev) => ({ ...prev, prerequisites: content }))} modules={quillModules} formats={quillFormats} />
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Outcomes</Typography>
              <Box sx={{ '& .ql-editor': { minHeight: 160 } }}>
                <ReactQuill value={values.outcomes} onChange={(content) => setValues((prev) => ({ ...prev, outcomes: content }))} modules={quillModules} formats={quillFormats} />
              </Box>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant="contained" onClick={submit} disabled={!values.title.trim()}>
                {submitLabel}
              </Button>
              {onCancel && (
                <Button variant="outlined" onClick={onCancel}>Cancel</Button>
              )}
            </Stack>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="subtitle1">Cover image</Typography>
            <Button variant="outlined" component="label" sx={{ width: 'fit-content' }}>
              Browse Image
              <input hidden type="file" accept="image/*" onChange={updateFile} />
            </Button>
            {previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt="Course preview"
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
                <Typography variant="body2">No image selected</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Paper>
    </Stack>
  )
}
