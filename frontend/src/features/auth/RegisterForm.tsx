'use client'

/**
 * Registration form component
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TextInput, PasswordInput, Button, Paper, Title, Text, Anchor, Alert } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle } from '@tabler/icons-react'
import { useAuthStore } from '@/lib/store/auth'
import type { RegisterRequest } from '@/types'

export function RegisterForm() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<RegisterRequest>({
    initialValues: {
      email: '',
      username: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required'
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email format'
        return null
      },
      username: (value) => {
        if (!value) return 'Username is required'
        if (value.length < 3) return 'Username must be at least 3 characters'
        if (value.length > 50) return 'Username must be at most 50 characters'
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return 'Username must contain only alphanumeric characters and underscores'
        }
        return null
      },
      password: (value) => {
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        return null
      },
    },
  })

  const handleSubmit = async (values: RegisterRequest) => {
    setSubmitError(null)
    clearError()

    try {
      await register(values)
      router.push('/dashboard')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setSubmitError(errorMessage)
    }
  }

  const displayError = submitError || error

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md" style={{ maxWidth: 420, margin: '0 auto' }}>
      <Title order={2} ta="center" mb="md">
        Create Account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="xl">
        Sign up for InBot
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

        <TextInput
          label="Username"
          placeholder="johndoe"
          required
          mt="md"
          {...form.getInputProps('username')}
          disabled={isLoading}
        />

        <PasswordInput
          label="Password"
          placeholder="Your password (min 8 characters)"
          required
          mt="md"
          {...form.getInputProps('password')}
          disabled={isLoading}
        />

        <Button fullWidth mt="xl" type="submit" loading={isLoading}>
          Create account
        </Button>
      </form>

      <Text c="dimmed" size="sm" ta="center" mt="md">
        Already have an account?{' '}
        <Anchor size="sm" href="/login">
          Sign in
        </Anchor>
      </Text>
    </Paper>
  )
}

