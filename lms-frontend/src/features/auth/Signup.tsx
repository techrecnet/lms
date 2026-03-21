import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { api } from '../../core/api'
import { useNavigate } from 'react-router-dom'

// import template CSS so the signup page matches the HTML template (same as Login)
import '../../css/bootstrap.min.css'
import '../../css/slick.css'
import '../../css/slick-theme.css'
import '../../css/style.css'

type Form = { name: string; email: string; password: string; role?: 'admin' | 'user' }

export default function Signup() {
  const { register, handleSubmit } = useForm<Form>({ defaultValues: { role: 'user' } })
  const nav = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: Form) => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      await api.post('/auth/signup', data)
      setSuccess('Account created successfully. Redirecting to login...')
      setTimeout(() => nav('/login'), 1200)
    } catch (err: any) {
      setError(err?.response?.data?.msg || 'Signup failed. Please try again.')
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
                  <img src="../../../images/auth-2.svg" className="img-fluid" alt="Signup" />
                </div>
                <div className="mentor-course text-center">
                  <h3 className="mb-2">Join Recnet<span className="text-secondary">LMS</span> today.</h3>
                  <p>Create and share courses, manage learners, and track progress with ease.</p>
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
                  <h1 className="fs-32 fw-bold topic">Create your account</h1>

                  <form onSubmit={handleSubmit(onSubmit)} className="mb-3 pb-3">
                    {success && <div className="alert alert-success">{success}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="mb-3 position-relative">
                      <label className="form-label">Name<span className="text-danger ms-1">*</span></label>
                      <div className="position-relative">
                        <input type="text" className="form-control form-control-lg" {...register('name', { required: true })} />
                      </div>
                    </div>

                    <div className="mb-3 position-relative">
                      <label className="form-label">Email<span className="text-danger ms-1">*</span></label>
                      <div className="position-relative">
                        <input type="email" className="form-control form-control-lg" {...register('email', { required: true })} />
                      </div>
                    </div>

                    <div className="mb-3 position-relative">
                      <label className="form-label">Password <span className="text-danger ms-1">*</span></label>
                      <div className="position-relative">
                        <input type="password" className="pass-inputs form-control form-control-lg" {...register('password', { required: true })} />
                      </div>
                    </div>

                    <div className="d-grid">
                      <button className="btn btn-secondary btn-lg" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create account'}</button>
                    </div>
                  </form>

                  <div className="fs-14 fw-normal d-flex align-items-center justify-content-center">
                    Already have an account? <a href="/login" className="link-2 ms-1"> Sign in</a>
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
