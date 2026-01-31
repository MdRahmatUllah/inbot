'use client'

/**
 * Session detail page (protected)
 */

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Container,
  Title,
  Paper,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Alert,
  LoadingOverlay,
  Divider,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconStar, IconStarFilled, IconTrash, IconEdit, IconArrowLeft, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useSessionsStore } from '@/lib/store/sessions'
import type { SessionUpdateRequest } from '@/types'

function SessionDetailContent() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const { currentSession, isLoading, error, fetchSession, updateSession, deleteSession, clearError } = useSessionsStore()
  const [editModalOpened, setEditModalOpened] = useState(false)
  const [deleteModalOpened, setDeleteModalOpened] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const editForm = useForm<SessionUpdateRequest>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => {
        if (!value) return 'Session name is required'
        if (value.length < 3) return 'Session name must be at least 3 characters'
        return null
      },
    },
  })

  useEffect(() => {
    if (sessionId) {
      loadSession()
    }
  }, [sessionId])

  const loadSession = async () => {
    try {
      await fetchSession(sessionId)
    } catch (err) {
      console.error('Failed to load session:', err)
    }
  }

  const handleToggleStar = async () => {
    if (!currentSession) return

    try {
      await updateSession(sessionId, { starred: !currentSession.starred })
      setSuccessMessage('Session updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Failed to toggle star:', err)
    }
  }

  const handleEditClick = () => {
    if (currentSession) {
      editForm.setValues({ name: currentSession.name })
      setEditModalOpened(true)
    }
  }

  const handleEditSubmit = async (values: SessionUpdateRequest) => {
    setSubmitError(null)
    try {
      await updateSession(sessionId, values)
      setEditModalOpened(false)
      setSuccessMessage('Session updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session'
      setSubmitError(errorMessage)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteSession(sessionId)
      router.push('/sessions')
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  if (isLoading) {
    return <LoadingOverlay visible />
  }

  if (!currentSession) {
    return (
      <Container size="md" py={60}>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          Session not found
        </Alert>
        <Button mt="md" onClick={() => router.push('/sessions')}>
          Back to Sessions
        </Button>
      </Container>
    )
  }

  return (
    <Container size="lg" py={60}>
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => router.push('/sessions')}
        mb="xl"
      >
        Back to Sessions
      </Button>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md" onClose={clearError} withCloseButton>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert icon={<IconCheck size={16} />} title="Success" color="green" mb="md" withCloseButton>
          {successMessage}
        </Alert>
      )}

      <Paper withBorder shadow="md" p={30} radius="md">
        <Group justify="space-between" mb="xl">
          <Group gap="md">
            <Title order={1}>{currentSession.name}</Title>
            <Badge color={currentSession.type === 'chat' ? 'blue' : 'purple'} variant="light" size="lg">
              {currentSession.type}
            </Badge>
          </Group>

          <Group gap="xs">
            <ActionIcon
              variant="light"
              color={currentSession.starred ? 'yellow' : 'gray'}
              size="lg"
              onClick={handleToggleStar}
            >
              {currentSession.starred ? <IconStarFilled size={20} /> : <IconStar size={20} />}
            </ActionIcon>
            <ActionIcon variant="light" color="blue" size="lg" onClick={handleEditClick}>
              <IconEdit size={20} />
            </ActionIcon>
            <ActionIcon variant="light" color="red" size="lg" onClick={() => setDeleteModalOpened(true)}>
              <IconTrash size={20} />
            </ActionIcon>
          </Group>
        </Group>

        <Divider mb="xl" />

        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} c="dimmed" mb={4}>
              Session ID
            </Text>
            <Text>{currentSession.id}</Text>
          </div>

          <div>
            <Text size="sm" fw={500} c="dimmed" mb={4}>
              Created
            </Text>
            <Text>{new Date(currentSession.created_at).toLocaleString()}</Text>
          </div>

          <div>
            <Text size="sm" fw={500} c="dimmed" mb={4}>
              Last Updated
            </Text>
            <Text>{new Date(currentSession.updated_at).toLocaleString()}</Text>
          </div>

          <div>
            <Text size="sm" fw={500} c="dimmed" mb={4}>
              Status
            </Text>
            <Badge color={currentSession.starred ? 'yellow' : 'gray'} variant="light">
              {currentSession.starred ? 'Starred' : 'Not Starred'}
            </Badge>
          </div>
        </Stack>

        <Divider my="xl" />

        <Paper withBorder p="md" bg="gray.0">
          <Text size="lg" fw={500} mb="md">
            Chat Interface
          </Text>
          <Text c="dimmed" size="sm">
            Chat interface will be implemented in Sprint 2. This is a placeholder for the chat functionality.
          </Text>
        </Paper>
      </Paper>

      {/* Edit Session Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false)
          setSubmitError(null)
        }}
        title="Edit Session"
      >
        {submitError && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {submitError}
          </Alert>
        )}

        <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Session Name"
              placeholder="My Chat Session"
              required
              {...editForm.getInputProps('name')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setEditModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Delete Session"
      >
        <Text mb="md">
          Are you sure you want to delete <strong>{currentSession.name}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteModalOpened(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Container>
  )
}

export default function SessionDetailPage() {
  return (
    <ProtectedRoute>
      <SessionDetailContent />
    </ProtectedRoute>
  )
}

