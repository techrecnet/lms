import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import QuestionForm, { QuestionFormValues } from './QuestionForm'
import { api } from '../../../core/api'
import { Typography } from '@mui/material'

export default function QuestionEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<any[]>([])
  const [values, setValues] = useState<QuestionFormValues | null>(null)

  useEffect(() => {
    const load = async () => {
      const [qRes, cRes] = await Promise.all([
        api.get(`/questions/${id}`),
        api.get('/courses')
      ])
      setCourses(cRes.data)
      const q = qRes.data
      setValues({
        courseId: q?.courseId?._id ?? q?.courseId ?? '',
        title: q?.title ?? '',
        description: q?.description ?? '',
        type: q?.type ?? 'MCQ',
        level: q?.level ?? 'easy',
        keywords: q?.keywords ?? [],
        explanation: q?.explanation ?? '',
        options: q?.options ?? [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
        sampleAnswer: q?.sampleAnswer ?? ''
      })
    }
    load().catch(() => setValues(null))
  }, [id])

  const update = async (next: QuestionFormValues) => {
    if (!id) return
    await api.put(`/questions/${id}`, {
      courseId: next.courseId,
      title: next.title,
      description: next.description,
      type: next.type,
      level: next.level,
      keywords: next.keywords,
      explanation: next.explanation,
      ...(next.type === 'MCQ' ? { options: next.options } : { sampleAnswer: next.sampleAnswer })
    })
    navigate('/admin/questions')
  }

  if (!values) return <Typography>Loading...</Typography>

  return (
    <QuestionForm
      title="Edit Question"
      courses={courses}
      initialValues={values}
      submitLabel="Save"
      onSubmit={update}
      onCancel={() => navigate('/admin/questions')}
    />
  )
}
