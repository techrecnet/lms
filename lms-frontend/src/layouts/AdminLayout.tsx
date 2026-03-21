import { PropsWithChildren } from 'react'
import { Box } from '@mui/material'
import Shell from './Shell'

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <Shell title="" isAdmin={true}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {children}
      </Box>
    </Shell>
  )
}
