import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  console.log('Middleware running on:', req.nextUrl.pathname) // ✅ Check if middleware runs

  const token = req.cookies.get('token')?.value
  console.log('Token found:', token ? 'YES' : 'NO') // ✅ See if token is detected

  // Allow access to public routes
  if (req.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  // Redirect unauthenticated users
  if (!token) {
    console.log('Redirecting to /login') // ✅ Confirm redirect logic
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|_static|favicon.ico).*)'], // ✅ Apply to all pages except static files
}
