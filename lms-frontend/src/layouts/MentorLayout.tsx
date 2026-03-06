import { PropsWithChildren } from 'react'
import Shell from './Shell'

export default function MentorLayout({ children }: PropsWithChildren) {
  return (
    <Shell title="Mentor • Enterprise LMS">
      {children}
    </Shell>
  )
}
