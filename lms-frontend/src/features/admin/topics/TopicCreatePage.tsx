import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopicLibraryForm, { TopicFormValues } from './TopicLibraryForm'
import { api } from '../../../core/api'

const emptyValues: TopicFormValues = {
  courseIds: [],
  title: '',
  content: ''
}

export default function TopicCreatePage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data)).catch(() => setCourses([]))
  }, [])

  const create = async (values: TopicFormValues) => {
    const formData = new FormData()
    formData.append('courseIds', JSON.stringify(values.courseIds))
    formData.append('title', values.title)
    formData.append('content', values.content)
    if (values.aiSummary) {
      formData.append('aiSummary', values.aiSummary)
    }
    if (values.audio) {
      formData.append('audio', values.audio)
    }
    await api.post('/topics-lib', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    navigate('/admin/topics-lib')
  }

  return (
    <TopicLibraryForm
      title="Create Topic"
      courses={courses}
      initialValues={emptyValues}
      submitLabel="Create"
      onSubmit={create}
      onCancel={() => navigate('/admin/topics-lib')}
    />
  )
}
