import { PropsWithChildren, useState, useEffect } from 'react'
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Menu, MenuItem, Stack } from '@mui/material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../shared/hooks/redux'
import { logout, fetchUserProfile } from '../features/auth/authSlice'
import { ENV } from '../app/env'
import DashboardIcon from '@mui/icons-material/Dashboard'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

export default function Shell({ title, children }: PropsWithChildren<{ title: string }>) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(s => s.auth.user)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  
  const apiBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '')

  useEffect(() => {
    if (user && (user.role === 'user' || user.role === 'mentor') && !user.name) {
      dispatch(fetchUserProfile() as any)
    }
  }, [user?.id, dispatch])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const basePath = user?.role === 'mentor' ? '/mentor' : '/app'

  const handleProfile = () => {
    handleMenuClose()
    navigate(`${basePath}/profile`)
  }

  const handleChangePassword = () => {
    handleMenuClose()
    navigate(`${basePath}/change-password`)
  }

  const handleUpdateImage = () => {
    handleMenuClose()
    navigate(`${basePath}/profile-image`)
  }

  const handleHTMLPlay = () => {
    handleMenuClose()
    navigate(`${basePath}/htmlplay`)
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(246,242,235,0.9)',
          color: 'text.primary',
          borderBottom: '1px solid rgba(27,26,23,0.08)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar sx={{ minHeight: 72 }}>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, letterSpacing: 0.6 }}
            component={RouterLink}
            to="/"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {title}
          </Typography>
          {user && (user.role === 'user' || user.role === 'mentor') && (
            <>
              <IconButton
                component={RouterLink}
                to={basePath}
                sx={{ mr: 1 }}
              >
                <DashboardIcon />
              </IconButton>
              <Box
                onClick={handleMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Avatar 
                  src={user.studentImage ? `${apiBase}${user.studentImage}` : undefined}
                  sx={{ width: 40, height: 40 }}
                >
                  {!user.studentImage && user.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Stack sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                </Stack>
                <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleProfile}>View Profile</MenuItem>
                <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
                <MenuItem onClick={handleUpdateImage}>Update Profile Picture</MenuItem>
                <MenuItem onClick={handleHTMLPlay}>HTML Play</MenuItem>
              </Menu>
            </>
          )}
          {user && user.role === 'admin' && (
            <Typography sx={{ mr: 2, color: 'text.secondary' }}>Admin</Typography>
          )}
          {user && (
            <Button variant="outlined" onClick={() => dispatch(logout())}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {children}
      </Box>
    </Box>
  )
}
