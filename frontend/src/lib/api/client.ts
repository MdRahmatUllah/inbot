/**
 * API client for InBot backend
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for handling errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          this.clearToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  setToken(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  async register(data: import('@/types').RegisterRequest): Promise<import('@/types').User> {
    return this.post<import('@/types').User>('/api/v1/auth/register', data)
  }

  async login(data: import('@/types').LoginRequest): Promise<import('@/types').TokenResponse> {
    const response = await this.post<import('@/types').TokenResponse>('/api/v1/auth/login', data)
    this.setToken(response.access_token, response.refresh_token)
    return response
  }

  async refreshToken(): Promise<import('@/types').TokenResponse> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await this.post<import('@/types').TokenResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    })
    this.setToken(response.access_token, response.refresh_token)
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.post('/api/v1/auth/logout')
    } finally {
      this.clearToken()
    }
  }

  // ============================================================================
  // Session Methods
  // ============================================================================

  async getSessions(filters?: import('@/types').SessionListFilters): Promise<import('@/types').SessionListResponse> {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.starred !== undefined) params.append('starred', String(filters.starred))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.offset) params.append('offset', String(filters.offset))

    const queryString = params.toString()
    const url = queryString ? `/api/v1/sessions?${queryString}` : '/api/v1/sessions'

    return this.get<import('@/types').SessionListResponse>(url)
  }

  async getSession(id: string): Promise<import('@/types').Session> {
    return this.get<import('@/types').Session>(`/api/v1/sessions/${id}`)
  }

  async createSession(data: import('@/types').SessionCreateRequest): Promise<import('@/types').Session> {
    return this.post<import('@/types').Session>('/api/v1/sessions', data)
  }

  async updateSession(id: string, data: import('@/types').SessionUpdateRequest): Promise<import('@/types').Session> {
    return this.patch<import('@/types').Session>(`/api/v1/sessions/${id}`, data)
  }

  async deleteSession(id: string): Promise<void> {
    return this.delete<void>(`/api/v1/sessions/${id}`)
  }

  // ============================================================================
  // Settings Methods
  // ============================================================================

  async getSettings(): Promise<import('@/types').Settings> {
    return this.get<import('@/types').Settings>('/api/v1/settings')
  }

  async updateSettings(data: import('@/types').SettingsUpdateRequest): Promise<import('@/types').Settings> {
    return this.patch<import('@/types').Settings>('/api/v1/settings', data)
  }
}

export const apiClient = new ApiClient()

