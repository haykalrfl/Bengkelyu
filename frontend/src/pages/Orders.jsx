import { useMemo, useState } from 'react'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import SearchField from '../components/ui/SearchField'
import Button from '../components/Button'
import {
  CarIcon,
  ChevronRightIcon,
  ClipboardIcon,
  PlusIcon,
  WrenchIcon,
} from '../components/Icons'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency, formatDate } from '../utils/format'
import {
  ORDER_STATUS,
  ORDER_STATUS_OPTIONS,
  PRIORITY,
  PRIORITY_OPTIONS,
} from '../utils/status'

const EMPTY_FORM = {
  customerId: '',
  mechanicId: '',
  complaint: '',
  priority: 'normal',
  estimate: '',
}

export default function ServiceOrders() {
  const { orders, customers, mechanics, addOrder, updateOrderStatus } =
    useAppData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const selectedOrder = orders.find((order) => order.id === selectedId) ?? null
  const selectedCustomer = customers.find(
    (customer) => customer.id === form.customerId,
  )

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return [...orders]
      .sort((a, b) => {
        if (a.createdAt === b.createdAt) return b.id.localeCompare(a.id)
        return b.createdAt.localeCompare(a.createdAt)
      })
      .filter((order) => {
        if (statusFilter !== 'semua' && order.status !== statusFilter) {
          return false
        }

        if (!keyword) return true

        const customer = customers.find(
          (item) => item.id === order.customerId,
        )
        const mechanic = mechanics.find(
          (item) => item.id === order.mechanicId,
        )

        return [
          order.id,
          order.vehicle?.plate,
          order.vehicle?.model,
          order.complaint,
          customer?.name,
          mechanic?.name,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword))
      })
  }, [orders, customers, mechanics, search, statusFilter])

  function customerName(customerId) {
    return customers.find((customer) => customer.id === customerId)?.name ?? '-'
  }

  function mechanicName(mechanicId) {
    return (
      mechanics.find((mechanic) => mechanic.id === mechanicId)?.name ?? '-'
    )
  }

  function openCreate() {
    setForm(EMPTY_FORM)
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

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.customerId) {
      setFormError('Pilih pelanggan terlebih dahulu.')
      return
    }

    if (!form.mechanicId) {
      setFormError('Pilih mekanik yang menangani order ini.')
      return
    }

    if (!form.complaint.trim()) {
      setFormError('Tuliskan keluhan atau pekerjaan yang diminta.')
      return
    }

    if (!form.estimate || Number(form.estimate) <= 0) {
      setFormError('Estimasi biaya harus lebih dari nol.')
      return
    }

    const customer = customers.find((item) => item.id === form.customerId)

    addOrder({
      customerId: form.customerId,
      mechanicId: form.mechanicId,
      vehicle: {
        plate: customer?.vehicle?.plate ?? '-',
        model: customer?.vehicle?.model ?? '-',
      },
      complaint: form.complaint.trim(),
      priority: form.priority,
      estimate: Number(form.estimate),
      status: 'antri',
    })

    closeCreate()
  }

  function handleStatusChange(event) {
    if (!selectedOrder) return
    updateOrderStatus(selectedOrder.id, event.target.value)
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Operasional"
        title="Order servis"
        description="Catat pekerjaan masuk, atur mekanik, dan pantau progres servis sampai dibayar."
        actions={
          <Button className="btn-sm" onClick={openCreate}>
            <PlusIcon size={16} /> Order baru
          </Button>
        }
      />

      <section className="card">
        <div className="toolbar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Cari order, pelanggan, plat, atau mekanik..."
            label="Cari order servis"
          />

          <div className="filter-chips" role="group" aria-label="Filter status order">
            <button
              type="button"
              className={`filter-chip ${statusFilter === 'semua' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('semua')}
            >
              Semua <span>{orders.length}</span>
            </button>

            {ORDER_STATUS_OPTIONS.map((status) => {
              const count = orders.filter(
                (order) => order.status === status.value,
              ).length

              return (
                <button
                  type="button"
                  key={status.value}
                  className={`filter-chip ${statusFilter === status.value ? 'is-active' : ''}`}
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label} <span>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={ClipboardIcon}
            title="Tidak ada order yang cocok"
            description="Coba ubah kata kunci atau filter status, atau buat order servis baru."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Pelanggan</th>
                  <th className="hide-md">Kendaraan</th>
                  <th className="hide-sm">Mekanik</th>
                  <th>Status</th>
                  <th className="text-right">Estimasi</th>
                  <th aria-label="Aksi" />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const status = ORDER_STATUS[order.status]

                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="cell-title">{order.id}</span>
                        <span className="cell-sub">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td>
                        <span className="cell-title">
                          {customerName(order.customerId)}
                        </span>
                        <span className="cell-sub">
                          {customers.find(
                            (customer) => customer.id === order.customerId,
                          )?.phone ?? '-'}
                        </span>
                      </td>
                      <td className="hide-md">
                        <span className="cell-title">
                          {order.vehicle.model}
                        </span>
                        <span className="cell-sub">{order.vehicle.plate}</span>
                      </td>
                      <td className="hide-sm">
                        {mechanicName(order.mechanicId)}
                      </td>
                      <td>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="text-right">
                        <strong>{formatCurrency(order.estimate)}</strong>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setSelectedId(order.id)}
                          aria-label={`Lihat detail ${order.id}`}
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

        <footer className="table-footer">
          <span>
            Menampilkan {filteredOrders.length} dari {orders.length} order
          </span>
          <span>
            {orders.filter((order) => order.status === 'dikerjakan').length}{' '}
            sedang dikerjakan
          </span>
        </footer>
      </section>

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="Buat order servis"
        description="Isi data pelanggan, kendaraan, dan mekanik yang menangani."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              Batal
            </Button>
            <Button type="submit" form="order-form">
              Simpan order
            </Button>
          </>
        }
      >
        <form id="order-form" className="form-grid" onSubmit={handleSubmit}>
          {formError && (
            <p className="form-error form-field-full" role="alert">
              {formError}
            </p>
          )}

          <label className="form-field">
            <span>Pelanggan</span>
            <select
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              required
            >
              <option value="">Pilih pelanggan</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} — {customer.vehicle?.plate}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Mekanik</span>
            <select
              name="mechanicId"
              value={form.mechanicId}
              onChange={handleChange}
              required
            >
              <option value="">Pilih mekanik</option>
              {mechanics
                .filter((mechanic) => mechanic.status === 'aktif')
                .map((mechanic) => (
                  <option key={mechanic.id} value={mechanic.id}>
                    {mechanic.name} — {mechanic.specialty}
                  </option>
                ))}
            </select>
          </label>

          <label className="form-field form-field-full">
            <span>Kendaraan</span>
            <div className="form-readonly">
              <CarIcon size={17} />
              {selectedCustomer
                ? `${selectedCustomer.vehicle?.model} — ${selectedCustomer.vehicle?.plate}`
                : 'Pilih pelanggan untuk melihat kendaraan'}
            </div>
          </label>

          <label className="form-field form-field-full">
            <span>Keluhan / pekerjaan</span>
            <textarea
              name="complaint"
              rows={3}
              value={form.complaint}
              onChange={handleChange}
              placeholder="Contoh: servis rutin 40.000 km, ganti oli dan filter udara."
              required
            />
          </label>

          <label className="form-field">
            <span>Prioritas</span>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Estimasi biaya (Rp)</span>
            <input
              type="number"
              name="estimate"
              min="0"
              step="1000"
              inputMode="numeric"
              value={form.estimate}
              onChange={handleChange}
              placeholder="850000"
              required
            />
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedId(null)}
        title={selectedOrder ? `Detail ${selectedOrder.id}` : 'Detail order'}
        description={
          selectedOrder
            ? `${selectedOrder.vehicle.model} — ${selectedOrder.vehicle.plate}`
            : undefined
        }
        footer={
          <Button variant="ghost" onClick={() => setSelectedId(null)}>
            Tutup
          </Button>
        }
      >
        {selectedOrder && (
          <div className="detail-stack">
            <div className="detail-hero">
              <div>
                <span className="detail-label">Status saat ini</span>
                <Badge tone={ORDER_STATUS[selectedOrder.status].tone}>
                  {ORDER_STATUS[selectedOrder.status].label}
                </Badge>
              </div>
              <div className="detail-hero-amount">
                <span className="detail-label">Estimasi</span>
                <strong>{formatCurrency(selectedOrder.estimate)}</strong>
              </div>
            </div>

            <dl className="detail-grid">
              <div>
                <dt>Pelanggan</dt>
                <dd>{customerName(selectedOrder.customerId)}</dd>
              </div>
              <div>
                <dt>Mekanik</dt>
                <dd>{mechanicName(selectedOrder.mechanicId)}</dd>
              </div>
              <div>
                <dt>Kendaraan</dt>
                <dd>
                  {selectedOrder.vehicle.model} — {selectedOrder.vehicle.plate}
                </dd>
              </div>
              <div>
                <dt>Prioritas</dt>
                <dd>{PRIORITY[selectedOrder.priority]?.label ?? '-'}</dd>
              </div>
              <div>
                <dt>Tanggal masuk</dt>
                <dd>{formatDate(selectedOrder.createdAt, 'long')}</dd>
              </div>
              <div>
                <dt>ID order</dt>
                <dd>{selectedOrder.id}</dd>
              </div>
            </dl>

            <div className="detail-block">
              <span className="detail-label">Keluhan / pekerjaan</span>
              <p>{selectedOrder.complaint}</p>
            </div>

            <label className="form-field">
              <span>Ubah status order</span>
              <select
                value={selectedOrder.status}
                onChange={handleStatusChange}
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <p className="form-note">
              <WrenchIcon size={15} />
              Perubahan status langsung tersimpan di data demo dan akan
              tercermin pada dashboard.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
