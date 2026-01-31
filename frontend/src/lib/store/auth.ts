/**
 * Authentication store using Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api/client'
import type { User, LoginRequest, RegisterRequest } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.login(credentials)
          set({
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed'
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.register(data)
          // After registration, automatically log in
          await get().login({
            email: data.email,
            password: data.password,
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await apiClient.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await apiClient.refreshToken()
          set({
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
          })
        } catch (error) {
          // If refresh fails, log out
          await get().logout()
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setUser: (user: User | null) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

