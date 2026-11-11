import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import {
  AlertIcon,
  ArrowRightIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from '../components/Icons'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../services/api'

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

function validate(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Nama wajib diisi.'
  } else if (values.name.trim().length > 255) {
    errors.name = 'Nama maksimal 255 karakter.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email wajib diisi.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Format email tidak valid.'
  }

  if (!values.password) {
    errors.password = 'Password wajib diisi.'
  } else if (values.password.length < 8) {
    errors.password = 'Password minimal 8 karakter.'
  }

  if (!values.password_confirmation) {
    errors.password_confirmation = 'Konfirmasi password wajib diisi.'
  } else if (values.password !== values.password_confirmation) {
    errors.password_confirmation = 'Konfirmasi password tidak cocok.'
  }

  return errors
}

export default function Register({ onSwitch }) {
  const { register } = useAuth()
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
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        password_confirmation: values.password_confirmation,
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
        <span className="auth-eyebrow auth-eyebrow-small">Mulai sekarang</span>
        <h2>Buat akun Bengkelyu</h2>
        <p>
          Daftarkan akun Anda untuk mulai mencatat order, pembayaran, dan stok
          bengkel.
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
            id="register-name"
            name="name"
            label="Nama lengkap"
            type="text"
            icon={<UserIcon size={18} />}
            placeholder="Nama Anda"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            disabled={submitting}
            autoFocus
          />

          <Input
            id="register-email"
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
          />

          <Input
            id="register-password"
            name="password"
            label="Password"
            type="password"
            icon={<LockIcon size={18} />}
            placeholder="Buat password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            hint="Minimal 8 karakter."
            disabled={submitting}
          />

          <Input
            id="register-password-confirmation"
            name="password_confirmation"
            label="Konfirmasi password"
            type="password"
            icon={<LockIcon size={18} />}
            placeholder="Ulangi password"
            autoComplete="new-password"
            value={values.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation}
            disabled={submitting}
          />
        </div>

        <Button
          type="submit"
          block
          loading={submitting}
          loadingText="Membuat akun..."
        >
          Buat akun <ArrowRightIcon size={17} />
        </Button>
      </form>

      <p className="auth-switch">
        Sudah punya akun?{' '}
        <button type="button" onClick={onSwitch}>
          Masuk di sini
        </button>
      </p>

      <p className="auth-legal">
        <ShieldIcon size={14} />
        <span>
          Password disimpan terenkripsi di server. Sesi berakhir saat Anda
          keluar.
        </span>
      </p>
    </>
  )
}
