import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { store } from './app/store'
import AppRouter from './app/router'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f3d30' },
    secondary: { main: '#d5794b' },
    background: { default: '#f6f2eb', paper: '#ffffff' },
    text: { primary: '#1b1a17', secondary: '#5b564f' }
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h3: { fontFamily: '"Fraunces", serif', fontWeight: 700 },
    h4: { fontFamily: '"Fraunces", serif', fontWeight: 700 },
    h5: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h6: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'radial-gradient(1000px 460px at 8% -10%, rgba(213,121,75,0.14), transparent 60%), radial-gradient(900px 420px at 92% 0%, rgba(15,61,48,0.12), transparent 60%)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(27,26,23,0.08)',
          boxShadow: '0 14px 35px rgba(20,17,12,0.06)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12 }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined'
      }
    }
  }
})
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)
