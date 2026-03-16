import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../../core/api'
import { useAppSelector } from '../../../shared/hooks/redux'
import { Box, Button, Paper, Stack, Typography, Radio, RadioGroup, FormControlLabel, Alert, Chip, IconButton, Collapse, Divider, AppBar } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import TocIcon from '@mui/icons-material/Toc'
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
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [fontSize, setFontSize] = useState<number>(16)
  const [showSidebar, setShowSidebar] = useState<boolean>(true)
  const [showTOC, setShowTOC] = useState<boolean>(false)
  const contentPanelRef = useRef<HTMLDivElement | null>(null)

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
    setExpandedSectionId(course.sections[0]._id)
    setSelectedContentId(null)
    setSubmittedAnswer(false)
    setSelectedAnswer('')
    setIsCorrect(null)
  }, [course])

  useEffect(() => {
    if (!selectedContentId) return
    contentPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedContentId])

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

  const getPrevTopicKey = (currentKey: string) => {
    const idx = topicSequence.findIndex((t) => t.key === currentKey)
    if (idx <= 0) return null
    return topicSequence[idx - 1]?.key ?? null
  }

  const getTopicNameFromKey = (key: string): string => {
    if (!key) return ''
    const [contentType, ...rest] = key.split('-')
    const fullContentId = rest.join('-')
    
    if (contentType === 'inline') {
      return (activeSection.topics ?? []).find((t: any) => t._id === fullContentId)?.title || ''
    } else if (contentType === 'library') {
      return (activeSection.libraryTopics ?? []).find((t: any) => t._id === fullContentId)?.title || ''
    }
    return ''
  }

  const getTableOfContents = (): Array<{ title: string; id: string }> => {
    if (!selectedContentId) return []
    const headings: Array<{ title: string; id: string }> = []
    const contentEl = contentPanelRef.current
    if (contentEl) {
      const h3Elements = contentEl.querySelectorAll('h3')
      h3Elements.forEach((el, idx) => {
        const text = el.textContent || `Heading ${idx + 1}`
        headings.push({
          title: text,
          id: `heading-${idx}`
        })
      })
    }
    return headings
  }

  const scrollToHeading = (index: number) => {
    const contentEl = contentPanelRef.current
    if (contentEl) {
      const h3Elements = contentEl.querySelectorAll('h3')
      if (h3Elements[index]) {
        h3Elements[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const calculateProgress = (): number => {
    if (!sections || sections.length === 0) return 0
    const totalItems = sections.reduce((sum: number, s: any) => {
      return sum + ((s.topics?.length ?? 0) + (s.libraryTopics?.length ?? 0) + (s.questions?.length ?? 0))
    }, 0)
    const completedItems = (
      (progress?.completedTopics?.length ?? 0) + 
      (progress?.completedLibraryTopics?.length ?? 0) + 
      (progress?.completedQuestions?.length ?? 0)
    )
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  }

  const goToTopic = (key: string) => {
    setSelectedContentId(key)
    setSubmittedAnswer(false)
    setSelectedAnswer('')
    setIsCorrect(null)
  }

  const toggleSectionExpand = (sectionId: string) => {
    setExpandedSectionId(expandedSectionId === sectionId ? null : sectionId)
  }

  if (!course) return <Typography>Course not found.</Typography>

  const tableOfContents = getTableOfContents()
  const progressPercent = calculateProgress()

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000'
    }}>
      {/* Top Bar */}
      <AppBar position="static" sx={{
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: `1px solid ${isDarkMode ? '#444444' : '#e5e7eb'}`
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5 }} spacing={2}>
          {/* Left Section - Menu & Course Info */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            <IconButton 
              size="small" 
              onClick={() => setShowSidebar(!showSidebar)}
              sx={{ color: 'inherit' }}
            >
              {showSidebar ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
            <Box sx={{ minWidth: 0, flex: 1, cursor: 'pointer' }} onClick={() => setSelectedContentId(null)}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem' }} noWrap>
                {course.title}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.7 }}>
                Progress: {progressPercent}%
              </Typography>
            </Box>
          </Stack>

          {/* Right Section - Controls */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {/* Font Size Controls */}
            <IconButton 
              size="small" 
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              title="Decrease font"
              sx={{ color: 'inherit' }}
            >
              <TextFieldsIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography variant="caption" sx={{ width: 20, textAlign: 'center', color: 'inherit' }}>
              {fontSize}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setFontSize(Math.min(40, fontSize + 2))}
              title="Increase font"
              sx={{ color: 'inherit' }}
            >
              <TextFieldsIcon sx={{ fontSize: 24 }} />
            </IconButton>
            
            {/* Reset Font */}
            <IconButton 
              size="small" 
              onClick={() => setFontSize(16)}
              title="Reset font to default"
              sx={{ color: 'inherit', fontSize: '0.75rem' }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Reset</Typography>
            </IconButton>

            {/* Dark Mode Toggle */}
            <IconButton 
              size="small" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
              sx={{ color: 'inherit' }}
            >
              {isDarkMode ? <BrightnessHighIcon /> : <Brightness4Icon />}
            </IconButton>

            {/* Table of Contents */}
            <IconButton 
              size="small" 
              onClick={() => setShowTOC(!showTOC)}
              title="Table of contents"
              sx={{ color: 'inherit' }}
            >
              <TocIcon />
            </IconButton>
          </Stack>
        </Stack>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{
        display: 'flex',
        flex: 1,
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        gap: { xs: 0, md: 0 }
      }}>
      {/* Left Sidebar */}
      <Box sx={{
        width: showSidebar ? { xs: '100%', sm: '260px', md: '280px' } : 0,
        transition: 'width 0.3s ease',
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        borderRight: showSidebar ? `1px solid ${isDarkMode ? '#444444' : '#e5e7eb'}` : 'none',
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: 'calc(100vh - 120px)',
        position: { xs: 'relative', sm: 'sticky' },
        top: 0,
        p: showSidebar ? { xs: 1, sm: 1.5 } : 0,
        flexShrink: 0
      }}>
        {/* Sidebar Content */}
        {sections && sections.map((section: any) => (
          <Box key={section._id} sx={{ mb: 1 }}>
            <Box
              onClick={() => setExpandedSectionId(expandedSectionId === section._id ? null : section._id)}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 0.75,
                backgroundColor: isDarkMode ? '#3d3d3d' : '#f9fafb',
                borderRadius: 0.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: isDarkMode ? '#ffffff' : '#333333',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#4d4d4d' : '#f3f4f6'
                }
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500, color: 'inherit' }}>
                {section.title || section.name}
              </Typography>
              {expandedSectionId === section._id ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
            </Box>
            <Collapse in={expandedSectionId === section._id} timeout="auto">
              <Stack spacing={0.25} sx={{ pl: 1, mt: 0.5 }}>
                {/* Topics */}
                {section.topics && section.topics.map((topic: any) => (
                  <Box
                    key={topic._id}
                    onClick={() => {
                      setActiveSectionId(section._id)
                      setSelectedContentId(`inline-${topic._id}`)
                    }}
                    sx={{
                      p: 0.75,
                      pl: 2,
                      borderLeftWidth: 2,
                      borderLeftStyle: 'solid',
                      borderLeftColor: 'indigo',
                      borderRadius: 0.25,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      backgroundColor: selectedContentId === `inline-${topic._id}` ? (isDarkMode ? '#3d3d3d' : '#f3f4f6') : 'transparent',
                      transition: 'all 0.2s',
                      color: isDarkMode ? '#ffffff' : '#333333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: isDarkMode ? '#3d3d3d' : '#f3f4f6'
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.8rem', flex: 1, color: 'inherit' }}>
                      {topic.title || topic.name}
                    </Typography>
                    {progress?.completedTopics?.includes(topic._id) && (
                      <CheckCircleIcon sx={{ fontSize: 14, color: 'green', ml: 0.5 }} />
                    )}
                  </Box>
                ))}

                {/* Library Topics */}
                {section.libraryTopics && section.libraryTopics.map((libTopic: any) => (
                  <Box
                    key={libTopic._id}
                    onClick={() => {
                      setActiveSectionId(section._id)
                      setSelectedContentId(`library-${libTopic._id}`)
                    }}
                    sx={{
                      p: 0.75,
                      pl: 2,
                      borderLeftWidth: 2,
                      borderLeftStyle: 'solid',
                      borderLeftColor: 'cyan',
                      borderRadius: 0.25,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      backgroundColor: selectedContentId === `library-${libTopic._id}` ? (isDarkMode ? '#3d3d3d' : '#f3f4f6') : 'transparent',
                      transition: 'all 0.2s',
                      color: isDarkMode ? '#ffffff' : '#333333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: isDarkMode ? '#3d3d3d' : '#f3f4f6'
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.8rem', flex: 1, color: 'inherit' }}>
                      {libTopic.topicName || libTopic.title || libTopic.name}
                    </Typography>
                    {progress?.completedLibraryTopics?.includes(libTopic._id) && (
                      <CheckCircleIcon sx={{ fontSize: 14, color: 'green', ml: 0.5 }} />
                    )}
                  </Box>
                ))}

                {/* Questions/Quiz */}
                {section.questions && section.questions.map((question: any) => (
                  <Box
                    key={question._id}
                    onClick={() => {
                      setActiveSectionId(section._id)
                      setSelectedContentId(`mcq-${question._id}`)
                    }}
                    sx={{
                      p: 0.75,
                      pl: 2,
                      borderLeftWidth: 2,
                      borderLeftStyle: 'solid',
                      borderLeftColor: 'amber',
                      borderRadius: 0.25,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      backgroundColor: selectedContentId === `mcq-${question._id}` ? (isDarkMode ? '#3d3d3d' : '#f3f4f6') : 'transparent',
                      transition: 'all 0.2s',
                      color: isDarkMode ? '#ffffff' : '#333333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: isDarkMode ? '#3d3d3d' : '#f3f4f6'
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.8rem', flex: 1, color: 'inherit' }}>
                      {question.title || (question.question ? `${question.question.substring(0, 30)}...` : 'MCQ')}
                    </Typography>
                    <Chip label="MCQ" size="small" sx={{ ml: 1, bgcolor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: isDarkMode ? '#fff' : '#000' }} />
                    {progress?.completedQuestions?.includes(question._id) && (
                      <CheckCircleIcon sx={{ fontSize: 14, color: 'green', ml: 0.5 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </Collapse>
          </Box>
        ))}
      </Box>
      
      {/* Right Content Area */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        p: { xs: 2, md: 3 },
        maxHeight: 'calc(100vh - 120px)',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        fontSize: fontSize + 'px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        '& *': {
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }
      }} ref={contentPanelRef}>
        {selectedContentId && activeSection ? (
          (() => {
            const [contentType, contentId] = selectedContentId.split('-').slice(0, 2)
            const fullContentId = selectedContentId.substring(contentType.length + 1)

            // Render inline topics
            if (contentType === 'inline') {
                        const content = (activeSection.topics ?? [])
                          .find((t: any) => t._id === fullContentId)
                        const completed = isCompleted('topic', fullContentId)
                        const nextTopicKey = getNextTopicKey(`inline-${fullContentId}`)
                        return content ? (
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#ffffff' : '#000000' }}>{content.title}</Typography>
                            {content.content ? (
                              <ContentRenderer content={content.content} />
                            ) : (
                              <Typography variant="body2" sx={{ color: isDarkMode ? '#999999' : '#6b7280' }}>No content available.</Typography>
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
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                                <Button 
                                  variant="outlined" 
                                  onClick={() => goToTopic(nextTopicKey)}
                                  sx={{ fontSize: '0.875rem' }}
                                >
                                  {getTopicNameFromKey(nextTopicKey)} &gt;&gt;
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
                            {(nextTopicKey || getPrevTopicKey(`library-${fullContentId}`)) && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                                {getPrevTopicKey(`library-${fullContentId}`) && (
                                  <Button 
                                    variant="outlined" 
                                    onClick={() => goToTopic(getPrevTopicKey(`library-${fullContentId}`)!)}
                                    sx={{ fontSize: '0.875rem' }}
                                  >
                                    &lt;&lt; {getTopicNameFromKey(getPrevTopicKey(`library-${fullContentId}`) || '')}
                                  </Button>
                                )}
                                {nextTopicKey && (
                                  <Button 
                                    variant="outlined" 
                                    onClick={() => goToTopic(nextTopicKey)}
                                    sx={{ fontSize: '0.875rem' }}
                                  >
                                    {getTopicNameFromKey(nextTopicKey)} &gt;&gt;
                                  </Button>
                                )}
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
                            {(nextTopicKey) && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                                {nextTopicKey && (
                                  <Button 
                                    variant="outlined" 
                                    onClick={() => goToTopic(nextTopicKey)}
                                    sx={{ fontSize: '0.875rem' }}
                                  >
                                    {getTopicNameFromKey(nextTopicKey)} &gt;&gt;
                                  </Button>
                                )}
                              </Box>
                            )}
                          </Stack>
                        ) : null
                      }

                      if (contentType === 'mcq') {
                        const question = (activeSection.questions ?? [])
                          .find((q: any) => q._id === fullContentId)
                        const completed = isCompleted('question', fullContentId)
                        const nextTopicKey = getNextTopicKey(`mcq-${fullContentId}`)
                        return question ? (
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#ffffff' : '#000000' }}>{question.title}</Typography>
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
                                  Reset Answer
                                </Button>
                              </Stack>
                            )}
                            {nextTopicKey && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                                <Button 
                                  variant="outlined" 
                                  onClick={() => goToTopic(nextTopicKey)}
                                  sx={{ fontSize: '0.875rem' }}
                                >
                                  {getTopicNameFromKey(nextTopicKey)} &gt;&gt;
                                </Button>
                              </Box>
                            )}
                          </Stack>
                        ) : null
                      }

                      return null
                    })()
                ) : (
                  <Stack spacing={3}>
                    {course.coverImage && (
                      <Box sx={{
                        width: '100%',
                        height: '300px',
                        borderRadius: 2,
                        overflow: 'hidden',
                        backgroundColor: isDarkMode ? '#2d2d2d' : '#f0f0f0'
                      }}>
                        <img
                          src={`${apiBase}${course.coverImage}`}
                          alt={course.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    )}
                    
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: isDarkMode ? '#ffffff' : '#000000' }}>
                        {course.title}
                      </Typography>
                      {course.description && (
                        <Typography variant="body1" sx={{ mb: 2, color: isDarkMode ? '#cccccc' : '#4b5563', lineHeight: 1.6 }}>
                          {course.description}
                        </Typography>
                      )}
                    </Box>
                    
                    {course.prerequisites && (
                      <Box sx={{
                        p: 2,
                        backgroundColor: isDarkMode ? '#2d2d2d' : '#f9fafb',
                        borderRadius: 1,
                        border: `1px solid ${isDarkMode ? '#444444' : '#e5e7eb'}`
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: isDarkMode ? '#ffffff' : '#000000' }}>Prerequisites</Typography>
                        {Array.isArray(course.prerequisites) ? (
                          <Box component="ul" sx={{ m: 0, pl: 2.5, listStyleType: 'disc' }}>
                            {course.prerequisites.map((prereq: string, idx: number) => (
                              <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5, color: isDarkMode ? '#cccccc' : '#6b7280' }}>
                                {prereq}
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          <ContentRenderer content={course.prerequisites || ''} />
                        )}
                      </Box>
                    )}
                    
                    {course.outcomes && (
                      <Box sx={{
                        p: 2,
                        backgroundColor: isDarkMode ? '#2d2d2d' : '#f9fafb',
                        borderRadius: 1,
                        border: `1px solid ${isDarkMode ? '#444444' : '#e5e7eb'}`
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: isDarkMode ? '#ffffff' : '#000000' }}>Learning Outcomes</Typography>
                        {Array.isArray(course.outcomes) ? (
                          <Box component="ul" sx={{ m: 0, pl: 2.5, listStyleType: 'disc' }}>
                            {course.outcomes.map((outcome: string, idx: number) => (
                              <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5, color: isDarkMode ? '#cccccc' : '#6b7280' }}>
                                {outcome}
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          <ContentRenderer content={course.outcomes || ''} />
                        )}
                      </Box>
                    )}
                    
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                      <Box sx={{
                        flex: '1 1 calc(25% - 6px)',
                        minWidth: '200px',
                        p: 2,
                        backgroundColor: isDarkMode ? '#2d2d2d' : '#f9fafb',
                        borderRadius: 1,
                        border: `1px solid ${isDarkMode ? '#444444' : '#e5e7eb'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#cccccc' : '#6b7280', mb: 1 }}>Total Sections</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#ffffff' : '#000000' }}>{sections.length}</Typography>
                      </Box>
                      
                      <Box sx={{
                        flex: '1 1 calc(33% - 8px)',
                        minWidth: '220px',
                        p: 2,
                        backgroundColor: isDarkMode ? '#2d2d2d' : '#f9fafb',
                        borderRadius: 1,
                        border: `1px solid ${isDarkMode ? '#444444' : '#e5e7eb'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#cccccc' : '#6b7280', mb: 1 }}>Total Library Topics</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#ffffff' : '#000000' }}>{sections.reduce((sum: number, sec: any) => sum + (sec.libraryTopics?.length || 0), 0)}</Typography>
                      </Box>
                      
                      <Box sx={{
                        flex: '1 1 calc(33% - 8px)',
                        minWidth: '220px',
                        p: 2,
                        backgroundColor: isDarkMode ? '#2d2d2d' : '#f9fafb',
                        borderRadius: 1,
                        border: `1px solid ${isDarkMode ? '#444444' : '#e5e7eb'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}>
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#cccccc' : '#6b7280', mb: 1 }}>Total MCQs</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#ffffff' : '#000000' }}>{sections.reduce((sum: number, sec: any) => sum + (sec.questions?.length || 0), 0)}</Typography>
                      </Box>
                    </Stack>
                    
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '200px',
                      color: isDarkMode ? '#666666' : '#9ca3af'
                    }}>
                      <Typography>Select a topic from the left menu to get started</Typography>
                    </Box>
                  </Stack>
                )}
      </Box>
      
      {/* Table of Contents Right Sidebar */}
      <Box sx={{
        width: showTOC ? { xs: '100%', sm: '260px', md: '280px' } : 0,
        transition: 'width 0.3s ease',
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        borderLeft: showTOC ? `1px solid ${isDarkMode ? '#444444' : '#e5e7eb'}` : 'none',
        overflowY: showTOC ? 'auto' : 'hidden',
        overflowX: 'hidden',
        maxHeight: 'calc(100vh - 120px)',
        position: { xs: 'relative', sm: 'sticky' },
        top: 0,
        p: showTOC ? { xs: 1.5, sm: 1.5 } : 0,
        flexShrink: 0
      }}>
        {showTOC && (
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem', color: isDarkMode ? '#ffffff' : '#333333' }}>
              Contents
            </Typography>
            {tableOfContents.length > 0 ? (
              tableOfContents.map((heading, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  onClick={() => {
                    scrollToHeading(idx)
                  }}
                  sx={{
                    cursor: 'pointer',
                    p: 0.75,
                    borderRadius: 0.5,
                    fontSize: '0.8rem',
                    color: isDarkMode ? '#ffffff' : '#333333',
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#3d3d3d' : '#f3f4f6'
                    }
                  }}
                >
                  {heading.title}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: isDarkMode ? '#999999' : '#9ca3af' }}>
                No headings found
              </Typography>
            )}
          </Stack>
        )}
      </Box>
    </Box>
    </Box>
  )
}
