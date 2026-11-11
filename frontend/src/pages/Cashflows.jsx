import { useMemo, useState } from 'react'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import SearchField from '../components/ui/SearchField'
import StatCard from '../components/ui/StatCard'
import Button from '../components/Button'
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  PlusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from '../components/Icons'
import { useAppData } from '../hooks/useAppData'
import {
  currentMonthKey,
  formatCurrency,
  formatDate,
  formatDateInput,
  monthKey,
} from '../utils/format'

const INCOME_CATEGORIES = [
  'Pembayaran servis',
  'Pendapatan lain',
  'Modal',
]

const EXPENSE_CATEGORIES = [
  'Sparepart',
  'Gaji',
  'Operasional',
  'Peralatan',
  'Sewa',
  'Lainnya',
]

const EMPTY_FORM = {
  type: 'masuk',
  date: formatDateInput(),
  category: INCOME_CATEGORIES[0],
  description: '',
  amount: '',
}

function buildWeek(entries) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    const key = formatDateInput(date)

    const dayEntries = entries.filter((entry) => entry.date === key)

    return {
      key,
      label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
      income: dayEntries
        .filter((entry) => entry.type === 'masuk')
        .reduce((sum, entry) => sum + Number(entry.amount), 0),
      expense: dayEntries
        .filter((entry) => entry.type === 'keluar')
        .reduce((sum, entry) => sum + Number(entry.amount), 0),
    }
  })
}

