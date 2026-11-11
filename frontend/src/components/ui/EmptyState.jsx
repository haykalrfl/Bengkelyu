import { SearchIcon } from '../Icons'

export default function EmptyState({
  icon: Icon = SearchIcon,
  title = 'Belum ada data',
  description = 'Data akan muncul di sini setelah ditambahkan.',
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <Icon size={22} />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}
