'use client'

/**
 * Login form component
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TextInput, PasswordInput, Button, Paper, Title, Text, Anchor, Alert } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle } from '@tabler/icons-react'
import { useAuthStore } from '@/lib/store/auth'
import type { LoginRequest } from '@/types'

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<LoginRequest>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required'
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email format'
        return null
      },
      password: (value) => {
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        return null
      },
    },
  })

  const handleSubmit = async (values: LoginRequest) => {
    setSubmitError(null)
    clearError()

    try {
      await login(values)
      router.push('/dashboard')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setSubmitError(errorMessage)
    }
  }

  const displayError = submitError || error

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md" style={{ maxWidth: 420, margin: '0 auto' }}>
      <Title order={2} ta="center" mb="md">
        Welcome to InBot
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="xl">
        Sign in to your account
      </Text>

      {displayError && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
          {displayError}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Email"
          placeholder="your@email.com"
          required
          {...form.getInputProps('email')}
          disabled={isLoading}
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          {...form.getInputProps('password')}
          disabled={isLoading}
        />

        <Button fullWidth mt="xl" type="submit" loading={isLoading}>
          Sign in
        </Button>
      </form>

      <Text c="dimmed" size="sm" ta="center" mt="md">
        Don&apos;t have an account?{' '}
        <Anchor size="sm" href="/register">
          Create account
        </Anchor>
      </Text>
    </Paper>
  )
}

