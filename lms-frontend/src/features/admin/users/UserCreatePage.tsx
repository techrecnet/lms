import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserForm, { UserFormValues } from './UserForm'
import { api } from '../../../core/api'

const emptyValues: UserFormValues = {
  name: '',
  email: '',
  rollNo: '',
  batchSession: '',
  instituteId: '',
  role: 'user',
  isActive: true
}

export default function UserCreatePage() {
  const navigate = useNavigate()
  const [institutes, setInstitutes] = useState<any[]>([])

  useEffect(() => {
    api.get('/institutes').then((res) => setInstitutes(res.data)).catch(() => setInstitutes([]))
  }, [])

  const create = async (values: UserFormValues) => {
    await api.post('/users', {
      name: values.name,
      email: values.email,
      rollNo: values.rollNo,
      batchSession: values.batchSession,
      instituteId: values.instituteId || undefined,
      role: values.role,
      isActive: values.isActive
    })
    navigate('/admin/users')
  }

  return (
    <UserForm
      title="Add User"
      institutes={institutes}
      initialValues={emptyValues}
      submitLabel="Create"
      onSubmit={create}
      onCancel={() => navigate('/admin/users')}
    />
  )
}
