'use client'

/**
 * Protected route wrapper component
 * Redirects unauthenticated users to login page
 */

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LoadingOverlay } from '@mantine/core'
import { useAuthStore } from '@/lib/store/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the intended destination
      const returnUrl = pathname !== '/login' && pathname !== '/register' ? pathname : '/dashboard'
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
    }
  }, [isAuthenticated, isLoading, router, pathname])

  if (isLoading) {
    return <LoadingOverlay visible />
  }

  if (!isAuthenticated) {
    return <LoadingOverlay visible />
  }

  return <>{children}</>
}

