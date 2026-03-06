import { useNavigate } from 'react-router-dom'
import CourseForm, { CourseFormValues } from './CourseForm'
import { api } from '../../../core/api'

const emptyValues: CourseFormValues = {
  title: '',
  description: '',
  imageUrl: '',
  imageFile: null,
  duration: '',
  prerequisites: '',
  outcomes: ''
}

export default function CourseCreatePage() {
  const navigate = useNavigate()

  const create = async (values: CourseFormValues) => {
    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('description', values.description)
    formData.append('duration', values.duration)
    formData.append('prerequisites', values.prerequisites)
    formData.append('outcomes', values.outcomes)
    if (values.imageFile) formData.append('image', values.imageFile)
    if (!values.imageFile && values.imageUrl) formData.append('imageUrl', values.imageUrl)
    await api.post('/courses', formData)
    navigate('/admin/courses')
  }

  return (
    <CourseForm
      title="Create Course"
      initialValues={emptyValues}
      submitLabel="Create"
      onSubmit={create}
      onCancel={() => navigate('/admin/courses')}
    />
  )
}
