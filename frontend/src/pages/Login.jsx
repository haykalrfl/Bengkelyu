import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import {
  AlertIcon,
  ArrowRightIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  SparklesIcon,
} from '../components/Icons'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../services/api'

const EMPTY_FORM = {
  email: '',
  password: '',
}

function validate(values) {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Email wajib diisi.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Format email tidak valid.'
  }

  if (!values.password) {
    errors.password = 'Password wajib diisi.'
  }

  return errors
}

export default function Login({ onSwitch }) {
  const { login, loginDemo } = useAuth()
  const [values, setValues] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setValues((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => {
      if (!previous[name]) return previous

      const next = { ...previous }
      delete next[name]
      return next
    })

    if (formError) setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setFormError('')
    setErrors({})

    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)

        const fieldErrors = {}
        for (const [field, messages] of Object.entries(error.errors ?? {})) {
          if (field in values && Array.isArray(messages) && messages.length) {
            fieldErrors[field] = messages[0]
          }
        }
        setErrors(fieldErrors)
      } else {
        setFormError('Terjadi kesalahan tak terduga. Silakan coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <header className="auth-card-head">
        <span className="auth-eyebrow auth-eyebrow-small">Selamat datang</span>
        <h2>Masuk ke akun Anda</h2>
        <p>
          Lanjutkan pengelolaan order servis, pembayaran, dan stok bengkel dari
          satu dashboard.
        </p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="alert alert-error" role="alert">
            <AlertIcon size={18} />
            <span>{formError}</span>
          </div>
        )}

        <div className="fields">
          <Input
            id="login-email"
            name="email"
            label="Email"
            type="email"
            icon={<MailIcon size={18} />}
            placeholder="nama@bengkel.com"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            disabled={submitting}
            autoFocus
          />

          <Input
            id="login-password"
            name="password"
            label="Password"
            type="password"
            icon={<LockIcon size={18} />}
            placeholder="Masukkan password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            disabled={submitting}
          />
        </div>

        <Button
          type="submit"
          block
          loading={submitting}
          loadingText="Memeriksa..."
        >
          Masuk <ArrowRightIcon size={17} />
        </Button>
      </form>

      <div className="auth-divider">
        <span>atau</span>
      </div>

      <Button variant="ghost" block onClick={loginDemo} disabled={submitting}>
        <SparklesIcon size={17} /> Coba mode demo
      </Button>

      <p className="auth-demo-hint">
        Langsung masuk dengan data contoh tanpa perlu menjalankan backend.
      </p>

      <p className="auth-switch">
        Belum punya akun?{' '}
        <button type="button" onClick={onSwitch}>
          Daftar sekarang
        </button>
      </p>

      <p className="auth-legal">
        <ShieldIcon size={14} />
        <span>Akses aman dengan sesi token. Keluar kapan saja dari dashboard.</span>
      </p>
    </>
  )
}
