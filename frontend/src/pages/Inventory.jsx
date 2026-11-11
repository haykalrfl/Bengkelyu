import { useMemo, useState } from 'react'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import SearchField from '../components/ui/SearchField'
import StatCard from '../components/ui/StatCard'
import Button from '../components/Button'
import {
  AlertTriangleIcon,
  BoxIcon,
  CircleDollarIcon,
  FilterIcon,
  PlusIcon,
} from '../components/Icons'
import { useAppData } from '../hooks/useAppData'
import { formatCurrency, formatNumber } from '../utils/format'
import { STOCK_STATUS, stockStatus } from '../utils/status'

const CATEGORIES = [
  'Pelumas',
  'Filter',
  'Rem',
  'Kelistrikan',
  'Kaki-kaki',
  'Mesin',
  'AC',
  'Body',
  'Lainnya',
]

const EMPTY_FORM = {
  name: '',
  sku: '',
  category: CATEGORIES[0],
  stock: '',
  minStock: '',
  price: '',
  unit: 'pcs',
}

export default function Inventory() {
  const { inventory, addInventoryItem, adjustStock } = useAppData()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('semua')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const lowStock = inventory.filter(
    (item) => Number(item.stock) <= Number(item.minStock),
  )
  const stockValue = inventory.reduce(
    (sum, item) => sum + Number(item.stock) * Number(item.price),
    0,
  )
  const categories = new Set(inventory.map((item) => item.category))

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return inventory
      .filter((item) => {
        if (category !== 'semua' && item.category !== category) return false
        if (!keyword) return true

        return [item.name, item.sku, item.category].some((value) =>
          String(value).toLowerCase().includes(keyword),
        )
      })
      .sort((a, b) => {
        const aLow = Number(a.stock) <= Number(a.minStock) ? 0 : 1
        const bLow = Number(b.stock) <= Number(b.minStock) ? 0 : 1
        if (aLow !== bLow) return aLow - bLow
        return a.name.localeCompare(b.name)
      })
  }, [inventory, search, category])

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
    if (!form.name.trim()) nextErrors.name = 'Nama sparepart wajib diisi.'
    if (!form.sku.trim()) nextErrors.sku = 'SKU wajib diisi.'
    if (form.stock === '' || Number(form.stock) < 0) {
      nextErrors.stock = 'Stok tidak boleh negatif.'
    }
    if (form.minStock === '' || Number(form.minStock) < 0) {
      nextErrors.minStock = 'Stok minimum tidak boleh negatif.'
    }
    if (!form.price || Number(form.price) <= 0) {
      nextErrors.price = 'Harga harus lebih dari nol.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    addInventoryItem({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category,
      stock: Number(form.stock),
      minStock: Number(form.minStock),
      price: Number(form.price),
      unit: form.unit.trim() || 'pcs',
    })

    closeCreate()
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Inventori"
        title="Sparepart"
        description="Kontrol stok sparepart, pantau nilai persediaan, dan ketahui item yang perlu segera dibeli."
        actions={
          <Button className="btn-sm" onClick={openCreate}>
            <PlusIcon size={16} /> Tambah sparepart
          </Button>
        }
      />

      <div className="stats-grid">
        <StatCard
          icon={BoxIcon}
          label="Jenis sparepart"
          value={inventory.length}
          hint={`${categories.size} kategori`}
          tone="blue"
        />
        <StatCard
          icon={AlertTriangleIcon}
          label="Stok menipis"
          value={lowStock.length}
          hint="Item di bawah stok minimum"
          tone={lowStock.length > 0 ? 'danger' : 'emerald'}
        />
        <StatCard
          icon={CircleDollarIcon}
          label="Nilai persediaan"
          value={formatCurrency(stockValue)}
          hint="Harga beli × stok tersedia"
          tone="brand"
        />
        <StatCard
          icon={FilterIcon}
          label="Kategori aktif"
          value={categories.size}
          hint="Kategori yang punya stok"
          tone="violet"
        />
      </div>

      <section className="card">
        <div className="toolbar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Cari nama sparepart atau SKU..."
            label="Cari sparepart"
          />

          <label className="select-field">
            <span className="sr-only">Filter kategori</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="semua">Semua kategori</option>
              {[...categories].sort().map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            icon={BoxIcon}
            title="Sparepart tidak ditemukan"
            description="Coba kata kunci lain atau tambahkan sparepart baru."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Sparepart</th>
                  <th className="hide-sm">Kategori</th>
                  <th className="text-right">Harga</th>
                  <th>Stok</th>
                  <th>Status</th>
                  <th className="text-right">Nilai stok</th>
                  <th className="text-center">Penyesuaian</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = stockStatus(item)
                  const ratio = Math.min(
                    100,
                    Math.round(
                      (Number(item.stock) /
                        Math.max(1, Number(item.minStock) * 2)) *
                        100,
                    ),
                  )

                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="cell-title">{item.name}</span>
                        <span className="cell-sub">{item.sku}</span>
                      </td>
                      <td className="hide-sm">{item.category}</td>
                      <td className="text-right">{formatCurrency(item.price)}</td>
                      <td>
                        <div className="stock-cell">
                          <span>
                            {formatNumber(item.stock)} {item.unit}
                          </span>
                          <div className="stock-track stock-track-sm">
                            <span
                              className={`stock-fill ${
                                status.tone === 'danger'
                                  ? 'is-empty-stock'
                                  : status.tone === 'warning'
                                    ? 'is-low'
                                    : ''
                              }`}
                              style={{ width: `${Math.max(4, ratio)}%` }}
                            />
                          </div>
                          <span className="stock-min">
                            min. {item.minStock} {item.unit}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="text-right">
                        {formatCurrency(Number(item.stock) * Number(item.price))}
                      </td>
                      <td>
                        <div className="stock-actions">
                          <button
                            type="button"
                            className="stock-btn"
                            onClick={() => adjustStock(item.id, -1)}
                            disabled={Number(item.stock) <= 0}
                            aria-label={`Kurangi stok ${item.name}`}
                          >
                            −
                          </button>
                          <button
                            type="button"
                            className="stock-btn"
                            onClick={() => adjustStock(item.id, 1)}
                            aria-label={`Tambah stok ${item.name}`}
                          >
                            +
                          </button>
                        </div>
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
            Menampilkan {filteredItems.length} dari {inventory.length} sparepart
          </span>
          <span className="table-footer-legend">
            {Object.entries(STOCK_STATUS).map(([key, value]) => (
              <span key={key}>
                <span className={`legend-dot legend-${value.tone}`} />
                {value.label}
              </span>
            ))}
          </span>
        </footer>
      </section>

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="Tambah sparepart"
        description="Masukkan data sparepart baru ke gudang bengkel."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              Batal
            </Button>
            <Button type="submit" form="inventory-form">
              Simpan sparepart
            </Button>
          </>
        }
      >
        <form id="inventory-form" className="form-grid" onSubmit={handleSubmit}>
          <label className={`form-field form-field-full ${errors.name ? 'has-error' : ''}`}>
            <span>Nama sparepart</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Oli Mesin Shell Helix 5W-30 4L"
              autoFocus
              required
            />
            {errors.name && <small className="form-hint-error">{errors.name}</small>}
          </label>

          <label className={`form-field ${errors.sku ? 'has-error' : ''}`}>
            <span>SKU</span>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="OLI-003"
              required
            />
            {errors.sku && <small className="form-hint-error">{errors.sku}</small>}
          </label>

          <label className="form-field">
            <span>Kategori</span>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className={`form-field ${errors.stock ? 'has-error' : ''}`}>
            <span>Stok awal</span>
            <input
              type="number"
              name="stock"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="12"
              required
            />
            {errors.stock && (
              <small className="form-hint-error">{errors.stock}</small>
            )}
          </label>

          <label className={`form-field ${errors.minStock ? 'has-error' : ''}`}>
            <span>Stok minimum</span>
            <input
              type="number"
              name="minStock"
              min="0"
              value={form.minStock}
              onChange={handleChange}
              placeholder="6"
              required
            />
            {errors.minStock && (
              <small className="form-hint-error">{errors.minStock}</small>
            )}
          </label>

          <label className={`form-field ${errors.price ? 'has-error' : ''}`}>
            <span>Harga satuan (Rp)</span>
            <input
              type="number"
              name="price"
              min="0"
              step="1000"
              value={form.price}
              onChange={handleChange}
              placeholder="150000"
              required
            />
            {errors.price && (
              <small className="form-hint-error">{errors.price}</small>
            )}
          </label>

          <label className="form-field">
            <span>Satuan</span>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="pcs / botol / set"
            />
          </label>
        </form>
      </Modal>
    </div>
  )
}
