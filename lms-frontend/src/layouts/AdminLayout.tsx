import { PropsWithChildren } from 'react'
import { Box, Drawer, List, ListItemButton, ListItemText, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Shell from './Shell'

const drawerWidth = 270

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <Shell title="Admin • Enterprise LMS">
      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#fbf8f3',
              borderRight: '1px solid rgba(27,26,23,0.08)'
            }
          }}
        >
          <Toolbar sx={{ minHeight: 72 }} />
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 2 }}>Workspace</Typography>
            <Typography variant="h6">RECNET</Typography>
          </Box>
          <List sx={{ px: 1 }}>
            <ListItemButton
              component={RouterLink}
              to="/admin"
              sx={{ borderRadius: 3, mx: 1, mb: 1, border: '1px solid transparent' }}
            >
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/admin/institutes"
              sx={{ borderRadius: 3, mx: 1, mb: 1, border: '1px solid transparent' }}
            >
              <ListItemText primary="Institutes" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/admin/batches"
              sx={{ borderRadius: 3, mx: 1, mb: 1, border: '1px solid transparent' }}
            >
              <ListItemText primary="Batches" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/admin/courses"
              sx={{ borderRadius: 3, mx: 1, mb: 1, border: '1px solid transparent' }}
            >
              <ListItemText primary="Courses" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/admin/topics-lib"
              sx={{ borderRadius: 3, mx: 1, mb: 1, border: '1px solid transparent' }}
            >
              <ListItemText primary="Topic Library" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/admin/questions"
              sx={{ borderRadius: 3, mx: 1, mb: 1, border: '1px solid transparent' }}
            >
              <ListItemText primary="Questions" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/admin/users"
              sx={{ borderRadius: 3, mx: 1, mb: 1, border: '1px solid transparent' }}
            >
              <ListItemText primary="Users" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/admin/mentors"
              sx={{ borderRadius: 3, mx: 1, mb: 1, border: '1px solid transparent' }}
            >
              <ListItemText primary="Mentors" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/admin/quizzes"
              sx={{ borderRadius: 3, mx: 1, mb: 1, border: '1px solid transparent' }}
            >
              <ListItemText primary="Quizzes" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/admin/htmlplay"
              sx={{ borderRadius: 3, mx: 1, mb: 1, border: '1px solid transparent' }}
            >
              <ListItemText primary="HTML Play" />
            </ListItemButton>
          </List>
          <Box sx={{ mt: 'auto', px: 3, pb: 3 }}>
            <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'rgba(213,121,75,0.12)' }}>
              <Typography variant="subtitle2">Workspace status</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>All systems normal.</Typography>
            </Box>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Toolbar sx={{ minHeight: 72 }} />
          {children}
        </Box>
      </Box>
    </Shell>
  )
}
