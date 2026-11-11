import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { authApi, clearToken, getToken, setToken } from '../services/api'

const DEMO_KEY = 'bengkelyu.demo.user'

function readDemoUser() {
  try {
    const raw = window.localStorage.getItem(DEMO_KEY)
    const parsed = raw ? JSON.parse(raw) : null

    return parsed?.is_demo === true ? parsed : null
  } catch {
    return null
  }
}

function saveDemoUser(user) {
  try {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(user))
  } catch {
    // abaikan
  }
}

function clearDemoUser() {
  try {
    window.localStorage.removeItem(DEMO_KEY)
  } catch {
    // abaikan
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readDemoUser)
  const [initializing, setInitializing] = useState(
    () => Boolean(getToken()) && !readDemoUser(),
  )

  useEffect(() => {
    if (readDemoUser()) {
      return undefined
    }

    if (!getToken()) {
      return undefined
    }

    let active = true

    authApi
      .me()
      .then((data) => {
        if (active) setUser(data.user ?? null)
      })
      .catch(() => {
        clearToken()
      })
      .finally(() => {
        if (active) setInitializing(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials)
    clearDemoUser()
    setToken(data.token)
    setUser(data.user ?? null)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload)
    clearDemoUser()
    setToken(data.token)
    setUser(data.user ?? null)
    return data
  }, [])

  const loginDemo = useCallback(() => {
    const demoUser = {
      id: 0,
      name: 'Demo Admin',
      email: 'demo@bengkelyu.id',
      created_at: new Date().toISOString(),
      is_demo: true,
    }

    clearToken()
    clearDemoUser()
    saveDemoUser(demoUser)
    setUser(demoUser)
    setInitializing(false)

    return demoUser
  }, [])

  const logout = useCallback(async () => {
    if (!readDemoUser()) {
      try {
        await authApi.logout()
      } catch {
        // Token mungkin sudah tidak valid; tetap bersihkan sesi lokal.
      }
    }

    clearToken()
    clearDemoUser()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, initializing, login, register, loginDemo, logout }),
    [user, initializing, login, register, loginDemo, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
