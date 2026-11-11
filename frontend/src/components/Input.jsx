import { useId, useState } from 'react'
import { EyeIcon, EyeOffIcon } from './Icons'

export default function Input({
  id,
  label,
  type = 'text',
  icon = null,
  error = '',
  hint = '',
  className = '',
  ...props
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && revealed ? 'text' : type
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined

  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`.trim()}>
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>

      <div
        className={[
          'field-control',
          icon ? '' : 'no-icon',
          isPassword ? 'has-toggle' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {icon && <span className="field-icon">{icon}</span>}

        <input
          id={inputId}
          type={inputType}
          className="field-input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="field-toggle"
            onClick={() => setRevealed((value) => !value)}
            aria-label={
              revealed ? 'Sembunyikan password' : 'Tampilkan password'
            }
            aria-pressed={revealed}
          >
            {revealed ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <p className="field-error" id={`${inputId}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={`${inputId}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
