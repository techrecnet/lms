import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestionForm, { QuestionFormValues } from './QuestionForm'
import { api } from '../../../core/api'

const emptyValues: QuestionFormValues = {
  courseId: '',
  title: '',
  description: '',
  type: 'MCQ',
  level: 'easy',
  keywords: [],
  explanation: '',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ],
  sampleAnswer: ''
}

export default function QuestionCreatePage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data)).catch(() => setCourses([]))
  }, [])

  const create = async (values: QuestionFormValues) => {
    await api.post('/questions', {
      courseId: values.courseId,
      title: values.title,
      description: values.description,
      type: values.type,
      level: values.level,
      keywords: values.keywords,
      explanation: values.explanation,
      ...(values.type === 'MCQ' ? { options: values.options } : { sampleAnswer: values.sampleAnswer })
    })
    navigate('/admin/questions')
  }

  return (
    <QuestionForm
      title="Create Question"
      courses={courses}
      initialValues={emptyValues}
      submitLabel="Create"
      onSubmit={create}
      onCancel={() => navigate('/admin/questions')}
    />
  )
}
