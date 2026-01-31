/**
 * Registration page
 */

import { Container } from '@mantine/core'
import { AuthGuard } from '@/components/AuthGuard'
import { RegisterForm } from '@/features/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthGuard>
      <Container size="xs" py={60}>
        <RegisterForm />
      </Container>
    </AuthGuard>
  )
}

