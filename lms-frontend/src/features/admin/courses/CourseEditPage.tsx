import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CourseForm, { CourseFormValues } from './CourseForm'
import { api } from '../../../core/api'
import { Typography } from '@mui/material'

export default function CourseEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState<CourseFormValues | null>(null)

  const load = async () => {
    const res = await api.get(`/courses/${id}`)
    setValues({
      title: res.data?.title ?? '',
      description: res.data?.description ?? '',
      imageUrl: res.data?.imageUrl ?? '',
      imageFile: null,
      duration: res.data?.duration ?? '',
      prerequisites: res.data?.prerequisites ?? '',
      outcomes: res.data?.outcomes ?? ''
    })
  }

  useEffect(() => { load().catch(() => setValues(null)) }, [id])

  const update = async (next: CourseFormValues) => {
    const formData = new FormData()
    formData.append('title', next.title)
    formData.append('description', next.description)
    formData.append('duration', next.duration)
    formData.append('prerequisites', next.prerequisites)
    formData.append('outcomes', next.outcomes)
    if (next.imageFile) formData.append('image', next.imageFile)
    if (!next.imageFile && next.imageUrl) formData.append('imageUrl', next.imageUrl)
    await api.put(`/courses/${id}`, formData)
    navigate('/admin/courses')
  }

  if (!values) return <Typography>Loading...</Typography>

  return (
    <CourseForm
      title="Edit Course"
      initialValues={values}
      submitLabel="Update"
      onSubmit={update}
      onCancel={() => navigate('/admin/courses')}
    />
  )
}
