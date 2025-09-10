import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard/bonds',
  '/dashboard/ledger',
  '/dashboard/purchases',
  '/dashboard/users',
  '/dashboard/settings',
  '/dashboard/book-transfers',
  '/dashboard/cybrid'
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/signup'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔒 Middleware: Checking route:', pathname)
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )
  
  // Skip middleware for public routes
  if (isPublicRoute) {
    console.log('🔓 Middleware: Public route, allowing access')
    return NextResponse.next()
  }
  
  // For protected routes, check for authentication
  if (isProtectedRoute) {
    console.log('🔒 Middleware: Protected route detected')
    
    // Check for authentication token in cookies
    const authToken = request.cookies.get('adminToken')?.value
    const userData = request.cookies.get('adminUser')?.value
    
    console.log('🔍 Middleware: Auth token exists:', !!authToken)
    console.log('🔍 Middleware: User data exists:', !!userData)
    
    // If no authentication data found, redirect to login
    if (!authToken || !userData) {
      console.log('❌ Middleware: No auth data, redirecting to login')
      
      // Create redirect URL with the original path as a parameter
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      
      return NextResponse.redirect(loginUrl)
    }
    
    // Validate token format (basic check)
    try {
      // Basic JWT format validation
      const tokenParts = authToken.split('.')
      if (tokenParts.length !== 3) {
        console.log('❌ Middleware: Invalid token format')
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      // Parse user data
      const user = JSON.parse(userData)
      if (!user.id || !user.email || !user.role) {
        console.log('❌ Middleware: Invalid user data')
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      console.log('✅ Middleware: Authentication valid, allowing access')
      
      // Add user info to headers for server-side access
      const response = NextResponse.next()
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-email', user.email)
      response.headers.set('x-user-role', user.role)
      
      return response
      
    } catch (error) {
      console.log('❌ Middleware: Error validating auth data:', error)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // For all other routes, allow access
  console.log('🔓 Middleware: Non-protected route, allowing access')
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
