import { PropsWithChildren } from 'react'
import Shell from './Shell'

export default function MentorLayout({ children }: PropsWithChildren) {
  return (
    <Shell title="">
      {children}
    </Shell>
  )
}
