'use client'

/**
 * Sessions list page (protected)
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Select,
  Alert,
  LoadingOverlay,
  Card,
  Flex,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconPlus, IconStar, IconStarFilled, IconTrash, IconAlertCircle } from '@tabler/icons-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useSessionsStore } from '@/lib/store/sessions'
import type { SessionCreateRequest, SessionType } from '@/types'

function SessionsContent() {
  const router = useRouter()
  const { sessions, isLoading, error, fetchSessions, createSession, updateSession, deleteSession, clearError } =
    useSessionsStore()
  const [createModalOpened, setCreateModalOpened] = useState(false)
  const [deleteModalOpened, setDeleteModalOpened] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createForm = useForm<SessionCreateRequest>({
    initialValues: {
      name: '',
      type: 'chat' as SessionType,
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
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      await fetchSessions()
    } catch (err) {
      console.error('Failed to load sessions:', err)
    }
  }

  const handleCreateSession = async (values: SessionCreateRequest) => {
    setSubmitError(null)
    try {
      const newSession = await createSession(values)
      setCreateModalOpened(false)
      createForm.reset()
      router.push(`/session/${newSession.id}`)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session'
      setSubmitError(errorMessage)
    }
  }

  const handleToggleStar = async (sessionId: string, currentStarred: boolean) => {
    try {
      await updateSession(sessionId, { starred: !currentStarred })
    } catch (err) {
      console.error('Failed to toggle star:', err)
    }
  }

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId)
    setDeleteModalOpened(true)
  }

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return

    try {
      await deleteSession(sessionToDelete)
      setDeleteModalOpened(false)
      setSessionToDelete(null)
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  const handleSessionClick = (sessionId: string) => {
    router.push(`/session/${sessionId}`)
  }

  return (
    <Container size="lg" py={60}>
      <Group justify="space-between" mb="xl">
        <Title order={1}>Sessions</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpened(true)}>
          New Session
        </Button>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md" onClose={clearError} withCloseButton>
          {error}
        </Alert>
      )}

      {isLoading && <LoadingOverlay visible />}

      {!isLoading && sessions.length === 0 && (
        <Paper withBorder p={60} radius="md">
          <Stack align="center" gap="md">
            <Text size="lg" c="dimmed">
              No sessions yet
            </Text>
            <Text size="sm" c="dimmed">
              Create your first session to get started
            </Text>
            <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpened(true)}>
              Create Session
            </Button>
          </Stack>
        </Paper>
      )}

      <Stack gap="md">
        {sessions.map((session) => (
          <Card key={session.id} withBorder shadow="sm" padding="lg" radius="md" style={{ cursor: 'pointer' }}>
            <Flex justify="space-between" align="center">
              <div onClick={() => handleSessionClick(session.id)} style={{ flex: 1 }}>
                <Group gap="sm" mb="xs">
                  <Text fw={500} size="lg">
                    {session.name}
                  </Text>
                  <Badge color={session.type === 'chat' ? 'blue' : 'purple'} variant="light">
                    {session.type}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  Created: {new Date(session.created_at).toLocaleString()}
                </Text>
              </div>

              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color={session.starred ? 'yellow' : 'gray'}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleStar(session.id, session.starred)
                  }}
                >
                  {session.starred ? <IconStarFilled size={18} /> : <IconStar size={18} />}
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(session.id)
                  }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </Flex>
          </Card>
        ))}
      </Stack>

      {/* Create Session Modal */}
      <Modal
        opened={createModalOpened}
        onClose={() => {
          setCreateModalOpened(false)
          createForm.reset()
          setSubmitError(null)
        }}
        title="Create New Session"
      >
        {submitError && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
            {submitError}
          </Alert>
        )}

        <form onSubmit={createForm.onSubmit(handleCreateSession)}>
          <Stack gap="md">
            <TextInput
              label="Session Name"
              placeholder="My Chat Session"
              required
              {...createForm.getInputProps('name')}
            />

            <Select
              label="Session Type"
              data={[
                { value: 'chat', label: 'Chat' },
                { value: 'picture', label: 'Picture' },
              ]}
              {...createForm.getInputProps('type')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setCreateModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false)
          setSessionToDelete(null)
        }}
        title="Delete Session"
      >
        <Text mb="md">Are you sure you want to delete this session? This action cannot be undone.</Text>
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

export default function SessionsPage() {
  return (
    <ProtectedRoute>
      <SessionsContent />
    </ProtectedRoute>
  )
}

