'use client'

/**
 * Auth guard component
 * Redirects authenticated users away from login/register pages
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingOverlay } from '@mantine/core'
import { useAuthStore } from '@/lib/store/auth'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = '/dashboard' }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  if (isLoading) {
    return <LoadingOverlay visible />
  }

  if (isAuthenticated) {
    return <LoadingOverlay visible />
  }

  return <>{children}</>
}

