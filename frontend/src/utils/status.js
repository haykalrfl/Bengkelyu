export const ORDER_STATUS = {
  antri: { label: 'Antri', tone: 'neutral' },
  dikerjakan: { label: 'Dikerjakan', tone: 'warning' },
  selesai: { label: 'Selesai', tone: 'info' },
  dibayar: { label: 'Dibayar', tone: 'success' },
  batal: { label: 'Batal', tone: 'danger' },
}

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS).map(
  ([value, config]) => ({ value, ...config }),
)

export const PRIORITY = {
  rendah: { label: 'Rendah', tone: 'neutral' },
  normal: { label: 'Normal', tone: 'info' },
  tinggi: { label: 'Tinggi', tone: 'warning' },
  urgent: { label: 'Urgent', tone: 'danger' },
}

export const PRIORITY_OPTIONS = Object.entries(PRIORITY).map(
  ([value, config]) => ({ value, ...config }),
)

export const PAYMENT_STATUS = {
  lunas: { label: 'Lunas', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
}

export const PAYMENT_METHODS = ['Tunai', 'Transfer bank', 'QRIS', 'Kartu debit']

export const STOCK_STATUS = {
  aman: { label: 'Aman', tone: 'success' },
  menipis: { label: 'Menipis', tone: 'warning' },
  habis: { label: 'Habis', tone: 'danger' },
}

export function stockStatus(item) {
  if (Number(item.stock) <= 0) return STOCK_STATUS.habis
  if (Number(item.stock) <= Number(item.minStock)) return STOCK_STATUS.menipis
  return STOCK_STATUS.aman
}
