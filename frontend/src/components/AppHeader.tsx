'use client'

/**
 * Application header component
 */

import { Group, Button, Text } from '@mantine/core'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'

export function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  const isActive = (path: string) => pathname === path

  return (
    <Group justify="space-between" p="md" style={{ borderBottom: '1px solid #e0e0e0' }}>
      <Group gap="xl">
        <Text
          size="xl"
          fw={700}
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/dashboard')}
        >
          InBot
        </Text>

        <Group gap="sm">
          <Button
            variant={isActive('/dashboard') ? 'filled' : 'subtle'}
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </Button>
          <Button
            variant={isActive('/sessions') ? 'filled' : 'subtle'}
            size="sm"
            onClick={() => router.push('/sessions')}
          >
            Sessions
          </Button>
          <Button
            variant={isActive('/settings') ? 'filled' : 'subtle'}
            size="sm"
            onClick={() => router.push('/settings')}
          >
            Settings
          </Button>
        </Group>
      </Group>

      <Group>
        <Text size="sm" c="dimmed">
          {user?.username}
        </Text>
        <Button onClick={handleLogout} variant="subtle" size="sm">
          Logout
        </Button>
      </Group>
    </Group>
  )
}

