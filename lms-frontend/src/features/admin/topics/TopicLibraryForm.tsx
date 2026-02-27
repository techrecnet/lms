import { Button, Paper, Stack, TextField, Typography, Autocomplete, Box } from '@mui/material'
import { useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

export type TopicFormValues = {
  courseIds: string[]
  title: string
  content: string
  aiSummary?: string
  audio?: File
  audioPath?: string
}

type Props = {
  title: string
  courses: any[]
  initialValues: TopicFormValues
  submitLabel: string
  onSubmit: (values: TopicFormValues) => Promise<void>
  onCancel?: () => void
}

export default function TopicLibraryForm({ title, courses, initialValues, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<TopicFormValues>(initialValues)
  const [selectedCourses, setSelectedCourses] = useState<any[]>([])
  const [audioFileName, setAudioFileName] = useState<string>('')

  useEffect(() => {
    setValues(initialValues)
    const coursesForIds = initialValues.courseIds.map(id => courses.find(c => c._id === id)).filter(Boolean)
    setSelectedCourses(coursesForIds)
    if (initialValues.audioPath) {
      setAudioFileName(initialValues.audioPath.split('/').pop() || '')
    }
  }, [initialValues, courses])

  const handleCourseChange = (event: any, newValue: any[]) => {
    setSelectedCourses(newValue)
    setValues({ ...values, courseIds: newValue.map((c: any) => c._id) })
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFileName(file.name)
      setValues({ ...values, audio: file })
    }
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Create or edit a topic for the topic library and assign it to multiple courses.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Autocomplete
            multiple
            options={courses}
            getOptionLabel={(option) => option.title}
            value={selectedCourses}
            onChange={handleCourseChange}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => (
              <TextField {...params} label="Select Courses" placeholder="Search and select courses" />
            )}
          />

          <TextField
            label="Topic Title"
            value={values.title}
            onChange={(e) => setValues({ ...values, title: e.target.value })}
            required
            fullWidth
          />

          <Stack>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Content</Typography>
            <Box sx={{ '& .ql-editor': { minHeight: 250 } }}>
              <ReactQuill value={values.content} onChange={(content) => setValues({ ...values, content })} />
            </Box>
          </Stack>

          <Stack>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
              AI Summary
            </Typography>
            <TextField
              multiline
              rows={4}
              placeholder="Enter a summary or leave blank to auto-generate from content when saving..."
              value={values.aiSummary || ''}
              onChange={(e) => setValues({ ...values, aiSummary: e.target.value })}
              fullWidth
              helperText="You can manually write a summary or leave it empty to let AI generate one automatically when you save."
            />
          </Stack>

          <Stack>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Audio File</Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              {audioFileName ? `Selected: ${audioFileName}` : 'Upload Audio'}
              <input
                type="file"
                accept="audio/*"
                hidden
                onChange={handleAudioChange}
              />
            </Button>
            {initialValues.audioPath && !values.audio && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                Current audio: {initialValues.audioPath.split('/').pop()}
              </Typography>
            )}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={() => onSubmit(values)} disabled={values.courseIds.length === 0 || !values.title.trim()}>
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
