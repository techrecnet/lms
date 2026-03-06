import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../../core/api'
import { ENV } from '../../../app/env'
import { Box, Button, Paper, Stack, Typography, Radio, RadioGroup, FormControlLabel, Alert, Chip } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ContentRenderer from '../../../shared/components/ContentRenderer'

type ContentItem = {
  _id: string
  title: string
  type: 'inline' | 'library' | 'mcq'
  content?: string
  options?: any[]
  level?: string
  explanation?: string
  correctAnswer?: number
}

export default function CourseDetailsPage() {
  const { id } = useParams()
  const [course, setCourse] = useState<any>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [submittedAnswer, setSubmittedAnswer] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const sectionRowRef = useRef<HTMLDivElement | null>(null)
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  const load = async () => {
    const res = await api.get(`/courses/${id}`)
    setCourse(res.data)
  }

  useEffect(() => { load().catch(() => setCourse(null)) }, [id])

  useEffect(() => {
    if (!course?.sections || course.sections.length === 0) return
    setActiveSectionId((prev) => prev ?? course.sections[0]._id)
    setSelectedContentId(null)
    setSubmittedAnswer(false)
    setSelectedAnswer('')
    setIsCorrect(null)
  }, [course])

  if (!course) return <Typography>Course not found.</Typography>

  const imageUrl = course.imageUrl?.startsWith('/')
    ? `${apiBase}${course.imageUrl}`
    : course.imageUrl

  const sections = course.sections ?? []
  const activeSection = sections.find((s: any) => s._id === activeSectionId) ?? sections[0]

  const scrollSections = (dir: 'left' | 'right') => {
    const el = sectionRowRef.current
    if (!el) return
    const amount = dir === 'left' ? -320 : 320
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">Course Details</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            A complete snapshot of this course and its learning intent.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">{course.title}</Typography>
          {course.description && <Typography variant="body2">{course.description}</Typography>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {course.duration && <Typography variant="body2">Duration: {course.duration}</Typography>}
            {course.prerequisites && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                Prerequisites: {course.prerequisites}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>

      {imageUrl && (
        <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Cover Image</Typography>
          <Box
            component="img"
            src={imageUrl}
            alt={`${course.title} cover`}
            sx={{ maxWidth: 360, width: '100%', height: 'auto', borderRadius: 2 }}
          />
        </Paper>
      )}

      {sections.length > 0 && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" onClick={() => scrollSections('left')}><ChevronLeftIcon /></Button>
            <Box
              ref={sectionRowRef}
              sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridAutoColumns: { xs: '80%', sm: '60%', md: 'calc((100% - 32px) / 3)' },
                gap: 2,
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                pb: 1,
                flex: 1
              }}
            >
              {sections.map((s: any) => {
                const topicCount = s.topics?.length ?? 0
                const libraryTopicCount = s.libraryTopics?.length ?? 0
                const mcqCount = s.questions?.length ?? 0
                
                return (
                  <Paper
                    key={s._id}
                    onClick={() => {
                      setActiveSectionId(s._id)
                      setSelectedContentId(null)
                      setSubmittedAnswer(false)
                      setSelectedAnswer('')
                      setIsCorrect(null)
                    }}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: s._id === activeSection?._id ? '2px solid #0f3d30' : '1px solid rgba(27,26,23,0.08)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Typography variant="subtitle1">{s.title}</Typography>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {topicCount} topics • {libraryTopicCount} library • {mcqCount} MCQs
                      </Typography>
                    </Stack>
                  </Paper>
                )
              })}
            </Box>
            <Button variant="outlined" onClick={() => scrollSections('right')}><ChevronRightIcon /></Button>
          </Stack>

          {activeSection && (
            <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{activeSection.title}</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ minHeight: 400 }}>
                {/* Left Column - 40% */}
                <Box sx={{ width: { xs: '100%', md: '40%' }, borderRight: { md: '1px solid #e0e0e0' }, pr: { md: 2 }, overflow: 'auto', maxHeight: 500 }}>
                  <Stack spacing={1}>
                    {/* Inline Topics */}
                    {(activeSection.topics ?? []).map((t: any) => (
                      <Typography
                        key={`inline-${t._id}`}
                        variant="body2"
                        onClick={() => {
                          setSelectedContentId(`inline-${t._id}`)
                          setSubmittedAnswer(false)
                          setSelectedAnswer('')
                          setIsCorrect(null)
                        }}
                        sx={{
                          cursor: 'pointer',
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: selectedContentId === `inline-${t._id}` ? 'rgba(15, 61, 48, 0.1)' : 'transparent',
                          border: selectedContentId === `inline-${t._id}` ? '1px solid #0f3d30' : '1px solid transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: 'rgba(15, 61, 48, 0.05)'
                          }
                        }}
                      >
                        {t.title}
                      </Typography>
                    ))}
                    
                    {/* Library Topics */}
                    {(activeSection.libraryTopics ?? []).map((t: any) => (
                      <Typography
                        key={`library-${t._id}`}
                        variant="body2"
                        onClick={() => {
                          setSelectedContentId(`library-${t._id}`)
                          setSubmittedAnswer(false)
                          setSelectedAnswer('')
                          setIsCorrect(null)
                        }}
                        sx={{
                          cursor: 'pointer',
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: selectedContentId === `library-${t._id}` ? 'rgba(15, 61, 48, 0.1)' : 'transparent',
                          border: selectedContentId === `library-${t._id}` ? '1px solid #0f3d30' : '1px solid transparent',
                          transition: 'all 0.2s',
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                          '&:hover': {
                            backgroundColor: 'rgba(15, 61, 48, 0.05)'
                          }
                        }}
                      >
                        {t.title}
                        <Chip label="Content → Library" size="small" variant="outlined" />
                      </Typography>
                    ))}
                    
                    {/* MCQ Questions */}
                    {(activeSection.questions ?? []).map((q: any) => (
                      <Typography
                        key={`mcq-${q._id}`}
                        variant="body2"
                        onClick={() => {
                          setSelectedContentId(`mcq-${q._id}`)
                          setSubmittedAnswer(false)
                          setSelectedAnswer('')
                          setIsCorrect(null)
                        }}
                        sx={{
                          cursor: 'pointer',
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: selectedContentId === `mcq-${q._id}` ? 'rgba(15, 61, 48, 0.1)' : 'transparent',
                          border: selectedContentId === `mcq-${q._id}` ? '1px solid #0f3d30' : '1px solid transparent',
                          transition: 'all 0.2s',
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                          '&:hover': {
                            backgroundColor: 'rgba(15, 61, 48, 0.05)'
                          }
                        }}
                      >
                        {q.title}
                        <Chip label={`MCQ → ${q.level}`} size="small" variant="outlined" />
                      </Typography>
                    ))}

                    {(activeSection.topics ?? []).length === 0 && (activeSection.libraryTopics ?? []).length === 0 && (activeSection.questions ?? []).length === 0 && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>No content in this section.</Typography>
                    )}
                  </Stack>
                </Box>

                {/* Right Column - 60% */}
                <Box sx={{ width: { xs: '100%', md: '60%' }, pl: { md: 2 }, overflow: 'auto', maxHeight: 500 }}>
                  {selectedContentId ? (
                    (() => {
                      const [contentType, contentId] = selectedContentId.split('-').slice(0, 2)
                      const fullContentId = selectedContentId.substring(contentType.length + 1)

                      if (contentType === 'inline') {
                        const content = (activeSection.topics ?? [])
                          .find((t: any) => t._id === fullContentId)
                        return content ? (
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{content.title}</Typography>
                            {content.content ? (
                              <ContentRenderer content={content.content} />
                            ) : (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No content available.</Typography>
                            )}
                          </Stack>
                        ) : null
                      }

                      if (contentType === 'library') {
                        const content = (activeSection.libraryTopics ?? [])
                          .find((t: any) => t._id === fullContentId)
                        return content ? (
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{content.title}</Typography>
                            {content.content ? (
                              <ContentRenderer content={content.content} />
                            ) : (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No content available.</Typography>
                            )}
                          </Stack>
                        ) : null
                      }

                      if (contentType === 'mcq') {
                        const question = (activeSection.questions ?? [])
                          .find((q: any) => q._id === fullContentId)
                        return question ? (
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{question.title}</Typography>
                            <Chip label={`Level: ${question.level}`} size="small" />
                            
                            {!submittedAnswer ? (
                              <>
                                <RadioGroup value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)}>
                                  <Stack spacing={1}>
                                    {(question.options ?? []).map((option: any, idx: number) => (
                                      <FormControlLabel
                                        key={idx}
                                        value={idx.toString()}
                                        control={<Radio />}
                                        label={option.text}
                                      />
                                    ))}
                                  </Stack>
                                </RadioGroup>
                                <Button
                                  variant="contained"
                                  onClick={() => {
                                    setSubmittedAnswer(true)
                                    const isAnswerCorrect = parseInt(selectedAnswer) === question.options.findIndex((o: any) => o.isCorrect)
                                    setIsCorrect(isAnswerCorrect)
                                  }}
                                  disabled={!selectedAnswer}
                                >
                                  Submit Answer
                                </Button>
                              </>
                            ) : (
                              <Stack spacing={2}>
                                <Alert severity={isCorrect ? 'success' : 'error'}>
                                  {isCorrect ? 'Correct!' : 'Incorrect!'}
                                </Alert>
                                {question.explanation && (
                                  <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Explanation:</Typography>
                                    <ContentRenderer content={question.explanation} />
                                  </Box>
                                )}
                                <Button variant="outlined" onClick={() => {
                                  setSubmittedAnswer(false)
                                  setSelectedAnswer('')
                                  setIsCorrect(null)
                                }}>
                                  Try Again
                                </Button>
                              </Stack>
                            )}
                          </Stack>
                        ) : null
                      }

                      return null
                    })()
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      Select a topic or question from the left to view its content.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      )}

      {sections.length === 0 && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>No sections yet.</Typography>
        </Paper>
      )}
    </Stack>
  )
}
