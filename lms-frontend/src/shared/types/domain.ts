export type Id = string

export type Course = {
  _id: Id
  title: string
  description?: string
  imageUrl?: string
  duration?: string
  prerequisites?: string
  sectionCount?: number
  sections?: any[]
}

export type Institute = {
  _id: Id
  name: string
  logoUrl?: string
  address?: string
  state?: string
  city?: string
  type?: string
  typeOther?: string
  phone?: string
  email?: string
  website?: string
  courses?: Id[]
}

export type Batch = {
  _id: Id
  name: string
  instituteId?: Id
  courses?: Id[]
  students?: Id[]
}

export type User = {
  _id: Id
  name?: string
  email: string
  rollNo?: string
  batchSession?: string
  instituteId?: Id
  role?: 'admin' | 'user' | 'mentor'
  isActive?: boolean
}

export type AuthUser = {
  id: Id
  role: 'admin' | 'user' | 'mentor'
  name?: string
  email?: string
  studentImage?: string
}
