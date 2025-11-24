/**
 * Utility to store and retrieve the last client (public) and admin routes visited
 * This allows admins to switch between admin and client views seamlessly
 */

const CLIENT_ROUTE_STORAGE_KEY = 'tinkerbell_last_client_route'
const ADMIN_ROUTE_STORAGE_KEY = 'tinkerbell_last_admin_route'

/**
 * Check if a pathname is a client/public route (not admin)
 */
export function isClientRoute(pathname: string): boolean {
  return !pathname.startsWith('/admin') && pathname !== '/admin-login'
}

/**
 * Check if a pathname is an admin route
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin') || pathname === '/admin-login'
}

/**
 * Save the current client route to localStorage
 */
export function saveClientRoute(pathname: string): void {
  if (typeof window === 'undefined') return
  
  if (isClientRoute(pathname)) {
    try {
      localStorage.setItem(CLIENT_ROUTE_STORAGE_KEY, pathname)
    } catch (error) {
      console.error('Failed to save client route:', error)
    }
  }
}

/**
 * Save the current admin route to localStorage
 */
export function saveAdminRoute(pathname: string): void {
  if (typeof window === 'undefined') return
  
  if (isAdminRoute(pathname)) {
    try {
      localStorage.setItem(ADMIN_ROUTE_STORAGE_KEY, pathname)
    } catch (error) {
      console.error('Failed to save admin route:', error)
    }
  }
}

/**
 * Get the last saved client route, or return default route
 */
export function getLastClientRoute(defaultRoute: string = '/'): string {
  if (typeof window === 'undefined') return defaultRoute
  
  try {
    const saved = localStorage.getItem(CLIENT_ROUTE_STORAGE_KEY)
    return saved && isClientRoute(saved) ? saved : defaultRoute
  } catch (error) {
    console.error('Failed to get client route:', error)
    return defaultRoute
  }
}

/**
 * Get the last saved admin route, or return default route
 */
export function getLastAdminRoute(defaultRoute: string = '/admin'): string {
  if (typeof window === 'undefined') return defaultRoute
  
  try {
    const saved = localStorage.getItem(ADMIN_ROUTE_STORAGE_KEY)
    return saved && isAdminRoute(saved) ? saved : defaultRoute
  } catch (error) {
    console.error('Failed to get admin route:', error)
    return defaultRoute
  }
}

