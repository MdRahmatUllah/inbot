/**
 * Login page
 */

import { Container } from '@mantine/core'
import { AuthGuard } from '@/components/AuthGuard'
import { LoginForm } from '@/features/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthGuard>
      <Container size="xs" py={60}>
        <LoginForm />
      </Container>
    </AuthGuard>
  )
}

