import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../../core/api'
import { useAppSelector } from '../../../shared/hooks/redux'
import { Box, Button, Paper, Stack, Typography, Radio, RadioGroup, FormControlLabel, Alert, Chip, IconButton } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ContentRenderer from '../../../shared/components/ContentRenderer'
import { ENV } from '../../../app/env'
import React from 'react'
function NextTopicOrSectionButton({ selectedContentId, topicSequence, goToTopic, activeSection, sections, setActiveSectionId, setSelectedContentId }: any) {
  if (!activeSection) return null
  const currentIdx = topicSequence.findIndex((t: any) => t.key === selectedContentId)
  const nextTopic = currentIdx !== -1 ? topicSequence[currentIdx + 1] : topicSequence[0]
  const isLastTopic = currentIdx === topicSequence.length - 1
  const currentSectionIdx = sections.findIndex((s: any) => s._id === activeSection._id)
  const nextSection = sections[currentSectionIdx + 1]
  if (nextTopic && !isLastTopic) {
    return (
      <Button variant="contained" onClick={() => goToTopic(nextTopic.key)}>
        Next Topic
      </Button>
    )
  } else if (isLastTopic && nextSection) {
    return (
      <Button variant="contained" onClick={() => {
        setActiveSectionId(nextSection._id)
        setSelectedContentId(null)
      }}>
        Next Section - {nextSection.title}
      </Button>
    )
  } else {
    return null
  }
}

