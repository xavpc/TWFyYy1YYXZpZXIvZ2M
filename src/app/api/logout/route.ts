import { NextResponse } from 'next/server'
import Cookies from 'js-cookie'

export async function POST() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Cookies.get('token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Logout failed' },
        { status: res.status }
      )
    }

    // Clear token from cookies & localStorage
    Cookies.remove('token')
    localStorage.removeItem('token')

    return NextResponse.json({ message: 'Logout successful' })
    window.location.href = '/login'
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
