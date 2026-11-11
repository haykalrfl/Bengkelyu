export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  block = false,
  loading = false,
  loadingText = 'Memproses...',
  className = '',
  disabled = false,
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      <span>{loading ? loadingText : children}</span>
    </button>
  )
}
