import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../core/api'
import { Box, Button, Paper, Stack, Typography, Radio, RadioGroup, FormControlLabel, Alert, Chip, IconButton, Slider, Tooltip } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ContentRenderer from '../../../shared/components/ContentRenderer'

export default function MentorCourseViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<any>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null)
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(40)
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(true)
  const sectionRowRef = useRef<HTMLDivElement | null>(null)

  const load = async () => {
    const res = await api.get(`/courses/${id}`)
    setCourse(res.data)
  }

  useEffect(() => { 
    load().catch(() => setCourse(null))
  }, [id])

  useEffect(() => {
    if (!course?.sections || course.sections.length === 0) return
    setActiveSectionId((prev) => prev ?? course.sections[0]._id)
    setSelectedContentId(null)
  }, [course])

  const sections = course?.sections ?? []
  const activeSection = useMemo(() => sections.find((s: any) => s._id === activeSectionId) ?? sections[0], [sections, activeSectionId])

  const scrollSections = (dir: 'left' | 'right') => {
    const el = sectionRowRef.current
    if (!el) return
    const amount = dir === 'left' ? -320 : 320
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return
    const startX = e.clientX
    const startWidth = leftPanelWidth
    const container = (e.currentTarget as HTMLElement).parentElement
    if (!container) return

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = (startWidth + ((moveEvent.clientX - startX) / container.offsetWidth) * 100)
      setLeftPanelWidth(Math.max(20, Math.min(80, newWidth)))
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  if (!course) return <Typography>Course not found.</Typography>

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Button 
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 1, width: 'fit-content' }}
          >
            Back
          </Button>
          <Typography variant="h5">{course.title}</Typography>
          {course.description && <Typography variant="body2">{course.description}</Typography>}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Mentor View - Course Content Preview
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ display: 'flex', height: '70vh', borderRadius: 2, overflow: 'hidden', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left Panel - Sections Navigation */}
        {showLeftPanel && (
          <Box
            sx={{
              width: { xs: '100%', md: `${leftPanelWidth}%` },
              borderRight: { xs: 'none', md: '1px solid #e0e0e0' },
              borderBottom: { xs: '1px solid #e0e0e0', md: 'none' },
              p: 2,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Sections
              </Typography>
              {sections.length > 0 ? (
                <Stack spacing={0.5}>
                  {sections.map((section: any) => (
                    <Button
                      key={section._id}
                      onClick={() => {
                        setActiveSectionId(section._id)
                        setSelectedContentId(null)
                      }}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        bgcolor: activeSectionId === section._id ? '#f5f5f5' : 'transparent',
                        borderLeft: activeSectionId === section._id ? '3px solid #1976d2' : '3px solid transparent',
                        pl: activeSectionId === section._id ? 1.5 : 2,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: activeSectionId === section._id ? 600 : 400,
                          textTransform: 'none',
                        }}
                      >
                        {section.title}
                      </Typography>
                    </Button>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No sections available
                </Typography>
              )}
            </Box>

            {activeSection && (
              <Box sx={{ mt: 'auto' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                  {activeSection.topics?.length || 0} Topics
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  {activeSection.libraryTopics?.length || 0} Library Topics
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {activeSection.questions?.length || 0} Questions
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Resize Handle */}
        {showLeftPanel && (
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              width: { xs: 0, md: '4px' },
              bgcolor: '#e0e0e0',
              cursor: { xs: 'auto', md: 'col-resize' },
              '&:hover': { bgcolor: { xs: '#e0e0e0', md: '#1976d2' } },
              display: { xs: 'none', md: 'block' },
            }}
          />
        )}

        {/* Right Panel - Content Display */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Toggle Button */}
          <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
            <IconButton
              size="small"
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              sx={{ bgcolor: '#f5f5f5' }}
            >
              {showLeftPanel ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>

          {activeSection ? (
            <Stack spacing={3} sx={{ pt: 4 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {activeSection.title}
                </Typography>
                {activeSection.description && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {activeSection.description}
                  </Typography>
                )}
              </Box>

              {/* Topics Section */}
              {activeSection.topics && activeSection.topics.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Topics
                  </Typography>
                  <Stack spacing={1}>
                    {activeSection.topics.map((topic: any) => (
                      <Box
                        key={topic._id}
                        onClick={() => setSelectedContentId(topic._id)}
                        sx={{
                          p: 1.5,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          cursor: 'pointer',
                          bgcolor: selectedContentId === topic._id ? '#f5f5f5' : 'transparent',
                          borderLeft: selectedContentId === topic._id ? '3px solid #1976d2' : '3px solid transparent',
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {topic.title}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Library Topics Section */}
              {activeSection.libraryTopics && activeSection.libraryTopics.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Library Topics
                  </Typography>
                  <Stack spacing={1}>
                    {activeSection.libraryTopics.map((libTopic: any) => (
                      <Box
                        key={libTopic._id}
                        onClick={() => setSelectedContentId(libTopic._id)}
                        sx={{
                          p: 1.5,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          cursor: 'pointer',
                          bgcolor: selectedContentId === libTopic._id ? '#f5f5f5' : 'transparent',
                          borderLeft: selectedContentId === libTopic._id ? '3px solid #1976d2' : '3px solid transparent',
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {libTopic.title}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Questions Section */}
              {activeSection.questions && activeSection.questions.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Questions
                  </Typography>
                  <Stack spacing={1}>
                    {activeSection.questions.map((question: any, idx: number) => (
                      <Box
                        key={question._id}
                        onClick={() => setSelectedContentId(question._id)}
                        sx={{
                          p: 1.5,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          cursor: 'pointer',
                          bgcolor: selectedContentId === question._id ? '#f5f5f5' : 'transparent',
                          borderLeft: selectedContentId === question._id ? '3px solid #1976d2' : '3px solid transparent',
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Question {idx + 1}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {(!activeSection.topics || activeSection.topics.length === 0) &&
               (!activeSection.libraryTopics || activeSection.libraryTopics.length === 0) &&
               (!activeSection.questions || activeSection.questions.length === 0) && (
                <Alert severity="info">No content in this section</Alert>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Select a section to view content
            </Typography>
          )}
        </Box>
      </Paper>

      <Alert severity="info">
        This is a mentor preview of the course content. Students will see the full interactive content, including ability to mark topics as complete and answer quiz questions.
      </Alert>
    </Stack>
  )
}
