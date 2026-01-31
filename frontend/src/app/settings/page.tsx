'use client'

/**
 * Settings page (protected)
 */

import { useEffect, useState } from 'react'
import { Container, Title, Paper, Select, NumberInput, Button, Group, Alert, LoadingOverlay, Stack, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/api/client'
import type { Settings, SettingsUpdateRequest } from '@/types'

function SettingsContent() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<SettingsUpdateRequest>({
    initialValues: {
      language: 'en',
      theme: 'system',
      font_size: 14,
    },
    validate: {
      font_size: (value) => {
        if (!value) return 'Font size is required'
        if (value < 10 || value > 24) return 'Font size must be between 10 and 24'
        return null
      },
    },
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient.getSettings()
      setSettings(data)
      form.setValues({
        language: data.language,
        theme: data.theme,
        font_size: data.font_size,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (values: SettingsUpdateRequest) => {
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updatedSettings = await apiClient.updateSettings(values)
      setSettings(updatedSettings)
      setSuccessMessage('Settings saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <LoadingOverlay visible />
  }

  return (
    <Container size="md" py={60}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={1} mb="xl">
          Settings
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert icon={<IconCheck size={16} />} title="Success" color="green" mb="md">
            {successMessage}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="Language"
              description="Select your preferred language"
              data={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
                { value: 'zh', label: 'Chinese' },
              ]}
              {...form.getInputProps('language')}
              disabled={isSaving}
            />

            <Select
              label="Theme"
              description="Choose your preferred color theme"
              data={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System Default' },
              ]}
              {...form.getInputProps('theme')}
              disabled={isSaving}
            />

            <NumberInput
              label="Font Size"
              description="Set the font size for the chat interface (10-24)"
              min={10}
              max={24}
              {...form.getInputProps('font_size')}
              disabled={isSaving}
            />

            {settings && (
              <Paper withBorder p="md" mt="md">
                <Text size="sm" fw={500} mb="xs">
                  Additional Information
                </Text>
                <Text size="xs" c="dimmed">
                  User ID: {settings.user_id}
                </Text>
                <Text size="xs" c="dimmed">
                  Last Updated: {new Date(settings.updated_at).toLocaleString()}
                </Text>
              </Paper>
            )}

            <Group justify="flex-end" mt="xl">
              <Button type="submit" loading={isSaving}>
                Save Settings
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}

