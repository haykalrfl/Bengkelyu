const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('id-ID')

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const longDateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dayMonthFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
})

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0)
}

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0)
}

export function formatDate(value, style = 'short') {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  if (style === 'long') return longDateFormatter.format(date)
  if (style === 'day-month') return dayMonthFormatter.format(date)

  return shortDateFormatter.format(date)
}

export function formatDateInput(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 10)
}

export function daysAgoISO(days) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return formatDateInput(date)
}

export function monthKey(value) {
  return String(value ?? '').slice(0, 7)
}

export function currentMonthKey() {
  return formatDateInput().slice(0, 7)
}

export function previousMonthKey() {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() - 1)
  return monthKey(formatDateInput(date))
}

export function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'B'
  )
}

export function classNames(...values) {
  return values.filter(Boolean).join(' ')
}

export function relativeDay(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const diff = Math.round((today.getTime() - date.getTime()) / 86400000)

  if (diff === 0) return 'Hari ini'
  if (diff === 1) return 'Kemarin'
  if (diff > 1 && diff < 7) return `${diff} hari lalu`
  if (diff < 0 && diff > -7) return `${Math.abs(diff)} hari lagi`

  return formatDate(value)
}
