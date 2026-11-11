import { SearchIcon } from '../Icons'

export default function SearchField({
  value,
  onChange,
  placeholder = 'Cari...',
  label = 'Cari',
}) {
  return (
    <label className="search-field">
      <span className="sr-only">{label}</span>
      <SearchIcon size={17} />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}
