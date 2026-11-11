import { initials } from '../../utils/format'

const TONES = ['amber', 'teal', 'blue', 'violet', 'rose', 'emerald']

function toneFor(name = '') {
  const total = name
    .split('')
    .reduce((sum, character) => sum + character.charCodeAt(0), 0)

  return TONES[total % TONES.length]
}

export default function Avatar({ name = '', size = 'md' }) {
  return (
    <span
      className={`avatar avatar-${size} avatar-${toneFor(name)}`}
      title={name}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
