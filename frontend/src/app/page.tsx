'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Title, Text, Stack, LoadingOverlay } from '@mantine/core'
import { useAuthStore } from '@/lib/store/auth'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <Container size="md" py="xl">
      <LoadingOverlay visible />
      <Stack align="center" gap="xl" mt={100}>
        <Title order={1} size={48}>
          Welcome to InBot
        </Title>
        <Text size="lg" c="dimmed" ta="center">
          Enterprise-grade AI chat platform with multi-turn conversations,
          knowledge base integration, and advanced tool calling capabilities.
        </Text>
      </Stack>
    </Container>
  )
}

