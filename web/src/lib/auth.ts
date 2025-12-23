import Cookies from 'js-cookie'

export async function login(username: string, password: string) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    throw new Error('Login failed')
  }

  const data = await res.json()
  return data
}

export const logout = async () => {
  try {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' }) // Call backend logout API

    // window.location.href = '/login' // Redirect to login page
  } catch (error) {
    console.error('Logout failed', error)
  }
}
