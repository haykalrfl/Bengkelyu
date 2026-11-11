import { useMemo, useState } from 'react'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Button from '../components/Button'
import {
  CheckCircleIcon,
  ClipboardIcon,
  PhoneIcon,
  PlusIcon,
  TrendingUpIcon,
  WrenchIcon,
} from '../components/Icons'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency, formatDate } from '../utils/format'
import { ORDER_STATUS } from '../utils/status'

const SPECIALTIES = [
  'Mesin & transmisi',
  'Kelistrikan & AC',
  'Kaki-kaki & rem',
  'Body & cat',
  'Servis umum',
]

const EMPTY_FORM = {
  name: '',
  specialty: SPECIALTIES[0],
  phone: '',
  status: 'aktif',
}

export default function Mechanics() {
  const { mechanics, orders, addMechanic, toggleMechanicStatus } = useAppData()
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const activeMechanics = mechanics.filter(
    (mechanic) => mechanic.status === 'aktif',
  )
  const activeOrders = orders.filter(
    (order) => order.status === 'antri' || order.status === 'dikerjakan',
  )
  const averageRating = useMemo(() => {
    const rated = mechanics.filter((mechanic) => Number(mechanic.rating) > 0)
    if (rated.length === 0) return 0

    return (
      rated.reduce((sum, mechanic) => sum + Number(mechanic.rating), 0) /
      rated.length
    )
  }, [mechanics])

  function jobsFor(mechanicId) {
    return orders.filter(
      (order) =>
        order.mechanicId === mechanicId &&
        (order.status === 'antri' || order.status === 'dikerjakan'),
    )
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
    if (!form.name.trim()) nextErrors.name = 'Nama mekanik wajib diisi.'
    if (!form.phone.trim()) nextErrors.phone = 'Nomor HP wajib diisi.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    addMechanic({
      name: form.name.trim(),
      specialty: form.specialty,
      phone: form.phone.trim(),
      status: form.status,
    })

    closeCreate()
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Operasional"
        title="Mekanik"
        description="Kelola tim mekanik, lihat beban kerja, dan atur siapa yang siap menerima order."
        actions={
          <Button className="btn-sm" onClick={openCreate}>
            <PlusIcon size={16} /> Tambah mekanik
          </Button>
        }
      />

      <div className="stats-grid">
        <StatCard
          icon={WrenchIcon}
          label="Total mekanik"
          value={mechanics.length}
          hint={`${mechanics.length - activeMechanics.length} sedang libur`}
          tone="violet"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Mekanik aktif"
          value={activeMechanics.length}
          hint="Siap menerima order"
          tone="emerald"
        />
        <StatCard
          icon={ClipboardIcon}
          label="Order ditangani"
          value={activeOrders.length}
          hint="Antri dan dikerjakan"
          tone="brand"
        />
        <StatCard
          icon={TrendingUpIcon}
          label="Rating rata-rata"
          value={averageRating.toFixed(1)}
          hint="Dari penilaian pelanggan"
          tone="blue"
        />
      </div>

      {mechanics.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={WrenchIcon}
            title="Belum ada mekanik"
            description="Tambahkan mekanik pertama untuk mulai menerima order servis."
          />
        </section>
      ) : (
        <div className="mechanics-grid">
          {mechanics.map((mechanic) => {
            const jobs = jobsFor(mechanic.id)
            const isActive = mechanic.status === 'aktif'

            return (
              <article className="mechanic-card" key={mechanic.id}>
                <header className="mechanic-card-head">
                  <Avatar name={mechanic.name} size="lg" />
                  <div className="mechanic-card-title">
                    <strong>{mechanic.name}</strong>
                    <span>{mechanic.specialty}</span>
                  </div>
                  <Badge tone={isActive ? 'success' : 'neutral'} dot>
                    {isActive ? 'Aktif' : 'Libur'}
                  </Badge>
                </header>

                <div className="mechanic-metrics">
                  <div>
                    <span>Order aktif</span>
                    <strong>{jobs.length}</strong>
                  </div>
                  <div>
                    <span>Rating</span>
                    <strong>
                      <span className="star">★</span>{' '}
                      {Number(mechanic.rating) > 0
                        ? Number(mechanic.rating).toFixed(1)
                        : '-'}
                    </strong>
                  </div>
                  <div>
                    <span>Bergabung</span>
                    <strong>{formatDate(mechanic.joinedAt)}</strong>
                  </div>
                </div>

                {jobs.length > 0 ? (
                  <ul className="mechanic-jobs">
                    {jobs.slice(0, 2).map((order) => (
                      <li key={order.id}>
                        <span>
                          <strong>{order.id}</strong>
                          <span>
                            {order.vehicle.model} — {order.vehicle.plate}
                          </span>
                        </span>
                        <span className="mechanic-job-right">
                          <Badge tone={ORDER_STATUS[order.status].tone}>
                            {ORDER_STATUS[order.status].label}
                          </Badge>
                          <span>{formatCurrency(order.estimate)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mechanic-empty">
                    Belum ada order aktif. Siap ditugaskan.
                  </p>
                )}

                <footer className="mechanic-card-foot">
                  <a className="phone-link" href={`tel:${mechanic.phone}`}>
                    <PhoneIcon size={15} />
                    {mechanic.phone}
                  </a>
                  <Button
                    variant="ghost"
                    className="btn-sm"
                    onClick={() => toggleMechanicStatus(mechanic.id)}
                  >
                    {isActive ? 'Set libur' : 'Aktifkan'}
                  </Button>
                </footer>
              </article>
            )
          })}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="Tambah mekanik"
        description="Daftarkan mekanik baru ke dalam tim bengkel."
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              Batal
            </Button>
            <Button type="submit" form="mechanic-form">
              Simpan mekanik
            </Button>
          </>
        }
      >
        <form id="mechanic-form" className="form-grid" onSubmit={handleSubmit}>
          <label className={`form-field form-field-full ${errors.name ? 'has-error' : ''}`}>
            <span>Nama lengkap</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama mekanik"
              autoFocus
              required
            />
            {errors.name && <small className="form-hint-error">{errors.name}</small>}
          </label>

          <label className="form-field">
            <span>Spesialisasi</span>
            <select
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
            >
              {SPECIALTIES.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
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

          <label className="form-field form-field-full">
            <span>Status awal</span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="aktif">Aktif — siap menerima order</option>
              <option value="libur">Libur — belum bisa ditugaskan</option>
            </select>
          </label>
        </form>
      </Modal>
    </div>
  )
}
