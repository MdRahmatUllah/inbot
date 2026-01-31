# Frontend Architecture (Next.js)

## Overview

This document outlines the frontend architecture for the Chatbox application using Next.js 14+ with App Router, TypeScript, and modern React patterns.

## Technology Stack

### Core Framework
- **Next.js 14+**: App Router, Server Components, Server Actions
- **React 18+**: Concurrent features, Suspense, Transitions
- **TypeScript 5+**: Strict type checking

### State Management
- **Zustand**: Lightweight state management (recommended)
- **Alternative**: Jotai (current app uses this)
- **React Query (TanStack Query)**: Server state management

### UI Framework
- **Option 1 - Mantine**: Current app uses Mantine v7
  - Comprehensive component library
  - Built-in theming
  - Accessibility features
- **Option 2 - shadcn/ui**: Modern alternative
  - Tailwind-based
  - Copy-paste components
  - Full customization

### Styling
- **Tailwind CSS**: Utility-first CSS
- **CSS Modules**: Component-scoped styles (optional)
- **CSS Variables**: Theme customization

### Additional Libraries
- **react-markdown**: Markdown rendering
- **react-syntax-highlighter**: Code highlighting
- **@dnd-kit**: Drag and drop
- **react-virtuoso**: Virtual scrolling
- **i18next**: Internationalization
- **zod**: Runtime validation

## Project Structure

```
/app
  ├── (auth)                    # Auth routes group
  │   ├── login
  │   │   └── page.tsx
  │   └── register
  │       └── page.tsx
  │
  ├── (dashboard)               # Main app routes group
  │   ├── layout.tsx            # Dashboard layout with sidebar
  │   ├── page.tsx              # Home/session list
  │   ├── session
  │   │   └── [id]
  │   │       └── page.tsx      # Chat interface
  │   ├── copilots
  │   │   ├── page.tsx          # Copilots list
  │   │   └── [id]
  │   │       └── page.tsx      # Copilot editor
  │   ├── knowledge-base
  │   │   ├── page.tsx          # KB list
  │   │   └── [id]
  │   │       └── page.tsx      # KB details
  │   └── settings
  │       ├── page.tsx          # Settings home
  │       ├── general
  │       │   └── page.tsx
  │       ├── chat
  │       │   └── page.tsx
  │       ├── providers
  │       │   └── [id]
  │       │       └── page.tsx
  │       └── hotkeys
  │           └── page.tsx
  │
  ├── api                       # API routes (optional)
  │   └── upload
  │       └── route.ts
  │
  ├── layout.tsx                # Root layout
  ├── globals.css               # Global styles
  └── providers.tsx             # Context providers

/components
  ├── ui                        # Base UI components
  │   ├── button.tsx
  │   ├── input.tsx
  │   ├── dialog.tsx
  │   └── ...
  │
  ├── chat                      # Chat-specific components
  │   ├── message.tsx
  │   ├── message-list.tsx
  │   ├── input-box.tsx
  │   ├── streaming-message.tsx
  │   └── message-actions.tsx
  │
  ├── session                   # Session components
  │   ├── session-list.tsx
  │   ├── session-item.tsx
  │   └── session-header.tsx
  │
  ├── markdown                  # Markdown rendering
  │   ├── markdown.tsx
  │   ├── code-block.tsx
  │   ├── mermaid.tsx
  │   └── latex.tsx
  │
  ├── settings                  # Settings components
  │   ├── provider-config.tsx
  │   ├── shortcut-config.tsx
  │   └── theme-switcher.tsx
  │
  ├── knowledge-base            # KB components
  │   ├── kb-list.tsx
  │   ├── file-upload.tsx
  │   └── search-results.tsx
  │
  └── layout                    # Layout components
      ├── sidebar.tsx
      ├── header.tsx
      └── footer.tsx

/lib
  ├── api                       # API client
  │   ├── client.ts             # Axios/Fetch wrapper
  │   ├── sessions.ts           # Session API calls
  │   ├── messages.ts           # Message API calls
  │   ├── settings.ts           # Settings API calls
  │   └── websocket.ts          # WebSocket client
  │
  ├── stores                    # Zustand stores
  │   ├── session-store.ts
  │   ├── message-store.ts
  │   ├── settings-store.ts
  │   └── ui-store.ts
  │
  ├── hooks                     # Custom hooks
  │   ├── use-session.ts
  │   ├── use-messages.ts
  │   ├── use-streaming.ts
  │   └── use-shortcuts.ts
  │
  ├── utils                     # Utility functions
  │   ├── markdown.ts
  │   ├── format.ts
  │   └── validation.ts
  │
  └── types                     # TypeScript types
      ├── session.ts
      ├── message.ts
      └── settings.ts

/public
  ├── locales                   # i18n translations
  │   ├── en
  │   │   └── common.json
  │   ├── zh-CN
  │   │   └── common.json
  │   └── ...
  └── assets
      └── images
```

## State Management

### Zustand Store Examples

#### Session Store

