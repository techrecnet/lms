import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import InstituteForm, { InstituteFormValues } from './InstituteForm'
import { api } from '../../../core/api'
import { Typography } from '@mui/material'

export default function InstituteEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [values, setValues] = useState<InstituteFormValues | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/institutes/${id}`)
      const inst = res.data
      setValues({
        name: inst?.name ?? '',
        logoUrl: inst?.logoUrl ?? '',
        logoFile: null,
        address: inst?.address ?? '',
        state: inst?.state ?? '',
        city: inst?.city ?? '',
        type: inst?.type ?? 'School',
        typeOther: inst?.typeOther ?? '',
        phone: inst?.phone ?? '',
        email: inst?.email ?? '',
        website: inst?.website ?? ''
      })
    }
    load().catch(() => setValues(null))
  }, [id])

  const update = async (next: InstituteFormValues) => {
    if (!id) return
    const formData = new FormData()
    formData.append('name', next.name)
    formData.append('address', next.address)
    formData.append('state', next.state)
    formData.append('city', next.city)
    formData.append('type', next.type)
    formData.append('typeOther', next.typeOther)
    formData.append('phone', next.phone)
    formData.append('email', next.email)
    formData.append('website', next.website)
    if (next.logoFile) formData.append('logo', next.logoFile)
    await api.put(`/institutes/${id}`, formData)
    navigate('/admin/institutes')
  }

  if (!values) return <Typography>Loading...</Typography>

  return (
    <InstituteForm
      title="Edit Institute"
      initialValues={values}
      submitLabel="Save"
      onSubmit={update}
      onCancel={() => navigate('/admin/institutes')}
    />
  )
}
