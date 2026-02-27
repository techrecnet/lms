import { useNavigate } from 'react-router-dom'
import InstituteForm, { InstituteFormValues } from './InstituteForm'
import { api } from '../../../core/api'

const emptyValues: InstituteFormValues = {
  name: '',
  logoUrl: '',
  logoFile: null,
  address: '',
  state: '',
  city: '',
  type: 'School',
  typeOther: '',
  phone: '',
  email: '',
  website: ''
}

export default function InstituteCreatePage() {
  const navigate = useNavigate()

  const create = async (values: InstituteFormValues) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('address', values.address)
    formData.append('state', values.state)
    formData.append('city', values.city)
    formData.append('type', values.type)
    formData.append('typeOther', values.typeOther)
    formData.append('phone', values.phone)
    formData.append('email', values.email)
    formData.append('website', values.website)
    if (values.logoFile) formData.append('logo', values.logoFile)
    await api.post('/institutes', formData)
    navigate('/admin/institutes')
  }

  return (
    <InstituteForm
      title="Add Institute"
      initialValues={emptyValues}
      submitLabel="Create"
      onSubmit={create}
      onCancel={() => navigate('/admin/institutes')}
    />
  )
}
