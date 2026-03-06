import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopicLibraryForm, { TopicFormValues } from './TopicLibraryForm'
import { api } from '../../../core/api'
import { Typography } from '@mui/material'

export default function TopicEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<any[]>([])
  const [values, setValues] = useState<TopicFormValues | null>(null)

  useEffect(() => {
    const load = async () => {
      const [tRes, cRes] = await Promise.all([
        api.get(`/topics-lib/${id}`),
        api.get('/courses')
      ])
      setCourses(cRes.data)
      const t = tRes.data
      const courseIds = t?.courseIds?.map((c: any) => (typeof c === 'string' ? c : c._id)) ?? []
      setValues({
        courseIds,
        title: t?.title ?? '',
        content: t?.content ?? '',
        aiSummary: t?.aiSummary,
        audioPath: t?.audio
      })
    }
    load().catch(() => setValues(null))
  }, [id])

  const update = async (next: TopicFormValues) => {
    if (!id) return
    const formData = new FormData()
    formData.append('courseIds', JSON.stringify(next.courseIds))
    formData.append('title', next.title)
    formData.append('content', next.content)
    if (next.aiSummary) {
      formData.append('aiSummary', next.aiSummary)
    }
    if (next.audio) {
      formData.append('audio', next.audio)
    }
    await api.put(`/topics-lib/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    navigate('/admin/topics-lib')
  }

  if (!values) return <Typography>Loading...</Typography>

  return (
    <TopicLibraryForm
      title="Edit Topic"
      courses={courses}
      initialValues={values}
      submitLabel="Save"
      onSubmit={update}
      onCancel={() => navigate('/admin/topics-lib')}
    />
  )
}