export default function UserCoursePage() {
  const { id } = useParams()
  const user = useAppSelector(s => s.auth.user)
  const isMentor = user?.role === 'mentor'
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')
  const [course, setCourse] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [submittedAnswer, setSubmittedAnswer] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(40)
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(true)
  const [isDragging, setIsDragging] = useState(false)
  const sectionRowRef = useRef<HTMLDivElement | null>(null)
  const contentPanelRef = useRef<HTMLDivElement | null>(null)
  const splitPanelRef = useRef<HTMLDivElement | null>(null)

  const load = async () => {
    const res = await api.get(`/courses/${id}`)
    setCourse(res.data)
  }

  const loadProgress = async () => {
    try {
      const res = await api.get(`/progress/courses/${id}`)
      setProgress(res.data)
    } catch (err) {
      console.error('Failed to load progress', err)
    }
  }

  useEffect(() => { 
    load().catch(() => setCourse(null))
    loadProgress()
  }, [id])

  useEffect(() => {
    if (!course?.sections || course.sections.length === 0) return
    setActiveSectionId((prev) => prev ?? course.sections[0]._id)
    setSelectedContentId(null)
    setSubmittedAnswer(false)
    setSelectedAnswer('')
    setIsCorrect(null)
  }, [course])

  useEffect(() => {
    if (!selectedContentId) return
    contentPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedContentId])

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (event: MouseEvent) => {
      if (!splitPanelRef.current) return
      const rect = splitPanelRef.current.getBoundingClientRect()
      const next = ((event.clientX - rect.left) / rect.width) * 100
      const clamped = Math.min(60, Math.max(20, next))
      setLeftPanelWidth(clamped)
      if (!showLeftPanel) setShowLeftPanel(true)
    }

    const handleUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging, showLeftPanel])

  const markAsComplete = async (contentType: 'topic' | 'library-topic' | 'question', contentId: string) => {
    try {
      let endpoint = ''
      if (contentType === 'topic') {
        endpoint = `/progress/courses/${id}/topics/${contentId}/complete`
      } else if (contentType === 'library-topic') {
        endpoint = `/progress/courses/${id}/library-topics/${contentId}/complete`
      } else if (contentType === 'question') {
        endpoint = `/progress/courses/${id}/questions/${contentId}/complete`
      }
      const res = await api.post(endpoint)
      setProgress(res.data)
    } catch (err) {
      console.error('Failed to mark as complete', err)
    }
  }

  const isCompleted = (contentType: 'topic' | 'library-topic' | 'question', contentId: string): boolean => {
    if (!progress) return false
    if (contentType === 'topic') {
      return progress.completedTopics?.some((id: string) => id === contentId) || false
    } else if (contentType === 'library-topic') {
      return progress.completedLibraryTopics?.some((id: string) => id === contentId) || false
    } else if (contentType === 'question') {
      return progress.completedQuestions?.some((id: string) => id === contentId) || false
    }
    return false
  }

  const sections = course?.sections ?? []
  const activeSection = useMemo(() => sections.find((s: any) => s._id === activeSectionId) ?? sections[0], [sections, activeSectionId])
  const topicSequence = useMemo(() => {
    if (!activeSection) return []
    const inline = (activeSection.topics ?? []).map((t: any) => ({ key: `inline-${t._id}`, id: t._id }))
    const library = (activeSection.libraryTopics ?? []).map((t: any) => ({ key: `library-${t._id}`, id: t._id }))
    return [...inline, ...library]
  }, [activeSection])

  const getNextTopicKey = (currentKey: string) => {
    const idx = topicSequence.findIndex((t) => t.key === currentKey)
    if (idx === -1) return null
    return topicSequence[idx + 1]?.key ?? null
  }

  const goToTopic = (key: string) => {
    setSelectedContentId(key)
    setSubmittedAnswer(false)
    setSelectedAnswer('')
    setIsCorrect(null)
  }

  const scrollSections = (dir: 'left' | 'right') => {
    const el = sectionRowRef.current
    if (!el) return
    const amount = dir === 'left' ? -320 : 320
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }
const [descOpen, setDescOpen] = useState(false)
  if (!course) return <Typography>Course not found.</Typography>

  

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">{course.title}</Typography>
          {course.description && (
            <>
              <Button
                size="small"
                variant="text"
                onClick={() => setDescOpen((v) => !v)}
                sx={{ minWidth: 0, px: 1, alignSelf: 'flex-start' }}
              >
                {descOpen ? 'Hide Description' : 'Show Description'}
              </Button>
              {descOpen && (
                <Typography variant="body2" sx={{ mt: 1 }}>{course.description}</Typography>
              )}
            </>
          )}
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

      {sections.length > 0 && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" onClick={() => scrollSections('left')}><ChevronLeftIcon /></Button>
            <Box
              ref={sectionRowRef}
              sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridAutoColumns: { xs: '80%', sm: '50%', md: '220px' },
                gap: 2,
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                pb: 1,
                flex: 1
              }}
            >
              {sections.map((s: any) => {
                const sectionCompleted = progress?.completedSections?.some((sid: string) => sid === s._id) || false
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
                      backgroundColor: s._id === activeSection?._id ? 'rgba(15, 61, 48, 0.07)' : '#fff',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    {sectionCompleted && (
                      <CheckCircleIcon sx={{ position: 'absolute', top: 8, right: 8, color: 'success.main', fontSize: 20 }} />
                    )}
                    <Typography variant="subtitle1">{s.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {((s.topics?.length ?? 0) + (s.libraryTopics?.length ?? 0) + (s.questions?.length ?? 0))} items
                    </Typography>
                  </Paper>
                )
              })}
            </Box>
            <Button variant="outlined" onClick={() => scrollSections('right')}><ChevronRightIcon /></Button>
          </Stack>

          {activeSection && (
            <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">{activeSection.title}</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {showLeftPanel ? (
                    <Button variant="outlined" size="small" onClick={() => setShowLeftPanel(false)}>
                      Collapse
                    </Button>
                  ) : (
                    <Button variant="outlined" size="small" onClick={() => setShowLeftPanel(true)}>
                      Expand
                    </Button>
                  )}
                </Stack>
              </Stack>
              <Box
                ref={splitPanelRef}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  minHeight: 400,
                  position: 'relative'
                }}
              >
                {/* Left Column - Adjustable Width */}
                {showLeftPanel && (
                  <Box sx={{ 
                    width: { xs: '100%', md: '25%' }, 
                    minWidth: { md: 220 },
                    maxWidth: { md: 340 },
                    borderRight: { md: '1px solid #e0e0e0' }, 
                    pr: { md: 2 }, 
                    overflow: 'auto', 
                    maxHeight: 500,
                    transition: 'width 0.3s ease'
                  }}>
                    <Stack spacing={1}>
                      {/* Inline Topics */}
                      {(activeSection.topics ?? []).map((t: any, idx: number, arr: any[]) => {
                        const completed = isCompleted('topic', t._id)
                        return (
                          <div key={`inline-wrap-${t._id}`}>
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
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                                '&:hover': {
                                  backgroundColor: 'rgba(15, 61, 48, 0.05)'
                                }
                              }}
                            >
                              {completed && <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                              {t.title}
                            </Typography>
                            <hr style={{ margin: '4px 0', border: 0, borderTop: '1px solid #eee' }} />
                          </div>
                        )
                      })}
                          
                          {/* Library Topics */}
                        {(activeSection.libraryTopics ?? []).map((t: any, idx: number, arr: any[]) => {
                            const completed = isCompleted('library-topic', t._id)
                            return (
                              <div key={`library-wrap-${t._id}`}>
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
                                  {completed && <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                                  {t.title}
                                  <Chip label="Content → Library" size="small" variant="outlined" />
                                </Typography>
                                <hr style={{ margin: '4px 0', border: 0, borderTop: '1px solid #eee' }} />
                              </div>
                            )
                          })}
                          
                          {/* MCQ Questions */}
                          {(activeSection.questions ?? []).map((q: any) => {
                            const completed = isCompleted('question', q._id)
                            return (
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
                                {completed && <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                                {q.title}
                                <Chip label={`MCQ → ${q.level}`} size="small" variant="outlined" />
                              </Typography>
                            )
                          })}

                      {(activeSection.topics ?? []).length === 0 && (activeSection.libraryTopics ?? []).length === 0 && (activeSection.questions ?? []).length === 0 && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>No content in this section.</Typography>
                      )}
                    </Stack>
                </Box>
                )}

                {showLeftPanel && (
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'flex' },
                      alignItems: 'center',
                      position: 'relative'
                    }}
                  >
                    <Box
                      onMouseDown={(event) => {
                        event.preventDefault()
                        setIsDragging(true)
                      }}
                      sx={{
                        width: 10,
                        cursor: 'col-resize',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Box sx={{ width: 2, height: '70%', bgcolor: 'rgba(27,26,23,0.15)', borderRadius: 2 }} />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => setShowLeftPanel(false)}
                      sx={{
                        ml: 0.5,
                        border: '1px solid rgba(27,26,23,0.15)'
                      }}
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {!showLeftPanel && (
                  <IconButton
                    size="small"
                    onClick={() => setShowLeftPanel(true)}
                    sx={{
                      display: { xs: 'none', md: 'flex' },
                      position: 'absolute',
                      left: 0,
                      top: 12,
                      border: '1px solid rgba(27,26,23,0.15)',
                      backgroundColor: '#fff'
                    }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                )}

                {/* Right Column - Adjustable Width */}
                <Box
                  ref={contentPanelRef}
                  sx={{ 
                  width: { xs: '100%', md: showLeftPanel ? `${100 - leftPanelWidth}%` : '100%' }, 
                  pl: { md: showLeftPanel ? 2 : 0 }, 
                  overflow: 'auto', 
                  maxHeight: 500,
                  transition: 'width 0.3s ease'
                }}>
                  {selectedContentId ? (
                    (() => {
                      const [contentType, contentId] = selectedContentId.split('-').slice(0, 2)
                      const fullContentId = selectedContentId.substring(contentType.length + 1)

                      if (contentType === 'inline') {
                        const content = (activeSection.topics ?? [])
                          .find((t: any) => t._id === fullContentId)
                        const completed = isCompleted('topic', fullContentId)
                        const nextTopicKey = getNextTopicKey(`inline-${fullContentId}`)
                        return content ? (
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{content.title}</Typography>
                            {content.content ? (
                              <ContentRenderer content={content.content} />
                            ) : (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No content available.</Typography>
                            )}
                            {!isMentor && !completed && (
                              <Button 
                                variant="contained" 
                                color="success"
                                onClick={() => markAsComplete('topic', fullContentId)}
                              >
                                Mark as Complete
                              </Button>
                            )}
                            {!isMentor && completed && (
                              <Alert severity="success" icon={<CheckCircleIcon />}>
                                You have completed this topic!
                              </Alert>
                            )}
                            {isMentor && (
                              <Alert severity="info">
                                Mentor View - Content preview only. Students can mark topics as complete.
                              </Alert>
                            )}
                            {nextTopicKey && (
                              <Box>
                                <Button variant="outlined" onClick={() => goToTopic(nextTopicKey)}>
                                  Next Topic
                                </Button>
                              </Box>
                            )}
                          </Stack>
                        ) : null
                      }

                      if (contentType === 'library') {
                        const content = (activeSection.libraryTopics ?? [])
                          .find((t: any) => t._id === fullContentId)
                        const completed = isCompleted('library-topic', fullContentId)
                        const nextTopicKey = getNextTopicKey(`library-${fullContentId}`)
                        return content ? (
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{content.title}</Typography>
                            
                            {content.audio && (
                              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Audio</Typography>
                                <audio
                                  controls
                                  style={{ width: '100%' }}
                                  src={`${apiBase}${content.audio}`}
                                >
                                  Your browser does not support the audio element.
                                </audio>
                              </Box>
                            )}
                            
                            {content.aiSummary && (
                              <Box sx={{ p: 2.5, bgcolor: '#f0f7ff', borderRadius: 1, border: '1px solid #90caf9' }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                  <Box sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    borderRadius: '50%', 
                                    bgcolor: '#1976d2', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                  }}>
                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>AI</Typography>
                                  </Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    Summary
                                  </Typography>
                                </Stack>
                                <Box component="ul" sx={{ m: 0, pl: 2.5, listStyleType: 'disc' }}>
                                  {content.aiSummary.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => (
                                    <Box component="li" key={index} sx={{ mb: 0.5 }}>
                                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                        {line.trim()}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}
                            
                            {content.content ? (
                              <ContentRenderer content={content.content} />
                            ) : (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No content available.</Typography>
                            )}
                            {!isMentor && !completed && (
                              <Button 
                                variant="contained" 
                                color="success"
                                onClick={() => markAsComplete('library-topic', fullContentId)}
                              >
                                Mark as Complete
                              </Button>
                            )}
                            {!isMentor && completed && (
                              <Alert severity="success" icon={<CheckCircleIcon />}>
                                You have completed this topic!
                              </Alert>
                            )}
                            {isMentor && (
                              <Alert severity="info">
                                Mentor View - Content preview only. Students can mark topics as complete.
                              </Alert>
                            )}
                            {nextTopicKey && (
                              <Box>
                                <Button variant="outlined" onClick={() => goToTopic(nextTopicKey)}>
                                  Next Topic
                                </Button>
                              </Box>
                            )}
                          </Stack>
                        ) : null
                      }

                      if (contentType === 'mcq') {
                        const question = (activeSection.questions ?? [])
                          .find((q: any) => q._id === fullContentId)
                        const completed = isCompleted('question', fullContentId)
                        return question ? (
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{question.title}</Typography>
                            <Chip label={`Level: ${question.level}`} size="small" />
                            
                            {isMentor ? (
                              <Alert severity="info">
                                Mentor View - Quiz preview. Students can attempt questions during their session.
                              </Alert>
                            ) : !submittedAnswer ? (
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
                                    if (isAnswerCorrect && !completed) {
                                      markAsComplete('question', fullContentId)
                                    }
                                  }}
                                  disabled={!selectedAnswer}
                                >
                                  Submit Answer
                                </Button>
                              </>
                            ) : (
                              <Stack spacing={2}>
                                <Alert severity={isCorrect ? 'success' : 'error'}>
                                  {isCorrect ? 'Correct! This question is marked as complete.' : 'Incorrect!'}
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
              </Box>
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
