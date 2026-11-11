import { useMemo, useState } from 'react'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import SearchField from '../components/ui/SearchField'
import StatCard from '../components/ui/StatCard'
import Button from '../components/Button'
import {
  CheckCircleIcon,
  CircleDollarIcon,
  ClockIcon,
  CreditCardIcon,
  PlusIcon,
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
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../utils/status'

const EMPTY_FORM = {
  orderId: '',
  amount: '',
  method: PAYMENT_METHODS[0],
  status: 'lunas',
  paidAt: formatDateInput(),
}

export default function Payments() {
  const { payments, orders, customers, addPayment, settlePayment } = useAppData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const thisMonth = currentMonthKey()
  const paidThisMonth = payments.filter(
    (payment) =>
      payment.status === 'lunas' && monthKey(payment.paidAt) === thisMonth,
  )
  const pendingPayments = payments.filter(
    (payment) => payment.status === 'pending',
  )

  const payableOrders = orders.filter(
    (order) =>
      order.status === 'selesai' &&
      !payments.some((payment) => payment.orderId === order.id),
  )

  const filteredPayments = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return [...payments]
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
      .filter((payment) => {
        if (statusFilter !== 'semua' && payment.status !== statusFilter) {
          return false
        }
        if (!keyword) return true

        const customer = customers.find(
          (item) => item.id === payment.customerId,
        )

        return [payment.id, payment.orderId, payment.method, customer?.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword))
      })
  }, [payments, customers, search, statusFilter])

  function customerName(customerId) {
    return customers.find((customer) => customer.id === customerId)?.name ?? '-'
  }

  function openCreate() {
    setForm({
      ...EMPTY_FORM,
      paidAt: formatDateInput(),
      orderId: payableOrders[0]?.id ?? '',
      amount: payableOrders[0] ? String(payableOrders[0].estimate) : '',
    })
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
    setForm((previous) => ({ ...previous, [name]: value }))
    if (formError) setFormError('')
  }

  function handleOrderChange(event) {
    const orderId = event.target.value
    const order = orders.find((item) => item.id === orderId)

    setForm((previous) => ({
      ...previous,
      orderId,
      amount: order ? String(order.estimate) : '',
    }))
    if (formError) setFormError('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.orderId) {
      setFormError('Pilih order yang akan dibayar.')
      return
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setFormError('Nominal pembayaran harus lebih dari nol.')
      return
    }

    const order = orders.find((item) => item.id === form.orderId)

    addPayment({
      orderId: form.orderId,
      customerId: order?.customerId ?? '',
      amount: Number(form.amount),
      method: form.method,
      status: form.status,
      paidAt: form.paidAt,
    })

    closeCreate()
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Keuangan"
        title="Pembayaran"
        description="Catat pembayaran order, pantau tagihan yang belum lunas, dan rapikan penerimaan bengkel."
        actions={
          <Button className="btn-sm" onClick={openCreate}>
            <PlusIcon size={16} /> Catat pembayaran
          </Button>
        }
      />

      <div className="stats-grid">
        <StatCard
          icon={CircleDollarIcon}
          label="Lunas bulan ini"
          value={formatCurrency(
            paidThisMonth.reduce((sum, payment) => sum + Number(payment.amount), 0),
          )}
          hint={`${paidThisMonth.length} transaksi`}
          tone="emerald"
        />
        <StatCard
          icon={ClockIcon}
          label="Menunggu pembayaran"
          value={formatCurrency(
            pendingPayments.reduce(
              (sum, payment) => sum + Number(payment.amount),
              0,
            ),
          )}
          hint={`${pendingPayments.length} tagihan pending`}
          tone="warning"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Transaksi lunas"
          value={payments.filter((payment) => payment.status === 'lunas').length}
          hint="Total sepanjang data demo"
          tone="blue"
        />
        <StatCard
          icon={WalletIcon}
          label="Rata-rata transaksi"
          value={formatCurrency(
            payments.length > 0
              ? payments.reduce(
                  (sum, payment) => sum + Number(payment.amount),
                  0,
                ) / payments.length
              : 0,
          )}
          hint="Dari seluruh transaksi"
          tone="violet"
        />
      </div>

      <section className="card">
        <div className="toolbar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Cari ID pembayaran, order, atau pelanggan..."
            label="Cari pembayaran"
          />

          <div className="filter-chips" role="group" aria-label="Filter status pembayaran">
            <button
              type="button"
              className={`filter-chip ${statusFilter === 'semua' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('semua')}
            >
              Semua <span>{payments.length}</span>
            </button>
            {Object.entries(PAYMENT_STATUS).map(([key, status]) => (
              <button
                type="button"
                key={key}
                className={`filter-chip ${statusFilter === key ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(key)}
              >
                {status.label}{' '}
                <span>
                  {payments.filter((payment) => payment.status === key).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <EmptyState
            icon={CreditCardIcon}
            title="Belum ada pembayaran"
            description="Pembayaran akan muncul di sini setelah order selesai ditagihkan."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Pembayaran</th>
                  <th>Order</th>
                  <th className="hide-md">Pelanggan</th>
                  <th className="hide-sm">Metode</th>
                  <th className="hide-sm">Tanggal</th>
                  <th className="text-right">Nominal</th>
                  <th>Status</th>
                  <th aria-label="Aksi" />
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const status = PAYMENT_STATUS[payment.status]

                  return (
                    <tr key={payment.id}>
                      <td>
                        <span className="cell-title">{payment.id}</span>
                      </td>
                      <td>{payment.orderId}</td>
                      <td className="hide-md">
                        {customerName(payment.customerId)}
                      </td>
                      <td className="hide-sm">{payment.method}</td>
                      <td className="hide-sm">{formatDate(payment.paidAt)}</td>
                      <td className="text-right">
                        <strong>{formatCurrency(payment.amount)}</strong>
                      </td>
                      <td>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="text-right">
                        {payment.status === 'pending' ? (
                          <Button
                            variant="ghost"
                            className="btn-xs"
                            onClick={() => settlePayment(payment.id)}
                          >
                            Tandai lunas
                          </Button>
                        ) : (
                          <span className="cell-sub">—</span>
                        )}
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
            Menampilkan {filteredPayments.length} dari {payments.length}{' '}
            pembayaran
          </span>
          <span>{formatCurrency(payments.reduce((sum, payment) => sum + Number(payment.amount), 0))} total tercatat</span>
        </footer>
      </section>

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="Catat pembayaran"
        description="Pilih order yang sudah selesai, lalu masukkan nominal dan metode pembayaran."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              Batal
            </Button>
            <Button
              type="submit"
              form="payment-form"
              disabled={payableOrders.length === 0}
            >
              Simpan pembayaran
            </Button>
          </>
        }
      >
        <form id="payment-form" className="form-grid" onSubmit={handleSubmit}>
          {formError && (
            <p className="form-error form-field-full" role="alert">
              {formError}
            </p>
          )}

          {payableOrders.length === 0 && (
            <p className="form-note form-field-full">
              <ClockIcon size={15} />
              Semua order yang selesai sudah punya pembayaran lunas. Selesaikan
              order lain terlebih dahulu.
            </p>
          )}

          <label className="form-field form-field-full">
            <span>Order yang dibayar</span>
            <select
              name="orderId"
              value={form.orderId}
              onChange={handleOrderChange}
              required
            >
              <option value="">Pilih order</option>
              {payableOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} — {customerName(order.customerId)} —{' '}
                  {order.vehicle.plate}
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
              placeholder="750000"
              required
            />
          </label>

          <label className="form-field">
            <span>Metode pembayaran</span>
            <select name="method" value={form.method} onChange={handleChange}>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Tanggal bayar</span>
            <input
              type="date"
              name="paidAt"
              value={form.paidAt}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="lunas">Lunas</option>
              <option value="pending">Pending</option>
            </select>
          </label>
        </form>
      </Modal>
    </div>
  )
}
