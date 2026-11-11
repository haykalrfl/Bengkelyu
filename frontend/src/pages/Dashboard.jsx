import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Button from '../components/Button'
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BoxIcon,
  ClipboardIcon,
  CreditCardIcon,
  PlusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from '../components/Icons'
import { useAppData } from '../hooks/useAppData'
import {
  currentMonthKey,
  formatCurrency,
  formatDate,
  formatDateInput,
  monthKey,
  previousMonthKey,
} from '../utils/format'
import { ORDER_STATUS } from '../utils/status'

const STATUS_COLORS = {
  antri: '#94a3b8',
  dikerjakan: '#f97316',
  selesai: '#3b82f6',
  dibayar: '#10b981',
  batal: '#ef4444',
}

function buildWeek(payments) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))

    const key = formatDateInput(date)
    const total = payments
      .filter((payment) => payment.status === 'lunas' && payment.paidAt === key)
      .reduce((sum, payment) => sum + Number(payment.amount), 0)

    return {
      key,
      total,
      label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
      fullLabel: formatDate(key),
    }
  })
}

function buildDonut(orders) {
  const total = orders.length
  if (total === 0) return { gradient: '#e4e7ec', total }

  let cursor = 0
  const segments = Object.entries(STATUS_COLORS).map(([status, color]) => {
    const count = orders.filter((order) => order.status === status).length
    const start = cursor
    cursor += (count / total) * 100

    return `${color} ${start}% ${cursor}%`
  })

  return { gradient: `conic-gradient(${segments.join(', ')})`, total }
}

