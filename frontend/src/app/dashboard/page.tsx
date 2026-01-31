'use client'

/**
 * Dashboard page (protected)
 */

import { Container, Title, Text, Button, Paper, Group, Stack } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthStore } from '@/lib/store/auth'

function DashboardContent() {
  const router = useRouter()
  const { user } = useAuthStore()

  return (
    <Container size="lg" py={60}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={1} mb="md">
          Dashboard
        </Title>

        <Text size="lg" mb="xl">
          Welcome back, <strong>{user?.username}</strong>!
        </Text>

        <Text c="dimmed" mb="md">
          Email: {user?.email}
        </Text>

        <Text c="dimmed" mb="xl">
          User ID: {user?.id}
        </Text>

        <Stack gap="md" mt="xl">
          <Text size="sm" fw={500}>
            Quick Actions
          </Text>
          <Group>
            <Button onClick={() => router.push('/sessions')}>
              View Sessions
            </Button>
            <Button variant="outline" onClick={() => router.push('/settings')}>
              Settings
            </Button>
          </Group>
        </Stack>

        <Text size="sm" c="dimmed" mt="xl">
          This is a protected page. Only authenticated users can access it.
        </Text>
      </Paper>
    </Container>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

