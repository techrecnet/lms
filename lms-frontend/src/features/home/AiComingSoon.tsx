import { Box, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

export default function AiComingSoon() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* AI-themed background effect (simple SVG or CSS) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.15,
          background:
            'radial-gradient(circle at 60% 40%, #00ffe7 0%, transparent 60%), radial-gradient(circle at 30% 70%, #ff00c8 0%, transparent 70%)',
        }}
      />
      <Stack spacing={3} alignItems="center" sx={{ zIndex: 1 }}>
        <Typography variant="h2" color="white" fontWeight={700} textAlign="center">
          Recent AI<br />
          <span style={{ color: '#00ffe7' }}>Coming Soon</span>
        </Typography>
        <Typography variant="h5" color="#e0e0e0" textAlign="center">
          Stay tuned for our next-generation AI-powered features.<br />
          Exciting updates are on the way!
        </Typography>
      </Stack>
      <Box sx={{ position: 'absolute', bottom: 24, width: '100%', zIndex: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="#b0b0b0">
          <Link to="/login" style={{ color: '#b0b0b0', textDecoration: 'underline', fontSize: 14 }}>
            Login
          </Link>
          {' | '}
          <Link to="/signup" style={{ color: '#b0b0b0', textDecoration: 'underline', fontSize: 14 }}>
            Signup
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
