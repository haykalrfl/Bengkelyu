import { useEffect, useState } from 'react'
import { WrenchIcon } from './components/Icons'
import DataProvider from './context/DataProvider'
import { useAuth } from './hooks/useAuth'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import Cashflows from './pages/Cashflows'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Login from './pages/Login'
import Mechanics from './pages/Mechanics'
import Orders from './pages/Orders'
import Payments from './pages/Payments'
import Register from './pages/Register'
import './App.css'
import './styles/app.css'

const PAGES = {
  dashboard: Dashboard,
  orders: Orders,
  customers: Customers,
  mechanics: Mechanics,
  payments: Payments,
  cashflow: Cashflows,
  inventory: Inventory,
}

function getPageFromHash() {
  const value = window.location.hash.replace(/^#\/?/, '')
  return PAGES[value] ? value : 'dashboard'
}

function SplashScreen() {
  return (
    <div className="splash-screen" role="status" aria-live="polite">
      <div className="splash-inner">
        <span className="splash-logo">
          <WrenchIcon size={28} />
        </span>
        <span className="splash-spinner" aria-hidden="true" />
        <span>Menyiapkan sesi Anda...</span>
      </div>
    </div>
  )
}

export default function App() {
  const { user, initializing } = useAuth()
  const [authView, setAuthView] = useState('login')
  const [page, setPage] = useState(getPageFromHash)

  useEffect(() => {
    function handleHashChange() {
      setPage(getPageFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function navigate(nextPage) {
    const hash = `#/${nextPage}`

    if (window.location.hash === hash) {
      setPage(nextPage)
      return
    }

    window.location.hash = hash
  }

  if (initializing) {
    return <SplashScreen />
  }

  if (!user) {
    return (
      <AuthLayout>
        {authView === 'register' ? (
          <Register onSwitch={() => setAuthView('login')} />
        ) : (
          <Login onSwitch={() => setAuthView('register')} />
        )}
      </AuthLayout>
    )
  }

  const PageComponent = PAGES[page] ?? Dashboard

  return (
    <DataProvider>
      <AppLayout page={page} onNavigate={navigate}>
        <PageComponent onNavigate={navigate} />
      </AppLayout>
    </DataProvider>
  )
}
