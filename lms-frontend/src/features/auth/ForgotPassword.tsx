import { useState, useEffect, useRef } from 'react'
import { api } from '../../core/api'
import { Box, Button, TextField, Stack, Alert, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

// Render forgot-password page styled like signup and include invisible reCAPTCHA
export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const widgetIdRef = useRef<number | null>(null)
  const grecaptchaReady = useRef(false)

  useEffect(() => {
    // Load reCAPTCHA script if site key is present
    const siteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY || '')
    if (!siteKey) return
    if ((window as any).grecaptcha) {
      grecaptchaReady.current = true
      tryRender()
      return
    }
    const scr = document.createElement('script')
    scr.src = `https://www.google.com/recaptcha/api.js?render=explicit`
    scr.async = true
    scr.onload = () => {
      grecaptchaReady.current = true
      tryRender()
    }
    document.body.appendChild(scr)

    function tryRender() {
      try {
        if (!(window as any).grecaptcha) return
        if (widgetIdRef.current !== null) return
        widgetIdRef.current = (window as any).grecaptcha.render('forgot-recaptcha', {
          sitekey: siteKey,
          size: 'invisible',
          callback: (token: string) => {
            // token handled in submit flow
          }
        })
      } catch (e) {}
    }
  }, [])

  const submit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      // execute recaptcha if available
      let captchaToken: string | undefined = undefined
      const siteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY || '')
      if (siteKey && (window as any).grecaptcha && widgetIdRef.current !== null) {
        captchaToken = await new Promise((resolve) => {
          ;(window as any).grecaptcha.execute(widgetIdRef.current, { action: 'forgot' })
          // grecaptcha will automatically call the callback and the token can be retrieved via getResponse
          setTimeout(() => {
            try { resolve((window as any).grecaptcha.getResponse(widgetIdRef.current)) } catch (e) { resolve(undefined) }
          }, 1500)
        }) as string | undefined
      }

      await api.post('/auth/forgot-password', { email, captchaToken })
      setMessage('If the email exists, a reset link will be sent.')
    } catch (e: any) {
      setError(e.response?.data?.msg || 'Failed to send reset email')
    } finally { setLoading(false) }
  }

  return (
    <Box className="main-wrapper">
      <div className="login-content">
        <div className="row">
          <div className="col-lg-6 login-bg d-none d-lg-flex">
            <div className="login-carousel">
              <div className="login-carousel-section">
                <div className="login-banner">
                  <img src="../../../images/auth-2.svg" className="img-fluid" alt="Forgot" />
                </div>
                <div className="mentor-course text-center">
                  <h3 className="mb-2">Reset your password</h3>
                  <p>Enter your account email and we'll send a reset link.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 login-wrap-bg bg-white">
            <div className="login-wrapper">
              <div className="loginbox">
                <div className="w-100">
                  <div className="d-flex align-items-center justify-content-between login-header">
                    <img src="../../../images/logo-white.png" className="img-fluid" alt="Logo" />
                    <a href="#" className="link-1">Back to Home</a>
                  </div>
                  <h1 className="fs-32 fw-bold topic">Reset your password</h1>

                  <form className="mb-3 pb-3" onSubmit={(e) => { e.preventDefault(); submit() }}>
                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="mb-3 position-relative">
                      <label className="form-label">Email<span className="text-danger ms-1">*</span></label>
                      <div className="position-relative">
                        <input type="email" className="form-control form-control-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>

                    <div id="forgot-recaptcha" />

                    <div className="d-grid">
                      <button className="btn btn-secondary btn-lg" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
                    </div>
                  </form>

                  <div className="fs-14 fw-normal d-flex align-items-center justify-content-center">
                    Remembered? <Link to="/login" className="link-2 ms-1"> Sign in</Link>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}
