import { PropsWithChildren } from 'react'
import Shell from './Shell'

export default function UserLayout({ children }: PropsWithChildren) {
  return (
    <Shell title="">
      {children}
    </Shell>
  )
}