```typescript
// lib/stores/session-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session } from '@/lib/types/session'

interface SessionStore {
  sessions: Session[]
  currentSessionId: string | null

  // Actions
  setSessions: (sessions: Session[]) => void
  addSession: (session: Session) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  deleteSession: (id: string) => void
  setCurrentSession: (id: string | null) => void

  // Selectors
  getCurrentSession: () => Session | null
  getSessionById: (id: string) => Session | null
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      setSessions: (sessions) => set({ sessions }),

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions]
        })),

      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
        })),

      setCurrentSession: (id) => set({ currentSessionId: id }),

      getCurrentSession: () => {
        const { sessions, currentSessionId } = get()
        return sessions.find((s) => s.id === currentSessionId) || null
      },

      getSessionById: (id) => {
        const { sessions } = get()
        return sessions.find((s) => s.id === id) || null
      },
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId
      }),
    }
  )
)
```

#### Message Store

```typescript
// lib/stores/message-store.ts
import { create } from 'zustand'
import type { Message } from '@/lib/types/message'

interface MessageStore {
  messagesBySession: Record<string, Message[]>
  streamingMessageId: string | null

  // Actions
  setMessages: (sessionId: string, messages: Message[]) => void
  addMessage: (sessionId: string, message: Message) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (sessionId: string, messageId: string) => void
  setStreamingMessage: (messageId: string | null) => void

  // Selectors
  getMessages: (sessionId: string) => Message[]
  getMessageById: (sessionId: string, messageId: string) => Message | null
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messagesBySession: {},
  streamingMessageId: null,

  setMessages: (sessionId, messages) =>
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: messages,
      },
    })),

  addMessage: (sessionId, message) =>
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: [...(state.messagesBySession[sessionId] || []), message],
      },
    })),

  updateMessage: (sessionId, messageId, updates) =>
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: (state.messagesBySession[sessionId] || []).map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      },
    })),

  deleteMessage: (sessionId, messageId) =>
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: (state.messagesBySession[sessionId] || []).filter(
          (m) => m.id !== messageId
        ),
      },
    })),

  setStreamingMessage: (messageId) => set({ streamingMessageId: messageId }),

  getMessages: (sessionId) => get().messagesBySession[sessionId] || [],

  getMessageById: (sessionId, messageId) => {
    const messages = get().messagesBySession[sessionId] || []
    return messages.find((m) => m.id === messageId) || null
  },
}))
```

#### Settings Store

```typescript
// lib/stores/settings-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/lib/types/settings'

interface SettingsStore {
  settings: Settings | null

  // Actions
  setSettings: (settings: Settings) => void
  updateSettings: (updates: Partial<Settings>) => void

  // Selectors
  getTheme: () => 'light' | 'dark' | 'system'
  getLanguage: () => string
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: null,

      setSettings: (settings) => set({ settings }),

      updateSettings: (updates) =>
        set((state) => ({
          settings: state.settings ? { ...state.settings, ...updates } : null,
        })),

      getTheme: () => get().settings?.theme || 'system',
      getLanguage: () => get().settings?.language || 'en',
    }),
    {
      name: 'settings-storage',
    }
  )
)
```

### React Query Integration

```typescript
// lib/hooks/use-sessions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsApi } from '@/lib/api/sessions'
import { useSessionStore } from '@/lib/stores/session-store'

export function useSessions() {
  const setSessions = useSessionStore((state) => state.setSessions)

  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const data = await sessionsApi.list()
      setSessions(data.sessions)
      return data.sessions
    },
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  const addSession = useSessionStore((state) => state.addSession)

  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: (newSession) => {
      addSession(newSession)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  const updateSession = useSessionStore((state) => state.updateSession)

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Session> }) =>
      sessionsApi.update(id, updates),
    onSuccess: (updatedSession) => {
      updateSession(updatedSession.id, updatedSession)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}
```

## Component Patterns

### Server Components vs Client Components

**Server Components** (default in App Router):
- Data fetching
- Static content
- SEO-critical pages

**Client Components** (use 'use client'):
- Interactive UI
- Event handlers
- Browser APIs
- State management

### Example: Chat Page

```typescript
// app/(dashboard)/session/[id]/page.tsx
import { Suspense } from 'react'
import { MessageList } from '@/components/chat/message-list'
import { InputBox } from '@/components/chat/input-box'
import { SessionHeader } from '@/components/session/session-header'

export default function SessionPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col h-screen">
      <SessionHeader sessionId={params.id} />

      <Suspense fallback={<MessageListSkeleton />}>
        <MessageList sessionId={params.id} />
      </Suspense>

      <InputBox sessionId={params.id} />
    </div>
  )
}
```

### Example: Message Component

```typescript
// components/chat/message.tsx
'use client'

import { useState } from 'react'
import { Markdown } from '@/components/markdown/markdown'
import { MessageActions } from '@/components/chat/message-actions'
import type { Message } from '@/lib/types/message'

interface MessageProps {
  message: Message
  sessionId: string
}

export function Message({ message, sessionId }: MessageProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative py-4 px-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-4">
        <Avatar role={message.role} />

        <div className="flex-1 min-w-0">
          {message.contentParts.map((part, index) => (
            <ContentPart key={index} part={part} />
          ))}

          {message.usage && (
            <TokenUsage usage={message.usage} />
          )}
        </div>
      </div>

      {isHovered && !message.generating && (
        <MessageActions message={message} sessionId={sessionId} />
      )}
    </div>
  )
}

