import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const apiKey = process.env.NEXT_PUBLIC_API_KEY // Keep it hidden on the server

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || '',
    },
    body: JSON.stringify({ username, password }),
  })

  const data = await res.json()
  return NextResponse.json(data)
}
