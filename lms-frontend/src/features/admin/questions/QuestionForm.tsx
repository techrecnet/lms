import { Button, MenuItem, Paper, Stack, TextField, Typography, FormControlLabel, Radio, RadioGroup, IconButton, Box } from '@mui/material'
import { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

export type QuestionFormValues = {
  courseId: string
  title: string
  description: string
  type: 'MCQ' | 'Subjective'
  level: 'easy' | 'medium' | 'hard'
  keywords: string[]
  explanation: string
  options: Array<{ text: string; isCorrect: boolean }>
  sampleAnswer: string
}

type Props = {
  title: string
  courses: any[]
  initialValues: QuestionFormValues
  submitLabel: string
  onSubmit: (values: QuestionFormValues) => Promise<void>
  onCancel?: () => void
}

export default function QuestionForm({ title, courses, initialValues, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<QuestionFormValues>(initialValues)
  const [keywordInput, setKeywordInput] = useState('')

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const addKeyword = () => {
    if (keywordInput.trim() && !values.keywords.includes(keywordInput.trim())) {
      setValues({ ...values, keywords: [...values.keywords, keywordInput.trim()] })
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setValues({ ...values, keywords: values.keywords.filter((k) => k !== keyword) })
  }

  const addOption = () => {
    if (values.options.length < 4) {
      setValues({
        ...values,
        options: [...values.options, { text: '', isCorrect: false }]
      })
    }
  }

  const removeOption = (index: number) => {
    if (values.options.length > 2) {
      setValues({
        ...values,
        options: values.options.filter((_, i) => i !== index)
      })
    }
  }

  const updateOption = (index: number, text: string) => {
    const newOptions = [...values.options]
    newOptions[index].text = text
    setValues({ ...values, options: newOptions })
  }

  const setCorrectOption = (index: number) => {
    const newOptions = values.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }))
    setValues({ ...values, options: newOptions })
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Create or edit questions for your question bank.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <TextField select label="Course" value={values.courseId} onChange={(e) => setValues({ ...values, courseId: e.target.value })} required fullWidth>
            <MenuItem value="">Select a course</MenuItem>
            {courses.map((c) => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}
          </TextField>

          <TextField
            label="Question Title"
            value={values.title}
            onChange={(e) => setValues({ ...values, title: e.target.value })}
            required
            fullWidth
          />

          <TextField
            label="Description"
            value={values.description}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
            multiline
            minRows={3}
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Type" value={values.type} onChange={(e) => setValues({ ...values, type: e.target.value as 'MCQ' | 'Subjective' })} fullWidth required>
              <MenuItem value="MCQ">MCQ</MenuItem>
              <MenuItem value="Subjective">Subjective</MenuItem>
            </TextField>

            <TextField select label="Level" value={values.level} onChange={(e) => setValues({ ...values, level: e.target.value as 'easy' | 'medium' | 'hard' })} fullWidth required>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </TextField>
          </Stack>

          <TextField
            label="Explanation"
            value={values.explanation}
            onChange={(e) => setValues({ ...values, explanation: e.target.value })}
            multiline
            minRows={3}
            fullWidth
            placeholder="Explain the answer/concept"
          />

          {/* Keywords */}
          <Stack>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Keywords</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                label="Add keyword"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                fullWidth
                size="small"
              />
              <Button variant="outlined" onClick={addKeyword} sx={{ minWidth: 120 }}>Add</Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {values.keywords.map((k) => (
                <Box key={k} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#e0e0e0', px: 1.5, py: 0.5, borderRadius: 2 }}>
                  <Typography variant="body2">{k}</Typography>
                  <IconButton size="small" onClick={() => removeKeyword(k)} sx={{ p: 0 }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Stack>

          {/* MCQ Options */}
          {values.type === 'MCQ' && (
            <Stack>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Options (Min 2, Max 4)</Typography>
              <Stack spacing={1.5}>
                {values.options.map((opt, idx) => (
                  <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                    <TextField
                      label={`Option ${idx + 1}`}
                      value={opt.text}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <FormControlLabel
                      control={
                        <Radio
                          checked={opt.isCorrect}
                          onChange={() => setCorrectOption(idx)}
                        />
                      }
                      label="Correct"
                      sx={{ minWidth: 100 }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeOption(idx)}
                      disabled={values.options.length <= 2}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
              {values.options.length < 4 && (
                <Button startIcon={<AddIcon />} variant="outlined" onClick={addOption} sx={{ mt: 1, width: 'fit-content' }}>
                  Add Option
                </Button>
              )}
            </Stack>
          )}

          {/* Subjective Answer */}
          {values.type === 'Subjective' && (
            <TextField
              label="Sample Answer"
              value={values.sampleAnswer}
              onChange={(e) => setValues({ ...values, sampleAnswer: e.target.value })}
              multiline
              minRows={4}
              fullWidth
              placeholder="Enter a sample answer for reference"
            />
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={() => onSubmit(values)} disabled={!values.courseId.trim() || !values.title.trim()}>
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
