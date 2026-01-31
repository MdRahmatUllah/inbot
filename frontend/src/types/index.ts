/**
 * Shared TypeScript types for InBot frontend
 */

// ============================================================================
// Authentication Types
// ============================================================================

export interface User {
  id: string
  email: string
  username: string
  created_at: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface TokenRefreshRequest {
  refresh_token: string
}

// ============================================================================
// Session Types
// ============================================================================

export type SessionType = 'chat' | 'picture'

export interface Session {
  id: string
  user_id: string
  type: SessionType
  name: string
  starred: boolean
  created_at: string
  updated_at: string
  copilot_id?: string
  assistant_avatar_key?: string
  settings?: Record<string, unknown>
  threads?: unknown[]
  thread_name?: string
  message_forks_hash?: Record<string, unknown>
}

export interface SessionCreateRequest {
  type?: SessionType
  name: string
  copilot_id?: string
  settings?: Record<string, unknown>
}

export interface SessionUpdateRequest {
  name?: string
  starred?: boolean
  copilot_id?: string
  assistant_avatar_key?: string
  settings?: Record<string, unknown>
  thread_name?: string
}

export interface SessionListResponse {
  sessions: Session[]
  total: number
  limit: number
  offset: number
}

export interface SessionListFilters {
  type?: SessionType
  starred?: boolean
  limit?: number
  offset?: number
}

// ============================================================================
// Settings Types
// ============================================================================

export interface Settings {
  id: string
  user_id: string
  language: string
  theme: string
  font_size: number
  chat_settings: Record<string, unknown>
  providers: Array<Record<string, unknown>>
  shortcuts: Record<string, unknown>
  mcp_config: Record<string, unknown>
  web_search_config: Record<string, unknown>
  desktop_settings?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SettingsUpdateRequest {
  language?: string
  theme?: string
  font_size?: number
  chat_settings?: Record<string, unknown>
  providers?: Array<Record<string, unknown>>
  shortcuts?: Record<string, unknown>
  mcp_config?: Record<string, unknown>
  web_search_config?: Record<string, unknown>
  desktop_settings?: Record<string, unknown>
}

// ============================================================================
// Message Types (for future use)
// ============================================================================

export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  error: {
    code: string
    message: string
    request_id?: string
  }
}

