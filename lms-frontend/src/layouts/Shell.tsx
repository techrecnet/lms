import { PropsWithChildren, useState, useEffect } from 'react'
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Menu, MenuItem, Stack, Divider } from '@mui/material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../shared/hooks/redux'
import { logout, fetchUserProfile } from '../features/auth/authSlice'
import { ENV } from '../app/env'
import DashboardIcon from '@mui/icons-material/Dashboard'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SessionFAB from '../features/interaction/SessionFAB'
import logo from '../../images/logo-white.png'

export default function Shell({ title, children, isAdmin }: PropsWithChildren<{ title: string; isAdmin?: boolean }>) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(s => s.auth.user)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [masterAnchor, setMasterAnchor] = useState<null | HTMLElement>(null)
  const [contentsAnchor, setContentsAnchor] = useState<null | HTMLElement>(null)
  const [umsAnchor, setUmsAnchor] = useState<null | HTMLElement>(null)
  const [interactionAnchor, setInteractionAnchor] = useState<null | HTMLElement>(null)
  
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

  const handleAdminMenuOpen = (setter: any) => (event: React.MouseEvent<HTMLElement>) => {
    setter(event.currentTarget)
  }
  
  const handleAdminMenuClose = (setter: any) => () => {
    setter(null)
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

  const menuItemSx = {
    '&:hover': {
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      color: '#7c3aed'
    },
    pl: 1.5
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#392C7D',
          color: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Toolbar sx={{ minHeight: 80 }}>
          {isAdmin ? (
            <Box
              component={RouterLink}
              to="/admin"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                flexGrow: 1,
                height: 60
              }}
            >
              <img src={logo} alt="RECNET" style={{ height: '100%', maxWidth: 'auto' }} />
            </Box>
          ) : (
            <Typography
              variant="h6"
              sx={{ 
                flexGrow: 1, 
                letterSpacing: 0.5,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem'
              }}
              component={RouterLink}
              to="/"
              style={{ textDecoration: 'none' }}
            >
              {title}
            </Typography>
          )}

          {/* Admin Menu */}
          {user && user.role === 'admin' && isAdmin && (
            <Stack direction="row" spacing={0.5} sx={{ mr: 3 }}>
              {/* Master Menu */}
              <Box>
                <Button
                  onClick={handleAdminMenuOpen(setMasterAnchor)}
                  endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    px: 1.2,
                    py: 0.5,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff'
                    },
                    ...(masterAnchor && {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff'
                    })
                  }}
                >
                  Master
                </Button>
                <Menu
                  anchorEl={masterAnchor}
                  open={Boolean(masterAnchor)}
                  onClose={handleAdminMenuClose(setMasterAnchor)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      mt: 0.5,
                      minWidth: 160
                    }
                  }}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/admin/institutes"
                    onClick={handleAdminMenuClose(setMasterAnchor)}
                    sx={menuItemSx}
                  >
                    Institutes
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/batches"
                    onClick={handleAdminMenuClose(setMasterAnchor)}
                    sx={menuItemSx}
                  >
                    Batches
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/courses"
                    onClick={handleAdminMenuClose(setMasterAnchor)}
                    sx={menuItemSx}
                  >
                    Courses
                  </MenuItem>
                </Menu>
              </Box>

              {/* Contents Menu */}
              <Box>
                <Button
                  onClick={handleAdminMenuOpen(setContentsAnchor)}
                  endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    px: 1.2,
                    py: 0.5,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff'
                    },
                    ...(contentsAnchor && {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff'
                    })
                  }}
                >
                  Contents
                </Button>
                <Menu
                  anchorEl={contentsAnchor}
                  open={Boolean(contentsAnchor)}
                  onClose={handleAdminMenuClose(setContentsAnchor)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      mt: 0.5,
                      minWidth: 160
                    }
                  }}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/admin/topics-lib"
                    onClick={handleAdminMenuClose(setContentsAnchor)}
                    sx={menuItemSx}
                  >
                    Topic Library
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/questions"
                    onClick={handleAdminMenuClose(setContentsAnchor)}
                    sx={menuItemSx}
                  >
                    Questions
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/quizzes"
                    onClick={handleAdminMenuClose(setContentsAnchor)}
                    sx={menuItemSx}
                  >
                    Quizzes
                  </MenuItem>
                </Menu>
              </Box>

              {/* UMS Menu */}
              <Box>
                <Button
                  onClick={handleAdminMenuOpen(setUmsAnchor)}
                  endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    px: 1.2,
                    py: 0.5,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff'
                    },
                    ...(umsAnchor && {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff'
                    })
                  }}
                >
                  UMS
                </Button>
                <Menu
                  anchorEl={umsAnchor}
                  open={Boolean(umsAnchor)}
                  onClose={handleAdminMenuClose(setUmsAnchor)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      mt: 0.5,
                      minWidth: 160
                    }
                  }}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/admin/users"
                    onClick={handleAdminMenuClose(setUmsAnchor)}
                    sx={menuItemSx}
                  >
                    Users
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/admin/mentors"
                    onClick={handleAdminMenuClose(setUmsAnchor)}
                    sx={menuItemSx}
                  >
                    Mentors
                  </MenuItem>
                </Menu>
              </Box>

              {/* Playground */}
              <Button
                component={RouterLink}
                to="/admin/htmlplay"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  px: 1.2,
                  py: 0.5,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff'
                  }
                }}
              >
                HTML Play
              </Button>

              {/* Interaction Menu */}
              <Box>
                <Button
                  onClick={handleAdminMenuOpen(setInteractionAnchor)}
                  endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />}
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    px: 1.2,
                    py: 0.5,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff'
                    },
                    ...(interactionAnchor && {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff'
                    })
                  }}
                >
                  Interactions
                </Button>
                <Menu
                  anchorEl={interactionAnchor}
                  open={Boolean(interactionAnchor)}
                  onClose={handleAdminMenuClose(setInteractionAnchor)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      mt: 0.5,
                      minWidth: 160
                    }
                  }}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/admin/interaction"
                    onClick={handleAdminMenuClose(setInteractionAnchor)}
                    sx={menuItemSx}
                  >
                    Sessions
                  </MenuItem>
                </Menu>
              </Box>
            </Stack>
          )}

          {user && (user.role === 'user' || user.role === 'mentor') && !isAdmin && (
            <>
              <IconButton
                component={RouterLink}
                to={basePath}
                sx={{ mr: 2, color: '#ffffff', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' } }}
              >
                <DashboardIcon />
              </IconButton>
              <Box
                onClick={handleMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <Avatar 
                  src={user.studentImage ? `${apiBase}${user.studentImage}` : undefined}
                  sx={{ 
                    width: 44, 
                    height: 44,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    fontWeight: 700
                  }}
                >
                  {!user.studentImage && user.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Stack sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff' }}>{user.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{user.email}</Typography>
                </Stack>
                <KeyboardArrowDownIcon sx={{ color: '#ffffff' }} />
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    mt: 1
                  }
                }}
              >
                <MenuItem onClick={handleProfile} sx={{ '&:hover': { backgroundColor: 'rgba(57, 44, 125, 0.08)' } }}>View Profile</MenuItem>
                <MenuItem onClick={handleChangePassword} sx={{ '&:hover': { backgroundColor: 'rgba(57, 44, 125, 0.08)' } }}>Change Password</MenuItem>
                <MenuItem onClick={handleUpdateImage} sx={{ '&:hover': { backgroundColor: 'rgba(57, 44, 125, 0.08)' } }}>Update Profile Picture</MenuItem>
                <MenuItem onClick={handleHTMLPlay} sx={{ '&:hover': { backgroundColor: 'rgba(57, 44, 125, 0.08)' } }}>HTML Play</MenuItem>
              </Menu>
            </>
          )}
          
          {user && (
            <Button 
              variant="outlined" 
              onClick={() => dispatch(logout())}
              sx={{
                borderColor: '#ffffff',
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderColor: '#ffffff'
                }
              }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {children}
      </Box>
      {!isAdmin && <SessionFAB />}
    </Box>
  )
}
