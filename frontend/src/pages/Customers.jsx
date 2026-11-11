import { useMemo, useState } from 'react'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import SearchField from '../components/ui/SearchField'
import Button from '../components/Button'
import {
  CarIcon,
  ChevronRightIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  UsersIcon,
} from '../components/Icons'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency, formatDate, relativeDay } from '../utils/format'
import { ORDER_STATUS } from '../utils/status'

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  address: '',
  plate: '',
  model: '',
  year: '',
}

const CURRENT_YEAR = new Date().getFullYear()

export default function Customers() {
  const { customers, orders, payments, addCustomer } = useAppData()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedId) ?? null

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return customers

    return customers.filter((customer) =>
      [
        customer.name,
        customer.phone,
        customer.email,
        customer.vehicle?.plate,
        customer.vehicle?.model,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    )
  }, [customers, search])

  function ordersFor(customerId) {
    return orders.filter((order) => order.customerId === customerId)
  }

  function spentFor(customerId) {
    return payments
      .filter(
        (payment) =>
          payment.customerId === customerId && payment.status === 'lunas',
      )
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
  }

  function lastVisitFor(customerId) {
    const dates = ordersFor(customerId)
      .map((order) => order.createdAt)
      .sort((a, b) => b.localeCompare(a))

    return dates[0]
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setErrors({})
    setCreateOpen(true)
  }

  function closeCreate() {
    setCreateOpen(false)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => {
      if (!previous[name]) return previous
      const next = { ...previous }
      delete next[name]
      return next
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Nama wajib diisi.'
    if (!form.phone.trim()) nextErrors.phone = 'Nomor HP wajib diisi.'
    if (!form.plate.trim()) nextErrors.plate = 'Plat nomor wajib diisi.'
    if (!form.model.trim()) nextErrors.model = 'Model kendaraan wajib diisi.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    addCustomer({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      vehicle: {
        plate: form.plate.trim().toUpperCase(),
        model: form.model.trim(),
        year: form.year ? Number(form.year) : null,
      },
      notes: '',
    })

    closeCreate()
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Operasional"
        title="Pelanggan"
        description="Simpan data pelanggan dan kendaraannya agar order berikutnya lebih cepat dibuat."
        actions={
          <Button className="btn-sm" onClick={openCreate}>
            <PlusIcon size={16} /> Pelanggan baru
          </Button>
        }
      />

      <section className="card">
        <div className="toolbar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Cari nama, nomor HP, atau plat nomor..."
            label="Cari pelanggan"
          />
          <span className="toolbar-meta">
            {filteredCustomers.length} dari {customers.length} pelanggan
          </span>
        </div>

        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Pelanggan tidak ditemukan"
            description="Coba kata kunci lain, atau tambahkan pelanggan baru."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th className="hide-md">Kontak</th>
                  <th>Kendaraan</th>
                  <th className="text-center">Order</th>
                  <th className="hide-sm">Kunjungan terakhir</th>
                  <th className="text-right">Total belanja</th>
                  <th aria-label="Aksi" />
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const customerOrders = ordersFor(customer.id)
                  const lastVisit = lastVisitFor(customer.id)

                  return (
                    <tr key={customer.id}>
                      <td>
                        <div className="person-cell">
                          <Avatar name={customer.name} size="sm" />
                          <span>
                            <span className="cell-title">
                              {customer.name}
                            </span>
                            <span className="cell-sub">{customer.email}</span>
                          </span>
                        </div>
                      </td>
                      <td className="hide-md">{customer.phone}</td>
                      <td>
                        <span className="cell-title">
                          {customer.vehicle?.model}
                        </span>
                        <span className="cell-sub">
                          {customer.vehicle?.plate}
                        </span>
                      </td>
                      <td className="text-center">{customerOrders.length}</td>
                      <td className="hide-sm">
                        {lastVisit ? relativeDay(lastVisit) : '-'}
                      </td>
                      <td className="text-right">
                        <strong>{formatCurrency(spentFor(customer.id))}</strong>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setSelectedId(customer.id)}
                          aria-label={`Lihat detail ${customer.name}`}
                        >
                          <ChevronRightIcon size={17} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="Tambah pelanggan"
        description="Data kendaraan ikut disimpan supaya order servis berikutnya lebih cepat."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              Batal
            </Button>
            <Button type="submit" form="customer-form">
              Simpan pelanggan
            </Button>
          </>
        }
      >
        <form id="customer-form" className="form-grid" onSubmit={handleSubmit}>
          <label className={`form-field ${errors.name ? 'has-error' : ''}`}>
            <span>Nama lengkap</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama pelanggan"
              autoFocus
              required
            />
            {errors.name && <small className="form-hint-error">{errors.name}</small>}
          </label>

          <label className={`form-field ${errors.phone ? 'has-error' : ''}`}>
            <span>Nomor HP</span>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0812-3456-7890"
              inputMode="tel"
              required
            />
            {errors.phone && (
              <small className="form-hint-error">{errors.phone}</small>
            )}
          </label>

          <label className="form-field">
            <span>Email (opsional)</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@email.com"
            />
          </label>

          <label className="form-field">
            <span>Alamat (opsional)</span>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Alamat pelanggan"
            />
          </label>

          <div className="form-divider form-field-full">
            <CarIcon size={16} /> Data kendaraan
          </div>

          <label className={`form-field ${errors.plate ? 'has-error' : ''}`}>
            <span>Plat nomor</span>
            <input
              name="plate"
              value={form.plate}
              onChange={handleChange}
              placeholder="B 1234 XYZ"
              required
            />
            {errors.plate && (
              <small className="form-hint-error">{errors.plate}</small>
            )}
          </label>

          <label className={`form-field ${errors.model ? 'has-error' : ''}`}>
            <span>Model kendaraan</span>
            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="Toyota Avanza"
              required
            />
            {errors.model && (
              <small className="form-hint-error">{errors.model}</small>
            )}
          </label>

          <label className="form-field">
            <span>Tahun (opsional)</span>
            <input
              type="number"
              name="year"
              min="1980"
              max={CURRENT_YEAR + 1}
              value={form.year}
              onChange={handleChange}
              placeholder="2020"
            />
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedId(null)}
        title={selectedCustomer?.name ?? 'Detail pelanggan'}
        description={
          selectedCustomer
            ? `${selectedCustomer.vehicle?.model} — ${selectedCustomer.vehicle?.plate}`
            : undefined
        }
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setSelectedId(null)}>
            Tutup
          </Button>
        }
      >
        {selectedCustomer && (
          <div className="detail-stack">
            <div className="profile-summary">
              <Avatar name={selectedCustomer.name} size="lg" />
              <div>
                <strong>{selectedCustomer.name}</strong>
                <span>Pelanggan sejak {formatDate(selectedCustomer.joinedAt)}</span>
              </div>
              <div className="profile-summary-metric">
                <span>Total belanja</span>
                <strong>{formatCurrency(spentFor(selectedCustomer.id))}</strong>
              </div>
            </div>

            <div className="info-list">
              <span>
                <PhoneIcon size={15} />
                {selectedCustomer.phone}
              </span>
              <span>
                <UsersIcon size={15} />
                {selectedCustomer.email || 'Email belum diisi'}
              </span>
              <span>
                <MapPinIcon size={15} />
                {selectedCustomer.address || 'Alamat belum diisi'}
              </span>
              <span>
                <CarIcon size={15} />
                {selectedCustomer.vehicle?.model} —{' '}
                {selectedCustomer.vehicle?.plate}
                {selectedCustomer.vehicle?.year
                  ? ` (${selectedCustomer.vehicle.year})`
                  : ''}
              </span>
            </div>

            {selectedCustomer.notes && (
              <div className="detail-block">
                <span className="detail-label">Catatan</span>
                <p>{selectedCustomer.notes}</p>
              </div>
            )}

            <div>
              <span className="detail-label">
                Riwayat order ({ordersFor(selectedCustomer.id).length})
              </span>

              {ordersFor(selectedCustomer.id).length === 0 ? (
                <p className="inline-empty">
                  Belum ada order servis untuk pelanggan ini.
                </p>
              ) : (
                <ul className="history-list">
                  {ordersFor(selectedCustomer.id)
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((order) => (
                      <li key={order.id}>
                        <div>
                          <strong>{order.id}</strong>
                          <span>
                            {order.complaint.length > 64
                              ? `${order.complaint.slice(0, 64)}...`
                              : order.complaint}
                          </span>
                        </div>
                        <div className="history-meta">
                          <Badge tone={ORDER_STATUS[order.status].tone}>
                            {ORDER_STATUS[order.status].label}
                          </Badge>
                          <strong>{formatCurrency(order.estimate)}</strong>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
