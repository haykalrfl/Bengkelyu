const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')
const TOKEN_KEY = 'bengkelyu.auth.token'

export class ApiError extends Error {
  constructor(message, { status = 0, errors = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // localStorage bisa diblokir oleh browser; sesi tetap jalan sampai halaman di-refresh.
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // abaikan
  }
}

function defaultErrorMessage(status) {
  if (status === 401) return 'Sesi Anda sudah berakhir. Silakan login kembali.'
  if (status === 403) return 'Anda tidak punya akses ke resource ini.'
  if (status === 404) return 'Endpoint API tidak ditemukan.'
  if (status === 429) {
    return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'
  }
  if (status >= 500) return 'Server sedang bermasalah. Coba lagi beberapa saat lagi.'
  return 'Permintaan gagal. Silakan coba lagi.'
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(
      'Tidak bisa terhubung ke server. Pastikan backend Laravel sudah berjalan.',
    )
  }

  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null

  if (!response.ok) {
    const message =
      response.status === 429
        ? defaultErrorMessage(429)
        : data?.message || defaultErrorMessage(response.status)

    throw new ApiError(message, {
      status: response.status,
      errors: data?.errors ?? {},
    })
  }

  return data ?? {}
}

export const authApi = {
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) =>
    request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
}
