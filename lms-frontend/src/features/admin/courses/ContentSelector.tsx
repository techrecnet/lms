import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  TextField,
  Typography,
  CircularProgress,
  Box
} from '@mui/material'
import { api } from '../../../core/api'

type ContentType = 'topic' | 'mcq'

type Props = {
  open: boolean
  courseId: string
  onSelect: (type: ContentType, contentId: string, contentTitle: string) => void
  onCancel: () => void
}

export default function ContentSelector({ open, courseId, onSelect, onCancel }: Props) {
  const [contentType, setContentType] = useState<ContentType>('topic')
  const [topics, setTopics] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [selectedTopic, setSelectedTopic] = useState<any>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [searchTopic, setSearchTopic] = useState('')
  const [searchQuestion, setSearchQuestion] = useState('')

  // Load topics when dialog opens or content type changes
  useEffect(() => {
    if (open && contentType === 'topic') {
      setLoadingTopics(true)
      api
        .get('/topics-lib', { params: { courseId: courseId || undefined } })
        .then((res) => setTopics(res.data))
        .catch(() => setTopics([]))
        .finally(() => setLoadingTopics(false))
    }
  }, [open, contentType, courseId])

  // Load questions when dialog opens or content type changes
  useEffect(() => {
    if (open && contentType === 'mcq') {
      setLoadingQuestions(true)
      api
        .get('/questions', { params: { courseId: courseId || undefined, type: 'MCQ' } })
        .then((res) => setQuestions(res.data))
        .catch(() => setQuestions([]))
        .finally(() => setLoadingQuestions(false))
    }
  }, [open, contentType, courseId])

  const handleSelect = () => {
    if (contentType === 'topic' && selectedTopic) {
      onSelect('topic', selectedTopic._id, selectedTopic.title)
      setSelectedTopic(null)
    } else if (contentType === 'mcq' && selectedQuestion) {
      onSelect('mcq', selectedQuestion._id, selectedQuestion.title)
      setSelectedQuestion(null)
    }
  }

  const handleClose = () => {
    setSelectedTopic(null)
    setSelectedQuestion(null)
    setSearchTopic('')
    setSearchQuestion('')
    onCancel()
  }

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(searchTopic.toLowerCase())
  )

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchQuestion.toLowerCase()) ||
    q.level.toLowerCase().includes(searchQuestion.toLowerCase())
  )

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Content to Section</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Stack>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Content Type
            </Typography>
            <ToggleButtonGroup
              value={contentType}
              exclusive
              onChange={(e, newValue) => {
                if (newValue) setContentType(newValue)
              }}
              fullWidth
            >
              <ToggleButton value="topic">Topic Library</ToggleButton>
              <ToggleButton value="mcq">MCQ Question</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {contentType === 'topic' ? (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Search and select a topic from the topic library
              </Typography>
              {loadingTopics ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <Autocomplete
                  options={filteredTopics}
                  getOptionLabel={(option) => `${option.title}`}
                  value={selectedTopic}
                  onChange={(e, newValue) => setSelectedTopic(newValue)}
                  inputValue={searchTopic}
                  onInputChange={(e, newValue) => setSearchTopic(newValue)}
                  noOptionsText="No topics found"
                  renderInput={(params) => (
                    <TextField {...params} label="Search Topics" placeholder="Type to search..." />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box component="li" key={key} {...otherProps}>
                        <Stack>
                          <Typography variant="body2">{option.title}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {option.courseIds?.map((c: any) => c.title).join(', ') || 'No courses'}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  }}
                />
              )}
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Search and select an MCQ from the question bank
              </Typography>
              {loadingQuestions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <Autocomplete
                  options={filteredQuestions}
                  getOptionLabel={(option) => option.title}
                  value={selectedQuestion}
                  onChange={(e, newValue) => setSelectedQuestion(newValue)}
                  inputValue={searchQuestion}
                  onInputChange={(e, newValue) => setSearchQuestion(newValue)}
                  noOptionsText="No questions found"
                  renderInput={(params) => (
                    <TextField {...params} label="Search Questions" placeholder="Type to search..." />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box component="li" key={key} {...otherProps}>
                        <Stack>
                          <Typography variant="body2">{option.title}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {option.courseId?.title} • Level: {option.level}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  }}
                />
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSelect}
          disabled={contentType === 'topic' ? !selectedTopic : !selectedQuestion}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}
