import { useState } from 'react'
import Avatar from '../components/ui/Avatar'
import {
  BoxIcon,
  ClipboardIcon,
  CreditCardIcon,
  LayoutGridIcon,
  LogoutIcon,
  MenuIcon,
  RefreshIcon,
  SparklesIcon,
  UsersIcon,
  WalletIcon,
  WrenchIcon,
  XIcon,
} from '../components/Icons'
import { useAppData } from '../hooks/useAppData'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/format'

const NAV_GROUPS = [
  {
    label: 'Utama',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutGridIcon },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { id: 'orders', label: 'Order servis', icon: ClipboardIcon },
      { id: 'customers', label: 'Pelanggan', icon: UsersIcon },
      { id: 'mechanics', label: 'Mekanik', icon: WrenchIcon },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { id: 'payments', label: 'Pembayaran', icon: CreditCardIcon },
      { id: 'cashflow', label: 'Arus kas', icon: WalletIcon },
    ],
  },
  {
    label: 'Inventori',
    items: [{ id: 'inventory', label: 'Sparepart', icon: BoxIcon }],
  },
]

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  orders: 'Order servis',
  customers: 'Pelanggan',
  mechanics: 'Mekanik',
  payments: 'Pembayaran',
  cashflow: 'Arus kas',
  inventory: 'Sparepart',
}

export default function AppLayout({ page, onNavigate, children }) {
  const { user, logout } = useAuth()
  const { orders, inventory, resetData } = useAppData()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [todayLabel] = useState(() => formatDate(new Date(), 'long'))

  const activeOrders = orders.filter(
    (order) => order.status === 'antri' || order.status === 'dikerjakan',
  ).length
  const lowStock = inventory.filter(
    (item) => Number(item.stock) <= Number(item.minStock),
  ).length

  function navigateTo(nextPage) {
    setDrawerOpen(false)
    onNavigate(nextPage)
  }

  function badgeFor(itemId) {
    if (itemId === 'orders') return activeOrders
    if (itemId === 'inventory') return lowStock
    return null
  }

  function handleReset() {
    const confirmed = window.confirm(
      'Kembalikan semua data demo ke kondisi awal? Perubahan yang sudah dibuat akan hilang.',
    )

    if (confirmed) resetData()
  }

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${drawerOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">
            <WrenchIcon size={20} />
          </span>
          <span className="brand-word">
            <strong>Bengkelyu</strong>
            <span>Workshop management</span>
          </span>

          <button
            type="button"
            className="icon-btn sidebar-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Tutup menu"
          >
            <XIcon size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {NAV_GROUPS.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <span className="sidebar-group-label">{group.label}</span>

              {group.items.map((item) => {
                const Icon = item.icon
                const badge = badgeFor(item.id)

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`sidebar-link ${page === item.id ? 'is-active' : ''}`}
                    onClick={() => navigateTo(item.id)}
                    aria-current={page === item.id ? 'page' : undefined}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {badge > 0 && (
                      <span className="sidebar-badge">{badge}</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user?.is_demo && (
            <button
              type="button"
              className="sidebar-reset"
              onClick={handleReset}
            >
              <RefreshIcon size={14} />
              Reset data demo
            </button>
          )}

          <div className="sidebar-user">
            <Avatar name={user?.name} size="sm" />
            <span className="sidebar-user-copy">
              <strong>{user?.name || 'Pengguna Bengkelyu'}</strong>
              <span>{user?.email}</span>
            </span>
            <button
              type="button"
              className="icon-btn icon-btn-dark"
              onClick={logout}
              aria-label="Keluar dari akun"
              title="Keluar"
            >
              <LogoutIcon size={17} />
            </button>
          </div>
        </div>
      </aside>

      {drawerOpen && (
        <button
          type="button"
          className="sidebar-scrim"
          onClick={() => setDrawerOpen(false)}
          aria-label="Tutup menu navigasi"
        />
      )}

      <div className="app-frame">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-btn topbar-menu"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu navigasi"
            >
              <MenuIcon size={20} />
            </button>

            <div className="topbar-title">
              <span>Bengkelyu / {PAGE_TITLES[page]}</span>
              <strong>{PAGE_TITLES[page]}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <span className="topbar-date">{todayLabel}</span>

            {user?.is_demo && (
              <span className="demo-chip">
                <SparklesIcon size={13} />
                Mode demo
              </span>
            )}

            <div className="topbar-user">
              <Avatar name={user?.name} size="sm" />
              <span>
                <strong>{user?.name}</strong>
                <span>{user?.is_demo ? 'Data contoh' : 'Admin bengkel'}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
