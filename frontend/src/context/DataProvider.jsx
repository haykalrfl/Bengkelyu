import { useCallback, useEffect, useMemo, useState } from 'react'
import { DataContext } from './DataContext'
import { createSeedData } from '../data/seed'
import { formatDateInput } from '../utils/format'

const STORAGE_KEY = 'bengkelyu.demo.data.v1'

const DATA_KEYS = [
  'customers',
  'mechanics',
  'orders',
  'payments',
  'inventory',
  'cashflow',
]

function loadData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeedData()

    const parsed = JSON.parse(raw)
    const valid = DATA_KEYS.every((key) => Array.isArray(parsed?.[key]))

    return valid ? parsed : createSeedData()
  } catch {
    return createSeedData()
  }
}

function nextId(items, prefix, digits = 3) {
  const max = items.reduce((highest, item) => {
    if (!String(item.id).startsWith(prefix)) return highest

    const value = Number(String(item.id).slice(prefix.length))
    return Number.isFinite(value) ? Math.max(highest, value) : highest
  }, 0)

  return `${prefix}${String(max + 1).padStart(digits, '0')}`
}

function nextOrderId(orders) {
  return nextId(orders, `WO-${new Date().getFullYear()}-`, 4)
}

export default function DataProvider({ children }) {
  const [data, setData] = useState(loadData)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Penyimpanan browser bisa diblokir; data demo tetap jalan di memori.
    }
  }, [data])

  const addOrder = useCallback((payload) => {
    setData((previous) => {
      const order = {
        ...payload,
        id: nextOrderId(previous.orders),
        status: payload.status ?? 'antri',
        createdAt: payload.createdAt ?? formatDateInput(),
      }

      return { ...previous, orders: [order, ...previous.orders] }
    })
  }, [])

  const updateOrderStatus = useCallback((orderId, status) => {
    setData((previous) => ({
      ...previous,
      orders: previous.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    }))
  }, [])

  const addCustomer = useCallback((payload) => {
    setData((previous) => {
      const customer = {
        ...payload,
        id: nextId(previous.customers, 'CUS-'),
        joinedAt: formatDateInput(),
      }

      return { ...previous, customers: [customer, ...previous.customers] }
    })
  }, [])

  const addMechanic = useCallback((payload) => {
    setData((previous) => {
      const mechanic = {
        ...payload,
        id: nextId(previous.mechanics, 'MEC-'),
        rating: 0,
        joinedAt: formatDateInput(),
      }

      return { ...previous, mechanics: [mechanic, ...previous.mechanics] }
    })
  }, [])

  const toggleMechanicStatus = useCallback((mechanicId) => {
    setData((previous) => ({
      ...previous,
      mechanics: previous.mechanics.map((mechanic) =>
        mechanic.id === mechanicId
          ? {
              ...mechanic,
              status: mechanic.status === 'aktif' ? 'libur' : 'aktif',
            }
          : mechanic,
      ),
    }))
  }, [])

  const addInventoryItem = useCallback((payload) => {
    setData((previous) => {
      const item = {
        ...payload,
        id: nextId(previous.inventory, 'PRT-'),
      }

      return { ...previous, inventory: [item, ...previous.inventory] }
    })
  }, [])

  const adjustStock = useCallback((itemId, delta) => {
    setData((previous) => ({
      ...previous,
      inventory: previous.inventory.map((item) =>
        item.id === itemId
          ? { ...item, stock: Math.max(0, Number(item.stock) + delta) }
          : item,
      ),
    }))
  }, [])

  const addPayment = useCallback((payload) => {
    setData((previous) => {
      const payment = {
        ...payload,
        id: nextId(previous.payments, `PAY-${new Date().getFullYear()}-`, 4),
      }

      return {
        ...previous,
        payments: [payment, ...previous.payments],
        orders:
          payment.status === 'lunas'
            ? previous.orders.map((order) =>
                order.id === payment.orderId
                  ? { ...order, status: 'dibayar' }
                  : order,
              )
            : previous.orders,
      }
    })
  }, [])

  const settlePayment = useCallback((paymentId) => {
    setData((previous) => {
      const payment = previous.payments.find((item) => item.id === paymentId)
      if (!payment) return previous

      return {
        ...previous,
        payments: previous.payments.map((item) =>
          item.id === paymentId ? { ...item, status: 'lunas' } : item,
        ),
        orders: previous.orders.map((order) =>
          order.id === payment.orderId ? { ...order, status: 'dibayar' } : order,
        ),
      }
    })
  }, [])

  const addCashflowEntry = useCallback((payload) => {
    setData((previous) => {
      const entry = {
        ...payload,
        id: nextId(previous.cashflow, 'CSH-'),
      }

      return { ...previous, cashflow: [entry, ...previous.cashflow] }
    })
  }, [])

  const resetData = useCallback(() => {
    setData(createSeedData())
  }, [])

  const value = useMemo(
    () => ({
      ...data,
      addOrder,
      updateOrderStatus,
      addCustomer,
      addMechanic,
      toggleMechanicStatus,
      addInventoryItem,
      adjustStock,
      addPayment,
      settlePayment,
      addCashflowEntry,
      resetData,
    }),
    [
      data,
      addOrder,
      updateOrderStatus,
      addCustomer,
      addMechanic,
      toggleMechanicStatus,
      addInventoryItem,
      adjustStock,
      addPayment,
      settlePayment,
      addCashflowEntry,
      resetData,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
