import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UserForm, { UserFormValues } from './UserForm'
import { api } from '../../../core/api'
import { Typography } from '@mui/material'

export default function UserEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [institutes, setInstitutes] = useState<any[]>([])
  const [values, setValues] = useState<UserFormValues | null>(null)

  useEffect(() => {
    const load = async () => {
      const [userRes, instRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get('/institutes')
      ])
      setInstitutes(instRes.data)
      const user = userRes.data
      setValues({
        name: user?.name ?? '',
        email: user?.email ?? '',
        rollNo: user?.rollNo ?? '',
        batchSession: user?.batchSession ?? '',
        instituteId: user?.instituteId?._id ?? user?.instituteId ?? '',
        role: user?.role === 'mentor' ? 'mentor' : 'user',
        isActive: user?.isActive ?? true
      })
    }
    load().catch(() => setValues(null))
  }, [id])

  const update = async (next: UserFormValues) => {
    if (!id) return
    await api.put(`/users/${id}`, {
      name: next.name,
      email: next.email,
      rollNo: next.rollNo,
      batchSession: next.batchSession,
      instituteId: next.instituteId || undefined,
      role: next.role,
      isActive: next.isActive
    })
    navigate('/admin/users')
  }

  if (!values) return <Typography>Loading...</Typography>

  return (
    <UserForm
      title="Edit User"
      institutes={institutes}
      initialValues={values}
      submitLabel="Save"
      onSubmit={update}
      onCancel={() => navigate('/admin/users')}
    />
  )
}
