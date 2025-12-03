/**
 * Authentication API Service
 * Handles user authentication, session management, and authorization with the backend API.
 */

import { fetchApi, type ApiError } from '../lib/apiClient'

export interface User {
	id: number
	userName: string
	name: string
	email: string
	gitHubId?: number
	createdAt?: string
}

export interface AuthResponse {
	user: User
	token?: string
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
	try {
		return await fetchApi<User>('/auth/me')
	} catch (error) {
		const apiError = error as ApiError
		// 401 means user is not authenticated, which is not an error
		if (apiError.status === 401) {
			return null
		}
		throw error
	}
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
	try {
		const user = await getCurrentUser()
		return user !== null
	} catch {
		return false
	}
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
	return fetchApi<void>('/auth/logout', { method: 'POST' })
}

/**
 * Initiate GitHub OAuth login redirect
 */
export function initiateGitHubLogin(redirectPath = '/dashboard'): void {
	// Redirect to backend's GitHub OAuth endpoint
	const callbackUrl = `${window.location.origin}/callback?redirect=${encodeURIComponent(redirectPath)}`
	window.location.href = `/auth/github/login?returnUrl=${encodeURIComponent(callbackUrl)}`
}

/**
 * Handle OAuth callback and exchange code for session
 */
export async function handleOAuthCallback(code: string, state?: string): Promise<AuthResponse> {
	return fetchApi<AuthResponse>('/auth/github/callback', {
		method: 'POST',
		body: JSON.stringify({ code, state }),
	})
}

export default {
	getCurrentUser,
	isAuthenticated,
	logout,
	initiateGitHubLogin,
	handleOAuthCallback,
}