export default function Cashflow() {
  const { cashflow, addCashflowEntry } = useAppData()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('semua')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const thisMonth = currentMonthKey()
  const monthEntries = cashflow.filter(
    (entry) => monthKey(entry.date) === thisMonth,
  )
  const income = monthEntries
    .filter((entry) => entry.type === 'masuk')
    .reduce((sum, entry) => sum + Number(entry.amount), 0)
  const expense = monthEntries
    .filter((entry) => entry.type === 'keluar')
    .reduce((sum, entry) => sum + Number(entry.amount), 0)
  const balance = income - expense

  const week = buildWeek(cashflow)
  const weekMax = Math.max(
    ...week.map((day) => Math.max(day.income, day.expense)),
    1,
  )

  const filteredEntries = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return [...cashflow]
      .sort((a, b) => {
        if (a.date === b.date) return b.id.localeCompare(a.id)
        return b.date.localeCompare(a.date)
      })
      .filter((entry) => {
        if (typeFilter !== 'semua' && entry.type !== typeFilter) return false
        if (!keyword) return true

        return [entry.description, entry.category, entry.type].some((value) =>
          String(value).toLowerCase().includes(keyword),
        )
      })
  }, [cashflow, search, typeFilter])

  const categoryOptions =
    form.type === 'masuk' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  function openCreate() {
    setForm({ ...EMPTY_FORM, date: formatDateInput() })
    setFormError('')
    setCreateOpen(true)
  }

  function closeCreate() {
    setCreateOpen(false)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => {
      if (name === 'type') {
        return {
          ...previous,
          type: value,
          category:
            value === 'masuk' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
        }
      }

      return { ...previous, [name]: value }
    })
    if (formError) setFormError('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.description.trim()) {
      setFormError('Keterangan transaksi wajib diisi.')
      return
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setFormError('Nominal transaksi harus lebih dari nol.')
      return
    }

    addCashflowEntry({
      type: form.type,
      date: form.date,
      category: form.category,
      description: form.description.trim(),
      amount: Number(form.amount),
    })

    closeCreate()
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Keuangan"
        title="Arus kas"
        description="Catat pemasukan dan pengeluaran bengkel supaya kondisi kas selalu terlihat."
        actions={
          <Button className="btn-sm" onClick={openCreate}>
            <PlusIcon size={16} /> Catat transaksi
          </Button>
        }
      />

      <div className="stats-grid">
        <StatCard
          icon={TrendingUpIcon}
          label="Pemasukan bulan ini"
          value={formatCurrency(income)}
          hint={`${monthEntries.filter((entry) => entry.type === 'masuk').length} transaksi masuk`}
          tone="emerald"
        />
        <StatCard
          icon={TrendingDownIcon}
          label="Pengeluaran bulan ini"
          value={formatCurrency(expense)}
          hint={`${monthEntries.filter((entry) => entry.type === 'keluar').length} transaksi keluar`}
          tone="danger"
        />
        <StatCard
          icon={WalletIcon}
          label="Saldo bulan ini"
          value={formatCurrency(balance)}
          hint={balance >= 0 ? 'Kas surplus' : 'Kas defisit'}
          tone={balance >= 0 ? 'brand' : 'warning'}
        />
        <StatCard
          icon={ArrowUpRightIcon}
          label="Total transaksi"
          value={cashflow.length}
          hint="Seluruh pencatatan kas"
          tone="blue"
        />
      </div>

      <section className="card">
        <header className="card-head">
          <div>
            <h2>Arus kas 7 hari terakhir</h2>
            <p>Perbandingan pemasukan dan pengeluaran harian</p>
          </div>
          <div className="chart-legend">
            <span>
              <span className="legend-dot legend-success" /> Masuk
            </span>
            <span>
              <span className="legend-dot legend-danger" /> Keluar
            </span>
          </div>
        </header>

        <div className="duo-chart" role="img" aria-label="Grafik arus kas tujuh hari terakhir">
          {week.map((day) => (
            <div className="duo-chart-col" key={day.key}>
              <div className="duo-chart-bars">
                <span
                  className="duo-bar is-income"
                  style={{
                    height: `${Math.max(2, (day.income / weekMax) * 100)}%`,
                  }}
                  title={`Masuk ${formatCurrency(day.income)}`}
                />
                <span
                  className="duo-bar is-expense"
                  style={{
                    height: `${Math.max(2, (day.expense / weekMax) * 100)}%`,
                  }}
                  title={`Keluar ${formatCurrency(day.expense)}`}
                />
              </div>
              <span className="bar-chart-label">{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="toolbar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Cari keterangan atau kategori..."
            label="Cari transaksi"
          />

          <div className="filter-chips" role="group" aria-label="Filter tipe transaksi">
            <button
              type="button"
              className={`filter-chip ${typeFilter === 'semua' ? 'is-active' : ''}`}
              onClick={() => setTypeFilter('semua')}
            >
              Semua <span>{cashflow.length}</span>
            </button>
            <button
              type="button"
              className={`filter-chip ${typeFilter === 'masuk' ? 'is-active' : ''}`}
              onClick={() => setTypeFilter('masuk')}
            >
              Masuk{' '}
              <span>
                {cashflow.filter((entry) => entry.type === 'masuk').length}
              </span>
            </button>
            <button
              type="button"
              className={`filter-chip ${typeFilter === 'keluar' ? 'is-active' : ''}`}
              onClick={() => setTypeFilter('keluar')}
            >
              Keluar{' '}
              <span>
                {cashflow.filter((entry) => entry.type === 'keluar').length}
              </span>
            </button>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <EmptyState
            icon={WalletIcon}
            title="Belum ada transaksi"
            description="Catat pemasukan atau pengeluaran pertama bengkel Anda."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan</th>
                  <th className="hide-sm">Kategori</th>
                  <th>Tipe</th>
                  <th className="text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const isIncome = entry.type === 'masuk'

                  return (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.date)}</td>
                      <td>
                        <span className="cell-title">{entry.description}</span>
                        <span className="cell-sub">{entry.id}</span>
                      </td>
                      <td className="hide-sm">{entry.category}</td>
                      <td>
                        <Badge
                          tone={isIncome ? 'success' : 'danger'}
                          dot
                        >
                          {isIncome ? 'Masuk' : 'Keluar'}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <strong
                          className={isIncome ? 'text-success' : 'text-danger'}
                        >
                          {isIncome ? '+' : '−'}
                          {formatCurrency(entry.amount)}
                        </strong>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className="table-footer">
          <span>
            Menampilkan {filteredEntries.length} dari {cashflow.length}{' '}
            transaksi
          </span>
          <span>
            Saldo bulan ini: <strong>{formatCurrency(balance)}</strong>
          </span>
        </footer>
      </section>

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="Catat transaksi"
        description="Tambahkan pemasukan atau pengeluaran ke buku kas bengkel."
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              Batal
            </Button>
            <Button type="submit" form="cashflow-form">
              Simpan transaksi
            </Button>
          </>
        }
      >
        <form id="cashflow-form" className="form-grid" onSubmit={handleSubmit}>
          {formError && (
            <p className="form-error form-field-full" role="alert">
              {formError}
            </p>
          )}

          <label className="form-field">
            <span>Tipe transaksi</span>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="masuk">Pemasukan</option>
              <option value="keluar">Pengeluaran</option>
            </select>
          </label>

          <label className="form-field">
            <span>Tanggal</span>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Kategori</span>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Nominal (Rp)</span>
            <input
              type="number"
              name="amount"
              min="0"
              step="1000"
              value={form.amount}
              onChange={handleChange}
              placeholder="500000"
              required
            />
          </label>

          <label className="form-field form-field-full">
            <span>Keterangan</span>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Contoh: pembelian oli dan filter"
              required
            />
          </label>

          <p className="form-note form-field-full">
            {form.type === 'masuk' ? (
              <ArrowUpRightIcon size={15} />
            ) : (
              <ArrowDownRightIcon size={15} />
            )}
            {form.type === 'masuk'
              ? 'Transaksi ini akan menambah saldo kas bengkel.'
              : 'Transaksi ini akan mengurangi saldo kas bengkel.'}
          </p>
        </form>
      </Modal>
    </div>
  )
}
