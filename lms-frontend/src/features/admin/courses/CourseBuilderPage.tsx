import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../core/api'
import ContentSelector from './ContentSelector'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Box,
  Stack,
  TextField,
  Typography,
  Chip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

type Section = { _id: string; title: string; libraryTopics?: any[]; questions?: any[] }

export default function CourseBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<any>(null)

  // Minimal builder fields
  const [sectionTitle, setSectionTitle] = useState('')
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null)
  const [contentSelectorOpen, setContentSelectorOpen] = useState(false)
  const [selectedSectionForContent, setSelectedSectionForContent] = useState<Section | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)

  const load = async () => {
    if (!id) return
    const res = await api.get(`/courses/${id}`)
    setCourse(res.data)
  }

  useEffect(() => { load().catch(()=>setCourse(null)) }, [id])

  const sections: Section[] = useMemo(() => (course?.sections ?? []), [course])

  // Expand all sections on mount
  useEffect(() => {
    if (sections.length > 0) {
      setExpandedSections(new Set(sections.map(s => s._id)))
    }
  }, [sections.length])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const updateSections = (next: Section[]) => {
    setCourse((prev: any) => (prev ? { ...prev, sections: next } : prev))
  }

  const createSection = async () => {
    // expected backend route: POST /courses/:id/sections
    await api.post(`/courses/${id}/sections`, { title: sectionTitle })
    setSectionTitle('')
    load()
  }

  const addLibraryTopic = async (sectionId: string, topicLibId: string) => {
    await api.post(`/sections/${sectionId}/library-topics`, { topicLibraryId: topicLibId })
    load()
  }

  const addQuestion = async (sectionId: string, questionId: string) => {
    await api.post(`/sections/${sectionId}/questions`, { questionId })
    load()
  }

  const removeLibraryTopic = async (sectionId: string, topicLibId: string) => {
    await api.delete(`/sections/${sectionId}/library-topics/${topicLibId}`)
    load()
  }

  const removeQuestion = async (sectionId: string, questionId: string) => {
    await api.delete(`/sections/${sectionId}/questions/${questionId}`)
    load()
  }

  const confirmDeleteSection = async () => {
    if (!deleteSectionId) return
    await api.delete(`/sections/${deleteSectionId}`)
    setDeleteSectionId(null)
    load()
  }

  const reorderList = <T,>(list: T[], startIndex: number, endIndex: number) => {
    const result = [...list]
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  const onDragStart = () => {
    setIsDragging(true)
    // Expand all sections when starting to drag topics
    setExpandedSections(new Set(sections.map(s => s._id)))
  }

  const onDragEnd = async (result: DropResult) => {
    setIsDragging(false)
    const { destination, source, type } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    if (!id) return

    if (type === 'section') {
      const next = reorderList(sections, source.index, destination.index)
      updateSections(next)
      await api.put(`/courses/${id}/sections/reorder`, { sectionIds: next.map(s => s._id) })
      return
    }

    if (type === 'topic') {
      const sourceSectionId = source.droppableId.replace('section-', '')
      const destSectionId = destination.droppableId.replace('section-', '')
      
      // Moving within the same section
      if (sourceSectionId === destSectionId) {
        const section = sections.find(s => s._id === sourceSectionId)
        if (!section) return
        const libraryTopics = section.libraryTopics ?? []
        const nextLibraryTopics = reorderList(libraryTopics, source.index, destination.index)
        const nextSections = sections.map(s => s._id === sourceSectionId ? { ...s, libraryTopics: nextLibraryTopics } : s)
        updateSections(nextSections)
        await api.put(`/sections/${sourceSectionId}/library-topics/reorder`, { topicIds: nextLibraryTopics.map(t => t._id) })
      } else {
        // Moving to a different section
        const sourceSection = sections.find(s => s._id === sourceSectionId)
        const destSection = sections.find(s => s._id === destSectionId)
        if (!sourceSection || !destSection) return

        const sourceLibraryTopics = [...(sourceSection.libraryTopics ?? [])]
        const destLibraryTopics = [...(destSection.libraryTopics ?? [])]
        
        // Remove from source
        const [movedTopic] = sourceLibraryTopics.splice(source.index, 1)
        
        // Add to destination
        destLibraryTopics.splice(destination.index, 0, movedTopic)

        // Update state optimistically
        const nextSections = sections.map(s => {
          if (s._id === sourceSectionId) return { ...s, libraryTopics: sourceLibraryTopics }
          if (s._id === destSectionId) return { ...s, libraryTopics: destLibraryTopics }
          return s
        })
        updateSections(nextSections)

        // Update backend: move topic to new section and reorder both sections
        try {
          await api.put(`/sections/${sourceSectionId}/library-topics/${movedTopic._id}/move`, { 
            targetSectionId: destSectionId,
            targetIndex: destination.index
          })
          // Refresh to ensure consistency
          load()
        } catch (error) {
          console.error('Failed to move library topic:', error)
          // Revert on error
          load()
        }
      }
    }
  }

  const handleAddContent = (type: 'topic' | 'mcq', contentId: string, contentTitle: string) => {
    if (!selectedSectionForContent) return

    if (type === 'topic') {
      addLibraryTopic(selectedSectionForContent._id, contentId)
    } else if (type === 'mcq') {
      addQuestion(selectedSectionForContent._id, contentId)
    }

    setContentSelectorOpen(false)
    setSelectedSectionForContent(null)
  }

  if (!course) return <Typography>Course not found or backend doesn't return nested data yet.</Typography>

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Course Builder • {course.title}</Typography>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="New Section title" value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} fullWidth />
          <Button variant="contained" onClick={createSection} disabled={!sectionTitle.trim()}>Add Section</Button>
        </Stack>
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          Drag and drop sections to reorder them. Drag topics to reorder within a section or move to another section.
        </Typography>
      </Paper>

      <Divider />

      {sections.length === 0 && <Typography>No sections yet (or backend does not populate sections).</Typography>}

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable droppableId="section-list" type="section">
          {(provided) => (
            <Stack spacing={2} ref={provided.innerRef} {...provided.droppableProps}>
              {sections.map((s, sectionIndex) => (
                <Draggable key={s._id} draggableId={s._id} index={sectionIndex}>
                  {(sectionProvided) => (
                    <div ref={sectionProvided.innerRef} {...sectionProvided.draggableProps}>
                      <Accordion 
                        expanded={expandedSections.has(s._id)}
                        onChange={() => toggleSection(s._id)}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                            <IconButton size="small" {...sectionProvided.dragHandleProps}>
                              <DragIndicatorIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ flexGrow: 1 }}>Section: {s.title}</Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteSectionId(s._id)
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={2}>
                            <Paper sx={{ p: 2 }}>
                              <Stack spacing={2}>
                                <Typography variant="subtitle2">Add Content to Section</Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                  <Button 
                                    variant="contained" 
                                    size="small"
                                    onClick={() => {
                                      setSelectedSectionForContent(s)
                                      setContentSelectorOpen(true)
                                    }}
                                  >
                                    Add from Library/Bank
                                  </Button>
                                </Stack>
                              </Stack>
                            </Paper>

                            {/* Library Topics */}
                            {(s.libraryTopics?.length ?? 0) > 0 && (
                              <Paper sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                  <Typography variant="subtitle2">Library Topics</Typography>
                                  <Droppable droppableId={`section-${s._id}`} type="topic">
                                    {(topicsProvided) => (
                                      <Stack spacing={1} ref={topicsProvided.innerRef} {...topicsProvided.droppableProps}>
                                        {s.libraryTopics?.map((t: any, topicIndex: number) => (
                                          <Draggable key={t._id} draggableId={t._id} index={topicIndex}>
                                            {(topicProvided) => (
                                              <div ref={topicProvided.innerRef} {...topicProvided.draggableProps}>
                                                <Paper sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                                                    <IconButton size="small" {...topicProvided.dragHandleProps}>
                                                      <DragIndicatorIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                                      {t.title}
                                                    </Typography>
                                                    <Chip 
                                                      label="Library" 
                                                      size="small" 
                                                      variant="outlined"
                                                      color="info"
                                                    />
                                                    <IconButton 
                                                      size="small" 
                                                      onClick={() => removeLibraryTopic(s._id, t._id)}
                                                    >
                                                      <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                  </Stack>
                                                </Paper>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {topicsProvided.placeholder}
                                      </Stack>
                                    )}
                                  </Droppable>
                                </Stack>
                              </Paper>
                            )}

                            {/* Questions */}
                            {(s.questions?.length ?? 0) > 0 && (
                              <Paper sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                  <Typography variant="subtitle2">MCQ Questions</Typography>
                                  <Stack spacing={1}>
                                    {s.questions?.map((q: any) => (
                                      <Paper key={q._id} sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                            {q.title}
                                          </Typography>
                                          <Chip 
                                            label={`Level: ${q.level}`}
                                            size="small" 
                                            variant="outlined"
                                            color="success"
                                          />
                                          <IconButton 
                                            size="small" 
                                            onClick={() => removeQuestion(s._id, q._id)}
                                          >
                                            <DeleteOutlineIcon fontSize="small" />
                                          </IconButton>
                                        </Stack>
                                      </Paper>
                                    ))}
                                  </Stack>
                                </Stack>
                              </Paper>
                            )}


                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={Boolean(deleteSectionId)} onClose={() => setDeleteSectionId(null)}>
        <DialogTitle>Delete section?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will remove the section and all topics inside it.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSectionId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDeleteSection}>Delete</Button>
        </DialogActions>
      </Dialog>

      <ContentSelector
        open={contentSelectorOpen}
        courseId={course?._id}
        onSelect={handleAddContent}
        onCancel={() => {
          setContentSelectorOpen(false)
          setSelectedSectionForContent(null)
        }}
      />
    </Stack>
  )
}
