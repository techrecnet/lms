import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { api } from '../../core/api'
import { useAppDispatch } from '../../shared/hooks/redux'
import { setToken } from './authSlice'
import { useLocation, useNavigate } from 'react-router-dom'

// import template CSS so the login page matches the HTML template
import '../../source/Login_files/bootstrap.min.css'
import '../../source/Login_files/slick.css'
import '../../source/Login_files/slick-theme.css'
import '../../source/Login_files/style.css'

type Form = { email: string; password: string }

export default function Login() {
  const { register, handleSubmit } = useForm<Form>({ defaultValues: { email: '', password: '' } })
  const dispatch = useAppDispatch()
  const nav = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: Form) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await api.post('/auth/login', data)
      dispatch(setToken(res.data.token))
      const token = res.data.token as string
      const payload = JSON.parse(atob(token.split('.')[1]))
      const redirect = new URLSearchParams(location.search).get('redirect')
      if (redirect && redirect.startsWith('/')) nav(redirect)
      else nav(payload.role === 'admin' ? '/admin' : payload.role === 'mentor' ? '/mentor' : '/app')
    } catch (err: any) {
      setError(err?.response?.data?.msg || 'Invalid email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="main-wrapper">
      <div className="login-content">
        <div className="row">
          <div className="col-lg-6 login-bg d-none d-lg-flex">
            <div className="login-carousel">
              <div className="login-carousel-section">
                <div className="login-banner">
                  <img src="/src/source/Login_files/auth-1.svg" className="img-fluid" alt="Logo" />
                </div>
                <div className="mentor-course text-center">
                  <h3 className="mb-2">Welcome to <br />Dreams<span className="text-secondary">LMS</span> Courses.</h3>
                  <p>Platform designed to help organizations, educators, and learners manage, deliver, and track learning and training activities.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 login-wrap-bg bg-white">
            <div className="login-wrapper">
              <div className="loginbox">
                <div className="w-100">
                  <div className="d-flex align-items-center justify-content-between login-header">
                    <img src="/src/source/Login_files/logo.svg" className="img-fluid" alt="Logo" />
                    <a href="#" className="link-1">Back to Home</a>
                  </div>
                  <h1 className="fs-32 fw-bold topic">Sign into Your Account</h1>

                  <form onSubmit={handleSubmit(onSubmit)} className="mb-3 pb-3">
                    <div className="mb-3 position-relative">
                      <label className="form-label">Email<span className="text-danger ms-1">*</span></label>
                      <div className="position-relative">
                        <input type="email" className="form-control form-control-lg" {...register('email', { required: true })} />
                        <span><i className="isax isax-sms input-icon text-gray-7 fs-14"></i></span>
                      </div>
                    </div>
                    <div className="mb-3 position-relative">
                      <label className="form-label">Password <span className="text-danger ms-1">*</span></label>
                      <div className="position-relative">
                        <input type="password" className="pass-inputs form-control form-control-lg" {...register('password', { required: true })} />
                        <span className="isax toggle-passwords isax-eye-slash fs-14"></span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="remember-me d-flex align-items-center">
                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                        <label className="form-check-label ms-2" htmlFor="flexCheckDefault">Remember Me</label>
                      </div>
                      <div>
                        <a href="#" className="link-2">Forgot Password ?</a>
                      </div>
                    </div>

                    <div className="d-grid">
                      <button className="btn btn-secondary btn-lg" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Login'}</button>
                    </div>
                  </form>

                  <div className="d-flex align-items-center justify-content-center or fs-14 mb-3">Or</div>

                

                  <div className="fs-14 fw-normal d-flex align-items-center justify-content-center">
                    Don't you have an account?<a href="/signup" className="link-2 ms-1"> Sign up</a>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
