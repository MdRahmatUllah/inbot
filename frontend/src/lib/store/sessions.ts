/**
 * Sessions store using Zustand
 */

import { create } from 'zustand'
import { apiClient } from '@/lib/api/client'
import type { Session, SessionCreateRequest, SessionUpdateRequest, SessionListFilters } from '@/types'

interface SessionsState {
  sessions: Session[]
  currentSession: Session | null
  total: number
  isLoading: boolean
  error: string | null
}

interface SessionsActions {
  fetchSessions: (filters?: SessionListFilters) => Promise<void>
  fetchSession: (id: string) => Promise<void>
  createSession: (data: SessionCreateRequest) => Promise<Session>
  updateSession: (id: string, data: SessionUpdateRequest) => Promise<Session>
  deleteSession: (id: string) => Promise<void>
  setCurrentSession: (session: Session | null) => void
  clearError: () => void
}

type SessionsStore = SessionsState & SessionsActions

export const useSessionsStore = create<SessionsStore>()((set) => ({
  // Initial state
  sessions: [],
  currentSession: null,
  total: 0,
  isLoading: false,
  error: null,

  // Actions
  fetchSessions: async (filters?: SessionListFilters) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getSessions(filters)
      set({
        sessions: response.sessions,
        total: response.total,
        isLoading: false,
        error: null,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sessions'
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw error
    }
  },

  fetchSession: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const session = await apiClient.getSession(id)
      set({
        currentSession: session,
        isLoading: false,
        error: null,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch session'
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw error
    }
  },

  createSession: async (data: SessionCreateRequest) => {
    set({ isLoading: true, error: null })
    try {
      const session = await apiClient.createSession(data)
      set((state) => ({
        sessions: [session, ...state.sessions],
        total: state.total + 1,
        isLoading: false,
        error: null,
      }))
      return session
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session'
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw error
    }
  },

  updateSession: async (id: string, data: SessionUpdateRequest) => {
    set({ isLoading: true, error: null })
    try {
      const updatedSession = await apiClient.updateSession(id, data)
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? updatedSession : s)),
        currentSession: state.currentSession?.id === id ? updatedSession : state.currentSession,
        isLoading: false,
        error: null,
      }))
      return updatedSession
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update session'
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw error
    }
  },

  deleteSession: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteSession(id)
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        total: state.total - 1,
        currentSession: state.currentSession?.id === id ? null : state.currentSession,
        isLoading: false,
        error: null,
      }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete session'
      set({
        isLoading: false,
        error: errorMessage,
      })
      throw error
    }
  },

  setCurrentSession: (session: Session | null) => {
    set({ currentSession: session })
  },

  clearError: () => {
    set({ error: null })
  },
}))