export default function Dashboard({ onNavigate }) {
  const { orders, customers, mechanics, inventory, payments, cashflow } =
    useAppData()

  const thisMonth = currentMonthKey()
  const lastMonth = previousMonthKey()

  const paidThisMonth = payments.filter(
    (payment) =>
      payment.status === 'lunas' && monthKey(payment.paidAt) === thisMonth,
  )
  const revenueThisMonth = paidThisMonth.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  )
  const revenueLastMonth = payments
    .filter(
      (payment) =>
        payment.status === 'lunas' && monthKey(payment.paidAt) === lastMonth,
    )
    .reduce((sum, payment) => sum + Number(payment.amount), 0)

  const activeOrders = orders.filter(
    (order) => order.status === 'antri' || order.status === 'dikerjakan',
  )
  const lowStock = inventory
    .filter((item) => Number(item.stock) <= Number(item.minStock))
    .sort(
      (a, b) =>
        Number(a.stock) / Math.max(1, Number(a.minStock)) -
        Number(b.stock) / Math.max(1, Number(b.minStock)),
    )

  const revenueTrend =
    revenueLastMonth > 0
      ? {
          value: `${Math.abs(
            Math.round(
              ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
            ),
          )}%`,
          direction:
            revenueThisMonth >= revenueLastMonth ? 'up' : 'down',
          label: 'Dibanding bulan lalu',
        }
      : null

  const week = buildWeek(payments)
  const weekMax = Math.max(...week.map((day) => day.total), 1)
  const weekTotal = week.reduce((sum, day) => sum + day.total, 0)
  const donut = buildDonut(orders)

  const recentOrders = [...orders]
    .sort((a, b) => {
      if (a.createdAt === b.createdAt) return b.id.localeCompare(a.id)
      return b.createdAt.localeCompare(a.createdAt)
    })
    .slice(0, 5)

  const monthCashflow = cashflow.filter(
    (entry) => monthKey(entry.date) === thisMonth,
  )
  const income = monthCashflow
    .filter((entry) => entry.type === 'masuk')
    .reduce((sum, entry) => sum + Number(entry.amount), 0)
  const expense = monthCashflow
    .filter((entry) => entry.type === 'keluar')
    .reduce((sum, entry) => sum + Number(entry.amount), 0)
  const cashflowScale = Math.max(income, expense, 1)

  function customerName(customerId) {
    return (
      customers.find((customer) => customer.id === customerId)?.name ?? '-'
    )
  }

  function mechanicName(mechanicId) {
    return (
      mechanics.find((mechanic) => mechanic.id === mechanicId)?.name ?? '-'
    )
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Ringkasan"
        title="Dashboard bengkel"
        description="Pantau performa bengkel, order yang sedang berjalan, dan kondisi stok dalam satu layar."
        actions={
          <>
            <Button
              variant="ghost"
              className="btn-sm"
              onClick={() => onNavigate('cashflow')}
            >
              <WalletIcon size={16} /> Lihat arus kas
            </Button>
            <Button className="btn-sm" onClick={() => onNavigate('orders')}>
              <PlusIcon size={16} /> Order baru
            </Button>
          </>
        }
      />

      <div className="stats-grid">
        <StatCard
          icon={CreditCardIcon}
          label="Pendapatan bulan ini"
          value={formatCurrency(revenueThisMonth)}
          hint={`${paidThisMonth.length} transaksi lunas`}
          trend={revenueTrend}
          tone="brand"
        />
        <StatCard
          icon={ClipboardIcon}
          label="Order aktif"
          value={activeOrders.length}
          hint={`${orders.filter((order) => order.status === 'antri').length} menunggu, ${orders.filter((order) => order.status === 'dikerjakan').length} dikerjakan`}
          tone="blue"
        />
        <StatCard
          icon={UsersIcon}
          label="Total pelanggan"
          value={customers.length}
          hint={`${customers.filter((customer) => monthKey(customer.joinedAt) === thisMonth).length} pelanggan baru bulan ini`}
          tone="violet"
        />
        <StatCard
          icon={AlertTriangleIcon}
          label="Stok menipis"
          value={lowStock.length}
          hint={
            lowStock.length > 0
              ? 'Perlu segera diisi ulang'
              : 'Semua stok dalam kondisi aman'
          }
          tone={lowStock.length > 0 ? 'danger' : 'emerald'}
        />
      </div>

      <div className="dashboard-grid">
        <section className="card grid-span-8">
          <header className="card-head">
            <div>
              <h2>Pendapatan 7 hari terakhir</h2>
              <p>Total pembayaran lunas per hari</p>
            </div>
            <div className="card-head-metric">
              <strong>{formatCurrency(weekTotal)}</strong>
              <span>Total seminggu</span>
            </div>
          </header>

          <div className="bar-chart" role="img" aria-label="Grafik pendapatan tujuh hari terakhir">
            {week.map((day) => (
              <div className="bar-chart-col" key={day.key}>
                <span className="bar-chart-value">
                  {day.total > 0 ? formatCurrency(day.total) : ''}
                </span>
                <div className="bar-chart-track">
                  <span
                    className={`bar-chart-bar ${day.total === 0 ? 'is-empty' : ''}`}
                    style={{
                      height: `${Math.max(4, (day.total / weekMax) * 100)}%`,
                    }}
                    title={`${day.fullLabel}: ${formatCurrency(day.total)}`}
                  />
                </div>
                <span className="bar-chart-label">{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card grid-span-4">
          <header className="card-head">
            <div>
              <h2>Status order</h2>
              <p>Distribusi seluruh order</p>
            </div>
          </header>

          <div className="donut-wrap">
            <div
              className="donut"
              style={{ background: donut.gradient }}
              role="img"
              aria-label={`Total ${donut.total} order`}
            >
              <div className="donut-hole">
                <strong>{donut.total}</strong>
                <span>Order</span>
              </div>
            </div>

            <ul className="donut-legend">
              {Object.entries(STATUS_COLORS).map(([status, color]) => {
                const count = orders.filter(
                  (order) => order.status === status,
                ).length

                return (
                  <li key={status}>
                    <span
                      className="legend-dot"
                      style={{ background: color }}
                    />
                    <span>{ORDER_STATUS[status].label}</span>
                    <strong>{count}</strong>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <section className="card grid-span-8">
          <header className="card-head">
            <div>
              <h2>Order terbaru</h2>
              <p>Lima order yang terakhir masuk</p>
            </div>
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate('orders')}
            >
              Lihat semua <ArrowRightIcon size={14} />
            </button>
          </header>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Pelanggan</th>
                  <th>Mekanik</th>
                  <th>Status</th>
                  <th className="text-right">Estimasi</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const status = ORDER_STATUS[order.status]

                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="cell-title">{order.id}</span>
                        <span className="cell-sub">{order.vehicle.plate}</span>
                      </td>
                      <td>{customerName(order.customerId)}</td>
                      <td>{mechanicName(order.mechanicId)}</td>
                      <td>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="text-right">
                        <strong>{formatCurrency(order.estimate)}</strong>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card grid-span-4">
          <header className="card-head">
            <div>
              <h2>Stok menipis</h2>
              <p>Sparepart yang perlu diisi ulang</p>
            </div>
            <span className="card-icon card-icon-warning">
              <BoxIcon size={18} />
            </span>
          </header>

          {lowStock.length === 0 ? (
            <p className="inline-empty">Semua stok aman. Kerja bagus!</p>
          ) : (
            <ul className="stock-list">
              {lowStock.slice(0, 4).map((item) => {
                const ratio = Math.min(
                  100,
                  Math.round(
                    (Number(item.stock) / Math.max(1, Number(item.minStock))) *
                      100,
                  ),
                )

                return (
                  <li key={item.id}>
                    <div className="stock-list-head">
                      <span>
                        <strong>{item.name}</strong>
                        <span>{item.sku}</span>
                      </span>
                      <Badge tone={ratio <= 50 ? 'danger' : 'warning'}>
                        {item.stock} {item.unit}
                      </Badge>
                    </div>
                    <div className="stock-track">
                      <span
                        className="stock-fill is-low"
                        style={{ width: `${Math.max(6, ratio)}%` }}
                      />
                    </div>
                    <span className="stock-meta">
                      Minimum {item.minStock} {item.unit}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}

          <button
            type="button"
            className="link-button stock-link"
            onClick={() => onNavigate('inventory')}
          >
            Kelola sparepart <ArrowRightIcon size={14} />
          </button>
        </section>

        <section className="card grid-span-6">
          <header className="card-head">
            <div>
              <h2>Beban mekanik</h2>
              <p>Order aktif yang sedang ditangani</p>
            </div>
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate('mechanics')}
            >
              Lihat tim <ArrowRightIcon size={14} />
            </button>
          </header>

          <ul className="mechanic-list">
            {mechanics
              .filter((mechanic) => mechanic.status === 'aktif')
              .map((mechanic) => {
                const jobs = activeOrders.filter(
                  (order) => order.mechanicId === mechanic.id,
                ).length

                return (
                  <li key={mechanic.id}>
                    <Avatar name={mechanic.name} size="sm" />
                    <span className="mechanic-copy">
                      <strong>{mechanic.name}</strong>
                      <span>{mechanic.specialty}</span>
                    </span>
                    <Badge tone={jobs > 0 ? 'warning' : 'neutral'}>
                      {jobs > 0 ? `${jobs} order` : 'Kosong'}
                    </Badge>
                  </li>
                )
              })}
          </ul>
        </section>

        <section className="card grid-span-6">
          <header className="card-head">
            <div>
              <h2>Arus kas bulan ini</h2>
              <p>Pemasukan dan pengeluaran berjalan</p>
            </div>
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate('cashflow')}
            >
              Detail <ArrowRightIcon size={14} />
            </button>
          </header>

          <div className="cashflow-summary">
            <div className="cashflow-row">
              <span className="cashflow-label">
                <span className="cashflow-icon is-income">
                  <TrendingUpIcon size={15} />
                </span>
                Pemasukan
              </span>
              <strong className="text-success">{formatCurrency(income)}</strong>
            </div>
            <div className="cashflow-track">
              <span
                className="cashflow-fill is-income"
                style={{ width: `${(income / cashflowScale) * 100}%` }}
              />
            </div>

            <div className="cashflow-row">
              <span className="cashflow-label">
                <span className="cashflow-icon is-expense">
                  <TrendingDownIcon size={15} />
                </span>
                Pengeluaran
              </span>
              <strong className="text-danger">{formatCurrency(expense)}</strong>
            </div>
            <div className="cashflow-track">
              <span
                className="cashflow-fill is-expense"
                style={{ width: `${(expense / cashflowScale) * 100}%` }}
              />
            </div>

            <div className="cashflow-balance">
              <span>Saldo bulan ini</span>
              <strong>{formatCurrency(income - expense)}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
